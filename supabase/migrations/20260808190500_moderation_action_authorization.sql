-- WP-070B — dual-control moderation action authorization foundation.
--
-- This migration authorizes no enforcement. It creates a service-only proposal
-- and independent-review layer that a later, separately governed enforcement
-- package may consume. No profile, match, conversation, account or Auth state is
-- changed by these functions.

create table if not exists public.moderation_action_proposals (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.moderation_cases(id) on delete cascade,
  subject_user_id uuid not null references auth.users(id) on delete cascade,
  source_report_id uuid not null references public.safety_reports(id) on delete cascade,
  case_version integer not null check (case_version > 0),
  case_status public.moderation_state not null,
  source_category text not null,
  source_severity public.report_severity not null,
  review_lane text not null check (review_lane in (
    'child_safety',
    'urgent_safety',
    'fraud_identity',
    'relationship_integrity',
    'general'
  )),
  action_code text not null check (action_code in (
    'restrict_discovery',
    'restrict_contact',
    'suspend_account',
    'terminate_account',
    'specialist_safety_review'
  )),
  rationale_code text not null check (rationale_code ~ '^[a-z0-9][a-z0-9_:-]{2,79}$'),
  proposed_by_ref text not null check (proposed_by_ref ~ '^[A-Za-z0-9][A-Za-z0-9:_-]{2,95}$'),
  critical_escalation_required boolean not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'escalated')),
  created_at timestamptz not null default timezone('utc', now()),
  decided_at timestamptz
);

create unique index if not exists moderation_action_proposals_one_pending_per_case_idx
  on public.moderation_action_proposals (case_id)
  where status = 'pending';

create index if not exists moderation_action_proposals_queue_idx
  on public.moderation_action_proposals (status, critical_escalation_required desc, created_at, id);

create table if not exists public.moderation_action_reviews (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null unique references public.moderation_action_proposals(id) on delete cascade,
  reviewer_ref text not null check (reviewer_ref ~ '^[A-Za-z0-9][A-Za-z0-9:_-]{2,95}$'),
  decision text not null check (decision in ('approved', 'rejected', 'escalated')),
  review_code text not null check (review_code ~ '^[a-z0-9][a-z0-9_:-]{2,79}$'),
  reviewed_at timestamptz not null default timezone('utc', now())
);

create index if not exists moderation_action_reviews_time_idx
  on public.moderation_action_reviews (reviewed_at, id);

alter table public.moderation_action_proposals enable row level security;
alter table public.moderation_action_reviews enable row level security;

create or replace function public.moderation_review_lane(
  p_category text,
  p_severity public.report_severity
)
returns text
language sql
immutable
strict
set search_path = public
as $$
  select case
    when p_category = 'minor_suspected' then 'child_safety'
    when p_category in ('threat', 'stalking', 'sexual_coercion') or p_severity = 'critical' then 'urgent_safety'
    when p_category in ('scam_money', 'impersonation') then 'fraud_identity'
    when p_category = 'hidden_relationship' then 'relationship_integrity'
    else 'general'
  end;
$$;

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
  if new.status not in ('approved', 'rejected', 'escalated') then
    raise exception 'invalid moderation action proposal decision';
  end if;
  if new.decided_at is null then
    raise exception 'moderation action proposal decision timestamp required';
  end if;

  return new;
end;
$$;

create trigger moderation_action_proposals_snapshot_immutable
before update on public.moderation_action_proposals
for each row execute function public.protect_moderation_action_proposal_snapshot();

create or replace function public.list_pending_moderation_action_proposals(p_limit integer default 100)
returns table (
  proposal_id uuid,
  case_id uuid,
  subject_user_id uuid,
  case_version integer,
  source_category text,
  source_severity public.report_severity,
  review_lane text,
  action_code text,
  rationale_code text,
  proposed_by_ref text,
  critical_escalation_required boolean,
  proposed_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_limit is null or p_limit < 1 or p_limit > 200 then
    raise exception 'moderation action proposal limit must be between 1 and 200';
  end if;

  return query
  select
    p.id,
    p.case_id,
    p.subject_user_id,
    p.case_version,
    p.source_category,
    p.source_severity,
    p.review_lane,
    p.action_code,
    p.rationale_code,
    p.proposed_by_ref,
    p.critical_escalation_required,
    p.created_at
  from public.moderation_action_proposals p
  where p.status = 'pending'
  order by
    p.critical_escalation_required desc,
    case p.source_severity
      when 'critical' then 1
      when 'high' then 2
      when 'medium' then 3
      else 4
    end,
    p.created_at,
    p.id
  limit p_limit;
end;
$$;

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
      'decision', p_decision,
      'review_code', p_review_code
    )
  );

  return v_review_id;
end;
$$;

-- Participants cannot inspect or operate the dual-control layer. The service
-- role may read bounded operational state but must use controlled functions for
-- all mutations so proposal snapshots and independent-review evidence remain
-- coupled and auditable.
revoke all on public.moderation_action_proposals from public, anon, authenticated, service_role;
grant select on public.moderation_action_proposals to service_role;

revoke all on public.moderation_action_reviews from public, anon, authenticated, service_role;
grant select on public.moderation_action_reviews to service_role;

revoke all on function public.moderation_review_lane(text, public.report_severity) from public, anon, authenticated, service_role;
revoke all on function public.protect_moderation_action_proposal_snapshot() from public, anon, authenticated, service_role;

revoke all on function public.list_pending_moderation_action_proposals(integer) from public, anon, authenticated;
revoke all on function public.propose_moderation_action(uuid, integer, text, text, text) from public, anon, authenticated;
revoke all on function public.review_moderation_action_proposal(uuid, text, text, text) from public, anon, authenticated;

grant execute on function public.list_pending_moderation_action_proposals(integer) to service_role;
grant execute on function public.propose_moderation_action(uuid, integer, text, text, text) to service_role;
grant execute on function public.review_moderation_action_proposal(uuid, text, text, text) to service_role;
