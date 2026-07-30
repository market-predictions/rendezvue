-- Serialize attraction updates for one unordered user pair. Without this lock,
-- two simultaneous first likes can both miss the other uncommitted signal and
-- leave a reciprocal pair without a match.

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

  -- Transaction-scoped and deterministic for the unordered pair. The second
  -- concurrent caller waits until the first signal is committed, then observes
  -- it when evaluating reciprocity.
  perform pg_advisory_xact_lock(hashtextextended(v_pair_key, 0));

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

revoke all on function public.record_attraction_signal(uuid, public.attraction_signal_type, text, text) from public, anon;
grant execute on function public.record_attraction_signal(uuid, public.attraction_signal_type, text, text) to authenticated;
