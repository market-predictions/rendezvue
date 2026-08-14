#!/usr/bin/env bash
set -euo pipefail

DB_URL="${SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
PSQL=(psql "$DB_URL" -X -v ON_ERROR_STOP=1 -qAt)
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

REPORTER="75000000-0000-0000-0000-000000000001"
SUBJECT="75000000-0000-0000-0000-000000000002"

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
  echo "psql client is required for WP-070D concurrency test" >&2
  exit 1
}

"${PSQL[@]}" <<SQL
insert into auth.users (
  instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at
) values
  ('00000000-0000-0000-0000-000000000000','$REPORTER','authenticated','authenticated','wp070d-race-reporter@rendezvue.test',crypt('race-a',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','$SUBJECT','authenticated','authenticated','wp070d-race-subject@rendezvue.test',crypt('race-b',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now());

update public.profiles
set nickname='WP070D race subject',sex='woman',city_region='Utrecht',
    relationship_intent='serious_relationship',publication_status='published',
    is_synthetic=true,synthetic_id='wp070d-race-subject'
where user_id='$SUBJECT';

insert into public.safety_reports (
  reporter_user_id,subject_user_id,category,description,severity,status
) values (
  '$REPORTER','$SUBJECT','harassment','wp070d parallel appeal review race','medium','open'
);

set local role service_role;
select public.claim_moderation_report(
  (select id from public.safety_reports where description='wp070d parallel appeal review race'),
  'operator:wp070d-race-proposer',null
);
select public.transition_moderation_case(
  (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='wp070d parallel appeal review race'),
  1,'triage','investigating','operator:wp070d-race-proposer',null,'prepare WP-070D race'
);
select public.propose_moderation_action(
  (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='wp070d parallel appeal review race'),
  2,'operator:wp070d-race-proposer','restrict_contact','wp070d_parallel_appeal'
);
select public.review_moderation_action_proposal(
  (select p.id from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='wp070d parallel appeal review race'),
  'operator:wp070d-race-original-reviewer','approved','wp070d_parallel_approved'
);
reset role;

update public.moderation_enforcement_policies
set active=true
where policy_key='wp070c.synthetic.reversible' and policy_version=1 and action_code='restrict_contact';

set local role service_role;
select public.execute_approved_moderation_restriction(
  (select p.id from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='wp070d parallel appeal review race'),
  'wp070c.synthetic.reversible',1,'operator:wp070d-race-executor'
);
reset role;
SQL

RESTRICTION_ID="$(query "select id from public.moderation_restrictions where subject_user_id='$SUBJECT'")"
[[ -n "$RESTRICTION_ID" ]] || { echo 'FAIL: WP-070D race restriction id missing' >&2; exit 1; }

"${PSQL[@]}" <<SQL
begin;
set local "request.jwt.claims"='{"sub":"$SUBJECT","role":"authenticated"}';
set local role authenticated;
select public.submit_moderation_appeal('$RESTRICTION_ID','context_missing','Parallel appeal review context.');
commit;
SQL

APPEAL_ID="$(query "select id from public.moderation_appeals where restriction_id='$RESTRICTION_ID'")"
[[ -n "$APPEAL_ID" ]] || { echo 'FAIL: WP-070D race appeal id missing' >&2; exit 1; }

cat >"$TMP_DIR/review-a.sql" <<SQL
begin;
set local statement_timeout='15s';
set local role service_role;
select pg_sleep(1);
select public.review_moderation_appeal('$APPEAL_ID','operator:wp070d-race-appeal-reviewer-a','upheld','parallel_review_a');
commit;
SQL

cat >"$TMP_DIR/review-b.sql" <<SQL
begin;
set local statement_timeout='15s';
set local role service_role;
select pg_sleep(1);
select public.review_moderation_appeal('$APPEAL_ID','operator:wp070d-race-appeal-reviewer-b','correction_recorded','parallel_review_b');
commit;
SQL

set +e
"${PSQL[@]}" -f "$TMP_DIR/review-a.sql" >"$TMP_DIR/review-a.out" 2>"$TMP_DIR/review-a.err" &
PID_A=$!
"${PSQL[@]}" -f "$TMP_DIR/review-b.sql" >"$TMP_DIR/review-b.out" 2>"$TMP_DIR/review-b.err" &
PID_B=$!
wait "$PID_A"; STATUS_A=$?
wait "$PID_B"; STATUS_B=$?
set -e

if [[ "$STATUS_A" -eq 0 && "$STATUS_B" -eq 0 ]]; then
  echo 'FAIL: both parallel appeal reviewers succeeded' >&2
  exit 1
fi
if [[ "$STATUS_A" -ne 0 && "$STATUS_B" -ne 0 ]]; then
  cat "$TMP_DIR/review-a.err" >&2 || true
  cat "$TMP_DIR/review-b.err" >&2 || true
  echo 'FAIL: neither parallel appeal reviewer succeeded' >&2
  exit 1
fi

LOSER_ERR="$TMP_DIR/review-a.err"
[[ "$STATUS_A" -eq 0 ]] && LOSER_ERR="$TMP_DIR/review-b.err"
grep -q 'moderation appeal already decided' "$LOSER_ERR" || {
  cat "$LOSER_ERR" >&2
  echo 'FAIL: losing reviewer did not fail closed as already decided' >&2
  exit 1
}

assert_equal "$(query "select count(*) from public.moderation_appeals where id='$APPEAL_ID' and status <> 'pending'")" "1" "parallel appeal review leaves exactly one terminal appeal"
assert_equal "$(query "select count(*) from public.audit_events where event_type='moderation_appeal_reviewed' and entity_id='$APPEAL_ID'")" "1" "parallel appeal review creates exactly one durable review audit event"
assert_equal "$(query "select count(*) from public.moderation_restrictions where id='$RESTRICTION_ID'")" "1" "appeal race does not create or delete restriction rows"
assert_equal "$(query "select c.status::text from public.moderation_cases c join public.moderation_restrictions mr on mr.case_id=c.id where mr.id='$RESTRICTION_ID'")" "actioned" "appeal race does not rewrite historical moderation case outcome"
assert_equal "$(query "select count(*) from auth.users where id='$SUBJECT'")" "1" "appeal race does not mutate Auth presence"

"${PSQL[@]}" -c "update public.moderation_enforcement_policies set active=false where policy_key='wp070c.synthetic.reversible';"
assert_equal "$(query "select count(*) from public.moderation_enforcement_policies where active")" "0" "WP-070D race restores default-off enforcement policy state"

"${PSQL[@]}" -c "delete from auth.users where id in ('$REPORTER'::uuid,'$SUBJECT'::uuid);"
assert_equal "$(query "select count(*) from auth.users where id in ('$REPORTER'::uuid,'$SUBJECT'::uuid)")" "0" "WP-070D race removes disposable Auth fixtures"
assert_equal "$(query "select count(*) from public.moderation_appeals where subject_user_id='$SUBJECT'::uuid")" "0" "WP-070D race removes disposable appeal fixture before seed"

echo 'WP-070D parallel independent appeal review race passed and restored the local database fixture baseline.'
