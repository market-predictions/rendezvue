begin;

select plan(23);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000','63000000-0000-4000-8000-000000000001','authenticated','authenticated','media-owner@rendezvue.test',crypt('proof', gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','63000000-0000-4000-8000-000000000002','authenticated','authenticated','media-viewer@rendezvue.test',crypt('proof', gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now());

select has_column('public', 'privacy_portraits', 'profile_media_slot', 'profile media slot is persisted');
select has_column('public', 'privacy_portraits', 'capture_origin', 'capture origin is persisted');
select has_column('public', 'privacy_portraits', 'is_profile_media_visible', 'visible profile-media boundary is persisted');
select has_column('public', 'privacy_portraits', 'live_capture_completed_at', 'live capture completion timestamp is persisted');
select has_function('public', 'assign_prepared_profile_media', array['uuid','text','text','uuid','boolean','text'], 'assignment RPC exists');
select has_function('public', 'set_primary_profile_media', array['uuid'], 'primary media RPC exists');
select has_function('public', 'get_discovery_profile_media', array['uuid'], 'discovery media RPC exists');

insert into storage.objects (bucket_id, name, owner_id) values
  ('privacy-portraits','63000000-0000-4000-8000-000000000001/prepared/73000000-0000-4000-8000-000000000001/source.webp','63000000-0000-4000-8000-000000000001'),
  ('privacy-portraits','63000000-0000-4000-8000-000000000001/prepared/73000000-0000-4000-8000-000000000001/card-4x5.webp','63000000-0000-4000-8000-000000000001'),
  ('privacy-portraits','63000000-0000-4000-8000-000000000001/prepared/73000000-0000-4000-8000-000000000001/avatar-square.webp','63000000-0000-4000-8000-000000000001'),
  ('privacy-portraits','63000000-0000-4000-8000-000000000001/prepared/73000000-0000-4000-8000-000000000002/source.webp','63000000-0000-4000-8000-000000000001'),
  ('privacy-portraits','63000000-0000-4000-8000-000000000001/prepared/73000000-0000-4000-8000-000000000002/card-4x5.webp','63000000-0000-4000-8000-000000000001'),
  ('privacy-portraits','63000000-0000-4000-8000-000000000001/prepared/73000000-0000-4000-8000-000000000002/avatar-square.webp','63000000-0000-4000-8000-000000000001');

set local "request.jwt.claims" = '{"sub":"63000000-0000-4000-8000-000000000001","role":"authenticated"}';
set local role authenticated;

select ok(public.register_prepared_portrait(
  '73000000-0000-4000-8000-000000000001',
  '63000000-0000-4000-8000-000000000001/prepared/73000000-0000-4000-8000-000000000001/source.webp',
  '63000000-0000-4000-8000-000000000001/prepared/73000000-0000-4000-8000-000000000001/card-4x5.webp',
  '63000000-0000-4000-8000-000000000001/prepared/73000000-0000-4000-8000-000000000001/avatar-square.webp',
  0.5,0.42,1,1200,1200,'softFocus','{}'::text[]
) is not null, 'live-selfie prepared derivative is registered through the existing privacy pipeline');

select ok(public.assign_prepared_profile_media(
  '73000000-0000-4000-8000-000000000001','live_selfie','live_camera',null,true,'blink-turn-v1'
) is not null, 'prepared derivative is assigned to the mandatory live-selfie slot');

select is((select profile_media_slot from public.get_own_profile_media() where profile_media_slot = 'live_selfie'), 'live_selfie', 'visible live selfie is exposed through the owner-safe media projection');
select is((select count(*)::int from public.get_own_profile_media()), 1, 'owner initially has exactly one visible media item');

select ok(public.register_prepared_portrait(
  '73000000-0000-4000-8000-000000000002',
  '63000000-0000-4000-8000-000000000001/prepared/73000000-0000-4000-8000-000000000002/source.webp',
  '63000000-0000-4000-8000-000000000001/prepared/73000000-0000-4000-8000-000000000002/card-4x5.webp',
  '63000000-0000-4000-8000-000000000001/prepared/73000000-0000-4000-8000-000000000002/avatar-square.webp',
  0.5,0.5,1,1600,1200,'unfiltered','{}'::text[]
) is not null, 'optional profile photo uses the same prepared-derivative privacy pipeline');

select ok(public.assign_prepared_profile_media(
  '73000000-0000-4000-8000-000000000002','profile_photo_1','gallery','73000000-0000-4000-8000-000000000001',false,null
) is not null, 'optional gallery photo is assigned without replacing the requested primary');

select is((select count(*)::int from public.get_own_profile_media()), 2, 'owner can expose live selfie plus optional profile photo');
select is((select preparation_id from public.get_own_profile_media() where is_primary), '73000000-0000-4000-8000-000000000001'::uuid, 'live selfie remains primary when optional photo is not requested as primary');
select ok(public.set_primary_profile_media('73000000-0000-4000-8000-000000000002') is not null, 'owner may explicitly choose the optional photo as discovery primary');
select is((select preparation_id from public.get_own_profile_media() where is_primary), '73000000-0000-4000-8000-000000000002'::uuid, 'explicit primary selection is persisted');

select throws_ok(
  $$select public.assign_prepared_profile_media('73000000-0000-4000-8000-000000000001','live_selfie','gallery',null,false,'blink-turn-v1')$$,
  'P0001', 'live selfie requires live camera capture',
  'gallery material cannot be relabelled as a live selfie'
);

reset role;
set local "request.jwt.claims" = '{}';
update public.profiles set nickname='Media Owner', sex='woman', city_region='Utrecht', publication_status='published', published_at=now()
where user_id='63000000-0000-4000-8000-000000000001';
update public.profiles set nickname='Media Viewer', sex='man', city_region='Utrecht', publication_status='published', published_at=now()
where user_id='63000000-0000-4000-8000-000000000002';

set local "request.jwt.claims" = '{"sub":"63000000-0000-4000-8000-000000000002","role":"authenticated"}';
set local role authenticated;
select is((select count(*)::int from public.get_discovery_profile_media('63000000-0000-4000-8000-000000000001')), 2, 'discovery can load both visible prepared card derivatives');
select ok(public.can_read_discovery_portrait_object('63000000-0000-4000-8000-000000000001/prepared/73000000-0000-4000-8000-000000000001/card-4x5.webp'), 'discovery may read the visible live-selfie card');
select ok(public.can_read_discovery_portrait_object('63000000-0000-4000-8000-000000000001/prepared/73000000-0000-4000-8000-000000000002/card-4x5.webp'), 'discovery may read the visible optional profile card');
select ok(not public.can_read_discovery_portrait_object('63000000-0000-4000-8000-000000000001/prepared/73000000-0000-4000-8000-000000000001/source.webp'), 'normalized live-selfie source remains inaccessible to discovery');
select ok(not public.can_read_discovery_portrait_object('63000000-0000-4000-8000-000000000001/prepared/73000000-0000-4000-8000-000000000001/avatar-square.webp'), 'avatar remains outside discovery media access');

select * from finish();
rollback;
