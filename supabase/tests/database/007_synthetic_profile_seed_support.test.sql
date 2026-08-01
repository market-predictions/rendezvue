begin;

select plan(11);

select has_column('public', 'profiles', 'synthetic_id', 'profiles exposes a synthetic id');
select has_column('public', 'profiles', 'is_synthetic', 'profiles exposes an explicit synthetic marker');
select has_index('public', 'profiles', 'profiles_synthetic_id_unique_idx', 'synthetic ids have a unique partial index');
select has_function('public', 'get_synthetic_discovery_portrait_path', array['uuid'], 'synthetic discovery portrait path RPC exists');
select has_function('public', 'can_read_synthetic_portrait', array['text'], 'synthetic portrait policy helper exists');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '71000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'synthetic-actor@rendezvue.test', crypt('test-password-a', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"nickname":"Actor"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '71000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'synthetic-target@rendezvue.test', crypt('test-password-b', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"nickname":"Target"}', now(), now());

update public.profiles
set nickname = 'Actor', sex = 'man', city_region = 'Utrecht', relationship_intent = 'serious_relationship'
where user_id = '71000000-0000-4000-8000-000000000001';

update public.profiles
set nickname = 'Synthetic Target', sex = 'woman', city_region = 'Amsterdam',
    relationship_intent = 'serious_relationship', publication_status = 'published',
    published_at = now(), is_synthetic = true, synthetic_id = 'synthetic-target-test'
where user_id = '71000000-0000-4000-8000-000000000002';

insert into public.eligibility (
  user_id, current_relationship_state, adult_confirmed,
  serious_intent_confirmed, community_fit_confirmed
) values
  ('71000000-0000-4000-8000-000000000001', 'single', true, true, true),
  ('71000000-0000-4000-8000-000000000002', 'single', true, true, true);

insert into public.life_stages (user_id, primary_status)
values ('71000000-0000-4000-8000-000000000002', 'employed');

insert into public.privacy_portraits (
  user_id, object_path, treatment, status, is_public_profile_portrait
) values (
  '71000000-0000-4000-8000-000000000002',
  '71000000-0000-4000-8000-000000000002/synthetic/target.webp',
  'synthetic-illustrated-avatar-v1', 'verified', true
);

set local "request.jwt.claims" = '{"sub":"71000000-0000-4000-8000-000000000001","role":"authenticated"}';
set local role authenticated;

select is(
  (select count(*) from public.discovery_profiles where user_id = '71000000-0000-4000-8000-000000000002'),
  1::bigint,
  'eligible actor sees the opposite-sex synthetic profile in discovery'
);
select is(
  (select is_synthetic from public.discovery_profiles where user_id = '71000000-0000-4000-8000-000000000002'),
  true,
  'discovery explicitly marks the record as synthetic'
);
select is(
  (select synthetic_id from public.discovery_profiles where user_id = '71000000-0000-4000-8000-000000000002'),
  'synthetic-target-test',
  'discovery carries the stable synthetic id'
);
select is(
  public.get_synthetic_discovery_portrait_path('71000000-0000-4000-8000-000000000002'),
  '71000000-0000-4000-8000-000000000002/synthetic/target.webp',
  'discoverable synthetic portrait path is returned'
);
select ok(
  public.can_read_synthetic_portrait('71000000-0000-4000-8000-000000000002/synthetic/target.webp'),
  'storage policy helper grants the discoverable synthetic portrait'
);

reset role;

select throws_ok(
  $$update public.profiles
    set is_synthetic = true, synthetic_id = null
    where user_id = '71000000-0000-4000-8000-000000000001'$$,
  '23514',
  null,
  'synthetic records require a stable synthetic id'
);

select * from finish();
rollback;
