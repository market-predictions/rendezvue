-- First-class support for clearly marked, fully synthetic discovery profiles.
-- Real-user profiles remain subject to the existing privacy and publication rules.

alter table public.profiles
  add column if not exists synthetic_id text,
  add column if not exists is_synthetic boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_synthetic_identity_consistency'
  ) then
    alter table public.profiles
      add constraint profiles_synthetic_identity_consistency check (
        not is_synthetic or nullif(trim(synthetic_id), '') is not null
      );
  end if;
end $$;

create unique index if not exists profiles_synthetic_id_unique_idx
  on public.profiles (synthetic_id)
  where synthetic_id is not null;

create or replace view public.discovery_profiles
with (security_invoker = true)
as
select
  p.user_id,
  p.nickname,
  p.sex,
  p.city_region,
  p.language,
  p.relationship_intent,
  p.bio,
  p.published_at,
  ls.primary_status,
  case when ls.institution_visible then ls.institution_id else null end as institution_id,
  p.is_synthetic,
  p.synthetic_id
from public.profiles p
left join public.life_stages ls on ls.user_id = p.user_id
where p.publication_status = 'published';

grant select on public.discovery_profiles to authenticated;

create or replace function public.get_synthetic_discovery_portrait_path(
  p_target_user_id uuid
)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select pp.object_path
  from public.profiles p
  join public.privacy_portraits pp on pp.user_id = p.user_id
  where p.user_id = p_target_user_id
    and p.is_synthetic
    and pp.is_public_profile_portrait
    and pp.status in ('pending', 'verified')
    and public.can_discover_profile(p.user_id, p.sex)
  order by pp.created_at desc
  limit 1;
$$;

create or replace function public.can_read_synthetic_portrait(
  p_object_path text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.privacy_portraits pp
    join public.profiles p on p.user_id = pp.user_id
    where pp.object_path = p_object_path
      and p.is_synthetic
      and pp.is_public_profile_portrait
      and pp.status in ('pending', 'verified')
      and public.can_discover_profile(p.user_id, p.sex)
  );
$$;

revoke all on function public.get_synthetic_discovery_portrait_path(uuid) from public, anon;
revoke all on function public.can_read_synthetic_portrait(text) from public, anon;
grant execute on function public.get_synthetic_discovery_portrait_path(uuid) to authenticated;
grant execute on function public.can_read_synthetic_portrait(text) to authenticated;

-- Only selected portraits belonging to discoverable synthetic profiles receive
-- pre-match read access. Real-user portrait access remains match-gated.
drop policy if exists portrait_objects_read_synthetic_discovery on storage.objects;
create policy portrait_objects_read_synthetic_discovery
on storage.objects for select to authenticated
using (
  bucket_id = 'privacy-portraits'
  and public.can_read_synthetic_portrait(name)
);
