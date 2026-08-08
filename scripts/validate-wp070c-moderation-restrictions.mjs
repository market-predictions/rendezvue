import { readFile } from 'node:fs/promises';

const [migration, privilegeRepair, pgTap, race, workPackage, roadmapAddendum, verifier] = await Promise.all([
  readFile('supabase/migrations/20260808203500_moderation_reversible_restrictions.sql', 'utf8'),
  readFile('supabase/migrations/20260808203600_moderation_restriction_privilege_repair.sql', 'utf8'),
  readFile('supabase/tests/database/021_moderation_reversible_restrictions.test.sql', 'utf8'),
  readFile('supabase/tests/concurrency/run-wp070c.sh', 'utf8'),
  readFile('docs/WP-070C-REVERSIBLE-RESTRICTIONS.md', 'utf8'),
  readFile('docs/ROADMAP-WP070C-ADDENDUM.md', 'utf8'),
  readFile('.github/workflows/verify-wp070c-staging.yml', 'utf8')
]);

function requireText(source, text, message) {
  if (!source.includes(text)) throw new Error(message);
}
function requirePattern(source, pattern, message) {
  if (!pattern.test(source)) throw new Error(message);
}
function forbidPattern(source, pattern, message) {
  if (pattern.test(source)) throw new Error(message);
}

for (const marker of [
  "scope text not null check (scope = 'synthetic_only')",
  "action_code text not null check (action_code in ('restrict_discovery', 'restrict_contact'))",
  'duration_minutes integer not null check (duration_minutes between 5 and 10080)',
  "('wp070c.synthetic.reversible', 1, 'synthetic_only', 'restrict_discovery', 60, false)",
  "('wp070c.synthetic.reversible', 1, 'synthetic_only', 'restrict_contact', 60, false)",
  'create table if not exists public.moderation_restrictions',
  'create or replace function public.has_active_moderation_restriction(',
  'create or replace function public.execute_approved_moderation_restriction(',
  "v_proposal.status <> 'approved'",
  'critical moderation proposal cannot use reversible executor',
  "v_proposal.action_code not in ('restrict_discovery', 'restrict_contact')",
  'WP-070C executor is restricted to synthetic profiles',
  'make_interval(mins => v_policy.duration_minutes)',
  'moderation_restriction_executed',
  "'proposed_by_ref', v_proposal.proposed_by_ref",
  "'reviewer_ref', v_review.reviewer_ref",
  "'executor_ref', p_executor_ref",
  "set status = 'actioned'",
  "not public.has_active_moderation_restriction(auth.uid(), 'restrict_discovery')",
  "not public.has_active_moderation_restriction(p_target_user_id, 'restrict_discovery')",
  "public.has_active_moderation_restriction(v_actor, 'restrict_contact')",
  "public.has_active_moderation_restriction(v_match.user_a_id, 'restrict_contact')",
  "public.has_active_moderation_restriction(pp.user_id, 'restrict_contact')"
]) {
  requireText(migration, marker, `WP-070C migration contract missing: ${marker}`);
}

requirePattern(
  migration,
  /revoke all on public\.moderation_enforcement_policies from public, anon, authenticated, service_role;\s*grant select on public\.moderation_enforcement_policies to service_role;/s,
  'WP-070C policy table does not enforce service read-only access'
);
requirePattern(
  migration,
  /revoke all on public\.moderation_restrictions from public, anon, authenticated, service_role;\s*grant select on public\.moderation_restrictions to service_role;/s,
  'WP-070C restriction ledger does not enforce service read-only access'
);
requireText(
  migration,
  'grant execute on function public.execute_approved_moderation_restriction(uuid, text, integer, text) to service_role;',
  'WP-070C controlled executor service grant missing'
);
requireText(
  privilegeRepair,
  'grant execute on function public.can_discover_profile(uuid, public.sex_type) to authenticated;',
  'WP-070C failed to preserve authenticated can_discover_profile privilege required by profile RLS'
);

const executor = migration.match(/create or replace function public\.execute_approved_moderation_restriction\([\s\S]*?\n\$\$;/)?.[0] ?? '';
if (!executor) throw new Error('WP-070C executor body could not be isolated');
forbidPattern(executor, /\b(insert\s+into|update|delete\s+from)\s+public\.(profiles|blocks|matches|conversations)\b/i, 'WP-070C executor mutates prohibited participant product state');
forbidPattern(executor, /\b(insert\s+into|update|delete\s+from)\s+auth\.users\b/i, 'WP-070C executor mutates Auth users');
forbidPattern(executor, /reporter_user_id|\bdescription\b/i, 'WP-070C executor audit/data path contains reporter identity or report free text');
forbidPattern(migration, /create\s+(or\s+replace\s+)?function\s+public\.[a-z0-9_]*activate[a-z0-9_]*policy/i, 'WP-070C must not expose a policy activation RPC');
forbidPattern(migration, /scope\s*=\s*'real|real_user|production_user/i, 'WP-070C must not define a real-user enforcement scope');

for (const marker of [
  'WP-070C ships with zero active enforcement policies',
  'service role cannot directly activate or mutate moderation policies',
  'participants cannot inspect moderation policies or restrictions',
  'default-off enforcement policy blocks execution even after independent approval',
  'restriction duration is supplied by policy rather than caller input',
  'discovery restriction does not rewrite participant publication state',
  'moderation restriction does not fabricate participant blocks',
  'expired discovery restriction automatically restores discovery authorization',
  'contact restriction does not rewrite match state',
  'contact restriction does not rewrite conversation state',
  'contact restriction does not delete historical messages',
  'message write succeeds again after automatic restriction expiry',
  'executor rejects non-synthetic target even under active test policy',
  'WP-070C cannot execute suspend_account',
  'executor independently rejects stale approved authorization',
  'executor independently rejects a fabricated approved critical proposal'
]) {
  requireText(pgTap, marker, `WP-070C pgTAP coverage missing: ${marker}`);
}

for (const marker of [
  'parallel executor retries converge on one restriction id',
  'parallel execution creates exactly one restriction row',
  'parallel execution creates exactly one durable execution audit',
  'parallel execution records exactly one moderation action transition',
  'parallel execution increments moderation case version exactly once',
  'parallel restriction execution does not rewrite participant publication state',
  'local race test restores zero active enforcement policies'
]) {
  requireText(race, marker, `WP-070C concurrency coverage missing: ${marker}`);
}

for (const marker of [
  '**Status:** `IMPLEMENTATION_IN_PROGRESS`',
  'synthetic_only',
  'zero active enforcement policies',
  'restrict_discovery',
  'restrict_contact',
  'does not rewrite participant-owned publication state',
  'Real-user admission',
  'governance_release_assurance'
]) {
  requireText(workPackage, marker, `WP-070C work-package contract missing: ${marker}`);
}
for (const marker of [
  'WP-070A and WP-070B are `OUTCOME_CONFIRMED`',
  'default-off synthetic-only reversible restriction execution',
  'Real-user admission remains unauthorized'
]) {
  requireText(roadmapAddendum, marker, `WP-070C roadmap addendum missing: ${marker}`);
}

for (const marker of [
  'workflow_run:',
  "workflows: ['Configure Cloudflare staging backend']",
  'types: [completed]',
  "github.event.workflow_run.conclusion == 'success'",
  'github.event.workflow_run.head_sha',
  'TARGET_SHA',
  'Verify exact upstream commit binding',
  'active enforcement policies: zero',
  'real-user admission: not authorized'
]) {
  requireText(verifier, marker, `WP-070C protected verifier contract missing: ${marker}`);
}
forbidPattern(verifier, /^\s*push:\s*$/m, 'WP-070C protected verifier must not race backend migration/configuration on direct push');

console.log('WP-070C reversible restriction, default-off policy, product authorization, concurrency and protected verifier contracts are valid.');
