-- WP-074B: allow authenticated discovery to read only the exact selected prepared card
-- of another published, unblocked profile. Source and non-selected derivatives remain private.

create or replace function public.get_discovery_portrait_path(
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
  if v_actor is null or p_other_user_id is null or p_other_user_id = v_actor then
    return null;
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.user_id = p_other_user_id
      and p.publication_status = 'published'
  ) then
    return null;
  end if;
  if exists (
    select 1 from public.blocks b
    where (b.blocker_user_id = v_actor and b.blocked_user_id = p_other_user_id)
       or (b.blocker_user_id = p_other_user_id and b.blocked_user_id = v_actor)
  ) then
    return null;
  end if;

  select pp.object_path into v_path
  from public.privacy_portraits pp
  where pp.user_id = p_other_user_id
    and pp.asset_role = 'card'
    and pp.is_public_profile_portrait
    and pp.status in ('pending', 'verified')
  order by pp.updated_at desc, pp.created_at desc, pp.id desc
  limit 1;
  return v_path;
end;
$$;

revoke all on function public.get_discovery_portrait_path(uuid) from public, anon;
grant execute on function public.get_discovery_portrait_path(uuid) to authenticated;

create or replace function public.can_read_discovery_portrait_object(
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
  if v_actor is null or p_object_name is null or btrim(p_object_name) = '' then
    return false;
  end if;

  return exists (
    select 1
    from public.privacy_portraits pp
    join public.profiles p on p.user_id = pp.user_id
    where pp.object_path = p_object_name
      and pp.user_id <> v_actor
      and pp.asset_role = 'card'
      and pp.is_public_profile_portrait
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

drop policy if exists portrait_objects_read_discovery on storage.objects;
create policy portrait_objects_read_discovery
on storage.objects
for select
to authenticated
using (
  bucket_id = 'privacy-portraits'
  and public.can_read_discovery_portrait_object(name)
);
