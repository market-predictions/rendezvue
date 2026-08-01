const PROVEN_MARKER = 'rendezvue.wp057.global-signout-proven.v1';
let cleanupStarted = false;

globalThis.addEventListener('rendezvue:proof-event', (event) => {
  const step = String(event.detail?.step ?? '');

  if (step === 'globalSignOut' && !cleanupStarted && event.detail?.status !== 'blocked') {
    sessionStorage.setItem(PROVEN_MARKER, 'true');
    return;
  }

  if (step !== 'cleanup') return;
  cleanupStarted = true;

  setTimeout(() => {
    if (sessionStorage.getItem(PROVEN_MARKER) === 'true') return;
    globalThis.dispatchEvent(new CustomEvent('rendezvue:proof-event', {
      detail: {
        step: 'globalSignOut',
        status: 'blocked',
        details: { reason: 'Globale afmelding en heraanmelding moeten vóór accountcleanup afzonderlijk worden bewezen.' }
      }
    }));
  }, 250);
});
