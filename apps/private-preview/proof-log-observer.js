import { supabase } from './app.js';

const log = document.querySelector('#proof-log');
const portrait = document.querySelector('#matched-portrait');
const messageForm = document.querySelector('#message-form');
const matchSummary = document.querySelector('#interaction-match-summary');
const conversationSummary = document.querySelector('#conversation-summary');

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
let portraitDenialObserved = false;

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

function clearRevokedInteractionUi() {
  if (portrait) {
    portrait.hidden = true;
    portrait.removeAttribute('src');
  }
  if (messageForm) {
    for (const control of messageForm.querySelectorAll('input, button')) control.disabled = true;
  }
}

function terminalUiState() {
  const matchText = String(matchSummary?.textContent ?? '').toLowerCase();
  const conversationText = String(conversationSummary?.textContent ?? '').toLowerCase();
  const terminalMatch = /\b(ended|blocked)\b/.test(matchText);
  const conversationRevoked = !/\bopen\b/.test(conversationText);
  return { terminalMatch, conversationRevoked };
}

function confirmRevocation(status, source) {
  if (revocationConfirmed) return;
  revocationConfirmed = true;
  clearRevokedInteractionUi();
  dispatchProof('contactRevoked', { revoked: true, status });
  appendSanitizedLog(`Nieuwe gesprek- en portrettoegang zijn ingetrokken; bewijsbron: ${source}.`);
}

function verifyTerminalUiFallback() {
  if (revocationConfirmed || !portraitDenialObserved) return;
  const state = terminalUiState();
  if (!state.terminalMatch || !state.conversationRevoked) return;
  const matchText = String(matchSummary?.textContent ?? '').toLowerCase();
  confirmRevocation(matchText.includes('blocked') ? 'blocked' : 'ended', 'terminale serverstatus plus geweigerde nieuwe portretaanvraag');
}

async function verifyContactRevocation() {
  if (revocationCheckRunning || revocationConfirmed) return;
  revocationCheckRunning = true;

  try {
    const sessionResult = await supabase.auth.getSession();
    if (sessionResult.error || !sessionResult.data?.session?.user) return;
    const user = sessionResult.data.session.user;

    const matchesResult = await supabase
      .from('matches')
      .select('id,user_a_id,user_b_id,status,matched_at')
      .in('status', ['ended', 'blocked'])
      .order('matched_at', { ascending: false })
      .limit(1);
    if (matchesResult.error || !matchesResult.data?.length) {
      verifyTerminalUiFallback();
      return;
    }

    const match = matchesResult.data[0];
    const otherUserId = match.user_a_id === user.id ? match.user_b_id : match.user_a_id;
    if (!otherUserId) return;

    const [conversationResult, portraitPathResult] = await Promise.all([
      supabase
        .from('conversations')
        .select('status')
        .eq('match_id', match.id)
        .maybeSingle(),
      supabase.rpc('get_matched_portrait_path', { p_other_user_id: otherUserId })
    ]);

    if (conversationResult.error || portraitPathResult.error) {
      verifyTerminalUiFallback();
      return;
    }

    const conversationRevoked = !conversationResult.data || conversationResult.data.status !== 'open';
    const newPortraitAccessRevoked = portraitPathResult.data === null;
    if (!conversationRevoked || !newPortraitAccessRevoked) return;

    confirmRevocation(String(match.status), 'directe serververificatie');
  } finally {
    revocationCheckRunning = false;
  }
}

function scheduleRevocationCheck(delay = 900) {
  if (revocationConfirmed) return;
  if (revocationCheckTimer) clearTimeout(revocationCheckTimer);
  revocationCheckTimer = setTimeout(() => {
    revocationCheckTimer = null;
    verifyContactRevocation().catch(() => verifyTerminalUiFallback());
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
  if (/Geen toegankelijk matched privacyportret gevonden|Matched privacyportret opvragen mislukt/i.test(text)) {
    portraitDenialObserved = true;
    verifyTerminalUiFallback();
  }
}

for (const item of log.querySelectorAll('li')) inspect(item);

new MutationObserver((records) => {
  for (const record of records) {
    for (const node of record.addedNodes) inspect(node);
  }
  verifyTerminalUiFallback();
}).observe(log, { childList: true });

for (const element of [matchSummary, conversationSummary]) {
  if (!element) continue;
  new MutationObserver(() => verifyTerminalUiFallback()).observe(element, {
    childList: true,
    characterData: true,
    subtree: true
  });
}

for (const selector of [
  '#end-contact',
  '#block-proof-user',
  '#refresh-interaction',
  '#load-matches',
  '#load-matched-portrait',
  '#wp057-diagnostics'
]) {
  document.querySelector(selector)?.addEventListener('click', () => scheduleRevocationCheck());
}

scheduleRevocationCheck(250);
