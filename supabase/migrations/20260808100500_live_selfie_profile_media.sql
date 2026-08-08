-- WP-075: separate camera-origin authenticity media from freely chosen profile media.
-- One required live-selfie slot and two optional profile-photo slots may be visible.
-- Challenge/video material is never a public asset; only prepared card derivatives are visible.

alter table public.privacy_portraits
  add column if not exists profile_media_slot text,
  add column if not exists capture_origin text,
  add column if not exists is_profile_media_visible boolean not null default false,
  add column if not exists live_capture_completed_at timestamptz,
  add column if not exists capture_proof_version text;

-- Preserve the currently selected image as the first optional profile photo for
-- existing synthetic accounts. Origin is deliberately labelled legacy/unknown.
with selected_preparations as (
  select distinct user_id, preparation_id
  from public.privacy_portraits
  where asset_role = 'card'
    and is_public_profile_portrait
)
update public.privacy_portraits pp
set profile_media_slot = coalesce(pp.profile_media_slot, 'profile_photo_1'),
    capture_origin = coalesce(pp.capture_origin, 'legacy'),
    is_profile_media_visible = pp.asset_role = 'card'
from selected_preparations selected
where pp.user_id = selected.user_id
  and pp.preparation_id = selected.preparation_id;

alter table public.privacy_portraits
  drop constraint if exists privacy_portraits_profile_media_slot_check,
  add constraint privacy_portraits_profile_media_slot_check check (
    profile_media_slot is null
    or profile_media_slot in ('live_selfie', 'profile_photo_1', 'profile_photo_2')
  ),
  drop constraint if exists privacy_portraits_capture_origin_check,
  add constraint privacy_portraits_capture_origin_check check (
    capture_origin is null
    or capture_origin in ('live_camera', 'camera', 'gallery', 'legacy')
  ),
  drop constraint if exists privacy_portraits_live_selfie_origin_check,
  add constraint privacy_portraits_live_selfie_origin_check check (
    profile_media_slot is distinct from 'live_selfie'
    or capture_origin = 'live_camera'
  ),
  drop constraint if exists privacy_portraits_visible_role_check,
  add constraint privacy_portraits_visible_role_check check (
    not is_profile_media_visible or asset_role = 'card'
  );

create unique index if not exists privacy_portraits_visible_media_slot_unique
  on public.privacy_portraits (user_id, profile_media_slot)
  where asset_role = 'card'
    and is_profile_media_visible
    and profile_media_slot is not null;

create index if not exists privacy_portraits_visible_media_lookup
  on public.privacy_portraits (user_id, profile_media_slot, is_public_profile_portrait)
  where asset_role = 'card' and is_profile_media_visible;

create or replace function public.profile_has_visible_live_selfie(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.privacy_portraits pp
    where pp.user_id = p_user_id
      and pp.asset_role = 'card'
      and pp.profile_media_slot = 'live_selfie'
      and pp.capture_origin = 'live_camera'
      and pp.is_profile_media_visible
      and pp.live_capture_completed_at is not null
      and pp.status in ('pending', 'verified')
  );
$$;

revoke all on function public.profile_has_visible_live_selfie(uuid) from public, anon, authenticated;

create or replace function public.assign_prepared_profile_media(
  p_preparation_id uuid,
  p_profile_media_slot text,
  p_capture_origin text,
  p_previous_primary_preparation_id uuid default null,
  p_make_primary boolean default false,
  p_capture_proof_version text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_card_id uuid;
  v_restore_id uuid;
  v_slot text := nullif(trim(coalesce(p_profile_media_slot, '')), '');
  v_origin text := nullif(trim(coalesce(p_capture_origin, '')), '');
  v_proof text := nullif(trim(coalesce(p_capture_proof_version, '')), '');
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if p_preparation_id is null then raise exception 'preparation id required'; end if;
  if v_slot not in ('live_selfie', 'profile_photo_1', 'profile_photo_2') then
    raise exception 'supported profile media slot required';
  end if;
  if v_slot = 'live_selfie' then
    if v_origin <> 'live_camera' then raise exception 'live selfie requires live camera capture'; end if;
    if v_proof <> 'blink-turn-v1' then raise exception 'supported live capture proof required'; end if;
  elsif v_origin not in ('camera', 'gallery') then
    raise exception 'profile photo requires camera or gallery origin';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 17));

  select id into v_card_id
  from public.privacy_portraits
  where user_id = v_user_id
    and preparation_id = p_preparation_id
    and asset_role = 'card'
    and status in ('pending', 'verified')
  limit 1;
  if v_card_id is null then raise exception 'prepared card not found'; end if;

  if p_previous_primary_preparation_id is not null then
    select id into v_restore_id
    from public.privacy_portraits
    where user_id = v_user_id
      and preparation_id = p_previous_primary_preparation_id
      and asset_role = 'card'
      and is_profile_media_visible
    limit 1;
  end if;

  -- Replacing a slot removes the former card from the visible profile without
  -- deleting its private source objects. Retention/deletion remains a separate policy.
  update public.privacy_portraits
  set is_profile_media_visible = false,
      is_public_profile_portrait = false,
      updated_at = timezone('utc', now())
  where user_id = v_user_id
    and asset_role = 'card'
    and profile_media_slot = v_slot
    and preparation_id <> p_preparation_id
    and is_profile_media_visible;

  update public.privacy_portraits
  set profile_media_slot = v_slot,
      capture_origin = v_origin,
      is_profile_media_visible = asset_role = 'card',
      live_capture_completed_at = case
        when v_slot = 'live_selfie' then coalesce(live_capture_completed_at, timezone('utc', now()))
        else null
      end,
      capture_proof_version = case when v_slot = 'live_selfie' then v_proof else null end,
      updated_at = timezone('utc', now())
  where user_id = v_user_id
    and preparation_id = p_preparation_id;

  if p_make_primary then
    update public.privacy_portraits
    set is_public_profile_portrait = (id = v_card_id),
        updated_at = timezone('utc', now())
    where user_id = v_user_id
      and asset_role = 'card'
      and is_public_profile_portrait;
    update public.privacy_portraits
    set is_public_profile_portrait = true,
        updated_at = timezone('utc', now())
    where id = v_card_id;
  elsif v_restore_id is not null
        and exists (select 1 from public.privacy_portraits where id = v_restore_id and is_profile_media_visible) then
    update public.privacy_portraits
    set is_public_profile_portrait = false,
        updated_at = timezone('utc', now())
    where id = v_card_id;
    update public.privacy_portraits
    set is_public_profile_portrait = true,
        updated_at = timezone('utc', now())
    where id = v_restore_id;
  end if;

  -- WP-074's legacy upload path marks portrait progress after every preparation.
  -- WP-075 corrects that state: the portrait stage is complete only after a live selfie exists.
  update public.onboarding_progress
  set completed_stages = case
        when public.profile_has_visible_live_selfie(v_user_id)
          then case when 'portrait' = any(completed_stages) then completed_stages else array_append(completed_stages, 'portrait') end
        else array_remove(completed_stages, 'portrait')
      end,
      last_saved_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where user_id = v_user_id;

  insert into public.audit_events (
    actor_user_id, actor_type, event_type, subject_user_id, entity_type, entity_id, payload
  ) values (
    v_user_id,
    'user',
    case when v_slot = 'live_selfie' then 'live_selfie_prepared' else 'profile_media_prepared' end,
    v_user_id,
    'profile_media',
    p_preparation_id::text,
    jsonb_build_object(
      'profile_media_slot', v_slot,
      'capture_origin', v_origin,
      'capture_proof_version', v_proof,
      'public_asset_role', 'card',
      'raw_or_challenge_media_public', false,
      'legal_identity_verified', false
    )
  );

  return v_card_id;
end;
$$;

revoke all on function public.assign_prepared_profile_media(uuid, text, text, uuid, boolean, text) from public, anon;
grant execute on function public.assign_prepared_profile_media(uuid, text, text, uuid, boolean, text) to authenticated;

create or replace function public.set_primary_profile_media(p_preparation_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_card_id uuid;
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  select id into v_card_id
  from public.privacy_portraits
  where user_id = v_user_id
    and preparation_id = p_preparation_id
    and asset_role = 'card'
    and is_profile_media_visible
    and status in ('pending', 'verified')
  limit 1;
  if v_card_id is null then raise exception 'visible profile media not found'; end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 17));
  update public.privacy_portraits
  set is_public_profile_portrait = false,
      updated_at = timezone('utc', now())
  where user_id = v_user_id and is_public_profile_portrait;
  update public.privacy_portraits
  set is_public_profile_portrait = true,
      updated_at = timezone('utc', now())
  where id = v_card_id;

  insert into public.audit_events (actor_user_id, actor_type, event_type, subject_user_id, entity_type, entity_id)
  values (v_user_id, 'user', 'profile_media_primary_selected', v_user_id, 'privacy_portrait_preparation', p_preparation_id::text);
  return v_card_id;
end;
$$;

revoke all on function public.set_primary_profile_media(uuid) from public, anon;
grant execute on function public.set_primary_profile_media(uuid) to authenticated;

create or replace function public.remove_optional_profile_media(p_profile_media_slot text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_slot text := nullif(trim(coalesce(p_profile_media_slot, '')), '');
  v_removed_primary boolean := false;
  v_replacement_id uuid;
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if v_slot not in ('profile_photo_1', 'profile_photo_2') then
    raise exception 'only optional profile photos can be removed';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 17));

  select coalesce(bool_or(is_public_profile_portrait), false) into v_removed_primary
  from public.privacy_portraits
  where user_id = v_user_id and asset_role = 'card' and profile_media_slot = v_slot and is_profile_media_visible;

  update public.privacy_portraits
  set is_profile_media_visible = false,
      is_public_profile_portrait = false,
      updated_at = timezone('utc', now())
  where user_id = v_user_id and asset_role = 'card' and profile_media_slot = v_slot and is_profile_media_visible;

  if v_removed_primary then
    select id into v_replacement_id
    from public.privacy_portraits
    where user_id = v_user_id
      and asset_role = 'card'
      and is_profile_media_visible
      and status in ('pending', 'verified')
    order by case profile_media_slot when 'profile_photo_1' then 1 when 'live_selfie' then 2 else 3 end,
             updated_at desc
    limit 1;
    if v_replacement_id is not null then
      update public.privacy_portraits set is_public_profile_portrait = true, updated_at = timezone('utc', now())
      where id = v_replacement_id;
    end if;
  end if;

  insert into public.audit_events (actor_user_id, actor_type, event_type, subject_user_id, entity_type, entity_id, payload)
  values (v_user_id, 'user', 'optional_profile_media_removed', v_user_id, 'profile_media_slot', v_slot,
          jsonb_build_object('storage_objects_deleted', false, 'raw_or_challenge_media_public', false));
  return true;
end;
$$;

revoke all on function public.remove_optional_profile_media(text) from public, anon;
grant execute on function public.remove_optional_profile_media(text) to authenticated;

create or replace function public.get_own_profile_media()
returns table (
  preparation_id uuid,
  profile_media_slot text,
  capture_origin text,
  privacy_filter_id text,
  object_path text,
  is_primary boolean,
  live_capture_completed_at timestamptz,
  capture_proof_version text
)
language sql
stable
security definer
set search_path = public
as $$
  select pp.preparation_id, pp.profile_media_slot, pp.capture_origin, pp.privacy_filter_id,
         pp.object_path, pp.is_public_profile_portrait, pp.live_capture_completed_at, pp.capture_proof_version
  from public.privacy_portraits pp
  where pp.user_id = auth.uid()
    and pp.asset_role = 'card'
    and pp.is_profile_media_visible
    and pp.profile_media_slot is not null
    and pp.status in ('pending', 'verified')
  order by case pp.profile_media_slot when 'live_selfie' then 1 when 'profile_photo_1' then 2 else 3 end;
$$;

revoke all on function public.get_own_profile_media() from public, anon;
grant execute on function public.get_own_profile_media() to authenticated;

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
begin
  if v_actor is null or p_other_user_id is null or p_other_user_id = v_actor then return; end if;
  if not exists (
    select 1 from public.profiles p
    where p.user_id = p_other_user_id and p.publication_status = 'published'
  ) then return; end if;
  if exists (
    select 1 from public.blocks b
    where (b.blocker_user_id = v_actor and b.blocked_user_id = p_other_user_id)
       or (b.blocker_user_id = p_other_user_id and b.blocked_user_id = v_actor)
  ) then return; end if;

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

revoke all on function public.get_discovery_profile_media(uuid) from public, anon;
grant execute on function public.get_discovery_profile_media(uuid) to authenticated;

create or replace function public.get_discovery_portrait_path(p_other_user_id uuid)
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
  if v_actor is null or p_other_user_id is null or p_other_user_id = v_actor then return null; end if;
  if not exists (select 1 from public.profiles p where p.user_id = p_other_user_id and p.publication_status = 'published') then return null; end if;
  if exists (
    select 1 from public.blocks b
    where (b.blocker_user_id = v_actor and b.blocked_user_id = p_other_user_id)
       or (b.blocker_user_id = p_other_user_id and b.blocked_user_id = v_actor)
  ) then return null; end if;

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

revoke all on function public.get_discovery_portrait_path(uuid) from public, anon;
grant execute on function public.get_discovery_portrait_path(uuid) to authenticated;

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
      and p.publication_status = 'published'
      and not exists (
        select 1 from public.blocks b
        where (b.blocker_user_id = v_actor and b.blocked_user_id = pp.user_id)
           or (b.blocker_user_id = pp.user_id and b.blocked_user_id = v_actor)
      )
  );
end;
$$;

revoke all on function public.can_read_discovery_portrait_object(text) from public, anon;
grant execute on function public.can_read_discovery_portrait_object(text) to authenticated;

-- Publishing through either the RPC or a direct profile update requires the live-camera slot.
create or replace function public.enforce_live_selfie_before_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.publication_status = 'published'
     and old.publication_status is distinct from 'published'
     and not public.profile_has_visible_live_selfie(new.user_id) then
    raise exception 'live selfie required before publication';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_require_live_selfie_before_publish on public.profiles;
create trigger profiles_require_live_selfie_before_publish
before update of publication_status on public.profiles
for each row execute function public.enforce_live_selfie_before_publish();

create or replace function public.publish_profile()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if not public.profile_publication_requirements_met(v_user_id) then
    raise exception 'profile publication requirements not met';
  end if;
  if not public.profile_has_visible_live_selfie(v_user_id) then
    raise exception 'live selfie required before publication';
  end if;

  update public.profiles
  set publication_status = 'published',
      profile_completed_at = coalesce(profile_completed_at, timezone('utc', now())),
      published_at = coalesce(published_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
  where user_id = v_user_id;

  insert into public.onboarding_progress (user_id, current_stage, completed_stages, last_saved_at)
  values (
    v_user_id,
    'complete',
    array['eligibility', 'account', 'identity', 'life_stage', 'family', 'portrait', 'faith', 'personality', 'preview', 'promise'],
    timezone('utc', now())
  )
  on conflict (user_id) do update set
    current_stage = 'complete', completed_stages = excluded.completed_stages,
    last_saved_at = timezone('utc', now()), updated_at = timezone('utc', now());

  insert into public.audit_events (actor_user_id, actor_type, event_type, entity_type, entity_id, payload)
  values (v_user_id, 'user', 'profile_published', 'profile', v_user_id::text,
          jsonb_build_object('live_selfie_present', true, 'legal_identity_verified', false));
  return v_user_id;
end;
$$;

revoke all on function public.publish_profile() from public, anon;
grant execute on function public.publish_profile() to authenticated;
