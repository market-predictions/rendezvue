-- Blocking must be one server-authoritative transaction. A block freezes the
-- existing match/conversation and revokes attraction signals for both users.

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
      and not exists (
        select 1 from public.blocks b
        where (b.blocker_user_id = m.user_a_id and b.blocked_user_id = m.user_b_id)
           or (b.blocker_user_id = m.user_b_id and b.blocked_user_id = m.user_a_id)
      )
  );
$$;

create or replace function public.block_user(
  p_blocked_user_id uuid,
  p_reason_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_block_id uuid;
begin
  if v_actor is null then raise exception 'authentication required'; end if;
  if p_blocked_user_id is null or p_blocked_user_id = v_actor then
    raise exception 'invalid blocked user';
  end if;

  insert into public.blocks (blocker_user_id, blocked_user_id, reason_code)
  values (v_actor, p_blocked_user_id, nullif(trim(p_reason_code), ''))
  on conflict (blocker_user_id, blocked_user_id) do update set
    reason_code = excluded.reason_code
  returning id into v_block_id;

  update public.attraction_signals
  set revoked_at = coalesce(revoked_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
  where (actor_user_id = v_actor and target_user_id = p_blocked_user_id)
     or (actor_user_id = p_blocked_user_id and target_user_id = v_actor);

  update public.matches
  set status = 'blocked',
      ended_at = coalesce(ended_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
  where (user_a_id = least(v_actor, p_blocked_user_id)
     and user_b_id = greatest(v_actor, p_blocked_user_id));

  update public.conversations c
  set status = 'blocked',
      ended_at = coalesce(c.ended_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
  where c.match_id in (
    select m.id from public.matches m
    where m.user_a_id = least(v_actor, p_blocked_user_id)
      and m.user_b_id = greatest(v_actor, p_blocked_user_id)
  );

  insert into public.audit_events (
    actor_user_id, actor_type, event_type, subject_user_id, entity_type, entity_id,
    payload
  ) values (
    v_actor, 'user', 'user_blocked', p_blocked_user_id, 'block', v_block_id::text,
    jsonb_build_object('reason_code', nullif(trim(p_reason_code), ''))
  );

  return v_block_id;
end;
$$;

-- A closed or blocked thread is never silently reopened by a retry.
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

drop policy if exists messages_participants_insert on public.messages;
create policy messages_participants_insert on public.messages for insert to authenticated
with check (
  sender_user_id = auth.uid()
  and public.is_conversation_available(conversation_id, auth.uid())
);

-- Direct client inserts/deletes would bypass match and conversation freezing.
drop policy if exists blocks_owner_insert on public.blocks;
drop policy if exists blocks_owner_delete on public.blocks;

grant execute on function public.block_user(uuid, text) to authenticated;
grant execute on function public.is_conversation_available(uuid, uuid) to authenticated;
