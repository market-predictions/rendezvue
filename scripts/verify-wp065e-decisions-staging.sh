#!/usr/bin/env bash
set -euo pipefail

: "${SUPABASE_ACCESS_TOKEN:?SUPABASE_ACCESS_TOKEN is required}"
: "${SUPABASE_PROJECT_REF:?SUPABASE_PROJECT_REF is required}"

if [[ ! "$SUPABASE_PROJECT_REF" =~ ^[a-z0-9]{15,30}$ ]]; then
  echo 'Invalid SUPABASE_PROJECT_REF format' >&2
  exit 1
fi

work_dir="${RUNNER_TEMP:-${TMPDIR:-/tmp}}"
request="$work_dir/wp065e-decisions-request.json"
response="$work_dir/wp065e-decisions-response.json"

node --input-type=module - "$request" <<'NODE'
import { writeFileSync } from 'node:fs';

const query = `
  select
    to_regclass('public.account_support_evidence_assertions') is not null as evidence_present,
    to_regclass('public.account_support_decisions') is not null as decisions_present,
    to_regclass('public.account_support_decision_events') is not null as events_present,
    (select count(*)::int from public.account_support_evidence_assertions) as evidence_count,
    (select count(*)::int from public.account_support_decisions) as decision_count,
    (select count(*)::int from public.account_support_decision_events) as decision_event_count,
    has_table_privilege('anon', 'public.account_support_evidence_assertions', 'SELECT') as anon_can_read_evidence,
    has_table_privilege('authenticated', 'public.account_support_decisions', 'SELECT') as authenticated_can_read_decisions,
    has_table_privilege('service_role', 'public.account_support_evidence_assertions', 'SELECT') as service_role_can_read_evidence,
    has_table_privilege('service_role', 'public.account_support_decisions', 'SELECT') as service_role_can_read_decisions,
    has_table_privilege('service_role', 'public.account_support_evidence_assertions', 'INSERT') as service_role_can_insert_evidence,
    has_table_privilege('service_role', 'public.account_support_decisions', 'UPDATE') as service_role_can_update_decisions,
    has_table_privilege('service_role', 'public.account_support_decision_events', 'INSERT') as service_role_can_insert_events,
    has_function_privilege(
      'anon',
      'public.register_account_support_evidence(uuid,public.account_support_evidence_category,public.account_support_evidence_scope,public.account_support_evidence_assessment,text,text)',
      'EXECUTE'
    ) as anon_can_register_evidence,
    has_function_privilege(
      'authenticated',
      'public.propose_account_support_decision(uuid,public.account_support_decision_outcome,text,text)',
      'EXECUTE'
    ) as authenticated_can_propose_decisions,
    has_function_privilege(
      'service_role',
      'public.register_account_support_evidence(uuid,public.account_support_evidence_category,public.account_support_evidence_scope,public.account_support_evidence_assessment,text,text)',
      'EXECUTE'
    ) as service_role_can_register_evidence,
    has_function_privilege(
      'service_role',
      'public.propose_account_support_decision(uuid,public.account_support_decision_outcome,text,text)',
      'EXECUTE'
    ) as service_role_can_propose_decisions,
    has_function_privilege(
      'service_role',
      'public.review_account_support_decision(uuid,public.account_support_decision_state,public.account_support_review_action,text,text)',
      'EXECUTE'
    ) as service_role_can_review_decisions,
    (
      select count(*)::int
      from pg_proc function
      join pg_namespace namespace on namespace.oid = function.pronamespace
      where namespace.nspname = 'public'
        and function.proname in (
          'execute_account_support_action',
          'merge_account_support_accounts',
          'change_account_auth_email',
          'restore_account_access',
          'delete_account_support_subject'
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
  echo "Remote WP-065E query failed with HTTP $status" >&2
  node --input-type=module - "$response" <<'NODE'
import { readFileSync } from 'node:fs';

const raw = readFileSync(process.argv[2], 'utf8');
try {
  const value = JSON.parse(raw);
  console.error(JSON.stringify({
    message: value?.message,
    error: value?.error,
    code: value?.code
  }));
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
  throw new Error('Remote WP-065E verifier returned an unexpected response shape');
}

const row = rows[0];
const truthy = (value) => value === true || value === 'true' || value === 't' || value === 1 || value === '1';
const integer = (value) => Number.parseInt(String(value), 10);

for (const field of ['evidence_present', 'decisions_present', 'events_present']) {
  if (!truthy(row[field])) throw new Error(`${field} is not true`);
}
for (const field of ['evidence_count', 'decision_count', 'decision_event_count', 'dangerous_function_count']) {
  if (integer(row[field]) !== 0) throw new Error(`${field} is not zero`);
}
for (const field of [
  'anon_can_read_evidence',
  'authenticated_can_read_decisions',
  'service_role_can_insert_evidence',
  'service_role_can_update_decisions',
  'service_role_can_insert_events',
  'anon_can_register_evidence',
  'authenticated_can_propose_decisions'
]) {
  if (truthy(row[field])) throw new Error(`${field} must be false`);
}
for (const field of [
  'service_role_can_read_evidence',
  'service_role_can_read_decisions',
  'service_role_can_register_evidence',
  'service_role_can_propose_decisions',
  'service_role_can_review_decisions'
]) {
  if (!truthy(row[field])) throw new Error(`${field} must be true`);
}

console.log(JSON.stringify({
  evidenceSchemaPresent: true,
  decisionSchemaPresent: true,
  decisionEventsPresent: true,
  evidenceCount: 0,
  decisionCount: 0,
  decisionEventCount: 0,
  ordinaryUserAccess: false,
  serviceRoleDirectWrites: false,
  serviceRoleControlledFunctions: true,
  dangerousMutationFunctions: 0
}));
NODE
