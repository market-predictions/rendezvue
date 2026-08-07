begin;

select plan(12);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '61000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'privacy-ladder-b@rendezvue.test',
  crypt('privacy-ladder-b', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nickname":"Privacy Ladder B"}', now(), now()
);

set local "request.jwt.claims" = '{"sub":"61000000-0000-4000-8000-000000000001","role":"authenticated"}';
set local role authenticated;

select throws_ok(
  $$ select public.register_prepared_portrait(
    '71000000-0000-4000-8000-000000000099',
    '61000000-0000-4000-8000-000000000001/prepared/71000000-0000-4000-8000-000000000099/source.webp',
    '61000000-0000-4000-8000-000000000001/prepared/71000000-0000-4000-8000-000000000099/card-4x5.webp',
    '61000000-0000-4000-8000-000000000001/prepared/71000000-0000-4000-8000-000000000099/avatar-square.webp',
    0.5, 0.42, 1, 1600, 2000, 'natural', '{}'::text[]
  ) $$,
  'supported privacy presentation required',
  'former active natural identifier is historical-only for new registrations'
);

select throws_ok(
  $$ select public.register_prepared_portrait(
    '71000000-0000-4000-8000-000000000098',
    '61000000-0000-4000-8000-000000000001/prepared/71000000-0000-4000-8000-000000000098/source.webp',
    '61000000-0000-4000-8000-000000000001/prepared/71000000-0000-4000-8000-000000000098/card-4x5.webp',
    '61000000-0000-4000-8000-000000000001/prepared/71000000-0000-4000-8000-000000000098/avatar-square.webp',
    0.5, 0.42, 1, 1600, 2000, 'monoMist', '{}'::text[]
  ) $$,
  'supported privacy presentation required',
  'former heavy monoMist remains unavailable for new registrations'
);

reset role;
insert into storage.objects (bucket_id, name, owner_id)
values
  ('privacy-portraits', '61000000-0000-4000-8000-000000000001/prepared/71000000-0000-4000-8000-000000000001/source.webp', '61000000-0000-4000-8000-000000000001'),
  ('privacy-portraits', '61000000-0000-4000-8000-000000000001/prepared/71000000-0000-4000-8000-000000000001/card-4x5.webp', '61000000-0000-4000-8000-000000000001'),
  ('privacy-portraits', '61000000-0000-4000-8000-000000000001/prepared/71000000-0000-4000-8000-000000000001/avatar-square.webp', '61000000-0000-4000-8000-000000000001');
set local "request.jwt.claims" = '{"sub":"61000000-0000-4000-8000-000000000001","role":"authenticated"}';
set local role authenticated;

select ok(
  public.register_prepared_portrait(
    '71000000-0000-4000-8000-000000000001',
    '61000000-0000-4000-8000-000000000001/prepared/71000000-0000-4000-8000-000000000001/source.webp',
    '61000000-0000-4000-8000-000000000001/prepared/71000000-0000-4000-8000-000000000001/card-4x5.webp',
    '61000000-0000-4000-8000-000000000001/prepared/71000000-0000-4000-8000-000000000001/avatar-square.webp',
    0.5, 0.42, 1, 1600, 2000, 'morePrivate', '{}'::text[]
  ) is not null,
  'new More private identifier can register one complete prepared portrait'
);

select is((select count(*) from public.privacy_portraits), 3::bigint, 'preparation contains exactly source card and avatar');
select is((select count(*) from public.privacy_portraits where privacy_filter_id = 'morePrivate'), 3::bigint, 'exact selected presentation ID is persisted on all derivatives');
select is((select treatment from public.privacy_portraits where asset_role = 'card'), 'privacy-morePrivate-card-4x5-webp', 'public card treatment records More private exactly');
select is((select treatment from public.privacy_portraits where asset_role = 'avatar'), 'privacy-morePrivate-avatar-square-webp', 'avatar treatment records More private exactly');
select is((select asset_role from public.privacy_portraits where is_public_profile_portrait), 'card', 'only the prepared card is selected as public portrait');
select is((select count(*) from public.privacy_portraits where asset_role = 'source' and is_public_profile_portrait), 0::bigint, 'normalized source remains private and non-selected');
select is(public.load_onboarding_snapshot() #>> '{privacy_portrait,privacy_filter_id}', 'morePrivate', 'snapshot exposes exact selected presentation ID');

reset role;
select is(
  (select payload->>'privacy_filter_id' from public.audit_events where event_type = 'privacy_portrait_filter_selected' order by id desc limit 1),
  'morePrivate',
  'audit records exact selected More private ID'
);
select ok(
  (select payload::text not like '%.webp%' from public.audit_events where event_type = 'privacy_portrait_filter_selected' order by id desc limit 1),
  'selection audit remains free of Storage paths'
);

select * from finish();
rollback;
