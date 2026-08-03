-- WP-065B: non-destructive account lifecycle and retention candidate model.
-- No policy is active by default and no function in this migration deletes data.

do $$ begin
  create type public.account_lifecycle_state as enum (
    'active', 'inactive_review', 'retention_hold', 'cleanup_candidate'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.account_retention_policy_state as enum ('draft', 'active', 'retired');
exception when duplicate_object then null; end $$;

create table if not exists public.account_lifecycle (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state public.account_lifecycle_state not null default 'active',
  last_activity_at timestamptz not null default timezone('utc', now()),
  state_reason text,
  state_changed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.account_retention_policies (
  version text primary key,
  status public.account_retention_policy_state not null default 'draft',
  abandoned_draft_after interval not null,
  grace_period interval not null,
  effective_at timestamptz,
  approved_by text,
  approval_reference text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint retention_policy_version_length check (char_length(version) between 1 and 80),
  constraint retention_policy_abandonment_positive check (abandoned_draft_after > interval '0 seconds'),
  constraint retention_policy_grace_nonnegative check (grace_period >= interval '0 seconds'),
  constraint retention_policy_active_requires_approval check (
    status <> 'active'
    or (
      effective_at is not null
      and nullif(trim(approved_by), '') is not null
      and nullif(trim(approval_reference), '') is not null
    )
  )
);

create unique index if not exists account_retention_one_active_policy_idx
on public.account_retention_policies ((status))
where status = 'active';

create table if not exists public.account_retention_holds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reason_code text not null,
  starts_at timestamptz not null default timezone('utc', now()),
  ends_at timestamptz,
  released_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  created_by text not null,
  constraint retention_hold_reason_length check (char_length(reason_code) between 1 and 120),
  constraint retention_hold_creator_length check (char_length(created_by) between 1 and 160),
  constraint retention_hold_end_after_start check (ends_at is null or ends_at > starts_at),
  constraint retention_hold_release_after_start check (released_at is null or released_at >= starts_at)
);

create index if not exists account_retention_holds_user_active_idx
on public.account_retention_holds (user_id, starts_at, ends_at)
where released_at is null;

create trigger account_lifecycle_touch_updated_at
before update on public.account_lifecycle
for each row execute function public.touch_updated_at();

create trigger account_retention_policies_touch_updated_at
before update on public.account_retention_policies
for each row execute function public.touch_updated_at();

create or replace function public.initialize_account_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.account_lifecycle (user_id, last_activity_at)
  values (
    new.id,
    greatest(
      coalesce(new.created_at, timezone('utc', now())),
      coalesce(new.last_sign_in_at, new.created_at, timezone('utc', now()))
    )
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists after_auth_user_lifecycle_insert on auth.users;
create trigger after_auth_user_lifecycle_insert
after insert on auth.users
for each row execute function public.initialize_account_lifecycle();

insert into public.account_lifecycle (user_id, last_activity_at)
select
  u.id,
  greatest(
    coalesce(u.created_at, timezone('utc', now())),
    coalesce(u.last_sign_in_at, u.created_at, timezone('utc', now()))
  )
from auth.users u
on conflict (user_id) do nothing;

create or replace function public.mark_account_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row jsonb;
  v_user_id uuid;
begin
  v_row := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  v_user_id := nullif(v_row ->> tg_argv[0], '')::uuid;
  if v_user_id is null then
    return case when tg_op = 'DELETE' then old else new end;
  end if;

  insert into public.account_lifecycle (
    user_id, state, last_activity_at, state_reason, state_changed_at
  ) values (
    v_user_id, 'active', timezone('utc', now()), 'observed_account_activity', timezone('utc', now())
  )
  on conflict (user_id) do update
  set last_activity_at = greatest(
        public.account_lifecycle.last_activity_at,
        excluded.last_activity_at
      ),
      state = case
        when public.account_lifecycle.state = 'retention_hold'
          then public.account_lifecycle.state
        else 'active'::public.account_lifecycle_state
      end,
      state_reason = case
        when public.account_lifecycle.state = 'retention_hold'
          then public.account_lifecycle.state_reason
        else 'observed_account_activity'
      end,
      state_changed_at = case
        when public.account_lifecycle.state = 'retention_hold'
          then public.account_lifecycle.state_changed_at
        else timezone('utc', now())
      end;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists profiles_mark_account_activity on public.profiles;
create trigger profiles_mark_account_activity
after update on public.profiles
for each row execute function public.mark_account_activity('user_id');

drop trigger if exists onboarding_mark_account_activity on public.onboarding_progress;
create trigger onboarding_mark_account_activity
after insert or update on public.onboarding_progress
for each row execute function public.mark_account_activity('user_id');

drop trigger if exists prompts_mark_account_activity on public.profile_prompts;
create trigger prompts_mark_account_activity
after insert or update or delete on public.profile_prompts
for each row execute function public.mark_account_activity('user_id');

drop trigger if exists interests_mark_account_activity on public.profile_interests;
create trigger interests_mark_account_activity
after insert or update or delete on public.profile_interests
for each row execute function public.mark_account_activity('user_id');

drop trigger if exists portraits_mark_account_activity on public.privacy_portraits;
create trigger portraits_mark_account_activity
after insert or update on public.privacy_portraits
for each row execute function public.mark_account_activity('user_id');

drop trigger if exists attraction_mark_account_activity on public.attraction_signals;
create trigger attraction_mark_account_activity
after insert or update on public.attraction_signals
for each row execute function public.mark_account_activity('actor_user_id');

drop trigger if exists messages_mark_account_activity on public.messages;
create trigger messages_mark_account_activity
after insert on public.messages
for each row execute function public.mark_account_activity('sender_user_id');

create or replace function public.list_account_retention_candidates(
  p_as_of timestamptz default timezone('utc', now())
)
returns table (
  user_id uuid,
  reason_code text,
  policy_version text,
  last_activity_at timestamptz,
  eligible_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with active_policy as (
    select p.version, p.abandoned_draft_after, p.grace_period
    from public.account_retention_policies p
    where p.status = 'active'
      and p.effective_at <= p_as_of
    order by p.effective_at desc
    limit 1
  ), account_activity as (
    select
      lifecycle.user_id,
      lifecycle.state,
      greatest(
        lifecycle.last_activity_at,
        coalesce(users.last_sign_in_at, users.created_at),
        users.created_at
      ) as observed_activity_at
    from public.account_lifecycle lifecycle
    join auth.users users on users.id = lifecycle.user_id
  )
  select
    activity.user_id,
    'abandoned_draft'::text,
    policy.version,
    activity.observed_activity_at,
    activity.observed_activity_at + policy.abandoned_draft_after + policy.grace_period
  from account_activity activity
  cross join active_policy policy
  join public.profiles profile on profile.user_id = activity.user_id
  where activity.state <> 'retention_hold'
    and profile.publication_status = 'draft'
    and activity.observed_activity_at + policy.abandoned_draft_after + policy.grace_period <= p_as_of
    and not exists (
      select 1 from public.account_retention_holds hold
      where hold.user_id = activity.user_id
        and hold.released_at is null
        and hold.starts_at <= p_as_of
        and (hold.ends_at is null or hold.ends_at > p_as_of)
    )
    and not exists (
      select 1 from public.matches match
      where match.status = 'active'
        and (match.user_a_id = activity.user_id or match.user_b_id = activity.user_id)
    )
    and not exists (
      select 1 from public.safety_reports report
      where (report.reporter_user_id = activity.user_id or report.subject_user_id = activity.user_id)
        and report.status not in ('dismissed', 'closed')
    )
    and not exists (
      select 1 from public.moderation_cases moderation
      where moderation.subject_user_id = activity.user_id
        and moderation.status not in ('dismissed', 'closed')
    )
  order by eligible_at, user_id;
$$;

alter table public.account_lifecycle enable row level security;
alter table public.account_retention_policies enable row level security;
alter table public.account_retention_holds enable row level security;

revoke all on public.account_lifecycle from public, anon, authenticated;
revoke all on public.account_retention_policies from public, anon, authenticated;
revoke all on public.account_retention_holds from public, anon, authenticated;
grant select, insert, update, delete on public.account_lifecycle to service_role;
grant select, insert, update, delete on public.account_retention_policies to service_role;
grant select, insert, update, delete on public.account_retention_holds to service_role;

revoke all on function public.initialize_account_lifecycle() from public, anon, authenticated;
revoke all on function public.mark_account_activity() from public, anon, authenticated;
revoke all on function public.list_account_retention_candidates(timestamptz) from public, anon, authenticated;
grant execute on function public.list_account_retention_candidates(timestamptz) to service_role;
