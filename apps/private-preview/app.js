import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.110.8?bundle';
import { createAuthSessionAdapter } from './src/auth-session.js';
import { backendConfigurationStatus, resolveRuntimeBackendConfig } from './src/backend-contract.js';
import { createOnboardingRepository } from './src/onboarding-repository.js';

const runtime = globalThis.__RENDEZVUE_CONFIG__ ?? {};
const backendConfig = resolveRuntimeBackendConfig(globalThis);
const configuration = backendConfigurationStatus(backendConfig);

const configStatus = document.querySelector('#config-status');
const sessionStatus = document.querySelector('#session-status');
const authPanel = document.querySelector('#auth-panel');
const authenticatedArea = document.querySelector('#authenticated-area');
const userSummary = document.querySelector('#user-summary');
const output = document.querySelector('#result-output');
const logList = document.querySelector('#proof-log');
const discoveryList = document.querySelector('#discovery-list');

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

async function currentUser(client) {
  const data = unwrap(await client.auth.getUser(), 'Gebruiker ophalen mislukt');
  if (!data?.user) throw new Error('Een actieve sessie is vereist');
  return data.user;
}

function setSession(user) {
  const signedIn = Boolean(user);
  authenticatedArea.hidden = !signedIn;
  authPanel.hidden = signedIn;
  sessionStatus.textContent = signedIn ? 'Aangemeld' : 'Niet aangemeld';
  sessionStatus.className = signedIn ? 'badge' : 'badge muted';
  userSummary.textContent = signedIn
    ? `${user.email ?? 'testaccount'} · ${user.id}`
    : '—';
}

if (!configuration.ready || backendConfig.mode !== 'supabase-proof') {
  configStatus.textContent = `Configuratiefout: ${configuration.reason}`;
  configStatus.className = 'badge error';
  appendLog(`Private backendconfiguratie is niet bruikbaar: ${configuration.reason}`, 'error');
  throw new Error(`Private backend configuration is not ready: ${configuration.reason}`);
}

if (!String(runtime.authRedirectUrl ?? '').trim()) {
  configStatus.textContent = 'Configuratiefout: redirect ontbreekt';
  configStatus.className = 'badge error';
  throw new Error('authRedirectUrl is required');
}

const supabase = createClient(backendConfig.url, backendConfig.publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});
const auth = createAuthSessionAdapter(supabase, { redirectTo: runtime.authRedirectUrl });
const onboarding = createOnboardingRepository(supabase);

configStatus.textContent = `Verbonden met ${new URL(backendConfig.url).hostname}`;
configStatus.className = 'badge';
appendLog(`Browserclient geconfigureerd voor ${new URL(backendConfig.url).hostname}.`);

const unsubscribe = auth.subscribe(async ({ event, session }) => {
  setSession(session?.user ?? null);
  appendLog(`Authstatus gewijzigd: ${event}.`);
  if (session?.user) {
    try {
      showResult(await onboarding.loadSnapshot());
    } catch (error) {
      appendLog(`Snapshot nog niet beschikbaar: ${errorMessage(error)}`);
    }
  }
});
window.addEventListener('pagehide', unsubscribe, { once: true });

try {
  const session = await auth.restoreSession();
  setSession(session?.user ?? null);
  if (session?.user) appendLog('Bestaande sessie hersteld.');
} catch (error) {
  appendLog(errorMessage(error), 'error');
}

document.querySelector('#magic-link-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  try {
    const email = document.querySelector('#email').value;
    const result = await auth.requestMagicLink(email);
    showResult({ requested: true, email: result.email, redirectTo: runtime.authRedirectUrl });
    appendLog(`Magic link aangevraagd voor ${result.email}.`);
  } catch (error) {
    appendLog(errorMessage(error), 'error');
  } finally {
    button.disabled = false;
  }
});

document.querySelector('#sign-out').addEventListener('click', async () => {
  try {
    await auth.signOut();
    setSession(null);
    showResult({ signedOut: true });
    appendLog('Lokale sessie beëindigd.');
  } catch (error) {
    appendLog(errorMessage(error), 'error');
  }
});

document.querySelector('#profile-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  try {
    const now = new Date().toISOString();
    const nickname = document.querySelector('#nickname').value.trim();
    const sex = document.querySelector('#sex').value;
    const city = document.querySelector('#city').value.trim();
    const lifeStage = document.querySelector('#life-stage').value;
    const maritalHistory = document.querySelector('#marital-history').value;
    const relationshipIntent = document.querySelector('#relationship-intent').value.trim();
    const bio = document.querySelector('#bio').value.trim();
    const interests = document.querySelector('#interests').value
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    await onboarding.saveStage('eligibility', {
      date_of_birth: '1998-01-01',
      current_relationship_state: 'single',
      adult_confirmed: true,
      serious_intent_confirmed: true,
      community_fit_confirmed: true,
      terms_version: 'synthetic-proof-2026-07',
      confirmed_at: now
    });
    await onboarding.saveStage('identity', {
      nickname,
      sex,
      city_region: city,
      language: 'nl',
      relationship_intent: relationshipIntent,
      bio
    });
    await onboarding.saveStage('life_stage', {
      primary_status: lifeStage,
      education_level: lifeStage === 'student' ? 'hbo' : null,
      study_field: lifeStage === 'student' ? 'synthetic-proof-study' : null,
      occupation_category: lifeStage === 'student' ? null : 'synthetic-proof-work',
      institution_visible: false
    });
    await onboarding.saveStage('family', {
      marital_history: maritalHistory,
      has_children: false,
      child_count_band: null,
      wants_children: 'maybe',
      accepts_partner_with_children: 'maybe',
      marital_history_visibility: 'public',
      children_visibility: 'after_match'
    });
    await onboarding.saveStage('faith', {
      faith_identity: 'synthetic Muslim-background proof profile',
      practice_description: 'synthetic descriptive value',
      compatibility_importance: 'important but discussed personally',
      lifestyle_tags: ['synthetic', 'halal-conscious'],
      practice_visibility: 'after_match',
      consent_version: 'synthetic-proof-1',
      consented_at: now
    });
    const personality = await onboarding.savePersonality([
      { prompt_key: 'ideal_day', response: document.querySelector('#prompt-one').value.trim() },
      { prompt_key: 'important_values', response: document.querySelector('#prompt-two').value.trim() }
    ], interests);
    await onboarding.saveProgress(
      'portrait',
      ['eligibility', 'account', 'identity', 'life_stage', 'family', 'faith', 'personality'],
      1
    );
    const snapshot = await onboarding.loadSnapshot();
    showResult({ personality, snapshot });
    appendLog('Synthetisch profiel en onboardingstatus opgeslagen.');
  } catch (error) {
    appendLog(errorMessage(error), 'error');
  } finally {
    button.disabled = false;
  }
});

document.querySelector('#portrait-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  let uploadedPath = null;
  try {
    const user = await currentUser(supabase);
    const file = document.querySelector('#portrait-file').files?.[0];
    if (!file) throw new Error('Selecteer een synthetisch afbeeldingsbestand');
    const allowed = new Map([
      ['image/jpeg', 'jpg'],
      ['image/png', 'png'],
      ['image/webp', 'webp']
    ]);
    const extension = allowed.get(file.type);
    if (!extension) throw new Error('Alleen JPEG, PNG en WebP zijn toegestaan');
    if (file.size > 10 * 1024 * 1024) throw new Error('Het bestand is groter dan 10 MB');

    const objectPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
    uploadedPath = objectPath;
    unwrap(await supabase.storage.from('privacy-portraits').upload(objectPath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false
    }), 'Privacyportret uploaden mislukt');

    unwrap(await supabase
      .from('privacy_portraits')
      .update({ is_public_profile_portrait: false })
      .eq('user_id', user.id)
      .eq('is_public_profile_portrait', true), 'Vorige profielportret deselecteren mislukt');

    const portrait = unwrap(await supabase
      .from('privacy_portraits')
      .insert({
        user_id: user.id,
        object_path: objectPath,
        treatment: 'browser-fuzzy-private-proof',
        status: 'pending',
        is_public_profile_portrait: true
      })
      .select('id,status,is_public_profile_portrait,treatment')
      .single(), 'Privacyportret registreren mislukt');

    await onboarding.saveProgress(
      'preview',
      ['eligibility', 'account', 'identity', 'life_stage', 'family', 'portrait', 'faith', 'personality'],
      1
    );
    showResult({ portrait, objectStoredPrivately: true });
    appendLog('Synthetisch privacyportret privé geüpload en geselecteerd.');
  } catch (error) {
    if (uploadedPath) {
      try {
        await supabase.storage.from('privacy-portraits').remove([uploadedPath]);
      } catch {
        appendLog('Rollback van het geüploade object moet handmatig worden gecontroleerd.', 'error');
      }
    }
    appendLog(errorMessage(error), 'error');
  } finally {
    button.disabled = false;
  }
});

document.querySelector('#publish-profile').addEventListener('click', async (event) => {
  event.currentTarget.disabled = true;
  try {
    const userId = await onboarding.publishProfile();
    const snapshot = await onboarding.loadSnapshot();
    showResult({ publishedUserId: userId, snapshot });
    appendLog('Profiel via de server-side publicatiegate gepubliceerd.');
  } catch (error) {
    appendLog(errorMessage(error), 'error');
  } finally {
    event.currentTarget.disabled = false;
  }
});

document.querySelector('#load-snapshot').addEventListener('click', async () => {
  try {
    showResult(await onboarding.loadSnapshot());
    appendLog('Gesanitiseerde onboardingsnapshot geladen.');
  } catch (error) {
    appendLog(errorMessage(error), 'error');
  }
});

async function loadDiscovery() {
  const rows = unwrap(await supabase
    .from('discovery_profiles')
    .select('user_id,nickname,sex,city_region,relationship_intent,bio,primary_status,published_at')
    .order('published_at', { ascending: false }), 'Discovery laden mislukt') ?? [];

  discoveryList.replaceChildren();
  if (!rows.length) {
    discoveryList.textContent = 'Geen discoverable synthetische profielen gevonden.';
    discoveryList.className = 'cards empty';
    return rows;
  }
  discoveryList.className = 'cards';
  for (const profile of rows) {
    const card = document.createElement('article');
    card.className = 'profile-card';
    const copy = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = profile.nickname || 'Synthetisch profiel';
    const meta = document.createElement('p');
    meta.textContent = `${profile.city_region ?? 'regio privé'} · ${profile.primary_status ?? 'levensfase privé'}`;
    const intent = document.createElement('p');
    intent.textContent = profile.relationship_intent ?? '';
    copy.append(title, meta, intent);

    const like = document.createElement('button');
    like.type = 'button';
    like.textContent = 'Like';
    like.addEventListener('click', async () => {
      like.disabled = true;
      try {
        const result = unwrap(await supabase.rpc('record_attraction_signal', {
          p_target_user_id: profile.user_id,
          p_signal_type: 'like',
          p_profile_component: 'private-proof-card',
          p_opening_message: null
        }), 'Like opslaan mislukt');
        showResult({ target: profile.user_id, result });
        appendLog(`Like server-side opgeslagen voor ${profile.nickname}.`);
      } catch (error) {
        appendLog(errorMessage(error), 'error');
      } finally {
        like.disabled = false;
      }
    });
    card.append(copy, like);
    discoveryList.append(card);
  }
  return rows;
}

document.querySelector('#load-discovery').addEventListener('click', async () => {
  try {
    const rows = await loadDiscovery();
    showResult({ discoveryCount: rows.length, profiles: rows });
    appendLog(`${rows.length} discoveryprofiel(en) geladen.`);
  } catch (error) {
    appendLog(errorMessage(error), 'error');
  }
});

document.querySelector('#load-matches').addEventListener('click', async () => {
  try {
    const matches = unwrap(await supabase
      .from('matches')
      .select('id,user_a_id,user_b_id,status,matched_at')
      .order('matched_at', { ascending: false }), 'Matches laden mislukt') ?? [];
    showResult({ matchCount: matches.length, matches });
    appendLog(`${matches.length} match(es) zichtbaar voor dit account.`);
  } catch (error) {
    appendLog(errorMessage(error), 'error');
  }
});
