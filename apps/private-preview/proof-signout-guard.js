const PROVEN_MARKER_PREFIX = 'rendezvue.wp057.explicit-global-signout.v1.';
const CONFIG_KEY = 'rendezvue.wp057.config.v1';
let cleanupStarted = false;

function currentMarkerKey() {
  try {
    const config = JSON.parse(localStorage.getItem(CONFIG_KEY) ?? 'null');
    if (!config?.runId || !['a', 'b'].includes(config.role)) return null;
    return `${PROVEN_MARKER_PREFIX}${config.runId}.${config.role}`;
  } catch {
    return null;
  }
}

globalThis.addEventListener('rendezvue:proof-event', (event) => {
  const step = String(event.detail?.step ?? '');

  // This event is emitted only after the explicit Afmelden button completed;
  // account cleanup does not write that proof-log milestone.
  if (step === 'globalSignOut' && !cleanupStarted && event.detail?.status !== 'blocked') {
    const marker = currentMarkerKey();
    if (marker) localStorage.setItem(marker, 'true');
    return;
  }

  if (step !== 'cleanup') return;
  cleanupStarted = true;

  setTimeout(() => {
    const marker = currentMarkerKey();
    if (marker && localStorage.getItem(marker) === 'true') return;
    globalThis.dispatchEvent(new CustomEvent('rendezvue:proof-event', {
      detail: {
        step: 'globalSignOut',
        status: 'blocked',
        details: { reason: 'Globale afmelding en heraanmelding moeten vóór accountcleanup afzonderlijk worden bewezen.' }
      }
    }));
  }, 250);
});
