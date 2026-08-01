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
  'otp-proof.js',
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
if (deployment.authFlow !== 'email-otp-cloudflare-staging') throw new Error('Staging artifact does not assert the Cloudflare e-mail OTP flow');
if (deployment.urlTokenCallbacksAccepted !== false) throw new Error('URL token callbacks must be rejected');
if (deployment.providerAccountCleanup !== true) throw new Error('Staging artifact does not assert provider account cleanup');
if (deployment.realUserAdmissionAuthorized !== false) throw new Error('Real-user admission must remain unauthorized');
if (!/^[a-f0-9]{40}$|^local$/.test(String(deployment.buildCommit))) {
  throw new Error('Build commit marker is missing or malformed');
}

const runtime = await readFile(resolve(target, 'runtime-config.js'), 'utf8');
if (!runtime.includes('sb_publishable_')) throw new Error('Staging artifact does not contain a publishable browser key');
if (!runtime.includes('supabase-proof')) throw new Error('Runtime config is not in supabase-proof mode');
if (!runtime.includes('cloudflare-pages')) throw new Error('Runtime config does not identify Cloudflare Pages');
if (!runtime.includes(canonicalStagingUrl)) throw new Error('Runtime config does not contain the canonical Pages URL');
if (runtime.includes('127.0.0.1') || runtime.includes('localhost')) {
  throw new Error('Staging artifact may not depend on a local runtime');
}
if (runtime.includes('sb_secret_') || runtime.includes('service_role')) {
  throw new Error('Runtime config contains prohibited server credential material');
}

const index = await readFile(resolve(target, 'index.html'), 'utf8');
for (const marker of [
  'CLOUDFLARE STAGING',
  'interaction-proof.js',
  'otp-proof.js',
  'email-otp-form',
  'account-cleanup.js',
  'claim-proof-entitlement',
  'message-form',
  'delete-account-form'
]) {
  if (!index.includes(marker)) throw new Error(`Cloudflare staging index is missing ${marker}`);
}
if (/Hugging Face|static\.hf\.space/i.test(index)) {
  throw new Error('Generated staging index still references Hugging Face');
}

const app = await readFile(resolve(target, 'app.js'), 'utf8');
if (!app.includes('export const supabase = createClient(')) {
  throw new Error('Staging app does not export the shared Supabase client');
}
if (!app.includes('detectSessionInUrl: false') || app.includes('detectSessionInUrl: true')) {
  throw new Error('Staging app must ignore URL-based Auth callbacks');
}
if (!app.includes("delivery: 'email-otp'")) {
  throw new Error('Staging app does not report e-mail OTP delivery');
}

const otp = await readFile(resolve(target, 'otp-proof.js'), 'utf8');
if (!otp.startsWith("import { supabase } from './app.js';")) {
  throw new Error('E-mail OTP proof does not import the shared Supabase client');
}
if (!otp.includes('supabase.auth.verifyOtp') || !otp.includes("type: 'email'")) {
  throw new Error('E-mail OTP verification contract is missing');
}
if (!otp.includes("location.hash.includes('access_token=')") || !otp.includes("location.search.includes('code=')")) {
  throw new Error('Legacy URL callback cleanup is missing');
}
if (otp.includes('createClient(') || otp.includes('sb_secret_')) {
  throw new Error('E-mail OTP proof may not create a client or contain secret key material');
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

console.log(`Cloudflare Pages staging artifact validation passed (${required.length} required files).`);
