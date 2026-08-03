begin;

select plan(5);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
(
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-0000000000d5',
  'authenticated', 'authenticated', 'cleanup-opener@rendezvue.test',
  crypt('test-password-cleanup-opener', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"Cleanup Opener"}',
  now(), now()
),
(
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-0000000000d6',
  'authenticated', 'authenticated', 'cleanup-peer@rendezvue.test',
  crypt('test-password-cleanup-peer', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"nickname":"Cleanup Peer"}',
  now(), now()
);

insert into public.matches (id, user_a_id, user_b_id, status)
values (
  '00000000-0000-0000-0000-0000000000e5',
  '00000000-0000-0000-0000-0000000000d5',
  '00000000-0000-0000-0000-0000000000d6',
  'ended'
);

insert into public.conversations (
  id, match_id, opened_by_user_id, status, ended_at
) values (
  '00000000-0000-0000-0000-0000000000f5',
  '00000000-0000-0000-0000-0000000000e5',
  '00000000-0000-0000-0000-0000000000d5',
  'ended',
  now()
);

insert into public.messages (conversation_id, sender_user_id, body)
values (
  '00000000-0000-0000-0000-0000000000f5',
  '00000000-0000-0000-0000-0000000000d5',
  'Synthetic cleanup regression message.'
);

select is(
  (select count(*) from public.conversations where id = '00000000-0000-0000-0000-0000000000f5'),
  1::bigint,
  'conversation exists before deleting the account that opened it'
);

delete from auth.users
where id = '00000000-0000-0000-0000-0000000000d5';

select is(
  (select count(*) from auth.users where id = '00000000-0000-0000-0000-0000000000d6'),
  1::bigint,
  'the other proof account remains after opener cleanup'
);
select is(
  (select count(*) from public.matches where id = '00000000-0000-0000-0000-0000000000e5'),
  0::bigint,
  'match cascades when either participant deletes their account'
);
select is(
  (select count(*) from public.conversations where id = '00000000-0000-0000-0000-0000000000f5'),
  0::bigint,
  'conversation cascades when its opener deletes their account'
);
select is(
  (select count(*) from public.messages where conversation_id = '00000000-0000-0000-0000-0000000000f5'),
  0::bigint,
  'conversation messages cascade with account cleanup'
);

select * from finish();
rollback;
