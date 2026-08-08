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

test('camera cancellation invalidates the active challenge session', async () => {
  const camera = await read('apps/private-preview/src/camera.js');
  assert.match(camera, /const session = cameraSession/);
  assert.match(camera, /session !== cameraSession/);
  assert.match(camera, /DOMException\('Camera recording cancelled\.', 'AbortError'\)/);
  assert.match(camera, /const recorder = activeRecorder;/);
  assert.match(camera, /if \(recorder\?\.state === 'recording'\) recorder\.stop\(\)/);
  assert.match(camera, /activeVideoElement\.srcObject = null/);
});

test('optional profile photos support camera and gallery while discovery remains one-primary-image', async () => {
  const controller = await read('apps/private-preview/profile-media-controller.js');
  const gallery = await read('apps/private-preview/profile-media-gallery.js');
  const css = await read('apps/private-preview/profile-media.css');
  assert.match(controller, /data-camera-slot="profile_photo_1"/);
  assert.match(controller, /data-camera-slot="profile_photo_2"/);
  assert.match(controller, /data-gallery-button="profile_photo_1"/);
  assert.match(controller, /data-gallery-button="profile_photo_2"/);
  assert.match(controller, /data-slot-label="profile_photo_1"/);
  assert.match(controller, /data-slot-label="profile_photo_2"/);
  assert.match(controller, /data-live-trust-badge/);
  assert.match(controller, /hasLive \? 'noLegalIdentity' : 'livePending'/);
  assert.match(controller, /set_primary_profile_media/);
  assert.match(gallery, /get_discovery_profile_media/);
  assert.match(gallery, /horizontalDiscoverySwipeReserved:\s*true/);
  assert.match(gallery, /discoveryPrimaryImageCount:\s*1/);
  assert.match(gallery, /profileMediaTrustCopy/);
  assert.match(gallery, /liveShort:\s*'✓ Live'/);
  assert.match(gallery, /trigger\.classList\.toggle\('is-live', hasLive\)/);
  assert.match(css, /\.rv-discovery-media-count\.is-live\{background:rgba\(23,95,78,\.94\)\}/);
  assert.match(gallery, /setAttribute\('aria-label', copy\('previous'\)\)/);
  assert.match(gallery, /setAttribute\('aria-label', copy\('next'\)\)/);
  assert.match(gallery, /setAttribute\('aria-pressed', index === activeIndex \? 'true' : 'false'\)/);
  assert.match(gallery, /image\.alt = active\.nickname/);
  assert.match(gallery, /async function openProfile\(card\)/);
  assert.match(gallery, /const freshMedia = await loadProfileMedia\(data\.userId\)/);
  assert.match(gallery, /decorateCard\(card, media, profile\.user_id\)/);
});

test('live-selfie trust panel keeps status compact and explanation full-width', async () => {
  const controller = await read('apps/private-preview/profile-media-controller.js');
  const css = await read('apps/private-preview/profile-media.css');
  assert.match(controller, /trustTitle: 'Live selfie voor vertrouwen'/);
  assert.match(controller, /livePending: 'Nog nodig'/);
  assert.match(controller, /noLegalIdentity: 'Aanwezig'/);
  assert.match(controller, /Dit is geen identiteitscontrole\./);
  assert.match(controller, /trustTitle: 'Live selfie for trust'/);
  assert.match(controller, /livePending: 'Needed'/);
  assert.match(controller, /noLegalIdentity: 'Present'/);
  assert.match(controller, /This is not identity verification\./);
  assert.doesNotMatch(controller, /Live selfie aanwezig · geen wettelijke identiteitscontrole/);
  assert.match(css, /\.rv-profile-media-intro\{display:grid;grid-template-columns:minmax\(0,1fr\) auto;/);
  assert.match(css, /\.rv-profile-media-intro>div\{display:contents\}/);
  assert.match(css, /\.rv-profile-media-intro p\{grid-column:1\/-1;/);
  assert.match(css, /\.rv-live-trust-badge\{grid-column:2;grid-row:1;justify-self:end;white-space:nowrap;/);
});

test('portrait progress after refresh depends on the Live-selfie slot rather than any primary photo', async () => {
  const shell = await read('apps/private-preview/product-shell.js');
  assert.match(shell, /profile_media_slot', 'live_selfie'/);
  assert.match(shell, /capture_origin', 'live_camera'/);
  assert.match(shell, /is_profile_media_visible', true/);
  assert.match(shell, /if \(liveSelfie\?\.id\) state\.completedStages\.add\('portrait'\)/);
  assert.match(shell, /else state\.completedStages\.delete\('portrait'\)/);
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
