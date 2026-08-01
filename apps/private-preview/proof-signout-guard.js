const PROVEN_MARKER = 'rendezvue.wp057.global-signout-proven.v1';
const CONFIG_KEY = 'rendezvue.wp057.config.v1';
const EVIDENCE_PREFIX = 'rendezvue.wp057.evidence.v1.';
let cleanupStarted = false;

function persistedGlobalSignOutPassed() {
  try {
    const config = JSON.parse(localStorage.getItem(CONFIG_KEY) ?? 'null');
    if (!config?.runId || !config?.role) return false;
    const evidence = JSON.parse(localStorage.getItem(`${EVIDENCE_PREFIX}${config.runId}.${config.role}`) ?? 'null');
    return evidence?.checks?.globalSignOut?.status === 'pass';
  } catch {
    return false;
  }
}

globalThis.addEventListener('rendezvue:proof-event', (event) => {
  const step = String(event.detail?.step ?? '');

  if (step === 'globalSignOut' && !cleanupStarted && event.detail?.status !== 'blocked') {
    sessionStorage.setItem(PROVEN_MARKER, 'true');
    return;
  }

  if (step !== 'cleanup') return;
  cleanupStarted = true;

  setTimeout(() => {
    if (sessionStorage.getItem(PROVEN_MARKER) === 'true' || persistedGlobalSignOutPassed()) return;
    globalThis.dispatchEvent(new CustomEvent('rendezvue:proof-event', {
      detail: {
        step: 'globalSignOut',
        status: 'blocked',
        details: { reason: 'Globale afmelding en heraanmelding moeten vóór accountcleanup afzonderlijk worden bewezen.' }
      }
    }));
  }, 250);
});
