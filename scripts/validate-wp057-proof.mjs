import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const source = resolve(root, 'apps/private-preview');
const built = resolve(root, 'dist-private-preview');

const files = {
  orchestrator: await readFile(resolve(source, 'proof-orchestrator.js'), 'utf8'),
  ui: await readFile(resolve(source, 'proof-console-ui.js'), 'utf8'),
  observer: await readFile(resolve(source, 'proof-log-observer.js'), 'utf8'),
  signoutGuard: await readFile(resolve(source, 'proof-signout-guard.js'), 'utf8'),
  cleanup: await readFile(resolve(source, 'account-cleanup.js'), 'utf8'),
  builtOrchestrator: await readFile(resolve(built, 'proof-orchestrator.js'), 'utf8'),
  builtUi: await readFile(resolve(built, 'proof-console-ui.js'), 'utf8'),
  builtObserver: await readFile(resolve(built, 'proof-log-observer.js'), 'utf8'),
  builtSignoutGuard: await readFile(resolve(built, 'proof-signout-guard.js'), 'utf8')
};

for (const marker of [
  "workPackage: 'WP-057'",
  'rendezvue.wp057.evidence.v1.',
  'configurationMode',
  'callbackSafety',
  'sessionRestored',
  'peerDiscovered',
  'singleMatch',
  'portraitAccess',
  'contactRevoked',
  'cleanup',
  "navigator.clipboard.writeText",
  "record_attraction_signal",
  "get_matched_portrait_path"
]) {
  if (!files.orchestrator.includes(marker)) throw new Error(`WP-057 orchestrator is missing ${marker}`);
}

for (const marker of [
  'WP-057 · CONTROLLED TWO-ACCOUNT PROOF',
  'wp057-run-id',
  'wp057-role',
  'wp057-refresh-session',
  'wp057-like-peer',
  'wp057-copy-evidence',
  'E-mailadressen, tokens, UUID',
  'proof-checklist',
  'Gecontroleerd synthetisch testaccount actief'
]) {
  if (!files.ui.includes(marker)) throw new Error(`WP-057 console UI is missing ${marker}`);
}

for (const marker of [
  "import './proof-console-ui.js';",
  "import './proof-orchestrator.js';",
  "import './proof-log-observer.js';",
  "import './proof-signout-guard.js';",
  "step: 'cleanup'"
]) {
  if (!files.cleanup.includes(marker)) throw new Error(`Account cleanup does not load or report WP-057 contract: ${marker}`);
}

for (const marker of [
  'profileSaved',
  'portraitSelected',
  'profilePublished',
  'entitlement',
  'realtime',
  'report',
  'feedback',
  'contactRevoked',
  'cleanup'
]) {
  if (!files.observer.includes(marker)) throw new Error(`WP-057 log observer is missing ${marker}`);
}

for (const marker of [
  'global-signout-proven',
  "step === 'globalSignOut'",
  "step !== 'cleanup'",
  "status: 'blocked'",
  'vóór accountcleanup afzonderlijk worden bewezen'
]) {
  if (!files.signoutGuard.includes(marker)) throw new Error(`WP-057 sign-out guard is missing ${marker}`);
}

if (files.orchestrator.includes('localStorage.setItem("access_token"') || files.orchestrator.includes("localStorage.setItem('access_token'")) {
  throw new Error('WP-057 evidence may not persist access tokens');
}
if (files.orchestrator.includes('signedUrl:') || files.orchestrator.includes('objectPath:')) {
  throw new Error('WP-057 evidence may not export signed URLs or private object paths');
}
if (!files.orchestrator.includes("['count', 'status', 'present', 'revoked', 'bothParticipants', 'source', 'reason']")) {
  throw new Error('WP-057 evidence detail allowlist is missing');
}

for (const [name, contents] of Object.entries({
  builtOrchestrator: files.builtOrchestrator,
  builtUi: files.builtUi,
  builtObserver: files.builtObserver,
  builtSignoutGuard: files.builtSignoutGuard
})) {
  if (!contents.trim()) throw new Error(`${name} is empty in the Cloudflare artifact`);
  if (/sb_secret_|service_role|SUPABASE_DB_PASSWORD|SUPABASE_ACCESS_TOKEN/i.test(contents)) {
    throw new Error(`${name} contains prohibited server credential material`);
  }
}

console.log('WP-057 guided proof console validation passed.');
