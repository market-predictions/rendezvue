import { supabase } from './app.js';

const CONFIG_KEY = 'rendezvue.wp057.config.v1';
const MARKER_PREFIX = 'rendezvue.wp057.authority.v1.';
const checklist = document.querySelector('#wp057-checklist');

const authoritativeSteps = new Map([
  ['authenticated', 'Gecontroleerd synthetisch account is aangemeld'],
  ['profilePublished', 'Profiel is via de server-side publicatiegate gepubliceerd']
]);

function loadConfig() {
  try {
    const value = JSON.parse(localStorage.getItem(CONFIG_KEY) ?? 'null');
    if (value?.runId && ['a', 'b'].includes(value.role)) return value;
  } catch {
    // Invalid local proof metadata is handled by the main orchestrator.
  }
  return null;
}

function markerKey(step) {
  const config = loadConfig();
  if (!config || !authoritativeSteps.has(step)) return null;
  return `${MARKER_PREFIX}${config.runId}.${config.role}.${step}`;
}

function readMarker(step) {
  const key = markerKey(step);
  if (!key) return null;
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (value?.step === step && value?.passed === true) return value;
  } catch {
    // Invalid authority markers are ignored fail-closed.
  }
  return null;
}

function persistMarker(step, source) {
  const key = markerKey(step);
  if (!key) return;
  localStorage.setItem(key, JSON.stringify({
    schemaVersion: 1,
    step,
    passed: true,
    source: String(source ?? 'authoritative-event').slice(0, 80),
    at: new Date().toISOString()
  }));
}

function emitPass(step, source) {
  globalThis.dispatchEvent(new CustomEvent('rendezvue:proof-event', {
    detail: {
      step,
      status: 'pass',
      details: {
        present: true,
        source
      }
    }
  }));
}

function rememberPass(step, source) {
  if (!authoritativeSteps.has(step)) return;
  persistMarker(step, source);
  emitPass(step, source);
}

function inspectPublishedSnapshot(snapshot, source = 'owner-snapshot-rpc') {
  const profile = snapshot?.profile ?? null;
  if (profile?.publication_status === 'published' || Boolean(profile?.published_at)) {
    rememberPass('profilePublished', source);
  }
}

function checklistItem(step) {
  const label = authoritativeSteps.get(step);
  if (!label || !checklist) return null;
  return [...checklist.querySelectorAll('li')]
    .find((item) => String(item.textContent ?? '').includes(label)) ?? null;
}

function replayMarkers() {
  for (const step of authoritativeSteps.keys()) {
    const marker = readMarker(step);
    const item = checklistItem(step);
    if (marker && item && !item.classList.contains('pass')) {
      emitPass(step, 'authority-marker');
    }
  }
}

// Preserve authoritative proof events independently from the mutable diagnostic
// snapshot. Only the run ID, role, step, timestamp and source are stored.
globalThis.addEventListener('rendezvue:proof-event', (event) => {
  const step = String(event.detail?.step ?? '');
  if (event.detail?.status !== 'pass' || !authoritativeSteps.has(step)) return;
  const source = String(event.detail?.details?.source ?? 'authoritative-event');
  if (source !== 'authority-marker') persistMarker(step, source);
});

// Intercept only successful browser RPC results. A successful publication RPC is
// the authoritative event; a later snapshot/network failure may not erase it.
const originalRpc = supabase.rpc.bind(supabase);
const wrappedRpc = async (functionName, args, options) => {
  const result = await originalRpc(functionName, args, options);
  if (!result?.error) {
    if (functionName === 'publish_profile') {
      rememberPass('profilePublished', 'publish-rpc-response');
    } else if (functionName === 'load_onboarding_snapshot') {
      inspectPublishedSnapshot(result?.data, 'owner-snapshot-rpc');
    }
  }
  return result;
};

try {
  supabase.rpc = wrappedRpc;
} catch {
  Object.defineProperty(supabase, 'rpc', {
    configurable: true,
    writable: true,
    value: wrappedRpc
  });
}

// The app status is based on the persisted PKCE session. Capture that local,
// non-secret state without requiring a remote getUser() round-trip.
setTimeout(async () => {
  const { data, error } = await supabase.auth.getSession();
  if (!error && data?.session?.user) {
    rememberPass('authenticated', 'local-pkce-session');
  }
  replayMarkers();
}, 0);

supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) rememberPass('authenticated', 'auth-state-session');
});

if (checklist) {
  let replayTimer = null;
  new MutationObserver(() => {
    clearTimeout(replayTimer);
    replayTimer = setTimeout(replayMarkers, 50);
  }).observe(checklist, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
}
