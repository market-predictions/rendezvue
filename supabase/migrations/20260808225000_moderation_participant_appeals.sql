-- WP-070D — participant notice and independent appeal/correction foundation.
--
-- This package adds due-process evidence around an already-executed WP-070C
-- reversible restriction. It does not activate an enforcement policy and it has
-- no authority to lift, shorten, extend or create a restriction.

create table if not exists public.moderation_appeals (
  id uuid primary key default gen_random_uuid(),
  restriction_id uuid not null unique references public.moderation_restrictions(id) on delete cascade,
  proposal_id uuid not null references public.moderation_action_proposals(id) on delete cascade,
  subject_user_id uuid not null references auth.users(id) on delete cascade,
  action_code text not null check (action_code in ('restrict_discovery', 'restrict_contact')),
  appeal_reason_code text not null check (appeal_reason_code in (
    'mistaken_identity',
    'context_missing',
    'incorrect_facts',
    'restriction_impact',
    'other'
  )),
  participant_statement text,
  status text not null default 'pending' check (status in (
    'pending',
    'upheld',
    'correction_recorded',
    'recommend_early_release',
    'specialist_escalation'
  )),
  submitted_at timestamptz not null default timezone('utc', now()),
  reviewer_ref text,
  review_code text,
  reviewed_at timestamptz,
  constraint moderation_appeal_statement_length check (
    participant_statement is null or char_length(participant_statement) <= 2000
  ),
  constraint moderation_appeal_review_fields_consistent check (
    (
      status = 'pending'
      and reviewer_ref is null
      and review_code is null
      and reviewed_at is null
    )
    or
    (
      status <> 'pending'
      and reviewer_ref ~ '^[A-Za-z0-9][A-Za-z0-9:_-]{2,95}$'
      and review_code ~ '^[a-z0-9][a-z0-9_:-]{2,79}$'
      and reviewed_at is not null
    )
  )
);

create index if not exists moderation_appeals_queue_idx
  on public.moderation_appeals (status, submitted_at, id);

alter table public.moderation_appeals enable row level security;

create or replace function public.protect_moderation_appeal_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.id is distinct from old.id
     or new.restriction_id is distinct from old.restriction_id
     or new.proposal_id is distinct from old.proposal_id
     or new.subject_user_id is distinct from old.subject_user_id
     or new.action_code is distinct from old.action_code
     or new.appeal_reason_code is distinct from old.appeal_reason_code
     or new.participant_statement is distinct from old.participant_statement
     or new.submitted_at is distinct from old.submitted_at then
    raise exception 'moderation appeal snapshot is immutable';
  end if;
  if old.status <> 'pending' then
    raise exception 'moderation appeal already decided';
  end if;
  if new.status not in ('upheld', 'correction_recorded', 'recommend_early_release', 'specialist_escalation') then
    raise exception 'invalid moderation appeal decision';
  end if;
  if new.reviewer_ref is null or new.review_code is null or new.reviewed_at is null then
    raise exception 'moderation appeal review evidence required';
  end if;
  return new;
end;
$$;

drop trigger if exists moderation_appeals_snapshot_immutable on public.moderation_appeals;
create trigger moderation_appeals_snapshot_immutable
before update on public.moderation_appeals
for each row execute function public.protect_moderation_appeal_snapshot();

create or replace function public.moderation_participant_reason_key(
  p_source_category text,
  p_action_code text
)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when p_source_category in ('impersonation', 'scam_money') then 'moderation.reason.identity_or_integrity_concern'
    when p_source_category = 'hidden_relationship' then 'moderation.reason.relationship_integrity_concern'
    when p_source_category in ('harassment', 'hate_or_discrimination', 'offline_no_show_pattern') then 'moderation.reason.community_conduct_concern'
    when p_source_category in ('minor_suspected', 'threat', 'stalking', 'sexual_coercion') then 'moderation.reason.safety_concern'
    when p_action_code = 'restrict_contact' then 'moderation.reason.contact_safety_review'
    else 'moderation.reason.discovery_safety_review'
  end;
$$;

create or replace function public.list_my_moderation_notices()
returns table (
  restriction_id uuid,
  action_code text,
  notice_key text,
  reason_key text,
  starts_at timestamptz,
  expires_at timestamptz,
  restriction_active boolean,
  appeal_available boolean,
  appeal_status text,
  appeal_outcome_key text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
begin
  if v_actor is null then raise exception 'authentication required'; end if;

  return query
  select
    r.id,
    r.action_code,
    case r.action_code
      when 'restrict_contact' then 'moderation.notice.contact_restriction'
      else 'moderation.notice.discovery_restriction'
    end,
    public.moderation_participant_reason_key(p.source_category, r.action_code),
    r.starts_at,
    r.expires_at,
    r.starts_at <= timezone('utc', now()) and r.expires_at > timezone('utc', now()),
    a.id is null,
    coalesce(a.status, 'not_submitted'),
    case a.status
      when 'upheld' then 'moderation.appeal.outcome.upheld'
      when 'correction_recorded' then 'moderation.appeal.outcome.correction_recorded'
      when 'recommend_early_release' then 'moderation.appeal.outcome.early_release_recommended'
      when 'specialist_escalation' then 'moderation.appeal.outcome.specialist_escalation'
      else null
    end
  from public.moderation_restrictions r
  join public.moderation_action_proposals p on p.id = r.proposal_id
  left join public.moderation_appeals a on a.restriction_id = r.id
  where r.subject_user_id = v_actor
  order by r.starts_at desc, r.id desc;
end;
$$;

create or replace function public.submit_moderation_appeal(
  p_restriction_id uuid,
  p_reason_code text,
  p_statement text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_restriction public.moderation_restrictions%rowtype;
  v_existing_id uuid;
  v_appeal_id uuid;
  v_statement text := nullif(trim(p_statement), '');
begin
  if v_actor is null then raise exception 'authentication required'; end if;
  if p_reason_code not in ('mistaken_identity', 'context_missing', 'incorrect_facts', 'restriction_impact', 'other') then
    raise exception 'invalid moderation appeal reason code';
  end if;
  if v_statement is not null and char_length(v_statement) > 2000 then
    raise exception 'moderation appeal statement too long';
  end if;

  select * into v_restriction
  from public.moderation_restrictions
  where id = p_restriction_id;
  if not found or v_restriction.subject_user_id <> v_actor then
    raise exception 'moderation restriction unavailable';
  end if;

  select id into v_existing_id
  from public.moderation_appeals
  where restriction_id = v_restriction.id;
  if v_existing_id is not null then return v_existing_id; end if;

  insert into public.moderation_appeals (
    restriction_id,
    proposal_id,
    subject_user_id,
    action_code,
    appeal_reason_code,
    participant_statement
  ) values (
    v_restriction.id,
    v_restriction.proposal_id,
    v_actor,
    v_restriction.action_code,
    p_reason_code,
    v_statement
  )
  on conflict (restriction_id) do nothing
  returning id into v_appeal_id;

  if v_appeal_id is null then
    select id into v_appeal_id
    from public.moderation_appeals
    where restriction_id = v_restriction.id;
    return v_appeal_id;
  end if;

  insert into public.audit_events (
    actor_user_id, actor_type, event_type, subject_user_id, entity_type, entity_id, payload
  ) values (
    v_actor,
    'user',
    'moderation_appeal_submitted',
    v_actor,
    'moderation_appeal',
    v_appeal_id::text,
    jsonb_build_object(
      'restriction_id', v_restriction.id,
      'action_code', v_restriction.action_code,
      'appeal_reason_code', p_reason_code
    )
  );

  return v_appeal_id;
end;
$$;

create or replace function public.list_pending_moderation_appeals(p_limit integer default 100)
returns table (
  appeal_id uuid,
  restriction_id uuid,
  subject_user_id uuid,
  action_code text,
  appeal_reason_code text,
  participant_statement text,
  restriction_starts_at timestamptz,
  restriction_expires_at timestamptz,
  submitted_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_limit is null or p_limit < 1 or p_limit > 200 then
    raise exception 'moderation appeal limit must be between 1 and 200';
  end if;

  return query
  select
    a.id,
    a.restriction_id,
    a.subject_user_id,
    a.action_code,
    a.appeal_reason_code,
    a.participant_statement,
    r.starts_at,
    r.expires_at,
    a.submitted_at
  from public.moderation_appeals a
  join public.moderation_restrictions r on r.id = a.restriction_id
  where a.status = 'pending'
  order by a.submitted_at, a.id
  limit p_limit;
end;
$$;

create or replace function public.review_moderation_appeal(
  p_appeal_id uuid,
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
  v_appeal public.moderation_appeals%rowtype;
  v_restriction public.moderation_restrictions%rowtype;
  v_proposal public.moderation_action_proposals%rowtype;
  v_original_review public.moderation_action_reviews%rowtype;
  v_now timestamptz := timezone('utc', now());
begin
  if p_reviewer_ref is null or p_reviewer_ref !~ '^[A-Za-z0-9][A-Za-z0-9:_-]{2,95}$' then
    raise exception 'invalid moderation appeal reviewer reference';
  end if;
  if p_decision not in ('upheld', 'correction_recorded', 'recommend_early_release', 'specialist_escalation') then
    raise exception 'invalid moderation appeal decision';
  end if;
  if p_review_code is null or p_review_code !~ '^[a-z0-9][a-z0-9_:-]{2,79}$' then
    raise exception 'invalid moderation appeal review code';
  end if;

  select * into v_appeal
  from public.moderation_appeals
  where id = p_appeal_id
  for update;
  if not found then raise exception 'moderation appeal not found'; end if;
  if v_appeal.status <> 'pending' then raise exception 'moderation appeal already decided'; end if;

  select * into v_restriction
  from public.moderation_restrictions
  where id = v_appeal.restriction_id;
  if not found then raise exception 'moderation restriction not found'; end if;

  select * into v_proposal
  from public.moderation_action_proposals
  where id = v_appeal.proposal_id;
  if not found then raise exception 'moderation proposal not found'; end if;

  select * into v_original_review
  from public.moderation_action_reviews
  where id = v_restriction.review_id;
  if not found then raise exception 'original moderation review not found'; end if;

  if p_reviewer_ref in (v_proposal.proposed_by_ref, v_original_review.reviewer_ref, v_restriction.executed_by_ref) then
    raise exception 'moderation appeal requires an independent reviewer';
  end if;

  update public.moderation_appeals
  set status = p_decision,
      reviewer_ref = p_reviewer_ref,
      review_code = p_review_code,
      reviewed_at = v_now
  where id = v_appeal.id;

  insert into public.audit_events (
    actor_user_id, actor_type, event_type, subject_user_id, entity_type, entity_id, payload
  ) values (
    null,
    'service',
    'moderation_appeal_reviewed',
    v_appeal.subject_user_id,
    'moderation_appeal',
    v_appeal.id::text,
    jsonb_build_object(
      'restriction_id', v_appeal.restriction_id,
      'action_code', v_appeal.action_code,
      'appeal_reason_code', v_appeal.appeal_reason_code,
      'reviewer_ref', p_reviewer_ref,
      'decision', p_decision,
      'review_code', p_review_code
    )
  );

  return v_appeal.id;
end;
$$;

-- Operational table is private. Service callers may read it but all mutation is
-- forced through the controlled participant-submit / independent-review RPCs.
revoke all on public.moderation_appeals from public, anon, authenticated, service_role;
grant select on public.moderation_appeals to service_role;

revoke all on function public.protect_moderation_appeal_snapshot() from public, anon, authenticated, service_role;
revoke all on function public.moderation_participant_reason_key(text, text) from public, anon, authenticated, service_role;

revoke all on function public.list_my_moderation_notices() from public, anon;
grant execute on function public.list_my_moderation_notices() to authenticated;

revoke all on function public.submit_moderation_appeal(uuid, text, text) from public, anon;
grant execute on function public.submit_moderation_appeal(uuid, text, text) to authenticated;

revoke all on function public.list_pending_moderation_appeals(integer) from public, anon, authenticated;
grant execute on function public.list_pending_moderation_appeals(integer) to service_role;

revoke all on function public.review_moderation_appeal(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.review_moderation_appeal(uuid, text, text, text) to service_role;
