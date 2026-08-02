import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const source = await readFile(resolve(root, 'apps/private-preview/proof-log-observer.js'), 'utf8');
const built = await readFile(resolve(root, 'dist-private-preview/proof-log-observer.js'), 'utf8');
const migration = await readFile(resolve(root, 'supabase/migrations/20260802221000_contact_revocation_proof_state.sql'), 'utf8');

for (const [name, contents] of Object.entries({ source, built })) {
  for (const marker of [
    "import { supabase } from './app.js';",
    "rpc('get_contact_revocation_state')",
    'terminal_match_found',
    'conversation_closed',
    'new_portrait_access_revoked',
    'message_write_revoked',
    "dispatchProof('contactRevoked'",
    "portrait.removeAttribute('src')",
    "messageForm.querySelectorAll('input, button')",
    'Nieuwe gesprek- en portrettoegang zijn server-side ingetrokken',
    'Revocatiecontrole kon de gesanitiseerde serverstatus niet lezen'
  ]) {
    if (!contents.includes(marker)) throw new Error(`${name} revocation verifier is missing ${marker}`);
  }

  if (contents.includes(".from('matches')") || contents.includes(".from('conversations')")) {
    throw new Error(`${name} must use the participant-scoped revocation RPC instead of composing RLS reads in the browser`);
  }
  if (/Contact en eventueel gesprek server-side beëindigd[^\n]+contactRevoked/.test(contents)) {
    throw new Error(`${name} may not accept a success log as revocation proof`);
  }
  if (/access_token|refresh_token|signedUrl|objectPath/.test(contents)) {
    throw new Error(`${name} revocation verifier may not persist or expose sensitive access material`);
  }
}

for (const marker of [
  'create or replace function public.get_contact_revocation_state()',
  'security definer',
  'terminal_match_found boolean',
  'conversation_closed boolean',
  'new_portrait_access_revoked boolean',
  'message_write_revoked boolean',
  'grant execute on function public.get_contact_revocation_state() to authenticated',
  'revoke all on function public.get_contact_revocation_state() from public, anon'
]) {
  if (!migration.toLowerCase().includes(marker.toLowerCase())) {
    throw new Error(`Revocation proof migration is missing ${marker}`);
  }
}
const returnContract = migration.split('returns table')[1]?.split(')\nlanguage')[0] ?? '';
if (/object_path|signed_url|user_a_id\s+uuid|user_b_id\s+uuid/i.test(returnContract)) {
  throw new Error('Revocation proof RPC return contract may not expose identifiers, object paths or signed URLs');
}

console.log('WP-057 server-authoritative revocation RPC validation passed.');
