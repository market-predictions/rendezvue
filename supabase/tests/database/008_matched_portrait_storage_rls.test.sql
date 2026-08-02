begin;

select plan(9);

select ok(
  to_regprocedure('public.can_read_matched_portrait_object(text)') is not null,
  'matched portrait Storage authorization helper exists'
);
select ok(
  not has_function_privilege('anon', 'public.can_read_matched_portrait_object(text)', 'EXECUTE'),
  'anonymous callers cannot execute matched portrait authorization helper'
);
select ok(
  has_function_privilege('authenticated', 'public.can_read_matched_portrait_object(text)', 'EXECUTE'),
  'authenticated callers can execute matched portrait authorization helper'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000008101', 'authenticated', 'authenticated', 'portrait-a@rendezvue.test', crypt('portrait-a', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000008202', 'authenticated', 'authenticated', 'portrait-b@rendezvue.test', crypt('portrait-b', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000008303', 'authenticated', 'authenticated', 'portrait-c@rendezvue.test', crypt('portrait-c', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

insert into public.privacy_portraits (
  user_id, object_path, treatment, status, is_public_profile_portrait
) values
  ('00000000-0000-0000-0000-000000008101', '00000000-0000-0000-0000-000000008101/a.webp', 'storage-rls-proof', 'pending', true),
  ('00000000-0000-0000-0000-000000008202', '00000000-0000-0000-0000-000000008202/b.webp', 'storage-rls-proof', 'pending', true),
  ('00000000-0000-0000-0000-000000008303', '00000000-0000-0000-0000-000000008303/c.webp', 'storage-rls-proof', 'pending', true);

insert into storage.objects (bucket_id, name, owner_id)
values
  ('privacy-portraits', '00000000-0000-0000-0000-000000008101/a.webp', '00000000-0000-0000-0000-000000008101'),
  ('privacy-portraits', '00000000-0000-0000-0000-000000008202/b.webp', '00000000-0000-0000-0000-000000008202'),
  ('privacy-portraits', '00000000-0000-0000-0000-000000008303/c.webp', '00000000-0000-0000-0000-000000008303');

insert into public.matches (id, user_a_id, user_b_id, status)
values (
  '00000000-0000-0000-0000-000000008404',
  '00000000-0000-0000-0000-000000008101',
  '00000000-0000-0000-0000-000000008202',
  'active'
);

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-000000008101","role":"authenticated"}';
set local role authenticated;

select ok(
  public.can_read_matched_portrait_object('00000000-0000-0000-0000-000000008202/b.webp'),
  'active participant is authorized for the selected portrait object of the match'
);
select is(
  (select count(*) from storage.objects where name = '00000000-0000-0000-0000-000000008202/b.webp'),
  1::bigint,
  'Storage RLS exposes the exact selected object of the active match'
);
select is(
  (select count(*) from storage.objects where name = '00000000-0000-0000-0000-000000008303/c.webp'),
  0::bigint,
  'Storage RLS does not expose an unmatched users portrait object'
);
select is(
  (select count(*) from storage.objects where name = '00000000-0000-0000-0000-000000008101/a.webp'),
  1::bigint,
  'existing owner policy still exposes the callers own portrait object'
);

reset role;
update public.matches
set status = 'ended', ended_at = timezone('utc', now())
where id = '00000000-0000-0000-0000-000000008404';

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-000000008101","role":"authenticated"}';
set local role authenticated;
select ok(
  not public.can_read_matched_portrait_object('00000000-0000-0000-0000-000000008202/b.webp'),
  'ended contact revokes the matched portrait authorization helper'
);
select is(
  (select count(*) from storage.objects where name = '00000000-0000-0000-0000-000000008202/b.webp'),
  0::bigint,
  'ended contact immediately hides the matched portrait object through Storage RLS'
);
reset role;

select * from finish();
rollback;
