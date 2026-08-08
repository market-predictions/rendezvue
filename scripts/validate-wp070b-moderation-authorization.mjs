import { readFile } from 'node:fs/promises';

const [baseMigration, recoveryMigration, basePgTap, recoveryPgTap, concurrency, workPackage] = await Promise.all([
  readFile('supabase/migrations/20260808190500_moderation_action_authorization.sql', 'utf8'),
  readFile('supabase/migrations/20260808193000_moderation_action_stale_recovery.sql', 'utf8'),
  readFile('supabase/tests/database/018_moderation_action_authorization.test.sql', 'utf8'),
  readFile('supabase/tests/database/019_moderation_action_stale_recovery.test.sql', 'utf8'),
  readFile('supabase/tests/concurrency/run.sh', 'utf8'),
  readFile('docs/WP-070B-DUAL-CONTROL-AUTHORIZATION.md', 'utf8')
]);
const migration = `${baseMigration}\n${recoveryMigration}`;
const pgTap = `${basePgTap}\n${recoveryPgTap}`;

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
  'create table if not exists public.moderation_action_proposals',
  'create table if not exists public.moderation_action_reviews',
  'moderation_action_proposals_one_pending_per_case_idx',
  'alter table public.moderation_action_proposals enable row level security',
  'alter table public.moderation_action_reviews enable row level security',
  'public.propose_moderation_action(',
  'public.review_moderation_action_proposal(',
  'public.list_pending_moderation_action_proposals(',
  'public.supersede_stale_moderation_action_proposal(',
  "v_case.status <> 'investigating'",
  'v_case.assigned_operator_ref is distinct from p_operator_ref',
  'v_case.version <> v_proposal.case_version',
  'v_proposal.proposed_by_ref = p_reviewer_ref',
  "v_proposal.critical_escalation_required and p_decision = 'approved'",
  'critical moderation action requires specialist escalation',
  'moderation action proposal snapshot is immutable',
  'moderation action proposal is not stale',
  'moderation_action_proposed',
  'moderation_action_reviewed',
  'moderation_action_superseded'
]) {
  requireText(migration, marker, `WP-070B migration contract missing ${marker}`);
}

requirePattern(
  baseMigration,
  /revoke all on public\.moderation_action_proposals from public, anon, authenticated, service_role;\s*grant select on public\.moderation_action_proposals to service_role;/s,
  'WP-070B proposal table does not enforce service read-only access'
);
requirePattern(
  baseMigration,
  /revoke all on public\.moderation_action_reviews from public, anon, authenticated, service_role;\s*grant select on public\.moderation_action_reviews to service_role;/s,
  'WP-070B review table does not enforce service read-only access'
);
for (const fn of [
  'list_pending_moderation_action_proposals(integer)',
  'propose_moderation_action(uuid, integer, text, text, text)',
  'review_moderation_action_proposal(uuid, text, text, text)'
]) {
  requireText(baseMigration, `grant execute on function public.${fn} to service_role;`, `WP-070B service execute grant missing for ${fn}`);
}
requireText(
  recoveryMigration,
  'grant execute on function public.supersede_stale_moderation_action_proposal(uuid, text, text) to service_role;',
  'WP-070B service execute grant missing for stale-proposal recovery'
);

// The proposal schema/projections must never carry reporter identity or report
// free text. Review/supersede codes are bounded technical codes, not notes.
const proposalTable = baseMigration.match(/create table if not exists public\.moderation_action_proposals \([\s\S]*?\n\);/)?.[0] ?? '';
forbidPattern(proposalTable, /reporter_user_id|description|free_text|comment/i, 'WP-070B proposal snapshot contains prohibited reporter/free-text material');
const queueResult = baseMigration.match(/returns table \([\s\S]*?\n\)\nlanguage plpgsql\nsecurity definer/)?.[0] ?? '';
forbidPattern(queueResult, /reporter_user_id|description/i, 'WP-070B pending queue projection contains reporter/free-text report material');

// WP-070B is authorization-only. No effectful participant/account mutation is
// allowed in either migration; those require a later separately governed package.
forbidPattern(migration, /\bupdate\s+public\.(profiles|matches|conversations|blocks|privacy_portraits|profile_media|eligibility)\b/i, 'WP-070B migrations contain participant/product enforcement UPDATE');
forbidPattern(migration, /\b(delete\s+from|insert\s+into)\s+(auth\.users|public\.blocks)\b/i, 'WP-070B migrations contain account/block enforcement mutation');
forbidPattern(migration, /publication_status\s*=\s*'(paused|suspended)'/i, 'WP-070B migrations change publication state');
forbidPattern(migration, /set\s+status\s*=\s*'actioned'/i, 'WP-070B migrations action moderation cases');

for (const marker of [
  'proposer cannot review own proposal',
  'authorization does not suspend or pause subject profile',
  'authorization does not delete Auth accounts',
  'stale case version fails closed during authorization review',
  'ordinary approval is prohibited for critical proposal',
  'critical proposal records escalation rather than approval',
  'WP-070B produces no actioned moderation cases',
  'current proposal cannot be arbitrarily superseded',
  'stale proposal still fails closed at review boundary',
  'controlled service operation can terminally supersede a proven stale proposal',
  'administrative supersede does not fabricate independent review evidence',
  'fresh proposal can be created after stale proposal is superseded',
  'one-pending-per-case invariant is restored after stale recovery'
]) {
  requireText(pgTap, marker, `WP-070B pgTAP coverage missing: ${marker}`);
}
requireText(basePgTap, "position('reporter_user_id'", 'WP-070B pgTAP does not prove reporter identity omission');
requireText(basePgTap, "position('description'", 'WP-070B pgTAP does not prove free-text omission');
requireText(recoveryPgTap, 'supersede audit omits reporter identity and report free text', 'WP-070B stale-recovery audit privacy proof is missing');

for (const marker of [
  'parallel moderation review race',
  'review_moderation_action_proposal',
  'moderation action proposal already decided',
  'parallel moderation review creates exactly one review record',
  'parallel moderation review records exactly one service audit',
  'parallel authorization review does not execute moderation action'
]) {
  requireText(concurrency, marker, `WP-070B concurrency proof missing: ${marker}`);
}

for (const marker of [
  'No enforcement execution',
  'independent reviewer',
  'critical',
  'Real-user admission',
  'governance_release_assurance'
]) {
  requireText(workPackage, marker, `WP-070B work-package contract missing: ${marker}`);
}

console.log('WP-070B dual-control moderation authorization and stale-recovery source contracts are valid.');
