begin;

select plan(15);

select ok(
  not has_function_privilege('anon', 'public.record_attraction_signal(uuid,public.attraction_signal_type,text,text)', 'EXECUTE'),
  'anon cannot execute attraction RPC'
);
select ok(
  has_function_privilege('authenticated', 'public.record_attraction_signal(uuid,public.attraction_signal_type,text,text)', 'EXECUTE'),
  'authenticated can execute attraction RPC'
);
select ok(
  not has_function_privilege('anon', 'public.open_match_conversation(uuid,text)', 'EXECUTE'),
  'anon cannot execute contact RPC'
);
select ok(
  has_function_privilege('authenticated', 'public.open_match_conversation(uuid,text)', 'EXECUTE'),
  'authenticated can execute contact RPC'
);
select ok(
  not has_function_privilege('anon', 'public.block_user(uuid,text)', 'EXECUTE'),
  'anon cannot execute block RPC'
);
select ok(
  has_function_privilege('authenticated', 'public.block_user(uuid,text)', 'EXECUTE'),
  'authenticated can execute block RPC'
);
select ok(
  not has_function_privilege('anon', 'public.submit_interaction_feedback(uuid,uuid,text,text[],text[],text)', 'EXECUTE'),
  'anon cannot execute feedback RPC'
);
select ok(
  has_function_privilege('authenticated', 'public.submit_interaction_feedback(uuid,uuid,text,text[],text[],text)', 'EXECUTE'),
  'authenticated can execute feedback RPC'
);
select ok(
  not has_function_privilege('anon', 'public.create_safety_report(uuid,uuid,text,text)', 'EXECUTE'),
  'anon cannot execute report RPC'
);
select ok(
  has_function_privilege('authenticated', 'public.create_safety_report(uuid,uuid,text,text)', 'EXECUTE'),
  'authenticated can execute report RPC'
);

select ok(
  not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name = 'record_attraction_signal'
      and grantee = 'PUBLIC'
      and privilege_type = 'EXECUTE'
  ),
  'attraction RPC has no PUBLIC execute grant'
);
select ok(
  not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name = 'open_match_conversation'
      and grantee = 'PUBLIC'
      and privilege_type = 'EXECUTE'
  ),
  'contact RPC has no PUBLIC execute grant'
);
select ok(
  not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name = 'block_user'
      and grantee = 'PUBLIC'
      and privilege_type = 'EXECUTE'
  ),
  'block RPC has no PUBLIC execute grant'
);
select ok(
  not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name = 'submit_interaction_feedback'
      and grantee = 'PUBLIC'
      and privilege_type = 'EXECUTE'
  ),
  'feedback RPC has no PUBLIC execute grant'
);
select ok(
  not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name = 'create_safety_report'
      and grantee = 'PUBLIC'
      and privilege_type = 'EXECUTE'
  ),
  'report RPC has no PUBLIC execute grant'
);

select * from finish();
rollback;
