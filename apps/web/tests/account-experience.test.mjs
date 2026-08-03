import test from 'node:test';
import assert from 'node:assert/strict';
import {
  accountCopy,
  classifyAuthCallback,
  genericAccountRequestMessage,
  maskAccountEmail,
  normaliseInterfaceLanguage,
  removeAuthErrorParameters,
  supportedInterfaceLanguages
} from '../src/account-experience.js';

test('Dutch is the default and English is explicitly supported', () => {
  assert.equal(normaliseInterfaceLanguage(undefined), 'nl');
  assert.equal(normaliseInterfaceLanguage('nl-NL'), 'nl');
  assert.equal(normaliseInterfaceLanguage('en-GB'), 'en');
  assert.deepEqual([...supportedInterfaceLanguages], ['nl', 'en']);
});

test('core account and recovery copy has Dutch and English parity', () => {
  const requiredKeys = [
    'account.title',
    'account.signinTitle',
    'account.existingAction',
    'account.registrationAction',
    'account.privacyHint',
    'account.recoverySummary',
    'account.recoveryIntro',
    'account.recoveryStepOne',
    'account.recoveryStepTwo',
    'account.recoveryStepThree',
    'account.recoveryWarning',
    'account.callbackUnusable',
    'account.callbackPending',
    'account.signedIn',
    'account.signOut',
    'account.deleteSummary',
    'account.deleteAction',
    'account.advancedSummary'
  ];

  for (const key of requiredKeys) {
    assert.notEqual(accountCopy('nl', key), key, `missing Dutch copy for ${key}`);
    assert.notEqual(accountCopy('en', key), key, `missing English copy for ${key}`);
  }
});

test('request confirmations remain generic and do not disclose account existence', () => {
  for (const language of supportedInterfaceLanguages) {
    for (const mode of ['existing_account', 'registration']) {
      const message = genericAccountRequestMessage(language, mode).toLowerCase();
      assert.ok(message.includes(language === 'nl' ? 'als' : 'if'));
      assert.doesNotMatch(message, /bestaat|does exist|does not exist|gevonden|not found|unknown account/);
    }
  }
});

test('account email is masked without exposing the full local part', () => {
  assert.equal(maskAccountEmail('fatima@example.nl'), 'fa••••@example.nl');
  assert.equal(maskAccountEmail('a@example.nl'), 'a•••@example.nl');
  assert.equal(maskAccountEmail('invalid'), '••••••');
});

test('callback guidance classifies provider errors and unresolved PKCE codes', () => {
  assert.equal(classifyAuthCallback('https://example.test/?error=access_denied'), 'unusable');
  assert.equal(classifyAuthCallback('https://example.test/?error_code=otp_expired'), 'unusable');
  assert.equal(classifyAuthCallback('https://example.test/?code=one-time-code'), 'pending');
  assert.equal(classifyAuthCallback('https://example.test/'), 'none');
});

test('provider error parameters can be removed without touching unrelated state', () => {
  const cleaned = removeAuthErrorParameters('https://example.test/path?lang=en&error=access_denied&error_description=nope#section');
  assert.equal(cleaned.searchParams.get('lang'), 'en');
  assert.equal(cleaned.searchParams.has('error'), false);
  assert.equal(cleaned.searchParams.has('error_description'), false);
  assert.equal(cleaned.hash, '#section');
});
