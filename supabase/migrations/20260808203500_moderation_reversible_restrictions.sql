-- WP-070C — policy-bound reversible moderation restriction execution.
--
-- This package consumes only an independently approved WP-070B proposal and
-- can create only time-bounded discovery/contact restrictions. It deliberately
-- does not mutate participant publication/block/match/conversation/Auth state.
-- The repository ships with no active policy; protected staging therefore stays
-- fail-closed until a separately governed policy activation exists.

create table if not exists public.moderation_enforcement_policies (
  id uuid primary key default gen_random_uuid(),
  policy_key text not null check (policy_key ~ '^[a-z0-9][a-z0-9_.:-]{2,79}$'),
  policy_version integer not null check (policy_version > 0),
  scope text not null check (scope = 'synthetic_only'),
  action_code text not null check (action_code in ('restrict_discovery', 'restrict_contact')),
  duration_minutes integer not null check (duration_minutes between 5 and 10080),
  active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  unique (policy_key, policy_version, action_code)
);

create table if not exists public.moderation_restrictions (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null unique references public.moderation_action_proposals(id) on delete cascade,
  review_id uuid not null references public.moderation_action_reviews(id) on delete cascade,
  case_id uuid not null references public.moderation_cases(id) on delete cascade,
  subject_user_id uuid not null references auth.users(id) on delete cascade,
  policy_id uuid not null references public.moderation_enforcement_policies(id) on delete restrict,
  action_code text not null check (action_code in ('restrict_discovery', 'restrict_contact')),
  executed_by_ref text not null check (executed_by_ref ~ '^[A-Za-z0-9][A-Za-z0-9:_-]{2,95}$'),
  starts_at timestamptz not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint moderation_restrictions_bounded_duration check (expires_at > starts_at)
);

create index if not exists moderation_restrictions_subject_action_time_idx
  on public.moderation_restrictions (subject_user_id, action_code, starts_at, expires_at);

alter table public.moderation_enforcement_policies enable row level security;
alter table public.moderation_restrictions enable row level security;

-- Repository-defined policy templates are intentionally inactive. WP-070C has
-- no service-side activation RPC and no real-user scope.
insert into public.moderation_enforcement_policies (
  policy_key, policy_version, scope, action_code, duration_minutes, active
) values
  ('wp070c.synthetic.reversible', 1, 'synthetic_only', 'restrict_discovery', 60, false),
  ('wp070c.synthetic.reversible', 1, 'synthetic_only', 'restrict_contact', 60, false)
on conflict (policy_key, policy_version, action_code) do nothing;

create or replace function public.has_active_moderation_restriction(
  p_user_id uuid,
  p_action_code text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(exists (
    select 1
    from public.moderation_restrictions r
    where r.subject_user_id = p_user_id
      and r.action_code = p_action_code
      and r.starts_at <= timezone('utc', now())
      and r.expires_at > timezone('utc', now())
  ), false);
$$;

create or replace function public.execute_approved_moderation_restriction(
  p_proposal_id uuid,
  p_policy_key text,
  p_policy_version integer,
  p_executor_ref text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proposal public.moderation_action_proposals%rowtype;
  v_review public.moderation_action_reviews%rowtype;
  v_case public.moderation_cases%rowtype;
  v_report public.safety_reports%rowtype;
  v_policy public.moderation_enforcement_policies%rowtype;
  v_existing public.moderation_restrictions%rowtype;
  v_restriction_id uuid;
  v_now timestamptz := timezone('utc', now());
  v_expires_at timestamptz;
  v_case_version integer;
begin
  if p_executor_ref is null or p_executor_ref !~ '^[A-Za-z0-9][A-Za-z0-9:_-]{2,95}$' then
    raise exception 'invalid moderation executor reference';
  end if;
  if p_policy_key is null or p_policy_key !~ '^[a-z0-9][a-z0-9_.:-]{2,79}$' then
    raise exception 'invalid moderation enforcement policy key';
  end if;
  if p_policy_version is null or p_policy_version < 1 then
    raise exception 'invalid moderation enforcement policy version';
  end if;

  select * into v_proposal
  from public.moderation_action_proposals
  where id = p_proposal_id
  for update;
  if not found then raise exception 'moderation action proposal not found'; end if;

  -- Idempotent retries return the already-created restriction, but a retry may
  -- not silently substitute another policy/version.
  select r.* into v_existing
  from public.moderation_restrictions r
  join public.moderation_enforcement_policies ep on ep.id = r.policy_id
  where r.proposal_id = v_proposal.id
    and ep.policy_key = p_policy_key
    and ep.policy_version = p_policy_version;
  if found then return v_existing.id; end if;
  if exists (select 1 from public.moderation_restrictions r where r.proposal_id = v_proposal.id) then
    raise exception 'moderation proposal already executed under another policy';
  end if;

  if v_proposal.status <> 'approved' then
    raise exception 'moderation proposal is not independently approved';
  end if;
  if v_proposal.critical_escalation_required then
    raise exception 'critical moderation proposal cannot use reversible executor';
  end if;
  if v_proposal.action_code not in ('restrict_discovery', 'restrict_contact') then
    raise exception 'moderation action is not executable by WP-070C';
  end if;

  select * into v_review
  from public.moderation_action_reviews
  where proposal_id = v_proposal.id;
  if not found or v_review.decision <> 'approved' then
    raise exception 'approved independent moderation review required';
  end if;
  if v_review.reviewer_ref = v_proposal.proposed_by_ref then
    raise exception 'independent moderation review invariant violated';
  end if;

  select * into v_case
  from public.moderation_cases
  where id = v_proposal.case_id
  for update;
  if not found then raise exception 'moderation case not found'; end if;
  if v_case.version <> v_proposal.case_version then raise exception 'stale moderation restriction case version'; end if;
  if v_case.status <> v_proposal.case_status or v_case.status <> 'investigating' then
    raise exception 'stale moderation restriction case state';
  end if;
  if v_case.assigned_operator_ref is distinct from v_proposal.proposed_by_ref then
    raise exception 'moderation case assignment changed since approval';
  end if;
  if v_case.subject_user_id <> v_proposal.subject_user_id
     or v_case.source_report_id <> v_proposal.source_report_id then
    raise exception 'moderation restriction case binding changed';
  end if;

  select * into v_report
  from public.safety_reports
  where id = v_proposal.source_report_id
  for share;
  if not found then raise exception 'moderation source report not found'; end if;
  if v_report.subject_user_id <> v_proposal.subject_user_id
     or v_report.category <> v_proposal.source_category
     or v_report.severity <> v_proposal.source_severity then
    raise exception 'moderation restriction report snapshot changed';
  end if;

  select * into v_policy
  from public.moderation_enforcement_policies
  where policy_key = p_policy_key
    and policy_version = p_policy_version
    and action_code = v_proposal.action_code
  for share;
  if not found then raise exception 'moderation enforcement policy not found for action'; end if;
  if not v_policy.active then raise exception 'moderation enforcement policy is inactive'; end if;
  if v_policy.scope <> 'synthetic_only' then raise exception 'unsupported moderation enforcement policy scope'; end if;
  if not exists (
    select 1 from public.profiles p
    where p.user_id = v_proposal.subject_user_id and p.is_synthetic
  ) then
    raise exception 'WP-070C executor is restricted to synthetic profiles';
  end if;

  v_expires_at := v_now + make_interval(mins => v_policy.duration_minutes);

  insert into public.moderation_restrictions (
    proposal_id, review_id, case_id, subject_user_id, policy_id,
    action_code, executed_by_ref, starts_at, expires_at
  ) values (
    v_proposal.id, v_review.id, v_case.id, v_proposal.subject_user_id, v_policy.id,
    v_proposal.action_code, p_executor_ref, v_now, v_expires_at
  ) returning id into v_restriction_id;

  -- This is the first WP-070 package that performs a bounded moderation effect,
  -- so the moderation case records that an action was actually executed. No
  -- participant-owned product state is rewritten.
  update public.moderation_cases
  set status = 'actioned',
      last_activity_at = v_now,
      version = version + 1
  where id = v_case.id
  returning version into v_case_version;

  update public.safety_reports
  set status = 'actioned'
  where id = v_case.source_report_id;

  insert into public.moderation_case_events (
    case_id, case_version, event_type, actor_ref, from_status, to_status, metadata
  ) values (
    v_case.id,
    v_case_version,
    'status_transition',
    p_executor_ref,
    'investigating',
    'actioned',
    jsonb_build_object(
      'proposal_id', v_proposal.id,
      'restriction_id', v_restriction_id,
      'action_code', v_proposal.action_code,
      'policy_key', v_policy.policy_key,
      'policy_version', v_policy.policy_version,
      'expires_at', v_expires_at
    )
  );

  insert into public.audit_events (
    actor_user_id, actor_type, event_type, subject_user_id, entity_type, entity_id, payload
  ) values (
    null,
    'service',
    'moderation_restriction_executed',
    v_proposal.subject_user_id,
    'moderation_restriction',
    v_restriction_id::text,
    jsonb_build_object(
      'case_id', v_case.id,
      'case_version_before_execution', v_proposal.case_version,
      'proposal_id', v_proposal.id,
      'policy_key', v_policy.policy_key,
      'policy_version', v_policy.policy_version,
      'policy_scope', v_policy.scope,
      'action_code', v_proposal.action_code,
      'proposed_by_ref', v_proposal.proposed_by_ref,
      'reviewer_ref', v_review.reviewer_ref,
      'executor_ref', p_executor_ref,
      'starts_at', v_now,
      'expires_at', v_expires_at
    )
  );

  return v_restriction_id;
end;
$$;

-- Discovery authorization now treats a time-bounded discovery restriction as a
-- separate overlay. Own-profile access remains available through the profile
-- RLS self branch; publication state is never rewritten by the restriction.
create or replace function public.can_discover_profile(
  p_target_user_id uuid,
  p_target_sex public.sex_type
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and p_target_user_id <> auth.uid()
    and not public.has_active_moderation_restriction(auth.uid(), 'restrict_discovery')
    and not public.has_active_moderation_restriction(p_target_user_id, 'restrict_discovery')
    and exists (
      select 1
      from public.profiles actor_profile
      join public.eligibility actor_eligibility on actor_eligibility.user_id = actor_profile.user_id
      where actor_profile.user_id = auth.uid()
        and actor_profile.sex is not null
        and p_target_sex is not null
        and actor_profile.sex <> p_target_sex
        and actor_eligibility.current_relationship_state = 'single'
        and actor_eligibility.adult_confirmed
        and actor_eligibility.serious_intent_confirmed
        and actor_eligibility.community_fit_confirmed
    )
    and exists (
      select 1
      from public.profiles target_profile
      join public.eligibility target_eligibility on target_eligibility.user_id = target_profile.user_id
      where target_profile.user_id = p_target_user_id
        and target_profile.publication_status = 'published'
        and target_eligibility.current_relationship_state = 'single'
        and target_eligibility.adult_confirmed
        and target_eligibility.serious_intent_confirmed
        and target_eligibility.community_fit_confirmed
    )
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_user_id = auth.uid() and b.blocked_user_id = p_target_user_id)
         or (b.blocker_user_id = p_target_user_id and b.blocked_user_id = auth.uid())
    );
$$;

create or replace function public.record_attraction_signal(
  p_target_user_id uuid,
  p_signal_type public.attraction_signal_type,
  p_profile_component text default null,
  p_opening_message text default null
)
returns table (signal_id uuid, resulting_match_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_target_sex public.sex_type;
  v_signal_id uuid;
  v_match_id uuid;
  v_user_a uuid;
  v_user_b uuid;
  v_pair_key text;
begin
  if v_actor is null then raise exception 'authentication required'; end if;
  if p_target_user_id is null or p_target_user_id = v_actor then raise exception 'invalid target'; end if;

  v_user_a := least(v_actor, p_target_user_id);
  v_user_b := greatest(v_actor, p_target_user_id);
  v_pair_key := v_user_a::text || ':' || v_user_b::text;
  perform pg_advisory_xact_lock(hashtextextended(v_pair_key, 0));

  if public.has_active_moderation_restriction(v_actor, 'restrict_contact')
     or public.has_active_moderation_restriction(p_target_user_id, 'restrict_contact') then
    raise exception 'interaction unavailable';
  end if;

  select p.sex into v_target_sex from public.profiles p where p.user_id = p_target_user_id;
  if not public.can_discover_profile(p_target_user_id, v_target_sex) then
    raise exception 'target is not discoverable';
  end if;

  insert into public.attraction_signals (
    actor_user_id, target_user_id, signal_type, profile_component, opening_message, revoked_at
  ) values (
    v_actor, p_target_user_id, p_signal_type, p_profile_component, p_opening_message, null
  )
  on conflict (actor_user_id, target_user_id) do update set
    signal_type = excluded.signal_type,
    profile_component = excluded.profile_component,
    opening_message = excluded.opening_message,
    revoked_at = null,
    updated_at = timezone('utc', now())
  returning id into v_signal_id;

  if p_signal_type in ('like', 'contextual_like') and exists (
    select 1 from public.attraction_signals reciprocal
    where reciprocal.actor_user_id = p_target_user_id
      and reciprocal.target_user_id = v_actor
      and reciprocal.signal_type in ('like', 'contextual_like')
      and reciprocal.revoked_at is null
  ) then
    insert into public.matches (user_a_id, user_b_id, status)
    values (v_user_a, v_user_b, 'active')
    on conflict (user_a_id, user_b_id) do update set
      status = 'active', ended_at = null, updated_at = timezone('utc', now())
    returning id into v_match_id;
  end if;

  insert into public.audit_events (actor_user_id, actor_type, event_type, subject_user_id, entity_type, entity_id)
  values (v_actor, 'user', 'attraction_signal_recorded', p_target_user_id, 'attraction_signal', v_signal_id::text);

  return query select v_signal_id, v_match_id;
end;
$$;

create or replace function public.is_conversation_available(
  p_conversation_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversations c
    join public.matches m on m.id = c.match_id
    where c.id = p_conversation_id
      and c.status = 'open'
      and m.status = 'active'
      and p_user_id in (m.user_a_id, m.user_b_id)
      and not public.has_active_moderation_restriction(m.user_a_id, 'restrict_contact')
      and not public.has_active_moderation_restriction(m.user_b_id, 'restrict_contact')
      and not exists (
        select 1 from public.blocks b
        where (b.blocker_user_id = m.user_a_id and b.blocked_user_id = m.user_b_id)
           or (b.blocker_user_id = m.user_b_id and b.blocked_user_id = m.user_a_id)
      )
  );
$$;

create or replace function public.open_match_conversation(
  p_match_id uuid,
  p_idempotency_key text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_match public.matches%rowtype;
  v_entitlement_id uuid;
  v_conversation public.conversations%rowtype;
begin
  if v_actor is null then raise exception 'authentication required'; end if;
  if coalesce(trim(p_idempotency_key), '') = '' then raise exception 'idempotency key required'; end if;

  select * into v_match from public.matches where id = p_match_id for update;
  if not found or v_match.status <> 'active' then raise exception 'active match required'; end if;
  if v_actor not in (v_match.user_a_id, v_match.user_b_id) then raise exception 'not a match participant'; end if;
  if public.has_active_moderation_restriction(v_match.user_a_id, 'restrict_contact')
     or public.has_active_moderation_restriction(v_match.user_b_id, 'restrict_contact') then
    raise exception 'interaction unavailable';
  end if;
  if exists (
    select 1 from public.blocks b
    where (b.blocker_user_id = v_match.user_a_id and b.blocked_user_id = v_match.user_b_id)
       or (b.blocker_user_id = v_match.user_b_id and b.blocked_user_id = v_match.user_a_id)
  ) then raise exception 'interaction unavailable'; end if;

  select * into v_conversation from public.conversations where match_id = p_match_id for update;
  if found then
    if v_conversation.status = 'open' then return v_conversation.id; end if;
    raise exception 'conversation cannot be reopened in the current proof';
  end if;

  select ce.id into v_entitlement_id
  from public.contact_entitlements ce
  where ce.owner_user_id = v_actor
    and ce.status = 'available'
    and ce.valid_from <= timezone('utc', now())
    and (ce.expires_at is null or ce.expires_at > timezone('utc', now()))
  order by ce.expires_at nulls last, ce.created_at
  for update skip locked
  limit 1;

  if v_entitlement_id is null then raise exception 'no contact entitlement available'; end if;

  insert into public.conversations (match_id, opened_by_user_id)
  values (p_match_id, v_actor)
  returning * into v_conversation;

  update public.contact_entitlements
  set status = 'consumed', consumed_match_id = p_match_id,
      consumed_at = timezone('utc', now()), idempotency_key = p_idempotency_key
  where id = v_entitlement_id;

  insert into public.audit_events (actor_user_id, actor_type, event_type, entity_type, entity_id)
  values (v_actor, 'user', 'conversation_opened', 'conversation', v_conversation.id::text);

  return v_conversation.id;
end;
$$;

create or replace function public.get_matched_portrait_path(
  p_other_user_id uuid
)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_path text;
begin
  if v_actor is null then raise exception 'authentication required'; end if;
  if p_other_user_id is null or p_other_user_id = v_actor then raise exception 'other participant required'; end if;
  if public.has_active_moderation_restriction(v_actor, 'restrict_contact')
     or public.has_active_moderation_restriction(p_other_user_id, 'restrict_contact') then
    return null;
  end if;

  if not exists (
    select 1
    from public.matches m
    where m.user_a_id = least(v_actor, p_other_user_id)
      and m.user_b_id = greatest(v_actor, p_other_user_id)
      and m.status = 'active'
      and not exists (
        select 1 from public.blocks b
        where (b.blocker_user_id = v_actor and b.blocked_user_id = p_other_user_id)
           or (b.blocker_user_id = p_other_user_id and b.blocked_user_id = v_actor)
      )
  ) then return null; end if;

  select pp.object_path into v_path
  from public.privacy_portraits pp
  where pp.user_id = p_other_user_id
    and pp.is_public_profile_portrait
    and pp.status in ('pending', 'verified')
  order by pp.created_at desc
  limit 1;
  return v_path;
end;
$$;

create or replace function public.can_read_matched_portrait_object(
  p_object_name text
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
begin
  if v_actor is null or p_object_name is null or btrim(p_object_name) = '' then return false; end if;
  return exists (
    select 1
    from public.privacy_portraits pp
    join public.matches m
      on m.user_a_id = least(v_actor, pp.user_id)
     and m.user_b_id = greatest(v_actor, pp.user_id)
     and m.status = 'active'
    where pp.object_path = p_object_name
      and pp.user_id <> v_actor
      and pp.is_public_profile_portrait
      and pp.status in ('pending', 'verified')
      and not public.has_active_moderation_restriction(v_actor, 'restrict_contact')
      and not public.has_active_moderation_restriction(pp.user_id, 'restrict_contact')
      and not exists (
        select 1 from public.blocks b
        where (b.blocker_user_id = v_actor and b.blocked_user_id = pp.user_id)
           or (b.blocker_user_id = pp.user_id and b.blocked_user_id = v_actor)
      )
  );
end;
$$;

create or replace function public.get_discovery_profile_media(p_other_user_id uuid)
returns table (
  profile_media_slot text,
  capture_origin text,
  privacy_filter_id text,
  object_path text,
  is_primary boolean,
  is_live_selfie boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_target_sex public.sex_type;
begin
  if v_actor is null or p_other_user_id is null or p_other_user_id = v_actor then return; end if;
  select p.sex into v_target_sex from public.profiles p where p.user_id = p_other_user_id;
  if not public.can_discover_profile(p_other_user_id, v_target_sex) then return; end if;

  return query
  select pp.profile_media_slot, pp.capture_origin, pp.privacy_filter_id, pp.object_path,
         pp.is_public_profile_portrait, pp.profile_media_slot = 'live_selfie'
  from public.privacy_portraits pp
  where pp.user_id = p_other_user_id
    and pp.asset_role = 'card'
    and pp.is_profile_media_visible
    and pp.profile_media_slot is not null
    and pp.status in ('pending', 'verified')
  order by case pp.profile_media_slot when 'live_selfie' then 1 when 'profile_photo_1' then 2 else 3 end;
end;
$$;

create or replace function public.get_discovery_portrait_path(p_other_user_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_target_sex public.sex_type;
  v_path text;
begin
  if v_actor is null or p_other_user_id is null or p_other_user_id = v_actor then return null; end if;
  select p.sex into v_target_sex from public.profiles p where p.user_id = p_other_user_id;
  if not public.can_discover_profile(p_other_user_id, v_target_sex) then return null; end if;

  select pp.object_path into v_path
  from public.privacy_portraits pp
  where pp.user_id = p_other_user_id
    and pp.asset_role = 'card'
    and pp.is_profile_media_visible
    and pp.is_public_profile_portrait
    and pp.status in ('pending', 'verified')
  order by pp.updated_at desc, pp.created_at desc, pp.id desc
  limit 1;
  return v_path;
end;
$$;

create or replace function public.can_read_discovery_portrait_object(p_object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
begin
  if v_actor is null or p_object_name is null or btrim(p_object_name) = '' then return false; end if;
  return exists (
    select 1
    from public.privacy_portraits pp
    join public.profiles p on p.user_id = pp.user_id
    where pp.object_path = p_object_name
      and pp.user_id <> v_actor
      and pp.asset_role = 'card'
      and pp.is_profile_media_visible
      and pp.profile_media_slot is not null
      and pp.status in ('pending', 'verified')
      and public.can_discover_profile(pp.user_id, p.sex)
  );
end;
$$;

-- Operational data is private. The service role may read it, but no service
-- caller may activate policies or forge restriction rows through direct DML.
revoke all on public.moderation_enforcement_policies from public, anon, authenticated, service_role;
grant select on public.moderation_enforcement_policies to service_role;
revoke all on public.moderation_restrictions from public, anon, authenticated, service_role;
grant select on public.moderation_restrictions to service_role;

revoke all on function public.has_active_moderation_restriction(uuid, text) from public, anon, authenticated, service_role;
revoke all on function public.execute_approved_moderation_restriction(uuid, text, integer, text) from public, anon, authenticated;
grant execute on function public.execute_approved_moderation_restriction(uuid, text, integer, text) to service_role;

-- Preserve the participant-facing execution grants on the redefined product
-- authorization functions. The private helper itself remains non-callable.
revoke all on function public.can_discover_profile(uuid, public.sex_type) from public, anon, authenticated, service_role;
revoke all on function public.record_attraction_signal(uuid, public.attraction_signal_type, text, text) from public, anon;
grant execute on function public.record_attraction_signal(uuid, public.attraction_signal_type, text, text) to authenticated;
revoke all on function public.is_conversation_available(uuid, uuid) from public, anon;
grant execute on function public.is_conversation_available(uuid, uuid) to authenticated;
revoke all on function public.open_match_conversation(uuid, text) from public, anon;
grant execute on function public.open_match_conversation(uuid, text) to authenticated;
revoke all on function public.get_matched_portrait_path(uuid) from public, anon;
grant execute on function public.get_matched_portrait_path(uuid) to authenticated;
revoke all on function public.can_read_matched_portrait_object(text) from public, anon;
grant execute on function public.can_read_matched_portrait_object(text) to authenticated;
revoke all on function public.get_discovery_profile_media(uuid) from public, anon;
grant execute on function public.get_discovery_profile_media(uuid) to authenticated;
revoke all on function public.get_discovery_portrait_path(uuid) from public, anon;
grant execute on function public.get_discovery_portrait_path(uuid) to authenticated;
revoke all on function public.can_read_discovery_portrait_object(text) from public, anon;
grant execute on function public.can_read_discovery_portrait_object(text) to authenticated;