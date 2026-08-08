import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createAuthSessionAdapter, normaliseEmailOtp } from '../src/auth-session.js';
import { accountCopy, genericAccountRequestMessage, supportedInterfaceLanguages } from '../src/account-experience.js';

const read = (path) => readFile(new URL(`../../../${path}`, import.meta.url), 'utf8');

function makeAuthClient(overrides = {}) {
  const calls = [];
  const auth = {
    async signInWithOtp(payload) {
      calls.push(['signInWithOtp', payload]);
      return { data: {}, error: null };
    },
    async verifyOtp(payload) {
      calls.push(['verifyOtp', payload]);
      return { data: { user: { id: 'user-1', email: payload.email }, session: { access_token: 'synthetic', user: { id: 'user-1' } } }, error: null };
    },
    async getSession() { return { data: { session: null }, error: null }; },
    async getUser() { return { data: { user: null }, error: null }; },
    onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; },
    async signOut() { return { data: {}, error: null }; },
    ...overrides
  };
  return { client: { auth }, calls };
}

test('WP075 normalises only a six-digit email code by default', () => {
  assert.equal(normaliseEmailOtp(' 123 456 '), '123456');
  assert.throws(() => normaliseEmailOtp('12345'), /6-digit/);
  assert.throws(() => normaliseEmailOtp('12a456'), /6-digit/);
});

test('WP075 existing-account request remains non-creating while registration stays explicit', async () => {
  const fake = makeAuthClient();
  const auth = createAuthSessionAdapter(fake.client, { redirectTo: 'https://rendezvue-private-preview.pages.dev/' });
  const existing = await auth.requestExistingAccountEmailOtp('USER@example.nl');
  const registration = await auth.requestRegistrationEmailOtp('new@example.nl');
  assert.equal(existing.mode, 'existing_account');
  assert.equal(existing.delivery, 'email_otp_or_link');
  assert.equal(fake.calls[0][1].options.shouldCreateUser, false);
  assert.equal(registration.mode, 'registration');
  assert.equal(fake.calls[1][1].options.shouldCreateUser, true);
});

test('WP075 verifies the portable code as email OTP without a local PKCE verifier', async () => {
  const fake = makeAuthClient();
  const auth = createAuthSessionAdapter(fake.client);
  const verified = await auth.verifyEmailOtp('User@Example.NL', '184263');
  assert.equal(verified.verified, true);
  assert.equal(verified.email, 'user@example.nl');
  assert.deepEqual(fake.calls[0], ['verifyOtp', { email: 'user@example.nl', token: '184263', type: 'email' }]);
});

test('WP075 provider verification errors remain actionable without account enumeration', async () => {
  const fake = makeAuthClient({
    async verifyOtp() { return { data: null, error: { message: 'Token has expired or is invalid' } }; }
  });
  const auth = createAuthSessionAdapter(fake.client);
  await assert.rejects(() => auth.verifyEmailOtp('user@example.nl', '184263'), /email OTP verification failed/);
  for (const language of supportedInterfaceLanguages) {
    const message = accountCopy(language, 'account.otpInvalid').toLowerCase();
    assert.match(message, language === 'nl' ? /ongeldig|verlopen/ : /invalid|expired/);
    assert.doesNotMatch(message, /account exists|account bestaat|unknown account|onbekend account/);
  }
});

test('WP075 request copy is code-first and non-enumerating in Dutch and English', () => {
  for (const language of supportedInterfaceLanguages) {
    for (const mode of ['existing_account', 'registration']) {
      const message = genericAccountRequestMessage(language, mode).toLowerCase();
      assert.match(message, /code/);
      assert.doesNotMatch(message, /account bestaat|account exists|not found|niet gevonden/);
    }
  }
});

test('WP075 runtime and hosted template preserve session isolation and magic-link convenience', async () => {
  const [controller, template, workflow] = await Promise.all([
    read('apps/private-preview/email-otp-controller.js'),
    read('supabase/templates/magic-link.html'),
    read('.github/workflows/configure-wp075-email-otp.yml')
  ]);
  assert.match(controller, /sessionPropagation:\s*false/);
  assert.doesNotMatch(controller, /refresh_token|access_token|document\.cookie/);
  assert.match(template, /\{\{ \.Token \}\}/);
  assert.match(template, /\{\{ \.ConfirmationURL \}\}/);
  assert.match(workflow, /mailer_otp_length/);
  assert.match(workflow, /mailer_otp_exp/);
});
