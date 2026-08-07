#!/usr/bin/env bash
set -euo pipefail

: "${SUPABASE_ACCESS_TOKEN:?SUPABASE_ACCESS_TOKEN is required}"
: "${SUPABASE_PROJECT_REF:?SUPABASE_PROJECT_REF is required}"

if [[ ! "$SUPABASE_PROJECT_REF" =~ ^[a-z0-9]{15,30}$ ]]; then
  echo 'Invalid SUPABASE_PROJECT_REF format' >&2
  exit 1
fi

work_dir="${RUNNER_TEMP:-${TMPDIR:-/tmp}}"
request="$work_dir/wp069b-profile-image-request.json"
response="$work_dir/wp069b-profile-image-response.json"

node --input-type=module - "$request" <<'NODE'
import { writeFileSync } from 'node:fs';

const query = `
  with expected_columns(name) as (
    values
      ('preparation_id'), ('asset_role'), ('source_object_path'),
      ('focal_x'), ('focal_y'), ('zoom'), ('crop_aspect'),
      ('source_width'), ('source_height'), ('output_width'), ('output_height'),
      ('metadata_stripped'), ('quality_flags'), ('privacy_filter_id')
  ), selected_duplicates as (
    select portrait.user_id
    from public.privacy_portraits portrait
    where portrait.is_public_profile_portrait
    group by portrait.user_id
    having count(*) > 1
  )
  select
    to_regclass('public.privacy_portraits') is not null as portraits_present,
    (
      select count(*)::int
      from expected_columns expected
      join information_schema.columns column_info
        on column_info.table_schema = 'public'
       and column_info.table_name = 'privacy_portraits'
       and column_info.column_name = expected.name
    ) as prepared_column_count,
    to_regprocedure('public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text,text[])') is not null as register_rpc_present,
    to_regprocedure('public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text[])') is not null as registration_helper_present,
    has_function_privilege('anon', 'public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text,text[])', 'EXECUTE') as anon_can_register,
    has_function_privilege('authenticated', 'public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text,text[])', 'EXECUTE') as authenticated_can_register,
    has_function_privilege('authenticated', 'public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text[])', 'EXECUTE') as authenticated_can_call_helper,
    exists (
      select 1 from pg_constraint
      where conrelid = 'public.privacy_portraits'::regclass
        and conname = 'privacy_portraits_public_role_check'
    ) as public_role_constraint_present,
    exists (
      select 1 from pg_indexes
      where schemaname = 'public'
        and tablename = 'privacy_portraits'
        and indexname = 'privacy_portraits_one_selected_card'
    ) as selected_card_index_present,
    (select count(*)::int from public.privacy_portraits where is_public_profile_portrait and asset_role <> 'card') as selected_non_card_count,
    (select count(*)::int from selected_duplicates) as duplicate_selected_account_count,
    (
      select count(*)::int
      from public.privacy_portraits
      where preparation_id is not null
        and asset_role in ('source', 'card', 'avatar')
        and not metadata_stripped
    ) as unstripped_prepared_count,
    pg_get_functiondef('public.load_onboarding_snapshot()'::regprocedure) like '%- ''source_object_path''%' as snapshot_redacts_source_path,
    pg_get_functiondef('public.load_onboarding_snapshot()'::regprocedure) like '%- ''object_path''%' as snapshot_redacts_card_path,
    pg_get_functiondef('public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text[])'::regprocedure) like '%pg_advisory_xact_lock%' as registration_serialized,
    pg_get_functiondef('public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text[])'::regprocedure) like '%card-4x5.webp%' as card_path_enforced,
    pg_get_functiondef('public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text[])'::regprocedure) like '%avatar-square.webp%' as avatar_path_enforced,
    pg_get_functiondef('public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text,text[])'::regprocedure) like '%supported privacy presentation required%' as privacy_presentation_required,
    pg_get_functiondef('public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text,text[])'::regprocedure) like '%unfiltered%' as active_unfiltered_present,
    pg_get_functiondef('public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text,text[])'::regprocedure) like '%morePrivate%' as active_more_private_present;
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
  echo "Remote WP-069B query failed with HTTP $status" >&2
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
  throw new Error('Remote WP-069B verifier returned an unexpected response shape');
}

const row = rows[0];
const truthy = (value) => value === true || value === 'true' || value === 't' || value === 1 || value === '1';
const integer = (value) => Number.parseInt(String(value), 10);

for (const field of [
  'portraits_present',
  'register_rpc_present',
  'registration_helper_present',
  'authenticated_can_register',
  'public_role_constraint_present',
  'selected_card_index_present',
  'snapshot_redacts_source_path',
  'snapshot_redacts_card_path',
  'registration_serialized',
  'card_path_enforced',
  'avatar_path_enforced',
  'privacy_presentation_required',
  'active_unfiltered_present',
  'active_more_private_present'
]) {
  if (!truthy(row[field])) throw new Error(`${field} is not true`);
}
if (integer(row.prepared_column_count) !== 14) throw new Error('prepared portrait column contract is incomplete');
if (truthy(row.anon_can_register)) throw new Error('anonymous callers can register prepared portraits');
if (truthy(row.authenticated_can_call_helper)) throw new Error('authenticated callers can bypass the active privacy-presentation contract');
if (integer(row.selected_non_card_count) !== 0) throw new Error('a source or avatar asset is selected as a profile portrait');
if (integer(row.duplicate_selected_account_count) !== 0) throw new Error('an account has more than one selected portrait');
if (integer(row.unstripped_prepared_count) !== 0) throw new Error('a prepared asset is not marked metadata-stripped');

console.log(JSON.stringify({
  portraitsPresent: true,
  preparedColumnCount: 14,
  activeRegistrationSignature: 'uuid,text,text,text,numeric,numeric,numeric,integer,integer,text,text[]',
  registerRpcPresent: true,
  registrationHelperPresent: true,
  anonCanRegister: false,
  authenticatedCanRegister: true,
  authenticatedCanCallHelper: false,
  selectedNonCardCount: 0,
  duplicateSelectedAccountCount: 0,
  unstrippedPreparedCount: 0,
  snapshotPathsRedacted: true,
  registrationSerialized: true,
  canonicalPathsEnforced: true,
  privacyPresentationRequired: true
}));
NODE
