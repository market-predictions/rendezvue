import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const source = resolve(root, 'apps/private-preview');
const target = resolve(root, 'dist-private-preview');
const canonicalStagingUrl = 'https://rendezvue-private-preview.pages.dev/';

function requireEnvironment(name) {
  const value = String(process.env[name] ?? '').trim();
  if (!value) throw new Error(`${name} is required for the Cloudflare Pages staging build`);
  return value;
}

function validateSupabaseUrl(value) {
  const url = new URL(value);
  const local = ['localhost', '127.0.0.1'].includes(url.hostname);
  if (!local && url.protocol !== 'https:') {
    throw new Error('SUPABASE_URL must use HTTPS outside local validation');
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

async function assembleSharedBrowserClient() {
  const [appSource, interactionSource, indexSource] = await Promise.all([
    readFile(resolve(target, 'app.js'), 'utf8'),
    readFile(resolve(target, 'interaction-proof.js'), 'utf8'),
    readFile(resolve(target, 'index.html'), 'utf8')
  ]);

  const clientDeclaration = 'const supabase = createClient(';
  if (!appSource.includes(clientDeclaration)) {
    throw new Error('Staging app client declaration was not found');
  }
  if (!appSource.includes('detectSessionInUrl: true')) {
    throw new Error('Staging source callback-detection marker was not found');
  }

  const sharedAppSource = appSource
    .replace(clientDeclaration, 'export const supabase = createClient(')
    .replace('detectSessionInUrl: true', 'detectSessionInUrl: false')
    .replace("flowType: 'pkce'", "flowType: 'implicit'")
    .replace("Magic link aangevraagd voor ${result.email}.", "E-mailcode aangevraagd voor ${result.email}.")
    .replace(
      'showResult({ requested: true, email: result.email, redirectTo: runtime.authRedirectUrl });',
      "showResult({ requested: true, email: result.email, delivery: 'email-otp' });"
    );

  if (!sharedAppSource.includes('detectSessionInUrl: false')) {
    throw new Error('Cloudflare staging must ignore URL-based Auth callbacks');
  }

  const interactionBodyStart = interactionSource.indexOf('const output = document.querySelector');
  if (interactionBodyStart < 0) {
    throw new Error('Interaction proof body marker was not found');
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
    .replace('PRIVATE · SYNTHETIC PROOF ONLY', 'CLOUDFLARE STAGING · SYNTHETIC PROOF ONLY')
    .replace('<h1>Rendezvue backend preview</h1>', '<h1>Rendezvue Cloudflare staging</h1>')
    .replace('<h2>Aanmelden met magic link</h2>', '<h2>Aanmelden met e-mailcode</h2>')
    .replace('Magic link aanvragen', 'E-mailcode aanvragen')
    .replace(
      '      <p class="hint">De redirect-URL moet exact in Supabase Auth → URL Configuration zijn toegestaan.</p>',
      `${otpForm}\n      <p class="hint">De code wordt in deze Cloudflare Pages-app gecontroleerd. Aanmeldtokens horen nooit in de adresbalk.</p>`
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
    throw new Error('Cloudflare staging e-mail OTP interface was not assembled');
  }

  await Promise.all([
    writeFile(resolve(target, 'app.js'), sharedAppSource, 'utf8'),
    writeFile(resolve(target, 'interaction-proof.js'), sharedInteractionSource, 'utf8'),
    writeFile(resolve(target, 'index.html'), generatedIndex, 'utf8')
  ]);
}

const supabaseUrl = validateSupabaseUrl(requireEnvironment('SUPABASE_URL'));
const publishableKey = validatePublishableKey(requireEnvironment('SUPABASE_PUBLISHABLE_KEY'));
const buildCommit = String(
  process.env.CF_PAGES_COMMIT_SHA ?? process.env.GITHUB_SHA ?? 'local'
).slice(0, 40);

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
  hostingPlatform: 'cloudflare-pages',
  canonicalStagingUrl,
  supabaseUrl,
  supabasePublishableKey: publishableKey,
  authRedirectUrl: canonicalStagingUrl,
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
    hostingPlatform: 'cloudflare-pages',
    canonicalUrl: canonicalStagingUrl,
    containsServerSecrets: false,
    sharedBrowserAuthClient: true,
    authFlow: 'email-otp-cloudflare-staging',
    urlTokenCallbacksAccepted: false,
    providerAccountCleanup: true,
    realUserAdmissionAuthorized: false,
    buildCommit
  }, null, 2)}\n`,
  'utf8'
);

await writeFile(
  resolve(target, '_headers'),
  `/*\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n  Referrer-Policy: no-referrer\n  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()\n  Cross-Origin-Opener-Policy: same-origin\n  Cross-Origin-Resource-Policy: same-origin\n\n/runtime-config.js\n  Cache-Control: no-store, max-age=0\n\n/deployment.json\n  Cache-Control: no-store, max-age=0\n`,
  'utf8'
);

console.log(`Cloudflare Pages staging artifact written for ${new URL(supabaseUrl).hostname}.`);
console.log(`Canonical staging URL: ${canonicalStagingUrl}`);
console.log(`Build commit marker: ${buildCommit}`);
console.log('One shared browser Auth client handles e-mail OTP and all proof interactions.');
console.log('No database password, access token or Supabase secret key was passed to the browser build.');
