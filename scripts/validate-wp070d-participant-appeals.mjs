import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const migration = read('supabase/migrations/20260808225000_moderation_participant_appeals.sql');
const test = read('supabase/tests/database/024_moderation_participant_appeals.test.sql');
const race = read('supabase/tests/concurrency/run-wp070d.sh');
const contract = read('docs/WP-070D-PARTICIPANT-NOTICE-APPEALS.md');
const workflow = read('.github/workflows/verify-wp070d-staging.yml');

const requireText = (haystack, needle, label) => {
  if (!haystack.includes(needle)) throw new Error(`WP-070D validation missing ${label}: ${needle}`);
};

for (const marker of [
  'create table if not exists public.moderation_appeals',
  'create or replace function public.list_my_moderation_notices()',
  'create or replace function public.submit_moderation_appeal(',
  'create or replace function public.list_pending_moderation_appeals(',
  'create or replace function public.review_moderation_appeal(',
  "raise exception 'moderation appeal requires an independent reviewer'",
  "'recommend_early_release'",
  "'specialist_escalation'",
  'revoke all on public.moderation_appeals from public, anon, authenticated, service_role',
  'grant select on public.moderation_appeals to service_role',
]) requireText(migration, marker, 'migration contract');

for (const prohibited of [
  /update\s+public\.moderation_restrictions\s+set\s+(starts_at|expires_at)/i,
  /delete\s+from\s+public\.moderation_restrictions/i,
  /insert\s+into\s+public\.moderation_restrictions/i,
  /(update|delete\s+from|insert\s+into)\s+auth\.users/i,
  /update\s+public\.profiles\s+set\s+publication_status/i,
  /insert\s+into\s+public\.blocks/i,
]) {
  if (prohibited.test(migration)) throw new Error(`WP-070D migration contains prohibited effect authority: ${prohibited}`);
}

for (const marker of [
  'participant notice projection contains none of the prohibited internal/reporter/free-text fields',
  'recommend early release does not shorten restriction',
  'appeal review does not mutate moderation case outcome',
  'original proposer cannot review appeal',
  'original WP-070B reviewer cannot review appeal',
  'WP-070C executor cannot review appeal',
]) requireText(test, marker, 'database proof');

for (const marker of [
  'both parallel appeal reviewers succeeded',
  'moderation appeal already decided',
  'parallel appeal review creates exactly one durable review audit event',
  'appeal race does not rewrite historical moderation case outcome',
]) requireText(race, marker, 'parallel review proof');

for (const marker of [
  'Real-user admission: unauthorized',
  'no restriction-lift authority',
  'reporter identity',
  'independent',
]) requireText(contract, marker, 'work-package contract');

for (const marker of [
  "workflows: ['Configure Cloudflare staging backend']",
  "TARGET_SHA: ${{ github.event.workflow_run.head_sha || github.sha }}",
  'active enforcement policies',
  'real-user admission',
]) requireText(workflow, marker, 'protected verifier');

console.log('WP-070D participant notice and independent appeal boundary validated.');
