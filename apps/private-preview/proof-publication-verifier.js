import { supabase } from './app.js';

const diagnosticsButton = document.querySelector('#wp057-diagnostics');
const publishButton = document.querySelector('#publish-profile');
const nextAction = document.querySelector('#wp057-next-action');

let verificationRunning = false;

function emitPublished(source) {
  globalThis.dispatchEvent(new CustomEvent('rendezvue:proof-event', {
    detail: {
      step: 'profilePublished',
      status: 'pass',
      details: {
        status: 'published',
        present: true,
        source
      }
    }
  }));
}

async function verifyPublishedSnapshot({ reportFailure = false } = {}) {
  if (verificationRunning) return;
  verificationRunning = true;
  try {
    const { data: snapshot, error } = await supabase.rpc('load_onboarding_snapshot');
    if (error) {
      if (reportFailure && nextAction) {
        nextAction.textContent = 'De Supabase-snapshot is tijdelijk niet bereikbaar. Eerder geslaagde serveracties blijven als bewijs behouden.';
      }
      return;
    }

    const profile = snapshot?.profile ?? null;
    if (profile?.publication_status === 'published' || Boolean(profile?.published_at)) {
      emitPublished('owner-snapshot-rpc');
    } else if (reportFailure && nextAction) {
      nextAction.textContent = 'De owner-snapshot meldt nog geen gepubliceerde profielstatus.';
    }
  } catch {
    if (reportFailure && nextAction) {
      nextAction.textContent = 'De Supabase-snapshot is tijdelijk niet bereikbaar. Eerder geslaagde serveracties blijven als bewijs behouden.';
    }
  } finally {
    verificationRunning = false;
  }
}

function verifyAfterCurrentAction() {
  setTimeout(() => {
    verifyPublishedSnapshot({ reportFailure: true }).catch(() => undefined);
  }, 900);
}

diagnosticsButton?.addEventListener('click', verifyAfterCurrentAction);
publishButton?.addEventListener('click', verifyAfterCurrentAction);

setTimeout(() => {
  verifyPublishedSnapshot().catch(() => undefined);
}, 1400);
