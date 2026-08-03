function requireAuthClient(client) {
  if (!client?.auth) {
    throw new TypeError('A Supabase-compatible auth client is required');
  }
  for (const method of ['signInWithOtp', 'getSession', 'getUser', 'onAuthStateChange', 'signOut']) {
    if (typeof client.auth[method] !== 'function') {
      throw new TypeError(`Auth client is missing ${method}`);
    }
  }
  return client.auth;
}

function unwrap(result, operation) {
  if (result?.error) {
    const error = new Error(`${operation} failed: ${result.error.message ?? 'unknown error'}`);
    error.cause = result.error;
    throw error;
  }
  return result?.data ?? null;
}

export function normaliseAccountEmail(value) {
  const email = String(value ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new TypeError('A valid personal email address is required');
  }
  return email;
}

export function createAuthSessionAdapter(client, options = {}) {
  const auth = requireAuthClient(client);
  const redirectTo = String(options.redirectTo ?? '').trim();

  async function requestEmailLink(emailValue, mode) {
    const email = normaliseAccountEmail(emailValue);
    const registration = mode === 'registration';
    const result = await auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: registration,
        ...(redirectTo ? { emailRedirectTo: redirectTo } : {})
      }
    });
    unwrap(result, registration ? 'registration magic-link request' : 'existing-account magic-link request');
    return Object.freeze({
      email,
      requested: true,
      mode: registration ? 'registration' : 'existing_account'
    });
  }

  return Object.freeze({
    async requestMagicLink(emailValue) {
      return requestEmailLink(emailValue, 'existing_account');
    },

    async requestExistingAccountMagicLink(emailValue) {
      return requestEmailLink(emailValue, 'existing_account');
    },

    async requestRegistrationMagicLink(emailValue) {
      return requestEmailLink(emailValue, 'registration');
    },

    async restoreSession() {
      const data = unwrap(await auth.getSession(), 'session restore');
      return data?.session ?? null;
    },

    async currentUser() {
      const data = unwrap(await auth.getUser(), 'current-user lookup');
      return data?.user ?? null;
    },

    subscribe(listener) {
      if (typeof listener !== 'function') {
        throw new TypeError('Auth-state listener must be a function');
      }
      const result = auth.onAuthStateChange((event, session) => {
        listener(Object.freeze({ event, session: session ?? null }));
      });
      const subscription = result?.data?.subscription;
      return () => subscription?.unsubscribe?.();
    },

    async signOut() {
      unwrap(await auth.signOut({ scope: 'global' }), 'sign out');
      return true;
    }
  });
}
