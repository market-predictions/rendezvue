#!/usr/bin/env bash
set -euo pipefail

DB_URL="${SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
PSQL=(psql "$DB_URL" -X -v ON_ERROR_STOP=1 -qAt)
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

REPORTER="74000000-0000-0000-0000-000000000001"
SUBJECT="74000000-0000-0000-0000-000000000002"

query() {
  "${PSQL[@]}" -c "$1" | tr -d '[:space:]'
}

assert_equal() {
  local actual="$1"
  local expected="$2"
  local message="$3"
  if [[ "$actual" != "$expected" ]]; then
    echo "FAIL: $message (expected $expected, got $actual)" >&2
    exit 1
  fi
  echo "PASS: $message"
}

command -v psql >/dev/null 2>&1 || {
  echo "psql client is required for WP-070C concurrency test" >&2
  exit 1
}

"${PSQL[@]}" <<SQL
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '$REPORTER', 'authenticated', 'authenticated', 'wp070c-race-reporter@rendezvue.test', crypt('race-password-a', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '$SUBJECT', 'authenticated', 'authenticated', 'wp070c-race-subject@rendezvue.test', crypt('race-password-b', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

update public.profiles
set nickname='WP070C race subject', sex='woman', city_region='Utrecht',
    relationship_intent='serious_relationship', publication_status='published',
    is_synthetic=true, synthetic_id='wp070c-race-subject'
where user_id='$SUBJECT';

insert into public.safety_reports (
  reporter_user_id, subject_user_id, category, description, severity, status
) values (
  '$REPORTER', '$SUBJECT', 'harassment', 'wp070c parallel execution race', 'medium', 'open'
);

set local role service_role;
select public.claim_moderation_report(
  (select id from public.safety_reports where description='wp070c parallel execution race'),
  'operator:wp070c-race-proposer', null
);
select public.transition_moderation_case(
  (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='wp070c parallel execution race'),
  1, 'triage', 'investigating', 'operator:wp070c-race-proposer', null, 'prepare parallel execution race'
);
select public.propose_moderation_action(
  (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='wp070c parallel execution race'),
  2, 'operator:wp070c-race-proposer', 'restrict_contact', 'wp070c_parallel_execution'
);
select public.review_moderation_action_proposal(
  (select p.id from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='wp070c parallel execution race'),
  'operator:wp070c-race-reviewer', 'approved', 'wp070c_parallel_approved'
);
reset role;

-- Test-only activation in the disposable local database. No service caller has
-- UPDATE privilege on this table and the repository seed remains inactive.
update public.moderation_enforcement_policies
set active=true
where policy_key='wp070c.synthetic.reversible'
  and policy_version=1
  and action_code='restrict_contact';
SQL

PROPOSAL_ID="$(query "select p.id from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='wp070c parallel execution race'")"
[[ -n "$PROPOSAL_ID" ]] || { echo 'FAIL: WP-070C race proposal id missing' >&2; exit 1; }

cat >"$TMP_DIR/execute-a.sql" <<SQL
begin;
set local statement_timeout = '15s';
set local role service_role;
select pg_sleep(1);
select public.execute_approved_moderation_restriction('$PROPOSAL_ID','wp070c.synthetic.reversible',1,'operator:wp070c-race-executor-a');
commit;
SQL

cat >"$TMP_DIR/execute-b.sql" <<SQL
begin;
set local statement_timeout = '15s';
set local role service_role;
select pg_sleep(1);
select public.execute_approved_moderation_restriction('$PROPOSAL_ID','wp070c.synthetic.reversible',1,'operator:wp070c-race-executor-b');
commit;
SQL

"${PSQL[@]}" -f "$TMP_DIR/execute-a.sql" >"$TMP_DIR/execute-a.out" 2>"$TMP_DIR/execute-a.err" &
PID_A=$!
"${PSQL[@]}" -f "$TMP_DIR/execute-b.sql" >"$TMP_DIR/execute-b.out" 2>"$TMP_DIR/execute-b.err" &
PID_B=$!

wait "$PID_A" || { cat "$TMP_DIR/execute-a.err" >&2; exit 1; }
wait "$PID_B" || { cat "$TMP_DIR/execute-b.err" >&2; exit 1; }

RESULT_A="$(tr -d '[:space:]' <"$TMP_DIR/execute-a.out")"
RESULT_B="$(tr -d '[:space:]' <"$TMP_DIR/execute-b.out")"
[[ -n "$RESULT_A" && -n "$RESULT_B" ]] || { echo 'FAIL: parallel executors did not both return a restriction id' >&2; exit 1; }
assert_equal "$RESULT_A" "$RESULT_B" "parallel executor retries converge on one restriction id"
assert_equal "$(query "select count(*) from public.moderation_restrictions where proposal_id='$PROPOSAL_ID'")" "1" "parallel execution creates exactly one restriction row"
assert_equal "$(query "select count(*) from public.audit_events where event_type='moderation_restriction_executed' and payload->>'proposal_id'='$PROPOSAL_ID'")" "1" "parallel execution creates exactly one durable execution audit"
assert_equal "$(query "select count(*) from public.moderation_case_events e join public.moderation_cases c on c.id=e.case_id join public.safety_reports r on r.id=c.source_report_id where r.description='wp070c parallel execution race' and e.event_type='status_transition' and e.from_status='investigating' and e.to_status='actioned'")" "1" "parallel execution records exactly one moderation action transition"
assert_equal "$(query "select c.status::text from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='wp070c parallel execution race'")" "actioned" "parallel execution leaves case in historical actioned state"
assert_equal "$(query "select c.version from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='wp070c parallel execution race'")" "3" "parallel execution increments moderation case version exactly once"
assert_equal "$(query "select status::text from public.safety_reports where description='wp070c parallel execution race'")" "actioned" "parallel execution marks source report actioned exactly once"
assert_equal "$(query "select publication_status::text from public.profiles where user_id='$SUBJECT'")" "published" "parallel restriction execution does not rewrite participant publication state"
assert_equal "$(query "select count(*) from public.blocks where blocker_user_id='$SUBJECT' or blocked_user_id='$SUBJECT'")" "0" "parallel restriction execution does not fabricate participant blocks"
assert_equal "$(query "select count(*) from auth.users where id='$SUBJECT'")" "1" "parallel restriction execution does not delete Auth account"

# Restore local test policy to repository default-off state before later seed/lint steps.
"${PSQL[@]}" -c "update public.moderation_enforcement_policies set active=false where policy_key='wp070c.synthetic.reversible';"
assert_equal "$(query "select count(*) from public.moderation_enforcement_policies where active")" "0" "local race test restores zero active enforcement policies"

# Remove the disposable race accounts so subsequent deterministic synthetic-seed
# checks observe the same pristine database cardinality as they did before
# WP-070C. Auth-user deletion cascades the synthetic profile and its moderation
# operational rows; retained audit evidence is not counted by the seed contract.
"${PSQL[@]}" -c "delete from auth.users where id in ('$REPORTER'::uuid, '$SUBJECT'::uuid);"
assert_equal "$(query "select count(*) from auth.users where id in ('$REPORTER'::uuid, '$SUBJECT'::uuid)")" "0" "WP-070C race removes disposable Auth fixtures"
assert_equal "$(query "select count(*) from public.profiles where user_id in ('$REPORTER'::uuid, '$SUBJECT'::uuid)")" "0" "WP-070C race removes disposable profile fixtures before seed"
assert_equal "$(query "select count(*) from public.moderation_restrictions where subject_user_id='$SUBJECT'::uuid")" "0" "WP-070C race removes disposable restriction fixture before seed"

echo 'WP-070C parallel reversible restriction execution race passed and restored the local database fixture baseline.'
