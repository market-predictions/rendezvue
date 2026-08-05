-- WP-072: align the controlled one-time entitlement with the current product
-- onboarding terms while retaining the earlier private-proof fixture contract.

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
      and e.terms_version in (
        'synthetic-proof-2026-07',
        'synthetic-product-2026-08'
      )
  ) then
    raise exception 'published synthetic proof profile required';
  end if;

  -- The immutable audit event prevents a second one-time proof entitlement
  -- from being minted after the original row has been consumed.
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
      v_actor,
      'pilot',
      'available',
      timezone('utc', now()),
      timezone('utc', now()) + interval '48 hours',
      'private-proof-one-time'
    ) returning id into v_entitlement_id;

    insert into public.audit_events (
      actor_user_id, actor_type, event_type, entity_type, entity_id, payload
    ) values (
      v_actor,
      'user',
      'private_proof_entitlement_claimed',
      'contact_entitlement',
      v_entitlement_id::text,
      jsonb_build_object('scope', 'synthetic-private-proof')
    );
  end if;

  return v_entitlement_id;
end;
$$;

comment on function public.claim_private_proof_entitlement() is
  'Claims the single controlled synthetic contact entitlement for an eligible published proof or current product profile.';

revoke all on function public.claim_private_proof_entitlement() from public, anon;
grant execute on function public.claim_private_proof_entitlement() to authenticated;
