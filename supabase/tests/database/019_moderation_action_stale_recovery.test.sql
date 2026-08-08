begin;

select plan(25);

select has_function(
  'public',
  'supersede_stale_moderation_action_proposal',
  array['uuid','text','text'],
  'controlled stale-proposal supersede function exists'
);
select ok(
  not has_function_privilege('authenticated', 'public.supersede_stale_moderation_action_proposal(uuid,text,text)', 'EXECUTE'),
  'participants cannot supersede moderation action proposals'
);
select ok(
  has_function_privilege('service_role', 'public.supersede_stale_moderation_action_proposal(uuid,text,text)', 'EXECUTE'),
  'service role can supersede stale proposals through controlled RPC'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '72000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'stale-reporter@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '72000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'stale-subject@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

set local "request.jwt.claims" = '{"sub":"72000000-0000-0000-0000-000000000001","role":"authenticated"}';
set local role authenticated;
select ok(
  public.create_safety_report(
    '72000000-0000-0000-0000-000000000002', null, 'harassment', 'stale proposal recovery proof'
  ) is not null,
  'participant can create source report for stale-recovery proof'
);
reset role;

set local role service_role;
select ok(
  public.claim_moderation_report(
    (select id from public.safety_reports where description='stale proposal recovery proof'),
    'operator:stale-proposer', null
  ) is not null,
  'service operator can claim recovery proof report'
);
select is(
  public.transition_moderation_case(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='stale proposal recovery proof'),
    1, 'triage', 'investigating', 'operator:stale-proposer', null, 'prepare stale recovery proof'
  ),
  2,
  'case reaches investigating version 2'
);
select ok(
  public.propose_moderation_action(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='stale proposal recovery proof'),
    2, 'operator:stale-proposer', 'restrict_contact', 'stale_recovery_test'
  ) is not null,
  'proposal snapshots investigating version 2'
);
reset role;

select is(
  (select status from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='stale proposal recovery proof'),
  'pending',
  'proposal starts pending'
);

set local role service_role;
select throws_ok(
  format(
    $$select public.supersede_stale_moderation_action_proposal(%L::uuid, 'operator:cleanup', 'not_stale')$$,
    (select p.id from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='stale proposal recovery proof')
  ),
  'P0001',
  'moderation action proposal is not stale',
  'current proposal cannot be arbitrarily superseded'
);
select is(
  public.unclaim_moderation_case(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='stale proposal recovery proof'),
    2, 'operator:stale-proposer', 'handover makes proposal stale'
  ),
  3,
  'controlled case change advances version and makes proposal stale'
);
select throws_ok(
  format(
    $$select public.review_moderation_action_proposal(%L::uuid, 'operator:reviewer', 'approved', 'stale_must_fail')$$,
    (select p.id from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='stale proposal recovery proof')
  ),
  'P0001',
  'stale moderation action proposal case version',
  'stale proposal still fails closed at review boundary'
);
select ok(
  public.supersede_stale_moderation_action_proposal(
    (select p.id from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='stale proposal recovery proof'),
    'operator:cleanup', 'case_version_advanced'
  ) is not null,
  'controlled service operation can terminally supersede a proven stale proposal'
);
reset role;

select is(
  (select status from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='stale proposal recovery proof'),
  'superseded',
  'stale proposal becomes terminal superseded'
);
select ok(
  (select decided_at is not null from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='stale proposal recovery proof'),
  'superseded proposal records terminal timestamp'
);
select is(
  (select count(*) from public.moderation_action_reviews ar join public.moderation_action_proposals p on p.id=ar.proposal_id join public.safety_reports r on r.id=p.source_report_id where r.description='stale proposal recovery proof'),
  0::bigint,
  'administrative supersede does not fabricate independent review evidence'
);
select is(
  (select count(*) from public.audit_events a join public.moderation_action_proposals p on p.id::text=a.entity_id join public.safety_reports r on r.id=p.source_report_id where r.description='stale proposal recovery proof' and a.event_type='moderation_action_superseded'),
  1::bigint,
  'supersede creates exactly one sanitized service audit event'
);
select ok(
  not exists (
    select 1 from public.audit_events a
    join public.moderation_action_proposals p on p.id::text=a.entity_id
    join public.safety_reports r on r.id=p.source_report_id
    where r.description='stale proposal recovery proof'
      and a.event_type='moderation_action_superseded'
      and (a.payload::text like '%stale proposal recovery proof%' or a.payload ? 'reporter_user_id')
  ),
  'supersede audit omits reporter identity and report free text'
);

set local role service_role;
select throws_ok(
  format(
    $$select public.supersede_stale_moderation_action_proposal(%L::uuid, 'operator:cleanup', 'again')$$,
    (select p.id from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='stale proposal recovery proof')
  ),
  'P0001',
  'moderation action proposal already decided',
  'superseded proposal cannot be terminally mutated again'
);
select throws_ok(
  format(
    $$select public.review_moderation_action_proposal(%L::uuid, 'operator:reviewer', 'rejected', 'already_superseded')$$,
    (select p.id from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='stale proposal recovery proof')
  ),
  'P0001',
  'moderation action proposal already decided',
  'superseded proposal cannot later be reviewed'
);
select ok(
  public.claim_moderation_report(
    (select id from public.safety_reports where description='stale proposal recovery proof'),
    'operator:new-proposer', 3
  ) is not null,
  'investigating case can be re-claimed after handover'
);
select is(
  (select version from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='stale proposal recovery proof'),
  4,
  're-claim advances case to version 4'
);
select ok(
  public.propose_moderation_action(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='stale proposal recovery proof'),
    4, 'operator:new-proposer', 'restrict_discovery', 'fresh_after_supersede'
  ) is not null,
  'fresh proposal can be created after stale proposal is superseded'
);
reset role;

select is(
  (select count(*) from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='stale proposal recovery proof'),
  2::bigint,
  'history retains superseded proposal plus one fresh proposal'
);
select is(
  (select count(*) from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='stale proposal recovery proof' and p.status='pending'),
  1::bigint,
  'one-pending-per-case invariant is restored after stale recovery'
);
select is(
  (select c.status::text from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='stale proposal recovery proof'),
  'investigating',
  'stale recovery does not execute or close moderation case'
);
select is(
  (select publication_status::text from public.profiles where user_id='72000000-0000-0000-0000-000000000002'),
  'draft',
  'stale recovery does not change profile publication state'
);
select is(
  (select count(*) from auth.users where id in ('72000000-0000-0000-0000-000000000001','72000000-0000-0000-0000-000000000002')),
  2::bigint,
  'stale recovery does not delete Auth accounts'
);

select * from finish();
rollback;
