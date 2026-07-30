#!/usr/bin/env bash
set -euo pipefail

DB_URL="${SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
PSQL=(psql "$DB_URL" -X -v ON_ERROR_STOP=1 -qAt)
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

USER_A="00000000-0000-0000-0000-0000000000e1"
USER_B="00000000-0000-0000-0000-0000000000f2"

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
  echo "psql client is required for concurrency tests" >&2
  exit 1
}

"${PSQL[@]}" <<SQL
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '$USER_A', 'authenticated', 'authenticated', 'race-a@rendezvue.test', crypt('race-password-a', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"nickname":"Race A"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '$USER_B', 'authenticated', 'authenticated', 'race-b@rendezvue.test', crypt('race-password-b', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"nickname":"Race B"}', now(), now());

update public.profiles
set nickname = 'Race A', sex = 'woman', city_region = 'Rotterdam',
    relationship_intent = 'marriage', publication_status = 'published', published_at = now()
where user_id = '$USER_A';

update public.profiles
set nickname = 'Race B', sex = 'man', city_region = 'Rotterdam',
    relationship_intent = 'marriage', publication_status = 'published', published_at = now()
where user_id = '$USER_B';

insert into public.eligibility (
  user_id, current_relationship_state, adult_confirmed,
  serious_intent_confirmed, community_fit_confirmed
) values
  ('$USER_A', 'single', true, true, true),
  ('$USER_B', 'single', true, true, true);
SQL

cat >"$TMP_DIR/like-a.sql" <<SQL
begin;
set local statement_timeout = '15s';
set local "request.jwt.claims" = '{"sub":"$USER_A","role":"authenticated"}';
set local role authenticated;
select pg_sleep(1);
select resulting_match_id from public.record_attraction_signal('$USER_B', 'like', null, null);
commit;
SQL

cat >"$TMP_DIR/like-b.sql" <<SQL
begin;
set local statement_timeout = '15s';
set local "request.jwt.claims" = '{"sub":"$USER_B","role":"authenticated"}';
set local role authenticated;
select pg_sleep(1);
select resulting_match_id from public.record_attraction_signal('$USER_A', 'like', null, null);
commit;
SQL

"${PSQL[@]}" -f "$TMP_DIR/like-a.sql" >"$TMP_DIR/like-a.out" 2>"$TMP_DIR/like-a.err" &
PID_A=$!
"${PSQL[@]}" -f "$TMP_DIR/like-b.sql" >"$TMP_DIR/like-b.out" 2>"$TMP_DIR/like-b.err" &
PID_B=$!
wait "$PID_A" || { cat "$TMP_DIR/like-a.err" >&2; exit 1; }
wait "$PID_B" || { cat "$TMP_DIR/like-b.err" >&2; exit 1; }

assert_equal "$(query "select count(*) from public.attraction_signals where actor_user_id in ('$USER_A', '$USER_B')")" "2" "parallel likes persist both attraction signals"
assert_equal "$(query "select count(*) from public.matches where user_a_id = least('$USER_A'::uuid, '$USER_B'::uuid) and user_b_id = greatest('$USER_A'::uuid, '$USER_B'::uuid)")" "1" "parallel first likes create exactly one reciprocal match"

MATCH_ID="$(query "select id from public.matches where user_a_id = least('$USER_A'::uuid, '$USER_B'::uuid) and user_b_id = greatest('$USER_A'::uuid, '$USER_B'::uuid)")"
[[ -n "$MATCH_ID" ]] || { echo "FAIL: match id missing after parallel likes" >&2; exit 1; }

"${PSQL[@]}" <<SQL
insert into public.contact_entitlements (owner_user_id, source_type, status)
values
  ('$USER_A', 'pilot', 'available'),
  ('$USER_A', 'pilot', 'available');
SQL

cat >"$TMP_DIR/contact-1.sql" <<SQL
begin;
set local statement_timeout = '15s';
set local "request.jwt.claims" = '{"sub":"$USER_A","role":"authenticated"}';
set local role authenticated;
select pg_sleep(1);
select public.open_match_conversation('$MATCH_ID', 'parallel-contact-1');
commit;
SQL

cat >"$TMP_DIR/contact-2.sql" <<SQL
begin;
set local statement_timeout = '15s';
set local "request.jwt.claims" = '{"sub":"$USER_A","role":"authenticated"}';
set local role authenticated;
select pg_sleep(1);
select public.open_match_conversation('$MATCH_ID', 'parallel-contact-2');
commit;
SQL

"${PSQL[@]}" -f "$TMP_DIR/contact-1.sql" >"$TMP_DIR/contact-1.out" 2>"$TMP_DIR/contact-1.err" &
PID_1=$!
"${PSQL[@]}" -f "$TMP_DIR/contact-2.sql" >"$TMP_DIR/contact-2.out" 2>"$TMP_DIR/contact-2.err" &
PID_2=$!
wait "$PID_1" || { cat "$TMP_DIR/contact-1.err" >&2; exit 1; }
wait "$PID_2" || { cat "$TMP_DIR/contact-2.err" >&2; exit 1; }

assert_equal "$(query "select count(*) from public.conversations where match_id = '$MATCH_ID'")" "1" "parallel contact opens create exactly one conversation"
assert_equal "$(query "select count(*) from public.contact_entitlements where owner_user_id = '$USER_A' and status = 'consumed'")" "1" "parallel contact opens consume exactly one entitlement"
assert_equal "$(query "select count(*) from public.contact_entitlements where owner_user_id = '$USER_A' and status = 'available'")" "1" "second entitlement remains available after retry race"

CONVERSATION_1="$(grep -Eo '[0-9a-f]{8}-[0-9a-f-]{27,}' "$TMP_DIR/contact-1.out" | tail -n 1)"
CONVERSATION_2="$(grep -Eo '[0-9a-f]{8}-[0-9a-f-]{27,}' "$TMP_DIR/contact-2.out" | tail -n 1)"
assert_equal "$CONVERSATION_1" "$CONVERSATION_2" "parallel callers receive the same conversation id"

echo "All backend concurrency tests passed."
