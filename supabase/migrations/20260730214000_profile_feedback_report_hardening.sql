-- Harden profile publication/discovery and move feedback/report mutations into
-- server-authoritative functions so clients cannot choose trust weights or
-- moderation state.

-- Exactly one selected public derivative per account. The object itself remains
-- in a private bucket until an approved delivery projection exists.
create unique index if not exists privacy_portraits_one_selected_idx
on public.privacy_portraits (user_id)
where is_public_profile_portrait;

-- Published discovery requires both actor and target to be eligible and uses
-- the community's derived opposite-sex direction. Own profile remains visible.
drop policy if exists profiles_read_discoverable on public.profiles;
create policy profiles_read_discoverable on public.profiles for select to authenticated
using (
  user_id = auth.uid()
  or (
    publication_status = 'published'
    and sex is not null
    and exists (
      select 1
      from public.profiles actor_profile
      join public.eligibility actor_eligibility on actor_eligibility.user_id = actor_profile.user_id
      where actor_profile.user_id = auth.uid()
        and actor_profile.sex is not null
        and actor_profile.sex <> profiles.sex
        and actor_eligibility.current_relationship_state = 'single'
        and actor_eligibility.adult_confirmed
        and actor_eligibility.serious_intent_confirmed
        and actor_eligibility.community_fit_confirmed
    )
    and exists (
      select 1 from public.eligibility target_eligibility
      where target_eligibility.user_id = profiles.user_id
        and target_eligibility.current_relationship_state = 'single'
        and target_eligibility.adult_confirmed
        and target_eligibility.serious_intent_confirmed
        and target_eligibility.community_fit_confirmed
    )
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_user_id = auth.uid() and b.blocked_user_id = profiles.user_id)
         or (b.blocker_user_id = profiles.user_id and b.blocked_user_id = auth.uid())
    )
  )
);

-- A profile may be edited directly by its owner, but publication is only valid
-- after core eligibility, family context and a pending derived portrait exist.
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
          and pp.status = 'pending'
      )
    )
  )
);

-- Users may upload/select a pending derivative, but may not mark their own
-- media as verified, rejected or expired.
drop policy if exists privacy_portraits_self on public.privacy_portraits;
create policy privacy_portraits_select_self on public.privacy_portraits for select to authenticated
using (user_id = auth.uid());
create policy privacy_portraits_insert_self on public.privacy_portraits for insert to authenticated
with check (user_id = auth.uid() and status = 'pending');
create policy privacy_portraits_update_self on public.privacy_portraits for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid() and status = 'pending');
create policy privacy_portraits_delete_self on public.privacy_portraits for delete to authenticated
using (user_id = auth.uid());

create or replace function public.submit_interaction_feedback(
  p_match_id uuid,
  p_subject_user_id uuid,
  p_interaction_depth text,
  p_positive_tags text[] default '{}',
  p_concern_tags text[] default '{}',
  p_optional_comment text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reviewer uuid := auth.uid();
  v_match public.matches%rowtype;
  v_feedback_id uuid;
begin
  if v_reviewer is null then raise exception 'authentication required'; end if;
  if p_interaction_depth not in ('matched', 'messaged', 'extended_chat', 'call', 'offline_meeting') then
    raise exception 'invalid interaction depth';
  end if;
  if p_optional_comment is not null and char_length(p_optional_comment) > 2000 then
    raise exception 'feedback comment too long';
  end if;

  select * into v_match from public.matches where id = p_match_id;
  if not found or v_reviewer not in (v_match.user_a_id, v_match.user_b_id) then
    raise exception 'match participation required';
  end if;
  if p_subject_user_id is null
     or p_subject_user_id = v_reviewer
     or p_subject_user_id not in (v_match.user_a_id, v_match.user_b_id) then
    raise exception 'subject must be the other match participant';
  end if;

  insert into public.interaction_feedback (
    match_id, reviewer_user_id, subject_user_id, interaction_depth,
    positive_tags, concern_tags, optional_comment, credibility_weight
  ) values (
    p_match_id, v_reviewer, p_subject_user_id, p_interaction_depth,
    coalesce(p_positive_tags, '{}'), coalesce(p_concern_tags, '{}'),
    nullif(trim(p_optional_comment), ''), 0.5000
  )
  on conflict (match_id, reviewer_user_id) do update set
    subject_user_id = excluded.subject_user_id,
    interaction_depth = excluded.interaction_depth,
    positive_tags = excluded.positive_tags,
    concern_tags = excluded.concern_tags,
    optional_comment = excluded.optional_comment,
    credibility_weight = 0.5000
  returning id into v_feedback_id;

  insert into public.audit_events (
    actor_user_id, actor_type, event_type, subject_user_id, entity_type, entity_id
  ) values (
    v_reviewer, 'user', 'interaction_feedback_submitted', p_subject_user_id,
    'interaction_feedback', v_feedback_id::text
  );

  return v_feedback_id;
end;
$$;

create or replace function public.create_safety_report(
  p_subject_user_id uuid,
  p_match_id uuid,
  p_category text,
  p_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reporter uuid := auth.uid();
  v_severity public.report_severity;
  v_report_id uuid;
begin
  if v_reporter is null then raise exception 'authentication required'; end if;
  if p_subject_user_id is null or p_subject_user_id = v_reporter then
    raise exception 'invalid report subject';
  end if;
  if nullif(trim(p_category), '') is null then raise exception 'report category required'; end if;
  if p_description is not null and char_length(p_description) > 4000 then
    raise exception 'report description too long';
  end if;

  if p_match_id is not null and not exists (
    select 1 from public.matches m
    where m.id = p_match_id
      and v_reporter in (m.user_a_id, m.user_b_id)
      and p_subject_user_id in (m.user_a_id, m.user_b_id)
  ) then raise exception 'report match does not contain both users'; end if;

  v_severity := case
    when p_category in ('minor_suspected', 'threat', 'stalking', 'sexual_coercion') then 'critical'::public.report_severity
    when p_category in ('scam_money', 'hidden_relationship', 'impersonation') then 'high'::public.report_severity
    when p_category in ('harassment', 'hate_or_discrimination', 'offline_no_show_pattern') then 'medium'::public.report_severity
    else 'low'::public.report_severity
  end;

  insert into public.safety_reports (
    reporter_user_id, subject_user_id, match_id, category, description, severity, status
  ) values (
    v_reporter, p_subject_user_id, p_match_id, trim(p_category),
    nullif(trim(p_description), ''), v_severity, 'open'
  ) returning id into v_report_id;

  if v_severity in ('high', 'critical') then
    insert into public.moderation_cases (subject_user_id, source_report_id, status, priority)
    values (
      p_subject_user_id,
      v_report_id,
      'triage',
      case when v_severity = 'critical' then 1 else 2 end
    );
  end if;

  insert into public.audit_events (
    actor_user_id, actor_type, event_type, subject_user_id, entity_type, entity_id,
    payload
  ) values (
    v_reporter, 'user', 'safety_report_created', p_subject_user_id,
    'safety_report', v_report_id::text,
    jsonb_build_object('category', trim(p_category), 'severity', v_severity)
  );

  return v_report_id;
end;
$$;

-- Direct inserts would allow clients to choose credibility and moderation state.
drop policy if exists feedback_reviewer_insert on public.interaction_feedback;
drop policy if exists reports_reporter_insert on public.safety_reports;

revoke all on function public.submit_interaction_feedback(uuid, uuid, text, text[], text[], text) from public, anon;
revoke all on function public.create_safety_report(uuid, uuid, text, text) from public, anon;
grant execute on function public.submit_interaction_feedback(uuid, uuid, text, text[], text[], text) to authenticated;
grant execute on function public.create_safety_report(uuid, uuid, text, text) to authenticated;
