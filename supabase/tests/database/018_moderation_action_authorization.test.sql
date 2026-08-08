begin;

select plan(67);

select has_table('public', 'moderation_action_proposals', 'moderation action proposal table exists');
select has_table('public', 'moderation_action_reviews', 'moderation action review table exists');
select has_column('public', 'moderation_action_proposals', 'case_version', 'proposal binds exact moderation case version');
select has_column('public', 'moderation_action_proposals', 'critical_escalation_required', 'proposal records critical escalation requirement');

select ok(not has_table_privilege('anon', 'public.moderation_action_proposals', 'SELECT'), 'anon cannot read moderation action proposals');
select ok(not has_table_privilege('authenticated', 'public.moderation_action_proposals', 'SELECT'), 'participants cannot read moderation action proposals');
select ok(has_table_privilege('service_role', 'public.moderation_action_proposals', 'SELECT'), 'service role can read moderation action proposals');
select ok(not has_table_privilege('service_role', 'public.moderation_action_proposals', 'INSERT'), 'service role cannot directly insert moderation action proposals');
select ok(not has_table_privilege('service_role', 'public.moderation_action_proposals', 'UPDATE'), 'service role cannot directly update moderation action proposals');
select ok(not has_table_privilege('authenticated', 'public.moderation_action_reviews', 'SELECT'), 'participants cannot read moderation action reviews');
select ok(has_table_privilege('service_role', 'public.moderation_action_reviews', 'SELECT'), 'service role can read moderation action reviews');
select ok(not has_table_privilege('service_role', 'public.moderation_action_reviews', 'INSERT'), 'service role cannot forge moderation action reviews');

select ok(not has_function_privilege('authenticated', 'public.list_pending_moderation_action_proposals(integer)', 'EXECUTE'), 'participants cannot list pending moderation action proposals');
select ok(has_function_privilege('service_role', 'public.list_pending_moderation_action_proposals(integer)', 'EXECUTE'), 'service role can list pending moderation action proposals');
select ok(not has_function_privilege('authenticated', 'public.propose_moderation_action(uuid,integer,text,text,text)', 'EXECUTE'), 'participants cannot propose moderation actions');
select ok(has_function_privilege('service_role', 'public.propose_moderation_action(uuid,integer,text,text,text)', 'EXECUTE'), 'service role can propose moderation actions through controlled RPC');
select ok(not has_function_privilege('authenticated', 'public.review_moderation_action_proposal(uuid,text,text,text)', 'EXECUTE'), 'participants cannot review moderation action proposals');
select ok(has_function_privilege('service_role', 'public.review_moderation_action_proposal(uuid,text,text,text)', 'EXECUTE'), 'service role can independently review moderation action proposals through controlled RPC');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '71000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'authorization-reporter@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '71000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'authorization-subject@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

set local "request.jwt.claims" = '{"sub":"71000000-0000-0000-0000-000000000001","role":"authenticated"}';
set local role authenticated;
select ok(
  public.create_safety_report(
    '71000000-0000-0000-0000-000000000002', null, 'harassment', 'medium authorization proof'
  ) is not null,
  'participant can submit medium safety report through existing RPC'
);
reset role;

select is((select severity::text from public.safety_reports where description = 'medium authorization proof'), 'medium', 'medium report severity remains server assigned');
select is((select count(*) from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='medium authorization proof'), 0::bigint, 'medium report starts without moderation case');

set local role service_role;
select ok(
  public.claim_moderation_report(
    (select id from public.safety_reports where description='medium authorization proof'),
    'operator:proposer', null
  ) is not null,
  'assigned operator can claim medium report'
);
select throws_ok(
  format(
    $$select public.propose_moderation_action(%L::uuid, 1, 'operator:proposer', 'restrict_contact', 'repeated_harassment')$$,
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='medium authorization proof')
  ),
  'P0001',
  'moderation case must be investigating',
  'triage case cannot receive material action proposal'
);
select is(
  public.transition_moderation_case(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='medium authorization proof'),
    1, 'triage', 'investigating', 'operator:proposer', null, 'authorization review started'
  ),
  2,
  'claimed case moves to investigating before proposal'
);
reset role;

set local role service_role;
select ok(
  public.propose_moderation_action(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='medium authorization proof'),
    2, 'operator:proposer', 'restrict_contact', 'repeated_harassment'
  ) is not null,
  'assigned investigating operator can create material action proposal'
);
reset role;

select is((select count(*) from public.moderation_action_proposals), 1::bigint, 'exactly one proposal is created');
select is((select case_version from public.moderation_action_proposals limit 1), 2, 'proposal binds current case version');
select is((select source_category from public.moderation_action_proposals limit 1), 'harassment', 'proposal snapshots server report category');
select is((select source_severity::text from public.moderation_action_proposals limit 1), 'medium', 'proposal snapshots server report severity');
select is((select review_lane from public.moderation_action_proposals limit 1), 'general', 'medium harassment uses general review lane');
select ok((select not critical_escalation_required from public.moderation_action_proposals limit 1), 'medium proposal does not require critical escalation');
select is((select proposed_by_ref from public.moderation_action_proposals limit 1), 'operator:proposer', 'proposal records opaque proposing operator');

set local role service_role;
select is((select count(*) from public.list_pending_moderation_action_proposals(10)), 1::bigint, 'service queue exposes one pending action proposal');
reset role;
select ok(
  position('reporter_user_id' in pg_get_function_result('public.list_pending_moderation_action_proposals(integer)'::regprocedure)) = 0,
  'pending proposal projection omits reporter identity'
);
select ok(
  position('description' in pg_get_function_result('public.list_pending_moderation_action_proposals(integer)'::regprocedure)) = 0,
  'pending proposal projection omits free-text report description'
);

set local role service_role;
select throws_ok(
  format(
    $$select public.propose_moderation_action(%L::uuid, 2, 'operator:proposer', 'suspend_account', 'repeat_violation')$$,
    (select case_id from public.moderation_action_proposals limit 1)
  ),
  'P0001',
  'moderation case already has a pending action proposal',
  'case cannot accumulate multiple pending proposals'
);
select throws_ok(
  format(
    $$select public.review_moderation_action_proposal(%L::uuid, 'operator:proposer', 'approved', 'second_pair_approved')$$,
    (select id from public.moderation_action_proposals limit 1)
  ),
  'P0001',
  'moderation action proposal requires an independent reviewer',
  'proposer cannot review own proposal'
);
select throws_ok(
  format(
    $$select public.review_moderation_action_proposal(%L::uuid, 'reviewer@example.test', 'approved', 'second_pair_approved')$$,
    (select id from public.moderation_action_proposals limit 1)
  ),
  'P0001',
  'invalid moderation reviewer reference',
  'reviewer identity must be opaque rather than mailbox data'
);
select ok(
  public.review_moderation_action_proposal(
    (select id from public.moderation_action_proposals limit 1),
    'operator:reviewer', 'approved', 'second_pair_approved'
  ) is not null,
  'independent reviewer can authorize non-critical proposal'
);
reset role;

select is((select status from public.moderation_action_proposals limit 1), 'approved', 'proposal records independent approval');
select is((select count(*) from public.moderation_action_reviews), 1::bigint, 'approved proposal has exactly one review record');
select is((select reviewer_ref from public.moderation_action_reviews limit 1), 'operator:reviewer', 'review evidence records independent reviewer');
select is((select status::text from public.moderation_cases where id=(select case_id from public.moderation_action_proposals limit 1)), 'investigating', 'authorization does not action or close moderation case');
select is((select version from public.moderation_cases where id=(select case_id from public.moderation_action_proposals limit 1)), 2, 'authorization does not mutate moderation case version');
select is((select status::text from public.safety_reports where description='medium authorization proof'), 'investigating', 'authorization does not mutate report beyond existing investigating state');
select is((select publication_status::text from public.profiles where user_id='71000000-0000-0000-0000-000000000002'), 'draft', 'authorization does not suspend or pause subject profile');
select is((select count(*) from auth.users where id in ('71000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000002')), 2::bigint, 'authorization does not delete Auth accounts');
select is((select count(*) from public.audit_events where event_type='moderation_action_proposed'), 1::bigint, 'proposal creates sanitized audit event');
select is((select count(*) from public.audit_events where event_type='moderation_action_reviewed'), 1::bigint, 'review creates sanitized audit event');
select ok(
  not exists (
    select 1 from public.audit_events
    where event_type in ('moderation_action_proposed','moderation_action_reviewed')
      and payload::text like '%medium authorization proof%'
  ),
  'moderation action audit payloads omit free-text report description'
);
select ok(
  not exists (
    select 1 from public.audit_events
    where event_type in ('moderation_action_proposed','moderation_action_reviewed')
      and payload ? 'reporter_user_id'
  ),
  'moderation action audit payloads omit reporter identity'
);

set local role service_role;
select throws_ok(
  format(
    $$select public.review_moderation_action_proposal(%L::uuid, 'operator:other', 'rejected', 'already_decided')$$,
    (select id from public.moderation_action_proposals order by created_at limit 1)
  ),
  'P0001',
  'moderation action proposal already decided',
  'decided proposal cannot receive a second review'
);
select ok(
  public.propose_moderation_action(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='medium authorization proof'),
    2, 'operator:proposer', 'restrict_discovery', 'repeat_pattern'
  ) is not null,
  'new proposal can be created after prior proposal is terminal'
);
select is(
  public.unclaim_moderation_case(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='medium authorization proof'),
    2, 'operator:proposer', 'handover before authorization'
  ),
  3,
  'case version can advance after proposal through existing controlled workflow'
);
select throws_ok(
  format(
    $$select public.review_moderation_action_proposal(%L::uuid, 'operator:reviewer2', 'approved', 'stale_should_fail')$$,
    (select id from public.moderation_action_proposals where status='pending' limit 1)
  ),
  'P0001',
  'stale moderation action proposal case version',
  'stale case version fails closed during authorization review'
);
reset role;

set local "request.jwt.claims" = '{"sub":"71000000-0000-0000-0000-000000000001","role":"authenticated"}';
set local role authenticated;
select ok(
  public.create_safety_report(
    '71000000-0000-0000-0000-000000000002', null, 'minor_suspected', 'critical authorization proof'
  ) is not null,
  'participant can submit critical child-safety signal through existing RPC'
);
reset role;
select is((select severity::text from public.safety_reports where description='critical authorization proof'), 'critical', 'critical severity remains server assigned');

set local role service_role;
select ok(
  public.claim_moderation_report(
    (select id from public.safety_reports where description='critical authorization proof'),
    'operator:critical', 1
  ) is not null,
  'critical auto-created case can be claimed with exact version'
);
select is(
  public.transition_moderation_case(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='critical authorization proof'),
    2, 'triage', 'investigating', 'operator:critical', null, 'critical specialist assessment'
  ),
  3,
  'critical case reaches investigating through existing controlled workflow'
);
select ok(
  public.propose_moderation_action(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='critical authorization proof'),
    3, 'operator:critical', 'suspend_account', 'minor_safety_risk'
  ) is not null,
  'critical investigating case can create a non-executing proposal snapshot'
);
reset role;

select is((select review_lane from public.moderation_action_proposals where source_category='minor_suspected'), 'child_safety', 'minor suspected proposal uses child-safety review lane');
select ok((select critical_escalation_required from public.moderation_action_proposals where source_category='minor_suspected'), 'critical proposal requires specialist escalation');

set local role service_role;
select throws_ok(
  format(
    $$select public.review_moderation_action_proposal(%L::uuid, 'operator:critical-reviewer', 'approved', 'ordinary_approval')$$,
    (select id from public.moderation_action_proposals where source_category='minor_suspected')
  ),
  'P0001',
  'critical moderation action requires specialist escalation',
  'ordinary approval is prohibited for critical proposal'
);
select ok(
  public.review_moderation_action_proposal(
    (select id from public.moderation_action_proposals where source_category='minor_suspected'),
    'operator:critical-reviewer', 'escalated', 'specialist_required'
  ) is not null,
  'independent reviewer can route critical proposal to specialist escalation'
);
reset role;

select is((select status from public.moderation_action_proposals where source_category='minor_suspected'), 'escalated', 'critical proposal records escalation rather than approval');
select is((select c.status::text from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='critical authorization proof'), 'investigating', 'critical escalation does not execute case action');
select is((select severity::text from public.safety_reports where description='critical authorization proof'), 'critical', 'critical escalation never downgrades server severity');
select is((select count(*) from public.moderation_cases where status='actioned'), 0::bigint, 'WP-070B produces no actioned moderation cases');
select is((select count(*) from public.blocks where blocker_user_id='71000000-0000-0000-0000-000000000001' or blocked_user_id='71000000-0000-0000-0000-000000000002'), 0::bigint, 'WP-070B authorization creates no participant block');

select * from finish();
rollback;
