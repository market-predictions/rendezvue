import { supabase } from './app.js';

const CONFIG_KEY = 'rendezvue.wp057.config.v1';
const PUBLICATION_LABEL = 'Profiel is via de server-side publicatiegate gepubliceerd';
const diagnosticsButton = document.querySelector('#wp057-diagnostics');
const publishButton = document.querySelector('#publish-profile');
const checklist = document.querySelector('#wp057-checklist');
const nextAction = document.querySelector('#wp057-next-action');

let verificationRunning = false;
let observerTimer = null;

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

function publicationChecklistItem() {
  return [...(checklist?.querySelectorAll('li') ?? [])]
    .find((item) => String(item.textContent ?? '').includes(PUBLICATION_LABEL)) ?? null;
}

async function verifyPublishedSnapshot({ reportFailure = false } = {}) {
  if (verificationRunning) return;
  const config = loadConfig();
  if (!config) return;

  verificationRunning = true;
  try {
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
    if (!profile) {
      if (reportFailure) {
        emit('profilePublished', 'blocked', {
          reason: 'De owner-snapshot bevat geen opgeslagen profiel.'
        });
      }
      return;
    }

    const expected = expectedFixture(config);
    const fixtureMatches = profile.nickname === expected.nickname
      && profile.sex === expected.sex
      && profile.city_region === expected.city
      && lifeStage?.primary_status === expected.lifeStage;

    if (!fixtureMatches) {
      emit('profileSaved', 'blocked', {
        reason: 'Opgeslagen profiel hoort niet bij de gekozen WP-057-browserrol.'
      });
    }

    const published = profile.publication_status === 'published' || Boolean(profile.published_at);
    if (published) {
      emit('profilePublished', 'pass', {
        status: 'published',
        present: true,
        source: 'owner-snapshot-rpc'
      });
      return;
    }

    if (reportFailure) {
      emit('profilePublished', 'blocked', {
        reason: 'De owner-snapshot meldt nog geen gepubliceerde profielstatus.'
      });
    }
  } finally {
    verificationRunning = false;
  }
}

function scheduleVerification({ reportFailure = false } = {}) {
  for (const delay of [250, 1400, 3200, 6200]) {
    setTimeout(() => {
      verifyPublishedSnapshot({ reportFailure: reportFailure && delay === 6200 }).catch(() => {
        if (nextAction) nextAction.textContent = 'Publicatiestatus kon niet server-authoritatief worden bevestigd.';
      });
    }, delay);
  }
}

function verifyAfterCurrentAction() {
  scheduleVerification({ reportFailure: true });
}

diagnosticsButton?.addEventListener('click', verifyAfterCurrentAction);
publishButton?.addEventListener('click', verifyAfterCurrentAction);

if (checklist) {
  new MutationObserver(() => {
    const item = publicationChecklistItem();
    if (!item || item.classList.contains('pass')) return;
    clearTimeout(observerTimer);
    observerTimer = setTimeout(() => {
      verifyPublishedSnapshot().catch(() => undefined);
    }, 150);
  }).observe(checklist, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
}

setTimeout(() => {
  scheduleVerification();
}, 500);
