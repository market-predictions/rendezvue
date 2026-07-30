begin;

select plan(36);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'eligibility', 'eligibility table exists');
select has_table('public', 'life_stages', 'life stages table exists');
select has_table('public', 'family_contexts', 'family contexts table exists');
select has_table('public', 'faith_profiles', 'faith profiles table exists');
select has_table('public', 'student_verifications', 'student verifications table exists');
select has_table('public', 'privacy_portraits', 'privacy portraits table exists');
select has_table('public', 'attraction_signals', 'attraction signals table exists');
select has_table('public', 'matches', 'matches table exists');
select has_table('public', 'contact_entitlements', 'contact entitlements table exists');
select has_table('public', 'conversations', 'conversations table exists');
select has_table('public', 'messages', 'messages table exists');
select has_table('public', 'blocks', 'blocks table exists');
select has_table('public', 'interaction_feedback', 'interaction feedback table exists');
select has_table('public', 'safety_reports', 'safety reports table exists');
select has_table('public', 'moderation_cases', 'moderation cases table exists');
select has_table('public', 'audit_events', 'audit events table exists');
select has_view('public', 'discovery_profiles', 'discovery projection exists');

select ok(
  (select c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'profiles'),
  'profiles has RLS enabled'
);
select ok(
  (select c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'eligibility'),
  'eligibility has RLS enabled'
);
select ok(
  (select c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'attraction_signals'),
  'attraction signals have RLS enabled'
);
select ok(
  (select c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'messages'),
  'messages have RLS enabled'
);
select ok(
  (select c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'moderation_cases'),
  'moderation cases have RLS enabled'
);

select ok(
  exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_read_discoverable'),
  'published profile read policy exists'
);
select ok(
  exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'messages' and policyname = 'messages_participants_insert'),
  'participant message insert policy exists'
);
select ok(
  exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'safety_reports' and policyname = 'reports_reporter_insert'),
  'reporter insert policy exists'
);
select ok(
  exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'portrait_objects_insert_self'),
  'owner-scoped portrait upload policy exists'
);

select ok(
  to_regprocedure('public.record_attraction_signal(uuid,public.attraction_signal_type,text,text)') is not null,
  'record attraction signal function exists'
);
select ok(
  (select p.prosecdef from pg_proc p where p.oid = to_regprocedure('public.record_attraction_signal(uuid,public.attraction_signal_type,text,text)')),
  'record attraction signal is security definer'
);
select ok(
  to_regprocedure('public.open_match_conversation(uuid,text)') is not null,
  'open conversation function exists'
);
select ok(
  (select p.prosecdef from pg_proc p where p.oid = to_regprocedure('public.open_match_conversation(uuid,text)')),
  'open conversation is security definer'
);

select ok(
  exists (select 1 from storage.buckets where id = 'privacy-portraits' and public = false),
  'privacy portrait bucket is private'
);
select ok(
  exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'),
  'messages are in realtime publication'
);
select ok(
  exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'matches'),
  'matches are in realtime publication'
);
select ok(
  not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'moderation_cases'),
  'moderation cases expose no ordinary user policy'
);
select ok(
  not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'audit_events'),
  'audit events expose no ordinary user policy'
);

select * from finish();
rollback;
