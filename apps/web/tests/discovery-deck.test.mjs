import test from 'node:test';
import assert from 'node:assert/strict';
import {
  discoveryDeckCopy,
  normaliseDiscoveryLanguage,
  resolveDiscoveryDeckProgress
} from '../../private-preview/discovery-deck.js';

test('discovery deck defaults to Dutch and supports explicit English', () => {
  assert.equal(normaliseDiscoveryLanguage('nl-NL'), 'nl');
  assert.equal(normaliseDiscoveryLanguage('fr-FR'), 'nl');
  assert.equal(normaliseDiscoveryLanguage('en-GB'), 'en');
  assert.equal(discoveryDeckCopy('nl', 'position', { current: 2, total: 10 }), 'Profiel 2 van 10');
  assert.equal(discoveryDeckCopy('en', 'position', { current: 2, total: 10 }), 'Profile 2 of 10');
});

test('discovery deck advances through one profile at a time', () => {
  assert.deepEqual(resolveDiscoveryDeckProgress(10, 10), {
    total: 10,
    remaining: 10,
    current: 1,
    completed: 0,
    percent: 0
  });
  assert.deepEqual(resolveDiscoveryDeckProgress(10, 7), {
    total: 10,
    remaining: 7,
    current: 4,
    completed: 3,
    percent: 30
  });
  assert.deepEqual(resolveDiscoveryDeckProgress(10, 0), {
    total: 10,
    remaining: 0,
    current: 10,
    completed: 10,
    percent: 100
  });
});

test('discovery deck action labels remain explicit in both languages', () => {
  for (const language of ['nl', 'en']) {
    assert.match(discoveryDeckCopy(language, 'pass'), /Overslaan|Pass/);
    assert.match(discoveryDeckCopy(language, 'like'), /Leuk|Like/);
    assert.match(discoveryDeckCopy(language, 'context'), /Reageer|Respond/);
  }
});

test('discovery deck rejects unknown copy keys', () => {
  assert.throws(() => discoveryDeckCopy('nl', 'missing'), /Unknown discovery deck copy key/);
});
