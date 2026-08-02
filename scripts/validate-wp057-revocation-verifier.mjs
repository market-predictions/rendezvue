import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const source = await readFile(resolve(root, 'apps/private-preview/proof-log-observer.js'), 'utf8');
const built = await readFile(resolve(root, 'dist-private-preview/proof-log-observer.js'), 'utf8');

for (const [name, contents] of Object.entries({ source, built })) {
  for (const marker of [
    "import { supabase } from './app.js';",
    ".in('status', ['ended', 'blocked'])",
    "conversationResult.data.status !== 'open'",
    'portraitPathResult.data === null',
    "dispatchProof('contactRevoked'",
    "portrait.removeAttribute('src')",
    "messageForm.querySelectorAll('input, button')",
    'Nieuwe gesprek- en portrettoegang zijn server-side ingetrokken'
  ]) {
    if (!contents.includes(marker)) throw new Error(`${name} revocation verifier is missing ${marker}`);
  }

  if (/Contact en eventueel gesprek server-side beëindigd[^\n]+contactRevoked/.test(contents)) {
    throw new Error(`${name} may not accept a success log as revocation proof`);
  }
  if (/access_token|refresh_token|signedUrl|objectPath/.test(contents)) {
    throw new Error(`${name} revocation verifier may not persist or expose sensitive access material`);
  }
}

console.log('WP-057 server-state revocation verifier validation passed.');
