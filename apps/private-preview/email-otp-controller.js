import { supabase } from './app.js';
import { createAuthSessionAdapter, normaliseAccountEmail } from './src/auth-session.js';
import { accountCopy, genericAccountRequestMessage, normaliseInterfaceLanguage } from './src/account-experience.js';

const runtime = globalThis.__RENDEZVUE_CONFIG__ ?? {};
const form = document.querySelector('#magic-link-form');
const emailInput = document.querySelector('#email');
const requestStatus = document.querySelector('#account-request-status');
const callbackStatus = document.querySelector('#auth-callback-status');
const authPanel = document.querySelector('#auth-panel');
const auth = createAuthSessionAdapter(supabase, {
  redirectTo: runtime.authRedirectUrl,
  otpLength: 6
});

let language = normaliseInterfaceLanguage(document.documentElement.lang);
let requestedEmail = '';
let requestedMode = 'existing_account';
let busy = false;

function setMessage(element, message, kind = 'info') {
  if (!element) return;
  element.textContent = message;
  element.hidden = !message;
  element.className = `account-message ${kind}`;
}

function createOtpPanel() {
  const section = document.createElement('section');
  section.id = 'email-otp-panel';
  section.className = 'email-otp-panel';
  section.hidden = true;
  section.innerHTML = `
    <div class="email-otp-heading">
      <span class="email-otp-mark" aria-hidden="true">✦</span>
      <div>
        <h3 data-otp-copy="account.otpTitle"></h3>
        <p data-otp-copy="account.otpIntro"></p>
      </div>
    </div>
    <form id="email-otp-form" class="email-otp-form" novalidate>
      <label for="email-otp-code" data-otp-copy="account.otpLabel"></label>
      <div class="email-otp-entry">
        <input id="email-otp-code" name="otp" type="text" inputmode="numeric" autocomplete="one-time-code" enterkeyhint="done" maxlength="6" minlength="6" pattern="[0-9]{6}" aria-describedby="email-otp-help" required>
        <button type="submit" data-otp-copy="account.otpVerify"></button>
      </div>
      <p id="email-otp-help" class="email-otp-help" data-otp-copy="account.otpIntro"></p>
      <button id="email-otp-resend" class="secondary email-otp-resend" type="button" data-otp-copy="account.otpResend"></button>
    </form>
    <div id="email-otp-status" class="account-message" role="status" aria-live="polite" hidden></div>`;
  requestStatus?.insertAdjacentElement('afterend', section);
  return section;
}

const otpPanel = createOtpPanel();
const otpForm = otpPanel.querySelector('#email-otp-form');
const otpInput = otpPanel.querySelector('#email-otp-code');
const otpStatus = otpPanel.querySelector('#email-otp-status');
const resendButton = otpPanel.querySelector('#email-otp-resend');

function ensureStyle() {
  if (document.querySelector('#rendezvue-email-otp-style')) return;
  const link = document.createElement('link');
  link.id = 'rendezvue-email-otp-style';
  link.rel = 'stylesheet';
  link.href = './email-otp.css';
  document.head.append(link);
}

function applyCopy() {
  language = normaliseInterfaceLanguage(document.documentElement.lang);
  for (const node of otpPanel.querySelectorAll('[data-otp-copy]')) {
    node.textContent = accountCopy(language, node.dataset.otpCopy);
  }
  otpInput.placeholder = accountCopy(language, 'account.otpPlaceholder');
}

function setBusy(next) {
  busy = Boolean(next);
  for (const button of form?.querySelectorAll('button') ?? []) button.disabled = busy;
  for (const button of otpPanel.querySelectorAll('button')) button.disabled = busy;
  otpInput.disabled = busy;
}

function revealOtpPanel() {
  otpPanel.hidden = false;
  otpInput.value = '';
  queueMicrotask(() => otpInput.focus({ preventScroll: true }));
}

async function requestCode(mode, emailValue, { resend = false } = {}) {
  const email = normaliseAccountEmail(emailValue);
  requestedEmail = email;
  requestedMode = mode === 'registration' ? 'registration' : 'existing_account';
  setBusy(true);
  try {
    if (requestedMode === 'registration') {
      await auth.requestRegistrationEmailOtp(email);
    } else {
      await auth.requestExistingAccountEmailOtp(email);
    }
  } catch {
    // Deliberately do not distinguish unknown accounts, provider rejection,
    // delivery state or rate limiting in the request response.
  } finally {
    setBusy(false);
    revealOtpPanel();
    setMessage(
      requestStatus,
      resend ? accountCopy(language, 'account.otpResent') : genericAccountRequestMessage(language, requestedMode),
      'success'
    );
    setMessage(otpStatus, '', 'info');
  }
}

// Capture before the legacy magic-link request handler. If this controller fails
// to load, the legacy handler remains available as a fail-safe fallback.
form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
  if (busy || !emailInput?.reportValidity()) return;
  const mode = event.submitter?.value === 'registration' ? 'registration' : 'existing_account';
  try {
    await requestCode(mode, emailInput.value);
  } catch {
    setMessage(requestStatus, genericAccountRequestMessage(language, mode), 'success');
  }
}, { capture: true });

otpForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (busy) return;
  if (!requestedEmail) {
    setMessage(otpStatus, accountCopy(language, 'account.otpNeedRequest'), 'warning');
    return;
  }
  if (!otpInput.reportValidity()) return;
  setBusy(true);
  try {
    await auth.verifyEmailOtp(requestedEmail, otpInput.value);
    otpInput.value = '';
    setMessage(otpStatus, accountCopy(language, 'account.otpVerified'), 'success');
    setMessage(callbackStatus, '', 'info');
  } catch {
    setMessage(otpStatus, accountCopy(language, 'account.otpInvalid'), 'warning');
    otpInput.select();
  } finally {
    setBusy(false);
  }
});

resendButton.addEventListener('click', async () => {
  if (busy) return;
  const email = requestedEmail || emailInput?.value || '';
  if (!email) {
    setMessage(otpStatus, accountCopy(language, 'account.otpNeedRequest'), 'warning');
    emailInput?.focus();
    return;
  }
  try {
    await requestCode(requestedMode, email, { resend: true });
  } catch {
    setMessage(requestStatus, accountCopy(language, 'account.otpResent'), 'success');
  }
});

// Keep paste ergonomic while preventing non-digits from reaching provider verification.
otpInput.addEventListener('input', () => {
  const digits = otpInput.value.replace(/\D+/g, '').slice(0, 6);
  if (otpInput.value !== digits) otpInput.value = digits;
});

globalThis.addEventListener('rendezvue:language-change', applyCopy);
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    requestedEmail = '';
    otpPanel.hidden = true;
  }
});

ensureStyle();
applyCopy();
if (authPanel) authPanel.dataset.passwordlessMode = 'email-otp-primary';
globalThis.__RENDEZVUE_EMAIL_OTP__ = Object.freeze({
  boundary: 'wp075-cross-browser-email-otp',
  otpLength: 6,
  sessionPropagation: false,
  passwordAuthentication: false
});
