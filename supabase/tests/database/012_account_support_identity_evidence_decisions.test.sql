begin;

select plan(62);

select has_table('public', 'account_support_evidence_assertions', 'identity evidence assertions table exists');
select has_table('public', 'account_support_decisions', 'support decisions table exists');
select has_table('public', 'account_support_decision_events', 'append-only support decision events table exists');
select ok(
  not has_table_privilege('anon', 'public.account_support_evidence_assertions', 'SELECT'),
  'anon cannot read support evidence'
);
select ok(
  not has_table_privilege('authenticated', 'public.account_support_decisions', 'SELECT'),
  'authenticated users cannot read support decisions'
);
select ok(
  has_table_privilege('service_role', 'public.account_support_evidence_assertions', 'SELECT'),
  'service role can read support evidence'
);
select ok(
  has_table_privilege('service_role', 'public.account_support_decisions', 'SELECT'),
  'service role can read support decisions'
);
select ok(
  has_table_privilege('service_role', 'public.account_support_decision_events', 'SELECT'),
  'service role can read decision events'
);
select ok(
  not has_table_privilege('service_role', 'public.account_support_evidence_assertions', 'INSERT'),
  'service role cannot insert evidence directly'
);
select ok(
  not has_table_privilege('service_role', 'public.account_support_decisions', 'UPDATE'),
  'service role cannot update decisions directly'
);
select ok(
  not has_table_privilege('service_role', 'public.account_support_decision_events', 'INSERT'),
  'service role cannot append decision events directly'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.register_account_support_evidence(uuid,public.account_support_evidence_category,public.account_support_evidence_scope,public.account_support_evidence_assessment,text,text)',
    'EXECUTE'
  ),
  'anon cannot register support evidence'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.propose_account_support_decision(uuid,public.account_support_decision_outcome,text,text)',
    'EXECUTE'
  ),
  'authenticated users cannot propose support decisions'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.register_account_support_evidence(uuid,public.account_support_evidence_category,public.account_support_evidence_scope,public.account_support_evidence_assessment,text,text)',
    'EXECUTE'
  ),
  'service role can register support evidence through the controlled function'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.propose_account_support_decision(uuid,public.account_support_decision_outcome,text,text)',
    'EXECUTE'
  ),
  'service role can propose support decisions through the controlled function'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.review_account_support_decision(uuid,public.account_support_decision_state,public.account_support_review_action,text,text)',
    'EXECUTE'
  ),
  'service role can review support decisions through the controlled function'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'evidence-primary@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'evidence-related@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'evidence-mailbox@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

create temporary table wp065e_cases (
  name text primary key,
  id uuid not null
);

insert into wp065e_cases (name, id) values
  ('approve', public.open_account_support_case(
    'duplicate_account',
    '30000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    'ticket-wp065e-approve', 'operator-intake-01', '{}'
  )),
  ('mailbox', public.open_account_support_case(
    'mailbox_access_loss',
    '30000000-0000-0000-0000-000000000003',
    null,
    'ticket-wp065e-mailbox', 'operator-intake-02', '{}'
  )),
  ('conflict', public.open_account_support_case(
    'duplicate_account',
    '30000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    'ticket-wp065e-conflict', 'operator-intake-03', '{}'
  )),
  ('coverage', public.open_account_support_case(
    'duplicate_account',
    '30000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    'ticket-wp065e-coverage', 'operator-intake-04', '{}'
  )),
  ('evidence_stale', public.open_account_support_case(
    'duplicate_account',
    '30000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    'ticket-wp065e-evidence-stale', 'operator-intake-05', '{}'
  )),
  ('state_stale', public.open_account_support_case(
    'duplicate_account',
    '30000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    'ticket-wp065e-state-stale', 'operator-intake-06', '{}'
  ));

select public.transition_account_support_case(id, 'open', 'under_review', 'operator-triage-01')
from wp065e_cases;

create temporary table wp065e_decisions (
  name text primary key,
  id uuid not null
);

create temporary table wp065e_evidence (
  name text primary key,
  id uuid not null
);

insert into wp065e_evidence (name, id) values (
  'approve-primary',
  public.register_account_support_evidence(
    (select id from wp065e_cases where name = 'approve'),
    'trusted_account_session', 'primary_account', 'supports',
    'session-proof-approve-primary', 'operator-evidence-01'
  )
);
select ok((select id is not null from wp065e_evidence where name = 'approve-primary'), 'strong primary evidence receives an id');
select is(
  (select strength from public.account_support_evidence_assertions where id = (select id from wp065e_evidence where name = 'approve-primary')),
  'strong'::public.account_support_evidence_strength,
  'evidence strength is derived from the controlled category'
);

insert into wp065e_evidence (name, id) values (
  'approve-related',
  public.register_account_support_evidence(
    (select id from wp065e_cases where name = 'approve'),
    'historical_account_knowledge', 'related_account', 'supports',
    'history-proof-approve-related', 'operator-evidence-02'
  )
);
select ok((select id is not null from wp065e_evidence where name = 'approve-related'), 'corroborating related-account evidence receives an id');
select ok(
  exists (
    select 1
    from public.audit_events
    where event_type = 'account_support_evidence_registered'
      and entity_id = (select id::text from wp065e_cases where name = 'approve')
      and payload ?& array['category', 'subject_scope', 'strength', 'assessment']
      and not (payload ?| array['evidence_reference', 'recorded_by', 'primary_user_id', 'related_user_id'])
  ),
  'evidence audit payload is sanitized'
);

insert into wp065e_decisions (name, id) values (
  'approve',
  public.propose_account_support_decision(
    (select id from wp065e_cases where name = 'approve'),
    'approved_for_action', 'operator-proposer-01', 'evidence_rules_passed'
  )
);
select ok((select id is not null from wp065e_decisions where name = 'approve'), 'approval proposal receives a decision id');
select ok(
  (
    select supporting_count = 2
       and conflict_count = 0
       and strong_support_count = 1
       and distinct_support_category_count = 2
       and primary_coverage_count = 1
       and related_coverage_count = 1
    from public.account_support_decisions
    where id = (select id from wp065e_decisions where name = 'approve')
  ),
  'approval proposal snapshots the qualifying evidence counts'
);
select is(
  (select count(*) from public.account_support_decision_events where decision_id = (select id from wp065e_decisions where name = 'approve')),
  1::bigint,
  'proposal creates one append-only decision event'
);
select throws_ok(
  format(
    $$select public.review_account_support_decision(%L::uuid, 'proposed', 'approve', 'operator-proposer-01', 'self-review')$$,
    (select id from wp065e_decisions where name = 'approve')
  ),
  'P0001',
  'decision proposer cannot review own proposal',
  'proposer cannot approve the same decision'
);
select is(
  public.review_account_support_decision(
    (select id from wp065e_decisions where name = 'approve'),
    'proposed', 'approve', 'operator-reviewer-01', 'independent-review-passed'
  ),
  'approved'::public.account_support_decision_state,
  'independent reviewer can approve a qualifying proposal'
);
select ok(
  (
    select reviewed_by <> proposed_by
    from public.account_support_decisions
    where id = (select id from wp065e_decisions where name = 'approve')
  ),
  'approved decision records separation of duties'
);
select is(
  (select count(*) from public.account_support_decision_events where decision_id = (select id from wp065e_decisions where name = 'approve')),
  2::bigint,
  'approved decision has proposal and review events'
);
select ok(
  exists (
    select 1
    from public.audit_events
    where event_type = 'account_support_decision_reviewed'
      and entity_id = (select id::text from wp065e_decisions where name = 'approve')
      and payload ?& array['outcome', 'review_action', 'review_state']
      and not (payload ?| array['operator_reference', 'reviewed_by', 'evidence_reference', 'case_id'])
  ),
  'decision-review audit payload is sanitized'
);
select is(
  (select count(*) from auth.users where id::text like '30000000-0000-0000-0000-%'),
  3::bigint,
  'evidence and decision approval do not mutate Auth accounts'
);
select throws_ok(
  format(
    $$select public.review_account_support_decision(%L::uuid, 'proposed', 'approve', 'operator-reviewer-02', 'second-review')$$,
    (select id from wp065e_decisions where name = 'approve')
  ),
  'P0001',
  'stale support decision state',
  'approved decision cannot be reviewed again'
);

select ok(
  public.register_account_support_evidence(
    (select id from wp065e_cases where name = 'mailbox'),
    'provider_possession', 'primary_account', 'supports',
    'provider-proof-mailbox-1', 'operator-evidence-03'
  ) is not null,
  'mailbox-loss case accepts strong primary-account evidence'
);
select throws_ok(
  format(
    $$select public.propose_account_support_decision(%L::uuid, 'approved_for_action', 'operator-proposer-02', 'one-proof-only')$$,
    (select id from wp065e_cases where name = 'mailbox')
  ),
  'P0001',
  'evidence package does not meet approval rules',
  'one evidence assertion is insufficient for mailbox-loss approval'
);
select throws_ok(
  format(
    $$select public.register_account_support_evidence(%L::uuid, 'historical_account_knowledge', 'primary_account', 'supports', 'raw-mailbox@example.test', 'operator-evidence-03')$$,
    (select id from wp065e_cases where name = 'mailbox')
  ),
  'P0001',
  'invalid opaque evidence reference',
  'raw mailbox addresses are rejected from identity evidence'
);
select throws_ok(
  format(
    $$select public.register_account_support_evidence(%L::uuid, 'historical_account_knowledge', 'related_account', 'supports', 'invalid-related-mailbox', 'operator-evidence-03')$$,
    (select id from wp065e_cases where name = 'mailbox')
  ),
  'P0001',
  'mailbox-access-loss evidence must scope to the primary account',
  'mailbox-loss evidence cannot attach a related-account scope'
);
select ok(
  public.register_account_support_evidence(
    (select id from wp065e_cases where name = 'mailbox'),
    'device_or_recovery_reference', 'primary_account', 'supports',
    'device-proof-mailbox-2', 'operator-evidence-04'
  ) is not null,
  'mailbox-loss case accepts a second distinct corroborating category'
);
insert into wp065e_decisions (name, id) values (
  'mailbox',
  public.propose_account_support_decision(
    (select id from wp065e_cases where name = 'mailbox'),
    'approved_for_action', 'operator-proposer-02', 'mailbox-evidence-rules-passed'
  )
);
select ok((select id is not null from wp065e_decisions where name = 'mailbox'), 'qualifying mailbox-loss proposal receives an id');
select is(
  public.review_account_support_decision(
    (select id from wp065e_decisions where name = 'mailbox'),
    'proposed', 'reject', 'operator-reviewer-02', 'independent-review-rejected'
  ),
  'rejected'::public.account_support_decision_state,
  'independent reviewer may reject a qualifying proposal without executing action'
);
select throws_ok(
  format(
    $$select public.review_account_support_decision(%L::uuid, 'proposed', 'approve', 'operator-reviewer-03', 'late-review')$$,
    (select id from wp065e_decisions where name = 'mailbox')
  ),
  'P0001',
  'stale support decision state',
  'rejected decision is terminal'
);

select ok(
  public.register_account_support_evidence(
    (select id from wp065e_cases where name = 'conflict'),
    'trusted_account_session', 'primary_account', 'supports',
    'support-proof-conflict', 'operator-evidence-05'
  ) is not null,
  'conflict case records supporting evidence'
);
select ok(
  public.register_account_support_evidence(
    (select id from wp065e_cases where name = 'conflict'),
    'provider_possession', 'related_account', 'conflicts',
    'conflict-proof-related', 'operator-evidence-06'
  ) is not null,
  'conflict case records conflicting evidence'
);
select throws_ok(
  format(
    $$select public.propose_account_support_decision(%L::uuid, 'approved_for_action', 'operator-proposer-03', 'conflict-ignored')$$,
    (select id from wp065e_cases where name = 'conflict')
  ),
  'P0001',
  'evidence package does not meet approval rules',
  'conflicting evidence blocks approval'
);
select throws_ok(
  format(
    $$select public.propose_account_support_decision(%L::uuid, 'insufficient_evidence', 'operator-proposer-03', 'conflict-misclassified')$$,
    (select id from wp065e_cases where name = 'conflict')
  ),
  'P0001',
  'conflicting evidence requires rejection or escalation',
  'conflicting evidence cannot be classified as merely insufficient'
);
insert into wp065e_decisions (name, id) values (
  'conflict',
  public.propose_account_support_decision(
    (select id from wp065e_cases where name = 'conflict'),
    'rejected', 'operator-proposer-03', 'material-conflict-found'
  )
);
select ok((select id is not null from wp065e_decisions where name = 'conflict'), 'conflicting evidence permits a rejection proposal');
select is(
  public.review_account_support_decision(
    (select id from wp065e_decisions where name = 'conflict'),
    'proposed', 'approve', 'operator-reviewer-03', 'rejection-confirmed'
  ),
  'approved'::public.account_support_decision_state,
  'independent reviewer can approve the proposed rejection outcome'
);
select is(
  (select outcome from public.account_support_decisions where id = (select id from wp065e_decisions where name = 'conflict')),
  'rejected'::public.account_support_decision_outcome,
  'approved review retains the controlled rejected outcome'
);

select ok(
  public.register_account_support_evidence(
    (select id from wp065e_cases where name = 'coverage'),
    'trusted_account_session', 'primary_account', 'supports',
    'coverage-primary-strong', 'operator-evidence-07'
  ) is not null,
  'coverage case records primary strong evidence'
);
select ok(
  public.register_account_support_evidence(
    (select id from wp065e_cases where name = 'coverage'),
    'historical_account_knowledge', 'primary_account', 'supports',
    'coverage-primary-corroborating', 'operator-evidence-08'
  ) is not null,
  'coverage case records a second primary category'
);
select throws_ok(
  format(
    $$select public.propose_account_support_decision(%L::uuid, 'approved_for_action', 'operator-proposer-04', 'related-account-uncovered')$$,
    (select id from wp065e_cases where name = 'coverage')
  ),
  'P0001',
  'evidence package does not meet approval rules',
  'duplicate-account approval requires evidence coverage for both accounts'
);

select ok(
  public.register_account_support_evidence(
    (select id from wp065e_cases where name = 'evidence_stale'),
    'trusted_account_session', 'primary_account', 'supports',
    'stale-evidence-primary', 'operator-evidence-09'
  ) is not null,
  'evidence-stale case records primary support'
);
select ok(
  public.register_account_support_evidence(
    (select id from wp065e_cases where name = 'evidence_stale'),
    'historical_account_knowledge', 'related_account', 'supports',
    'stale-evidence-related', 'operator-evidence-10'
  ) is not null,
  'evidence-stale case records related support'
);
insert into wp065e_decisions (name, id) values (
  'evidence_stale',
  public.propose_account_support_decision(
    (select id from wp065e_cases where name = 'evidence_stale'),
    'approved_for_action', 'operator-proposer-05', 'initial-evidence-package'
  )
);
select ok((select id is not null from wp065e_decisions where name = 'evidence_stale'), 'evidence-stale proposal is created');
select ok(
  public.register_account_support_evidence(
    (select id from wp065e_cases where name = 'evidence_stale'),
    'other_opaque_reference', 'shared_identity', 'inconclusive',
    'late-inconclusive-reference', 'operator-evidence-11'
  ) is not null,
  'new evidence can be recorded after proposal for re-evaluation'
);
select throws_ok(
  format(
    $$select public.review_account_support_decision(%L::uuid, 'proposed', 'approve', 'operator-reviewer-05', 'stale-package')$$,
    (select id from wp065e_decisions where name = 'evidence_stale')
  ),
  'P0001',
  'evidence package changed after decision proposal',
  'evidence fingerprint invalidates stale review'
);

select ok(
  public.register_account_support_evidence(
    (select id from wp065e_cases where name = 'state_stale'),
    'trusted_account_session', 'primary_account', 'supports',
    'state-stale-primary', 'operator-evidence-12'
  ) is not null,
  'state-stale case records primary support'
);
select ok(
  public.register_account_support_evidence(
    (select id from wp065e_cases where name = 'state_stale'),
    'historical_account_knowledge', 'related_account', 'supports',
    'state-stale-related', 'operator-evidence-13'
  ) is not null,
  'state-stale case records related support'
);
insert into wp065e_decisions (name, id) values (
  'state_stale',
  public.propose_account_support_decision(
    (select id from wp065e_cases where name = 'state_stale'),
    'approved_for_action', 'operator-proposer-06', 'initial-case-state'
  )
);
select ok((select id is not null from wp065e_decisions where name = 'state_stale'), 'case-state-stale proposal is created');
select is(
  public.transition_account_support_case(
    (select id from wp065e_cases where name = 'state_stale'),
    'under_review', 'escalated', 'operator-triage-02'
  ),
  'escalated'::public.account_support_case_state,
  'case may change state after a proposal'
);
select throws_ok(
  format(
    $$select public.review_account_support_decision(%L::uuid, 'proposed', 'approve', 'operator-reviewer-06', 'stale-case')$$,
    (select id from wp065e_decisions where name = 'state_stale')
  ),
  'P0001',
  'support case changed after decision proposal',
  'case-state snapshot invalidates stale review'
);

select is(
  (
    select count(*)
    from pg_proc function
    join pg_namespace namespace on namespace.oid = function.pronamespace
    where namespace.nspname = 'public'
      and function.proname in (
        'execute_account_support_action',
        'merge_account_support_accounts',
        'change_account_auth_email',
        'restore_account_access',
        'delete_account_support_subject'
      )
  ),
  0::bigint,
  'no account merge, Auth mutation, restoration, deletion or action-execution function exists'
);

delete from auth.users
where id in (
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002'
);

select ok(
  exists (
    select 1 from public.account_support_evidence_assertions
    where case_id = (select id from wp065e_cases where name = 'approve')
  ),
  'evidence history remains after account-reference anonymization'
);
select ok(
  exists (
    select 1 from public.account_support_decisions
    where case_id = (select id from wp065e_cases where name = 'approve')
  ),
  'decision history remains after account-reference anonymization'
);
select ok(
  (
    select primary_user_id is null and related_user_id is null
    from public.account_support_cases
    where id = (select id from wp065e_cases where name = 'approve')
  ),
  'referenced account ids are anonymized while support-decision history remains'
);

select * from finish();
rollback;
