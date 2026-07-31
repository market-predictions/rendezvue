import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.110.8?bundle';
import { backendConfigurationStatus, resolveRuntimeBackendConfig } from './src/backend-contract.js';

const runtime = globalThis.__RENDEZVUE_CONFIG__ ?? {};
const backendConfig = resolveRuntimeBackendConfig(globalThis);
const configuration = backendConfigurationStatus(backendConfig);

if (!configuration.ready || backendConfig.mode !== 'supabase-proof') {
  throw new Error(`Interaction proof configuration is not ready: ${configuration.reason}`);
}

const supabase = createClient(backendConfig.url, backendConfig.publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

const output = document.querySelector('#result-output');
const logList = document.querySelector('#proof-log');
const matchSummary = document.querySelector('#interaction-match-summary');
const conversationSummary = document.querySelector('#conversation-summary');
const messageList = document.querySelector('#message-list');
const portraitImage = document.querySelector('#matched-portrait');

let activeMatch = null;
let activeConversation = null;
let otherUserId = null;
let realtimeChannel = null;

function appendLog(message, level = 'info') {
  const item = document.createElement('li');
  item.textContent = `${new Date().toLocaleTimeString('nl-NL')} — ${message}`;
  if (level === 'error') item.classList.add('error');
  logList.prepend(item);
}

function showResult(value) {
  output.textContent = JSON.stringify(value, null, 2);
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error ?? 'Onbekende fout');
}

function unwrap(result, operation) {
  if (result?.error) throw new Error(`${operation}: ${result.error.message ?? 'onbekende fout'}`);
  return result?.data ?? null;
}

async function currentUser() {
  const data = unwrap(await supabase.auth.getUser(), 'Gebruiker ophalen mislukt');
  if (!data?.user) throw new Error('Een actieve sessie is vereist');
  return data.user;
}

function resolveOtherParticipant(match, userId) {
  if (!match) return null;
  if (match.user_a_id === userId) return match.user_b_id;
  if (match.user_b_id === userId) return match.user_a_id;
  return null;
}

function renderMessages(rows) {
  messageList.replaceChildren();
  if (!rows.length) {
    messageList.textContent = 'Nog geen berichten.';
    messageList.className = 'message-list empty';
    return;
  }

  messageList.className = 'message-list';
  for (const row of rows) {
    const item = document.createElement('article');
    item.className = 'message-item';
    const meta = document.createElement('small');
    meta.textContent = `${row.sender_user_id === otherUserId ? 'Ander proofaccount' : 'Dit proofaccount'} · ${new Date(row.created_at).toLocaleString('nl-NL')}`;
    const body = document.createElement('p');
    body.textContent = row.body;
    item.append(meta, body);
    messageList.append(item);
  }
}

async function loadMessages() {
  if (!activeConversation) {
    renderMessages([]);
    return [];
  }
  const rows = unwrap(await supabase
    .from('messages')
    .select('id,conversation_id,sender_user_id,body,created_at')
    .eq('conversation_id', activeConversation.id)
    .order('created_at', { ascending: true }), 'Berichten laden mislukt') ?? [];
  renderMessages(rows);
  return rows;
}

async function subscribeToMessages() {
  if (realtimeChannel) {
    await supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
  if (!activeConversation) return;

  realtimeChannel = supabase
    .channel(`proof-conversation-${activeConversation.id}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${activeConversation.id}`
    }, async () => {
      await loadMessages();
      appendLog('Realtime bericht ontvangen.');
    })
    .subscribe((status) => {
      conversationSummary.dataset.realtime = status;
      if (status === 'SUBSCRIBED') appendLog('Realtime gesprekssubscriptie actief.');
    });
}

async function loadConversation() {
  if (!activeMatch) {
    activeConversation = null;
    conversationSummary.textContent = 'Selecteer eerst een match.';
    renderMessages([]);
    return null;
  }

  const conversation = unwrap(await supabase
    .from('conversations')
    .select('id,match_id,opened_by_user_id,status,opened_at,ended_at')
    .eq('match_id', activeMatch.id)
    .maybeSingle(), 'Gesprek laden mislukt');

  activeConversation = conversation;
  if (!conversation) {
    conversationSummary.textContent = 'Nog geen gesprek geopend.';
    renderMessages([]);
    await subscribeToMessages();
    return null;
  }

  conversationSummary.textContent = `Gesprek ${conversation.id} · ${conversation.status}`;
  await loadMessages();
  await subscribeToMessages();
  return conversation;
}

async function loadMatch() {
  const user = await currentUser();
  const matches = unwrap(await supabase
    .from('matches')
    .select('id,user_a_id,user_b_id,status,matched_at,ended_at')
    .order('matched_at', { ascending: false }), 'Matches laden mislukt') ?? [];

  activeMatch = matches.find((row) => row.status === 'active') ?? matches[0] ?? null;
  otherUserId = resolveOtherParticipant(activeMatch, user.id);

  if (!activeMatch) {
    matchSummary.textContent = 'Geen match zichtbaar voor dit account.';
    activeConversation = null;
    await subscribeToMessages();
    renderMessages([]);
    return { matches, activeMatch: null };
  }

  matchSummary.textContent = `Match ${activeMatch.id} · ${activeMatch.status} · andere deelnemer ${otherUserId}`;
  await loadConversation();
  return { matches, activeMatch, otherUserId, activeConversation };
}

function requireMatch() {
  if (!activeMatch || !otherUserId) throw new Error('Laad eerst een zichtbare match');
  return activeMatch;
}

document.querySelector('#refresh-interaction').addEventListener('click', async () => {
  try {
    const result = await loadMatch();
    showResult(result);
    appendLog('Match- en gespreksstatus vernieuwd.');
  } catch (error) {
    appendLog(errorMessage(error), 'error');
  }
});

document.querySelector('#claim-proof-entitlement').addEventListener('click', async () => {
  try {
    const entitlementId = unwrap(await supabase.rpc('claim_private_proof_entitlement'), 'Proof-contactrecht aanvragen mislukt');
    const entitlements = unwrap(await supabase
      .from('contact_entitlements')
      .select('id,source_type,status,valid_from,expires_at,consumed_match_id,consumed_at')
      .order('created_at', { ascending: false }), 'Contactrechten laden mislukt') ?? [];
    showResult({ entitlementId, entitlements });
    appendLog('Eenmalig synthetisch proof-contactrecht gecontroleerd.');
  } catch (error) {
    appendLog(errorMessage(error), 'error');
  }
});

document.querySelector('#open-conversation').addEventListener('click', async () => {
  try {
    const match = requireMatch();
    const conversationId = unwrap(await supabase.rpc('open_match_conversation', {
      p_match_id: match.id,
      p_idempotency_key: `private-preview-${match.id}`
    }), 'Gesprek openen mislukt');
    await loadConversation();
    showResult({ conversationId, activeConversation });
    appendLog('Gesprek server-side geopend of idempotent hergebruikt.');
  } catch (error) {
    appendLog(errorMessage(error), 'error');
  }
});

document.querySelector('#message-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  try {
    if (!activeConversation || activeConversation.status !== 'open') throw new Error('Een open gesprek is vereist');
    const user = await currentUser();
    const input = document.querySelector('#message-body');
    const body = input.value.trim();
    if (!body) throw new Error('Voer een synthetisch testbericht in');
    const message = unwrap(await supabase
      .from('messages')
      .insert({ conversation_id: activeConversation.id, sender_user_id: user.id, body })
      .select('id,conversation_id,sender_user_id,body,created_at')
      .single(), 'Bericht verzenden mislukt');
    input.value = '';
    await loadMessages();
    showResult({ message });
    appendLog('Synthetisch bericht opgeslagen.');
  } catch (error) {
    appendLog(errorMessage(error), 'error');
  } finally {
    button.disabled = false;
  }
});

document.querySelector('#load-matched-portrait').addEventListener('click', async () => {
  try {
    requireMatch();
    const objectPath = unwrap(await supabase.rpc('get_matched_portrait_path', {
      p_other_user_id: otherUserId
    }), 'Matched privacyportret opvragen mislukt');
    if (!objectPath) throw new Error('Geen toegankelijk matched privacyportret gevonden');
    const signed = unwrap(await supabase.storage
      .from('privacy-portraits')
      .createSignedUrl(objectPath, 300), 'Signed portrait-URL maken mislukt');
    portraitImage.src = signed.signedUrl;
    portraitImage.hidden = false;
    showResult({ objectPath, signedUrlExpiresInSeconds: 300 });
    appendLog('Matched privacyportret via tijdelijke signed URL geladen.');
  } catch (error) {
    portraitImage.hidden = true;
    appendLog(errorMessage(error), 'error');
  }
});

document.querySelector('#end-contact').addEventListener('click', async () => {
  try {
    const match = requireMatch();
    const matchId = unwrap(await supabase.rpc('end_match_contact', { p_match_id: match.id }), 'Contact beëindigen mislukt');
    await loadMatch();
    showResult({ endedMatchId: matchId, activeMatch, activeConversation });
    appendLog('Contact en eventueel gesprek server-side beëindigd.');
  } catch (error) {
    appendLog(errorMessage(error), 'error');
  }
});

document.querySelector('#block-proof-user').addEventListener('click', async () => {
  try {
    requireMatch();
    const blockId = unwrap(await supabase.rpc('block_user', {
      p_blocked_user_id: otherUserId,
      p_reason_code: 'synthetic_private_proof'
    }), 'Blokkeren mislukt');
    await loadMatch();
    showResult({ blockId, activeMatch, activeConversation });
    appendLog('Andere synthetische deelnemer geblokkeerd; match en gesprek zijn bevroren.');
  } catch (error) {
    appendLog(errorMessage(error), 'error');
  }
});

document.querySelector('#report-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  try {
    const match = requireMatch();
    const reportId = unwrap(await supabase.rpc('create_safety_report', {
      p_subject_user_id: otherUserId,
      p_match_id: match.id,
      p_category: document.querySelector('#report-category').value,
      p_description: document.querySelector('#report-description').value.trim() || null
    }), 'Rapportage indienen mislukt');
    showResult({ reportId, moderationDetailsVisibleToUser: false });
    appendLog('Private veiligheidsrapportage opgeslagen.');
  } catch (error) {
    appendLog(errorMessage(error), 'error');
  } finally {
    button.disabled = false;
  }
});

document.querySelector('#feedback-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  try {
    const match = requireMatch();
    const positive = document.querySelector('#feedback-positive').value;
    const concern = document.querySelector('#feedback-concern').value;
    const feedbackId = unwrap(await supabase.rpc('submit_interaction_feedback', {
      p_match_id: match.id,
      p_subject_user_id: otherUserId,
      p_interaction_depth: activeConversation ? 'messaged' : 'matched',
      p_positive_tags: positive ? [positive] : [],
      p_concern_tags: concern ? [concern] : [],
      p_optional_comment: document.querySelector('#feedback-comment').value.trim() || null
    }), 'Feedback opslaan mislukt');
    showResult({ feedbackId, publicRatingCreated: false });
    appendLog('Private gestructureerde feedback opgeslagen zonder publieke rating.');
  } catch (error) {
    appendLog(errorMessage(error), 'error');
  } finally {
    button.disabled = false;
  }
});

supabase.auth.onAuthStateChange(async (_event, session) => {
  if (!session?.user) {
    activeMatch = null;
    activeConversation = null;
    otherUserId = null;
    matchSummary.textContent = 'Meld je aan en laad daarna de matchstatus.';
    conversationSummary.textContent = 'Nog geen gesprek geladen.';
    portraitImage.hidden = true;
    renderMessages([]);
    await subscribeToMessages();
    return;
  }

  try {
    await loadMatch();
  } catch (error) {
    appendLog(`Interactieproof nog niet geladen: ${errorMessage(error)}`);
  }
});

window.addEventListener('pagehide', () => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel);
}, { once: true });
