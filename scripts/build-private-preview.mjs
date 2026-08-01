import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const source = resolve(root, 'apps/private-preview');
const target = resolve(root, 'dist-private-preview');
const canonicalStagingUrl = 'https://rendezvue-private-preview.pages.dev/';
const cloudflareBranch = String(process.env.CF_PAGES_BRANCH ?? '').trim();
const isCloudflarePreview = process.env.CF_PAGES === '1' && cloudflareBranch && cloudflareBranch !== 'main';

function readEnvironment(name, previewFallback) {
  const value = String(process.env[name] ?? '').trim();
  if (value) return value;
  if (isCloudflarePreview && previewFallback) {
    console.warn(`${name} is not available to this Cloudflare branch preview; using a non-functional browser-safe placeholder.`);
    return previewFallback;
  }
  throw new Error(`${name} is required for the Cloudflare Pages production staging build`);
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
  if (!appSource.includes('detectSessionInUrl: true') || !appSource.includes("flowType: 'pkce'")) {
    throw new Error('Staging source PKCE callback markers were not found');
  }

  const cleanupHelper = [
    '',
    'function removeConsumedPkceCode() {',
    '  const url = new URL(globalThis.location.href);',
    "  if (!url.searchParams.has('code')) return;",
    "  url.searchParams.delete('code');",
    '  const next = `${url.pathname}${url.search}${url.hash}`;',
    "  globalThis.history.replaceState(null, '', next);",
    '}',
    ''
  ].join('\n');

  let sharedAppSource = appSource
    .replace(clientDeclaration, 'export const supabase = createClient(')
    .replace('function setSession(user) {', `${cleanupHelper}function setSession(user) {`);

  sharedAppSource = sharedAppSource.replace(
    '  if (session?.user) {\n    try {',
    '  if (session?.user) {\n    removeConsumedPkceCode();\n    try {'
  );
  sharedAppSource = sharedAppSource.replace(
    "  if (session?.user) appendLog('Bestaande sessie hersteld.');",
    "  if (session?.user) {\n    removeConsumedPkceCode();\n    appendLog('Bestaande sessie hersteld.');\n  }"
  );

  if (!sharedAppSource.includes('removeConsumedPkceCode()')) {
    throw new Error('PKCE callback cleanup was not assembled');
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

  let generatedIndex = indexSource
    .replace('PRIVATE · SYNTHETIC PROOF ONLY', 'CLOUDFLARE STAGING · SYNTHETIC PROOF ONLY')
    .replace('<h1>Rendezvue backend preview</h1>', '<h1>Rendezvue Cloudflare staging</h1>')
    .replace(
      '      <p class="hint">De redirect-URL moet exact in Supabase Auth → URL Configuration zijn toegestaan.</p>',
      '      <p class="hint">Open de nieuwste aanmeldlink in hetzelfde browserprofiel. Cloudflare verwerkt daarna een eenmalige PKCE-code; access- en refresh-tokens horen nooit in de adresbalk.</p>'
    );

  if (isCloudflarePreview) {
    generatedIndex = generatedIndex.replace(
      '<section class="warning">',
      '<section class="warning"><strong>Branchpreview zonder backend.</strong> Deze deployment valideert uitsluitend het browserartifact; authenticatie en datamutaties zijn uitgeschakeld door placeholderconfiguratie.</section><section class="warning">'
    );
  }

  const cleanupScript = '  <script type="module" src="./account-cleanup.js"></script>\n';
  if (!generatedIndex.includes('account-cleanup.js')) {
    generatedIndex = generatedIndex.replace('</body>', `${cleanupScript}</body>`);
  }

  if (!generatedIndex.includes('magic-link-form') || generatedIndex.includes('email-otp-form')) {
    throw new Error('Cloudflare staging magic-link interface was not assembled correctly');
  }

  await Promise.all([
    writeFile(resolve(target, 'app.js'), sharedAppSource, 'utf8'),
    writeFile(resolve(target, 'interaction-proof.js'), sharedInteractionSource, 'utf8'),
    writeFile(resolve(target, 'index.html'), generatedIndex, 'utf8')
  ]);
}

const supabaseUrl = validateSupabaseUrl(readEnvironment('SUPABASE_URL', 'https://example.supabase.co'));
const publishableKey = validatePublishableKey(readEnvironment(
  'SUPABASE_PUBLISHABLE_KEY',
  'sb_publishable_cloudflare_preview_placeholder_00000000000000000000'
));
const buildCommit = String(
  process.env.CF_PAGES_COMMIT_SHA ?? process.env.GITHUB_SHA ?? 'local'
).slice(0, 40);
const remoteBackendConfigured = new URL(supabaseUrl).hostname !== 'example.supabase.co';
const configurationMode = remoteBackendConfigured ? 'remote-supabase' : 'browser-safe-placeholder';

if (!isCloudflarePreview && process.env.CF_PAGES === '1' && !remoteBackendConfigured) {
  throw new Error('Cloudflare Pages production may not use placeholder Supabase configuration');
}

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
  configurationMode,
  remoteBackendConfigured,
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
    configurationMode,
    remoteBackendConfigured,
    cloudflareBranch: cloudflareBranch || null,
    containsServerSecrets: false,
    sharedBrowserAuthClient: true,
    authFlow: 'pkce-magic-link-cloudflare-staging',
    pkceCodeCallbacksAccepted: true,
    implicitTokenFragmentsAccepted: false,
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

console.log(`Cloudflare Pages artifact written for ${new URL(supabaseUrl).hostname}.`);
console.log(`Canonical staging URL: ${canonicalStagingUrl}`);
console.log(`Build commit marker: ${buildCommit}`);
console.log(`Configuration mode: ${configurationMode}`);
console.log('One shared browser Auth client handles PKCE magic links and all proof interactions.');
console.log('No database password, access token or Supabase secret key was passed to the browser build.');
