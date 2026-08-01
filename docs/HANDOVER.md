# Project handover

**Updated:** 2026-08-01  
**Milestone:** Cloudflare Pages migration active; Supabase-connected two-account browser proof pending

## GitHub state

- Authority: `market-predictions/rendezvue` `main`.
- Cloudflare migration tracking and claim: issue #35.
- Canonical staging target: `https://rendezvue-private-preview.pages.dev/`.
- Supabase project: `RendezvueProject`, Healthy, West EU (Ireland), Nano.
- Ten Auth-linked synthetic profiles, ten published discovery profiles and ten selected private portraits are seeded.
- No owner-local Git, Node, Python, Docker or webserver is part of the operational workflow.
- Real-user admission is not authorized.

## Architecture decision

GitHub remains the sole source of truth. Cloudflare Pages becomes the only web-facing staging host. Supabase remains the Auth, PostgreSQL/RLS, private Storage, Realtime and Edge Function backend.

The former public and private Hugging Face Spaces are historical, non-canonical artifacts. Their deployment workflows and helper code are retired. No further functional acceptance testing is performed on Hugging Face.

See `docs/decisions/ADR-0008-cloudflare-pages-canonical-staging.md`.

## Implemented backend and browser harness

Implemented and validated:

- versioned Supabase/PostgreSQL migrations;
- RLS and least-privilege grants;
- private portrait storage;
- server-authoritative attraction, matching, contact entitlement, conversation, message, block, feedback and report operations;
- hidden moderation/audit domains and high-severity escalation;
- true parallel first-like and contact-opening race protection;
- e-mail OTP/session adapter and one shared browser Auth client;
- owner-scoped resumable onboarding, prompts/interests and sanitized snapshot;
- server-side profile publication and opposite-sex discovery;
- one-time synthetic proof entitlement that cannot be reissued after consumption;
- participant-controlled contact ending;
- active-match-only selected portrait access;
- Realtime conversation/message publication;
- authenticated Edge Function for UUID-scoped portrait deletion followed by Auth-account deletion;
- relational cascades and retained audit-ID anonymisation;
- exact destructive confirmation with no client-supplied user ID.

## Cloudflare build and deployment contract

Cloudflare Pages project: `rendezvue-private-preview`.

Expected production settings:

- production branch: `main`;
- build command: `npm run build:cloudflare`;
- output directory: `dist-private-preview`;
- variables: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`;
- fixed production URL: `https://rendezvue-private-preview.pages.dev/`.

The artifact contains only browser-safe configuration, a commit marker and explicit synthetic-only boundaries. `_headers` prevents framing, limits browser capabilities and marks runtime configuration and deployment metadata as `no-store`.

## Protected Supabase workflow

`.github/workflows/configure-cloudflare-staging.yml`:

1. validates protected GitHub environment secrets;
2. links and applies repository migrations;
3. deploys `delete-private-proof-account`;
4. configures Supabase Auth Site URL and allow-list to the fixed Pages URL;
5. configures the e-mail template to deliver `{{ .Token }}`;
6. checks Auth and Data API health;
7. verifies unauthenticated cleanup receives HTTP 401;
8. builds and validates the Cloudflare artifact;
9. records non-secret evidence in issue #35.

## Production Pages verification

`.github/workflows/verify-cloudflare-staging.yml` waits for Cloudflare production to serve a `deployment.json` whose `buildCommit` equals the merged `main` commit. It also checks:

- Cloudflare hosting marker and canonical URL;
- e-mail OTP interface;
- no Hugging Face runtime reference;
- no-store runtime configuration;
- `nosniff` and frame-denial headers;
- real-user admission remains false.

## Immediate next execution sequence

1. merge the Cloudflare migration after CI and Pages preview checks pass;
2. confirm the protected Supabase configuration workflow succeeds;
3. confirm the production Pages verification workflow matches the merge commit;
4. open the canonical Cloudflare staging URL in two isolated browser profiles;
5. use two controlled synthetic mailboxes;
6. prove e-mail OTP delivery, verification, session recovery and sign-out;
7. persist and publish one synthetic woman and one synthetic man profile;
8. prove cross-account draft/family/faith/object isolation;
9. prove opposite-sex discovery and reciprocal likes create exactly one match;
10. claim one contact right, open exactly one conversation and exchange realtime messages;
11. prove signed portrait delivery and access revocation after end-contact or block;
12. prove private feedback/reporting exposes no public rating or moderation case;
13. invoke authenticated cleanup for both accounts and verify objects, Auth users and relational rows are removed and retained audit identifiers are anonymised;
14. retain only non-secret evidence in issue #35.

## Explicit limitations

- a commit-matched Cloudflare production deployment is not claimed until the post-merge verifier succeeds;
- real e-mail OTP and session recovery are not yet proven on Cloudflare;
- the complete two-account remote journey has not yet been executed;
- authenticated remote cleanup and actual object deletion have not yet been observed;
- recovery and duplicate-account controls remain incomplete;
- no payments, operational moderation, Article 9 production basis or real-user authorization;
- the staging proof is restricted to controlled synthetic adult accounts.
