-- WP-070C compatibility follow-up.
--
-- The discovery profile RLS and attraction RPC use can_discover_profile(), which
-- includes the full eligibility contract. The existing portrait/media helpers
-- intentionally had a narrower contract: published + unblocked + selected/visible
-- media. Preserve that established helper behavior and add only the WP-070C
-- discovery-restriction overlay so synthetic fixture and media contracts do not
-- silently inherit new eligibility requirements.

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
  if public.has_active_moderation_restriction(v_actor, 'restrict_discovery')
     or public.has_active_moderation_restriction(p_other_user_id, 'restrict_discovery') then
    return;
  end if;
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
  if public.has_active_moderation_restriction(v_actor, 'restrict_discovery')
     or public.has_active_moderation_restriction(p_other_user_id, 'restrict_discovery') then
    return null;
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.user_id = p_other_user_id and p.publication_status = 'published'
  ) then return null; end if;
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
  if public.has_active_moderation_restriction(v_actor, 'restrict_discovery') then return false; end if;

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
      and not public.has_active_moderation_restriction(pp.user_id, 'restrict_discovery')
      and not exists (
        select 1 from public.blocks b
        where (b.blocker_user_id = v_actor and b.blocked_user_id = pp.user_id)
           or (b.blocker_user_id = pp.user_id and b.blocked_user_id = v_actor)
      )
  );
end;
$$;

revoke all on function public.get_discovery_profile_media(uuid) from public, anon;
grant execute on function public.get_discovery_profile_media(uuid) to authenticated;
revoke all on function public.get_discovery_portrait_path(uuid) from public, anon;
grant execute on function public.get_discovery_portrait_path(uuid) to authenticated;
revoke all on function public.can_read_discovery_portrait_object(text) from public, anon;
grant execute on function public.can_read_discovery_portrait_object(text) to authenticated;
