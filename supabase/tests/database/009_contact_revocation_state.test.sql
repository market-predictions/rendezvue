begin;

select plan(8);

select ok(
  to_regprocedure('public.get_contact_revocation_state()') is not null,
  'contact revocation proof state RPC exists'
);
select ok(
  not has_function_privilege('anon', 'public.get_contact_revocation_state()', 'EXECUTE'),
  'anonymous callers cannot execute contact revocation proof state RPC'
);
select ok(
  has_function_privilege('authenticated', 'public.get_contact_revocation_state()', 'EXECUTE'),
  'authenticated callers can execute contact revocation proof state RPC'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000009101', 'authenticated', 'authenticated', 'revocation-a@rendezvue.test', crypt('revocation-a', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000009202', 'authenticated', 'authenticated', 'revocation-b@rendezvue.test', crypt('revocation-b', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

insert into public.matches (id, user_a_id, user_b_id, status, ended_at)
values (
  '00000000-0000-0000-0000-000000009303',
  '00000000-0000-0000-0000-000000009101',
  '00000000-0000-0000-0000-000000009202',
  'ended',
  timezone('utc', now())
);

insert into public.conversations (id, match_id, opened_by_user_id, status, ended_at)
values (
  '00000000-0000-0000-0000-000000009404',
  '00000000-0000-0000-0000-000000009303',
  '00000000-0000-0000-0000-000000009101',
  'ended',
  timezone('utc', now())
);

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-000000009101","role":"authenticated"}';
set local role authenticated;

select is(
  (select terminal_match_found from public.get_contact_revocation_state()),
  true,
  'participant receives terminal match evidence'
);
select is(
  (select match_status from public.get_contact_revocation_state()),
  'ended',
  'participant receives the sanitized terminal match status'
);
select is(
  (select conversation_closed from public.get_contact_revocation_state()),
  true,
  'ended conversation is reported closed'
);
select is(
  (select new_portrait_access_revoked from public.get_contact_revocation_state()),
  true,
  'ended match cannot issue a new matched portrait path'
);
select is(
  (select message_write_revoked from public.get_contact_revocation_state()),
  true,
  'ended conversation rejects new message writes'
);

reset role;
select * from finish();
rollback;
