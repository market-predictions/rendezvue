#!/usr/bin/env bash
set -euo pipefail

: "${SUPABASE_ACCESS_TOKEN:?SUPABASE_ACCESS_TOKEN is required}"
: "${SUPABASE_PROJECT_REF:?SUPABASE_PROJECT_REF is required}"

if [[ ! "$SUPABASE_PROJECT_REF" =~ ^[a-z0-9]{15,30}$ ]]; then
  echo 'Invalid SUPABASE_PROJECT_REF format' >&2
  exit 1
fi

work_dir="${RUNNER_TEMP:-${TMPDIR:-/tmp}}"
request="$work_dir/wp065-lifecycle-request.json"
response="$work_dir/wp065-lifecycle-response.json"

node --input-type=module - "$request" <<'NODE'
import { writeFileSync } from 'node:fs';

const query = `
  select
    to_regclass('public.account_lifecycle') is not null as lifecycle_present,
    to_regclass('public.account_retention_policies') is not null as policies_present,
    to_regclass('public.account_retention_holds') is not null as holds_present,
    (select count(*)::int from public.account_retention_policies where status = 'active') as active_policy_count,
    (select count(*)::int from public.list_account_retention_candidates(timezone('utc', now()))) as candidate_count,
    has_function_privilege('anon', 'public.list_account_retention_candidates(timestamptz)', 'EXECUTE') as anon_can_enumerate,
    has_function_privilege('authenticated', 'public.list_account_retention_candidates(timestamptz)', 'EXECUTE') as authenticated_can_enumerate,
    has_function_privilege('service_role', 'public.list_account_retention_candidates(timestamptz)', 'EXECUTE') as service_role_can_enumerate;
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
  echo "Remote lifecycle query failed with HTTP $status" >&2
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
  throw new Error('Remote lifecycle verifier returned an unexpected response shape');
}

const row = rows[0];
const truthy = (value) => value === true || value === 'true' || value === 't' || value === 1 || value === '1';
const integer = (value) => Number.parseInt(String(value), 10);

for (const field of ['lifecycle_present', 'policies_present', 'holds_present']) {
  if (!truthy(row[field])) throw new Error(`${field} is not true`);
}
if (integer(row.active_policy_count) !== 0) {
  throw new Error('A remote retention policy is active without approval');
}
if (integer(row.candidate_count) !== 0) {
  throw new Error('Remote cleanup candidates exist while WP-065C is blocked');
}
if (truthy(row.anon_can_enumerate)) {
  throw new Error('anon can enumerate retention candidates');
}
if (truthy(row.authenticated_can_enumerate)) {
  throw new Error('authenticated can enumerate retention candidates');
}
if (!truthy(row.service_role_can_enumerate)) {
  throw new Error('service_role cannot enumerate retention candidates');
}

console.log(JSON.stringify({
  lifecyclePresent: true,
  policiesPresent: true,
  holdsPresent: true,
  activePolicyCount: 0,
  candidateCount: 0,
  anonCanEnumerate: false,
  authenticatedCanEnumerate: false,
  serviceRoleCanEnumerate: true
}));
NODE
