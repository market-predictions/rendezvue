-- Prevent profile creation from bypassing the publication gate and keep a
-- selected portrait attached while a profile is published.

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for insert to authenticated
with check (
  user_id = auth.uid()
  and publication_status = 'draft'
);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and (
    publication_status <> 'published'
    or (
      nullif(trim(nickname), '') is not null
      and sex is not null
      and nullif(trim(city_region), '') is not null
      and nullif(trim(relationship_intent), '') is not null
      and exists (
        select 1 from public.eligibility e
        where e.user_id = auth.uid()
          and e.current_relationship_state = 'single'
          and e.adult_confirmed
          and e.serious_intent_confirmed
          and e.community_fit_confirmed
      )
      and exists (select 1 from public.family_contexts f where f.user_id = auth.uid())
      and exists (
        select 1 from public.privacy_portraits pp
        where pp.user_id = auth.uid()
          and pp.is_public_profile_portrait
          and pp.status in ('pending', 'verified')
      )
    )
  )
);

drop policy if exists privacy_portraits_delete_self on public.privacy_portraits;
create policy privacy_portraits_delete_self on public.privacy_portraits for delete to authenticated
using (
  user_id = auth.uid()
  and (
    not is_public_profile_portrait
    or not exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
        and p.publication_status = 'published'
    )
  )
);
