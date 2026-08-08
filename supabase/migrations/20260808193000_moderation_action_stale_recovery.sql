-- WP-070B follow-up — controlled recovery for stale pending proposals.
--
-- A proposal intentionally fails closed when the underlying case version/state
-- changes. Without a controlled terminal state, that stale proposal would keep
-- the one-pending-per-case index occupied forever. `superseded` is therefore an
-- administrative invalidation only; it never authorizes or executes an action.

alter table public.moderation_action_proposals
  drop constraint if exists moderation_action_proposals_status_check;

alter table public.moderation_action_proposals
  add constraint moderation_action_proposals_status_check
  check (status in ('pending', 'approved', 'rejected', 'escalated', 'superseded'));

create or replace function public.protect_moderation_action_proposal_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.id is distinct from old.id
     or new.case_id is distinct from old.case_id
     or new.subject_user_id is distinct from old.subject_user_id
     or new.source_report_id is distinct from old.source_report_id
     or new.case_version is distinct from old.case_version
     or new.case_status is distinct from old.case_status
     or new.source_category is distinct from old.source_category
     or new.source_severity is distinct from old.source_severity
     or new.review_lane is distinct from old.review_lane
     or new.action_code is distinct from old.action_code
     or new.rationale_code is distinct from old.rationale_code
     or new.proposed_by_ref is distinct from old.proposed_by_ref
     or new.critical_escalation_required is distinct from old.critical_escalation_required
     or new.created_at is distinct from old.created_at then
    raise exception 'moderation action proposal snapshot is immutable';
  end if;

  if old.status <> 'pending' then
    raise exception 'moderation action proposal already decided';
  end if;
  if new.status not in ('approved', 'rejected', 'escalated', 'superseded') then
    raise exception 'invalid moderation action proposal decision';
  end if;
  if new.decided_at is null then
    raise exception 'moderation action proposal decision timestamp required';
  end if;

  return new;
end;
$$;

create or replace function public.supersede_stale_moderation_action_proposal(
  p_proposal_id uuid,
  p_operator_ref text,
  p_reason_code text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proposal public.moderation_action_proposals%rowtype;
  v_case public.moderation_cases%rowtype;
  v_now timestamptz := timezone('utc', now());
begin
  if p_operator_ref is null or p_operator_ref !~ '^[A-Za-z0-9][A-Za-z0-9:_-]{2,95}$' then
    raise exception 'invalid moderation operator reference';
  end if;
  if p_reason_code is null or p_reason_code !~ '^[a-z0-9][a-z0-9_:-]{2,79}$' then
    raise exception 'invalid moderation supersede reason code';
  end if;

  select * into v_proposal
  from public.moderation_action_proposals
  where id = p_proposal_id
  for update;
  if not found then raise exception 'moderation action proposal not found'; end if;
  if v_proposal.status <> 'pending' then raise exception 'moderation action proposal already decided'; end if;

  select * into v_case
  from public.moderation_cases
  where id = v_proposal.case_id
  for share;
  if not found then raise exception 'moderation case not found'; end if;

  if v_case.version = v_proposal.case_version
     and v_case.status = v_proposal.case_status
     and v_case.assigned_operator_ref is not distinct from v_proposal.proposed_by_ref then
    raise exception 'moderation action proposal is not stale';
  end if;

  update public.moderation_action_proposals
  set status = 'superseded',
      decided_at = v_now
  where id = v_proposal.id;

  insert into public.audit_events (
    actor_user_id, actor_type, event_type, subject_user_id, entity_type, entity_id, payload
  ) values (
    null,
    'service',
    'moderation_action_superseded',
    v_proposal.subject_user_id,
    'moderation_action_proposal',
    v_proposal.id::text,
    jsonb_build_object(
      'proposal_case_version', v_proposal.case_version,
      'current_case_version', v_case.version,
      'proposal_case_status', v_proposal.case_status,
      'current_case_status', v_case.status,
      'reason_code', p_reason_code
    )
  );

  return v_proposal.id;
end;
$$;

revoke all on function public.protect_moderation_action_proposal_snapshot() from public, anon, authenticated, service_role;
revoke all on function public.supersede_stale_moderation_action_proposal(uuid, text, text) from public, anon, authenticated;
grant execute on function public.supersede_stale_moderation_action_proposal(uuid, text, text) to service_role;
