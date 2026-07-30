export const BACKEND_MODES = Object.freeze({
  LOCAL_DEMO: 'local-demo',
  SUPABASE_PROOF: 'supabase-proof'
});

export const BACKEND_TABLES = Object.freeze({
  PROFILES: 'profiles',
  ELIGIBILITY: 'eligibility',
  LIFE_STAGES: 'life_stages',
  FAMILY_CONTEXTS: 'family_contexts',
  FAITH_PROFILES: 'faith_profiles',
  STUDENT_VERIFICATIONS: 'student_verifications',
  PRIVACY_PORTRAITS: 'privacy_portraits',
  ATTRACTION_SIGNALS: 'attraction_signals',
  MATCHES: 'matches',
  CONTACT_ENTITLEMENTS: 'contact_entitlements',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  BLOCKS: 'blocks',
  INTERACTION_FEEDBACK: 'interaction_feedback',
  SAFETY_REPORTS: 'safety_reports'
});

export const BACKEND_RPC = Object.freeze({
  RECORD_ATTRACTION_SIGNAL: 'record_attraction_signal',
  OPEN_MATCH_CONVERSATION: 'open_match_conversation',
  BLOCK_USER: 'block_user'
});

export const BACKEND_EVENTS = Object.freeze({
  AUTH_STATE_CHANGED: 'auth-state-changed',
  PROFILE_CHANGED: 'profile-changed',
  MATCH_CREATED: 'match-created',
  CONVERSATION_OPENED: 'conversation-opened',
  MESSAGE_CREATED: 'message-created',
  USER_BLOCKED: 'user-blocked',
  REPORT_CREATED: 'report-created'
});

export function normaliseBackendConfig(config = {}) {
  const mode = Object.values(BACKEND_MODES).includes(config.mode)
    ? config.mode
    : BACKEND_MODES.LOCAL_DEMO;
  const url = String(config.url ?? '').trim().replace(/\/$/, '');
  const publishableKey = String(config.publishableKey ?? '').trim();

  return Object.freeze({ mode, url, publishableKey });
}

export function backendConfigurationStatus(config = {}) {
  const normalized = normaliseBackendConfig(config);
  if (normalized.mode === BACKEND_MODES.LOCAL_DEMO) {
    return Object.freeze({ ready: true, mode: normalized.mode, reason: 'local-demo' });
  }
  if (!/^https?:\/\//.test(normalized.url)) {
    return Object.freeze({ ready: false, mode: normalized.mode, reason: 'missing-url' });
  }
  if (normalized.publishableKey.length < 20) {
    return Object.freeze({ ready: false, mode: normalized.mode, reason: 'missing-publishable-key' });
  }
  return Object.freeze({ ready: true, mode: normalized.mode, reason: 'configured' });
}

export function resolveRuntimeBackendConfig(runtime = globalThis) {
  const configured = runtime?.__RENDEZVUE_CONFIG__ ?? {};
  return normaliseBackendConfig({
    mode: configured.backendMode,
    url: configured.supabaseUrl,
    publishableKey: configured.supabasePublishableKey
  });
}

export function assertServerAuthoritativeOperation(operation) {
  const prohibitedLocalOperations = new Set([
    BACKEND_RPC.RECORD_ATTRACTION_SIGNAL,
    BACKEND_RPC.OPEN_MATCH_CONVERSATION,
    BACKEND_RPC.BLOCK_USER,
    'create-message',
    'create-report'
  ]);
  if (prohibitedLocalOperations.has(operation)) {
    throw new Error(`${operation} must be executed by the server-authoritative backend`);
  }
  return true;
}
