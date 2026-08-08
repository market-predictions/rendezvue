import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const migrationPath = 'supabase/migrations/20260808154500_moderation_intake_triage.sql';
const testPath = 'supabase/tests/database/017_moderation_intake_triage.test.sql';
const concurrencyPath = 'supabase/tests/concurrency/run.sh';
const [migration, test, concurrency] = await Promise.all([
  readFile(resolve(root, migrationPath), 'utf8'),
  readFile(resolve(root, testPath), 'utf8'),
  readFile(resolve(root, concurrencyPath), 'utf8')
]);

function requireIncludes(source, value, message) {
  if (!source.includes(value)) throw new Error(message);
}
function forbid(source, pattern, message) {
  if (pattern.test(source)) throw new Error(message);
}

for (const marker of [
  'create table if not exists public.moderation_case_events',
  'create or replace function public.list_moderation_queue',
  'create or replace function public.claim_moderation_report',
  'create or replace function public.unclaim_moderation_case',
  'create or replace function public.transition_moderation_case',
  'moderation_cases_source_report_unique_idx',
  "when 'critical' then 1",
  "when 'critical' then interval '15 minutes'",
  'stale moderation case version',
  'moderation case already claimed',
  'invalid WP-070A moderation case transition',
  'moderation decision code required'
]) requireIncludes(migration, marker, `WP-070A migration missing contract: ${marker}`);

requireIncludes(migration, 'revoke all on public.moderation_cases from anon, authenticated, service_role', 'service direct case mutation boundary missing');
requireIncludes(migration, 'grant select on public.moderation_cases to service_role', 'service case read grant missing');
requireIncludes(migration, 'revoke all on public.moderation_case_events from public, anon, authenticated, service_role', 'case event write boundary missing');
requireIncludes(migration, 'grant select on public.moderation_case_events to service_role', 'service event read grant missing');
requireIncludes(migration, 'grant execute on function public.list_moderation_queue(integer) to service_role', 'queue is not service-only executable');
requireIncludes(migration, 'grant execute on function public.claim_moderation_report(uuid, text, integer) to service_role', 'claim function is not service-only executable');
requireIncludes(migration, 'grant execute on function public.transition_moderation_case(uuid, integer, public.moderation_state, public.moderation_state, text, text, text) to service_role', 'transition function is not service-only executable');

forbid(migration, /create\s+(?:or\s+replace\s+)?function\s+public\.(?:suspend|ban|delete).*moderation/i, 'WP-070A must not add enforcement functions');
forbid(migration, /update\s+public\.profiles[\s\S]{0,200}publication_status\s*=\s*'suspended'/i, 'WP-070A must not suspend profiles');
forbid(migration, /delete\s+from\s+auth\.users/i, 'WP-070A must not delete users');

for (const marker of [
  "'participants cannot read moderation cases'",
  "'service role cannot directly update moderation cases'",
  "'queue deterministically puts critical report first'",
  "'medium report is queued without prematurely creating a case'",
  "'second operator cannot steal an active claim'",
  "'stale case version blocks transition'",
  "'WP-070A cannot execute or record an enforcement action'",
  "'moderation workflow never downgrades critical child-safety severity'"
]) requireIncludes(test, marker, `WP-070A pgTAP coverage missing: ${marker}`);

for (const marker of [
  'parallel moderation claim race',
  "operator:race-a",
  "operator:race-b",
  'moderation claim race must have exactly one winner',
  'parallel moderation claim creates exactly one case',
  'parallel moderation claim records exactly one claim event',
  'parallel moderation claim records exactly one service audit'
]) requireIncludes(concurrency, marker, `WP-070A concurrency coverage missing: ${marker}`);

console.log('WP-070A moderation intake/triage source and concurrency contracts validated.');
