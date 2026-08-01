const diagnosticsButton = document.querySelector('#wp057-diagnostics');
const nextAction = document.querySelector('#wp057-next-action');
const MAX_DISABLED_MS = 15000;

if (!diagnosticsButton) throw new Error('WP-057 diagnostics button is missing');

let recoveryTimer = null;

function clearRecoveryTimer() {
  if (recoveryTimer !== null) {
    clearTimeout(recoveryTimer);
    recoveryTimer = null;
  }
}

function restoreButton(message = '') {
  clearRecoveryTimer();
  diagnosticsButton.disabled = false;
  diagnosticsButton.removeAttribute('aria-busy');
  diagnosticsButton.removeAttribute('data-diagnostics-busy');
  if (message && nextAction) nextAction.textContent = message;
}

function armRecoveryTimer() {
  clearRecoveryTimer();
  diagnosticsButton.setAttribute('aria-busy', 'true');
  diagnosticsButton.setAttribute('data-diagnostics-busy', 'true');
  recoveryTimer = setTimeout(() => {
    restoreButton('Diagnostiek reageerde niet binnen 15 seconden. De knop is hersteld; controleer de verbinding en probeer opnieuw.');
  }, MAX_DISABLED_MS);
}

// A previous unresolved browser request may have left the control disabled.
restoreButton();

diagnosticsButton.addEventListener('click', () => {
  queueMicrotask(() => {
    if (diagnosticsButton.disabled) armRecoveryTimer();
  });
}, { capture: true });

new MutationObserver(() => {
  if (diagnosticsButton.disabled) armRecoveryTimer();
  else {
    clearRecoveryTimer();
    diagnosticsButton.removeAttribute('aria-busy');
    diagnosticsButton.removeAttribute('data-diagnostics-busy');
  }
}).observe(diagnosticsButton, {
  attributes: true,
  attributeFilter: ['disabled']
});

globalThis.addEventListener('online', () => {
  if (diagnosticsButton.disabled) {
    restoreButton('Netwerkverbinding hersteld. Diagnostiek kan opnieuw worden uitgevoerd.');
  }
});
