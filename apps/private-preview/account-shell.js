import { supabase } from './app.js';
import {
  accountCopy,
  classifyAuthCallback,
  genericAccountRequestMessage,
  maskAccountEmail,
  normaliseInterfaceLanguage,
  removeAuthErrorParameters
} from './src/account-experience.js';

const LANGUAGE_KEY = 'rendezvue.interface-language';
const languageButtons = [...document.querySelectorAll('[data-language]')];
const translatable = [...document.querySelectorAll('[data-i18n]')];
const placeholderTargets = [...document.querySelectorAll('[data-i18n-placeholder]')];
const form = document.querySelector('#magic-link-form');
const requestStatus = document.querySelector('#account-request-status');
const callbackStatus = document.querySelector('#auth-callback-status');
const accountEmail = document.querySelector('#account-email-summary');
const accountState = document.querySelector('#account-state-copy');
const productBackendStatus = document.querySelector('#product-backend-status');
const configStatus = document.querySelector('#config-status');

function storedLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
  }
}

let language = normaliseInterfaceLanguage(storedLanguage() || navigator.language);

function setStatus(element, message, kind = 'info') {
  if (!element) return;
  element.textContent = message;
  element.hidden = !message;
  element.className = `account-message ${kind}`;
}

function updateActionButtons() {
  const existing = form?.querySelector('button[value="existing_account"]');
  const registration = form?.querySelector('button[value="registration"]');
  if (existing) existing.textContent = accountCopy(language, 'account.existingAction');
  if (registration) registration.textContent = accountCopy(language, 'account.registrationAction');
}

function applyLanguage(nextLanguage) {
  language = normaliseInterfaceLanguage(nextLanguage);
  document.documentElement.lang = language;

  for (const element of translatable) {
    element.textContent = accountCopy(language, element.dataset.i18n);
  }
  for (const element of placeholderTargets) {
    element.placeholder = accountCopy(language, element.dataset.i18nPlaceholder);
  }
  for (const button of languageButtons) {
    const active = button.dataset.language === language;
    button.setAttribute('aria-pressed', String(active));
    button.classList.toggle('active', active);
  }

  updateActionButtons();

  if (accountState?.dataset.signedIn === 'true') {
    accountState.textContent = accountCopy(language, 'account.signedInIntro');
  }

  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Language persistence is optional. The active page still updates.
  }
}

for (const button of languageButtons) {
  button.addEventListener('click', () => applyLanguage(button.dataset.language));
}

form?.addEventListener('submit', (event) => {
  const mode = event.submitter?.value === 'registration' ? 'registration' : 'existing_account';
  setStatus(requestStatus, genericAccountRequestMessage(language, mode), 'success');
}, { capture: true });

function renderCallbackGuidance() {
  const current = new URL(globalThis.location.href);
  const state = classifyAuthCallback(current);
  if (state === 'unusable') {
    setStatus(callbackStatus, accountCopy(language, 'account.callbackUnusable'), 'warning');
    const cleaned = removeAuthErrorParameters(current);
    const next = `${cleaned.pathname}${cleaned.search}${cleaned.hash}`;
    globalThis.history.replaceState(null, '', next);
  } else if (state === 'pending') {
    setStatus(callbackStatus, accountCopy(language, 'account.callbackPending'), 'warning');
  }
}

function renderBackendState() {
  if (!productBackendStatus || !configStatus) return;
  const ready = !configStatus.classList.contains('error');
  productBackendStatus.textContent = accountCopy(
    language,
    ready ? 'account.backendReady' : 'account.backendError'
  );
  productBackendStatus.className = ready ? 'product-status ready' : 'product-status error';
}

function renderSession(user) {
  if (accountEmail) accountEmail.textContent = user?.email ? maskAccountEmail(user.email) : '—';
  if (accountState) {
    accountState.dataset.signedIn = String(Boolean(user));
    accountState.textContent = user
      ? accountCopy(language, 'account.signedInIntro')
      : accountCopy(language, 'account.intro');
  }
  if (user) setStatus(callbackStatus, '', 'info');
}

applyLanguage(language);
renderCallbackGuidance();
renderBackendState();

const initial = await supabase.auth.getUser();
renderSession(initial.data?.user ?? null);

const { data: authState } = supabase.auth.onAuthStateChange((_event, session) => {
  renderSession(session?.user ?? null);
});

window.addEventListener('pagehide', () => authState.subscription?.unsubscribe?.(), { once: true });
