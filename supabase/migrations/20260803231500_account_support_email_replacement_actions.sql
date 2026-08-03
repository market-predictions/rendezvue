-- WP-065F: dual-controlled registered-email replacement for mailbox-loss cases.
-- Plaintext e-mail addresses are never persisted in public tables or audit payloads.
-- This migration does not merge accounts, change passwords, delete accounts,
-- activate retention or authorize real-user support operations.

do $$ begin
  create type public.account_email_replacement_state as enum (
    'requested',
    'approved',
    'executing',
    'completed',
    'failed',
    'cancelled'
  );
exception when duplicate_object then null; end $$;

create or replace function public.account_support_email_fingerprint(p_email text)
returns text
language sql
immutable
security definer
set search_path = public, extensions
as $$
  select case
    when nullif(trim(p_email), '') is null then null
    else encode(digest(lower(trim(p_email)), 'sha256'), 'hex')
  end;
$$;

create table if not exists public.account_email_replacement_actions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.account_support_cases(id) on delete cascade,
  decision_id uuid not null unique references public.account_support_decisions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  current_email_fingerprint text not null,
  target_email_fingerprint text not null,
  target_mailbox_verification_reference text not null,
  pre_change_notice_reference text,
  pre_change_notice_exception_code text,
  idempotency_key text not null unique,
  state public.account_email_replacement_state not null default 'requested',
  requested_by text not null,
  approved_by text,
  executor_reference text,
  requested_at timestamptz not null default timezone('utc', now()),
  approved_at timestamptz,
  expires_at timestamptz not null default (timezone('utc', now()) + interval '24 hours'),
  execution_started_at timestamptz,
  completed_at timestamptz,
  attempt_count smallint not null default 0,
  last_failure_code text,
  post_change_magic_link_requested boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint account_email_replacement_fingerprints
    check (
      current_email_fingerprint ~ '^[a-f0-9]{64}$'
      and target_email_fingerprint ~ '^[a-f0-9]{64}$'
      and current_email_fingerprint <> target_email_fingerprint
    ),
  constraint account_email_replacement_verification_reference
    check (target_mailbox_verification_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{0,239}$'),
  constraint account_email_replacement_notice_shape
    check (
      (pre_change_notice_reference is not null and pre_change_notice_exception_code is null)
      or
      (pre_change_notice_reference is null and pre_change_notice_exception_code is not null)
    ),
  constraint account_email_replacement_notice_reference
    check (pre_change_notice_reference is null or pre_change_notice_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{0,239}$'),
  constraint account_email_replacement_notice_exception
    check (pre_change_notice_exception_code is null or pre_change_notice_exception_code in ('mailbox_inaccessible', 'provider_closed', 'delivery_unavailable')),
  constraint account_email_replacement_idempotency
    check (idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{15,159}$'),
  constraint account_email_replacement_requested_by
    check (requested_by ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$'),
  constraint account_email_replacement_approved_by
    check (approved_by is null or approved_by ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$'),
  constraint account_email_replacement_executor
    check (executor_reference is null or executor_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$'),
  constraint account_email_replacement_separation
    check (approved_by is null or approved_by <> requested_by),
  constraint account_email_replacement_attempts
    check (attempt_count between 0 and 3),
  constraint account_email_replacement_failure_code
    check (last_failure_code is null or last_failure_code ~ '^[a-z0-9][a-z0-9._:-]{0,119}$'),
  constraint account_email_replacement_state_fields
    check (
      (state = 'requested' and approved_by is null and approved_at is null and executor_reference is null and execution_started_at is null and completed_at is null)
      or
      (state = 'approved' and approved_by is not null and approved_at is not null and executor_reference is null and execution_started_at is null and completed_at is null)
      or
      (state = 'executing' and approved_by is not null and approved_at is not null and executor_reference is not null and execution_started_at is not null and completed_at is null)
      or
      (state = 'completed' and approved_by is not null and approved_at is not null and executor_reference is not null and execution_started_at is not null and completed_at is not null)
      or
      (state in ('failed', 'cancelled') and completed_at is null)
    )
);

create unique index if not exists account_email_replacement_one_active_per_user
on public.account_email_replacement_actions (user_id)
where user_id is not null and state in ('requested', 'approved', 'executing');

create index if not exists account_email_replacement_case_time_idx
on public.account_email_replacement_actions (case_id, requested_at desc);

create index if not exists account_email_replacement_state_expiry_idx
on public.account_email_replacement_actions (state, expires_at);

create trigger account_email_replacement_touch_updated_at
before update on public.account_email_replacement_actions
for each row execute function public.touch_updated_at();

create table if not exists public.account_email_replacement_events (
  id bigint generated by default as identity primary key,
  action_id uuid not null references public.account_email_replacement_actions(id) on delete cascade,
  event_type text not null check (event_type in ('requested', 'approved', 'execution_claimed', 'completed', 'failed', 'cancelled')),
  from_state public.account_email_replacement_state,
  to_state public.account_email_replacement_state not null,
  operator_reference text not null,
  failure_code text,
  magic_link_requested boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  constraint account_email_replacement_event_operator
    check (operator_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$'),
  constraint account_email_replacement_event_failure
    check (failure_code is null or failure_code ~ '^[a-z0-9][a-z0-9._:-]{0,119}$')
);

create index if not exists account_email_replacement_events_action_time_idx
on public.account_email_replacement_events (action_id, created_at, id);

create or replace function public.request_account_email_replacement(
  p_decision_id uuid,
  p_current_email_fingerprint text,
  p_target_email_fingerprint text,
  p_target_mailbox_verification_reference text,
  p_pre_change_notice_reference text,
  p_pre_change_notice_exception_code text,
  p_idempotency_key text,
  p_operator_reference text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_decision public.account_support_decisions%rowtype;
  v_case public.account_support_cases%rowtype;
  v_action public.account_email_replacement_actions%rowtype;
  v_action_id uuid;
  v_current_auth_fingerprint text;
begin
  if p_current_email_fingerprint !~ '^[a-f0-9]{64}$'
     or p_target_email_fingerprint !~ '^[a-f0-9]{64}$'
     or p_current_email_fingerprint = p_target_email_fingerprint then
    raise exception 'invalid email fingerprints';
  end if;
  if p_target_mailbox_verification_reference is null
     or p_target_mailbox_verification_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{0,239}$' then
    raise exception 'invalid target mailbox verification reference';
  end if;
  if p_idempotency_key is null or p_idempotency_key !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{15,159}$' then
    raise exception 'invalid idempotency key';
  end if;
  if p_operator_reference is null or p_operator_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$' then
    raise exception 'invalid opaque operator reference';
  end if;
  if (p_pre_change_notice_reference is null) = (p_pre_change_notice_exception_code is null) then
    raise exception 'exactly one pre-change notice outcome is required';
  end if;
  if p_pre_change_notice_reference is not null
     and p_pre_change_notice_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{0,239}$' then
    raise exception 'invalid pre-change notice reference';
  end if;
  if p_pre_change_notice_exception_code is not null
     and p_pre_change_notice_exception_code not in ('mailbox_inaccessible', 'provider_closed', 'delivery_unavailable') then
    raise exception 'invalid pre-change notice exception';
  end if;

  select * into v_action
  from public.account_email_replacement_actions
  where idempotency_key = p_idempotency_key;

  if found then
    if v_action.decision_id = p_decision_id
       and v_action.current_email_fingerprint = p_current_email_fingerprint
       and v_action.target_email_fingerprint = p_target_email_fingerprint
       and v_action.requested_by = p_operator_reference then
      return v_action.id;
    end if;
    raise exception 'idempotency key conflict';
  end if;

  select * into v_decision
  from public.account_support_decisions
  where id = p_decision_id
  for share;

  if not found then raise exception 'support decision not found'; end if;
  if v_decision.review_state <> 'approved' or v_decision.outcome <> 'approved_for_action' then
    raise exception 'approved support decision required';
  end if;
  if v_decision.proposed_by <> p_operator_reference then
    raise exception 'email replacement requester must be the decision proposer';
  end if;

  select * into v_case
  from public.account_support_cases
  where id = v_decision.case_id
  for update;

  if not found then raise exception 'support case not found'; end if;
  if v_case.kind <> 'mailbox_access_loss' or v_case.primary_user_id is null then
    raise exception 'mailbox-access-loss case with one live account required';
  end if;
  if v_case.state <> v_decision.case_state_snapshot
     or v_case.state_changed_at <> v_decision.case_state_changed_at_snapshot
     or public.account_support_evidence_fingerprint(v_case.id) <> v_decision.evidence_fingerprint then
    raise exception 'support decision is stale';
  end if;

  if not exists (
    select 1
    from public.account_support_evidence_assertions evidence
    where evidence.case_id = v_case.id
      and evidence.category = 'provider_possession'
      and evidence.subject_scope = 'primary_account'
      and evidence.assessment = 'supports'
      and evidence.evidence_reference = p_target_mailbox_verification_reference
  ) then
    raise exception 'target mailbox possession evidence required';
  end if;

  if not exists (
    select 1
    from public.account_support_evidence_assertions evidence
    where evidence.case_id = v_case.id
      and evidence.category = 'manual_identity_review_reference'
      and evidence.subject_scope = 'primary_account'
      and evidence.assessment = 'supports'
  ) then
    raise exception 'manual identity review evidence required';
  end if;

  select public.account_support_email_fingerprint(email)
  into v_current_auth_fingerprint
  from auth.users
  where id = v_case.primary_user_id;

  if v_current_auth_fingerprint is null then raise exception 'Auth user not found'; end if;
  if v_current_auth_fingerprint <> p_current_email_fingerprint then
    raise exception 'current email fingerprint mismatch';
  end if;
  if exists (
    select 1 from auth.users user_record
    where public.account_support_email_fingerprint(user_record.email) = p_target_email_fingerprint
  ) then
    raise exception 'target email already belongs to an Auth user';
  end if;
  if exists (
    select 1 from public.account_email_replacement_actions action
    where action.user_id = v_case.primary_user_id
      and action.state in ('requested', 'approved', 'executing')
  ) then
    raise exception 'account already has an active email replacement';
  end if;
  if exists (
    select 1 from public.account_email_replacement_actions action
    where action.user_id = v_case.primary_user_id
      and action.state = 'completed'
      and action.completed_at > timezone('utc', now()) - interval '30 days'
  ) then
    raise exception 'email replacement cooldown active';
  end if;

  insert into public.account_email_replacement_actions (
    case_id,
    decision_id,
    user_id,
    current_email_fingerprint,
    target_email_fingerprint,
    target_mailbox_verification_reference,
    pre_change_notice_reference,
    pre_change_notice_exception_code,
    idempotency_key,
    requested_by
  ) values (
    v_case.id,
    v_decision.id,
    v_case.primary_user_id,
    p_current_email_fingerprint,
    p_target_email_fingerprint,
    p_target_mailbox_verification_reference,
    p_pre_change_notice_reference,
    p_pre_change_notice_exception_code,
    p_idempotency_key,
    p_operator_reference
  )
  returning id into v_action_id;

  insert into public.account_email_replacement_events (
    action_id, event_type, from_state, to_state, operator_reference
  ) values (
    v_action_id, 'requested', null, 'requested', p_operator_reference
  );

  insert into public.audit_events (
    actor_type, event_type, entity_type, entity_id, payload
  ) values (
    'service', 'account_email_replacement_requested', 'account_email_replacement', v_action_id::text,
    jsonb_build_object(
      'case_kind', v_case.kind::text,
      'decision_outcome', v_decision.outcome::text,
      'pre_change_notice_exception', p_pre_change_notice_exception_code is not null
    )
  );

  return v_action_id;
end;
$$;

create or replace function public.approve_account_email_replacement(
  p_action_id uuid,
  p_expected_state public.account_email_replacement_state,
  p_operator_reference text
)
returns public.account_email_replacement_state
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_action public.account_email_replacement_actions%rowtype;
  v_decision public.account_support_decisions%rowtype;
  v_case public.account_support_cases%rowtype;
begin
  select * into v_action
  from public.account_email_replacement_actions
  where id = p_action_id
  for update;

  if not found then raise exception 'email replacement action not found'; end if;
  if v_action.state <> p_expected_state then raise exception 'stale email replacement state'; end if;
  if v_action.state <> 'requested' then raise exception 'requested email replacement required'; end if;
  if v_action.expires_at <= timezone('utc', now()) then raise exception 'email replacement request expired'; end if;

  select * into v_decision from public.account_support_decisions where id = v_action.decision_id;
  select * into v_case from public.account_support_cases where id = v_action.case_id;

  if v_decision.review_state <> 'approved' or v_decision.outcome <> 'approved_for_action' then
    raise exception 'approved support decision required';
  end if;
  if v_decision.reviewed_by <> p_operator_reference then
    raise exception 'email replacement approver must be the independent decision reviewer';
  end if;
  if p_operator_reference = v_action.requested_by then
    raise exception 'email replacement requires independent approval';
  end if;
  if v_case.state <> v_decision.case_state_snapshot
     or v_case.state_changed_at <> v_decision.case_state_changed_at_snapshot
     or public.account_support_evidence_fingerprint(v_case.id) <> v_decision.evidence_fingerprint then
    raise exception 'support decision is stale';
  end if;
  if public.account_support_email_fingerprint((select email from auth.users where id = v_action.user_id))
     <> v_action.current_email_fingerprint then
    raise exception 'current email changed before approval';
  end if;
  if exists (
    select 1 from auth.users user_record
    where user_record.id <> v_action.user_id
      and public.account_support_email_fingerprint(user_record.email) = v_action.target_email_fingerprint
  ) then
    raise exception 'target email already belongs to an Auth user';
  end if;

  update public.account_email_replacement_actions
  set state = 'approved',
      approved_by = p_operator_reference,
      approved_at = timezone('utc', now()),
      expires_at = timezone('utc', now()) + interval '2 hours',
      last_failure_code = null
  where id = p_action_id;

  insert into public.account_email_replacement_events (
    action_id, event_type, from_state, to_state, operator_reference
  ) values (
    p_action_id, 'approved', 'requested', 'approved', p_operator_reference
  );

  insert into public.audit_events (
    actor_type, event_type, entity_type, entity_id, payload
  ) values (
    'service', 'account_email_replacement_approved', 'account_email_replacement', p_action_id::text,
    jsonb_build_object('dual_control', true, 'approval_window_minutes', 120)
  );

  return 'approved';
end;
$$;

create or replace function public.get_account_email_replacement_execution_context(
  p_action_id uuid,
  p_idempotency_key text
)
returns table (
  action_id uuid,
  user_id uuid,
  current_email_fingerprint text,
  target_email_fingerprint text,
  state public.account_email_replacement_state,
  expires_at timestamptz,
  attempt_count smallint,
  executor_reference text,
  post_change_magic_link_requested boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    action.id,
    action.user_id,
    action.current_email_fingerprint,
    action.target_email_fingerprint,
    action.state,
    action.expires_at,
    action.attempt_count,
    action.executor_reference,
    action.post_change_magic_link_requested
  from public.account_email_replacement_actions action
  where action.id = p_action_id
    and action.idempotency_key = p_idempotency_key;
$$;

create or replace function public.claim_account_email_replacement_execution(
  p_action_id uuid,
  p_idempotency_key text,
  p_executor_reference text
)
returns public.account_email_replacement_state
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action public.account_email_replacement_actions%rowtype;
begin
  select * into v_action
  from public.account_email_replacement_actions
  where id = p_action_id and idempotency_key = p_idempotency_key
  for update;

  if not found then raise exception 'email replacement action not found'; end if;
  if p_executor_reference is null or p_executor_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$' then
    raise exception 'invalid executor reference';
  end if;

  if v_action.state = 'executing' and v_action.executor_reference = p_executor_reference then
    return 'executing';
  end if;
  if v_action.state = 'completed' then return 'completed'; end if;
  if v_action.state <> 'approved' then raise exception 'approved email replacement required'; end if;
  if v_action.expires_at <= timezone('utc', now()) then raise exception 'email replacement approval expired'; end if;
  if v_action.attempt_count >= 3 then raise exception 'email replacement attempt limit reached'; end if;

  update public.account_email_replacement_actions
  set state = 'executing',
      executor_reference = p_executor_reference,
      execution_started_at = timezone('utc', now()),
      attempt_count = attempt_count + 1,
      last_failure_code = null
  where id = p_action_id;

  insert into public.account_email_replacement_events (
    action_id, event_type, from_state, to_state, operator_reference
  ) values (
    p_action_id, 'execution_claimed', 'approved', 'executing', p_executor_reference
  );

  return 'executing';
end;
$$;

create or replace function public.complete_account_email_replacement(
  p_action_id uuid,
  p_idempotency_key text,
  p_executor_reference text,
  p_magic_link_requested boolean
)
returns public.account_email_replacement_state
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_action public.account_email_replacement_actions%rowtype;
begin
  select * into v_action
  from public.account_email_replacement_actions
  where id = p_action_id and idempotency_key = p_idempotency_key
  for update;

  if not found then raise exception 'email replacement action not found'; end if;
  if v_action.state = 'completed' then return 'completed'; end if;
  if v_action.state <> 'executing' or v_action.executor_reference <> p_executor_reference then
    raise exception 'matching executing email replacement required';
  end if;
  if public.account_support_email_fingerprint((select email from auth.users where id = v_action.user_id))
     <> v_action.target_email_fingerprint then
    raise exception 'Auth email does not match approved target';
  end if;

  update public.account_email_replacement_actions
  set state = 'completed',
      completed_at = timezone('utc', now()),
      post_change_magic_link_requested = p_magic_link_requested,
      last_failure_code = null
  where id = p_action_id;

  insert into public.account_email_replacement_events (
    action_id, event_type, from_state, to_state, operator_reference, magic_link_requested
  ) values (
    p_action_id, 'completed', 'executing', 'completed', p_executor_reference, p_magic_link_requested
  );

  insert into public.audit_events (
    actor_type, event_type, entity_type, entity_id, payload
  ) values (
    'service', 'account_email_replacement_completed', 'account_email_replacement', p_action_id::text,
    jsonb_build_object(
      'attempt_count', v_action.attempt_count,
      'magic_link_requested', p_magic_link_requested,
      'plaintext_email_persisted', false
    )
  );

  return 'completed';
end;
$$;

create or replace function public.fail_account_email_replacement(
  p_action_id uuid,
  p_idempotency_key text,
  p_executor_reference text,
  p_failure_code text,
  p_retryable boolean
)
returns public.account_email_replacement_state
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action public.account_email_replacement_actions%rowtype;
  v_next_state public.account_email_replacement_state;
begin
  select * into v_action
  from public.account_email_replacement_actions
  where id = p_action_id and idempotency_key = p_idempotency_key
  for update;

  if not found then raise exception 'email replacement action not found'; end if;
  if v_action.state <> 'executing' or v_action.executor_reference <> p_executor_reference then
    raise exception 'matching executing email replacement required';
  end if;
  if p_failure_code is null or p_failure_code !~ '^[a-z0-9][a-z0-9._:-]{0,119}$' then
    raise exception 'invalid failure code';
  end if;

  v_next_state := case
    when p_retryable and v_action.attempt_count < 3 and v_action.expires_at > timezone('utc', now())
      then 'approved'::public.account_email_replacement_state
    else 'failed'::public.account_email_replacement_state
  end;

  update public.account_email_replacement_actions
  set state = v_next_state,
      executor_reference = case when v_next_state = 'approved' then null else executor_reference end,
      execution_started_at = case when v_next_state = 'approved' then null else execution_started_at end,
      last_failure_code = p_failure_code
  where id = p_action_id;

  insert into public.account_email_replacement_events (
    action_id, event_type, from_state, to_state, operator_reference, failure_code
  ) values (
    p_action_id, 'failed', 'executing', v_next_state, p_executor_reference, p_failure_code
  );

  return v_next_state;
end;
$$;

create or replace function public.cancel_account_email_replacement(
  p_action_id uuid,
  p_expected_state public.account_email_replacement_state,
  p_operator_reference text
)
returns public.account_email_replacement_state
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action public.account_email_replacement_actions%rowtype;
begin
  select * into v_action
  from public.account_email_replacement_actions
  where id = p_action_id
  for update;

  if not found then raise exception 'email replacement action not found'; end if;
  if v_action.state <> p_expected_state then raise exception 'stale email replacement state'; end if;
  if v_action.state not in ('requested', 'approved') then raise exception 'email replacement cannot be cancelled'; end if;
  if p_operator_reference not in (v_action.requested_by, v_action.approved_by) then
    raise exception 'email replacement cancellation operator not authorized';
  end if;

  update public.account_email_replacement_actions
  set state = 'cancelled',
      last_failure_code = 'cancelled_by_support'
  where id = p_action_id;

  insert into public.account_email_replacement_events (
    action_id, event_type, from_state, to_state, operator_reference, failure_code
  ) values (
    p_action_id, 'cancelled', v_action.state, 'cancelled', p_operator_reference, 'cancelled_by_support'
  );

  return 'cancelled';
end;
$$;

alter table public.account_email_replacement_actions enable row level security;
alter table public.account_email_replacement_events enable row level security;

revoke all on public.account_email_replacement_actions from public, anon, authenticated, service_role;
revoke all on public.account_email_replacement_events from public, anon, authenticated, service_role;
grant select on public.account_email_replacement_actions to service_role;
grant select on public.account_email_replacement_events to service_role;

revoke all on function public.account_support_email_fingerprint(text) from public, anon, authenticated, service_role;
revoke all on function public.request_account_email_replacement(uuid, text, text, text, text, text, text, text) from public, anon, authenticated, service_role;
revoke all on function public.approve_account_email_replacement(uuid, public.account_email_replacement_state, text) from public, anon, authenticated, service_role;
revoke all on function public.get_account_email_replacement_execution_context(uuid, text) from public, anon, authenticated, service_role;
revoke all on function public.claim_account_email_replacement_execution(uuid, text, text) from public, anon, authenticated, service_role;
revoke all on function public.complete_account_email_replacement(uuid, text, text, boolean) from public, anon, authenticated, service_role;
revoke all on function public.fail_account_email_replacement(uuid, text, text, text, boolean) from public, anon, authenticated, service_role;
revoke all on function public.cancel_account_email_replacement(uuid, public.account_email_replacement_state, text) from public, anon, authenticated, service_role;

grant execute on function public.request_account_email_replacement(uuid, text, text, text, text, text, text, text) to service_role;
grant execute on function public.approve_account_email_replacement(uuid, public.account_email_replacement_state, text) to service_role;
grant execute on function public.get_account_email_replacement_execution_context(uuid, text) to service_role;
grant execute on function public.claim_account_email_replacement_execution(uuid, text, text) to service_role;
grant execute on function public.complete_account_email_replacement(uuid, text, text, boolean) to service_role;
grant execute on function public.fail_account_email_replacement(uuid, text, text, text, boolean) to service_role;
grant execute on function public.cancel_account_email_replacement(uuid, public.account_email_replacement_state, text) to service_role;
