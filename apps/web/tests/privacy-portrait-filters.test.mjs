import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRIVACY_PORTRAIT_FILTERS,
  PRIVACY_PORTRAIT_FILTER_IDS,
  normalisePrivacyFilterId,
  privacyFilterDefinition,
  requirePrivacyFilterId
} from '../../private-preview/privacy-portrait-filters.js';

test('privacy portrait selection exposes exactly four useful active choices', () => {
  assert.deepEqual(PRIVACY_PORTRAIT_FILTER_IDS, ['unfiltered', 'softFocus', 'warmVeil', 'morePrivate']);
  assert.equal(PRIVACY_PORTRAIT_FILTERS.length, 4);
  assert.deepEqual(PRIVACY_PORTRAIT_FILTERS.map(({ privacyRank }) => privacyRank), [1, 2, 3, 4]);
  assert.equal(PRIVACY_PORTRAIT_FILTERS.filter(({ recommended }) => recommended).length, 1);
  assert.equal(PRIVACY_PORTRAIT_FILTERS.find(({ recommended }) => recommended)?.id, 'softFocus');
});

test('new ladder reuses former Soft and Balanced recipes without semantic mutation', () => {
  assert.deepEqual(PRIVACY_PORTRAIT_FILTERS.map(({ blur }) => blur), [0, 9, 13, 15]);
  assert.equal(privacyFilterDefinition('unfiltered').pixelDivisor, 1);
  assert.equal(privacyFilterDefinition('unfiltered').veil, 'rgba(0, 0, 0, 0)');
  assert.deepEqual(
    {
      blur: privacyFilterDefinition('softFocus').blur,
      pixelDivisor: privacyFilterDefinition('softFocus').pixelDivisor,
      saturation: privacyFilterDefinition('softFocus').saturation
    },
    { blur: 9, pixelDivisor: 7, saturation: 0.92 }
  );
  assert.deepEqual(
    {
      blur: privacyFilterDefinition('warmVeil').blur,
      pixelDivisor: privacyFilterDefinition('warmVeil').pixelDivisor,
      saturation: privacyFilterDefinition('warmVeil').saturation
    },
    { blur: 13, pixelDivisor: 9, saturation: 0.82 }
  );
});

test('More private is stronger than former Balanced but below the old vague heavy tier', () => {
  const soft = privacyFilterDefinition('softFocus');
  const balanced = privacyFilterDefinition('warmVeil');
  const morePrivate = privacyFilterDefinition('morePrivate');
  assert.ok(soft.blur > 0);
  assert.ok(balanced.blur > soft.blur);
  assert.ok(morePrivate.blur > balanced.blur);
  assert.ok(morePrivate.blur < 17, 'must remain lighter than former monoMist blur 17');
  assert.ok(morePrivate.pixelDivisor > balanced.pixelDivisor);
  assert.ok(morePrivate.pixelDivisor < 12, 'must remain less pixel-reduced than former monoMist');
  assert.ok(morePrivate.grayscale < 0.2, 'must not recreate former monoMist grayscale wash');
  assert.ok(morePrivate.saturation > 0.7, 'must retain useful facial colour/detail');
});

test('retired active IDs and raw source-like values fail closed for new client choices', () => {
  for (const value of ['natural', 'monoMist', 'privacyMax', 'raw', 'none', 'original', '']) {
    assert.equal(normalisePrivacyFilterId(value), null);
  }
  for (const value of ['unfiltered', 'softFocus', 'warmVeil', 'morePrivate']) {
    assert.equal(normalisePrivacyFilterId(value), value);
  }
  assert.throws(() => requirePrivacyFilterId(undefined), /must be selected/);
  assert.throws(() => requirePrivacyFilterId('natural'), /must be selected/);
});
