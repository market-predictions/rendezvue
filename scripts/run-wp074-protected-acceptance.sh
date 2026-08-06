#!/usr/bin/env bash
set -euo pipefail

: "${SUPABASE_ACCESS_TOKEN:?SUPABASE_ACCESS_TOKEN is required}"
: "${SUPABASE_PROJECT_REF:?SUPABASE_PROJECT_REF is required}"
: "${SUPABASE_DB_PASSWORD:?SUPABASE_DB_PASSWORD is required}"
: "${SUPABASE_URL:?SUPABASE_URL is required}"
: "${SUPABASE_PUBLISHABLE_KEY:?SUPABASE_PUBLISHABLE_KEY is required}"
: "${GITHUB_SHA:?GITHUB_SHA is required}"
: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${GITHUB_RUN_ID:?GITHUB_RUN_ID is required}"

STAGING_URL="${STAGING_URL:-https://rendezvue-private-preview.pages.dev/}"
RUN_URL="https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"

if [[ "$SUPABASE_PUBLISHABLE_KEY" != sb_publishable_* ]]; then
  echo 'Expected an sb_publishable_ browser key.' >&2
  exit 1
fi

cleanup() {
  local status=$?
  supabase stop --no-backup >/dev/null 2>&1 || true
  if [[ $status -ne 0 && -n "${GH_TOKEN:-}" ]]; then
    gh issue comment 106 --repo "$GITHUB_REPOSITORY" \
      --body "WP-074 protected acceptance failed: ${RUN_URL}. No live-completion claim is authorized." || true
  fi
  exit "$status"
}
trap cleanup EXIT

python -m pip install 'Pillow==11.3.0'
python scripts/generate-synthetic-portraits.py
npm ci
npm run check
npm run check:cloudflare
node scripts/validate-wp074-privacy-portrait-filters.mjs
deno check --node-modules-dir=auto supabase/functions/delete-private-proof-account/index.ts

supabase stop --no-backup || true
supabase start
supabase db reset
supabase test db
bash supabase/tests/concurrency/run.sh

db_container="$(docker ps --filter 'name=supabase_db_' --format '{{.Names}}' | head -n 1)"
[[ -n "$db_container" ]] || { echo 'No local Supabase database container found.' >&2; exit 1; }
docker exec "$db_container" rm -rf /tmp/synthetic-seed
docker cp synthetic-seed "$db_container:/tmp/synthetic-seed"
docker exec -w /tmp "$db_container" \
  psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f synthetic-seed/seed.sql
counts="$(docker exec "$db_container" psql -U postgres -d postgres -Atc \
  "select concat_ws('|',
    (select count(*) from public.profiles where is_synthetic),
    (select count(*) from public.profiles where is_synthetic and publication_status='published'),
    (select count(*) from public.profile_interests pi join public.profiles p on p.user_id=pi.user_id where p.is_synthetic),
    (select count(*) from public.profile_prompts pp join public.profiles p on p.user_id=pp.user_id where p.is_synthetic),
    (select count(*) from public.privacy_portraits pp join public.profiles p on p.user_id=pp.user_id where p.is_synthetic and pp.is_public_profile_portrait)
  );")"
[[ "$counts" == '10|10|50|20|10' ]] || { echo "Unexpected synthetic seed counts: $counts" >&2; exit 1; }
supabase db lint --local --level warning

docker build --tag rendezvue-wp074-acceptance .

supabase link --project-ref "$SUPABASE_PROJECT_REF"
supabase migration list --linked
supabase db push
supabase migration list --linked

npm run check:cloudflare

metadata="$RUNNER_TEMP/deployment.json"
matched=false
for attempt in {1..90}; do
  status="$(curl --silent --show-error --location \
    --output "$metadata" --write-out '%{http_code}' \
    --header 'cache-control: no-cache' \
    "${STAGING_URL}deployment.json?commit=${GITHUB_SHA}&attempt=${attempt}" || true)"
  if [[ "$status" == '200' ]] && node --input-type=module --eval "
    import { readFileSync } from 'node:fs';
    const document = JSON.parse(readFileSync(process.argv[1], 'utf8'));
    if (document.buildCommit !== process.argv[2]) process.exit(1);
    if (document.hostingPlatform !== 'cloudflare-pages') process.exit(1);
    if (document.remoteBackendConfigured !== true) process.exit(1);
    if (document.realUserAdmissionAuthorized !== false) process.exit(1);
  " "$metadata" "$GITHUB_SHA"; then
    matched=true
    break
  fi
  echo "Waiting for commit-matched WP-074 delivery (attempt $attempt, HTTP $status)."
  sleep 10
done
[[ "$matched" == true ]] || { echo 'Canonical WP-074 delivery did not converge.' >&2; exit 1; }

for route in privacy-portrait-loader.js privacy-portrait-controller.js privacy-portrait-filters.js privacy-portrait-filters.css; do
  target="$RUNNER_TEMP/$route"
  status="$(curl --silent --show-error --location \
    --output "$target" --write-out '%{http_code}' \
    --header 'cache-control: no-cache' \
    "${STAGING_URL}${route}?commit=${GITHUB_SHA}" || true)"
  [[ "$status" == 200 ]] || { echo "$route returned HTTP $status" >&2; exit 1; }
done

grep --fixed-strings --quiet "document.querySelector('#rv-portrait-form')" "$RUNNER_TEMP/privacy-portrait-loader.js"
grep --fixed-strings --quiet 'cloneNode(true)' "$RUNNER_TEMP/privacy-portrait-loader.js"
grep --fixed-strings --quiet "BOUNDARY = 'wp074-privacy-portrait-filters'" "$RUNNER_TEMP/privacy-portrait-controller.js"
grep --fixed-strings --quiet 'mandatoryFilterSelection: true' "$RUNNER_TEMP/privacy-portrait-controller.js"
grep --fixed-strings --quiet 'publicRawPortraitAllowed: false' "$RUNNER_TEMP/privacy-portrait-controller.js"
grep --fixed-strings --quiet 'selectedFilterId = null' "$RUNNER_TEMP/privacy-portrait-controller.js"
grep --fixed-strings --quiet 'p_privacy_filter_id: output.filterId' "$RUNNER_TEMP/privacy-portrait-controller.js"
! grep --extended-regexp --quiet "selectedFilterId[[:space:]]*=[[:space:]]*['\"](softFocus|warmVeil|monoMist|privacyMax)" "$RUNNER_TEMP/privacy-portrait-controller.js"
for id in softFocus warmVeil monoMist privacyMax; do
  grep --fixed-strings --quiet "id: '$id'" "$RUNNER_TEMP/privacy-portrait-filters.js"
done
! grep --extended-regexp --quiet "id:[[:space:]]*['\"](raw|none|original)" "$RUNNER_TEMP/privacy-portrait-filters.js"
grep --fixed-strings --quiet '.rv-privacy-filter-option.selected' "$RUNNER_TEMP/privacy-portrait-filters.css"
grep --fixed-strings --quiet '.rv-privacy-filter-recommended' "$RUNNER_TEMP/privacy-portrait-filters.css"

gh issue comment 106 --repo "$GITHUB_REPOSITORY" --body-file - <<EOF
## WP-074 protected acceptance passed

- accepted commit: \`$GITHUB_SHA\`
- product implementation ancestor: \`82b07bb7f69d14071706deb61a9cdb8a69fc9eab\`
- acceptance workflow: $RUN_URL
- application, Cloudflare artifact and WP-074 contract: passed
- empty-database migration replay and pgTAP: passed
- parallel match and entitlement races: passed
- deterministic ten-profile seed and schema lint: passed
- retained Docker build: passed
- protected staging migration: applied
- canonical loader, controller, four bounded filters and CSS selection states: delivered and verified
- raw/original/none public option: absent
- real-user admission: not authorized
EOF
