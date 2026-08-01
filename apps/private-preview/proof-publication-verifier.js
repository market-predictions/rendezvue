import { supabase } from './app.js';

const CONFIG_KEY = 'rendezvue.wp057.config.v1';
const diagnosticsButton = document.querySelector('#wp057-diagnostics');
const publishButton = document.querySelector('#publish-profile');
const nextAction = document.querySelector('#wp057-next-action');

function loadConfig() {
  try {
    const value = JSON.parse(localStorage.getItem(CONFIG_KEY) ?? 'null');
    if (value?.runId && ['a', 'b'].includes(value.role)) return value;
  } catch {
    // Invalid local proof metadata is handled by the main orchestrator.
  }
  return null;
}

function expectedFixture(config) {
  const suffix = String(config.runId).slice(-6).toUpperCase();
  return config.role === 'a'
    ? { nickname: `WP57-${suffix}-Amina`, sex: 'woman', city: 'Utrecht', lifeStage: 'student' }
    : { nickname: `WP57-${suffix}-Bilal`, sex: 'man', city: 'Rotterdam', lifeStage: 'employed' };
}

function emit(step, status, details = {}) {
  globalThis.dispatchEvent(new CustomEvent('rendezvue:proof-event', {
    detail: { step, status, details }
  }));
}

async function verifyPublishedSnapshot({ reportFailure = false } = {}) {
  const config = loadConfig();
  if (!config) return;

  const { data: snapshot, error } = await supabase.rpc('load_onboarding_snapshot');
  if (error) {
    if (reportFailure) {
      emit('profilePublished', 'blocked', {
        reason: 'Server-authoritatieve publicatiestatus kon niet worden geladen.'
      });
    }
    return;
  }

  const profile = snapshot?.profile ?? null;
  const lifeStage = snapshot?.life_stage ?? null;
  if (!profile) return;

  const expected = expectedFixture(config);
  const fixtureMatches = profile.nickname === expected.nickname
    && profile.sex === expected.sex
    && profile.city_region === expected.city
    && lifeStage?.primary_status === expected.lifeStage;

  if (!fixtureMatches) {
    emit('profileSaved', 'blocked', {
      reason: 'Opgeslagen profiel hoort niet bij de gekozen WP-057-browserrol.'
    });
    emit('profilePublished', 'blocked', {
      reason: 'Publicatiebewijs geweigerd wegens afwijkende rolfixture.'
    });
    return;
  }

  const published = profile.publication_status === 'published' || Boolean(profile.published_at);
  if (published) {
    emit('profilePublished', 'pass', {
      status: 'published',
      present: true,
      source: 'owner-snapshot-rpc'
    });
  }
}

function verifyAfterCurrentAction() {
  setTimeout(() => {
    verifyPublishedSnapshot({ reportFailure: true }).catch(() => {
      if (nextAction) nextAction.textContent = 'Publicatiestatus kon niet server-authoritatief worden bevestigd.';
    });
  }, 900);
}

diagnosticsButton?.addEventListener('click', verifyAfterCurrentAction);
publishButton?.addEventListener('click', verifyAfterCurrentAction);

setTimeout(() => {
  verifyPublishedSnapshot().catch(() => undefined);
}, 500);
