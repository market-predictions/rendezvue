begin;

select plan(16);

select has_table('public', 'account_lifecycle', 'account lifecycle table exists');
select has_table('public', 'account_retention_policies', 'versioned retention policy table exists');
select has_table('public', 'account_retention_holds', 'explicit retention hold table exists');
select ok(
  not has_function_privilege('anon', 'public.list_account_retention_candidates(timestamptz)', 'EXECUTE'),
  'anon cannot enumerate retention candidates'
);
select ok(
  not has_function_privilege('authenticated', 'public.list_account_retention_candidates(timestamptz)', 'EXECUTE'),
  'authenticated users cannot enumerate retention candidates'
);
select ok(
  has_function_privilege('service_role', 'public.list_account_retention_candidates(timestamptz)', 'EXECUTE'),
  'service role can enumerate retention candidates'
);
select ok(
  not has_table_privilege('authenticated', 'public.account_lifecycle', 'SELECT'),
  'authenticated users cannot read lifecycle state'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'candidate@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now() - interval '100 days', now() - interval '100 days'),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'recent@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now() - interval '100 days', now() - interval '100 days'),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'published@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now() - interval '100 days', now() - interval '100 days'),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'matched@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now() - interval '100 days', now() - interval '100 days'),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'held@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now() - interval '100 days', now() - interval '100 days'),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'reported@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now() - interval '100 days', now() - interval '100 days'),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000007', 'authenticated', 'authenticated', 'peer@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now() - interval '100 days', now() - interval '100 days');

select is(
  (select count(*) from public.account_lifecycle where user_id::text like '10000000-0000-0000-0000-%'),
  7::bigint,
  'auth-user trigger creates lifecycle rows'
);

update public.account_lifecycle
set last_activity_at = now() - interval '100 days',
    state = 'active',
    state_reason = 'test-fixture';

select is(
  (select count(*) from public.list_account_retention_candidates(now())),
  0::bigint,
  'no candidates are returned while no policy is active'
);

insert into public.account_retention_policies (
  version, status, abandoned_draft_after, grace_period,
  effective_at, approved_by, approval_reference
) values (
  'synthetic-test-v1', 'active', interval '30 days', interval '7 days',
  now() - interval '1 day', 'automated-test', 'issue-54-test-only'
);

update public.account_lifecycle
set last_activity_at = now() - interval '5 days'
where user_id = '10000000-0000-0000-0000-000000000002';

update public.profiles
set publication_status = 'published', published_at = now() - interval '90 days'
where user_id = '10000000-0000-0000-0000-000000000003';

insert into public.matches (user_a_id, user_b_id, status)
values (
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000007',
  'active'
);

insert into public.account_retention_holds (
  user_id, reason_code, created_by
) values (
  '10000000-0000-0000-0000-000000000005',
  'synthetic_legal_hold',
  'automated-test'
);

insert into public.safety_reports (
  reporter_user_id, subject_user_id, category, description, severity, status
) values (
  '10000000-0000-0000-0000-000000000007',
  '10000000-0000-0000-0000-000000000006',
  'synthetic_retention_test',
  'Open safety work must block cleanup candidacy.',
  'medium',
  'open'
);

select is(
  (select count(*) from public.list_account_retention_candidates(now())),
  1::bigint,
  'only the old inactive draft without exclusions is a candidate'
);
select is(
  (select user_id from public.list_account_retention_candidates(now())),
  '10000000-0000-0000-0000-000000000001'::uuid,
  'candidate enumeration returns the expected account'
);
select is(
  (select reason_code from public.list_account_retention_candidates(now())),
  'abandoned_draft'::text,
  'candidate reason is explainable'
);
select ok(
  (select eligible_at <= now() from public.list_account_retention_candidates(now())),
  'candidate exposes the policy-derived eligibility timestamp'
);

update public.account_retention_holds
set released_at = now()
where user_id = '10000000-0000-0000-0000-000000000005';

select is(
  (select count(*) from public.list_account_retention_candidates(now())),
  2::bigint,
  'released retention hold makes the otherwise eligible draft visible'
);

insert into public.onboarding_progress (user_id, current_stage, completed_stages)
values (
  '10000000-0000-0000-0000-000000000001',
  'identity',
  array['eligibility', 'account']::text[]
);

select is(
  (select count(*) from public.list_account_retention_candidates(now())),
  1::bigint,
  'new onboarding activity immediately removes the account from candidacy'
);
select is(
  (select user_id from public.list_account_retention_candidates(now())),
  '10000000-0000-0000-0000-000000000005'::uuid,
  'only the released-hold account remains after candidate activity'
);

select * from finish();
rollback;
