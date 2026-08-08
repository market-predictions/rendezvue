begin;

select plan(60);

select has_table('public', 'moderation_case_events', 'append-only moderation case events table exists');
select has_column('public', 'moderation_cases', 'version', 'moderation cases have optimistic version');
select has_column('public', 'moderation_cases', 'assigned_operator_ref', 'moderation cases have opaque operator ownership');
select has_column('public', 'moderation_cases', 'triage_due_at', 'moderation cases have internal triage target timestamp');

select ok(not has_table_privilege('anon', 'public.moderation_cases', 'SELECT'), 'anon cannot read moderation cases');
select ok(not has_table_privilege('authenticated', 'public.moderation_cases', 'SELECT'), 'participants cannot read moderation cases');
select ok(has_table_privilege('service_role', 'public.moderation_cases', 'SELECT'), 'service role can read moderation cases');
select ok(not has_table_privilege('service_role', 'public.moderation_cases', 'INSERT'), 'service role cannot directly insert moderation cases');
select ok(not has_table_privilege('service_role', 'public.moderation_cases', 'UPDATE'), 'service role cannot directly update moderation cases');
select ok(not has_table_privilege('authenticated', 'public.moderation_case_events', 'SELECT'), 'participants cannot read moderation case events');
select ok(has_table_privilege('service_role', 'public.moderation_case_events', 'SELECT'), 'service role can read moderation case events');
select ok(not has_table_privilege('service_role', 'public.moderation_case_events', 'INSERT'), 'service role cannot forge moderation case events');

select ok(not has_function_privilege('authenticated', 'public.list_moderation_queue(integer)', 'EXECUTE'), 'participants cannot list moderation queue');
select ok(has_function_privilege('service_role', 'public.list_moderation_queue(integer)', 'EXECUTE'), 'service role can list moderation queue');
select ok(not has_function_privilege('authenticated', 'public.claim_moderation_report(uuid,text,integer)', 'EXECUTE'), 'participants cannot claim reports');
select ok(has_function_privilege('service_role', 'public.claim_moderation_report(uuid,text,integer)', 'EXECUTE'), 'service role can claim reports');
select ok(has_function_privilege('service_role', 'public.unclaim_moderation_case(uuid,integer,text,text)', 'EXECUTE'), 'service role can unclaim cases through controlled function');
select ok(has_function_privilege('service_role', 'public.transition_moderation_case(uuid,integer,public.moderation_state,public.moderation_state,text,text,text)', 'EXECUTE'), 'service role can transition cases through controlled function');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '70000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'moderation-reporter@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '70000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'moderation-subject@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

set local "request.jwt.claims" = '{"sub":"70000000-0000-0000-0000-000000000001","role":"authenticated"}';
set local role authenticated;
select ok(
  public.create_safety_report(
    '70000000-0000-0000-0000-000000000002', null, 'harassment', 'medium queue proof'
  ) is not null,
  'participant can submit a medium report through existing controlled RPC'
);
select ok(
  public.create_safety_report(
    '70000000-0000-0000-0000-000000000002', null, 'minor_suspected', 'critical queue proof'
  ) is not null,
  'participant can submit a critical child-safety signal through existing controlled RPC'
);
reset role;

select is((select severity::text from public.safety_reports where category = 'harassment'), 'medium', 'harassment remains server-classified medium');
select is((select severity::text from public.safety_reports where category = 'minor_suspected'), 'critical', 'minor suspected remains server-classified critical');
select is((select count(*) from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'minor_suspected'), 1::bigint, 'critical report still auto-opens exactly one moderation case');
select is((select priority from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'minor_suspected'), 1::smallint, 'critical report remains highest priority');
select is((select c.triage_due_at - r.created_at from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'minor_suspected'), interval '15 minutes', 'critical case receives 15-minute internal triage target');
select is((select count(*) from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'harassment'), 0::bigint, 'medium report is queued without prematurely creating a case');

set local role service_role;
select is((select count(*) from public.list_moderation_queue(10)), 2::bigint, 'service queue includes critical and medium unresolved reports');
select is((select category from public.list_moderation_queue(10) limit 1), 'minor_suspected', 'queue deterministically puts critical report first');
select ok((select case_id is null from public.list_moderation_queue(10) where category = 'harassment'), 'medium report remains an unbound intake item before claim');
reset role;

select ok(
  position('reporter_user_id' in pg_get_function_result('public.list_moderation_queue(integer)'::regprocedure)) = 0,
  'moderation queue projection does not expose reporter identity'
);

set local role service_role;
select ok(
  public.claim_moderation_report(
    (select id from public.safety_reports where category = 'harassment'),
    'operator:one',
    null
  ) is not null,
  'operator can claim previously unbound medium report'
);
reset role;

select is((select count(*) from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'harassment'), 1::bigint, 'claim creates exactly one moderation case for medium report');
select is((select assigned_operator_ref from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'harassment'), 'operator:one', 'new medium case records opaque operator owner');
select is((select status::text from public.safety_reports where category = 'harassment'), 'triage', 'claim synchronizes report into triage');
select is((select count(*) from public.moderation_case_events e join public.moderation_cases c on c.id = e.case_id join public.safety_reports r on r.id = c.source_report_id where r.category = 'harassment'), 2::bigint, 'new claimed case records opening plus claim events');
select is((select count(*) from public.audit_events where event_type = 'moderation_case_claimed'), 1::bigint, 'claim creates sanitized service audit event');

set local role service_role;
select ok(
  public.claim_moderation_report(
    (select id from public.safety_reports where category = 'minor_suspected'),
    'operator:one',
    1
  ) is not null,
  'operator can claim existing critical case with expected version'
);
reset role;
select is((select c.version from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'minor_suspected'), 2, 'claiming existing critical case increments version once');

set local role service_role;
select throws_ok(
  format(
    $$select public.claim_moderation_report(%L::uuid, 'operator:two', 2)$$,
    (select id from public.safety_reports where category = 'minor_suspected')
  ),
  'P0001',
  'moderation case already claimed',
  'second operator cannot steal an active claim'
);
select throws_ok(
  format(
    $$select public.claim_moderation_report(%L::uuid, 'operator@example.test', null)$$,
    (select id from public.safety_reports where category = 'harassment')
  ),
  'P0001',
  'invalid moderation operator reference',
  'operator identity must be an opaque internal reference rather than mailbox data'
);
select throws_ok(
  format(
    $$select public.transition_moderation_case(%L::uuid, 99, 'triage', 'investigating', 'operator:one', null, null)$$,
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'harassment')
  ),
  'P0001',
  'stale moderation case version',
  'stale case version blocks transition'
);
select is(
  public.transition_moderation_case(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'harassment'),
    1, 'triage', 'investigating', 'operator:one', null, 'review started'
  ),
  2,
  'claimed medium case can move from triage to investigating'
);
reset role;

select is((select status::text from public.safety_reports where category = 'harassment'), 'investigating', 'case transition synchronizes report status');

set local role service_role;
select throws_ok(
  format(
    $$select public.unclaim_moderation_case(%L::uuid, 1, 'operator:one', null)$$,
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'harassment')
  ),
  'P0001',
  'stale moderation case version',
  'stale version blocks unclaim'
);
select is(
  public.unclaim_moderation_case(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'harassment'),
    2, 'operator:one', 'handover'
  ),
  3,
  'current operator can return investigating case to queue without changing status'
);
reset role;

select ok((select assigned_operator_ref is null from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'harassment'), 'unclaim clears operator ownership');

set local role service_role;
select ok(
  public.claim_moderation_report(
    (select id from public.safety_reports where category = 'harassment'),
    'operator:two',
    3
  ) is not null,
  'another operator can claim the returned case with current version'
);
reset role;
select is((select c.version from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'harassment'), 4, 'reclaim increments optimistic case version');

set local role service_role;
select throws_ok(
  format(
    $$select public.transition_moderation_case(%L::uuid, 4, 'investigating', 'actioned', 'operator:two', 'enforce', null)$$,
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'harassment')
  ),
  'P0001',
  'invalid WP-070A moderation case transition',
  'WP-070A cannot execute or record an enforcement action'
);
select throws_ok(
  format(
    $$select public.transition_moderation_case(%L::uuid, 4, 'investigating', 'dismissed', 'operator:two', null, 'no corroboration')$$,
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'harassment')
  ),
  'P0001',
  'moderation decision code required',
  'dismissal requires a controlled decision code'
);
select is(
  public.transition_moderation_case(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'harassment'),
    4, 'investigating', 'dismissed', 'operator:two', 'no_violation_found', 'no corroboration'
  ),
  5,
  'investigated case can be dismissed with explicit decision code'
);
reset role;

select is((select severity::text from public.safety_reports where category = 'minor_suspected'), 'critical', 'moderation workflow never downgrades critical child-safety severity');
select is((select status::text from public.safety_reports where category = 'harassment'), 'dismissed', 'dismissal synchronizes report state');

set local role service_role;
select is(
  public.transition_moderation_case(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'harassment'),
    5, 'dismissed', 'closed', 'operator:two', null, 'close reviewed report'
  ),
  6,
  'dismissed case can be closed using its existing decision code'
);
reset role;

select ok((select c.closed_at is not null from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'harassment'), 'closed moderation case records closure time');

set local role service_role;
select throws_ok(
  format(
    $$select public.transition_moderation_case(%L::uuid, 6, 'closed', 'investigating', 'operator:two', null, null)$$,
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id = c.source_report_id where r.category = 'harassment')
  ),
  'P0001',
  'invalid WP-070A moderation case transition',
  'closed case cannot be reopened by WP-070A'
);
reset role;

select is((select count(*) from public.moderation_case_events e join public.moderation_cases c on c.id = e.case_id join public.safety_reports r on r.id = c.source_report_id where r.category = 'harassment'), 7::bigint, 'case timeline is append-only across open claim investigate unclaim reclaim dismiss close');
select is(
  (
    select count(*) from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('suspend_from_moderation', 'ban_user_from_moderation', 'delete_moderation_subject')
  ),
  0::bigint,
  'WP-070A introduces no enforcement mutation functions'
);

set local role service_role;
select is((select count(*) from public.list_moderation_queue(10)), 1::bigint, 'closed medium report disappears from unresolved queue while critical case remains');
select is((select priority from public.list_moderation_queue(10) where category = 'minor_suspected'), 1::smallint, 'remaining critical queue item preserves priority one');
reset role;

select * from finish();
rollback;
