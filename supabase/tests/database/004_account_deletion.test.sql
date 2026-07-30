begin;

select plan(7);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-0000000000d4',
  'authenticated', 'authenticated', 'delete@rendezvue.test',
  crypt('test-password-delete', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"Delete Proof"}',
  now(), now()
);

insert into public.eligibility (user_id, current_relationship_state, adult_confirmed, serious_intent_confirmed, community_fit_confirmed)
values ('00000000-0000-0000-0000-0000000000d4', 'single', true, true, true);
insert into public.family_contexts (user_id, marital_history, has_children)
values ('00000000-0000-0000-0000-0000000000d4', 'never_married', false);
insert into public.privacy_portraits (user_id, object_path, treatment, status, is_public_profile_portrait)
values ('00000000-0000-0000-0000-0000000000d4', '00000000-0000-0000-0000-0000000000d4/portrait.webp', 'balanced', 'pending', true);
insert into public.audit_events (actor_user_id, actor_type, event_type, subject_user_id, entity_type, entity_id)
values (
  '00000000-0000-0000-0000-0000000000d4', 'user', 'deletion-proof',
  '00000000-0000-0000-0000-0000000000d4', 'account',
  '00000000-0000-0000-0000-0000000000d4'
);

select is((select count(*) from public.profiles where user_id = '00000000-0000-0000-0000-0000000000d4'), 1::bigint, 'profile exists before account deletion');

delete from auth.users where id = '00000000-0000-0000-0000-0000000000d4';

select is((select count(*) from public.profiles where user_id = '00000000-0000-0000-0000-0000000000d4'), 0::bigint, 'profile cascades on account deletion');
select is((select count(*) from public.eligibility where user_id = '00000000-0000-0000-0000-0000000000d4'), 0::bigint, 'eligibility cascades on account deletion');
select is((select count(*) from public.family_contexts where user_id = '00000000-0000-0000-0000-0000000000d4'), 0::bigint, 'family context cascades on account deletion');
select is((select count(*) from public.privacy_portraits where user_id = '00000000-0000-0000-0000-0000000000d4'), 0::bigint, 'portrait metadata cascades on account deletion');
select is((select count(*) from public.audit_events where event_type = 'deletion-proof'), 1::bigint, 'security audit event is retained');
select ok(
  (select actor_user_id is null and subject_user_id is null from public.audit_events where event_type = 'deletion-proof'),
  'retained audit event is anonymised'
);

select * from finish();
rollback;
