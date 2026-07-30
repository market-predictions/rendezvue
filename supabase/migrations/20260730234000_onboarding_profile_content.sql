-- Persist resumable onboarding and the profile content required for publication.

create table if not exists public.onboarding_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version integer not null default 1 check (schema_version > 0),
  current_stage text not null default 'eligibility' check (
    current_stage in (
      'eligibility', 'account', 'identity', 'life_stage', 'family',
      'portrait', 'faith', 'personality', 'preview', 'promise', 'complete'
    )
  ),
  completed_stages text[] not null default '{}',
  last_saved_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profile_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_key text not null,
  response text not null,
  position smallint not null check (position between 1 and 3),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, prompt_key),
  unique (user_id, position),
  constraint profile_prompt_key_length check (char_length(prompt_key) between 1 and 100),
  constraint profile_prompt_response_length check (char_length(response) between 1 and 600)
);

create table if not exists public.profile_interests (
  user_id uuid not null references auth.users(id) on delete cascade,
  interest_key text not null,
  position smallint not null check (position between 1 and 12),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, interest_key),
  unique (user_id, position),
  constraint profile_interest_key_length check (char_length(interest_key) between 1 and 80)
);

create trigger onboarding_progress_touch_updated_at
before update on public.onboarding_progress
for each row execute function public.touch_updated_at();

create trigger profile_prompts_touch_updated_at
before update on public.profile_prompts
for each row execute function public.touch_updated_at();

create or replace function public.profile_publication_requirements_met(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    p_user_id is not null
    and exists (
      select 1 from public.profiles p
      where p.user_id = p_user_id
        and nullif(trim(p.nickname), '') is not null
        and p.sex is not null
        and nullif(trim(p.city_region), '') is not null
        and nullif(trim(p.relationship_intent), '') is not null
    )
    and exists (
      select 1 from public.eligibility e
      where e.user_id = p_user_id
        and e.current_relationship_state = 'single'
        and e.adult_confirmed
        and e.serious_intent_confirmed
        and e.community_fit_confirmed
    )
    and exists (select 1 from public.family_contexts f where f.user_id = p_user_id)
    and exists (
      select 1 from public.privacy_portraits pp
      where pp.user_id = p_user_id
        and pp.is_public_profile_portrait
        and pp.status in ('pending', 'verified')
    )
    and (select count(*) from public.profile_prompts pp where pp.user_id = p_user_id) >= 2
    and (select count(*) from public.profile_interests pi where pi.user_id = p_user_id) >= 3;
$$;

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and (
    publication_status <> 'published'
    or public.profile_publication_requirements_met(auth.uid())
  )
);

alter table public.onboarding_progress enable row level security;
alter table public.profile_prompts enable row level security;
alter table public.profile_interests enable row level security;

create policy onboarding_progress_self on public.onboarding_progress for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy profile_prompts_self on public.profile_prompts for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy profile_interests_self on public.profile_interests for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update, delete on public.onboarding_progress to authenticated;
grant select, insert, update, delete on public.profile_prompts to authenticated;
grant select, insert, update, delete on public.profile_interests to authenticated;

revoke all on function public.profile_publication_requirements_met(uuid) from public, anon;
grant execute on function public.profile_publication_requirements_met(uuid) to authenticated;
