function requireAuthClient(client) {
  if (!client?.auth) {
    throw new TypeError('A Supabase-compatible auth client is required');
  }
  for (const method of ['signInWithOtp', 'verifyOtp', 'getSession', 'getUser', 'onAuthStateChange', 'signOut']) {
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

export function normaliseEmailOtp(value, length = 6) {
  const requiredLength = Number(length);
  if (!Number.isInteger(requiredLength) || requiredLength < 6 || requiredLength > 10) {
    throw new TypeError('Email OTP length must be between 6 and 10 digits');
  }
  const token = String(value ?? '').trim().replace(/\s+/g, '');
  if (!new RegExp(`^\\d{${requiredLength}}$`).test(token)) {
    throw new TypeError(`A ${requiredLength}-digit email code is required`);
  }
  return token;
}

export function createAuthSessionAdapter(client, options = {}) {
  const auth = requireAuthClient(client);
  const redirectTo = String(options.redirectTo ?? '').trim();
  const otpLength = Number.isInteger(options.otpLength) ? options.otpLength : 6;

  async function requestEmailProof(emailValue, mode) {
    const email = normaliseAccountEmail(emailValue);
    const registration = mode === 'registration';
    const result = await auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: registration,
        ...(redirectTo ? { emailRedirectTo: redirectTo } : {})
      }
    });
    unwrap(result, registration ? 'registration passwordless request' : 'existing-account passwordless request');
    return Object.freeze({
      email,
      requested: true,
      mode: registration ? 'registration' : 'existing_account',
      delivery: 'email_otp_or_link'
    });
  }

  return Object.freeze({
    // Backwards-compatible names retained while the product UI moves to code-first wording.
    async requestMagicLink(emailValue) {
      return requestEmailProof(emailValue, 'existing_account');
    },

    async requestExistingAccountMagicLink(emailValue) {
      return requestEmailProof(emailValue, 'existing_account');
    },

    async requestRegistrationMagicLink(emailValue) {
      return requestEmailProof(emailValue, 'registration');
    },

    async requestExistingAccountEmailOtp(emailValue) {
      return requestEmailProof(emailValue, 'existing_account');
    },

    async requestRegistrationEmailOtp(emailValue) {
      return requestEmailProof(emailValue, 'registration');
    },

    async verifyEmailOtp(emailValue, tokenValue) {
      const email = normaliseAccountEmail(emailValue);
      const token = normaliseEmailOtp(tokenValue, otpLength);
      const data = unwrap(await auth.verifyOtp({ email, token, type: 'email' }), 'email OTP verification');
      return Object.freeze({
        email,
        verified: true,
        user: data?.user ?? data?.session?.user ?? null,
        session: data?.session ?? null
      });
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
