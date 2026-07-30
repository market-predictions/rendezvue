begin;

select plan(29);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000a1', 'authenticated', 'authenticated', 'a@rendezvue.test', crypt('test-password-a', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"nickname":"Amina"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000b2', 'authenticated', 'authenticated', 'b@rendezvue.test', crypt('test-password-b', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"nickname":"Bilal"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000c3', 'authenticated', 'authenticated', 'c@rendezvue.test', crypt('test-password-c', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"nickname":"Control"}', now(), now());

select is((select count(*) from public.profiles), 3::bigint, 'auth trigger creates one profile per account');

update public.profiles set nickname = 'Amina', sex = 'woman', city_region = 'Rotterdam', publication_status = 'published', published_at = now() where user_id = '00000000-0000-0000-0000-0000000000a1';
update public.profiles set nickname = 'Bilal', sex = 'man', city_region = 'Rotterdam', publication_status = 'published', published_at = now() where user_id = '00000000-0000-0000-0000-0000000000b2';
update public.profiles set nickname = 'Control', sex = 'woman', city_region = 'Utrecht', publication_status = 'published', published_at = now() where user_id = '00000000-0000-0000-0000-0000000000c3';

insert into public.eligibility (user_id, current_relationship_state, adult_confirmed, serious_intent_confirmed, community_fit_confirmed)
values
  ('00000000-0000-0000-0000-0000000000a1', 'single', true, true, true),
  ('00000000-0000-0000-0000-0000000000b2', 'single', true, true, true),
  ('00000000-0000-0000-0000-0000000000c3', 'single', true, true, true);
insert into public.family_contexts (user_id, marital_history, has_children, wants_children, accepts_partner_with_children)
values
  ('00000000-0000-0000-0000-0000000000a1', 'never_married', false, 'yes', 'yes'),
  ('00000000-0000-0000-0000-0000000000b2', 'divorced', true, 'open_to_more', 'yes');
insert into public.faith_profiles (user_id, faith_identity, practice_description, practice_visibility)
values
  ('00000000-0000-0000-0000-0000000000a1', 'muslim', 'private-test-a', 'private'),
  ('00000000-0000-0000-0000-0000000000b2', 'muslim', 'private-test-b', 'private');

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';
set local role authenticated;
select is((select count(*) from public.eligibility), 1::bigint, 'A sees only A eligibility');
select is((select count(*) from public.family_contexts), 1::bigint, 'A sees only A family context');
select is((select count(*) from public.faith_profiles), 1::bigint, 'A sees only A faith profile');
select is((select count(*) from public.profiles), 3::bigint, 'A sees own and published profiles before a block');
update public.eligibility set serious_intent_confirmed = false where user_id = '00000000-0000-0000-0000-0000000000b2';
select is(
  (select resulting_match_id from public.record_attraction_signal('00000000-0000-0000-0000-0000000000b2', 'like', null, null)),
  null::uuid,
  'first one-sided like creates no match'
);
reset role;

select is(
  (select serious_intent_confirmed from public.eligibility where user_id = '00000000-0000-0000-0000-0000000000b2'),
  true,
  'A cannot update B eligibility'
);

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}';
set local role authenticated;
select is((select count(*) from public.attraction_signals), 0::bigint, 'B cannot query incoming like from A');
select ok(
  (select resulting_match_id is not null from public.record_attraction_signal('00000000-0000-0000-0000-0000000000a1', 'contextual_like', 'profile-prompt', 'Salam, dit herken ik.')),
  'reciprocal like creates a match'
);
select is(
  (select resulting_match_id from public.record_attraction_signal('00000000-0000-0000-0000-0000000000a1', 'like', null, null)),
  (select id from public.matches limit 1),
  'repeated reciprocal like returns the same match'
);
reset role;

select is((select count(*) from public.matches), 1::bigint, 'one user pair has exactly one match');

insert into public.contact_entitlements (owner_user_id, source_type, status)
values ('00000000-0000-0000-0000-0000000000a1', 'pilot', 'available');

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';
set local role authenticated;
select ok(
  (select public.open_match_conversation((select id from public.matches limit 1), 'proof-open-1') is not null),
  'A consumes one entitlement to open the conversation'
);
select is(
  (select public.open_match_conversation((select id from public.matches limit 1), 'proof-open-retry')),
  (select id from public.conversations limit 1),
  'conversation open retry returns the existing conversation'
);
insert into public.messages (conversation_id, sender_user_id, body)
select id, '00000000-0000-0000-0000-0000000000a1', 'Assalamu alaikum' from public.conversations limit 1;
insert into public.interaction_feedback (match_id, reviewer_user_id, subject_user_id, interaction_depth, positive_tags)
select id, '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b2', 'messaged', array['respectful'] from public.matches limit 1;
insert into public.safety_reports (reporter_user_id, subject_user_id, match_id, category, severity)
select '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b2', id, 'profile_inaccuracy', 'low' from public.matches limit 1;
select is((select count(*) from public.interaction_feedback), 1::bigint, 'A can read A private feedback');
select is((select count(*) from public.safety_reports), 1::bigint, 'A can read A report');
reset role;

select is((select count(*) from public.conversations), 1::bigint, 'exactly one conversation exists');
select is((select count(*) from public.contact_entitlements where status = 'consumed'), 1::bigint, 'exactly one entitlement is consumed');
select is((select count(*) from public.messages), 1::bigint, 'participant message insert succeeds');

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}';
set local role authenticated;
select is((select count(*) from public.messages), 1::bigint, 'B can read the shared conversation message');
select is((select count(*) from public.interaction_feedback), 0::bigint, 'B cannot read feedback about B');
select is((select count(*) from public.safety_reports), 0::bigint, 'B cannot read report about B');
reset role;

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000c3","role":"authenticated"}';
set local role authenticated;
select is((select count(*) from public.messages), 0::bigint, 'unrelated C cannot read conversation messages');
reset role;

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';
set local role authenticated;
select ok(
  public.block_user('00000000-0000-0000-0000-0000000000b2', 'owner-test') is not null,
  'A can block B through the server-authoritative function'
);
select is((select count(*) from public.profiles where user_id = '00000000-0000-0000-0000-0000000000b2'), 0::bigint, 'A no longer sees B profile after blocking');
reset role;

select is((select status::text from public.matches limit 1), 'blocked', 'block freezes the match');
select is((select status::text from public.conversations limit 1), 'blocked', 'block freezes the conversation');
select is((select count(*) from public.attraction_signals where revoked_at is not null), 2::bigint, 'block revokes both attraction signals');
select is((select count(*) from public.audit_events where event_type = 'user_blocked'), 1::bigint, 'block creates one audit event');

set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}';
set local role authenticated;
select is(
  public.is_conversation_available((select id from public.conversations limit 1), auth.uid()),
  false,
  'blocked conversation rejects further participant messaging'
);
reset role;

select * from finish();
rollback;
