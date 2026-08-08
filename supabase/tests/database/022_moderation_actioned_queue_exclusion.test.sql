begin;

select plan(7);

select has_function('public','list_moderation_queue',array['integer'],'active moderation queue function remains available');
select ok(has_function_privilege('service_role','public.list_moderation_queue(integer)','EXECUTE'),'service role retains moderation queue execution');
select ok(not has_function_privilege('authenticated','public.list_moderation_queue(integer)','EXECUTE'),'participants still cannot execute moderation queue');

insert into auth.users (
  instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at
) values
  ('00000000-0000-0000-0000-000000000000','74500000-0000-0000-0000-000000000001','authenticated','authenticated','wp070c-queue-reporter@rendezvue.test',crypt('test',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','74500000-0000-0000-0000-000000000002','authenticated','authenticated','wp070c-queue-subject@rendezvue.test',crypt('test',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now());

insert into public.safety_reports (
  id,reporter_user_id,subject_user_id,category,description,severity,status
) values
  ('74600000-0000-0000-0000-000000000001','74500000-0000-0000-0000-000000000001','74500000-0000-0000-0000-000000000002','harassment','wp070c actioned queue exclusion','medium','actioned'),
  ('74600000-0000-0000-0000-000000000002','74500000-0000-0000-0000-000000000001','74500000-0000-0000-0000-000000000002','harassment','wp070c active queue control','medium','triage');

insert into public.moderation_cases (
  id,subject_user_id,source_report_id,status,priority,version,assigned_operator_ref
) values
  ('74700000-0000-0000-0000-000000000001','74500000-0000-0000-0000-000000000002','74600000-0000-0000-0000-000000000001','actioned',3,3,'operator:queue-history'),
  ('74700000-0000-0000-0000-000000000002','74500000-0000-0000-0000-000000000002','74600000-0000-0000-0000-000000000002','triage',3,1,null);

set local role service_role;
select is(
  (select count(*) from public.list_moderation_queue(100) where report_id='74600000-0000-0000-0000-000000000001'),
  0::bigint,
  'actioned report/case is excluded from the active moderation queue'
);
select is(
  (select count(*) from public.list_moderation_queue(100) where report_id='74600000-0000-0000-0000-000000000002'),
  1::bigint,
  'non-terminal triage work remains visible in the active moderation queue'
);
reset role;

select is(
  (select count(*) from public.moderation_cases where id='74700000-0000-0000-0000-000000000001' and status='actioned'),
  1::bigint,
  'queue exclusion preserves historical actioned case data'
);
select is(
  (select count(*) from public.safety_reports where id='74600000-0000-0000-0000-000000000001' and status='actioned'),
  1::bigint,
  'queue exclusion preserves historical actioned report data'
);

select * from finish();
rollback;
