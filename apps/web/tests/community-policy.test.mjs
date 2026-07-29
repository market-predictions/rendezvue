import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALLOWED_SEXES,
  candidateMatchesSexRule,
  derivedSeekingForSex,
  normalizeIdentityProfile,
  oppositeSex
} from '../community-policy.js';

test('community onboarding exposes only man and woman', () => {
  assert.deepEqual(ALLOWED_SEXES, ['woman', 'man']);
  assert.equal(ALLOWED_SEXES.includes('nonBinary'), false);
  assert.equal(ALLOWED_SEXES.includes('private'), false);
});

test('partner sex is derived automatically', () => {
  assert.equal(oppositeSex('man'), 'woman');
  assert.equal(oppositeSex('woman'), 'man');
  assert.equal(derivedSeekingForSex('man'), 'women');
  assert.equal(derivedSeekingForSex('woman'), 'men');
  assert.equal(derivedSeekingForSex(''), '');
});

test('discovery accepts only the opposite sex', () => {
  assert.equal(candidateMatchesSexRule('man', 'woman'), true);
  assert.equal(candidateMatchesSexRule('man', 'man'), false);
  assert.equal(candidateMatchesSexRule('woman', 'man'), true);
  assert.equal(candidateMatchesSexRule('woman', 'woman'), false);
});

test('legacy or unsupported identity values are cleared', () => {
  assert.deepEqual(
    normalizeIdentityProfile({ genderIdentity: 'nonBinary', seeking: 'everyone', city: 'Utrecht' }),
    { genderIdentity: '', seeking: '', city: 'Utrecht' }
  );
  assert.deepEqual(
    normalizeIdentityProfile({ genderIdentity: 'man', seeking: 'everyone' }),
    { genderIdentity: 'man', seeking: 'women' }
  );
});
