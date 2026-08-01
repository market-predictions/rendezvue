import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const verifierSource = await readFile(resolve(root, 'apps/private-preview/proof-publication-verifier.js'), 'utf8');
const authoritySource = await readFile(resolve(root, 'apps/private-preview/proof-authoritative-evidence.js'), 'utf8');
const cleanup = await readFile(resolve(root, 'apps/private-preview/account-cleanup.js'), 'utf8');
const builtVerifier = await readFile(resolve(root, 'dist-private-preview/proof-publication-verifier.js'), 'utf8');
const builtAuthority = await readFile(resolve(root, 'dist-private-preview/proof-authoritative-evidence.js'), 'utf8');

for (const marker of [
  "rpc('load_onboarding_snapshot')",
  "publication_status === 'published'",
  'owner-snapshot-rpc',
  'Eerder geslaagde serveracties blijven als bewijs behouden',
  "diagnosticsButton?.addEventListener('click'",
  "publishButton?.addEventListener('click'"
]) {
  if (!verifierSource.includes(marker)) throw new Error(`WP-057 publication verifier is missing ${marker}`);
}

if (verifierSource.includes('MutationObserver') || verifierSource.includes('[250, 1400, 3200, 6200]')) {
  throw new Error('WP-057 publication verifier still contains the request-storm retry/observer path');
}

for (const marker of [
  'rendezvue.wp057.authority.v1.',
  'publish-rpc-response',
  'local-pkce-session',
  'auth-state-session',
  "functionName === 'publish_profile'",
  "functionName === 'load_onboarding_snapshot'",
  'supabase.rpc = wrappedRpc',
  'authority-marker',
  'replayMarkers'
]) {
  if (!authoritySource.includes(marker)) throw new Error(`WP-057 authority guard is missing ${marker}`);
}

if (!cleanup.includes("import './proof-authoritative-evidence.js';")) {
  throw new Error('WP-057 authority guard is not loaded by the Cloudflare proof application');
}
if (!cleanup.includes("import './proof-publication-verifier.js';")) {
  throw new Error('WP-057 publication verifier is not loaded by the Cloudflare proof application');
}
if (!builtVerifier.trim() || !builtAuthority.trim()) {
  throw new Error('Built WP-057 publication evidence modules are empty');
}

for (const [label, value] of [
  ['verifier', `${verifierSource}\n${builtVerifier}`],
  ['authority guard', `${authoritySource}\n${builtAuthority}`]
]) {
  if (/sb_secret_|service_role|SUPABASE_DB_PASSWORD|SUPABASE_ACCESS_TOKEN|access_token|refresh_token/i.test(value)) {
    throw new Error(`Built WP-057 ${label} contains prohibited credential material`);
  }
}

if (/\.select\(['"]user_id|object_path|signedUrl/i.test(`${verifierSource}\n${authoritySource}`)) {
  throw new Error('WP-057 publication evidence modules read or expose prohibited identifiers');
}

console.log('WP-057 authoritative publication evidence validation passed.');
