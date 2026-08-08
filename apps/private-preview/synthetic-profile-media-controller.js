import {
  syntheticFixturePresentationEnabled,
  syntheticProfileAssetForName,
  syntheticProfileMediaForName
} from './synthetic-profile-media.js';

const STYLE_ID = 'rendezvue-synthetic-profile-media-style';
const BOUNDARY = 'wp079-synthetic-profile-media-compatibility';
let observer = null;
let dialog = null;
let scheduled = false;
let language = document.documentElement.lang === 'en' ? 'en' : 'nl';

function copy(key) {
  const values = {
    nl: { view: 'Bekijk profiel', close: 'Sluiten', fixture: 'Synthetisch testprofiel', fixtureNote: 'Deze foto is testmedia en geeft geen live-selfie- of identiteitsbewijs.' },
    en: { view: 'View profile', close: 'Close', fixture: 'Synthetic test profile', fixtureNote: 'This photo is test media and is not live-selfie or identity evidence.' }
  };
  return values[language]?.[key] ?? values.nl[key] ?? key;
}

function ensureStyle() {
  if (document.querySelector(`#${STYLE_ID}`)) return;
  const link = document.createElement('link');
  link.id = STYLE_ID;
  link.rel = 'stylesheet';
  link.href = './synthetic-profile-media.css';
  document.head.append(link);
}

function setImage(container, name) {
  const asset = syntheticProfileAssetForName(name);
  if (!container || !asset) return false;
  let image = container.querySelector(':scope > img');
  if (!image) {
    image = document.createElement('img');
    image.alt = '';
    container.prepend(image);
  }
  const selectedPrepared = image.dataset.portraitSource === 'selected-prepared-card';
  const livePrepared = image.dataset.profileMediaSource === 'live-camera';
  if (!selectedPrepared && !livePrepared) {
    image.src = asset;
    image.dataset.syntheticProfileStandin = 'true';
    image.dataset.portraitSource = 'synthetic-fixture-standin';
  }
  return true;
}

function ensureDialog() {
  if (dialog) return dialog;
  ensureStyle();
  dialog = document.createElement('dialog');
  dialog.className = 'rv-profile-media-dialog rv-synthetic-profile-dialog';
  dialog.dataset.wp079Boundary = BOUNDARY;
  dialog.innerHTML = `
    <div class="rv-profile-media-dialog-inner">
      <div class="rv-profile-media-dialog-head"><div><h3 data-synthetic-name></h3><p data-synthetic-meta></p></div><button type="button" class="secondary rv-profile-media-dialog-close" data-synthetic-close>×</button></div>
      <div class="rv-synthetic-profile-frame"><img data-synthetic-image alt=""></div>
      <div class="rv-profile-media-trust rv-synthetic-fixture-note"><strong data-synthetic-fixture></strong><span data-synthetic-note></span></div>
      <div data-synthetic-copy></div>
    </div>`;
  dialog.querySelector('[data-synthetic-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  document.body.append(dialog);
  return dialog;
}

function openSyntheticProfile(card) {
  const name = card.querySelector('.rv-discovery-copy h3')?.textContent?.trim() ?? '';
  const fixture = syntheticProfileMediaForName(name);
  if (!fixture) return;
  const modal = ensureDialog();
  modal.querySelector('[data-synthetic-name]').textContent = name;
  modal.querySelector('[data-synthetic-meta]').textContent = card.querySelector('.rv-discovery-meta')?.textContent?.trim() ?? '';
  const image = modal.querySelector('[data-synthetic-image]');
  image.src = fixture.asset;
  image.alt = name;
  modal.querySelector('[data-synthetic-fixture]').textContent = copy('fixture');
  modal.querySelector('[data-synthetic-note]').textContent = copy('fixtureNote');
  modal.querySelector('[data-synthetic-close]').setAttribute('aria-label', copy('close'));
  const target = modal.querySelector('[data-synthetic-copy]');
  target.replaceChildren();
  const source = card.querySelector('.rv-discovery-copy');
  if (source) {
    const clone = source.cloneNode(true);
    clone.querySelector('h3')?.remove();
    clone.querySelector('.rv-discovery-meta')?.remove();
    target.append(clone);
  }
  modal.showModal();
}

function decorateDiscoveryCard(card) {
  const badge = card.querySelector('.rv-discovery-badge');
  if (!badge || !/synthetic/i.test(badge.textContent ?? '')) return;
  const name = card.querySelector('.rv-discovery-copy h3')?.textContent?.trim() ?? '';
  const media = card.querySelector('.rv-discovery-media');
  if (!setImage(media, name)) return;
  card.dataset.syntheticProfileStandin = 'true';

  const genuineMediaTrigger = media.querySelector('[data-profile-media-open]');
  let trigger = media.querySelector('[data-synthetic-profile-open]');
  if (genuineMediaTrigger) {
    trigger?.remove();
    return;
  }
  if (!trigger) {
    trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'rv-discovery-media-count rv-synthetic-profile-open';
    trigger.dataset.syntheticProfileOpen = 'true';
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openSyntheticProfile(card);
    });
    media.append(trigger);
  }
  trigger.textContent = copy('view');
  trigger.setAttribute('aria-label', `${copy('view')} · ${name}`);
}

function decorateThreadRow(row) {
  const name = row.querySelector('.rv-thread-topline strong')?.textContent?.trim() ?? '';
  if (!syntheticProfileMediaForName(name)) return;
  setImage(row.querySelector('.rv-thread-avatar'), name);
  row.dataset.syntheticProfileStandin = 'true';
}

function decorateConversationHeader(header) {
  const name = header.querySelector('.rv-conversation-identity h2')?.textContent?.trim() ?? '';
  if (!syntheticProfileMediaForName(name)) return;
  setImage(header.querySelector('.rv-conversation-avatar'), name);
  header.dataset.syntheticProfileStandin = 'true';
}

function decorate() {
  scheduled = false;
  if (!syntheticFixturePresentationEnabled()) return;
  ensureStyle();
  for (const card of document.querySelectorAll('.rv-discovery-card')) decorateDiscoveryCard(card);
  for (const row of document.querySelectorAll('.rv-thread-row')) decorateThreadRow(row);
  const header = document.querySelector('.rv-conversation-header');
  if (header) decorateConversationHeader(header);
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(decorate);
}

observer = new MutationObserver(schedule);
observer.observe(document.documentElement, { childList: true, subtree: true });
globalThis.addEventListener('rendezvue:language-change', (event) => { language = event.detail?.language === 'en' ? 'en' : 'nl'; schedule(); });
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true }); else schedule();
globalThis.addEventListener('pagehide', () => observer?.disconnect(), { once: true });

globalThis.__RENDEZVUE_SYNTHETIC_PROFILE_MEDIA__ = Object.freeze({ boundary: BOUNDARY, version: 1, fixtureOnly: true, liveSelfieEvidence: false });
