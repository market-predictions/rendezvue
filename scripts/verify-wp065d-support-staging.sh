#!/usr/bin/env bash
set -euo pipefail

: "${SUPABASE_ACCESS_TOKEN:?SUPABASE_ACCESS_TOKEN is required}"
: "${SUPABASE_PROJECT_REF:?SUPABASE_PROJECT_REF is required}"

if [[ ! "$SUPABASE_PROJECT_REF" =~ ^[a-z0-9]{15,30}$ ]]; then
  echo 'Invalid SUPABASE_PROJECT_REF format' >&2
  exit 1
fi

work_dir="${RUNNER_TEMP:-${TMPDIR:-/tmp}}"
request="$work_dir/wp065d-support-request.json"
response="$work_dir/wp065d-support-response.json"

node --input-type=module - "$request" <<'NODE'
import { writeFileSync } from 'node:fs';

const query = `
  select
    to_regclass('public.account_support_cases') is not null as cases_present,
    to_regclass('public.account_support_case_events') is not null as events_present,
    (select count(*)::int from public.account_support_cases) as case_count,
    (select count(*)::int from public.account_support_case_events) as event_count,
    has_table_privilege('anon', 'public.account_support_cases', 'SELECT') as anon_can_read_cases,
    has_table_privilege('authenticated', 'public.account_support_cases', 'SELECT') as authenticated_can_read_cases,
    has_table_privilege('service_role', 'public.account_support_cases', 'SELECT') as service_role_can_read_cases,
    has_table_privilege('service_role', 'public.account_support_cases', 'INSERT') as service_role_can_insert_cases,
    has_table_privilege('service_role', 'public.account_support_cases', 'UPDATE') as service_role_can_update_cases,
    has_table_privilege('service_role', 'public.account_support_case_events', 'INSERT') as service_role_can_insert_events,
    has_function_privilege(
      'anon',
      'public.open_account_support_case(public.account_support_case_kind,uuid,uuid,text,text,text[])',
      'EXECUTE'
    ) as anon_can_open_cases,
    has_function_privilege(
      'authenticated',
      'public.open_account_support_case(public.account_support_case_kind,uuid,uuid,text,text,text[])',
      'EXECUTE'
    ) as authenticated_can_open_cases,
    has_function_privilege(
      'service_role',
      'public.open_account_support_case(public.account_support_case_kind,uuid,uuid,text,text,text[])',
      'EXECUTE'
    ) as service_role_can_open_cases,
    has_function_privilege(
      'service_role',
      'public.transition_account_support_case(uuid,public.account_support_case_state,public.account_support_case_state,text,text,text[])',
      'EXECUTE'
    ) as service_role_can_transition_cases,
    (
      select count(*)::int
      from pg_proc function
      join pg_namespace namespace on namespace.oid = function.pronamespace
      where namespace.nspname = 'public'
        and function.proname in (
          'merge_account_support_case',
          'restore_account_access',
          'change_account_email',
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
  echo "Remote support-case query failed with HTTP $status" >&2
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
  throw new Error('Remote support-case verifier returned an unexpected response shape');
}

const row = rows[0];
const truthy = (value) => value === true || value === 'true' || value === 't' || value === 1 || value === '1';
const integer = (value) => Number.parseInt(String(value), 10);

for (const field of ['cases_present', 'events_present']) {
  if (!truthy(row[field])) throw new Error(`${field} is not true`);
}
for (const field of ['case_count', 'event_count', 'dangerous_function_count']) {
  if (integer(row[field]) !== 0) throw new Error(`${field} is not zero`);
}
for (const field of [
  'anon_can_read_cases',
  'authenticated_can_read_cases',
  'service_role_can_insert_cases',
  'service_role_can_update_cases',
  'service_role_can_insert_events',
  'anon_can_open_cases',
  'authenticated_can_open_cases'
]) {
  if (truthy(row[field])) throw new Error(`${field} must be false`);
}
for (const field of [
  'service_role_can_read_cases',
  'service_role_can_open_cases',
  'service_role_can_transition_cases'
]) {
  if (!truthy(row[field])) throw new Error(`${field} must be true`);
}

console.log(JSON.stringify({
  supportSchemaPresent: true,
  supportCases: 0,
  supportEvents: 0,
  ordinaryUserAccess: false,
  serviceRoleDirectWrites: false,
  serviceRoleControlledFunctions: true,
  dangerousMutationFunctions: 0
}));
NODE
