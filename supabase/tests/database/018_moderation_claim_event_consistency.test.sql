begin;

select plan(12);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '71000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'claim-event-reporter@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '71000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'claim-event-subject@rendezvue.test', crypt('test', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

set local "request.jwt.claims" = '{"sub":"71000000-0000-0000-0000-000000000001","role":"authenticated"}';
set local role authenticated;
select ok(
  public.create_safety_report(
    '71000000-0000-0000-0000-000000000002', null, 'harassment', 'reclaim event state consistency'
  ) is not null,
  'participant can create medium report for reclaim-state proof'
);
reset role;

select is(
  (select count(*) from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='reclaim event state consistency'),
  0::bigint,
  'medium report begins without a moderation case'
);

set local role service_role;
select ok(
  public.claim_moderation_report(
    (select id from public.safety_reports where description='reclaim event state consistency'),
    'operator:state-a', null
  ) is not null,
  'first claim creates the case'
);
reset role;

select is(
  (select c.status::text from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='reclaim event state consistency'),
  'triage',
  'first claim places new case in triage'
);

set local role service_role;
select is(
  public.transition_moderation_case(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='reclaim event state consistency'),
    1, 'triage', 'investigating', 'operator:state-a', null, 'investigation started'
  ),
  2,
  'case enters investigating at version two'
);
select is(
  public.unclaim_moderation_case(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='reclaim event state consistency'),
    2, 'operator:state-a', 'shift handover'
  ),
  3,
  'investigating case can be returned to the queue at version three'
);
reset role;

select is(
  (select c.status::text from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='reclaim event state consistency'),
  'investigating',
  'unclaim preserves investigating state'
);

set local role service_role;
select ok(
  public.claim_moderation_report(
    (select id from public.safety_reports where description='reclaim event state consistency'),
    'operator:state-b', 3
  ) is not null,
  'second operator can reclaim the unassigned investigating case'
);
reset role;

select is(
  (select c.status::text from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='reclaim event state consistency'),
  'investigating',
  'reclaim preserves the investigating case state'
);

select is(
  (select e.from_status::text
   from public.moderation_case_events e
   join public.moderation_cases c on c.id=e.case_id
   join public.safety_reports r on r.id=c.source_report_id
   where r.description='reclaim event state consistency' and e.event_type='claimed'
   order by e.id desc limit 1),
  'investigating',
  'reclaim event records investigating as its source state'
);

select is(
  (select e.to_status::text
   from public.moderation_case_events e
   join public.moderation_cases c on c.id=e.case_id
   join public.safety_reports r on r.id=c.source_report_id
   where r.description='reclaim event state consistency' and e.event_type='claimed'
   order by e.id desc limit 1),
  'investigating',
  'reclaim event records investigating as its preserved destination state'
);

select is(
  (select e.case_version
   from public.moderation_case_events e
   join public.moderation_cases c on c.id=e.case_id
   join public.safety_reports r on r.id=c.source_report_id
   where r.description='reclaim event state consistency' and e.event_type='claimed'
   order by e.id desc limit 1),
  4,
  'reclaim event is tied to the incremented version four'
);

select * from finish();
rollback;
