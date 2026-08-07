begin;

select plan(17);

select has_column('public', 'privacy_portraits', 'privacy_filter_id', 'portrait preparations retain the selected presentation ID');
select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'public.privacy_portraits'::regclass
      and conname = 'privacy_portraits_filter_id_check'
  ),
  'database keeps the presentation identifier constrained'
);
select ok(
  to_regprocedure('public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text,text[])') is not null,
  'presentation-aware prepared portrait RPC exists'
);
select ok(
  has_function_privilege('authenticated', 'public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text,text[])', 'EXECUTE'),
  'authenticated callers can register an explicit active presentation'
);
select ok(
  not has_function_privilege('authenticated', 'public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text[])', 'EXECUTE'),
  'authenticated callers cannot bypass the explicit presentation choice'
);
select ok(
  not has_function_privilege('anon', 'public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text,text[])', 'EXECUTE'),
  'anonymous callers cannot register participant portraits'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '60000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'privacy-gradient@rendezvue.test',
  crypt('privacy-gradient', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}',
  '{"nickname":"Privacy Gradient"}', now(), now()
);

insert into storage.objects (bucket_id, name, owner_id)
values
  ('privacy-portraits', '60000000-0000-4000-8000-000000000001/prepared/70000000-0000-4000-8000-000000000001/source.webp', '60000000-0000-4000-8000-000000000001'),
  ('privacy-portraits', '60000000-0000-4000-8000-000000000001/prepared/70000000-0000-4000-8000-000000000001/card-4x5.webp', '60000000-0000-4000-8000-000000000001'),
  ('privacy-portraits', '60000000-0000-4000-8000-000000000001/prepared/70000000-0000-4000-8000-000000000001/avatar-square.webp', '60000000-0000-4000-8000-000000000001');

set local "request.jwt.claims" = '{"sub":"60000000-0000-4000-8000-000000000001","role":"authenticated"}';
set local role authenticated;

select throws_ok(
  $$ select public.register_prepared_portrait(
    '70000000-0000-4000-8000-000000000099',
    '60000000-0000-4000-8000-000000000001/prepared/70000000-0000-4000-8000-000000000099/source.webp',
    '60000000-0000-4000-8000-000000000001/prepared/70000000-0000-4000-8000-000000000099/card-4x5.webp',
    '60000000-0000-4000-8000-000000000001/prepared/70000000-0000-4000-8000-000000000099/avatar-square.webp',
    0.5, 0.42, 1, 1600, 2000, 'monoMist', '{}'::text[]
  ) $$,
  'supported privacy presentation required',
  'former heavy monoMist presentation is rejected for new writes'
);

select throws_ok(
  $$ select public.register_prepared_portrait(
    '70000000-0000-4000-8000-000000000098',
    '60000000-0000-4000-8000-000000000001/prepared/70000000-0000-4000-8000-000000000098/source.webp',
    '60000000-0000-4000-8000-000000000001/prepared/70000000-0000-4000-8000-000000000098/card-4x5.webp',
    '60000000-0000-4000-8000-000000000001/prepared/70000000-0000-4000-8000-000000000098/avatar-square.webp',
    0.5, 0.42, 1, 1600, 2000, 'privacyMax', '{}'::text[]
  ) $$,
  'supported privacy presentation required',
  'former heavy privacyMax presentation is rejected for new writes'
);

select ok(
  public.register_prepared_portrait(
    '70000000-0000-4000-8000-000000000001',
    '60000000-0000-4000-8000-000000000001/prepared/70000000-0000-4000-8000-000000000001/source.webp',
    '60000000-0000-4000-8000-000000000001/prepared/70000000-0000-4000-8000-000000000001/card-4x5.webp',
    '60000000-0000-4000-8000-000000000001/prepared/70000000-0000-4000-8000-000000000001/avatar-square.webp',
    0.5, 0.42, 1, 1600, 2000, 'unfiltered', '{}'::text[]
  ) is not null,
  'explicit unfiltered derivative presentation is accepted'
);

select is((select count(*) from public.privacy_portraits), 3::bigint, 'unfiltered preparation still consists of source, card and avatar');
select is((select count(*) from public.privacy_portraits where privacy_filter_id = 'unfiltered'), 3::bigint, 'unfiltered presentation ID is persisted on the complete preparation');
select is((select treatment from public.privacy_portraits where asset_role = 'card'), 'privacy-unfiltered-card-4x5-webp', 'card treatment records the explicit unfiltered derivative choice');
select is((select treatment from public.privacy_portraits where asset_role = 'avatar'), 'privacy-unfiltered-avatar-square-webp', 'avatar treatment records the same explicit choice');
select is((select asset_role from public.privacy_portraits where is_public_profile_portrait), 'card', 'only the prepared card derivative can be selected publicly');
select is(public.load_onboarding_snapshot() #>> '{privacy_portrait,privacy_filter_id}', 'unfiltered', 'snapshot exposes the selected presentation ID without a Storage path');

reset role;
select ok(
  (
    select coalesce((payload->>'public_derivatives_filtered')::boolean, true) = false
      and coalesce((payload->>'unfiltered_derivative_selected')::boolean, false) = true
      and coalesce((payload->>'raw_public_portrait_allowed')::boolean, true) = false
    from public.audit_events
    where event_type = 'privacy_portrait_filter_selected'
    order by id desc
    limit 1
  ),
  'audit distinguishes an unfiltered prepared derivative from prohibited raw source publication'
);
select ok(
  (select payload::text not like '%.webp%' from public.audit_events where event_type = 'privacy_portrait_filter_selected' order by id desc limit 1),
  'presentation audit contains no Storage paths'
);

select * from finish();
rollback;
