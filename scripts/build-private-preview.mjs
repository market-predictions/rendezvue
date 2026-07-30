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
    authRedirectUrl,
    buildCommit
  }, null, 2)}\n`,
  'utf8'
);

console.log(`Private preview artifact written for ${new URL(supabaseUrl).hostname}.`);
console.log('No database password, access token or Supabase secret key was passed to the browser build.');
