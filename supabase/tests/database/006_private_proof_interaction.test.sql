begin;

select plan(33);

select ok(to_regprocedure('public.claim_private_proof_entitlement()') is not null, 'private proof entitlement RPC exists');
select ok(to_regprocedure('public.end_match_contact(uuid)') is not null, 'end contact RPC exists');
select ok(to_regprocedure('public.get_matched_portrait_path(uuid)') is not null, 'matched portrait path RPC exists');
select ok(not has_function_privilege('anon', 'public.claim_private_proof_entitlement()', 'EXECUTE'), 'anon cannot claim proof entitlement');
select ok(has_function_privilege('authenticated', 'public.claim_private_proof_entitlement()', 'EXECUTE'), 'authenticated can claim proof entitlement');
select ok(has_function_privilege('authenticated', 'public.end_match_contact(uuid)', 'EXECUTE'), 'authenticated can end contact');
select ok(has_function_privilege('authenticated', 'public.get_matched_portrait_path(uuid)', 'EXECUTE'), 'authenticated can request matched portrait path');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000a101', 'authenticated', 'authenticated', 'proof-a@rendezvue.test', crypt('proof-a', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000b202', 'authenticated', 'authenticated', 'proof-b@rendezvue.test', crypt('proof-b', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000c303', 'authenticated', 'authenticated', 'proof-c@rendezvue.test', crypt('proof-c', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

update public.profiles set nickname = 'Proof A', sex = 'woman', city_region = 'Utrecht', relationship_intent = 'serious', publication_status = 'published', published_at = now()
where user_id = '00000000-0000-0000-0000-00000000a101';
update public.profiles set nickname = 'Proof B', sex = 'man', city_region = 'Utrecht', relationship_intent = 'serious', publication_status = 'published', published_at = now()
where user_id = '00000000-0000-0000-0000-00000000b202';
update public.profiles set nickname = 'Proof C', sex = 'man', city_region = 'Utrecht', relationship_intent = 'serious', publication_status = 'draft'
where user_id = '00000000-0000-0000-0000-00000000c303';

insert into public.eligibility (
  user_id, current_relationship_state, adult_confirmed, serious_intent_confirmed,
  community_fit_confirmed, terms_version, confirmed_at
) values
  ('00000000-0000-0000-0000-00000000a101', 'single', true, true, true, 'synthetic-proof-2026-07', now()),
  ('00000000-0000-0000-0000-00000000b202', 'single', true, true, true, 'synthetic-proof-2026-07', now()),
  ('00000000-0000-0000-0000-00000000c303', 'single', true, true, true, 'ordinary-terms', now());

insert into public.privacy_portraits (user_id, object_path, treatment, status, is_public_profile_portrait)
values
  ('00000000-0000-0000-0000-00000000a101', '00000000-0000-0000-0000-00000000a101/a.webp', 'proof', 'pending', true),
  ('00000000-0000-0000-0000-00000000b202', '00000000-0000-0000-0000-00000000b202/b.webp', 'proof', 'pending', true);

insert into public.attraction_signals (actor_user_id, target_user_id, signal_type)
values
  ('00000000-0000-0000-0000-00000000a101', '00000000-0000-0000-0000-00000000b202', 'like'),
  ('00000000-0000-0000-0000-00000000b202', '00000000-0000-0000-0000-00000000a101', 'like');

insert into public.matches (id, user_a_id, user_b_id, status)
values (
  '00000000-0000-0000-0000-00000000d404',
  '00000000-0000-0000-0000-00000000a101',
  '00000000-0000-0000-0000-00000000b202',
  'active'
);

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-00000000a101","role":"authenticated"}';
set local role authenticated;

select ok(public.claim_private_proof_entitlement() is not null, 'published synthetic account can claim entitlement');
select is((select count(*) from public.contact_entitlements), 1::bigint, 'one entitlement is visible to owner');
select is((select status::text from public.contact_entitlements limit 1), 'available', 'claimed entitlement is available');
select is(public.claim_private_proof_entitlement(), (select id from public.contact_entitlements limit 1), 'repeated claim returns same entitlement');
select is((select count(*) from public.contact_entitlements), 1::bigint, 'repeated claim does not create another entitlement');
reset role;

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-00000000c303","role":"authenticated"}';
set local role authenticated;
select throws_ok(
  $$ select public.claim_private_proof_entitlement() $$,
  'published synthetic proof profile required',
  'ordinary or draft account cannot claim proof entitlement'
);
reset role;

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-00000000a101","role":"authenticated"}';
set local role authenticated;
select ok(public.open_match_conversation('00000000-0000-0000-0000-00000000d404', 'proof-open-a') is not null, 'entitled participant opens conversation');
select is((select status::text from public.contact_entitlements limit 1), 'consumed', 'opening consumes entitlement');
select is((select count(*) from public.conversations), 1::bigint, 'exactly one conversation exists');
select is((select status::text from public.conversations limit 1), 'open', 'conversation is open');
select is(public.claim_private_proof_entitlement(), (select id from public.contact_entitlements limit 1), 'claim after consumption returns the original proof entitlement');
select is((select count(*) from public.contact_entitlements), 1::bigint, 'claim after consumption cannot mint another proof entitlement');
select lives_ok(
  $$ insert into public.messages (conversation_id, sender_user_id, body)
     select id, '00000000-0000-0000-0000-00000000a101', 'bericht van A' from public.conversations limit 1 $$,
  'A can insert a message'
);
select is((select count(*) from public.messages), 1::bigint, 'A sees first message');
reset role;

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-00000000b202","role":"authenticated"}';
set local role authenticated;
select is((select count(*) from public.messages), 1::bigint, 'B can read participant message');
select lives_ok(
  $$ insert into public.messages (conversation_id, sender_user_id, body)
     select id, '00000000-0000-0000-0000-00000000b202', 'antwoord van B' from public.conversations limit 1 $$,
  'B can insert a reply'
);
select is((select count(*) from public.messages), 2::bigint, 'B sees both messages');
select is(public.get_matched_portrait_path('00000000-0000-0000-0000-00000000a101'), '00000000-0000-0000-0000-00000000a101/a.webp', 'active matched participant receives selected portrait path');
reset role;

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-00000000c303","role":"authenticated"}';
set local role authenticated;
select is(public.get_matched_portrait_path('00000000-0000-0000-0000-00000000a101'), null::text, 'non-match receives no portrait path');
reset role;

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-00000000a101","role":"authenticated"}';
set local role authenticated;
select is(public.end_match_contact('00000000-0000-0000-0000-00000000d404'), '00000000-0000-0000-0000-00000000d404'::uuid, 'participant can end contact');
select is((select status::text from public.matches limit 1), 'ended', 'match becomes ended');
select is((select status::text from public.conversations limit 1), 'ended', 'conversation becomes ended');
select is((select count(*) from public.attraction_signals where revoked_at is not null), 1::bigint, 'A sees only A own revoked attraction signal through RLS');
select is(public.get_matched_portrait_path('00000000-0000-0000-0000-00000000b202'), null::text, 'ended contact no longer exposes matched portrait path');
select ok(not public.is_conversation_available((select id from public.conversations limit 1), auth.uid()), 'ended conversation rejects new messages');
reset role;

select is((select count(*) from public.attraction_signals where revoked_at is not null), 2::bigint, 'both underlying attraction signals are revoked');

select * from finish();
rollback;
