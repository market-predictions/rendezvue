# Project handover

**Updated:** 2026-08-01  
**Milestone:** Cloudflare Pages migration complete; controlled two-account browser proof active

## GitHub state

- Authority: `market-predictions/rendezvue` `main`.
- Completed Cloudflare migration evidence: issue #35.
- Active controlled browser-proof claim: issue #41 / WP-057.
- Canonical staging URL: `https://rendezvue-private-preview.pages.dev/`.
- Verified production commit: `c1632fc4c6d5a5d22f27c256fdf066e5d6710966`.
- Supabase project: `RendezvueProject`, Healthy, West EU (Ireland), Nano.
- Ten Auth-linked synthetic profiles, ten published discovery profiles and ten selected private portraits are seeded.
- No owner-local Git, Node, Python, Docker or webserver is part of the operational workflow.
- Real-user admission is not authorized.

## Architecture decision

GitHub is the sole source of truth. Cloudflare Pages is the only web-facing staging host. Supabase remains the Auth, PostgreSQL/RLS, private Storage, Realtime and Edge Function backend.

The former public and private Hugging Face Spaces are historical, non-canonical artifacts. Their deployment workflows and helper code are retired. No further functional acceptance testing is performed on Hugging Face.

See `docs/decisions/ADR-0008-cloudflare-pages-canonical-staging.md`.

## Passwordless provider constraint

Remote run `30698614914` proved:

- Supabase accepted the fixed Cloudflare Site URL and redirect allow-list;
- repository migrations were current;
- the cleanup Edge Function deployed;
- the free-tier/default-mail-provider combination rejected passwordless e-mail template modification with HTTP 400.

The canonical proof therefore uses the standard Supabase magic link with PKCE. The link must be requested and opened in the same isolated browser profile. The callback carries only a one-time `?code=`; after successful exchange the application removes that code from browser history. The implicit flow is disabled, so access and refresh tokens do not appear in URL fragments.

Numeric `{{ .Token }}` delivery remains unavailable until custom SMTP or a qualifying Supabase plan is configured.

## Implemented backend and browser harness

Implemented and validated:

- versioned Supabase/PostgreSQL migrations;
- RLS and least-privilege grants;
- private portrait storage;
- server-authoritative attraction, matching, contact entitlement, conversation, message, block, feedback and report operations;
- hidden moderation/audit domains and high-severity escalation;
- true parallel first-like and contact-opening race protection;
- PKCE magic-link/session adapter and one shared browser Auth client;
- canonical `emailRedirectTo` forwarding;
- consumed PKCE callback-code cleanup;
- implicit access/refresh token fragments disabled;
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

Production settings:

- production branch: `main`;
- build command: `npm run build:cloudflare`;
- output directory: `dist-private-preview`;
- browser configuration: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`;
- fixed production URL: `https://rendezvue-private-preview.pages.dev/`.

The artifact contains only browser-safe configuration, a commit marker and explicit synthetic-only boundaries. `_headers` prevents framing, limits browser capabilities and marks runtime configuration and deployment metadata as `no-store`.

Production verification run `30712250023` proved:

- merge commit `c1632fc4c6d5a5d22f27c256fdf066e5d6710966` is served;
- configuration mode is `remote-supabase`, not a placeholder;
- configuration source is the strictly validated `previous-canonical-deployment` transition path;
- PKCE magic-link metadata is active;
- implicit token fragments are disabled;
- security and no-store headers pass;
- no Hugging Face runtime dependency remains;
- real-user admission remains false.

Direct Cloudflare Pages environment variables remain the preferred steady-state source. The transition bootstrap accepts only a previously public HTTPS `.supabase.co` URL and `sb_publishable_` browser key and rejects placeholders, secret keys, partial configuration and malformed content.

## Protected Supabase workflow

`.github/workflows/configure-cloudflare-staging.yml`:

1. validates protected GitHub environment secrets;
2. links and applies repository migrations;
3. deploys `delete-private-proof-account`;
4. configures Supabase Auth Site URL and allow-list to the fixed Pages URL;
5. verifies the final URL configuration;
6. checks Auth and Data API health;
7. verifies unauthenticated cleanup receives HTTP 401;
8. builds and validates the Cloudflare PKCE artifact;
9. records non-secret evidence in issue #35.

Protected run `30699577670` completed these checks successfully. It deliberately does not modify the passwordless e-mail template because that operation is unavailable with the current provider/plan.

## Production Pages verification

`.github/workflows/verify-cloudflare-staging.yml` verifies:

- commit-matched production deployment metadata;
- remote browser-safe Supabase configuration and an approved configuration source;
- Cloudflare hosting marker and canonical URL;
- PKCE magic-link interface and declared auth flow;
- implicit token fragments disabled;
- no Hugging Face runtime reference;
- no-store runtime configuration;
- `nosniff` and frame-denial headers;
- real-user admission remains false.

WP-038 and WP-039 are complete. WP-057 is the active work package.

## Immediate next execution sequence — WP-057

1. open the canonical Cloudflare staging URL in two isolated browser profiles;
2. use two controlled synthetic mailboxes;
3. request and open each newest magic link in the same corresponding browser profile;
4. prove PKCE code exchange, consumed-code removal, session recovery and global sign-out;
5. persist and publish one synthetic woman and one synthetic man profile;
6. prove cross-account draft/family/faith/object isolation;
7. prove opposite-sex discovery and reciprocal likes create exactly one match;
8. claim one contact right, open exactly one conversation and exchange realtime messages;
9. prove signed portrait delivery and access revocation after end-contact or block;
10. prove private feedback/reporting exposes no public rating or moderation case;
11. invoke authenticated cleanup for both accounts;
12. verify private objects, Auth users and relational rows are removed and retained audit identifiers are anonymised;
13. retain only non-secret evidence in issue #41.

## Explicit limitations

- real PKCE magic-link exchange and session recovery are not yet proven through controlled user browsers;
- the complete two-account remote journey has not yet been executed;
- authenticated remote cleanup and actual object deletion have not yet been observed;
- recovery and duplicate-account controls remain incomplete;
- custom SMTP and numeric OTP are not configured;
- direct Cloudflare Pages environment variables should replace the transition bootstrap when operationally available;
- no payments, operational moderation, Article 9 production basis or real-user authorization;
- the staging proof is restricted to controlled synthetic adult accounts.
