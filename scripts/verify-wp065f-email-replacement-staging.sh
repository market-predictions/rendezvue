#!/usr/bin/env bash
set -euo pipefail

: "${SUPABASE_ACCESS_TOKEN:?SUPABASE_ACCESS_TOKEN is required}"
: "${SUPABASE_PROJECT_REF:?SUPABASE_PROJECT_REF is required}"

if [[ ! "$SUPABASE_PROJECT_REF" =~ ^[a-z0-9]{15,30}$ ]]; then
  echo 'Invalid SUPABASE_PROJECT_REF format' >&2
  exit 1
fi

work_dir="${RUNNER_TEMP:-${TMPDIR:-/tmp}}"
request="$work_dir/wp065f-email-replacement-request.json"
response="$work_dir/wp065f-email-replacement-response.json"

node --input-type=module - "$request" <<'NODE'
import { writeFileSync } from 'node:fs';

const query = `
  select
    to_regclass('public.account_email_replacement_actions') is not null as actions_present,
    to_regclass('public.account_email_replacement_events') is not null as events_present,
    (select count(*)::int from public.account_email_replacement_actions) as action_count,
    (select count(*)::int from public.account_email_replacement_events) as event_count,
    (
      select count(*)::int
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'account_email_replacement_actions'
        and column_name in ('email', 'current_email', 'target_email', 'old_email', 'new_email')
    ) as plaintext_email_column_count,
    has_table_privilege('anon', 'public.account_email_replacement_actions', 'SELECT') as anon_can_read_actions,
    has_table_privilege('authenticated', 'public.account_email_replacement_actions', 'SELECT') as authenticated_can_read_actions,
    has_table_privilege('service_role', 'public.account_email_replacement_actions', 'SELECT') as service_role_can_read_actions,
    has_table_privilege('service_role', 'public.account_email_replacement_actions', 'INSERT') as service_role_can_insert_actions,
    has_table_privilege('service_role', 'public.account_email_replacement_actions', 'UPDATE') as service_role_can_update_actions,
    has_table_privilege('service_role', 'public.account_email_replacement_events', 'INSERT') as service_role_can_insert_events,
    has_function_privilege('anon', 'public.request_account_email_replacement(uuid,text,text,text,text,text,text,text)', 'EXECUTE') as anon_can_request,
    has_function_privilege('authenticated', 'public.approve_account_email_replacement(uuid,public.account_email_replacement_state,text)', 'EXECUTE') as authenticated_can_approve,
    has_function_privilege('service_role', 'public.request_account_email_replacement(uuid,text,text,text,text,text,text,text)', 'EXECUTE') as service_role_can_request,
    has_function_privilege('service_role', 'public.approve_account_email_replacement(uuid,public.account_email_replacement_state,text)', 'EXECUTE') as service_role_can_approve,
    has_function_privilege('service_role', 'public.get_account_email_replacement_execution_context(uuid,text)', 'EXECUTE') as service_role_can_get_context,
    has_function_privilege('service_role', 'public.claim_account_email_replacement_execution(uuid,text,text)', 'EXECUTE') as service_role_can_claim,
    has_function_privilege('service_role', 'public.complete_account_email_replacement(uuid,text,text,boolean)', 'EXECUTE') as service_role_can_complete,
    has_function_privilege('service_role', 'public.fail_account_email_replacement(uuid,text,text,text,boolean)', 'EXECUTE') as service_role_can_fail,
    has_function_privilege('service_role', 'public.cancel_account_email_replacement(uuid,public.account_email_replacement_state,text)', 'EXECUTE') as service_role_can_cancel,
    (
      select count(*)::int
      from pg_proc function
      join pg_namespace namespace on namespace.oid = function.pronamespace
      where namespace.nspname = 'public'
        and function.proname in (
          'merge_accounts',
          'execute_account_merge',
          'replace_account_password',
          'delete_account_for_support'
        )
    ) as dangerous_function_count;
`;

writeFileSync(process.argv[2], JSON.stringify({ query, read_only: true }));
NODE

status="$(curl --silent --show-error \
  --output "$response" \
  --write-out '%{http_code}' \
  --request POST \
  --header "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  --header 'content-type: application/json' \
  --data-binary "@$request" \
  "https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_REF/database/query")"

if [[ "$status" != "200" && "$status" != "201" ]]; then
  echo "Remote WP-065F query failed with HTTP $status" >&2
  node --input-type=module - "$response" <<'NODE'
import { readFileSync } from 'node:fs';
const raw = readFileSync(process.argv[2], 'utf8');
try {
  const value = JSON.parse(raw);
  console.error(JSON.stringify({ message: value?.message, error: value?.error, code: value?.code }));
} catch {
  console.error(raw.slice(0, 1000));
}
NODE
  exit 1
fi

node --input-type=module - "$response" <<'NODE'
import { readFileSync } from 'node:fs';
const payload = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const rows = Array.isArray(payload)
  ? payload
  : Array.isArray(payload?.result)
    ? payload.result
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.rows)
        ? payload.rows
        : [];

if (rows.length !== 1 || typeof rows[0] !== 'object' || rows[0] === null) {
  throw new Error('Remote WP-065F verifier returned an unexpected response shape');
}

const row = rows[0];
const truthy = (value) => value === true || value === 'true' || value === 't' || value === 1 || value === '1';
const integer = (value) => Number.parseInt(String(value), 10);

for (const field of ['actions_present', 'events_present']) {
  if (!truthy(row[field])) throw new Error(`${field} is not true`);
}
for (const field of ['action_count', 'event_count', 'plaintext_email_column_count', 'dangerous_function_count']) {
  if (integer(row[field]) !== 0) throw new Error(`${field} is not zero`);
}
for (const field of [
  'anon_can_read_actions',
  'authenticated_can_read_actions',
  'service_role_can_insert_actions',
  'service_role_can_update_actions',
  'service_role_can_insert_events',
  'anon_can_request',
  'authenticated_can_approve'
]) {
  if (truthy(row[field])) throw new Error(`${field} must be false`);
}
for (const field of [
  'service_role_can_read_actions',
  'service_role_can_request',
  'service_role_can_approve',
  'service_role_can_get_context',
  'service_role_can_claim',
  'service_role_can_complete',
  'service_role_can_fail',
  'service_role_can_cancel'
]) {
  if (!truthy(row[field])) throw new Error(`${field} must be true`);
}

console.log(JSON.stringify({
  actionSchemaPresent: true,
  eventSchemaPresent: true,
  actionCount: 0,
  eventCount: 0,
  plaintextEmailColumns: 0,
  ordinaryUserAccess: false,
  serviceRoleDirectWrites: false,
  controlledFunctions: true,
  dangerousMutationFunctions: 0
}));
NODE
