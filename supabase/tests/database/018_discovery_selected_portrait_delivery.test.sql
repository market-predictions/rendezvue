begin;

select plan(11);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000','62000000-0000-4000-8000-000000000001','authenticated','authenticated','discovery-owner@rendezvue.test',crypt('proof', gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','62000000-0000-4000-8000-000000000002','authenticated','authenticated','discovery-viewer@rendezvue.test',crypt('proof', gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now());

-- Synthetic fixture publication remains a privileged setup concern. Product publication
-- through publish_profile() is separately proven to require a Live selfie in WP-076.
update public.profiles set nickname = 'Selected Portrait Owner', sex = 'woman', publication_status = 'published', published_at = now()
where user_id = '62000000-0000-4000-8000-000000000001';
update public.profiles set nickname = 'Selected Portrait Viewer', sex = 'man', publication_status = 'published', published_at = now()
where user_id = '62000000-0000-4000-8000-000000000002';

insert into storage.objects (bucket_id, name, owner_id)
values
  ('privacy-portraits','62000000-0000-4000-8000-000000000001/prepared/72000000-0000-4000-8000-000000000001/source.webp','62000000-0000-4000-8000-000000000001'),
  ('privacy-portraits','62000000-0000-4000-8000-000000000001/prepared/72000000-0000-4000-8000-000000000001/card-4x5.webp','62000000-0000-4000-8000-000000000001'),
  ('privacy-portraits','62000000-0000-4000-8000-000000000001/prepared/72000000-0000-4000-8000-000000000001/avatar-square.webp','62000000-0000-4000-8000-000000000001');

set local "request.jwt.claims" = '{"sub":"62000000-0000-4000-8000-000000000001","role":"authenticated"}';
set local role authenticated;
select ok(
  public.register_prepared_portrait(
    '72000000-0000-4000-8000-000000000001',
    '62000000-0000-4000-8000-000000000001/prepared/72000000-0000-4000-8000-000000000001/source.webp',
    '62000000-0000-4000-8000-000000000001/prepared/72000000-0000-4000-8000-000000000001/card-4x5.webp',
    '62000000-0000-4000-8000-000000000001/prepared/72000000-0000-4000-8000-000000000001/avatar-square.webp',
    0.5, 0.42, 1, 1600, 2000, 'morePrivate', '{}'::text[]
  ) is not null,
  'owner registers one exact More private prepared portrait'
);
select ok(
  public.assign_prepared_profile_media(
    '72000000-0000-4000-8000-000000000001',
    'profile_photo_1',
    'gallery',
    null,
    true,
    null
  ) is not null,
  'owner explicitly exposes the prepared card through a bounded profile-media slot'
);
reset role;
set local "request.jwt.claims" = '{}';

set local "request.jwt.claims" = '{"sub":"62000000-0000-4000-8000-000000000002","role":"authenticated"}';
set local role authenticated;
select is(
  public.get_discovery_portrait_path('62000000-0000-4000-8000-000000000001'),
  '62000000-0000-4000-8000-000000000001/prepared/72000000-0000-4000-8000-000000000001/card-4x5.webp',
  'discovery resolves exactly the selected visible prepared card'
);
select ok(public.can_read_discovery_portrait_object('62000000-0000-4000-8000-000000000001/prepared/72000000-0000-4000-8000-000000000001/card-4x5.webp'), 'authenticated discovery may read the selected published card object');
select ok(not public.can_read_discovery_portrait_object('62000000-0000-4000-8000-000000000001/prepared/72000000-0000-4000-8000-000000000001/source.webp'), 'normalized source is never readable through discovery');
select ok(not public.can_read_discovery_portrait_object('62000000-0000-4000-8000-000000000001/prepared/72000000-0000-4000-8000-000000000001/avatar-square.webp'), 'non-selected avatar object is not opened by discovery card policy');
select is(public.get_discovery_portrait_path('62000000-0000-4000-8000-000000000002'), null::text, 'self portrait lookup is denied');
reset role;
set local "request.jwt.claims" = '{}';

update public.profiles set publication_status = 'paused' where user_id = '62000000-0000-4000-8000-000000000001';
set local "request.jwt.claims" = '{"sub":"62000000-0000-4000-8000-000000000002","role":"authenticated"}';
set local role authenticated;
select is(public.get_discovery_portrait_path('62000000-0000-4000-8000-000000000001'), null::text, 'unpublished profile portrait is unavailable to discovery');
select ok(not public.can_read_discovery_portrait_object('62000000-0000-4000-8000-000000000001/prepared/72000000-0000-4000-8000-000000000001/card-4x5.webp'), 'unpublished selected card is denied by storage policy helper');
reset role;
set local "request.jwt.claims" = '{}';

update public.profiles set publication_status = 'published' where user_id = '62000000-0000-4000-8000-000000000001';
insert into public.blocks (blocker_user_id, blocked_user_id, reason_code)
values ('62000000-0000-4000-8000-000000000002','62000000-0000-4000-8000-000000000001','test');
set local "request.jwt.claims" = '{"sub":"62000000-0000-4000-8000-000000000002","role":"authenticated"}';
set local role authenticated;
select is(public.get_discovery_portrait_path('62000000-0000-4000-8000-000000000001'), null::text, 'blocked profile portrait is unavailable to discovery');
select ok(not public.can_read_discovery_portrait_object('62000000-0000-4000-8000-000000000001/prepared/72000000-0000-4000-8000-000000000001/card-4x5.webp'), 'block revokes discovery storage access to the selected card');

select * from finish();
rollback;
