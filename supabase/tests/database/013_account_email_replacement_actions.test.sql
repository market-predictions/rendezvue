begin;

select plan(58);

select has_table('public', 'account_email_replacement_actions', 'email replacement action table exists');
select has_table('public', 'account_email_replacement_events', 'append-only email replacement events table exists');
select ok(not has_table_privilege('anon', 'public.account_email_replacement_actions', 'SELECT'), 'anon cannot read email replacement actions');
select ok(not has_table_privilege('authenticated', 'public.account_email_replacement_actions', 'SELECT'), 'authenticated users cannot read email replacement actions');
select ok(has_table_privilege('service_role', 'public.account_email_replacement_actions', 'SELECT'), 'service role can read email replacement actions');
select ok(not has_table_privilege('service_role', 'public.account_email_replacement_actions', 'INSERT'), 'service role cannot insert actions directly');
select ok(not has_table_privilege('service_role', 'public.account_email_replacement_actions', 'UPDATE'), 'service role cannot update actions directly');
select ok(has_table_privilege('service_role', 'public.account_email_replacement_events', 'SELECT'), 'service role can read replacement events');
select ok(not has_table_privilege('service_role', 'public.account_email_replacement_events', 'INSERT'), 'service role cannot insert replacement events directly');
select ok(not has_function_privilege('anon', 'public.request_account_email_replacement(uuid,text,text,text,text,text,text,text)', 'EXECUTE'), 'anon cannot request email replacement');
select ok(not has_function_privilege('authenticated', 'public.request_account_email_replacement(uuid,text,text,text,text,text,text,text)', 'EXECUTE'), 'authenticated user cannot request email replacement');
select ok(has_function_privilege('service_role', 'public.request_account_email_replacement(uuid,text,text,text,text,text,text,text)', 'EXECUTE'), 'service role can request through controlled function');
select ok(has_function_privilege('service_role', 'public.approve_account_email_replacement(uuid,public.account_email_replacement_state,text)', 'EXECUTE'), 'service role can approve through controlled function');
select ok(has_function_privilege('service_role', 'public.get_account_email_replacement_execution_context(uuid,text)', 'EXECUTE'), 'service role can read controlled execution context');
select ok(has_function_privilege('service_role', 'public.claim_account_email_replacement_execution(uuid,text,text)', 'EXECUTE'), 'service role can claim controlled execution');
select ok(has_function_privilege('service_role', 'public.complete_account_email_replacement(uuid,text,text,boolean)', 'EXECUTE'), 'service role can finalize controlled execution');
select ok(has_function_privilege('service_role', 'public.fail_account_email_replacement(uuid,text,text,text,boolean)', 'EXECUTE'), 'service role can contain failed execution');
select ok(has_function_privilege('service_role', 'public.cancel_account_email_replacement(uuid,public.account_email_replacement_state,text)', 'EXECUTE'), 'service role can cancel through controlled function');
select is(
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'account_email_replacement_actions' and column_name in ('email', 'current_email', 'target_email', 'old_email', 'new_email')),
  0::bigint,
  'action table has no plaintext email column'
);
select is(
  public.account_support_email_fingerprint('  Owner@Example.Test '),
  public.account_support_email_fingerprint('owner@example.test'),
  'email fingerprint is normalized and deterministic'
);
select isnt(
  public.account_support_email_fingerprint('owner@example.test'),
  public.account_support_email_fingerprint('new-owner@example.test'),
  'different normalized emails have different fingerprints'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'owner-old@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'stale-owner@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'conflict-primary@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'occupied-target@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

create temporary table email_replacement_fixture (
  name text primary key,
  case_id uuid,
  decision_id uuid,
  action_id uuid
);

insert into email_replacement_fixture (name, case_id)
values (
  'main',
  public.open_account_support_case(
    'mailbox_access_loss',
    '30000000-0000-0000-0000-000000000001',
    null,
    'ticket-email-replacement-main',
    'operator-proposer-main',
    array['target-mailbox-proof-main', 'manual-review-proof-main']
  )
);

select public.transition_account_support_case(
  (select case_id from email_replacement_fixture where name = 'main'),
  'open', 'under_review', 'operator-proposer-main'
);
select public.register_account_support_evidence(
  (select case_id from email_replacement_fixture where name = 'main'),
  'provider_possession', 'primary_account', 'supports',
  'target-mailbox-proof-main', 'operator-proposer-main'
);
select public.register_account_support_evidence(
  (select case_id from email_replacement_fixture where name = 'main'),
  'manual_identity_review_reference', 'primary_account', 'supports',
  'manual-review-proof-main', 'operator-proposer-main'
);
update email_replacement_fixture
set decision_id = public.propose_account_support_decision(
  case_id, 'approved_for_action', 'operator-proposer-main', 'mailbox-loss-evidence-ready'
)
where name = 'main';
select public.review_account_support_decision(
  (select decision_id from email_replacement_fixture where name = 'main'),
  'proposed', 'approve', 'operator-reviewer-main', 'independent-review-approved'
);

select throws_ok(
  format(
    $$select public.request_account_email_replacement(%L::uuid,%L,%L,'target-mailbox-proof-main',null,'mailbox_inaccessible','idem-main-email-replacement-0001','operator-reviewer-main')$$,
    (select decision_id from email_replacement_fixture where name = 'main'),
    public.account_support_email_fingerprint('owner-old@rendezvue.test'),
    public.account_support_email_fingerprint('owner-new@rendezvue.test')
  ),
  'P0001', 'email replacement requester must be the decision proposer',
  'independent reviewer cannot impersonate the original requester'
);
select throws_ok(
  format(
    $$select public.request_account_email_replacement(%L::uuid,%L,%L,'unknown-mailbox-proof',null,'mailbox_inaccessible','idem-main-email-replacement-0002','operator-proposer-main')$$,
    (select decision_id from email_replacement_fixture where name = 'main'),
    public.account_support_email_fingerprint('owner-old@rendezvue.test'),
    public.account_support_email_fingerprint('owner-new@rendezvue.test')
  ),
  'P0001', 'target mailbox possession evidence required',
  'request requires the approved target-mailbox evidence reference'
);
select throws_ok(
  format(
    $$select public.request_account_email_replacement(%L::uuid,%L,%L,'raw@example.test',null,'mailbox_inaccessible','idem-main-email-replacement-0003','operator-proposer-main')$$,
    (select decision_id from email_replacement_fixture where name = 'main'),
    public.account_support_email_fingerprint('owner-old@rendezvue.test'),
    public.account_support_email_fingerprint('owner-new@rendezvue.test')
  ),
  'P0001', 'invalid target mailbox verification reference',
  'raw email-shaped verification references are rejected'
);

update email_replacement_fixture
set action_id = public.request_account_email_replacement(
  decision_id,
  public.account_support_email_fingerprint('owner-old@rendezvue.test'),
  public.account_support_email_fingerprint('owner-new@rendezvue.test'),
  'target-mailbox-proof-main',
  null,
  'mailbox_inaccessible',
  'idem-main-email-replacement-0004',
  'operator-proposer-main'
)
where name = 'main';

select ok((select action_id is not null from email_replacement_fixture where name = 'main'), 'valid email replacement request receives an action id');
select is(
  (select state from public.account_email_replacement_actions where id = (select action_id from email_replacement_fixture where name = 'main')),
  'requested'::public.account_email_replacement_state,
  'new action starts requested'
);
select is(
  (select user_id from public.account_email_replacement_actions where id = (select action_id from email_replacement_fixture where name = 'main')),
  '30000000-0000-0000-0000-000000000001'::uuid,
  'action derives its Auth user from the support case'
);
select is(
  public.request_account_email_replacement(
    (select decision_id from email_replacement_fixture where name = 'main'),
    public.account_support_email_fingerprint('owner-old@rendezvue.test'),
    public.account_support_email_fingerprint('owner-new@rendezvue.test'),
    'target-mailbox-proof-main', null, 'mailbox_inaccessible',
    'idem-main-email-replacement-0004', 'operator-proposer-main'
  ),
  (select action_id from email_replacement_fixture where name = 'main'),
  'identical idempotent request returns the existing action'
);
select is(
  (select count(*) from public.account_email_replacement_events where action_id = (select action_id from email_replacement_fixture where name = 'main')),
  1::bigint,
  'idempotent request does not duplicate events'
);
select ok(
  (
    select payload ? 'case_kind'
       and payload ? 'decision_outcome'
       and payload ? 'pre_change_notice_exception'
       and not (payload ?| array['user_id','current_email','target_email','current_email_fingerprint','target_email_fingerprint','target_mailbox_verification_reference'])
    from public.audit_events
    where event_type = 'account_email_replacement_requested'
      and entity_id = (select action_id::text from email_replacement_fixture where name = 'main')
  ),
  'request audit payload is sanitized'
);
select throws_ok(
  format(
    $$select public.cancel_account_email_replacement(%L::uuid,'requested','operator-unrelated')$$,
    (select action_id from email_replacement_fixture where name = 'main')
  ),
  'P0001', 'email replacement cancellation operator not authorized',
  'unrelated operator cannot cancel a request with a null approver'
);
select throws_ok(
  format(
    $$select public.approve_account_email_replacement(%L::uuid,'requested','operator-proposer-main')$$,
    (select action_id from email_replacement_fixture where name = 'main')
  ),
  'P0001', 'email replacement approver must be the independent decision reviewer',
  'requester cannot approve their own action'
);
select is(
  public.approve_account_email_replacement(
    (select action_id from email_replacement_fixture where name = 'main'),
    'requested', 'operator-reviewer-main'
  ),
  'approved'::public.account_email_replacement_state,
  'independent reviewer approves the action'
);
select is(
  (select approved_by from public.account_email_replacement_actions where id = (select action_id from email_replacement_fixture where name = 'main')),
  'operator-reviewer-main',
  'approved action records the independent reviewer'
);
select ok(
  (select expires_at <= timezone('utc', now()) + interval '2 hours 1 minute' from public.account_email_replacement_actions where id = (select action_id from email_replacement_fixture where name = 'main')),
  'approval receives a short execution window'
);
select is(
  (select count(*) from public.get_account_email_replacement_execution_context((select action_id from email_replacement_fixture where name = 'main'),'idem-main-email-replacement-0004')),
  1::bigint,
  'matching idempotency key returns one execution context'
);
select is(
  (select target_email_fingerprint from public.get_account_email_replacement_execution_context((select action_id from email_replacement_fixture where name = 'main'),'idem-main-email-replacement-0004')),
  public.account_support_email_fingerprint('owner-new@rendezvue.test'),
  'execution context exposes only the approved target fingerprint'
);
select is(
  public.claim_account_email_replacement_execution(
    (select action_id from email_replacement_fixture where name = 'main'),
    'idem-main-email-replacement-0004', 'edge-email-replacement-v1'
  ),
  'executing'::public.account_email_replacement_state,
  'executor claims the approved action'
);
select is(
  (select attempt_count from public.account_email_replacement_actions where id = (select action_id from email_replacement_fixture where name = 'main')),
  1::smallint,
  'first execution claim increments attempt count once'
);
select is(
  public.claim_account_email_replacement_execution(
    (select action_id from email_replacement_fixture where name = 'main'),
    'idem-main-email-replacement-0004', 'edge-email-replacement-v1'
  ),
  'executing'::public.account_email_replacement_state,
  'same executor can idempotently reclaim an executing action'
);
select is(
  (select attempt_count from public.account_email_replacement_actions where id = (select action_id from email_replacement_fixture where name = 'main')),
  1::smallint,
  'idempotent reclaim does not increment attempts'
);
select throws_ok(
  format(
    $$select public.complete_account_email_replacement(%L::uuid,'idem-main-email-replacement-0004','edge-email-replacement-v1',true)$$,
    (select action_id from email_replacement_fixture where name = 'main')
  ),
  'P0001', 'Auth email does not match approved target',
  'database finalization is impossible before Auth actually changes'
);

update auth.users
set email = 'owner-new@rendezvue.test', updated_at = now()
where id = '30000000-0000-0000-0000-000000000001';

select is(
  public.complete_account_email_replacement(
    (select action_id from email_replacement_fixture where name = 'main'),
    'idem-main-email-replacement-0004', 'edge-email-replacement-v1', true
  ),
  'completed'::public.account_email_replacement_state,
  'action completes after Auth matches the approved target'
);
select is(
  (select state from public.account_email_replacement_actions where id = (select action_id from email_replacement_fixture where name = 'main')),
  'completed'::public.account_email_replacement_state,
  'completed action is terminal'
);
select ok(
  (select post_change_magic_link_requested from public.account_email_replacement_actions where id = (select action_id from email_replacement_fixture where name = 'main')),
  'completion records the new-address magic-link request'
);
select ok(
  (select completed_at is not null from public.account_email_replacement_actions where id = (select action_id from email_replacement_fixture where name = 'main')),
  'completion records its timestamp'
);
select is(
  (select count(*) from public.account_email_replacement_events where action_id = (select action_id from email_replacement_fixture where name = 'main')),
  4::bigint,
  'successful action has requested, approved, claimed and completed events'
);
select is(
  public.complete_account_email_replacement(
    (select action_id from email_replacement_fixture where name = 'main'),
    'idem-main-email-replacement-0004', 'edge-email-replacement-v1', true
  ),
  'completed'::public.account_email_replacement_state,
  'completion is idempotent'
);
select is(
  public.claim_account_email_replacement_execution(
    (select action_id from email_replacement_fixture where name = 'main'),
    'idem-main-email-replacement-0004', 'edge-email-replacement-v1'
  ),
  'completed'::public.account_email_replacement_state,
  'completed action reconciles without another attempt'
);
select ok(
  (
    select payload ? 'attempt_count'
       and payload ? 'magic_link_requested'
       and payload ->> 'plaintext_email_persisted' = 'false'
       and not (payload ?| array['user_id','current_email','target_email','current_email_fingerprint','target_email_fingerprint'])
    from public.audit_events
    where event_type = 'account_email_replacement_completed'
      and entity_id = (select action_id::text from email_replacement_fixture where name = 'main')
  ),
  'completion audit payload is sanitized'
);
select is(
  (select count(*) from auth.users where id::text like '30000000-0000-0000-0000-%'),
  4::bigint,
  'email replacement does not create, merge or delete Auth users'
);
select is(
  (
    select count(*)
    from pg_proc function
    join pg_namespace namespace on namespace.oid = function.pronamespace
    where namespace.nspname = 'public'
      and function.proname in ('merge_accounts','replace_account_password','delete_account_for_support','execute_account_merge')
  ),
  0::bigint,
  'no account merge, password or support deletion function exists'
);

-- Stale evidence blocks approval after an action was requested.
insert into email_replacement_fixture (name, case_id)
values ('stale', public.open_account_support_case('mailbox_access_loss','30000000-0000-0000-0000-000000000002',null,'ticket-email-replacement-stale','operator-proposer-stale',array['target-mailbox-proof-stale','manual-review-proof-stale']));
select public.transition_account_support_case((select case_id from email_replacement_fixture where name='stale'),'open','under_review','operator-proposer-stale');
select public.register_account_support_evidence((select case_id from email_replacement_fixture where name='stale'),'provider_possession','primary_account','supports','target-mailbox-proof-stale','operator-proposer-stale');
select public.register_account_support_evidence((select case_id from email_replacement_fixture where name='stale'),'manual_identity_review_reference','primary_account','supports','manual-review-proof-stale','operator-proposer-stale');
update email_replacement_fixture set decision_id = public.propose_account_support_decision(case_id,'approved_for_action','operator-proposer-stale','mailbox-loss-evidence-ready') where name='stale';
select public.review_account_support_decision((select decision_id from email_replacement_fixture where name='stale'),'proposed','approve','operator-reviewer-stale','independent-review-approved');
update email_replacement_fixture set action_id = public.request_account_email_replacement(decision_id,public.account_support_email_fingerprint('stale-owner@rendezvue.test'),public.account_support_email_fingerprint('stale-new@rendezvue.test'),'target-mailbox-proof-stale',null,'mailbox_inaccessible','idem-stale-email-replacement-001','operator-proposer-stale') where name='stale';
select public.register_account_support_evidence((select case_id from email_replacement_fixture where name='stale'),'historical_account_knowledge','primary_account','inconclusive','late-evidence-stale','operator-proposer-stale');
select throws_ok(
  format($$select public.approve_account_email_replacement(%L::uuid,'requested','operator-reviewer-stale')$$,(select action_id from email_replacement_fixture where name='stale')),
  'P0001','support decision is stale','evidence changes invalidate pending action approval'
);

-- A target already owned by another Auth user is rejected.
insert into email_replacement_fixture (name, case_id)
values ('conflict', public.open_account_support_case('mailbox_access_loss','30000000-0000-0000-0000-000000000003',null,'ticket-email-replacement-conflict','operator-proposer-conflict',array['target-mailbox-proof-conflict','manual-review-proof-conflict']));
select public.transition_account_support_case((select case_id from email_replacement_fixture where name='conflict'),'open','under_review','operator-proposer-conflict');
select public.register_account_support_evidence((select case_id from email_replacement_fixture where name='conflict'),'provider_possession','primary_account','supports','target-mailbox-proof-conflict','operator-proposer-conflict');
select public.register_account_support_evidence((select case_id from email_replacement_fixture where name='conflict'),'manual_identity_review_reference','primary_account','supports','manual-review-proof-conflict','operator-proposer-conflict');
update email_replacement_fixture set decision_id = public.propose_account_support_decision(case_id,'approved_for_action','operator-proposer-conflict','mailbox-loss-evidence-ready') where name='conflict';
select public.review_account_support_decision((select decision_id from email_replacement_fixture where name='conflict'),'proposed','approve','operator-reviewer-conflict','independent-review-approved');
select throws_ok(
  format(
    $$select public.request_account_email_replacement(%L::uuid,%L,%L,'target-mailbox-proof-conflict',null,'mailbox_inaccessible','idem-conflict-email-replacement-001','operator-proposer-conflict')$$,
    (select decision_id from email_replacement_fixture where name='conflict'),
    public.account_support_email_fingerprint('conflict-primary@rendezvue.test'),
    public.account_support_email_fingerprint('occupied-target@rendezvue.test')
  ),
  'P0001','target email already belongs to an Auth user','target address collision is fail-closed'
);

-- A recently completed replacement blocks another replacement for the same account.
insert into email_replacement_fixture (name, case_id)
values ('cooldown', public.open_account_support_case('mailbox_access_loss','30000000-0000-0000-0000-000000000001',null,'ticket-email-replacement-cooldown','operator-proposer-cooldown',array['target-mailbox-proof-cooldown','manual-review-proof-cooldown']));
select public.transition_account_support_case((select case_id from email_replacement_fixture where name='cooldown'),'open','under_review','operator-proposer-cooldown');
select public.register_account_support_evidence((select case_id from email_replacement_fixture where name='cooldown'),'provider_possession','primary_account','supports','target-mailbox-proof-cooldown','operator-proposer-cooldown');
select public.register_account_support_evidence((select case_id from email_replacement_fixture where name='cooldown'),'manual_identity_review_reference','primary_account','supports','manual-review-proof-cooldown','operator-proposer-cooldown');
update email_replacement_fixture set decision_id = public.propose_account_support_decision(case_id,'approved_for_action','operator-proposer-cooldown','mailbox-loss-evidence-ready') where name='cooldown';
select public.review_account_support_decision((select decision_id from email_replacement_fixture where name='cooldown'),'proposed','approve','operator-reviewer-cooldown','independent-review-approved');
select throws_ok(
  format(
    $$select public.request_account_email_replacement(%L::uuid,%L,%L,'target-mailbox-proof-cooldown',null,'mailbox_inaccessible','idem-cooldown-email-replacement-01','operator-proposer-cooldown')$$,
    (select decision_id from email_replacement_fixture where name='cooldown'),
    public.account_support_email_fingerprint('owner-new@rendezvue.test'),
    public.account_support_email_fingerprint('owner-third@rendezvue.test')
  ),
  'P0001','email replacement cooldown active','successful replacement enforces a thirty-day cooldown'
);

delete from auth.users where id = '30000000-0000-0000-0000-000000000001';
select is(
  (select count(*) from public.account_email_replacement_actions where id = (select action_id from email_replacement_fixture where name='main')),
  1::bigint,
  'replacement history remains after Auth account deletion'
);
select ok(
  (select user_id is null from public.account_email_replacement_actions where id = (select action_id from email_replacement_fixture where name='main')),
  'deleted Auth reference is anonymized to null'
);
select is(
  (select count(*) from public.account_email_replacement_events where action_id = (select action_id from email_replacement_fixture where name='main')),
  4::bigint,
  'append-only replacement history remains after account anonymization'
);

select * from finish();
rollback;
