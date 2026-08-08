import { supabase } from './app.js';
import { profileMediaLabel, profileMediaTrustCopy } from './profile-media-model.js';

const BOUNDARY = 'wp076-profile-media-gallery';
const registry = new WeakMap();
let language = document.documentElement.lang === 'en' ? 'en' : 'nl';
let observer = null;
let scheduled = false;
let syncing = false;
let dialog = null;
let active = null;
let activeIndex = 0;

function copy(key) {
  const values = {
    nl: {
      view: 'Bekijk profiel', photos: 'foto’s', live: 'Live selfie', close: 'Sluiten', previous: 'Vorige foto', next: 'Volgende foto',
      trust: 'Live selfie aanwezig', noTrust: 'Geen live selfie zichtbaar', primary: 'Hoofdfoto'
    },
    en: {
      view: 'View profile', photos: 'photos', live: 'Live selfie', close: 'Close', previous: 'Previous photo', next: 'Next photo',
      trust: 'Live selfie present', noTrust: 'No live selfie visible', primary: 'Primary photo'
    }
  };
  return values[language]?.[key] ?? values.nl[key] ?? key;
}

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

async function loadProfileMedia(userId) {
  const { data: rows, error } = await supabase.rpc('get_discovery_profile_media', { p_other_user_id: userId });
  if (error || !rows?.length) return [];
  const media = [];
  for (const row of rows) {
    const { data: signed, error: signedError } = await supabase.storage.from('privacy-portraits').createSignedUrl(row.object_path, 300);
    if (!signedError && signed?.signedUrl) media.push(Object.freeze({ ...row, signedUrl: signed.signedUrl }));
  }
  return media;
}

function ensureDialog() {
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.className = 'rv-profile-media-dialog';
  dialog.dataset.wp075Boundary = BOUNDARY;
  dialog.innerHTML = `
    <div class="rv-profile-media-dialog-inner">
      <div class="rv-profile-media-dialog-head"><div><h3 data-gallery-name></h3><p data-gallery-meta></p></div><button type="button" class="secondary rv-profile-media-dialog-close" data-gallery-close aria-label="Close">×</button></div>
      <div class="rv-profile-media-viewer"><div class="rv-profile-media-viewer-frame"><img data-gallery-image alt=""><span class="rv-profile-media-viewer-label" data-gallery-label></span></div>
      <div class="rv-profile-media-viewer-nav"><button type="button" class="secondary" data-gallery-prev>←</button><button type="button" class="secondary" data-gallery-next>→</button></div><div class="rv-profile-media-thumbs" data-gallery-thumbs></div></div>
      <div class="rv-profile-media-trust" data-gallery-trust></div>
      <div data-gallery-copy></div>
    </div>`;
  document.body.append(dialog);
  dialog.querySelector('[data-gallery-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-gallery-prev]').addEventListener('click', () => move(-1));
  dialog.querySelector('[data-gallery-next]').addEventListener('click', () => move(1));
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', (event) => { if (event.key === 'ArrowLeft') move(-1); if (event.key === 'ArrowRight') move(1); });
  return dialog;
}

function renderActive() {
  if (!dialog || !active?.media?.length) return;
  activeIndex = Math.max(0, Math.min(activeIndex, active.media.length - 1));
  const item = active.media[activeIndex];
  const image = dialog.querySelector('[data-gallery-image]'); image.src = item.signedUrl;
  const label = dialog.querySelector('[data-gallery-label]');
  label.textContent = `${profileMediaLabel(language, item.profile_media_slot)}${item.is_primary ? ` · ${copy('primary')}` : ''}`;
  label.classList.toggle('live', Boolean(item.is_live_selfie));
  const thumbs = dialog.querySelector('[data-gallery-thumbs]'); thumbs.replaceChildren();
  active.media.forEach((entry, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = `rv-profile-media-thumb${index === activeIndex ? ' active' : ''}`;
    button.setAttribute('aria-label', profileMediaLabel(language, entry.profile_media_slot));
    const thumb = document.createElement('img'); thumb.alt = ''; thumb.src = entry.signedUrl; button.append(thumb);
    button.addEventListener('click', () => { activeIndex = index; renderActive(); }); thumbs.append(button);
  });
  dialog.querySelector('[data-gallery-prev]').disabled = active.media.length < 2;
  dialog.querySelector('[data-gallery-next]').disabled = active.media.length < 2;
}

function move(delta) {
  if (!active?.media?.length) return;
  activeIndex = (activeIndex + delta + active.media.length) % active.media.length;
  renderActive();
}

function openProfile(card) {
  const data = registry.get(card); if (!data?.media?.length) return;
  active = data; activeIndex = Math.max(0, data.media.findIndex((item) => item.is_primary)); if (activeIndex < 0) activeIndex = 0;
  const modal = ensureDialog();
  modal.querySelector('[data-gallery-name]').textContent = card.querySelector('.rv-discovery-copy h3')?.textContent?.trim() ?? '';
  modal.querySelector('[data-gallery-meta]').textContent = card.querySelector('.rv-discovery-meta')?.textContent?.trim() ?? '';
  const copyTarget = modal.querySelector('[data-gallery-copy]'); copyTarget.replaceChildren();
  const sourceCopy = card.querySelector('.rv-discovery-copy');
  if (sourceCopy) {
    const clone = sourceCopy.cloneNode(true); clone.querySelector('h3')?.remove(); clone.querySelector('.rv-discovery-meta')?.remove(); copyTarget.append(clone);
  }
  const hasLive = data.media.some((item) => item.is_live_selfie);
  modal.querySelector('[data-gallery-trust]').textContent = hasLive
    ? `${copy('trust')}. ${profileMediaTrustCopy(language)}`
    : copy('noTrust');
  renderActive();
  modal.showModal();
}

function decorateCard(card, media) {
  registry.set(card, Object.freeze({ media }));
  const mediaRoot = card.querySelector('.rv-discovery-media'); if (!mediaRoot) return;
  let trigger = mediaRoot.querySelector('[data-profile-media-open]');
  if (!trigger) {
    trigger = document.createElement('button'); trigger.type = 'button'; trigger.className = 'rv-discovery-media-count'; trigger.dataset.profileMediaOpen = 'true';
    trigger.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); openProfile(card); }); mediaRoot.append(trigger);
  }
  const hasLive = media.some((item) => item.is_live_selfie);
  trigger.textContent = media.length > 1 ? `${media.length} ${copy('photos')}` : hasLive ? copy('live') : copy('view');
  trigger.setAttribute('aria-label', `${copy('view')} · ${trigger.textContent}`);
}

async function sync() {
  if (syncing) return;
  const cards = [...(document.querySelectorAll('#rv-discovery-list > .rv-discovery-card') ?? [])]; if (!cards.length) return;
  syncing = true;
  try {
    const current = await supabase.auth.getUser(); const currentUserId = current.data?.user?.id; if (!currentUserId) return;
    const { data: rows, error } = await supabase.from('discovery_profiles').select('user_id,nickname,city_region,published_at').neq('user_id', currentUserId).order('published_at', { ascending: false });
    if (error) return;
    await Promise.all(cards.map(async (card) => {
      const profile = uniquelyMatchProfile(card, rows ?? []); if (!profile?.user_id) return;
      const media = await loadProfileMedia(profile.user_id); if (media.length) decorateCard(card, media);
    }));
  } finally { syncing = false; }
}

function schedule() { if (scheduled) return; scheduled = true; queueMicrotask(async () => { scheduled = false; await sync(); }); }
function mount() { const target = document.querySelector('#rendezvue-product-app') ?? document.documentElement; observer?.disconnect(); observer = new MutationObserver(schedule); observer.observe(target, { childList: true, subtree: true }); schedule(); }

globalThis.addEventListener('rendezvue:language-change', (event) => { language = event.detail?.language === 'en' ? 'en' : 'nl'; schedule(); if (dialog?.open) renderActive(); });
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
globalThis.addEventListener('pagehide', () => observer?.disconnect(), { once: true });

globalThis.__RENDEZVUE_PROFILE_MEDIA_GALLERY__ = Object.freeze({ boundary: BOUNDARY, version: 1, discoveryPrimaryImageCount: 1, horizontalDiscoverySwipeReserved: true });
