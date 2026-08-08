begin;

select plan(14);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '73000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'audit-ref-reporter@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '73000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'audit-ref-subject@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

set local "request.jwt.claims" = '{"sub":"73000000-0000-0000-0000-000000000001","role":"authenticated"}';
set local role authenticated;
select ok(
  public.create_safety_report(
    '73000000-0000-0000-0000-000000000002', null, 'harassment', 'durable actor audit proof'
  ) is not null,
  'participant can create source report for durable audit proof'
);
reset role;

set local role service_role;
select ok(
  public.claim_moderation_report(
    (select id from public.safety_reports where description='durable actor audit proof'),
    'operator:audit-proposer', null
  ) is not null,
  'proposing operator can claim audit proof report'
);
select is(
  public.transition_moderation_case(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='durable actor audit proof'),
    1, 'triage', 'investigating', 'operator:audit-proposer', null, 'prepare durable actor proof'
  ),
  2,
  'audit proof case reaches investigating version 2'
);
select ok(
  public.propose_moderation_action(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='durable actor audit proof'),
    2, 'operator:audit-proposer', 'restrict_contact', 'durable_actor_test'
  ) is not null,
  'proposer creates non-effectful action proposal'
);
reset role;

select is(
  (select count(*) from public.audit_events a where a.event_type='moderation_action_proposed' and a.subject_user_id='73000000-0000-0000-0000-000000000002'),
  1::bigint,
  'proposal creates exactly one durable audit event'
);
select is(
  (select payload->>'proposed_by_ref' from public.audit_events a where a.event_type='moderation_action_proposed' and a.subject_user_id='73000000-0000-0000-0000-000000000002'),
  'operator:audit-proposer',
  'proposal audit durably retains opaque proposing operator ref'
);
select ok(
  not exists (
    select 1 from public.audit_events a
    where a.event_type='moderation_action_proposed'
      and a.subject_user_id='73000000-0000-0000-0000-000000000002'
      and (a.payload ? 'reporter_user_id' or a.payload::text like '%durable actor audit proof%')
  ),
  'proposal audit still omits reporter identity and report free text'
);

set local role service_role;
select ok(
  public.review_moderation_action_proposal(
    (select p.id from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='durable actor audit proof'),
    'operator:audit-reviewer', 'approved', 'durable_second_pair'
  ) is not null,
  'independent reviewer authorizes non-critical proposal'
);
reset role;

select is(
  (select count(*) from public.audit_events a where a.event_type='moderation_action_reviewed' and a.subject_user_id='73000000-0000-0000-0000-000000000002'),
  1::bigint,
  'review creates exactly one durable audit event'
);
select is(
  (select payload->>'proposed_by_ref' from public.audit_events a where a.event_type='moderation_action_reviewed' and a.subject_user_id='73000000-0000-0000-0000-000000000002'),
  'operator:audit-proposer',
  'review audit durably retains proposer ref'
);
select is(
  (select payload->>'reviewer_ref' from public.audit_events a where a.event_type='moderation_action_reviewed' and a.subject_user_id='73000000-0000-0000-0000-000000000002'),
  'operator:audit-reviewer',
  'review audit durably retains independent reviewer ref'
);
select isnt(
  (select payload->>'proposed_by_ref' from public.audit_events a where a.event_type='moderation_action_reviewed' and a.subject_user_id='73000000-0000-0000-0000-000000000002'),
  (select payload->>'reviewer_ref' from public.audit_events a where a.event_type='moderation_action_reviewed' and a.subject_user_id='73000000-0000-0000-0000-000000000002'),
  'durable review audit proves two distinct opaque refs'
);
select ok(
  not exists (
    select 1 from public.audit_events a
    where a.event_type='moderation_action_reviewed'
      and a.subject_user_id='73000000-0000-0000-0000-000000000002'
      and (a.payload ? 'reporter_user_id' or a.payload::text like '%durable actor audit proof%')
  ),
  'review audit still omits reporter identity and report free text'
);
select is(
  (select c.status::text from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='durable actor audit proof'),
  'investigating',
  'durable audit hardening does not execute moderation action'
);

select * from finish();
rollback;
