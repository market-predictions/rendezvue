-- WP-065E: service-only identity-evidence assessment and independent support decisions.
-- This migration does not merge accounts, mutate Auth identities, change e-mail,
-- restore access, delete data, activate retention or execute any approved action.

do $$ begin
  create type public.account_support_evidence_category as enum (
    'trusted_account_session',
    'provider_possession',
    'historical_account_knowledge',
    'prior_transaction_reference',
    'institution_or_membership_reference',
    'manual_identity_review_reference',
    'device_or_recovery_reference',
    'other_opaque_reference'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.account_support_evidence_scope as enum (
    'primary_account',
    'related_account',
    'shared_identity'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.account_support_evidence_strength as enum (
    'strong',
    'corroborating'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.account_support_evidence_assessment as enum (
    'supports',
    'conflicts',
    'inconclusive'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.account_support_decision_outcome as enum (
    'insufficient_evidence',
    'rejected',
    'approved_for_action',
    'escalated'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.account_support_decision_state as enum (
    'proposed',
    'approved',
    'rejected'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.account_support_review_action as enum (
    'approve',
    'reject'
  );
exception when duplicate_object then null; end $$;

create or replace function public.account_support_evidence_strength_for_category(
  p_category public.account_support_evidence_category
)
returns public.account_support_evidence_strength
language sql
immutable
security definer
set search_path = public
as $$
  select case
    when p_category in (
      'trusted_account_session',
      'provider_possession',
      'prior_transaction_reference',
      'manual_identity_review_reference'
    ) then 'strong'::public.account_support_evidence_strength
    else 'corroborating'::public.account_support_evidence_strength
  end;
$$;

create table if not exists public.account_support_evidence_assertions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.account_support_cases(id) on delete cascade,
  category public.account_support_evidence_category not null,
  subject_scope public.account_support_evidence_scope not null,
  strength public.account_support_evidence_strength not null,
  assessment public.account_support_evidence_assessment not null,
  evidence_reference text not null,
  recorded_by text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint account_support_evidence_reference_token
    check (evidence_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{0,239}$'),
  constraint account_support_evidence_operator_token
    check (recorded_by ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$'),
  constraint account_support_evidence_category_strength
    check (strength = public.account_support_evidence_strength_for_category(category)),
  constraint account_support_evidence_reference_unique
    unique (case_id, evidence_reference)
);

create table if not exists public.account_support_decisions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.account_support_cases(id) on delete cascade,
  outcome public.account_support_decision_outcome not null,
  review_state public.account_support_decision_state not null default 'proposed',
  proposed_by text not null,
  proposed_at timestamptz not null default timezone('utc', now()),
  case_state_snapshot public.account_support_case_state not null,
  case_state_changed_at_snapshot timestamptz not null,
  evidence_fingerprint text not null,
  evidence_count smallint not null,
  supporting_count smallint not null,
  conflict_count smallint not null,
  inconclusive_count smallint not null,
  strong_support_count smallint not null,
  distinct_support_category_count smallint not null,
  primary_coverage_count smallint not null,
  related_coverage_count smallint not null,
  rationale_code text not null,
  reviewed_by text,
  reviewed_at timestamptz,
  review_code text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint account_support_decision_proposer_token
    check (proposed_by ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$'),
  constraint account_support_decision_reviewer_token
    check (reviewed_by is null or reviewed_by ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$'),
  constraint account_support_decision_rationale_code
    check (rationale_code ~ '^[a-z0-9][a-z0-9._:-]{0,119}$'),
  constraint account_support_decision_review_code
    check (review_code is null or review_code ~ '^[a-z0-9][a-z0-9._:-]{0,119}$'),
  constraint account_support_decision_fingerprint
    check (evidence_fingerprint ~ '^[a-f0-9]{32}$'),
  constraint account_support_decision_counts
    check (
      evidence_count >= 0
      and supporting_count between 0 and evidence_count
      and conflict_count between 0 and evidence_count
      and inconclusive_count between 0 and evidence_count
      and supporting_count + conflict_count + inconclusive_count = evidence_count
      and strong_support_count between 0 and supporting_count
      and distinct_support_category_count between 0 and supporting_count
      and primary_coverage_count between 0 and supporting_count
      and related_coverage_count between 0 and supporting_count
    ),
  constraint account_support_decision_review_fields
    check (
      (review_state = 'proposed' and reviewed_by is null and reviewed_at is null and review_code is null)
      or
      (review_state in ('approved', 'rejected') and reviewed_by is not null and reviewed_at is not null and review_code is not null)
    ),
  constraint account_support_decision_separation_of_duties
    check (reviewed_by is null or reviewed_by <> proposed_by)
);

create unique index if not exists account_support_one_pending_decision_per_case
on public.account_support_decisions (case_id)
where review_state = 'proposed';

create index if not exists account_support_evidence_case_time_idx
on public.account_support_evidence_assertions (case_id, created_at, id);

create index if not exists account_support_decisions_case_time_idx
on public.account_support_decisions (case_id, proposed_at, id);

create table if not exists public.account_support_decision_events (
  id bigint generated by default as identity primary key,
  decision_id uuid not null references public.account_support_decisions(id) on delete cascade,
  event_type text not null check (event_type in ('proposed', 'reviewed')),
  from_state public.account_support_decision_state,
  to_state public.account_support_decision_state not null,
  review_action public.account_support_review_action,
  operator_reference text not null,
  outcome public.account_support_decision_outcome not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint account_support_decision_event_operator_token
    check (operator_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$'),
  constraint account_support_decision_event_shape
    check (
      (event_type = 'proposed' and from_state is null and to_state = 'proposed' and review_action is null)
      or
      (event_type = 'reviewed' and from_state = 'proposed' and to_state in ('approved', 'rejected') and review_action is not null)
    )
);

create index if not exists account_support_decision_events_decision_time_idx
on public.account_support_decision_events (decision_id, created_at, id);

create or replace function public.account_support_evidence_fingerprint(p_case_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select md5(coalesce(string_agg(
    concat_ws('|',
      evidence.id::text,
      evidence.category::text,
      evidence.subject_scope::text,
      evidence.strength::text,
      evidence.assessment::text,
      evidence.evidence_reference
    ),
    ',' order by evidence.id
  ), ''))
  from public.account_support_evidence_assertions evidence
  where evidence.case_id = p_case_id;
$$;

create or replace function public.register_account_support_evidence(
  p_case_id uuid,
  p_category public.account_support_evidence_category,
  p_subject_scope public.account_support_evidence_scope,
  p_assessment public.account_support_evidence_assessment,
  p_evidence_reference text,
  p_operator_reference text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_case public.account_support_cases%rowtype;
  v_evidence_id uuid;
  v_strength public.account_support_evidence_strength;
begin
  select * into v_case
  from public.account_support_cases
  where id = p_case_id
  for update;

  if not found then
    raise exception 'support case not found';
  end if;
  if v_case.state in ('resolved', 'rejected', 'closed') then
    raise exception 'terminal support case cannot accept evidence';
  end if;
  if p_evidence_reference is null
     or p_evidence_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{0,239}$' then
    raise exception 'invalid opaque evidence reference';
  end if;
  if p_operator_reference is null
     or p_operator_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$' then
    raise exception 'invalid opaque operator reference';
  end if;
  if v_case.kind = 'mailbox_access_loss' and p_subject_scope <> 'primary_account' then
    raise exception 'mailbox-access-loss evidence must scope to the primary account';
  end if;

  v_strength := public.account_support_evidence_strength_for_category(p_category);

  insert into public.account_support_evidence_assertions (
    case_id,
    category,
    subject_scope,
    strength,
    assessment,
    evidence_reference,
    recorded_by
  ) values (
    p_case_id,
    p_category,
    p_subject_scope,
    v_strength,
    p_assessment,
    p_evidence_reference,
    p_operator_reference
  )
  returning id into v_evidence_id;

  insert into public.audit_events (
    actor_type,
    event_type,
    entity_type,
    entity_id,
    payload
  ) values (
    'service',
    'account_support_evidence_registered',
    'account_support_case',
    p_case_id::text,
    jsonb_build_object(
      'category', p_category::text,
      'subject_scope', p_subject_scope::text,
      'strength', v_strength::text,
      'assessment', p_assessment::text
    )
  );

  return v_evidence_id;
end;
$$;

create or replace function public.propose_account_support_decision(
  p_case_id uuid,
  p_outcome public.account_support_decision_outcome,
  p_operator_reference text,
  p_rationale_code text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_case public.account_support_cases%rowtype;
  v_decision_id uuid;
  v_evidence_count integer;
  v_supporting_count integer;
  v_conflict_count integer;
  v_inconclusive_count integer;
  v_strong_support_count integer;
  v_distinct_support_category_count integer;
  v_primary_coverage_count integer;
  v_related_coverage_count integer;
  v_approval_ready boolean;
  v_fingerprint text;
begin
  select * into v_case
  from public.account_support_cases
  where id = p_case_id
  for update;

  if not found then
    raise exception 'support case not found';
  end if;
  if v_case.state not in ('under_review', 'escalated') then
    raise exception 'support case must be under review or escalated';
  end if;
  if p_operator_reference is null
     or p_operator_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$' then
    raise exception 'invalid opaque operator reference';
  end if;
  if p_rationale_code is null
     or p_rationale_code !~ '^[a-z0-9][a-z0-9._:-]{0,119}$' then
    raise exception 'invalid rationale code';
  end if;
  if exists (
    select 1 from public.account_support_decisions decision
    where decision.case_id = p_case_id and decision.review_state = 'proposed'
  ) then
    raise exception 'support case already has a pending decision';
  end if;

  select
    count(*)::int,
    count(*) filter (where evidence.assessment = 'supports')::int,
    count(*) filter (where evidence.assessment = 'conflicts')::int,
    count(*) filter (where evidence.assessment = 'inconclusive')::int,
    count(*) filter (where evidence.assessment = 'supports' and evidence.strength = 'strong')::int,
    count(distinct evidence.category) filter (where evidence.assessment = 'supports')::int,
    count(*) filter (
      where evidence.assessment = 'supports'
        and evidence.subject_scope in ('primary_account', 'shared_identity')
    )::int,
    count(*) filter (
      where evidence.assessment = 'supports'
        and evidence.subject_scope in ('related_account', 'shared_identity')
    )::int
  into
    v_evidence_count,
    v_supporting_count,
    v_conflict_count,
    v_inconclusive_count,
    v_strong_support_count,
    v_distinct_support_category_count,
    v_primary_coverage_count,
    v_related_coverage_count
  from public.account_support_evidence_assertions evidence
  where evidence.case_id = p_case_id;

  v_approval_ready :=
    v_conflict_count = 0
    and v_supporting_count >= 2
    and v_distinct_support_category_count >= 2
    and v_strong_support_count >= 1
    and case
      when v_case.kind = 'duplicate_account'
        then v_primary_coverage_count >= 1 and v_related_coverage_count >= 1
      when v_case.kind = 'mailbox_access_loss'
        then v_primary_coverage_count >= 2
      else false
    end;

  if p_outcome = 'approved_for_action' and not v_approval_ready then
    raise exception 'evidence package does not meet approval rules';
  elsif p_outcome = 'insufficient_evidence' then
    if v_conflict_count > 0 then
      raise exception 'conflicting evidence requires rejection or escalation';
    end if;
    if v_approval_ready then
      raise exception 'evidence package is not insufficient';
    end if;
  elsif p_outcome = 'rejected' and v_conflict_count = 0 then
    raise exception 'rejection requires conflicting evidence';
  elsif p_outcome = 'escalated' and v_conflict_count = 0 and v_inconclusive_count = 0 then
    raise exception 'escalation requires conflicting or inconclusive evidence';
  end if;

  v_fingerprint := public.account_support_evidence_fingerprint(p_case_id);

  insert into public.account_support_decisions (
    case_id,
    outcome,
    proposed_by,
    case_state_snapshot,
    case_state_changed_at_snapshot,
    evidence_fingerprint,
    evidence_count,
    supporting_count,
    conflict_count,
    inconclusive_count,
    strong_support_count,
    distinct_support_category_count,
    primary_coverage_count,
    related_coverage_count,
    rationale_code
  ) values (
    p_case_id,
    p_outcome,
    p_operator_reference,
    v_case.state,
    v_case.state_changed_at,
    v_fingerprint,
    v_evidence_count,
    v_supporting_count,
    v_conflict_count,
    v_inconclusive_count,
    v_strong_support_count,
    v_distinct_support_category_count,
    v_primary_coverage_count,
    v_related_coverage_count,
    p_rationale_code
  )
  returning id into v_decision_id;

  insert into public.account_support_decision_events (
    decision_id,
    event_type,
    from_state,
    to_state,
    review_action,
    operator_reference,
    outcome
  ) values (
    v_decision_id,
    'proposed',
    null,
    'proposed',
    null,
    p_operator_reference,
    p_outcome
  );

  insert into public.audit_events (
    actor_type,
    event_type,
    entity_type,
    entity_id,
    payload
  ) values (
    'service',
    'account_support_decision_proposed',
    'account_support_decision',
    v_decision_id::text,
    jsonb_build_object(
      'outcome', p_outcome::text,
      'case_state', v_case.state::text,
      'evidence_count', v_evidence_count,
      'supporting_count', v_supporting_count,
      'conflict_count', v_conflict_count,
      'inconclusive_count', v_inconclusive_count,
      'strong_support_count', v_strong_support_count,
      'distinct_support_category_count', v_distinct_support_category_count
    )
  );

  return v_decision_id;
end;
$$;

create or replace function public.review_account_support_decision(
  p_decision_id uuid,
  p_expected_review_state public.account_support_decision_state,
  p_action public.account_support_review_action,
  p_operator_reference text,
  p_review_code text
)
returns public.account_support_decision_state
language plpgsql
security definer
set search_path = public
as $$
declare
  v_decision public.account_support_decisions%rowtype;
  v_case public.account_support_cases%rowtype;
  v_new_state public.account_support_decision_state;
  v_current_fingerprint text;
begin
  select * into v_decision
  from public.account_support_decisions
  where id = p_decision_id
  for update;

  if not found then
    raise exception 'support decision not found';
  end if;
  if v_decision.review_state <> p_expected_review_state then
    raise exception 'stale support decision state';
  end if;
  if v_decision.review_state <> 'proposed' then
    raise exception 'support decision is terminal';
  end if;
  if p_operator_reference is null
     or p_operator_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$' then
    raise exception 'invalid opaque operator reference';
  end if;
  if p_operator_reference = v_decision.proposed_by then
    raise exception 'decision proposer cannot review own proposal';
  end if;
  if p_review_code is null
     or p_review_code !~ '^[a-z0-9][a-z0-9._:-]{0,119}$' then
    raise exception 'invalid review code';
  end if;

  select * into v_case
  from public.account_support_cases
  where id = v_decision.case_id
  for share;

  if not found then
    raise exception 'support case not found';
  end if;
  if v_case.state <> v_decision.case_state_snapshot
     or v_case.state_changed_at <> v_decision.case_state_changed_at_snapshot then
    raise exception 'support case changed after decision proposal';
  end if;

  v_current_fingerprint := public.account_support_evidence_fingerprint(v_decision.case_id);
  if v_current_fingerprint <> v_decision.evidence_fingerprint then
    raise exception 'evidence package changed after decision proposal';
  end if;

  v_new_state := case p_action
    when 'approve' then 'approved'::public.account_support_decision_state
    when 'reject' then 'rejected'::public.account_support_decision_state
  end;

  update public.account_support_decisions
  set review_state = v_new_state,
      reviewed_by = p_operator_reference,
      reviewed_at = timezone('utc', now()),
      review_code = p_review_code
  where id = p_decision_id;

  insert into public.account_support_decision_events (
    decision_id,
    event_type,
    from_state,
    to_state,
    review_action,
    operator_reference,
    outcome
  ) values (
    p_decision_id,
    'reviewed',
    'proposed',
    v_new_state,
    p_action,
    p_operator_reference,
    v_decision.outcome
  );

  insert into public.audit_events (
    actor_type,
    event_type,
    entity_type,
    entity_id,
    payload
  ) values (
    'service',
    'account_support_decision_reviewed',
    'account_support_decision',
    p_decision_id::text,
    jsonb_build_object(
      'outcome', v_decision.outcome::text,
      'review_action', p_action::text,
      'review_state', v_new_state::text
    )
  );

  return v_new_state;
end;
$$;

alter table public.account_support_evidence_assertions enable row level security;
alter table public.account_support_decisions enable row level security;
alter table public.account_support_decision_events enable row level security;

revoke all on public.account_support_evidence_assertions from public, anon, authenticated, service_role;
revoke all on public.account_support_decisions from public, anon, authenticated, service_role;
revoke all on public.account_support_decision_events from public, anon, authenticated, service_role;

grant select on public.account_support_evidence_assertions to service_role;
grant select on public.account_support_decisions to service_role;
grant select on public.account_support_decision_events to service_role;

revoke all on function public.account_support_evidence_strength_for_category(public.account_support_evidence_category) from public, anon, authenticated, service_role;
revoke all on function public.account_support_evidence_fingerprint(uuid) from public, anon, authenticated, service_role;
revoke all on function public.register_account_support_evidence(uuid, public.account_support_evidence_category, public.account_support_evidence_scope, public.account_support_evidence_assessment, text, text) from public, anon, authenticated, service_role;
revoke all on function public.propose_account_support_decision(uuid, public.account_support_decision_outcome, text, text) from public, anon, authenticated, service_role;
revoke all on function public.review_account_support_decision(uuid, public.account_support_decision_state, public.account_support_review_action, text, text) from public, anon, authenticated, service_role;

grant execute on function public.register_account_support_evidence(uuid, public.account_support_evidence_category, public.account_support_evidence_scope, public.account_support_evidence_assessment, text, text) to service_role;
grant execute on function public.propose_account_support_decision(uuid, public.account_support_decision_outcome, text, text) to service_role;
grant execute on function public.review_account_support_decision(uuid, public.account_support_decision_state, public.account_support_review_action, text, text) to service_role;
