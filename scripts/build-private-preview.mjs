import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const source = resolve(root, 'apps/private-preview');
const target = resolve(root, 'dist-private-preview');

function requireEnvironment(name) {
  const value = String(process.env[name] ?? '').trim();
  if (!value) throw new Error(`${name} is required for the private preview build`);
  return value;
}

function validateSupabaseUrl(value) {
  const url = new URL(value);
  const local = ['localhost', '127.0.0.1'].includes(url.hostname);
  if (!local && url.protocol !== 'https:') {
    throw new Error('SUPABASE_URL must use HTTPS outside local development');
  }
  if (!local && !url.hostname.endsWith('.supabase.co')) {
    throw new Error('SUPABASE_URL must point to an approved Supabase project');
  }
  return url.toString().replace(/\/$/, '');
}

function validatePublishableKey(value) {
  if (value.startsWith('sb_secret_')) {
    throw new Error('A Supabase secret key may never be embedded in a browser artifact');
  }
  if (!value.startsWith('sb_publishable_')) {
    throw new Error('SUPABASE_PUBLISHABLE_KEY must use the sb_publishable_ key format');
  }
  if (/\s/.test(value) || value.length < 30) {
    throw new Error('SUPABASE_PUBLISHABLE_KEY is malformed');
  }
  return value;
}

function validateRedirectUrl(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('RENDEZVUE_AUTH_REDIRECT_URL must be an HTTP(S) URL');
  }
  return url.toString();
}

async function assembleSharedBrowserClient() {
  const [appSource, interactionSource, indexSource] = await Promise.all([
    readFile(resolve(target, 'app.js'), 'utf8'),
    readFile(resolve(target, 'interaction-proof.js'), 'utf8'),
    readFile(resolve(target, 'index.html'), 'utf8')
  ]);

  const clientDeclaration = 'const supabase = createClient(';
  if (!appSource.includes(clientDeclaration)) {
    throw new Error('Private preview app client declaration was not found');
  }
  if (!appSource.includes('detectSessionInUrl: true')) {
    throw new Error('Private preview source callback-detection marker was not found');
  }

  // The hosted private Space is protected by Hugging Face before application
  // JavaScript can run. Email callbacks therefore cannot reliably load the
  // app and must not carry Supabase sessions in the URL. The generated proof
  // uses an in-app email OTP form and explicitly ignores URL callbacks.
  const sharedAppSource = appSource
    .replace(clientDeclaration, 'export const supabase = createClient(')
    .replace('detectSessionInUrl: true', 'detectSessionInUrl: false')
    .replace("Magic link aangevraagd voor ${result.email}.", "E-mailcode aangevraagd voor ${result.email}.")
    .replace("showResult({ requested: true, email: result.email, redirectTo: runtime.authRedirectUrl });", "showResult({ requested: true, email: result.email, delivery: 'email-otp' });");

  if (!sharedAppSource.includes('detectSessionInUrl: false')) {
    throw new Error('Hosted private preview URL callback detection was not disabled');
  }

  const interactionBodyStart = interactionSource.indexOf('const output = document.querySelector');
  if (interactionBodyStart < 0) {
    throw new Error('Private interaction proof body marker was not found');
  }

  const sharedInteractionSource = [
    "import { supabase } from './app.js';",
    '',
    interactionSource.slice(interactionBodyStart)
  ].join('\n');

  const otpForm = [
    '      <form id="email-otp-form" class="stack separated-form">',
    '        <label>',
    '          Aanmeldcode uit de nieuwste e-mail',
    '          <input id="email-otp" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,8}" required placeholder="123456">',
    '        </label>',
    '        <button type="submit">Code controleren en aanmelden</button>',
    '        <p id="email-otp-status" class="hint" aria-live="polite">Vraag eerst een code aan en vul die in ditzelfde geopende tabblad in.</p>',
    '      </form>'
  ].join('\n');

  let generatedIndex = indexSource
    .replace('<h2>Aanmelden met magic link</h2>', '<h2>Aanmelden met e-mailcode</h2>')
    .replace('Magic link aanvragen', 'E-mailcode aanvragen')
    .replace(
      '      <p class="hint">De redirect-URL moet exact in Supabase Auth → URL Configuration zijn toegestaan.</p>',
      `${otpForm}\n      <p class="hint">Klik niet op oude aanmeldlinks. De private Hugging Face-app blijft open terwijl je de code uit de e-mail overneemt.</p>`
    );

  const otpScript = '  <script type="module" src="./otp-proof.js"></script>\n';
  if (!generatedIndex.includes('otp-proof.js')) {
    generatedIndex = generatedIndex.replace(
      '  <script type="module" src="./interaction-proof.js"></script>\n',
      `  <script type="module" src="./interaction-proof.js"></script>\n${otpScript}`
    );
  }

  const cleanupScript = '  <script type="module" src="./account-cleanup.js"></script>\n';
  if (!generatedIndex.includes('account-cleanup.js')) {
    generatedIndex = generatedIndex.replace('</body>', `${cleanupScript}</body>`);
  }

  if (!generatedIndex.includes('email-otp-form') || !generatedIndex.includes('otp-proof.js')) {
    throw new Error('Private preview email OTP interface was not assembled');
  }

  await Promise.all([
    writeFile(resolve(target, 'app.js'), sharedAppSource, 'utf8'),
    writeFile(resolve(target, 'interaction-proof.js'), sharedInteractionSource, 'utf8'),
    writeFile(resolve(target, 'index.html'), generatedIndex, 'utf8')
  ]);
}

const supabaseUrl = validateSupabaseUrl(requireEnvironment('SUPABASE_URL'));
const publishableKey = validatePublishableKey(requireEnvironment('SUPABASE_PUBLISHABLE_KEY'));
const authRedirectUrl = validateRedirectUrl(requireEnvironment('RENDEZVUE_AUTH_REDIRECT_URL'));
const buildCommit = String(process.env.GITHUB_SHA ?? 'local').slice(0, 40);

await readFile(resolve(source, 'index.html'), 'utf8');
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });
await mkdir(resolve(target, 'src'), { recursive: true });

for (const file of ['auth-session.js', 'backend-contract.js', 'onboarding-repository.js']) {
  await cp(resolve(root, 'apps/web/src', file), resolve(target, 'src', file));
}

await assembleSharedBrowserClient();

const runtimeConfig = {
  backendMode: 'supabase-proof',
  supabaseUrl,
  supabasePublishableKey: publishableKey,
  authRedirectUrl,
  buildCommit
};

await writeFile(
  resolve(target, 'runtime-config.js'),
  `window.__RENDEZVUE_CONFIG__ = Object.freeze(${JSON.stringify(runtimeConfig, null, 2)});\n`,
  'utf8'
);

await writeFile(
  resolve(target, 'deployment.json'),
  `${JSON.stringify({
    app: 'rendezvue-private-preview',
    audience: 'controlled-synthetic-adult-proof-accounts',
    backendMode: 'supabase-proof',
    publicPilotChanged: false,
    containsServerSecrets: false,
    sharedBrowserAuthClient: true,
    authFlow: 'email-otp-private-space',
    providerAccountCleanup: true,
    authRedirectUrl,
    buildCommit
  }, null, 2)}\n`,
  'utf8'
);

console.log(`Private preview artifact written for ${new URL(supabaseUrl).hostname}.`);
console.log('One shared browser Auth client handles the in-app email OTP session and all proof interactions.');
console.log('URL callback detection is disabled because the private Hugging Face access gate runs before application JavaScript.');
console.log('Provider-orchestrated private object and Auth account cleanup is included.');
console.log('No database password, access token or Supabase secret key was passed to the browser build.');
