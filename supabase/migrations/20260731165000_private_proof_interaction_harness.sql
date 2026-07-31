-- Controlled synthetic-only helpers for the private Supabase proof lane.
-- These functions are intentionally narrow and must not be treated as a
-- production monetisation or moderation implementation.

create or replace function public.claim_private_proof_entitlement()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_entitlement_id uuid;
begin
  if v_actor is null then raise exception 'authentication required'; end if;

  if not exists (
    select 1
    from public.profiles p
    join public.eligibility e on e.user_id = p.user_id
    where p.user_id = v_actor
      and p.publication_status = 'published'
      and e.current_relationship_state = 'single'
      and e.adult_confirmed
      and e.serious_intent_confirmed
      and e.community_fit_confirmed
      and e.terms_version = 'synthetic-proof-2026-07'
  ) then
    raise exception 'published synthetic proof profile required';
  end if;

  -- The conversation-opening RPC replaces the entitlement idempotency key.
  -- Therefore the durable proof marker is the immutable audit event, not the
  -- mutable entitlement row key. This prevents claiming a second proof right
  -- after the first one is consumed.
  select ce.id into v_entitlement_id
  from public.contact_entitlements ce
  where ce.owner_user_id = v_actor
    and ce.source_type = 'pilot'
    and exists (
      select 1
      from public.audit_events ae
      where ae.actor_user_id = v_actor
        and ae.event_type = 'private_proof_entitlement_claimed'
        and ae.entity_type = 'contact_entitlement'
        and ae.entity_id = ce.id::text
        and ae.payload ->> 'scope' = 'synthetic-private-proof'
    )
  order by ce.created_at
  limit 1;

  if v_entitlement_id is null then
    insert into public.contact_entitlements (
      owner_user_id, source_type, status, valid_from, expires_at, idempotency_key
    ) values (
      v_actor, 'pilot', 'available', timezone('utc', now()),
      timezone('utc', now()) + interval '48 hours', 'private-proof-one-time'
    ) returning id into v_entitlement_id;

    insert into public.audit_events (
      actor_user_id, actor_type, event_type, entity_type, entity_id,
      payload
    ) values (
      v_actor, 'user', 'private_proof_entitlement_claimed',
      'contact_entitlement', v_entitlement_id::text,
      jsonb_build_object('scope', 'synthetic-private-proof')
    );
  end if;

  return v_entitlement_id;
end;
$$;

create or replace function public.end_match_contact(
  p_match_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_match public.matches%rowtype;
begin
  if v_actor is null then raise exception 'authentication required'; end if;

  select * into v_match
  from public.matches
  where id = p_match_id
  for update;

  if not found then raise exception 'match not found'; end if;
  if v_actor not in (v_match.user_a_id, v_match.user_b_id) then
    raise exception 'match participation required';
  end if;
  if v_match.status = 'blocked' then raise exception 'blocked match cannot be ended'; end if;

  update public.matches
  set status = 'ended',
      ended_at = coalesce(ended_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
  where id = p_match_id;

  update public.conversations
  set status = 'ended',
      ended_at = coalesce(ended_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
  where match_id = p_match_id
    and status <> 'blocked';

  update public.attraction_signals
  set revoked_at = coalesce(revoked_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
  where (actor_user_id = v_match.user_a_id and target_user_id = v_match.user_b_id)
     or (actor_user_id = v_match.user_b_id and target_user_id = v_match.user_a_id);

  insert into public.audit_events (
    actor_user_id, actor_type, event_type, entity_type, entity_id
  ) values (
    v_actor, 'user', 'match_contact_ended', 'match', p_match_id::text
  );

  return p_match_id;
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
  if p_other_user_id is null or p_other_user_id = v_actor then
    raise exception 'other participant required';
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
  ) then
    return null;
  end if;

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

-- Active matched users may request a short-lived signed URL for the other
-- selected derivative. The bucket remains private and access ends immediately
-- when contact is ended or blocked.
drop policy if exists portrait_objects_read_matched on storage.objects;
create policy portrait_objects_read_matched on storage.objects for select to authenticated
using (
  bucket_id = 'privacy-portraits'
  and exists (
    select 1
    from public.privacy_portraits pp
    join public.matches m
      on m.user_a_id = least(auth.uid(), pp.user_id)
     and m.user_b_id = greatest(auth.uid(), pp.user_id)
     and m.status = 'active'
    where pp.object_path = name
      and pp.user_id <> auth.uid()
      and pp.is_public_profile_portrait
      and pp.status in ('pending', 'verified')
      and not exists (
        select 1 from public.blocks b
        where (b.blocker_user_id = auth.uid() and b.blocked_user_id = pp.user_id)
           or (b.blocker_user_id = pp.user_id and b.blocked_user_id = auth.uid())
      )
  )
);

revoke all on function public.claim_private_proof_entitlement() from public, anon;
revoke all on function public.end_match_contact(uuid) from public, anon;
revoke all on function public.get_matched_portrait_path(uuid) from public, anon;
grant execute on function public.claim_private_proof_entitlement() to authenticated;
grant execute on function public.end_match_contact(uuid) to authenticated;
grant execute on function public.get_matched_portrait_path(uuid) to authenticated;

-- Conversation state changes are useful evidence in the controlled proof.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;
end $$;
