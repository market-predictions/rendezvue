-- Server-authoritative onboarding helpers. They derive user identity from the
-- authenticated session and keep multi-row personality content transactional.

create or replace function public.save_onboarding_progress(
  p_current_stage text,
  p_completed_stages text[] default '{}',
  p_schema_version integer default 1
)
returns public.onboarding_progress
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_result public.onboarding_progress%rowtype;
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if p_schema_version < 1 then raise exception 'invalid onboarding schema version'; end if;

  insert into public.onboarding_progress (
    user_id, schema_version, current_stage, completed_stages, last_saved_at
  ) values (
    v_user_id,
    p_schema_version,
    p_current_stage,
    coalesce(p_completed_stages, '{}'),
    timezone('utc', now())
  )
  on conflict (user_id) do update set
    schema_version = excluded.schema_version,
    current_stage = excluded.current_stage,
    completed_stages = excluded.completed_stages,
    last_saved_at = timezone('utc', now()),
    updated_at = timezone('utc', now())
  returning * into v_result;

  return v_result;
end;
$$;

create or replace function public.save_profile_personality(
  p_prompts jsonb,
  p_interests text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_prompt_count integer;
  v_interest_count integer;
  v_item jsonb;
  v_position integer;
  v_prompt_key text;
  v_response text;
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if jsonb_typeof(p_prompts) <> 'array' then raise exception 'prompts must be an array'; end if;

  v_prompt_count := jsonb_array_length(p_prompts);
  v_interest_count := coalesce(cardinality(p_interests), 0);
  if v_prompt_count < 2 or v_prompt_count > 3 then raise exception 'two or three prompts required'; end if;
  if v_interest_count < 3 or v_interest_count > 12 then raise exception 'three to twelve interests required'; end if;
  if (select count(distinct value) from unnest(p_interests) as value) <> v_interest_count then
    raise exception 'interests must be unique';
  end if;

  delete from public.profile_prompts where user_id = v_user_id;
  delete from public.profile_interests where user_id = v_user_id;

  v_position := 0;
  for v_item in select value from jsonb_array_elements(p_prompts)
  loop
    v_position := v_position + 1;
    v_prompt_key := nullif(trim(v_item ->> 'prompt_key'), '');
    v_response := nullif(trim(v_item ->> 'response'), '');
    if v_prompt_key is null or v_response is null then raise exception 'prompt key and response required'; end if;

    insert into public.profile_prompts (user_id, prompt_key, response, position)
    values (v_user_id, v_prompt_key, v_response, v_position);
  end loop;

  insert into public.profile_interests (user_id, interest_key, position)
  select v_user_id, trim(value), ordinality::smallint
  from unnest(p_interests) with ordinality as item(value, ordinality)
  where nullif(trim(value), '') is not null;

  if (select count(*) from public.profile_interests where user_id = v_user_id) <> v_interest_count then
    raise exception 'interests may not be empty';
  end if;

  insert into public.audit_events (actor_user_id, actor_type, event_type, entity_type, entity_id)
  values (v_user_id, 'user', 'profile_personality_saved', 'profile', v_user_id::text);

  return jsonb_build_object(
    'prompt_count', v_prompt_count,
    'interest_count', v_interest_count
  );
end;
$$;

create or replace function public.load_onboarding_snapshot()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'authentication required'; end if;

  return jsonb_build_object(
    'profile', (select to_jsonb(p) - 'created_at' - 'updated_at' from public.profiles p where p.user_id = v_user_id),
    'eligibility', (select to_jsonb(e) - 'created_at' - 'updated_at' from public.eligibility e where e.user_id = v_user_id),
    'life_stage', (select to_jsonb(ls) - 'created_at' - 'updated_at' from public.life_stages ls where ls.user_id = v_user_id),
    'family_context', (select to_jsonb(fc) - 'created_at' - 'updated_at' from public.family_contexts fc where fc.user_id = v_user_id),
    'faith_profile', (select to_jsonb(fp) - 'created_at' - 'updated_at' from public.faith_profiles fp where fp.user_id = v_user_id),
    'student_verifications', coalesce((
      select jsonb_agg(to_jsonb(sv) - 'evidence_reference' - 'created_at' - 'updated_at' order by sv.created_at)
      from public.student_verifications sv where sv.user_id = v_user_id
    ), '[]'::jsonb),
    'privacy_portrait', (
      select to_jsonb(pp) - 'object_path' - 'source_retained_until' - 'created_at' - 'updated_at'
      from public.privacy_portraits pp
      where pp.user_id = v_user_id and pp.is_public_profile_portrait
      limit 1
    ),
    'prompts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'prompt_key', pp.prompt_key,
        'response', pp.response,
        'position', pp.position
      ) order by pp.position)
      from public.profile_prompts pp where pp.user_id = v_user_id
    ), '[]'::jsonb),
    'interests', coalesce((
      select jsonb_agg(pi.interest_key order by pi.position)
      from public.profile_interests pi where pi.user_id = v_user_id
    ), '[]'::jsonb),
    'progress', (select to_jsonb(op) - 'created_at' - 'updated_at' from public.onboarding_progress op where op.user_id = v_user_id)
  );
end;
$$;

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

  update public.profiles
  set publication_status = 'published',
      profile_completed_at = coalesce(profile_completed_at, timezone('utc', now())),
      published_at = coalesce(published_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
  where user_id = v_user_id;

  insert into public.onboarding_progress (
    user_id, current_stage, completed_stages, last_saved_at
  ) values (
    v_user_id,
    'complete',
    array['eligibility', 'account', 'identity', 'life_stage', 'family', 'portrait', 'faith', 'personality', 'preview', 'promise'],
    timezone('utc', now())
  )
  on conflict (user_id) do update set
    current_stage = 'complete',
    completed_stages = excluded.completed_stages,
    last_saved_at = timezone('utc', now()),
    updated_at = timezone('utc', now());

  insert into public.audit_events (actor_user_id, actor_type, event_type, entity_type, entity_id)
  values (v_user_id, 'user', 'profile_published', 'profile', v_user_id::text);

  return v_user_id;
end;
$$;

revoke all on function public.save_onboarding_progress(text, text[], integer) from public, anon;
revoke all on function public.save_profile_personality(jsonb, text[]) from public, anon;
revoke all on function public.load_onboarding_snapshot() from public, anon;
revoke all on function public.publish_profile() from public, anon;

grant execute on function public.save_onboarding_progress(text, text[], integer) to authenticated;
grant execute on function public.save_profile_personality(jsonb, text[]) to authenticated;
grant execute on function public.load_onboarding_snapshot() to authenticated;
grant execute on function public.publish_profile() to authenticated;
