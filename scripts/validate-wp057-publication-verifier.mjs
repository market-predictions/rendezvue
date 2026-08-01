import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const source = await readFile(resolve(root, 'apps/private-preview/proof-publication-verifier.js'), 'utf8');
const cleanup = await readFile(resolve(root, 'apps/private-preview/account-cleanup.js'), 'utf8');
const built = await readFile(resolve(root, 'dist-private-preview/proof-publication-verifier.js'), 'utf8');

for (const marker of [
  "rpc('load_onboarding_snapshot')",
  "publication_status === 'published'",
  'owner-snapshot-rpc',
  'expectedFixture',
  'profile.nickname === expected.nickname',
  'lifeStage?.primary_status === expected.lifeStage',
  "step, status, details",
  "setTimeout(() =>",
  "diagnosticsButton?.addEventListener('click'",
  "publishButton?.addEventListener('click'"
]) {
  if (!source.includes(marker)) throw new Error(`WP-057 publication verifier is missing ${marker}`);
}

if (!cleanup.includes("import './proof-publication-verifier.js';")) {
  throw new Error('WP-057 publication verifier is not loaded by the Cloudflare proof application');
}
if (!built.trim()) throw new Error('Built WP-057 publication verifier is empty');
if (/sb_secret_|service_role|SUPABASE_DB_PASSWORD|SUPABASE_ACCESS_TOKEN|access_token|refresh_token/i.test(built)) {
  throw new Error('Built WP-057 publication verifier contains prohibited credential material');
}
if (/\.select\(['"]user_id|object_path|signedUrl/i.test(source)) {
  throw new Error('WP-057 publication verifier reads or exposes prohibited identifiers');
}

console.log('WP-057 server-authoritative publication verifier validation passed.');
