import { supabase } from './app.js';

const REGISTRY_KEY = '__RENDEZVUE_SELECTED_DISCOVERY_PORTRAITS__';
let scheduled = false;
let syncing = false;
let observer = null;

function profileIdentity(card) {
  const nickname = card.querySelector('.rv-discovery-copy h3')?.textContent?.trim() ?? '';
  const meta = card.querySelector('.rv-discovery-meta')?.textContent?.trim() ?? '';
  return { nickname, meta };
}

function uniquelyMatchProfile(card, rows) {
  const identity = profileIdentity(card);
  if (!identity.nickname) return null;
  const candidates = rows.filter((row) => {
    if (String(row.nickname ?? '').trim() !== identity.nickname) return false;
    const city = String(row.city_region ?? '').trim();
    return !city || identity.meta === city || identity.meta.startsWith(`${city} ·`);
  });
  return candidates.length === 1 ? candidates[0] : null;
}

async function selectedPortraitUrl(userId) {
  const { data: objectPath, error: pathError } = await supabase.rpc('get_discovery_portrait_path', {
    p_other_user_id: userId
  });
  if (pathError || !objectPath) return null;
  const { data: signed, error: signedError } = await supabase.storage
    .from('privacy-portraits')
    .createSignedUrl(objectPath, 300);
  if (signedError) return null;
  return signed?.signedUrl ?? null;
}

async function syncSelectedDiscoveryPortraits() {
  if (syncing) return;
  const list = document.querySelector('#rv-discovery-list');
  const cards = [...(list?.querySelectorAll(':scope > .rv-discovery-card') ?? [])];
  if (!list || !cards.length) return;
  syncing = true;
  try {
    const { data: current } = await supabase.auth.getUser();
    const currentUserId = current?.user?.id;
    if (!currentUserId) return;
    const { data: rows, error } = await supabase
      .from('discovery_profiles')
      .select('user_id,nickname,city_region,published_at')
      .neq('user_id', currentUserId)
      .order('published_at', { ascending: false });
    if (error) return;

    await Promise.all(cards.map(async (card) => {
      const profile = uniquelyMatchProfile(card, rows ?? []);
      if (!profile?.user_id) return;
      const url = await selectedPortraitUrl(profile.user_id);
      if (!url) return;
      const media = card.querySelector('.rv-discovery-media');
      if (!media) return;
      let image = media.querySelector('img');
      if (!image) {
        image = document.createElement('img');
        image.alt = '';
        media.prepend(image);
      }
      image.src = url;
      image.dataset.portraitSource = 'selected-prepared-card';
      card.dataset.selectedPortraitUser = profile.user_id;
    }));
  } finally {
    syncing = false;
  }
}

function scheduleSync() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(async () => {
    scheduled = false;
    await syncSelectedDiscoveryPortraits();
  });
}

function mount() {
  const root = document.querySelector('#rendezvue-product-app') ?? document.documentElement;
  observer?.disconnect();
  observer = new MutationObserver(scheduleSync);
  observer.observe(root, { childList: true, subtree: true });
  document.querySelector('#rv-refresh-discovery')?.addEventListener('click', scheduleSync);
  scheduleSync();
}

if (globalThis[REGISTRY_KEY]?.cleanup) globalThis[REGISTRY_KEY].cleanup();
const cleanup = () => {
  observer?.disconnect();
  observer = null;
  document.querySelector('#rv-refresh-discovery')?.removeEventListener('click', scheduleSync);
};
globalThis[REGISTRY_KEY] = Object.freeze({ version: 1, cleanup, sync: scheduleSync });

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
else mount();
globalThis.addEventListener('pagehide', cleanup, { once: true });
