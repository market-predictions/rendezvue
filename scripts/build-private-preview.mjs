import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const source = resolve(root, 'apps/private-preview');
const target = resolve(root, 'dist-private-preview');
const canonicalStagingUrl = 'https://rendezvue-private-preview.pages.dev/';
const cloudflareBranch = String(process.env.CF_PAGES_BRANCH ?? '').trim();
const isCloudflareBuild = process.env.CF_PAGES === '1';
const isCloudflarePreview = isCloudflareBuild && cloudflareBranch && cloudflareBranch !== 'main';
const isCloudflareProduction = isCloudflareBuild && !isCloudflarePreview;

function optionalEnvironment(name) {
  return String(process.env[name] ?? '').trim();
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

function parseRuntimeConfigScript(script) {
  const prefix = 'window.__RENDEZVUE_CONFIG__ = Object.freeze(';
  const start = script.indexOf(prefix);
  const end = script.lastIndexOf(');');
  if (start < 0 || end <= start + prefix.length) {
    throw new Error('Previous canonical runtime configuration has an unsupported format');
  }
  const payload = script.slice(start + prefix.length, end).trim();
  return JSON.parse(payload);
}

async function loadPreviousCanonicalBrowserConfig() {
  const bootstrapUrl = new URL('runtime-config.js', canonicalStagingUrl);
  bootstrapUrl.searchParams.set('bootstrap', String(Date.now()));

  const response = await fetch(bootstrapUrl, {
    headers: {
      accept: 'application/javascript,text/javascript,*/*;q=0.1',
      'cache-control': 'no-cache'
    },
    redirect: 'follow'
  });
  if (!response.ok) {
    throw new Error(`Previous canonical browser configuration returned HTTP ${response.status}`);
  }

  const previous = parseRuntimeConfigScript(await response.text());
  const supabaseUrl = validateSupabaseUrl(String(previous.supabaseUrl ?? ''));
  const supabasePublishableKey = validatePublishableKey(String(previous.supabasePublishableKey ?? ''));
  if (new URL(supabaseUrl).hostname === 'example.supabase.co') {
    throw new Error('Previous canonical browser configuration contains a placeholder project');
  }

  console.log('Validated and reused browser-safe Supabase configuration from the previous canonical deployment.');
  return { supabaseUrl, supabasePublishableKey };
}

async function resolveBrowserConfiguration() {
  const environmentUrl = optionalEnvironment('SUPABASE_URL');
  const environmentKey = optionalEnvironment('SUPABASE_PUBLISHABLE_KEY');

  if (environmentUrl && environmentKey) {
    return {
      supabaseUrl: validateSupabaseUrl(environmentUrl),
      supabasePublishableKey: validatePublishableKey(environmentKey),
      configurationSource: 'environment'
    };
  }

  if (isCloudflarePreview) {
    console.warn('Supabase browser variables are unavailable to this Cloudflare branch preview; using non-functional browser-safe placeholders.');
    return {
      supabaseUrl: validateSupabaseUrl('https://example.supabase.co'),
      supabasePublishableKey: validatePublishableKey('sb_publishable_cloudflare_preview_placeholder_00000000000000000000'),
      configurationSource: 'browser-safe-placeholder'
    };
  }

  if (isCloudflareProduction) {
    if (environmentUrl || environmentKey) {
      console.warn('Cloudflare production has incomplete Supabase browser variables; ignoring the partial pair and using the validated previous public browser configuration.');
    } else {
      console.warn('Cloudflare production has no Supabase browser variables; bootstrapping from the validated previous public browser configuration.');
    }
    return {
      ...await loadPreviousCanonicalBrowserConfig(),
      configurationSource: 'previous-canonical-deployment'
    };
  }

  throw new Error('SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are both required outside a Cloudflare branch preview or production bootstrap');
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

  let generatedIndex = indexSource.replace(
    'PRIVATE · SYNTHETIC PROOF ONLY',
    'CLOUDFLARE STAGING · SYNTHETIC PROOF ONLY'
  );

  if (isCloudflarePreview) {
    generatedIndex = generatedIndex.replace(
      '<section class="staging-notice" role="note">',
      '<section class="warning"><strong>Branchpreview zonder backend.</strong> Deze deployment valideert uitsluitend het browserartifact; authenticatie en datamutaties zijn uitgeschakeld door placeholderconfiguratie. <a href="./visual-acceptance/wp076.html">Bekijk WP-076 visueel zonder login.</a></section><section class="staging-notice" role="note">'
    );
  }

  const cleanupScript = '  <script type="module" src="./account-cleanup.js"></script>\n';
  if (!generatedIndex.includes('account-cleanup.js')) {
    generatedIndex = generatedIndex.replace('</body>', `${cleanupScript}</body>`);
  }

  if (!generatedIndex.includes('magic-link-form') || generatedIndex.includes('email-otp-form')) {
    throw new Error('Cloudflare staging magic-link interface was not assembled correctly');
  }
  if (!generatedIndex.includes('account-shell.js') || !generatedIndex.includes('recovery-help')) {
    throw new Error('Product-facing account and recovery shell was not assembled correctly');
  }

  await Promise.all([
    writeFile(resolve(target, 'app.js'), sharedAppSource, 'utf8'),
    writeFile(resolve(target, 'interaction-proof.js'), sharedInteractionSource, 'utf8'),
    writeFile(resolve(target, 'index.html'), generatedIndex, 'utf8')
  ]);
}

async function assembleBranchVisualAcceptance() {
  if (!isCloudflarePreview) return;
  const visualTarget = resolve(target, 'visual-acceptance');
  await mkdir(visualTarget, { recursive: true });
  await Promise.all([
    cp(resolve(root, 'scripts/fixtures/wp076-visual-acceptance.html'), resolve(visualTarget, 'wp076.html')),
    cp(resolve(root, 'synthetic-seed/portraits/yasmin.webp'), resolve(visualTarget, 'yasmin.webp'))
  ]);
  console.log('Branch-only WP-076 visual acceptance route assembled.');
}

const {
  supabaseUrl,
  supabasePublishableKey,
  configurationSource
} = await resolveBrowserConfiguration();
const buildCommit = String(
  process.env.CF_PAGES_COMMIT_SHA ?? process.env.GITHUB_SHA ?? 'local'
).slice(0, 40);
const remoteBackendConfigured = new URL(supabaseUrl).hostname !== 'example.supabase.co';
const configurationMode = remoteBackendConfigured ? 'remote-supabase' : 'browser-safe-placeholder';

if (isCloudflareProduction && !remoteBackendConfigured) {
  throw new Error('Cloudflare Pages production may not use placeholder Supabase configuration');
}

await readFile(resolve(source, 'index.html'), 'utf8');
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });
await mkdir(resolve(target, 'src'), { recursive: true });

for (const file of ['auth-session.js', 'backend-contract.js', 'onboarding-repository.js', 'account-experience.js', 'profile-image-preparation.js']) {
  await cp(resolve(root, 'apps/web/src', file), resolve(target, 'src', file));
}

await assembleSharedBrowserClient();
await assembleBranchVisualAcceptance();

const runtimeConfig = {
  backendMode: 'supabase-proof',
  hostingPlatform: 'cloudflare-pages',
  canonicalStagingUrl,
  configurationMode,
  configurationSource,
  remoteBackendConfigured,
  supabaseUrl,
  supabasePublishableKey,
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
    configurationSource,
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
