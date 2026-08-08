import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { requireCaptureOrigin } from '../../private-preview/profile-media-model.js';
import {
  SYNTHETIC_PROFILE_MEDIA,
  SYNTHETIC_PROFILE_MEDIA_BOUNDARY,
  syntheticProfileAssetForName,
  syntheticProfileMediaForName
} from '../../private-preview/synthetic-profile-media.js';

const read = (path) => readFile(new URL(`../../../${path}`, import.meta.url), 'utf8');

test('WP077 keeps capture, framing, privacy and result in one bounded composer', async () => {
  const composer = await read('apps/private-preview/selfie-composer.js');
  const css = await read('apps/private-preview/selfie-composer.css');
  assert.match(composer, /taskOrder:\s*Object\.freeze\(\['capture','frame','privacy','result','decide'\]\)/);
  assert.match(composer, /workflow\.append\(liveStep, camera, form\)/);
  assert.match(composer, /steps\.replaceWith\(optionalStep\)/);
  assert.match(composer, /applyPrivacyFilterToCanvas\(resultCanvas, source, filterId\)/);
  assert.match(composer, /resultCanvas\.hidden = !ready/);
  assert.match(css, /\.rv-selfie-composer-grid\{display:grid;grid-template-columns:minmax\(0,1\.35fr\) minmax\(15rem,\.65fr\)/);
  assert.match(css, /\.rv-selfie-result\{position:sticky/);
  assert.match(css, /@media\(max-width:48rem\).*\.rv-selfie-composer-grid\{grid-template-columns:1fr\}/s);
});

test('WP077 preserves mandatory explicit privacy selection', async () => {
  const privacy = await read('apps/private-preview/privacy-portrait-controller.js');
  const composer = await read('apps/private-preview/selfie-composer.js');
  assert.match(privacy, /let selectedFilterId = null;/);
  assert.match(privacy, /selectedFilterId = null;\s*inspection = inspectProfileImage/s);
  assert.match(privacy, /if \(!selectedFilterId\) throw new Error\(text\('chooseFilter'\)\)/);
  assert.doesNotMatch(composer, /\.click\(\).*filter|selectedFilterId\s*=/);
});

test('WP078 makes the row the checkbox target instead of inflating the native checkbox', async () => {
  const css = await read('apps/private-preview/mobile-touch.css');
  assert.match(css, /input\[type="checkbox"\],\.rv-touch-contract \.rv-fieldset input\[type="radio"\]/);
  assert.match(css, /width:1\.55rem!important;height:1\.55rem!important;min-width:1\.55rem!important;min-height:1\.55rem!important/);
  assert.match(css, /\.rv-check,\.rv-touch-contract \.rv-touch-choice-row\{[^}]*min-height:3\.65rem/s);
  assert.match(css, /@media \(pointer:coarse\),\(hover:none\)/);
  assert.match(css, /\.rv-nav\{position:fixed!important/);
  assert.match(css, /font-size:1rem;min-height:3\.25rem/);
});

test('WP078 adds explicit coarse touch alternatives for zoom', async () => {
  const touch = await read('apps/private-preview/mobile-touch.js');
  assert.match(touch, /rv-touch-range-controls/);
  assert.match(touch, /minus\.textContent = '−'/);
  assert.match(touch, /plus\.textContent = '\+'/);
  assert.match(touch, /preferredTargetCssPx:\s*48/);
  assert.match(touch, /absoluteMinimumCssPx:\s*44/);
});

test('WP079 maps only the canonical ten synthetic identities to approved portraits', () => {
  const names = ['Yasmin','Bilal','Amina','Idris','Maryam','Samir','Noura','Youssef','Hafsa','Omar'];
  assert.equal(Object.keys(SYNTHETIC_PROFILE_MEDIA).length, 10);
  for (const name of names) {
    const entry = syntheticProfileMediaForName(name);
    assert.ok(entry, `${name} should have a synthetic fixture`);
    assert.equal(entry.asset, `./assets/profiles/${name.toLowerCase()}.webp`);
    assert.equal(syntheticProfileAssetForName(`Proof ${name}`), entry.asset);
  }
  assert.equal(syntheticProfileMediaForName('Unknown Person'), null);
  assert.equal(syntheticProfileAssetForName('Unknown Person'), null);
  assert.deepEqual(SYNTHETIC_PROFILE_MEDIA_BOUNDARY, {
    fixtureOnly: true,
    liveSelfieEvidence: false,
    captureOrigin: null,
    legalIdentityVerified: false
  });
});

test('WP079 runtime is deployment-gated and never forges Live-selfie provenance', async () => {
  const controller = await read('apps/private-preview/synthetic-profile-media-controller.js');
  assert.match(controller, /deployment\?\.app === 'rendezvue-private-preview'/);
  assert.match(controller, /deployment\?\.audience === SYNTHETIC_AUDIENCE/);
  assert.match(controller, /deployment\?\.realUserAdmissionAuthorized === false/);
  assert.match(controller, /!\/synthetic\/i\.test\(badge\.textContent/);
  assert.match(controller, /synthetic-fixture-standin/);
  assert.match(controller, /data-synthetic-profile-open/);
  assert.doesNotMatch(controller, /captureOrigin\s*[:=]\s*['"]live_camera['"]/);
  assert.doesNotMatch(controller, /captureProofVersion|blink-turn-v1/);
  assert.throws(() => requireCaptureOrigin('live_selfie', 'gallery'), /live selfie/i);
  assert.equal(requireCaptureOrigin('live_selfie', 'live_camera'), 'live_camera');
});

test('integrated visual acceptance remains branch-only and authentication-free', async () => {
  const finalizer = await read('scripts/finalize-integrated-ux-artifact.mjs');
  const fixture = await read('scripts/fixtures/wp077-wp079-integrated-acceptance.html');
  assert.match(finalizer, /branchPreview = Boolean\(branch && branch !== 'main'\)/);
  assert.match(finalizer, /integrated-ux\.html/);
  assert.match(fixture, /Visual acceptance zonder login/);
  assert.match(fixture, /Mobile-first formelementen/);
  assert.match(fixture, /Selfie composer/);
  assert.match(fixture, /Maryam/);
  assert.match(fixture, /rv-thread-row/);
  assert.match(fixture, /rv-conversation-header/);
  assert.doesNotMatch(fixture, /<script\b|runtime-config\.js|app\.js|auth-session|createClient\(/i);
});
