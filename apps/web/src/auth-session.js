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

export function createAuthSessionAdapter(client) {
  const auth = requireAuthClient(client);

  return Object.freeze({
    async requestMagicLink(emailValue) {
      const email = normaliseAccountEmail(emailValue);
      const result = await auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true
        }
      });
      unwrap(result, 'email OTP request');
      return Object.freeze({ email, requested: true });
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
      unwrap(await auth.signOut({ scope: 'local' }), 'sign out');
      return true;
    }
  });
}
