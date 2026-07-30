import { DEMO_PROFILES } from './src/demo-data.js';

export const ALLOWED_SEXES = Object.freeze(['woman', 'man']);

export function oppositeSex(sex) {
  if (sex === 'man') return 'woman';
  if (sex === 'woman') return 'man';
  return null;
}

export function derivedSeekingForSex(sex) {
  const target = oppositeSex(sex);
  if (target === 'woman') return 'women';
  if (target === 'man') return 'men';
  return '';
}

export function candidateMatchesSexRule(viewerSex, candidateSex) {
  const target = oppositeSex(viewerSex);
  return target !== null && candidateSex === target;
}

export function normalizeIdentityProfile(profile = {}) {
  const sex = ALLOWED_SEXES.includes(profile.genderIdentity) ? profile.genderIdentity : '';
  return { ...profile, genderIdentity: sex, seeking: derivedSeekingForSex(sex) };
}

const STORAGE_KEY = 'rendezvue-pilot-v1';
const UI_COPY = {
  nl: { title: 'Wie ben je?', sex: 'Sekse' },
  en: { title: 'Who are you?', sex: 'Sex' }
};

function language() {
  return document.documentElement.lang === 'en' ? 'en' : 'nl';
}

function setLabelText(label, text) {
  const textNode = [...label.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  if (textNode) textNode.textContent = text;
  else label.prepend(document.createTextNode(text));
}

function syncDerivedSeeking() {
  const sexSelect = document.querySelector('#gender');
  const seekingSelect = document.querySelector('#seeking');
  if (!sexSelect || !seekingSelect) return;

  if (!ALLOWED_SEXES.includes(sexSelect.value)) sexSelect.value = '';
  seekingSelect.value = derivedSeekingForSex(sexSelect.value);
}

function applyIdentityPolicy() {
  const sexSelect = document.querySelector('#gender');
  const seekingSelect = document.querySelector('#seeking');
  if (!sexSelect || !seekingSelect) return;

  const copy = UI_COPY[language()];
  const card = sexSelect.closest('section.card');
  const title = card?.querySelector('h1');
  if (title) title.textContent = copy.title;

  const sexLabel = sexSelect.closest('label');
  if (sexLabel) setLabelText(sexLabel, copy.sex);

  for (const option of [...sexSelect.options]) {
    if (option.value && !ALLOWED_SEXES.includes(option.value)) option.remove();
  }

  const seekingLabel = seekingSelect.closest('label');
  if (seekingLabel) {
    seekingLabel.hidden = true;
    seekingLabel.setAttribute('aria-hidden', 'true');
  }
  seekingSelect.tabIndex = -1;

  if (!sexSelect.dataset.communityPolicyBound) {
    sexSelect.dataset.communityPolicyBound = 'true';
    sexSelect.addEventListener('change', syncDerivedSeeking);
  }
  syncDerivedSeeking();
}

function readStoredViewerSex() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return normalizeIdentityProfile(stored?.profile).genderIdentity;
  } catch {
    return '';
  }
}

function skipIncompatibleDiscoveryCard() {
  const card = document.querySelector('[data-swipe-id]');
  if (!card || card.dataset.communityPolicyChecked === 'true') return;
  card.dataset.communityPolicyChecked = 'true';

  const viewerSex = readStoredViewerSex();
  const candidate = DEMO_PROFILES.find((profile) => profile.id === card.dataset.swipeId);
  const candidateSex = candidate?.sex || candidate?.gender;
  if (!viewerSex || !candidateSex || candidateMatchesSexRule(viewerSex, candidateSex)) return;

  const passButton = document.querySelector(`[data-do="pass"][data-id="${CSS.escape(card.dataset.swipeId)}"]`);
  if (passButton) queueMicrotask(() => passButton.click());
}

function applyCommunityPolicy() {
  applyIdentityPolicy();
  skipIncompatibleDiscoveryCard();
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-do="identity-continue"]')) syncDerivedSeeking();
  }, true);

  new MutationObserver(applyCommunityPolicy).observe(document.documentElement, { childList: true, subtree: true });
  applyCommunityPolicy();
}
