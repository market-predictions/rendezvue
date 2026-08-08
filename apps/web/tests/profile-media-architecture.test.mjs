import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  PROFILE_MEDIA_SLOTS,
  LIVE_CAPTURE_PROOF_VERSION,
  profileMediaContext,
  requireCaptureOrigin
} from '../../private-preview/profile-media-model.js';

const read = (path) => readFile(new URL(`../../../${path}`, import.meta.url), 'utf8');

test('WP076 has one live-selfie slot plus exactly two optional profile photo slots', () => {
  assert.deepEqual(PROFILE_MEDIA_SLOTS, ['live_selfie', 'profile_photo_1', 'profile_photo_2']);
  assert.equal(LIVE_CAPTURE_PROOF_VERSION, 'blink-turn-v1');
  assert.deepEqual(profileMediaContext({ slot: 'live_selfie', captureOrigin: 'live_camera' }), {
    slot: 'live_selfie', captureOrigin: 'live_camera', makePrimary: false, captureProofVersion: 'blink-turn-v1'
  });
  assert.throws(() => requireCaptureOrigin('live_selfie', 'gallery'), /live selfie/i);
  assert.equal(requireCaptureOrigin('profile_photo_1', 'gallery'), 'gallery');
  assert.equal(requireCaptureOrigin('profile_photo_2', 'camera'), 'camera');
});

test('live selfie is camera-only and challenge bytes are never uploaded as profile media', async () => {
  const controller = await read('apps/private-preview/profile-media-controller.js');
  assert.match(controller, /recordChallenge\(video/);
  assert.match(controller, /captureFrame\(video/);
  assert.match(controller, /slot:\s*'live_selfie',\s*captureOrigin:\s*'live_camera'/s);
  assert.doesNotMatch(controller, /data-gallery-slot="live_selfie"/);
  assert.doesNotMatch(controller, /bucket\.upload\([^)]*challenge/i);
  assert.doesNotMatch(controller, /storage[^\n]*challenge/i);
  assert.match(controller, /challenge recording itself is not stored as profile media|challenge-opname zelf wordt niet als profielmedia opgeslagen/);
});

test('optional profile photos support camera and gallery while discovery remains one-primary-image', async () => {
  const controller = await read('apps/private-preview/profile-media-controller.js');
  const gallery = await read('apps/private-preview/profile-media-gallery.js');
  assert.match(controller, /data-camera-slot="profile_photo_1"/);
  assert.match(controller, /data-camera-slot="profile_photo_2"/);
  assert.match(controller, /data-gallery-button="profile_photo_1"/);
  assert.match(controller, /data-gallery-button="profile_photo_2"/);
  assert.match(controller, /data-slot-label="profile_photo_1"/);
  assert.match(controller, /data-slot-label="profile_photo_2"/);
  assert.match(controller, /set_primary_profile_media/);
  assert.match(gallery, /get_discovery_profile_media/);
  assert.match(gallery, /horizontalDiscoverySwipeReserved:\s*true/);
  assert.match(gallery, /discoveryPrimaryImageCount:\s*1/);
  assert.match(gallery, /profileMediaTrustCopy/);
});

test('database contract separates visible prepared cards from raw and challenge media', async () => {
  const migration = await read('supabase/migrations/20260808100500_live_selfie_profile_media.sql');
  assert.match(migration, /profile_media_slot in \('live_selfie', 'profile_photo_1', 'profile_photo_2'\)/);
  assert.match(migration, /live selfie requires live camera capture/);
  assert.match(migration, /raw_or_challenge_media_public', false/);
  assert.match(migration, /legal_identity_verified', false/);
  assert.match(migration, /is_profile_media_visible/);
  assert.match(migration, /get_discovery_profile_media/);
  assert.match(migration, /asset_role = 'card'/);
  assert.match(migration, /live selfie required before publication/);
});

test('Cloudflare artifact explicitly permits same-origin camera but keeps microphone disabled', async () => {
  const finalizer = await read('scripts/finalize-profile-media-artifact.mjs');
  assert.match(finalizer, /Permissions-Policy: camera=\(self\), microphone=\(\), geolocation=\(\), payment=\(\)/);
  assert.match(finalizer, /Camera remains disabled by the generated Permissions-Policy/);
});
