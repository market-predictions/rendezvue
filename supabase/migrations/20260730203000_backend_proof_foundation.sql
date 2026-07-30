-- Rendezvue backend proof foundation.
-- This migration is intentionally fail-closed: private profile domains are not
-- readable by other users until dedicated discovery projections are approved.

create extension if not exists pgcrypto;

-- Enum creation is wrapped so local reset and linked environments remain idempotent.
do $$ begin create type public.sex_type as enum ('woman', 'man'); exception when duplicate_object then null; end $$;
do $$ begin create type public.relationship_state as enum ('single', 'relationship', 'engaged', 'married', 'separated'); exception when duplicate_object then null; end $$;
do $$ begin create type public.marital_history_type as enum ('never_married', 'divorced', 'widowed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.life_stage_type as enum ('student', 'recent_graduate', 'employed', 'self_employed', 'job_seeking', 'other', 'private'); exception when duplicate_object then null; end $$;
do $$ begin create type public.publication_state as enum ('draft', 'review', 'published', 'paused', 'suspended'); exception when duplicate_object then null; end $$;
do $$ begin create type public.verification_state as enum ('not_started', 'pending', 'verified', 'expired', 'rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type public.attraction_signal_type as enum ('pass', 'like', 'contextual_like'); exception when duplicate_object then null; end $$;
do $$ begin create type public.match_state as enum ('active', 'ended', 'blocked'); exception when duplicate_object then null; end $$;
do $$ begin create type public.entitlement_state as enum ('available', 'reserved', 'consumed', 'expired', 'revoked'); exception when duplicate_object then null; end $$;
do $$ begin create type public.conversation_state as enum ('open', 'ended', 'blocked'); exception when duplicate_object then null; end $$;
do $$ begin create type public.report_severity as enum ('low', 'medium', 'high', 'critical'); exception when duplicate_object then null; end $$;
do $$ begin create type public.moderation_state as enum ('open', 'triage', 'investigating', 'actioned', 'dismissed', 'appealed', 'closed'); exception when duplicate_object then null; end $$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default '',
  sex public.sex_type,
  city_region text not null default '',
  language text not null default 'nl' check (language in ('nl', 'en')),
  relationship_intent text,
  bio text,
  publication_status public.publication_state not null default 'draft',
  profile_completed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_nickname_length check (char_length(nickname) <= 80),
  constraint profiles_city_length check (char_length(city_region) <= 120),
  constraint profiles_bio_length check (bio is null or char_length(bio) <= 1200)
);

create table if not exists public.eligibility (
  user_id uuid primary key references auth.users(id) on delete cascade,
  date_of_birth date,
  current_relationship_state public.relationship_state,
  adult_confirmed boolean not null default false,
  serious_intent_confirmed boolean not null default false,
  community_fit_confirmed boolean not null default false,
  terms_version text,
  confirmed_at timestamptz,
  reconfirm_after timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.life_stages (
  user_id uuid primary key references auth.users(id) on delete cascade,
  primary_status public.life_stage_type not null default 'private',
  education_level text,
  institution_id text,
  study_field text,
  graduation_year smallint,
  occupation_category text,
  institution_visible boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint life_stages_graduation_year check (graduation_year is null or graduation_year between 1950 and 2200)
);

create table if not exists public.family_contexts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  marital_history public.marital_history_type,
  has_children boolean,
  child_count_band text check (child_count_band is null or child_count_band in ('one', 'two', 'three_plus', 'private')),
  wants_children text check (wants_children is null or wants_children in ('yes', 'no', 'maybe', 'unsure', 'open_to_more')),
  accepts_partner_with_children text check (accepts_partner_with_children is null or accepts_partner_with_children in ('yes', 'maybe', 'no')),
  marital_history_visibility text not null default 'public' check (marital_history_visibility in ('public', 'after_match', 'private')),
  children_visibility text not null default 'public' check (children_visibility in ('public', 'after_match', 'private')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.faith_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  faith_identity text,
  practice_description text,
  compatibility_importance text,
  lifestyle_tags text[] not null default '{}',
  practice_visibility text not null default 'private' check (practice_visibility in ('public', 'after_match', 'private')),
  consent_version text,
  consented_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.student_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution_id text not null,
  verification_method text not null,
  status public.verification_state not null default 'not_started',
  verified_at timestamptz,
  expires_at timestamptz,
  evidence_reference text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, institution_id, verification_method)
);

create table if not exists public.privacy_portraits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  object_path text not null,
  treatment text not null,
  status public.verification_state not null default 'pending',
  is_public_profile_portrait boolean not null default false,
  source_retained_until timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, object_path)
);

create table if not exists public.attraction_signals (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  signal_type public.attraction_signal_type not null,
  profile_component text,
  opening_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  revoked_at timestamptz,
  unique (actor_user_id, target_user_id),
  constraint attraction_signal_not_self check (actor_user_id <> target_user_id),
  constraint contextual_like_requires_context check (
    signal_type <> 'contextual_like' or profile_component is not null
  ),
  constraint attraction_opening_message_length check (opening_message is null or char_length(opening_message) <= 500)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references auth.users(id) on delete cascade,
  user_b_id uuid not null references auth.users(id) on delete cascade,
  status public.match_state not null default 'active',
  matched_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_a_id, user_b_id),
  constraint match_ordered_users check (user_a_id < user_b_id)
);

create table if not exists public.contact_entitlements (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null check (source_type in ('pilot', 'subscription', 'single_purchase', 'promotion', 'support')),
  status public.entitlement_state not null default 'available',
  valid_from timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  consumed_match_id uuid references public.matches(id) on delete set null,
  consumed_at timestamptz,
  idempotency_key text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (owner_user_id, idempotency_key)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches(id) on delete cascade,
  opened_by_user_id uuid not null references auth.users(id) on delete restrict,
  status public.conversation_state not null default 'open',
  opened_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  edited_at timestamptz,
  deleted_at timestamptz,
  constraint messages_body_length check (char_length(body) between 1 and 4000)
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_user_id uuid not null references auth.users(id) on delete cascade,
  blocked_user_id uuid not null references auth.users(id) on delete cascade,
  reason_code text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (blocker_user_id, blocked_user_id),
  constraint block_not_self check (blocker_user_id <> blocked_user_id)
);

create table if not exists public.interaction_feedback (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  reviewer_user_id uuid not null references auth.users(id) on delete cascade,
  subject_user_id uuid not null references auth.users(id) on delete cascade,
  interaction_depth text not null check (interaction_depth in ('matched', 'messaged', 'extended_chat', 'call', 'offline_meeting')),
  positive_tags text[] not null default '{}',
  concern_tags text[] not null default '{}',
  optional_comment text,
  credibility_weight numeric(5,4) not null default 0.5000 check (credibility_weight between 0 and 1),
  created_at timestamptz not null default timezone('utc', now()),
  unique (match_id, reviewer_user_id),
  constraint feedback_not_self check (reviewer_user_id <> subject_user_id),
  constraint feedback_comment_length check (optional_comment is null or char_length(optional_comment) <= 2000)
);

create table if not exists public.safety_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  subject_user_id uuid not null references auth.users(id) on delete cascade,
  match_id uuid references public.matches(id) on delete set null,
  category text not null,
  description text,
  severity public.report_severity not null default 'medium',
  status public.moderation_state not null default 'open',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint report_not_self check (reporter_user_id <> subject_user_id),
  constraint report_description_length check (description is null or char_length(description) <= 4000)
);

create table if not exists public.moderation_cases (
  id uuid primary key default gen_random_uuid(),
  subject_user_id uuid not null references auth.users(id) on delete cascade,
  source_report_id uuid references public.safety_reports(id) on delete set null,
  status public.moderation_state not null default 'triage',
  priority smallint not null default 3 check (priority between 1 and 5),
  assigned_to uuid,
  decision_code text,
  decision_reason text,
  appeal_deadline timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_events (
  id bigint generated by default as identity primary key,
  actor_user_id uuid,
  actor_type text not null check (actor_type in ('user', 'moderator', 'service', 'system')),
  event_type text not null,
  subject_user_id uuid,
  entity_type text,
  entity_id text,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_publication_city_idx on public.profiles (publication_status, city_region);
create index if not exists attraction_target_idx on public.attraction_signals (target_user_id, signal_type) where revoked_at is null;
create index if not exists matches_user_a_idx on public.matches (user_a_id, status);
create index if not exists matches_user_b_idx on public.matches (user_b_id, status);
create index if not exists messages_conversation_created_idx on public.messages (conversation_id, created_at);
create index if not exists reports_subject_status_idx on public.safety_reports (subject_user_id, status, created_at);
create index if not exists audit_subject_time_idx on public.audit_events (subject_user_id, occurred_at desc);

create trigger profiles_touch_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
create trigger eligibility_touch_updated_at before update on public.eligibility for each row execute function public.touch_updated_at();
create trigger life_stages_touch_updated_at before update on public.life_stages for each row execute function public.touch_updated_at();
create trigger family_contexts_touch_updated_at before update on public.family_contexts for each row execute function public.touch_updated_at();
create trigger faith_profiles_touch_updated_at before update on public.faith_profiles for each row execute function public.touch_updated_at();
create trigger student_verifications_touch_updated_at before update on public.student_verifications for each row execute function public.touch_updated_at();
create trigger privacy_portraits_touch_updated_at before update on public.privacy_portraits for each row execute function public.touch_updated_at();
create trigger attraction_signals_touch_updated_at before update on public.attraction_signals for each row execute function public.touch_updated_at();
create trigger matches_touch_updated_at before update on public.matches for each row execute function public.touch_updated_at();
create trigger contact_entitlements_touch_updated_at before update on public.contact_entitlements for each row execute function public.touch_updated_at();
create trigger conversations_touch_updated_at before update on public.conversations for each row execute function public.touch_updated_at();
create trigger reports_touch_updated_at before update on public.safety_reports for each row execute function public.touch_updated_at();
create trigger moderation_cases_touch_updated_at before update on public.moderation_cases for each row execute function public.touch_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nickname', ''))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.is_match_participant(p_match_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.matches m
    where m.id = p_match_id
      and p_user_id in (m.user_a_id, m.user_b_id)
  );
$$;

create or replace function public.is_conversation_participant(p_conversation_id uuid, p_user_id uuid)
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
      and p_user_id in (m.user_a_id, m.user_b_id)
  );
$$;

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
  v_signal_id uuid;
  v_match_id uuid;
  v_user_a uuid;
  v_user_b uuid;
begin
  if v_actor is null then raise exception 'authentication required'; end if;
  if p_target_user_id is null or p_target_user_id = v_actor then raise exception 'invalid target'; end if;
  if not exists (
    select 1 from public.profiles p
    where p.user_id = p_target_user_id and p.publication_status = 'published'
  ) then raise exception 'target is not discoverable'; end if;
  if exists (
    select 1 from public.blocks b
    where (b.blocker_user_id = v_actor and b.blocked_user_id = p_target_user_id)
       or (b.blocker_user_id = p_target_user_id and b.blocked_user_id = v_actor)
  ) then raise exception 'interaction unavailable'; end if;

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
    v_user_a := least(v_actor, p_target_user_id);
    v_user_b := greatest(v_actor, p_target_user_id);
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
  v_conversation_id uuid;
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

  select id into v_conversation_id from public.conversations where match_id = p_match_id;
  if v_conversation_id is not null then return v_conversation_id; end if;

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
  returning id into v_conversation_id;

  update public.contact_entitlements
  set status = 'consumed', consumed_match_id = p_match_id,
      consumed_at = timezone('utc', now()), idempotency_key = p_idempotency_key
  where id = v_entitlement_id;

  insert into public.audit_events (actor_user_id, actor_type, event_type, entity_type, entity_id)
  values (v_actor, 'user', 'conversation_opened', 'conversation', v_conversation_id::text);

  return v_conversation_id;
end;
$$;

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
  case when ls.institution_visible then ls.institution_id else null end as institution_id
from public.profiles p
left join public.life_stages ls on ls.user_id = p.user_id
where p.publication_status = 'published';

-- Storage is private; a user can only access files inside their UUID prefix.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('privacy-portraits', 'privacy-portraits', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

alter table public.profiles enable row level security;
alter table public.eligibility enable row level security;
alter table public.life_stages enable row level security;
alter table public.family_contexts enable row level security;
alter table public.faith_profiles enable row level security;
alter table public.student_verifications enable row level security;
alter table public.privacy_portraits enable row level security;
alter table public.attraction_signals enable row level security;
alter table public.matches enable row level security;
alter table public.contact_entitlements enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.blocks enable row level security;
alter table public.interaction_feedback enable row level security;
alter table public.safety_reports enable row level security;
alter table public.moderation_cases enable row level security;
alter table public.audit_events enable row level security;

create policy profiles_read_discoverable on public.profiles for select to authenticated
using (
  user_id = auth.uid()
  or (
    publication_status = 'published'
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_user_id = auth.uid() and b.blocked_user_id = profiles.user_id)
         or (b.blocker_user_id = profiles.user_id and b.blocked_user_id = auth.uid())
    )
  )
);
create policy profiles_insert_self on public.profiles for insert to authenticated with check (user_id = auth.uid());
create policy profiles_update_self on public.profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy eligibility_self on public.eligibility for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy life_stages_self on public.life_stages for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy family_contexts_self on public.family_contexts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy faith_profiles_self on public.faith_profiles for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy student_verifications_self on public.student_verifications for select to authenticated using (user_id = auth.uid());
create policy privacy_portraits_self on public.privacy_portraits for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy attraction_signals_read_own on public.attraction_signals for select to authenticated using (actor_user_id = auth.uid());
create policy matches_participants_read on public.matches for select to authenticated using (auth.uid() in (user_a_id, user_b_id));
create policy entitlements_owner_read on public.contact_entitlements for select to authenticated using (owner_user_id = auth.uid());
create policy conversations_participants_read on public.conversations for select to authenticated using (public.is_match_participant(match_id, auth.uid()));
create policy messages_participants_read on public.messages for select to authenticated using (public.is_conversation_participant(conversation_id, auth.uid()));
create policy messages_participants_insert on public.messages for insert to authenticated with check (
  sender_user_id = auth.uid()
  and public.is_conversation_participant(conversation_id, auth.uid())
  and exists (select 1 from public.conversations c where c.id = conversation_id and c.status = 'open')
);

create policy blocks_owner_read on public.blocks for select to authenticated using (blocker_user_id = auth.uid());
create policy blocks_owner_insert on public.blocks for insert to authenticated with check (blocker_user_id = auth.uid());
create policy blocks_owner_delete on public.blocks for delete to authenticated using (blocker_user_id = auth.uid());

create policy feedback_reviewer_read on public.interaction_feedback for select to authenticated using (reviewer_user_id = auth.uid());
create policy feedback_reviewer_insert on public.interaction_feedback for insert to authenticated with check (
  reviewer_user_id = auth.uid()
  and public.is_match_participant(match_id, auth.uid())
);
create policy reports_reporter_read on public.safety_reports for select to authenticated using (reporter_user_id = auth.uid());
create policy reports_reporter_insert on public.safety_reports for insert to authenticated with check (reporter_user_id = auth.uid());

create policy portrait_objects_read_self on storage.objects for select to authenticated
using (bucket_id = 'privacy-portraits' and (storage.foldername(name))[1] = auth.uid()::text);
create policy portrait_objects_insert_self on storage.objects for insert to authenticated
with check (bucket_id = 'privacy-portraits' and (storage.foldername(name))[1] = auth.uid()::text);
create policy portrait_objects_update_self on storage.objects for update to authenticated
using (bucket_id = 'privacy-portraits' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'privacy-portraits' and (storage.foldername(name))[1] = auth.uid()::text);
create policy portrait_objects_delete_self on storage.objects for delete to authenticated
using (bucket_id = 'privacy-portraits' and (storage.foldername(name))[1] = auth.uid()::text);

grant select on public.discovery_profiles to authenticated;
grant execute on function public.record_attraction_signal(uuid, public.attraction_signal_type, text, text) to authenticated;
grant execute on function public.open_match_conversation(uuid, text) to authenticated;
revoke all on public.moderation_cases from anon, authenticated;
revoke all on public.audit_events from anon, authenticated;

-- Realtime sends records only to clients that pass table RLS.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then alter publication supabase_realtime add table public.messages; end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'matches'
  ) then alter publication supabase_realtime add table public.matches; end if;
end $$;
