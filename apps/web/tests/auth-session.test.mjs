import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthSessionAdapter, normaliseAccountEmail } from '../src/auth-session.js';

function makeAuthClient(overrides = {}) {
  const calls = [];
  let callback = null;
  let unsubscribed = false;
  const auth = {
    async signInWithOtp(payload) {
      calls.push(['signInWithOtp', payload]);
      return { data: {}, error: null };
    },
    async getSession() {
      calls.push(['getSession']);
      return { data: { session: { access_token: 'synthetic' } }, error: null };
    },
    async getUser() {
      calls.push(['getUser']);
      return { data: { user: { id: 'user-1' } }, error: null };
    },
    onAuthStateChange(listener) {
      calls.push(['onAuthStateChange']);
      callback = listener;
      return { data: { subscription: { unsubscribe() { unsubscribed = true; } } } };
    },
    async signOut(payload) {
      calls.push(['signOut', payload]);
      return { data: {}, error: null };
    },
    ...overrides
  };
  return {
    client: { auth },
    calls,
    emit(event, session) { callback?.(event, session); },
    wasUnsubscribed() { return unsubscribed; }
  };
}

test('personal email is trimmed and normalized', () => {
  assert.equal(normaliseAccountEmail('  User@Example.NL '), 'user@example.nl');
  assert.throws(() => normaliseAccountEmail('not-an-email'), /valid personal email/);
});

test('existing-account magic link is fail-closed and cannot create a user', async () => {
  const fake = makeAuthClient();
  const auth = createAuthSessionAdapter(fake.client, {
    redirectTo: 'https://rendezvue-private-preview.pages.dev/'
  });
  assert.deepEqual(await auth.requestMagicLink('USER@EXAMPLE.NL'), {
    email: 'user@example.nl',
    requested: true,
    mode: 'existing_account'
  });
  assert.deepEqual(fake.calls[0], [
    'signInWithOtp',
    {
      email: 'user@example.nl',
      options: {
        shouldCreateUser: false,
        emailRedirectTo: 'https://rendezvue-private-preview.pages.dev/'
      }
    }
  ]);
});

test('explicit registration magic link is the only path that may create a user', async () => {
  const fake = makeAuthClient();
  const auth = createAuthSessionAdapter(fake.client, {
    redirectTo: 'https://rendezvue-private-preview.pages.dev/'
  });
  assert.deepEqual(await auth.requestRegistrationMagicLink('new@example.nl'), {
    email: 'new@example.nl',
    requested: true,
    mode: 'registration'
  });
  assert.equal(fake.calls[0][1].options.shouldCreateUser, true);
});

test('existing-account alias and local requests remain fail-closed', async () => {
  const fake = makeAuthClient();
  const auth = createAuthSessionAdapter(fake.client);
  await auth.requestExistingAccountMagicLink('user@example.nl');
  assert.deepEqual(fake.calls[0][1].options, { shouldCreateUser: false });
});

test('session restore and current user unwrap provider data', async () => {
  const fake = makeAuthClient();
  const auth = createAuthSessionAdapter(fake.client);
  assert.equal((await auth.restoreSession()).access_token, 'synthetic');
  assert.equal((await auth.currentUser()).id, 'user-1');
});

test('auth subscription can be disposed', () => {
  const fake = makeAuthClient();
  const auth = createAuthSessionAdapter(fake.client);
  const events = [];
  const dispose = auth.subscribe((event) => events.push(event));
  fake.emit('SIGNED_IN', { user: { id: 'user-1' } });
  assert.equal(events[0].event, 'SIGNED_IN');
  assert.equal(events[0].session.user.id, 'user-1');
  dispose();
  assert.equal(fake.wasUnsubscribed(), true);
});

test('sign out revokes every proof session for the account', async () => {
  const fake = makeAuthClient();
  const auth = createAuthSessionAdapter(fake.client);
  assert.equal(await auth.signOut(), true);
  assert.deepEqual(fake.calls.at(-1), ['signOut', { scope: 'global' }]);
});

test('provider errors are surfaced with operation context', async () => {
  const fake = makeAuthClient({
    async signInWithOtp() {
      return { data: null, error: { message: 'request rejected' } };
    }
  });
  const auth = createAuthSessionAdapter(fake.client);
  await assert.rejects(
    () => auth.requestExistingAccountMagicLink('user@example.nl'),
    /existing-account magic-link request failed: request rejected/
  );
  await assert.rejects(
    () => auth.requestRegistrationMagicLink('user@example.nl'),
    /registration magic-link request failed: request rejected/
  );
});
