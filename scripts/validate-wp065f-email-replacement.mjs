import fs from 'node:fs';

const migrationPath = 'supabase/migrations/20260803231500_account_support_email_replacement_actions.sql';
const hardeningPath = 'supabase/migrations/20260803231600_account_email_replacement_cancel_guard.sql';
const functionPath = 'supabase/functions/execute-account-email-replacement/index.ts';
const configPath = 'supabase/config.toml';

for (const path of [migrationPath, hardeningPath, functionPath, configPath]) {
  if (!fs.existsSync(path)) throw new Error(`WP-065F required file missing: ${path}`);
}

const migration = fs.readFileSync(migrationPath, 'utf8');
const hardening = fs.readFileSync(hardeningPath, 'utf8');
const executor = fs.readFileSync(functionPath, 'utf8');
const config = fs.readFileSync(configPath, 'utf8');

const requiredMigrationMarkers = [
  'account_email_replacement_actions',
  'account_email_replacement_events',
  'request_account_email_replacement',
  'approve_account_email_replacement',
  'get_account_email_replacement_execution_context',
  'claim_account_email_replacement_execution',
  'complete_account_email_replacement',
  'fail_account_email_replacement',
  'target mailbox possession evidence required',
  'email replacement requester must be the decision proposer',
  'email replacement approver must be the independent decision reviewer',
  "interval '30 days'",
  "interval '2 hours'",
  'grant select on public.account_email_replacement_actions to service_role',
  'revoke all on public.account_email_replacement_actions from public, anon, authenticated, service_role',
];
for (const marker of requiredMigrationMarkers) {
  if (!migration.includes(marker)) throw new Error(`WP-065F migration marker missing: ${marker}`);
}

for (const forbidden of [
  /\bcurrent_email\s+text\b/i,
  /\btarget_email\s+text\b/i,
  /\bold_email\s+text\b/i,
  /\bnew_email\s+text\b/i,
  /merge_accounts?/i,
  /change_password/i,
]) {
  if (forbidden.test(migration)) throw new Error(`WP-065F migration contains forbidden pattern: ${forbidden}`);
}

if (!hardening.includes("and (v_action.approved_by is null or p_operator_reference <> v_action.approved_by)")) {
  throw new Error('WP-065F cancellation guard must be NULL-safe');
}

const requiredExecutorMarkers = [
  "Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')",
  'serviceAuthorized(request, serviceRoleKey)',
  'get_account_email_replacement_execution_context',
  'claim_account_email_replacement_execution',
  'updateUserById(context.user_id',
  'complete_account_email_replacement',
  'fail_account_email_replacement',
  'target_email_not_approved',
  'target_email_in_use',
  'action_finalization_pending',
  'shouldCreateUser: false',
  'email_confirm: true',
];
for (const marker of requiredExecutorMarkers) {
  if (!executor.includes(marker)) throw new Error(`WP-065F executor marker missing: ${marker}`);
}

for (const forbidden of [
  /payload\.userId/,
  /payload\.currentEmail/,
  /console\.(?:log|error|warn)\([^\n]*(?:targetEmail|payload|user\.email)/,
  /JSON\.stringify\(payload\)/,
  /Access-Control-Allow-Origin': '\*'/,
  /deleteUser\(/,
  /createUser\(/,
  /password\s*:/,
]) {
  if (forbidden.test(executor)) throw new Error(`WP-065F executor contains forbidden pattern: ${forbidden}`);
}

if (!config.includes('[functions.execute-account-email-replacement]') || !config.includes('verify_jwt = false')) {
  throw new Error('WP-065F Edge Function configuration is missing');
}

console.log('WP-065F email-replacement safety contract validated.');
