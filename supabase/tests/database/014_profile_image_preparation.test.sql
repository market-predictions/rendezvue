begin;

select plan(37);

select has_column('public', 'privacy_portraits', 'preparation_id', 'privacy portraits track preparation ID');
select has_column('public', 'privacy_portraits', 'asset_role', 'privacy portraits track asset role');
select has_column('public', 'privacy_portraits', 'source_object_path', 'privacy portraits link to normalized source');
select has_column('public', 'privacy_portraits', 'focal_x', 'privacy portraits persist horizontal focal point');
select has_column('public', 'privacy_portraits', 'focal_y', 'privacy portraits persist vertical focal point');
select has_column('public', 'privacy_portraits', 'zoom', 'privacy portraits persist framing zoom');
select has_column('public', 'privacy_portraits', 'crop_aspect', 'privacy portraits persist crop aspect');
select has_column('public', 'privacy_portraits', 'metadata_stripped', 'privacy portraits record metadata stripping');
select has_column('public', 'privacy_portraits', 'quality_flags', 'privacy portraits record bounded quality flags');
select ok(
  to_regprocedure('public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text[])') is not null,
  'prepared portrait registration RPC exists'
);
select ok(
  not has_function_privilege('anon', 'public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text[])', 'EXECUTE'),
  'anonymous callers cannot register a prepared portrait'
);
select ok(
  has_function_privilege('authenticated', 'public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text[])', 'EXECUTE'),
  'authenticated callers can register a prepared portrait'
);
select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'public.privacy_portraits'::regclass
      and conname = 'privacy_portraits_public_role_check'
  ),
  'database constrains selected portraits to card derivatives'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'prepared-a@rendezvue.test', crypt('prepared-a', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"nickname":"Prepared A"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'prepared-b@rendezvue.test', crypt('prepared-b', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"nickname":"Prepared B"}', now(), now());

insert into storage.objects (bucket_id, name, owner_id)
values
  ('privacy-portraits', '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000001/source.webp', '10000000-0000-4000-8000-000000000001'),
  ('privacy-portraits', '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000001/card-4x5.webp', '10000000-0000-4000-8000-000000000001'),
  ('privacy-portraits', '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000001/avatar-square.webp', '10000000-0000-4000-8000-000000000001'),
  ('privacy-portraits', '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000002/source.webp', '10000000-0000-4000-8000-000000000001'),
  ('privacy-portraits', '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000002/card-4x5.webp', '10000000-0000-4000-8000-000000000001'),
  ('privacy-portraits', '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000002/avatar-square.webp', '10000000-0000-4000-8000-000000000001');

create temporary table prepared_result (
  label text primary key,
  portrait_id uuid not null
) on commit drop;

set local "request.jwt.claims" = '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}';
set local role authenticated;

insert into prepared_result (label, portrait_id)
select 'first', public.register_prepared_portrait(
  '20000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000001/source.webp',
  '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000001/card-4x5.webp',
  '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000001/avatar-square.webp',
  0.52, 0.41, 1.18, 1800, 2400,
  array['low-resolution']
);

select ok((select portrait_id is not null from prepared_result where label = 'first'), 'registration returns selected card portrait ID');
select is((select count(*) from public.privacy_portraits), 3::bigint, 'one preparation creates exactly three asset records');
select is(
  (select array_agg(asset_role order by asset_role)::text from public.privacy_portraits),
  '{avatar,card,source}',
  'preparation contains source, card and avatar roles'
);
select is((select count(*) from public.privacy_portraits where is_public_profile_portrait), 1::bigint, 'exactly one derivative is selected');
select is((select asset_role from public.privacy_portraits where is_public_profile_portrait), 'card', 'only card derivative is selected');
select is((select count(*) from public.privacy_portraits where metadata_stripped), 3::bigint, 'all stored assets record metadata stripping');
select is(
  (select source_object_path from public.privacy_portraits where asset_role = 'card'),
  '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000001/source.webp',
  'card derivative links to the normalized private source'
);
select is(
  (select output_width::text || 'x' || output_height::text from public.privacy_portraits where asset_role = 'card'),
  '960x1200',
  'card derivative dimensions are canonical 4:5'
);
select is(
  (select crop_aspect from public.privacy_portraits where asset_role = 'card'),
  '4:5',
  'selected card records the canonical crop aspect'
);
select is(
  (select output_width::text || 'x' || output_height::text from public.privacy_portraits where asset_role = 'avatar'),
  '384x384',
  'avatar derivative dimensions are canonical square'
);
select is(
  (select quality_flags from public.privacy_portraits where asset_role = 'card'),
  array['low-resolution']::text[],
  'bounded quality flags are persisted'
);
select ok(
  not (public.load_onboarding_snapshot() -> 'privacy_portrait' ? 'object_path'),
  'onboarding snapshot redacts selected object path'
);
select ok(
  not (public.load_onboarding_snapshot() -> 'privacy_portrait' ? 'source_object_path'),
  'onboarding snapshot redacts normalized source path'
);
select ok(
  (select payload::text not like '%.webp%' from public.audit_events where event_type = 'prepared_portrait_registered' order by id desc limit 1),
  'prepared portrait audit event contains no Storage paths'
);

insert into prepared_result (label, portrait_id)
select 'retry', public.register_prepared_portrait(
  '20000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000001/source.webp',
  '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000001/card-4x5.webp',
  '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000001/avatar-square.webp',
  0.52, 0.41, 1.18, 1800, 2400,
  array['low-resolution']
);
select is(
  (select portrait_id from prepared_result where label = 'retry'),
  (select portrait_id from prepared_result where label = 'first'),
  'retry is idempotent for the same preparation ID'
);
select is((select count(*) from public.privacy_portraits), 3::bigint, 'idempotent retry creates no duplicate rows');

select throws_ok(
  $$ select public.register_prepared_portrait(
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000002/prepared/20000000-0000-4000-8000-000000000003/source.webp',
    '10000000-0000-4000-8000-000000000002/prepared/20000000-0000-4000-8000-000000000003/card-4x5.webp',
    '10000000-0000-4000-8000-000000000002/prepared/20000000-0000-4000-8000-000000000003/avatar-square.webp',
    0.5, 0.5, 1, 1200, 1600, '{}'::text[]
  ) $$,
  'prepared portrait paths do not match the authenticated account',
  'caller cannot register paths under another account prefix'
);

select throws_ok(
  $$ select public.register_prepared_portrait(
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000003/source.webp',
    '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000003/card-4x5.webp',
    '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000003/avatar-square.webp',
    0.5, 0.5, 1, 1200, 1600, '{}'::text[]
  ) $$,
  'all prepared portrait objects must exist before registration',
  'database rejects incomplete derivative sets'
);

select throws_ok(
  $$ select public.register_prepared_portrait(
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000001/source.webp',
    '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000001/card-4x5.webp',
    '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000001/avatar-square.webp',
    0.5, 0.5, 9, 1200, 1600, '{}'::text[]
  ) $$,
  'invalid zoom',
  'database rejects framing zoom outside the supported range'
);

insert into prepared_result (label, portrait_id)
select 'second', public.register_prepared_portrait(
  '20000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000002/source.webp',
  '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000002/card-4x5.webp',
  '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000002/avatar-square.webp',
  0.48, 0.44, 1.05, 1400, 2100,
  array['very-tall-source']
);
select is(
  (select preparation_id from public.privacy_portraits where is_public_profile_portrait),
  '20000000-0000-4000-8000-000000000002'::uuid,
  'new preparation atomically supersedes the former selected card'
);
select is((select count(*) from public.privacy_portraits), 6::bigint, 'second preparation retains both complete private preparation sets');

insert into public.privacy_portraits (
  user_id, object_path, treatment, status, is_public_profile_portrait
) values (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001/legacy-proof.webp',
  'legacy-proof', 'pending', false
);
select ok(
  (select preparation_id is not null from public.privacy_portraits where object_path like '%legacy-proof.webp'),
  'legacy direct portrait inserts receive an isolated preparation ID'
);

select throws_ok(
  $$ update public.privacy_portraits
     set is_public_profile_portrait = true
     where user_id = '10000000-0000-4000-8000-000000000001'
       and preparation_id = '20000000-0000-4000-8000-000000000002'
       and asset_role = 'source' $$,
  '23514',
  'new row for relation "privacy_portraits" violates check constraint "privacy_portraits_public_role_check"',
  'source asset cannot be promoted to selected profile portrait'
);

reset role;
set local "request.jwt.claims" = '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}';
set local role authenticated;
select is((select count(*) from public.privacy_portraits), 0::bigint, 'another authenticated account cannot read prepared portrait metadata');
reset role;

select * from finish();
rollback;
