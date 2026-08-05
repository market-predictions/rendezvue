-- WP-069B: keep private Storage coordinates out of the browser snapshot.

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
      select to_jsonb(pp)
        - 'object_path'
        - 'source_object_path'
        - 'source_retained_until'
        - 'created_at'
        - 'updated_at'
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

revoke all on function public.load_onboarding_snapshot() from public, anon;
grant execute on function public.load_onboarding_snapshot() to authenticated;
