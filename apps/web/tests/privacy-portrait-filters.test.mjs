import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRIVACY_PORTRAIT_FILTERS,
  PRIVACY_PORTRAIT_FILTER_IDS,
  normalisePrivacyFilterId,
  privacyFilterDefinition,
  requirePrivacyFilterId
} from '../../private-preview/privacy-portrait-filters.js';

test('privacy portrait selection exposes exactly four deliberate presentation choices', () => {
  assert.deepEqual(PRIVACY_PORTRAIT_FILTER_IDS, ['unfiltered', 'natural', 'softFocus', 'warmVeil']);
  assert.equal(PRIVACY_PORTRAIT_FILTERS.length, 4);
  assert.equal(PRIVACY_PORTRAIT_FILTERS.filter(({ recommended }) => recommended).length, 1);
  assert.equal(PRIVACY_PORTRAIT_FILTERS.find(({ recommended }) => recommended)?.id, 'softFocus');
});

test('recognisability decreases gradually without retaining the former heavy blur levels', () => {
  assert.deepEqual(PRIVACY_PORTRAIT_FILTERS.map(({ privacyRank }) => privacyRank), [1, 2, 3, 4]);
  assert.deepEqual(PRIVACY_PORTRAIT_FILTERS.map(({ blur }) => blur), [0, 3, 9, 13]);
  assert.equal(privacyFilterDefinition('unfiltered').pixelDivisor, 1);
  assert.equal(privacyFilterDefinition('unfiltered').veil, 'rgba(0, 0, 0, 0)');
  assert.ok(privacyFilterDefinition('natural').blur < privacyFilterDefinition('softFocus').blur);
  assert.deepEqual(
    { blur: privacyFilterDefinition('softFocus').blur, pixelDivisor: privacyFilterDefinition('softFocus').pixelDivisor },
    { blur: 9, pixelDivisor: 7 }
  );
  assert.deepEqual(
    { blur: privacyFilterDefinition('warmVeil').blur, pixelDivisor: privacyFilterDefinition('warmVeil').pixelDivisor },
    { blur: 13, pixelDivisor: 9 }
  );
  assert.equal(normalisePrivacyFilterId('monoMist'), null);
  assert.equal(normalisePrivacyFilterId('privacyMax'), null);
});

test('unfiltered is an explicit derivative choice while raw source-like values still fail closed', () => {
  assert.equal(normalisePrivacyFilterId('unfiltered'), 'unfiltered');
  assert.equal(normalisePrivacyFilterId('natural'), 'natural');
  assert.equal(normalisePrivacyFilterId(''), null);
  assert.equal(normalisePrivacyFilterId('raw'), null);
  assert.equal(normalisePrivacyFilterId('none'), null);
  assert.equal(normalisePrivacyFilterId('original'), null);
  assert.throws(() => requirePrivacyFilterId(undefined), /must be selected/);
  assert.throws(() => requirePrivacyFilterId('soft-focus'), /must be selected/);
});
