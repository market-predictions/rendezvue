import { supabase } from './app.js';

const STORAGE_CONFIG = 'rendezvue.wp057.config.v1';
const STORAGE_PREFIX = 'rendezvue.wp057.evidence.v1.';
const REFRESH_MARKER = 'rendezvue.wp057.refresh-pending.v1';
const runtime = globalThis.__RENDEZVUE_CONFIG__ ?? {};

const steps = [
  ['runtime', 'Cloudflare runtime is echt, commit-gemarkeerd en niet-placeholder'],
  ['callbackSafety', 'Geen access- of refresh-tokenfragment en verbruikte PKCE-code verwijderd'],
  ['authenticated', 'Gecontroleerd synthetisch account is aangemeld'],
  ['sessionRestored', 'Sessie herstelt na een bewuste paginaverversing'],
  ['globalSignOut', 'Globale afmelding is uitgevoerd'],
  ['profileSaved', 'Profiel, eligibility, levensfase, familie, faith, prompts en interesses zijn opgeslagen'],
  ['portraitSelected', 'Eén privéportret is geselecteerd'],
  ['profilePublished', 'Profiel is via de server-side publicatiegate gepubliceerd'],
  ['peerDiscovered', 'Het gekoppelde proofprofiel is zichtbaar via opposite-sex discovery'],
  ['likeSent', 'Dit account heeft het gekoppelde proofprofiel geliket'],
  ['singleMatch', 'Precies één match met het gekoppelde proofprofiel is zichtbaar'],
  ['entitlement', 'Het eenmalige proof-contactrecht is aanwezig'],
  ['conversation', 'Precies één gesprek is geopend of idempotent hergebruikt'],
  ['realtime', 'Realtime-subscriptie of realtime ontvangst is bevestigd'],
  ['messages', 'Synthetische berichten van beide deelnemers zijn zichtbaar'],
  ['portraitAccess', 'Matched portret is via een tijdelijke signed URL toegankelijk'],
  ['report', 'Private veiligheidsrapportage is opgeslagen zonder moderatiedetails'],
  ['feedback', 'Private feedback is opgeslagen zonder publieke rating'],
  ['contactRevoked', 'Contacteinde of blokkade trekt gesprek- en portrettoegang in'],
  ['cleanup', 'Auth-account, relationele data en privéobjecten zijn verwijderd']
];

const runInput = document.querySelector('#wp057-run-id');
const roleInput = document.querySelector('#wp057-role');
const nextAction = document.querySelector('#wp057-next-action');
const checklist = document.querySelector('#wp057-checklist');
const preview = document.querySelector('#wp057-evidence-preview');
const statusBadge = document.querySelector('#wp057-status');

let config = loadConfig();
let evidence = loadEvidence(config);

function nowIso() {
  return new Date().toISOString();
}

function createRunId() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 12).toLowerCase();
  const random = crypto.randomUUID().slice(0, 6).toLowerCase();
  return `wp57-${stamp}-${random}`;
}

function validRunId(value) {
  return /^[a-z0-9][a-z0-9-]{7,47}$/.test(value);
}

function loadConfig() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_CONFIG) ?? 'null');
    if (parsed && validRunId(parsed.runId) && ['a', 'b'].includes(parsed.role)) return parsed;
  } catch {
    // Invalid local proof metadata is deliberately ignored.
  }
  return { runId: '', role: '' };
}

function storageKey(value = config) {
  return value.runId && value.role ? `${STORAGE_PREFIX}${value.runId}.${value.role}` : null;
}

function emptyEvidence(value = config) {
  return {
    schemaVersion: 1,
    workPackage: 'WP-057',
    runId: value.runId,
    role: value.role,
    buildCommit: String(runtime.buildCommit ?? 'unknown'),
    hostingPlatform: String(runtime.hostingPlatform ?? 'unknown'),
    configurationMode: String(runtime.configurationMode ?? 'unknown'),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    checks: {}
  };
}

function loadEvidence(value) {
  const key = storageKey(value);
  if (!key) return emptyEvidence(value);
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (parsed?.workPackage === 'WP-057' && parsed.runId === value.runId && parsed.role === value.role) {
      return parsed;
    }
  } catch {
    // Invalid local proof evidence is deliberately ignored.
  }
  return emptyEvidence(value);
}

function saveEvidence() {
  evidence.updatedAt = nowIso();
  const key = storageKey();
  if (key) localStorage.setItem(key, JSON.stringify(evidence));
  render();
}

function sanitizeDetails(details = {}) {
  const allowed = {};
  for (const [key, value] of Object.entries(details)) {
    if (!['count', 'status', 'present', 'revoked', 'bothParticipants', 'source', 'reason'].includes(key)) continue;
    if (typeof value === 'string') allowed[key] = value.slice(0, 120);
    else if (typeof value === 'number' || typeof value === 'boolean' || value === null) allowed[key] = value;
  }
  return allowed;
}

function mark(step, status, details = {}) {
  if (!steps.some(([key]) => key === step)) return;
  evidence.checks[step] = {
    status,
    at: nowIso(),
    ...sanitizeDetails(details)
  };
  saveEvidence();
}

function unwrap(result, operation) {
  if (result?.error) throw new Error(`${operation}: ${result.error.message ?? 'onbekende fout'}`);
  return result?.data ?? null;
}

async function safeCheck(step, operation) {
  try {
    const result = await operation();
    if (result?.pass) mark(step, 'pass', result.details ?? {});
    else if (result?.blocked) mark(step, 'blocked', { reason: result.reason ?? 'voorwaarde ontbreekt' });
    else mark(step, 'pending', result?.details ?? {});
    return result;
  } catch (error) {
    mark(step, 'blocked', { reason: error instanceof Error ? error.message : String(error) });
    return { blocked: true };
  }
}

function rolePreset() {
  if (!config.runId || !config.role) return null;
  const suffix = config.runId.slice(-6).toUpperCase();
  if (config.role === 'a') {
    return {
      nickname: `WP57-${suffix}-Amina`,
      peerNickname: `WP57-${suffix}-Bilal`,
      sex: 'woman',
      city: 'Utrecht',
      lifeStage: 'student',
      maritalHistory: 'never_married',
      promptOne: 'Een rustige wandeling, koffie en een eerlijk gesprek.',
      promptTwo: 'Respect, betrouwbaarheid en duidelijke bedoelingen.',
      interests: 'boeken,wandelen,koken,technologie'
    };
  }
  return {
    nickname: `WP57-${suffix}-Bilal`,
    peerNickname: `WP57-${suffix}-Amina`,
    sex: 'man',
    city: 'Rotterdam',
    lifeStage: 'employed',
    maritalHistory: 'never_married',
    promptOne: 'Samen koken, sporten en een goed gesprek.',
    promptTwo: 'Humor, verantwoordelijkheid en serieuze intenties.',
    interests: 'sport,koken,reizen,technologie'
  };
}

function applyFixture() {
  const preset = rolePreset();
  if (!preset) throw new Error('Stel eerst een geldige run-ID en rol in');
  document.querySelector('#nickname').value = preset.nickname;
  document.querySelector('#sex').value = preset.sex;
  document.querySelector('#city').value = preset.city;
  document.querySelector('#life-stage').value = preset.lifeStage;
  document.querySelector('#marital-history').value = preset.maritalHistory;
  document.querySelector('#relationship-intent').value = 'Serieuze synthetische kennismaking met huwelijk als doel';
  document.querySelector('#bio').value = `Gecontroleerd synthetisch WP-057 proofprofiel ${config.role.toUpperCase()} voor run ${config.runId}.`;
  document.querySelector('#prompt-one').value = preset.promptOne;
  document.querySelector('#prompt-two').value = preset.promptTwo;
  document.querySelector('#interests').value = preset.interests;
  nextAction.textContent = `Fixture ingevuld. Gebruik voor de andere browserrol de gekoppelde naam ${preset.peerNickname}.`;
}

function configureProof() {
  const runId = runInput.value.trim().toLowerCase();
  const role = roleInput.value;
  if (!validRunId(runId)) throw new Error('Run-ID moet 8–48 kleine letters, cijfers of koppeltekens bevatten');
  if (!['a', 'b'].includes(role)) throw new Error('Kies proofrol A of B');
  config = { runId, role };
  localStorage.setItem(STORAGE_CONFIG, JSON.stringify(config));
  evidence = loadEvidence(config);
  applyFixture();
  render();
}

function proofSummary() {
  const checks = {};
  for (const [key] of steps) {
    const item = evidence.checks[key];
    checks[key] = item ? {
      status: item.status,
      at: item.at,
      ...sanitizeDetails(item)
    } : { status: 'pending' };
  }
  const completed = Object.values(checks).filter((item) => item.status === 'pass').length;
  const blocked = Object.values(checks).filter((item) => item.status === 'blocked').length;
  return {
    schemaVersion: 1,
    workPackage: 'WP-057',
    runId: evidence.runId,
    role: evidence.role,
    buildCommit: evidence.buildCommit,
    hostingPlatform: evidence.hostingPlatform,
    configurationMode: evidence.configurationMode,
    generatedAt: nowIso(),
    completed,
    total: steps.length,
    blocked,
    checks
  };
}

function render() {
  runInput.value = config.runId;
  roleInput.value = config.role;
  checklist.replaceChildren();
  for (const [key, label] of steps) {
    const item = evidence.checks[key] ?? { status: 'pending' };
    const li = document.createElement('li');
    li.className = `proof-step ${item.status}`;
    const marker = document.createElement('span');
    marker.className = 'proof-step-marker';
    marker.textContent = item.status === 'pass' ? '✓' : item.status === 'blocked' ? '!' : '·';
    const copy = document.createElement('span');
    copy.textContent = label;
    li.append(marker, copy);
    checklist.append(li);
  }
  const summary = proofSummary();
  preview.textContent = JSON.stringify(summary, null, 2);
  statusBadge.textContent = `${summary.completed}/${summary.total} geslaagd${summary.blocked ? ` · ${summary.blocked} geblokkeerd` : ''}`;
  statusBadge.className = summary.blocked ? 'badge error' : summary.completed === summary.total ? 'badge' : 'badge muted';

  const next = steps.find(([key]) => summary.checks[key].status !== 'pass');
  if (!config.runId || !config.role) nextAction.textContent = 'Maak één run-ID en gebruik exact dezelfde run-ID in beide geïsoleerde browserprofielen.';
  else if (next) nextAction.textContent = `Volgende bewijsstap: ${next[1]}`;
  else nextAction.textContent = 'Alle lokale bewijsstappen voor deze browserrol zijn geslaagd.';
}

async function runDiagnostics() {
  const preset = rolePreset();
  await safeCheck('runtime', async () => ({
    pass: runtime.hostingPlatform === 'cloudflare-pages'
      && runtime.configurationMode === 'remote-supabase'
      && /^[a-f0-9]{40}$/.test(String(runtime.buildCommit ?? '')),
    details: { source: String(runtime.configurationSource ?? 'unknown') }
  }));

  const url = new URL(globalThis.location.href);
  const unsafeFragment = /(?:^|[&#])(access_token|refresh_token)=/i.test(url.hash);
  await safeCheck('callbackSafety', async () => ({
    pass: !unsafeFragment && !url.searchParams.has('code'),
    details: { present: !unsafeFragment && !url.searchParams.has('code') }
  }));

  const authData = unwrap(await supabase.auth.getUser(), 'Actieve gebruiker controleren mislukt');
  const user = authData?.user ?? null;
  await safeCheck('authenticated', async () => ({ pass: Boolean(user) }));
  if (!user) return;

  if (sessionStorage.getItem(REFRESH_MARKER) === `${config.runId}.${config.role}`) {
    sessionStorage.removeItem(REFRESH_MARKER);
    mark('sessionRestored', 'pass', { present: true });
  }

  const profile = unwrap(await supabase
    .from('profiles')
    .select('nickname,sex,publication_status')
    .eq('user_id', user.id)
    .maybeSingle(), 'Profielstatus laden mislukt');

  const [eligibility, lifeStage, family, faith, portraits, promptCount, interestCount] = await Promise.all([
    supabase.from('eligibility').select('adult_confirmed,current_relationship_state,terms_version').eq('user_id', user.id).maybeSingle(),
    supabase.from('life_stages').select('primary_status').eq('user_id', user.id).maybeSingle(),
    supabase.from('family_contexts').select('marital_history').eq('user_id', user.id).maybeSingle(),
    supabase.from('faith_profiles').select('consent_version').eq('user_id', user.id).maybeSingle(),
    supabase.from('privacy_portraits').select('status,is_public_profile_portrait').eq('user_id', user.id),
    supabase.from('profile_prompts').select('id', { head: true, count: 'exact' }).eq('user_id', user.id),
    supabase.from('profile_interests').select('interest_key', { head: true, count: 'exact' }).eq('user_id', user.id)
  ]);

  for (const result of [eligibility, lifeStage, family, faith, portraits, promptCount, interestCount]) {
    if (result.error) throw new Error(result.error.message);
  }

  const profileComplete = Boolean(profile)
    && Boolean(eligibility.data?.adult_confirmed)
    && eligibility.data?.current_relationship_state === 'single'
    && eligibility.data?.terms_version === 'synthetic-proof-2026-07'
    && Boolean(lifeStage.data)
    && Boolean(family.data)
    && Boolean(faith.data)
    && Number(promptCount.count ?? 0) >= 2
    && Number(interestCount.count ?? 0) >= 3;
  mark('profileSaved', profileComplete ? 'pass' : 'pending', {
    count: Number(promptCount.count ?? 0) + Number(interestCount.count ?? 0)
  });

  const selectedPortraits = (portraits.data ?? []).filter((row) => row.is_public_profile_portrait);
  mark('portraitSelected', selectedPortraits.length === 1 ? 'pass' : 'pending', { count: selectedPortraits.length });
  mark('profilePublished', profile?.publication_status === 'published' ? 'pass' : 'pending', {
    status: profile?.publication_status ?? 'missing'
  });

  if (preset) {
    const peerRows = unwrap(await supabase
      .from('discovery_profiles')
      .select('nickname')
      .eq('nickname', preset.peerNickname), 'Gekoppeld discoveryprofiel laden mislukt') ?? [];
    mark('peerDiscovered', peerRows.length === 1 ? 'pass' : 'pending', { count: peerRows.length });
  }

  const matches = unwrap(await supabase
    .from('matches')
    .select('id,user_a_id,user_b_id,status,matched_at')
    .order('matched_at', { ascending: false }), 'Matches diagnosticeren mislukt') ?? [];
  const relevantMatches = matches.filter((row) => row.status === 'active' || row.status === 'ended' || row.status === 'blocked');
  const activeMatch = relevantMatches.find((row) => row.status === 'active') ?? null;
  mark('singleMatch', relevantMatches.length === 1 ? 'pass' : 'pending', { count: relevantMatches.length });

  const entitlements = unwrap(await supabase
    .from('contact_entitlements')
    .select('status,source_type')
    .eq('source_type', 'pilot'), 'Contactrecht diagnosticeren mislukt') ?? [];
  mark('entitlement', entitlements.length === 1 ? 'pass' : 'pending', { count: entitlements.length });

  const matchForConversation = activeMatch ?? relevantMatches[0] ?? null;
  let conversation = null;
  if (matchForConversation) {
    conversation = unwrap(await supabase
      .from('conversations')
      .select('id,status')
      .eq('match_id', matchForConversation.id)
      .maybeSingle(), 'Gesprek diagnosticeren mislukt');
  }
  mark('conversation', conversation ? 'pass' : 'pending', { count: conversation ? 1 : 0, status: conversation?.status ?? 'missing' });

  if (conversation) {
    const messages = unwrap(await supabase
      .from('messages')
      .select('sender_user_id')
      .eq('conversation_id', conversation.id), 'Berichten diagnosticeren mislukt') ?? [];
    const senders = new Set(messages.map((row) => row.sender_user_id));
    mark('messages', messages.length >= 2 && senders.size >= 2 ? 'pass' : 'pending', {
      count: messages.length,
      bothParticipants: senders.size >= 2
    });
  }

  if (activeMatch) {
    const otherUserId = activeMatch.user_a_id === user.id ? activeMatch.user_b_id : activeMatch.user_a_id;
    const objectPath = unwrap(await supabase.rpc('get_matched_portrait_path', {
      p_other_user_id: otherUserId
    }), 'Matched portrettoegang diagnosticeren mislukt');
    if (objectPath) {
      const signed = unwrap(await supabase.storage.from('privacy-portraits').createSignedUrl(objectPath, 30), 'Signed portret diagnosticeren mislukt');
      mark('portraitAccess', signed?.signedUrl ? 'pass' : 'pending', { present: Boolean(signed?.signedUrl) });
    }
  } else if (matchForConversation && ['ended', 'blocked'].includes(matchForConversation.status)) {
    const otherUserId = matchForConversation.user_a_id === user.id ? matchForConversation.user_b_id : matchForConversation.user_a_id;
    const revokedPath = unwrap(await supabase.rpc('get_matched_portrait_path', {
      p_other_user_id: otherUserId
    }), 'Ingetrokken portrettoegang diagnosticeren mislukt');
    mark('contactRevoked', revokedPath === null && conversation?.status !== 'open' ? 'pass' : 'pending', {
      revoked: revokedPath === null,
      status: matchForConversation.status
    });
  }
}

async function likePeer() {
  const preset = rolePreset();
  if (!preset) throw new Error('Stel eerst de run-ID en rol in');
  const rows = unwrap(await supabase
    .from('discovery_profiles')
    .select('user_id,nickname')
    .eq('nickname', preset.peerNickname), 'Gekoppeld proofprofiel zoeken mislukt') ?? [];
  if (rows.length !== 1) throw new Error(`Verwacht precies één discoveryprofiel ${preset.peerNickname}, gevonden: ${rows.length}`);
  const result = unwrap(await supabase.rpc('record_attraction_signal', {
    p_target_user_id: rows[0].user_id,
    p_signal_type: 'like',
    p_profile_component: 'wp057-guided-proof',
    p_opening_message: null
  }), 'Gekoppeld proofprofiel liken mislukt');
  mark('likeSent', 'pass', { present: true });
  nextAction.textContent = result ? 'Reciproke like gedetecteerd; voer diagnostiek uit om de match te bewijzen.' : 'Like opgeslagen. Laat nu de andere browserrol hetzelfde doen.';
}

function recordExternalEvent(detail) {
  const step = String(detail?.step ?? '');
  const status = detail?.status === 'blocked' ? 'blocked' : 'pass';
  mark(step, status, detail?.details ?? {});
}

globalThis.addEventListener('rendezvue:proof-event', (event) => recordExternalEvent(event.detail));

document.querySelector('#wp057-new-run').addEventListener('click', () => {
  runInput.value = createRunId();
  roleInput.value = roleInput.value || 'a';
  nextAction.textContent = 'Kopieer deze run-ID naar het tweede geïsoleerde browserprofiel en kies daar de andere rol.';
});

document.querySelector('#wp057-configure').addEventListener('click', () => {
  try {
    configureProof();
  } catch (error) {
    nextAction.textContent = error instanceof Error ? error.message : String(error);
  }
});

document.querySelector('#wp057-refresh-session').addEventListener('click', async () => {
  try {
    if (!config.runId || !config.role) throw new Error('Configureer eerst run-ID en rol');
    const data = unwrap(await supabase.auth.getUser(), 'Sessie controleren mislukt');
    if (!data?.user) throw new Error('Meld eerst het synthetische proofaccount aan');
    sessionStorage.setItem(REFRESH_MARKER, `${config.runId}.${config.role}`);
    globalThis.location.reload();
  } catch (error) {
    nextAction.textContent = error instanceof Error ? error.message : String(error);
  }
});

document.querySelector('#wp057-like-peer').addEventListener('click', async (event) => {
  event.currentTarget.disabled = true;
  try {
    await likePeer();
  } catch (error) {
    nextAction.textContent = error instanceof Error ? error.message : String(error);
  } finally {
    event.currentTarget.disabled = false;
  }
});

document.querySelector('#wp057-diagnostics').addEventListener('click', async (event) => {
  event.currentTarget.disabled = true;
  try {
    await runDiagnostics();
  } catch (error) {
    nextAction.textContent = error instanceof Error ? error.message : String(error);
  } finally {
    event.currentTarget.disabled = false;
  }
});

document.querySelector('#wp057-copy-evidence').addEventListener('click', async () => {
  const text = JSON.stringify(proofSummary(), null, 2);
  await navigator.clipboard.writeText(text);
  nextAction.textContent = 'Alleen gesanitiseerd WP-057-bewijs is naar het klembord gekopieerd.';
});

document.querySelector('#wp057-reset').addEventListener('click', () => {
  const key = storageKey();
  if (key) localStorage.removeItem(key);
  evidence = emptyEvidence(config);
  saveEvidence();
  nextAction.textContent = 'Lokale bewijsstatus voor deze run en rol is gereset.';
});

supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) mark('authenticated', 'pass', { status: event });
  if (event === 'SIGNED_OUT') mark('globalSignOut', 'pass', { status: event });
});

render();
runDiagnostics().catch(() => undefined);
