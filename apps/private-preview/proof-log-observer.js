import { supabase } from './app.js';

const log = document.querySelector('#proof-log');
const portrait = document.querySelector('#matched-portrait');
const messageForm = document.querySelector('#message-form');

if (!log) throw new Error('WP-057 proof log is missing');

const mappings = [
  [/Globale sessie beëindigd|Lokale sessie beëindigd/i, 'globalSignOut'],
  [/profiel en onboardingstatus opgeslagen/i, 'profileSaved'],
  [/privacyportret privé geüpload en geselecteerd/i, 'portraitSelected'],
  [/server-side publicatiegate gepubliceerd/i, 'profilePublished'],
  [/Like server-side opgeslagen/i, 'likeSent'],
  [/eenmalig synthetisch proof-contactrecht gecontroleerd/i, 'entitlement'],
  [/Gesprek server-side geopend of idempotent hergebruikt/i, 'conversation'],
  [/Realtime gesprekssubscriptie actief|Realtime bericht ontvangen/i, 'realtime'],
  [/Matched privacyportret via tijdelijke signed URL geladen/i, 'portraitAccess'],
  [/Private veiligheidsrapportage opgeslagen/i, 'report'],
  [/Private gestructureerde feedback opgeslagen zonder publieke rating/i, 'feedback'],
  [/Proofaccount, relationele data en private portretten zijn verwijderd/i, 'cleanup']
];

let revocationCheckTimer = null;
let revocationCheckRunning = false;
let revocationConfirmed = false;
let lastRevocationDiagnostic = '';

function dispatchProof(step, details = {}) {
  globalThis.dispatchEvent(new CustomEvent('rendezvue:proof-event', {
    detail: { step, status: 'pass', details }
  }));
}

function appendSanitizedLog(message) {
  const item = document.createElement('li');
  item.textContent = `${new Date().toLocaleTimeString('nl-NL')} — ${message}`;
  log.prepend(item);
}

function appendRevocationDiagnostic(message) {
  if (!message || message === lastRevocationDiagnostic) return;
  lastRevocationDiagnostic = message;
  appendSanitizedLog(message);
}

function clearRevokedInteractionUi() {
  if (portrait) {
    portrait.hidden = true;
    portrait.removeAttribute('src');
  }
  if (messageForm) {
    for (const control of messageForm.querySelectorAll('input, button')) control.disabled = true;
  }
}

function firstRpcRow(data) {
  if (Array.isArray(data)) return data[0] ?? null;
  return data && typeof data === 'object' ? data : null;
}

async function verifyContactRevocation() {
  if (revocationCheckRunning || revocationConfirmed) return;
  revocationCheckRunning = true;

  try {
    const sessionResult = await supabase.auth.getSession();
    if (sessionResult.error || !sessionResult.data?.session?.user) {
      appendRevocationDiagnostic('Revocatiecontrole wacht: geen actieve synthetische browsersessie.');
      return;
    }

    const stateResult = await supabase.rpc('get_contact_revocation_state');
    if (stateResult.error) {
      appendRevocationDiagnostic('Revocatiecontrole kon de gesanitiseerde serverstatus niet lezen.');
      return;
    }

    const state = firstRpcRow(stateResult.data);
    if (!state?.terminal_match_found) {
      appendRevocationDiagnostic('Revocatiecontrole wacht: geen beëindigde of geblokkeerde match gevonden.');
      return;
    }

    const conversationClosed = state.conversation_closed === true;
    const portraitRevoked = state.new_portrait_access_revoked === true;
    const messageWriteRevoked = state.message_write_revoked === true;

    if (!conversationClosed || !portraitRevoked || !messageWriteRevoked) {
      appendRevocationDiagnostic(
        `Revocatiecontrole wacht: gesprekGesloten=${conversationClosed}, nieuwPortretpadIngetrokken=${portraitRevoked}, berichtschrijvenIngetrokken=${messageWriteRevoked}.`
      );
      return;
    }

    revocationConfirmed = true;
    clearRevokedInteractionUi();
    dispatchProof('contactRevoked', {
      revoked: true,
      status: String(state.match_status ?? 'terminal')
    });
    appendSanitizedLog('Nieuwe gesprek- en portrettoegang zijn server-side ingetrokken; de lokale portretweergave is gewist.');
  } catch {
    appendRevocationDiagnostic('Revocatiecontrole is tijdelijk niet beschikbaar; probeer Diagnostiek uitvoeren opnieuw.');
  } finally {
    revocationCheckRunning = false;
  }
}

function scheduleRevocationCheck(delay = 900) {
  if (revocationConfirmed) return;
  if (revocationCheckTimer) clearTimeout(revocationCheckTimer);
  revocationCheckTimer = setTimeout(() => {
    revocationCheckTimer = null;
    verifyContactRevocation().catch(() => undefined);
  }, delay);
}

function inspect(node) {
  const text = String(node?.textContent ?? '');
  for (const [pattern, step] of mappings) {
    if (!pattern.test(text)) continue;
    dispatchProof(step, { present: true });
  }
  if (/Contact en eventueel gesprek server-side beëindigd|deelnemer geblokkeerd/i.test(text)) {
    scheduleRevocationCheck();
  }
}

for (const item of log.querySelectorAll('li')) inspect(item);

new MutationObserver((records) => {
  for (const record of records) {
    for (const node of record.addedNodes) inspect(node);
  }
}).observe(log, { childList: true });

for (const selector of [
  '#end-contact',
  '#block-proof-user',
  '#refresh-interaction',
  '#load-matches',
  '#wp057-diagnostics'
]) {
  document.querySelector(selector)?.addEventListener('click', () => scheduleRevocationCheck());
}

scheduleRevocationCheck(250);
