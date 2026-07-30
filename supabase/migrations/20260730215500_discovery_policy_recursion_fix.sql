-- Avoid recursive RLS on profiles by evaluating discovery through a tightly
-- scoped SECURITY DEFINER predicate. The same predicate gates attraction RPCs.

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
    and p_target_user_id is not null
    and p_target_user_id <> auth.uid()
    and p_target_sex is not null
    and exists (
      select 1
      from public.profiles actor_profile
      join public.eligibility actor_eligibility on actor_eligibility.user_id = actor_profile.user_id
      where actor_profile.user_id = auth.uid()
        and actor_profile.sex is not null
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
        and target_profile.sex = p_target_sex
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

drop policy if exists profiles_read_discoverable on public.profiles;
create policy profiles_read_discoverable on public.profiles for select to authenticated
using (
  user_id = auth.uid()
  or public.can_discover_profile(user_id, sex)
);

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
begin
  if v_actor is null then raise exception 'authentication required'; end if;
  if p_target_user_id is null or p_target_user_id = v_actor then raise exception 'invalid target'; end if;

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
    v_user_a := least(v_actor, p_target_user_id);
    v_user_b := greatest(v_actor, p_target_user_id);
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

revoke all on function public.can_discover_profile(uuid, public.sex_type) from public, anon;
grant execute on function public.can_discover_profile(uuid, public.sex_type) to authenticated;

-- Replacing the RPC resets function grants on some PostgreSQL versions; repeat
-- the explicit least-privilege contract.
revoke all on function public.record_attraction_signal(uuid, public.attraction_signal_type, text, text) from public, anon;
grant execute on function public.record_attraction_signal(uuid, public.attraction_signal_type, text, text) to authenticated;
