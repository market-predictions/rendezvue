import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRIVACY_PORTRAIT_FILTERS,
  PRIVACY_PORTRAIT_FILTER_IDS,
  normalisePrivacyFilterId,
  privacyFilterDefinition,
  requirePrivacyFilterId
} from '../../private-preview/privacy-portrait-filters.js';

test('privacy portrait selection exposes exactly four bounded choices', () => {
  assert.deepEqual(PRIVACY_PORTRAIT_FILTER_IDS, ['softFocus', 'warmVeil', 'monoMist', 'privacyMax']);
  assert.equal(PRIVACY_PORTRAIT_FILTERS.length, 4);
  assert.equal(PRIVACY_PORTRAIT_FILTERS.filter(({ recommended }) => recommended).length, 1);
  assert.equal(PRIVACY_PORTRAIT_FILTERS.find(({ recommended }) => recommended)?.id, 'warmVeil');
});

test('privacy strength increases monotonically across the fixed choices', () => {
  assert.deepEqual(PRIVACY_PORTRAIT_FILTERS.map(({ privacyRank }) => privacyRank), [1, 2, 3, 4]);
  assert.deepEqual(PRIVACY_PORTRAIT_FILTERS.map(({ blur }) => blur), [9, 13, 17, 24]);
  assert.ok(privacyFilterDefinition('privacyMax').pixelDivisor > privacyFilterDefinition('softFocus').pixelDivisor);
});

test('unknown, empty and raw-like values fail closed', () => {
  assert.equal(normalisePrivacyFilterId('warmVeil'), 'warmVeil');
  assert.equal(normalisePrivacyFilterId(''), null);
  assert.equal(normalisePrivacyFilterId('raw'), null);
  assert.equal(normalisePrivacyFilterId('none'), null);
  assert.throws(() => requirePrivacyFilterId(undefined), /must be selected/);
  assert.throws(() => requirePrivacyFilterId('soft-focus'), /must be selected/);
});
