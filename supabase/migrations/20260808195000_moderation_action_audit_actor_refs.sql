-- WP-070B follow-up — retain the opaque proposer/reviewer references in the
-- durable audit stream. Operational proposal/review rows can later disappear
-- through governed account/report/case cleanup cascades; the audit trail must
-- still be able to prove that two distinct opaque operator references were used.
-- No reporter identity, report free text or participant enforcement is added.

create or replace function public.propose_moderation_action(
  p_case_id uuid,
  p_expected_case_version integer,
  p_operator_ref text,
  p_action_code text,
  p_rationale_code text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_case public.moderation_cases%rowtype;
  v_report public.safety_reports%rowtype;
  v_proposal_id uuid;
  v_review_lane text;
  v_critical boolean;
begin
  if p_operator_ref is null or p_operator_ref !~ '^[A-Za-z0-9][A-Za-z0-9:_-]{2,95}$' then
    raise exception 'invalid moderation operator reference';
  end if;
  if p_expected_case_version is null or p_expected_case_version < 1 then
    raise exception 'invalid expected moderation case version';
  end if;
  if p_action_code not in (
    'restrict_discovery', 'restrict_contact', 'suspend_account',
    'terminate_account', 'specialist_safety_review'
  ) then
    raise exception 'invalid moderation action code';
  end if;
  if p_rationale_code is null or p_rationale_code !~ '^[a-z0-9][a-z0-9_:-]{2,79}$' then
    raise exception 'invalid moderation rationale code';
  end if;

  select * into v_case
  from public.moderation_cases
  where id = p_case_id
  for update;
  if not found then raise exception 'moderation case not found'; end if;
  if v_case.version <> p_expected_case_version then raise exception 'stale moderation case version'; end if;
  if v_case.status <> 'investigating' then raise exception 'moderation case must be investigating'; end if;
  if v_case.assigned_operator_ref is distinct from p_operator_ref then
    raise exception 'moderation case is not assigned to proposing operator';
  end if;
  if v_case.source_report_id is null then raise exception 'moderation case has no source report'; end if;

  select * into v_report
  from public.safety_reports
  where id = v_case.source_report_id
  for share;
  if not found then raise exception 'moderation source report not found'; end if;
  if v_report.subject_user_id <> v_case.subject_user_id then
    raise exception 'moderation case/report subject mismatch';
  end if;

  if exists (
    select 1 from public.moderation_action_proposals
    where case_id = v_case.id and status = 'pending'
  ) then
    raise exception 'moderation case already has a pending action proposal';
  end if;

  v_review_lane := public.moderation_review_lane(v_report.category, v_report.severity);
  v_critical := v_report.severity = 'critical';

  insert into public.moderation_action_proposals (
    case_id,
    subject_user_id,
    source_report_id,
    case_version,
    case_status,
    source_category,
    source_severity,
    review_lane,
    action_code,
    rationale_code,
    proposed_by_ref,
    critical_escalation_required
  ) values (
    v_case.id,
    v_case.subject_user_id,
    v_report.id,
    v_case.version,
    v_case.status,
    v_report.category,
    v_report.severity,
    v_review_lane,
    p_action_code,
    p_rationale_code,
    p_operator_ref,
    v_critical
  ) returning id into v_proposal_id;

  insert into public.audit_events (
    actor_user_id, actor_type, event_type, subject_user_id, entity_type, entity_id, payload
  ) values (
    null,
    'service',
    'moderation_action_proposed',
    v_case.subject_user_id,
    'moderation_action_proposal',
    v_proposal_id::text,
    jsonb_build_object(
      'case_id', v_case.id,
      'case_version', v_case.version,
      'source_severity', v_report.severity,
      'review_lane', v_review_lane,
      'action_code', p_action_code,
      'proposed_by_ref', p_operator_ref,
      'critical_escalation_required', v_critical
    )
  );

  return v_proposal_id;
end;
$$;

create or replace function public.review_moderation_action_proposal(
  p_proposal_id uuid,
  p_reviewer_ref text,
  p_decision text,
  p_review_code text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proposal public.moderation_action_proposals%rowtype;
  v_case public.moderation_cases%rowtype;
  v_report public.safety_reports%rowtype;
  v_review_id uuid;
  v_now timestamptz := timezone('utc', now());
begin
  if p_reviewer_ref is null or p_reviewer_ref !~ '^[A-Za-z0-9][A-Za-z0-9:_-]{2,95}$' then
    raise exception 'invalid moderation reviewer reference';
  end if;
  if p_decision not in ('approved', 'rejected', 'escalated') then
    raise exception 'invalid moderation action review decision';
  end if;
  if p_review_code is null or p_review_code !~ '^[a-z0-9][a-z0-9_:-]{2,79}$' then
    raise exception 'invalid moderation action review code';
  end if;

  select * into v_proposal
  from public.moderation_action_proposals
  where id = p_proposal_id
  for update;
  if not found then raise exception 'moderation action proposal not found'; end if;
  if v_proposal.status <> 'pending' then raise exception 'moderation action proposal already decided'; end if;
  if v_proposal.proposed_by_ref = p_reviewer_ref then
    raise exception 'moderation action proposal requires an independent reviewer';
  end if;

  select * into v_case
  from public.moderation_cases
  where id = v_proposal.case_id
  for update;
  if not found then raise exception 'moderation case not found'; end if;
  if v_case.version <> v_proposal.case_version then raise exception 'stale moderation action proposal case version'; end if;
  if v_case.status <> v_proposal.case_status or v_case.status <> 'investigating' then
    raise exception 'stale moderation action proposal case state';
  end if;
  if v_case.assigned_operator_ref is distinct from v_proposal.proposed_by_ref then
    raise exception 'moderation case assignment changed since proposal';
  end if;
  if v_case.subject_user_id <> v_proposal.subject_user_id
     or v_case.source_report_id <> v_proposal.source_report_id then
    raise exception 'moderation action proposal case binding changed';
  end if;

  select * into v_report
  from public.safety_reports
  where id = v_proposal.source_report_id
  for share;
  if not found then raise exception 'moderation source report not found'; end if;
  if v_report.subject_user_id <> v_proposal.subject_user_id
     or v_report.category <> v_proposal.source_category
     or v_report.severity <> v_proposal.source_severity then
    raise exception 'moderation action proposal report snapshot changed';
  end if;

  if v_proposal.critical_escalation_required and p_decision = 'approved' then
    raise exception 'critical moderation action requires specialist escalation';
  end if;

  update public.moderation_action_proposals
  set status = p_decision,
      decided_at = v_now
  where id = v_proposal.id;

  insert into public.moderation_action_reviews (
    proposal_id, reviewer_ref, decision, review_code, reviewed_at
  ) values (
    v_proposal.id, p_reviewer_ref, p_decision, p_review_code, v_now
  ) returning id into v_review_id;

  insert into public.audit_events (
    actor_user_id, actor_type, event_type, subject_user_id, entity_type, entity_id, payload
  ) values (
    null,
    'service',
    'moderation_action_reviewed',
    v_proposal.subject_user_id,
    'moderation_action_proposal',
    v_proposal.id::text,
    jsonb_build_object(
      'case_id', v_proposal.case_id,
      'case_version', v_proposal.case_version,
      'source_severity', v_proposal.source_severity,
      'review_lane', v_proposal.review_lane,
      'action_code', v_proposal.action_code,
      'proposed_by_ref', v_proposal.proposed_by_ref,
      'reviewer_ref', p_reviewer_ref,
      'decision', p_decision,
      'review_code', p_review_code
    )
  );

  return v_review_id;
end;
$$;

revoke all on function public.propose_moderation_action(uuid, integer, text, text, text) from public, anon, authenticated;
revoke all on function public.review_moderation_action_proposal(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.propose_moderation_action(uuid, integer, text, text, text) to service_role;
grant execute on function public.review_moderation_action_proposal(uuid, text, text, text) to service_role;
