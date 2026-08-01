import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

const root = resolve(process.cwd());
const target = resolve(root, 'dist-private-preview');
const canonicalStagingUrl = 'https://rendezvue-private-preview.pages.dev/';

async function collectFiles(directory) {
  const entries = await readdir(directory);
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry);
    const info = await stat(path);
    if (info.isDirectory()) files.push(...await collectFiles(path));
    else files.push(path);
  }
  return files;
}

const required = [
  'index.html',
  'app.js',
  'interaction-proof.js',
  'account-cleanup.js',
  'styles.css',
  'runtime-config.js',
  'deployment.json',
  '_headers',
  'src/auth-session.js',
  'src/backend-contract.js',
  'src/onboarding-repository.js'
];

for (const file of required) {
  await readFile(resolve(target, file), 'utf8');
}

const wrangler = await readFile(resolve(root, 'wrangler.toml'), 'utf8');
for (const marker of [
  'name = "rendezvue-private-preview"',
  'pages_build_output_dir = "dist-private-preview"'
]) {
  if (!wrangler.includes(marker)) throw new Error(`wrangler.toml is missing ${marker}`);
}

const deployment = JSON.parse(await readFile(resolve(target, 'deployment.json'), 'utf8'));
if (deployment.backendMode !== 'supabase-proof') throw new Error('Staging artifact is not in supabase-proof mode');
if (deployment.hostingPlatform !== 'cloudflare-pages') throw new Error('Staging artifact is not marked for Cloudflare Pages');
if (deployment.canonicalUrl !== canonicalStagingUrl) throw new Error('Canonical Cloudflare Pages URL is incorrect');
if (deployment.containsServerSecrets !== false) throw new Error('Browser/server secret boundary is not asserted');
if (deployment.sharedBrowserAuthClient !== true) throw new Error('Staging artifact does not assert one shared browser Auth client');
if (deployment.authFlow !== 'pkce-magic-link-cloudflare-staging') throw new Error('Staging artifact does not assert the Cloudflare PKCE magic-link flow');
if (deployment.pkceCodeCallbacksAccepted !== true) throw new Error('PKCE code callbacks must be accepted');
if (deployment.implicitTokenFragmentsAccepted !== false) throw new Error('Implicit token fragments must remain disabled');
if (deployment.providerAccountCleanup !== true) throw new Error('Staging artifact does not assert provider account cleanup');
if (deployment.realUserAdmissionAuthorized !== false) throw new Error('Real-user admission must remain unauthorized');
if (!/^[a-f0-9]{40}$|^local$/.test(String(deployment.buildCommit))) {
  throw new Error('Build commit marker is missing or malformed');
}

const validConfigurationModes = new Set(['remote-supabase', 'browser-safe-placeholder']);
if (!validConfigurationModes.has(deployment.configurationMode)) {
  throw new Error('Cloudflare artifact configuration mode is missing or unsupported');
}
const validConfigurationSources = new Set([
  'environment',
  'browser-safe-placeholder',
  'previous-canonical-deployment'
]);
if (!validConfigurationSources.has(deployment.configurationSource)) {
  throw new Error('Cloudflare artifact configuration source is missing or unsupported');
}
if (typeof deployment.remoteBackendConfigured !== 'boolean') {
  throw new Error('Cloudflare artifact does not declare whether a remote backend is configured');
}
if (deployment.remoteBackendConfigured !== (deployment.configurationMode === 'remote-supabase')) {
  throw new Error('Cloudflare artifact backend flag and configuration mode disagree');
}
if (deployment.configurationMode === 'browser-safe-placeholder' && !['environment', 'browser-safe-placeholder'].includes(deployment.configurationSource)) {
  throw new Error('Placeholder mode uses an invalid configuration source');
}
if (deployment.configurationMode === 'remote-supabase' && !['environment', 'previous-canonical-deployment'].includes(deployment.configurationSource)) {
  throw new Error('Remote Supabase mode uses an invalid configuration source');
}
if (deployment.cloudflareBranch !== null && typeof deployment.cloudflareBranch !== 'string') {
  throw new Error('Cloudflare branch metadata is malformed');
}

const runtime = await readFile(resolve(target, 'runtime-config.js'), 'utf8');
if (!runtime.includes('sb_publishable_')) throw new Error('Staging artifact does not contain a publishable browser key');
if (!runtime.includes('supabase-proof')) throw new Error('Runtime config is not in supabase-proof mode');
if (!runtime.includes('cloudflare-pages')) throw new Error('Runtime config does not identify Cloudflare Pages');
if (!runtime.includes(canonicalStagingUrl)) throw new Error('Runtime config does not contain the canonical Pages URL');
if (!runtime.includes(`"configurationMode": "${deployment.configurationMode}"`)) {
  throw new Error('Runtime and deployment configuration modes disagree');
}
if (!runtime.includes(`"configurationSource": "${deployment.configurationSource}"`)) {
  throw new Error('Runtime and deployment configuration sources disagree');
}
if (!runtime.includes(`"remoteBackendConfigured": ${deployment.remoteBackendConfigured}`)) {
  throw new Error('Runtime and deployment backend flags disagree');
}
if (runtime.includes('127.0.0.1') || runtime.includes('localhost')) {
  throw new Error('Staging artifact may not depend on a local runtime');
}
if (runtime.includes('sb_secret_') || runtime.includes('service_role')) {
  throw new Error('Runtime config contains prohibited server credential material');
}

const usesPlaceholderProject = runtime.includes('https://example.supabase.co');
if (usesPlaceholderProject !== !deployment.remoteBackendConfigured) {
  throw new Error('Placeholder project use does not match the declared backend configuration');
}
const usesApprovedPlaceholderKey = [
  'sb_publishable_cloudflare_preview_placeholder_',
  'sb_publishable_ci_only_placeholder_'
].some((marker) => runtime.includes(marker));
if (deployment.configurationMode === 'browser-safe-placeholder' && !usesApprovedPlaceholderKey) {
  throw new Error('Placeholder mode does not use an approved browser-safe preview or CI key');
}
if (deployment.configurationMode === 'remote-supabase' && runtime.includes('_placeholder_')) {
  throw new Error('Remote Supabase mode contains placeholder key material');
}

const index = await readFile(resolve(target, 'index.html'), 'utf8');
for (const marker of [
  'CLOUDFLARE STAGING',
  'magic-link-form',
  'Magic link aanvragen',
  'interaction-proof.js',
  'account-cleanup.js',
  'claim-proof-entitlement',
  'message-form',
  'delete-account-form'
]) {
  if (!index.includes(marker)) throw new Error(`Cloudflare staging index is missing ${marker}`);
}
if (index.includes('email-otp-form') || index.includes('otp-proof.js')) {
  throw new Error('Generated staging index still contains the unavailable numeric OTP flow');
}
if (/Hugging Face|static\.hf\.space/i.test(index)) {
  throw new Error('Generated staging index still references Hugging Face');
}
if (deployment.configurationMode === 'browser-safe-placeholder' && process.env.CF_PAGES === '1' && !index.includes('Branchpreview zonder backend')) {
  throw new Error('Cloudflare branch preview does not display its non-functional backend warning');
}

const app = await readFile(resolve(target, 'app.js'), 'utf8');
if (!app.includes('export const supabase = createClient(')) {
  throw new Error('Staging app does not export the shared Supabase client');
}
if (!app.includes('detectSessionInUrl: true') || !app.includes("flowType: 'pkce'")) {
  throw new Error('Staging app must process PKCE code callbacks');
}
if (app.includes("flowType: 'implicit'") || app.includes('detectSessionInUrl: false')) {
  throw new Error('Staging app may not use the implicit token-fragment flow');
}
if (!app.includes('removeConsumedPkceCode()') || !app.includes("url.searchParams.delete('code')")) {
  throw new Error('Consumed PKCE callback cleanup is missing');
}
if (!app.includes('redirectTo: runtime.authRedirectUrl')) {
  throw new Error('Magic-link request does not use the canonical redirect configuration');
}

const adapter = await readFile(resolve(target, 'src/auth-session.js'), 'utf8');
if (!adapter.includes('emailRedirectTo: redirectTo')) {
  throw new Error('Auth adapter does not forward the canonical magic-link redirect');
}
if (!adapter.includes("signOut({ scope: 'global' })")) {
  throw new Error('Proof sign-out must revoke every refresh session for the account');
}

const interaction = await readFile(resolve(target, 'interaction-proof.js'), 'utf8');
if (!interaction.startsWith("import { supabase } from './app.js';")) {
  throw new Error('Interaction proof does not import the shared Supabase client');
}
if (interaction.includes('createClient(') || interaction.includes('detectSessionInUrl')) {
  throw new Error('Interaction proof must not create a second Auth client');
}
for (const rpc of [
  'claim_private_proof_entitlement',
  'open_match_conversation',
  'get_matched_portrait_path',
  'end_match_contact',
  'block_user',
  'create_safety_report',
  'submit_interaction_feedback'
]) {
  if (!interaction.includes(rpc)) throw new Error(`Interaction proof does not reference ${rpc}`);
}

const cleanup = await readFile(resolve(target, 'account-cleanup.js'), 'utf8');
if (!cleanup.startsWith("import { supabase } from './app.js';")) {
  throw new Error('Account cleanup does not import the shared Supabase client');
}
if (!cleanup.includes("functions.invoke('delete-private-proof-account'")) {
  throw new Error('Account cleanup function invocation is missing');
}
if (!cleanup.includes('DELETE_SYNTHETIC_ACCOUNT')) {
  throw new Error('Account cleanup confirmation gate is missing');
}
if (cleanup.includes('createClient(') || cleanup.includes('sb_secret_')) {
  throw new Error('Account cleanup may not create a client or contain secret key material');
}

const headers = await readFile(resolve(target, '_headers'), 'utf8');
for (const marker of [
  'X-Content-Type-Options: nosniff',
  'X-Frame-Options: DENY',
  'Referrer-Policy: no-referrer',
  'Permissions-Policy:',
  '/runtime-config.js',
  '/deployment.json',
  'Cache-Control: no-store'
]) {
  if (!headers.includes(marker)) throw new Error(`Cloudflare _headers is missing ${marker}`);
}

const edgeFunction = await readFile(resolve(root, 'supabase/functions/delete-private-proof-account/index.ts'), 'utf8');
for (const contract of [
  "createSupabaseContext(request, { auth: 'user' })",
  '.from(BUCKET)',
  '.remove(objectPaths)',
  '.auth.admin.deleteUser(userId, false)',
  'payload.confirmation !== CONFIRMATION'
]) {
  if (!edgeFunction.includes(contract)) throw new Error(`Cleanup Edge Function is missing contract: ${contract}`);
}
if (edgeFunction.includes('SUPABASE_SERVICE_ROLE_KEY') || edgeFunction.includes('sb_secret_')) {
  throw new Error('Cleanup Edge Function may use platform context but may not hardcode secret material');
}

const prohibitedPatterns = [
  /sb_secret_/i,
  /service_role/i,
  /SUPABASE_ACCESS_TOKEN/i,
  /SUPABASE_DB_PASSWORD/i,
  /postgres(?:ql)?:\/\//i,
  /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/i,
  /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/
];

for (const file of await collectFiles(target)) {
  const contents = await readFile(file, 'utf8');
  for (const pattern of prohibitedPatterns) {
    if (pattern.test(contents)) {
      throw new Error(`Prohibited server credential material found in ${relative(root, file)}: ${pattern}`);
    }
  }
}

console.log(`Cloudflare Pages staging artifact validation passed (${required.length} required files, ${deployment.configurationMode}, ${deployment.configurationSource}).`);
