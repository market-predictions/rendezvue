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
  with active_policy as (
    select policy.version, policy.abandoned_draft_after, policy.grace_period
    from public.account_retention_policies policy
    where policy.status = 'active'
      and policy.effective_at <= timezone('utc', now())
    order by policy.effective_at desc
    limit 1
  ), account_activity as (
    select
      lifecycle.user_id,
      lifecycle.state,
      greatest(
        lifecycle.last_activity_at,
        coalesce(users.last_sign_in_at, users.created_at),
        users.created_at
      ) as observed_activity_at
    from public.account_lifecycle lifecycle
    join auth.users users on users.id = lifecycle.user_id
  ), candidate_rows as (
    select activity.user_id
    from account_activity activity
    cross join active_policy policy
    join public.profiles profile on profile.user_id = activity.user_id
    where activity.state <> 'retention_hold'
      and profile.publication_status = 'draft'
      and activity.observed_activity_at + policy.abandoned_draft_after + policy.grace_period <= timezone('utc', now())
      and not exists (
        select 1
        from public.account_retention_holds hold
        where hold.user_id = activity.user_id
          and hold.released_at is null
          and hold.starts_at <= timezone('utc', now())
          and (hold.ends_at is null or hold.ends_at > timezone('utc', now()))
      )
      and not exists (
        select 1
        from public.matches matched
        where matched.status = 'active'
          and (matched.user_a_id = activity.user_id or matched.user_b_id = activity.user_id)
      )
      and not exists (
        select 1
        from public.safety_reports report
        where (report.reporter_user_id = activity.user_id or report.subject_user_id = activity.user_id)
          and report.status not in ('dismissed', 'closed')
      )
      and not exists (
        select 1
        from public.moderation_cases moderation
        where moderation.subject_user_id = activity.user_id
          and moderation.status not in ('dismissed', 'closed')
      )
  )
  select
    to_regclass('public.account_lifecycle') is not null as lifecycle_present,
    to_regclass('public.account_retention_policies') is not null as policies_present,
    to_regclass('public.account_retention_holds') is not null as holds_present,
    (select count(*)::int from active_policy) as active_policy_count,
    (select count(*)::int from candidate_rows) as candidate_count,
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
