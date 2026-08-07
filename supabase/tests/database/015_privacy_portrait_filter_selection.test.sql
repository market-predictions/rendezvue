begin;

select plan(16);

select has_column('public', 'privacy_portraits', 'privacy_filter_id', 'privacy portraits persist the selected filter');
select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'public.privacy_portraits'::regclass
      and conname = 'privacy_portraits_filter_id_check'
  ),
  'database constrains privacy filter identifiers'
);
select ok(
  to_regprocedure('public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text,text[])') is not null,
  'filter-aware registration RPC exists'
);
select ok(
  has_function_privilege('authenticated', 'public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text,text[])', 'EXECUTE'),
  'authenticated callers can use the filter-aware registration RPC'
);
select ok(
  not has_function_privilege('authenticated', 'public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text[])', 'EXECUTE'),
  'authenticated callers cannot bypass filtering through the legacy signature'
);
select ok(
  not has_function_privilege('anon', 'public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text,text[])', 'EXECUTE'),
  'anonymous callers cannot register a filtered portrait'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '40000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'privacy-filter@rendezvue.test',
  crypt('privacy-filter', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nickname":"Privacy Filter"}', now(), now()
);

insert into storage.objects (bucket_id, name, owner_id)
values
  ('privacy-portraits', '40000000-0000-4000-8000-000000000001/prepared/50000000-0000-4000-8000-000000000001/source.webp', '40000000-0000-4000-8000-000000000001'),
  ('privacy-portraits', '40000000-0000-4000-8000-000000000001/prepared/50000000-0000-4000-8000-000000000001/card-4x5.webp', '40000000-0000-4000-8000-000000000001'),
  ('privacy-portraits', '40000000-0000-4000-8000-000000000001/prepared/50000000-0000-4000-8000-000000000001/avatar-square.webp', '40000000-0000-4000-8000-000000000001');

set local "request.jwt.claims" = '{"sub":"40000000-0000-4000-8000-000000000001","role":"authenticated"}';
set local role authenticated;

select throws_ok(
  $$ select public.register_prepared_portrait(
    '50000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001/prepared/50000000-0000-4000-8000-000000000001/source.webp',
    '40000000-0000-4000-8000-000000000001/prepared/50000000-0000-4000-8000-000000000001/card-4x5.webp',
    '40000000-0000-4000-8000-000000000001/prepared/50000000-0000-4000-8000-000000000001/avatar-square.webp',
    0.5, 0.42, 1, 1600, 2000, 'raw', '{}'::text[]
  ) $$,
  'supported privacy presentation required',
  'database rejects raw-like filter values'
);

select ok(
  public.register_prepared_portrait(
    '50000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001/prepared/50000000-0000-4000-8000-000000000001/source.webp',
    '40000000-0000-4000-8000-000000000001/prepared/50000000-0000-4000-8000-000000000001/card-4x5.webp',
    '40000000-0000-4000-8000-000000000001/prepared/50000000-0000-4000-8000-000000000001/avatar-square.webp',
    0.5, 0.42, 1, 1600, 2000, 'warmVeil', '{}'::text[]
  ) is not null,
  'bounded filter selection creates the complete preparation'
);

select is((select count(*) from public.privacy_portraits), 3::bigint, 'filtered preparation contains exactly three assets');
select is((select count(*) from public.privacy_portraits where privacy_filter_id = 'warmVeil'), 3::bigint, 'selected filter is persisted on all preparation assets');
select is((select treatment from public.privacy_portraits where asset_role = 'card'), 'privacy-warmVeil-card-4x5-webp', 'card treatment identifies the baked filter');
select is((select treatment from public.privacy_portraits where asset_role = 'avatar'), 'privacy-warmVeil-avatar-square-webp', 'avatar treatment identifies the same filter');
select is((select asset_role from public.privacy_portraits where is_public_profile_portrait), 'card', 'only the filtered card is selected');
select is(public.load_onboarding_snapshot() #>> '{privacy_portrait,privacy_filter_id}', 'warmVeil', 'snapshot exposes only the non-sensitive filter ID');

reset role;
select is(
  (select payload->>'privacy_filter_id' from public.audit_events where event_type = 'privacy_portrait_filter_selected' order by id desc limit 1),
  'warmVeil',
  'audit records the bounded filter ID'
);
select ok(
  (select payload::text not like '%.webp%' from public.audit_events where event_type = 'privacy_portrait_filter_selected' order by id desc limit 1),
  'filter audit contains no Storage paths'
);

select * from finish();
rollback;
