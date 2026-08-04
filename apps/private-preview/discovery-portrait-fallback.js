const SEEDED_PORTRAITS = Object.freeze([
  'yasmin', 'bilal', 'amina', 'idris', 'maryam',
  'samir', 'noura', 'youssef', 'hafsa', 'omar'
]);
const SEEDED_PORTRAIT_SET = new Set(SEEDED_PORTRAITS);
const REGISTRY_KEY = '__RENDEZVUE_DISCOVERY_PORTRAIT_FALLBACK__';
const MODULE_URL = new URL(import.meta.url);
const MODULE_VERSION = MODULE_URL.searchParams.get('commit') || 'unversioned';

export function normaliseSyntheticDisplayName(displayName) {
  return String(displayName ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function seededPortraitAssetForDisplayName(displayName) {
  const tokens = normaliseSyntheticDisplayName(displayName).split(/\s+/).filter(Boolean);
  const seed = tokens.find((token) => SEEDED_PORTRAIT_SET.has(token));
  return seed ? `./assets/profiles/${seed}.webp` : null;
}

function repairCardPortrait(card) {
  const media = card.querySelector('.rv-discovery-media');
  if (!media || media.querySelector('img')) return false;

  const heading = card.querySelector('.rv-discovery-copy h3');
  const asset = seededPortraitAssetForDisplayName(heading?.textContent);
  if (!asset) return false;

  const badge = media.querySelector('.rv-discovery-badge');
  const image = document.createElement('img');
  image.src = asset;
  image.alt = '';
  image.dataset.syntheticPortraitFallback = 'seeded';
  image.addEventListener('error', () => image.remove(), { once: true });

  media.replaceChildren(image);
  if (badge) media.append(badge);
  card.dataset.syntheticPortraitResolved = 'true';
  return true;
}

function repairDiscoveryPortraits(list) {
  let repaired = 0;
  for (const card of list.querySelectorAll(':scope > .rv-discovery-card')) {
    if (repairCardPortrait(card)) repaired += 1;
  }
  return repaired;
}

function initialisePortraitFallback() {
  const list = document.querySelector('#rv-discovery-list');
  if (!list) return;

  const previous = globalThis[REGISTRY_KEY];
  if (previous?.version === MODULE_VERSION) return;
  previous?.cleanup?.();

  let scheduled = false;
  const sync = () => {
    scheduled = false;
    repairDiscoveryPortraits(list);
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    globalThis.requestAnimationFrame(sync);
  };

  const observer = new MutationObserver(schedule);
  observer.observe(list, { childList: true, subtree: true });

  const cleanup = () => {
    observer.disconnect();
    if (globalThis[REGISTRY_KEY]?.version === MODULE_VERSION) delete globalThis[REGISTRY_KEY];
  };

  globalThis[REGISTRY_KEY] = Object.freeze({ version: MODULE_VERSION, cleanup });
  globalThis.addEventListener('pagehide', cleanup, { once: true });
  schedule();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialisePortraitFallback, { once: true });
  } else {
    queueMicrotask(initialisePortraitFallback);
  }
}
