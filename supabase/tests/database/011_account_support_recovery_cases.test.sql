begin;

select plan(38);

select has_table('public', 'account_support_cases', 'account support cases table exists');
select has_table('public', 'account_support_case_events', 'append-only support case event table exists');
select ok(
  not has_table_privilege('anon', 'public.account_support_cases', 'SELECT'),
  'anon cannot read account support cases'
);
select ok(
  not has_table_privilege('authenticated', 'public.account_support_cases', 'SELECT'),
  'authenticated users cannot read account support cases'
);
select ok(
  has_table_privilege('service_role', 'public.account_support_cases', 'SELECT'),
  'service role can read account support cases'
);
select ok(
  not has_table_privilege('service_role', 'public.account_support_cases', 'INSERT'),
  'service role cannot bypass the case-opening function'
);
select ok(
  not has_table_privilege('service_role', 'public.account_support_cases', 'UPDATE'),
  'service role cannot bypass the transition function'
);
select ok(
  has_table_privilege('service_role', 'public.account_support_case_events', 'SELECT'),
  'service role can inspect append-only case events'
);
select ok(
  not has_table_privilege('service_role', 'public.account_support_case_events', 'INSERT'),
  'service role cannot write case events directly'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.open_account_support_case(public.account_support_case_kind,uuid,uuid,text,text,text[])',
    'EXECUTE'
  ),
  'anon cannot open account support cases'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.open_account_support_case(public.account_support_case_kind,uuid,uuid,text,text,text[])',
    'EXECUTE'
  ),
  'authenticated users cannot open internal account support cases'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.open_account_support_case(public.account_support_case_kind,uuid,uuid,text,text,text[])',
    'EXECUTE'
  ),
  'service role can open account support cases'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.transition_account_support_case(uuid,public.account_support_case_state,public.account_support_case_state,text,text,text[])',
    'EXECUTE'
  ),
  'service role can transition account support cases'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'support-primary@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'support-related@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'support-mailbox@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

create temporary table support_test_cases (
  name text primary key,
  id uuid not null
);

insert into support_test_cases (name, id)
values (
  'duplicate',
  public.open_account_support_case(
    'duplicate_account',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    'ticket-duplicate-001',
    'operator-001',
    array['evidence-object-001', 'evidence-object-002']
  )
);

select ok(
  (select id is not null from support_test_cases where name = 'duplicate'),
  'duplicate-account investigation receives a case id'
);
select is(
  (select kind from public.account_support_cases where id = (select id from support_test_cases where name = 'duplicate')),
  'duplicate_account'::public.account_support_case_kind,
  'duplicate-account case records the intended kind'
);
select is(
  (select state from public.account_support_cases where id = (select id from support_test_cases where name = 'duplicate')),
  'open'::public.account_support_case_state,
  'new support case starts open'
);
select is(
  (select count(*) from public.account_support_case_events where case_id = (select id from support_test_cases where name = 'duplicate')),
  1::bigint,
  'case opening creates one append-only event'
);
select ok(
  (
    select payload ? 'kind'
       and payload ? 'state'
       and payload ? 'evidence_count'
       and not (payload ?| array['primary_user_id', 'related_user_id', 'external_reference', 'evidence_references'])
    from public.audit_events
    where event_type = 'account_support_case_opened'
      and entity_id = (select id::text from support_test_cases where name = 'duplicate')
  ),
  'support audit payload is sanitized and excludes account/evidence identifiers'
);
select ok(
  (
    select actor_user_id is null and subject_user_id is null
    from public.audit_events
    where event_type = 'account_support_case_opened'
      and entity_id = (select id::text from support_test_cases where name = 'duplicate')
  ),
  'support audit event does not retain user identifiers'
);

select throws_ok(
  $$
    select public.open_account_support_case(
      'duplicate_account',
      '20000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      'ticket-invalid-same-account',
      'operator-001',
      '{}'
    )
  $$,
  'P0001',
  'duplicate-account case requires two distinct accounts',
  'duplicate-account case rejects identical account references'
);

select throws_ok(
  $$
    select public.open_account_support_case(
      'mailbox_access_loss',
      '20000000-0000-0000-0000-000000000003',
      null,
      'ticket-invalid-evidence',
      'operator-001',
      array['raw-mailbox@example.test']
    )
  $$,
  'P0001',
  'invalid opaque evidence reference',
  'raw mailbox addresses are rejected as evidence references'
);

insert into support_test_cases (name, id)
values (
  'mailbox',
  public.open_account_support_case(
    'mailbox_access_loss',
    '20000000-0000-0000-0000-000000000003',
    null,
    'ticket-mailbox-001',
    'operator-002',
    array['support-upload-003']
  )
);

select ok(
  (select id is not null from support_test_cases where name = 'mailbox'),
  'mailbox-access-loss investigation receives a case id'
);
select ok(
  (select related_user_id is null from public.account_support_cases where id = (select id from support_test_cases where name = 'mailbox')),
  'mailbox-access-loss case does not attach an unrelated second account'
);

select is(
  public.transition_account_support_case(
    (select id from support_test_cases where name = 'duplicate'),
    'open',
    'under_review',
    'operator-003'
  ),
  'under_review'::public.account_support_case_state,
  'open case can move to under review'
);

select throws_ok(
  format(
    $$select public.transition_account_support_case(%L::uuid, 'open', 'evidence_pending', 'operator-004')$$,
    (select id from support_test_cases where name = 'duplicate')
  ),
  'P0001',
  'stale support case state',
  'optimistic expected state rejects a stale transition'
);

select throws_ok(
  format(
    $$select public.transition_account_support_case(%L::uuid, 'under_review', 'resolved', 'operator-004')$$,
    (select id from support_test_cases where name = 'duplicate')
  ),
  'P0001',
  'resolution code required',
  'resolved transition requires a controlled resolution code'
);

select is(
  public.transition_account_support_case(
    (select id from support_test_cases where name = 'duplicate'),
    'under_review',
    'resolved',
    'operator-004',
    'manual_identity_review_complete',
    array['evidence-object-001', 'review-decision-004']
  ),
  'resolved'::public.account_support_case_state,
  'reviewed case can be resolved without mutating either account'
);

select is(
  public.transition_account_support_case(
    (select id from support_test_cases where name = 'duplicate'),
    'resolved',
    'closed',
    'operator-005'
  ),
  'closed'::public.account_support_case_state,
  'resolved case can be closed'
);
select ok(
  (select closed_at is not null from public.account_support_cases where id = (select id from support_test_cases where name = 'duplicate')),
  'closed case records its closure timestamp'
);

select throws_ok(
  format(
    $$select public.transition_account_support_case(%L::uuid, 'closed', 'under_review', 'operator-006')$$,
    (select id from support_test_cases where name = 'duplicate')
  ),
  'P0001',
  'invalid support case transition',
  'closed support case is terminal'
);

select is(
  (select count(*) from public.account_support_case_events where case_id = (select id from support_test_cases where name = 'duplicate')),
  4::bigint,
  'duplicate case has one opening and three transition events'
);
select is(
  (select count(*) from auth.users where id::text like '20000000-0000-0000-0000-%'),
  3::bigint,
  'case opening and resolution do not mutate Auth accounts'
);
select is(
  (
    select count(*)
    from pg_proc function
    join pg_namespace namespace on namespace.oid = function.pronamespace
    where namespace.nspname = 'public'
      and function.proname in (
        'merge_account_support_case',
        'restore_account_access',
        'change_account_email',
        'delete_account_support_subject'
      )
  ),
  0::bigint,
  'no account merge, Auth restoration, e-mail change or support deletion function exists'
);

delete from auth.users
where id in (
  '20000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002'
);

select is(
  (select count(*) from public.account_support_cases where id = (select id from support_test_cases where name = 'duplicate')),
  1::bigint,
  'support case remains after referenced Auth accounts are deleted'
);
select ok(
  (select primary_user_id is null from public.account_support_cases where id = (select id from support_test_cases where name = 'duplicate')),
  'deleted primary account reference is anonymized to null'
);
select ok(
  (select related_user_id is null from public.account_support_cases where id = (select id from support_test_cases where name = 'duplicate')),
  'deleted related account reference is anonymized to null'
);
select is(
  (select primary_user_id from public.account_support_cases where id = (select id from support_test_cases where name = 'mailbox')),
  '20000000-0000-0000-0000-000000000003'::uuid,
  'unrelated mailbox-loss case retains its existing account reference'
);
select is(
  (select count(*) from public.account_support_case_events where case_id = (select id from support_test_cases where name = 'duplicate')),
  4::bigint,
  'append-only support history remains after account-reference anonymization'
);

select * from finish();
rollback;
