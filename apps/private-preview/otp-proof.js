import { supabase } from './app.js';

const requestForm = document.querySelector('#magic-link-form');
const otpForm = document.querySelector('#email-otp-form');
const emailInput = document.querySelector('#email');
const tokenInput = document.querySelector('#email-otp');
const status = document.querySelector('#email-otp-status');
const pendingEmailKey = 'rendezvue.private-proof.pending-email';

function setStatus(message, isError = false) {
  if (!status) return;
  status.textContent = message;
  status.className = isError ? 'hint error' : 'hint';
}

function normaliseEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

if (location.hash.includes('access_token=') || location.search.includes('code=')) {
  history.replaceState(null, '', location.pathname);
  setStatus('Een oude aanmeldlink is genegeerd. Vraag hieronder een nieuwe e-mailcode aan.', true);
}

requestForm?.addEventListener('submit', () => {
  const email = normaliseEmail(emailInput?.value);
  if (email) sessionStorage.setItem(pendingEmailKey, email);
}, { capture: true });

otpForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  if (button) button.disabled = true;

  try {
    const email = normaliseEmail(emailInput?.value || sessionStorage.getItem(pendingEmailKey));
    const token = String(tokenInput?.value ?? '').replace(/\s+/g, '');
    if (!email) throw new Error('Vul eerst het e-mailadres in waarmee de code is aangevraagd.');
    if (!/^\d{6,8}$/.test(token)) throw new Error('Vul de volledige numerieke aanmeldcode uit de nieuwste e-mail in.');

    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) throw error;
    if (!data?.session?.user) throw new Error('Supabase heeft geen actieve sessie teruggegeven.');

    sessionStorage.removeItem(pendingEmailKey);
    if (tokenInput) tokenInput.value = '';
    setStatus('Aanmelding geslaagd. De proofsessie is actief.');
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error), true);
  } finally {
    if (button) button.disabled = false;
  }
});
