begin;

select plan(28);

select has_table('public', 'onboarding_progress', 'onboarding progress table exists');
select has_table('public', 'profile_prompts', 'profile prompts table exists');
select has_table('public', 'profile_interests', 'profile interests table exists');

select ok(
  (select c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'onboarding_progress'),
  'onboarding progress has RLS enabled'
);
select ok(
  (select c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'profile_prompts'),
  'profile prompts have RLS enabled'
);
select ok(
  (select c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'profile_interests'),
  'profile interests have RLS enabled'
);

select ok(to_regprocedure('public.save_onboarding_progress(text,text[],integer)') is not null, 'save progress RPC exists');
select ok(to_regprocedure('public.save_profile_personality(jsonb,text[])') is not null, 'save personality RPC exists');
select ok(to_regprocedure('public.load_onboarding_snapshot()') is not null, 'load snapshot RPC exists');
select ok(to_regprocedure('public.publish_profile()') is not null, 'publish profile RPC exists');
select ok(not has_function_privilege('anon', 'public.publish_profile()', 'EXECUTE'), 'anon cannot publish profiles');
select ok(has_function_privilege('authenticated', 'public.publish_profile()', 'EXECUTE'), 'authenticated can call publish RPC');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000a55', 'authenticated', 'authenticated', 'onboarding-a@rendezvue.test', crypt('onboarding-a', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"nickname":"Onboarding A"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000b66', 'authenticated', 'authenticated', 'onboarding-b@rendezvue.test', crypt('onboarding-b', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"nickname":"Onboarding B"}', now(), now());

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-000000000a55","role":"authenticated"}';
set local role authenticated;

select is(
  (public.save_onboarding_progress('family', array['eligibility', 'account', 'identity'], 2)).current_stage,
  'family',
  'progress RPC saves current stage'
);
select is((select count(*) from public.onboarding_progress), 1::bigint, 'A sees A progress only');

select is(
  (public.save_profile_personality(
    '[{"prompt_key":"family","response":"Samen bouwen"},{"prompt_key":"weekend","response":"Wandelen"}]'::jsonb,
    array['reizen', 'koken', 'familie']
  ) ->> 'prompt_count')::integer,
  2,
  'personality RPC saves two prompts atomically'
);
select is((select count(*) from public.profile_prompts), 2::bigint, 'A sees two prompt rows');
select is((select count(*) from public.profile_interests), 3::bigint, 'A sees three interest rows');
select is(jsonb_array_length(public.load_onboarding_snapshot() -> 'interests'), 3, 'snapshot restores three interests');
reset role;

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-000000000b66","role":"authenticated"}';
set local role authenticated;
select is((select count(*) from public.onboarding_progress), 0::bigint, 'B cannot read A progress');
select is((select count(*) from public.profile_prompts), 0::bigint, 'B cannot read A prompts');
select is((select count(*) from public.profile_interests), 0::bigint, 'B cannot read A interests');
update public.onboarding_progress set current_stage = 'complete' where user_id = '00000000-0000-0000-0000-000000000a55';
reset role;

select is(
  (select current_stage from public.onboarding_progress where user_id = '00000000-0000-0000-0000-000000000a55'),
  'family',
  'B cannot update A progress'
);

update public.profiles
set nickname = 'Amina', sex = 'woman', city_region = 'Rotterdam',
    relationship_intent = 'marriage'
where user_id = '00000000-0000-0000-0000-000000000a55';
insert into public.eligibility (
  user_id, current_relationship_state, adult_confirmed,
  serious_intent_confirmed, community_fit_confirmed
) values ('00000000-0000-0000-0000-000000000a55', 'single', true, true, true);
insert into public.family_contexts (user_id, marital_history, has_children, wants_children, accepts_partner_with_children)
values ('00000000-0000-0000-0000-000000000a55', 'never_married', false, 'yes', 'yes');

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-000000000a55","role":"authenticated"}';
set local role authenticated;
select throws_ok(
  $$ select public.publish_profile() $$,
  'profile publication requirements not met',
  'publication fails without a selected privacy portrait'
);

insert into public.privacy_portraits (
  user_id, object_path, treatment, status, is_public_profile_portrait,
  asset_role, profile_media_slot, capture_origin, is_profile_media_visible,
  live_capture_completed_at, capture_proof_version
) values (
  '00000000-0000-0000-0000-000000000a55',
  '00000000-0000-0000-0000-000000000a55/portrait.webp',
  'balanced', 'pending', true,
  'card', 'live_selfie', 'live_camera', true, now(), 'blink-turn-v1'
);

select is(public.publish_profile(), '00000000-0000-0000-0000-000000000a55'::uuid, 'publish RPC returns authenticated user ID');
select is((select publication_status::text from public.profiles where user_id = auth.uid()), 'published', 'profile becomes published');
select is((select current_stage from public.onboarding_progress where user_id = auth.uid()), 'complete', 'publication completes onboarding progress');
select ok(not (public.load_onboarding_snapshot() -> 'privacy_portrait' ? 'object_path'), 'snapshot does not expose private portrait object path');
select ok(public.profile_publication_requirements_met(auth.uid()), 'publication requirements predicate is true');
reset role;

select * from finish();
rollback;
