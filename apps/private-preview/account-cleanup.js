import { supabase } from './app.js';
import './proof-console-ui.js';
import './proof-result-sanitizer.js';
import './proof-orchestrator.js';
import './proof-publication-verifier.js';
import './proof-log-observer.js';
import './proof-signout-guard.js';
import './proof-portrait-generator.js';

const CONFIRMATION = 'DELETE_SYNTHETIC_ACCOUNT';
const form = document.querySelector('#delete-account-form');
const confirmationInput = document.querySelector('#delete-account-confirmation');
const output = document.querySelector('#result-output');
const logList = document.querySelector('#proof-log');

function appendLog(message, level = 'info') {
  const item = document.createElement('li');
  item.textContent = `${new Date().toLocaleTimeString('nl-NL')} — ${message}`;
  if (level === 'error') item.classList.add('error');
  logList.prepend(item);
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error ?? 'Onbekende fout');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;

  try {
    const confirmation = confirmationInput.value.trim();
    if (confirmation !== CONFIRMATION) {
      throw new Error('De bevestigingstekst komt niet exact overeen');
    }

    const { data, error } = await supabase.functions.invoke('delete-private-proof-account', {
      body: { confirmation }
    });
    if (error) throw new Error(`Accountcleanup mislukt: ${error.message}`);
    if (!data?.deleted) throw new Error('De cleanupfunctie bevestigde geen accountverwijdering');

    const sanitizedResult = {
      deleted: true,
      removedPrivateObjects: Number(data.removedPrivateObjects ?? 0),
      retainedAuditIdentifiersAnonymised: data.retainedAuditIdentifiersAnonymised === true,
      signedOutLocally: true
    };
    output.textContent = JSON.stringify(sanitizedResult, null, 2);

    globalThis.dispatchEvent(new CustomEvent('rendezvue:proof-event', {
      detail: {
        step: 'cleanup',
        status: 'pass',
        details: {
          count: sanitizedResult.removedPrivateObjects,
          present: sanitizedResult.retainedAuditIdentifiersAnonymised
        }
      }
    }));

    // The remote Auth user no longer exists. Remove the now-stale local
    // browser session without attempting another server-side Auth mutation.
    await supabase.auth.signOut({ scope: 'local' });
    confirmationInput.value = '';
    appendLog('Proofaccount, relationele data en private portretten zijn verwijderd.');
  } catch (error) {
    appendLog(errorMessage(error), 'error');
  } finally {
    button.disabled = false;
  }
});
