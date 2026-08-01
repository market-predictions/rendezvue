# Changelog

All notable project changes are recorded here. The project uses pre-release semantic versions during the pilot.

## [Unreleased]

### Cloudflare Pages canonical staging

- Accepted issue #35 and defined WP-038, WP-039 and WP-059 for the hosting transition.
- Selected `https://rendezvue-private-preview.pages.dev/` as the sole canonical web-facing staging URL.
- Kept GitHub as the source of truth and Supabase as the Auth, PostgreSQL/RLS, private Storage, Realtime and Edge Function backend.
- Reclassified the historical public and private Hugging Face Spaces as non-canonical artifacts and stopped further functional acceptance work there.
- Added a Cloudflare-specific static artifact contract with commit metadata, browser-safe Supabase configuration and Pages security headers.
- Added a protected staging workflow to apply migrations, deploy account cleanup, configure the Supabase Auth Site URL/allow-list for Cloudflare and validate remote platform health.
- Added a post-merge Pages verification workflow that waits for a production artifact whose `deployment.json` matches the merged commit.
- Removed active Hugging Face deployment and deployment-evidence workflows and retired their helper code.
- Rebased the roadmap, work packages, work claims, architecture, handover and private proof protocol on Cloudflare Pages.
- Added fail-closed placeholder handling for branch previews and a controlled production bootstrap that can reuse only previously public, strictly validated browser configuration.
- Verified production merge commit `c1632fc4c6d5a5d22f27c256fdf066e5d6710966` with `remote-supabase` configuration, approved configuration source, PKCE auth flow, no-store/security headers and no Hugging Face runtime dependency.
- Marked WP-038 and WP-039 complete and transferred active work to WP-057 in issue #41.

### Passwordless authentication provider correction

- Remote execution proved that Supabase free-tier projects using the default mail provider cannot customize the passwordless e-mail template; numeric `{{ .Token }}` delivery requires custom SMTP or a qualifying plan.
- Removed the unavailable numeric e-mail OTP interface, verification module and template-configuration workflow step.
- Restored the default-provider magic link with Supabase PKCE and the fixed Cloudflare `emailRedirectTo` URL.
- Required the magic link to be requested and opened in the same isolated browser profile so the local PKCE verifier is available.
- Accepted only a one-time `?code=` callback and removed the consumed code from browser history after successful session exchange.
- Disabled the implicit flow so access and refresh tokens never appear in URL fragments.
- Retained global proof sign-out to revoke all refresh sessions for the proof account.

### Synthetic profile seed

- Added ten standalone, varied synthetic WebP portraits and ten canonical structured profile records.
- Added JSON, CSV, deterministic SQL and protected remote seed routes.
- Added explicit `is_synthetic` and `synthetic_id` database markers.
- Created ten confirmed Auth-linked test users, published ten discovery profiles and selected ten private Storage portraits.

### Backend proof foundation

- Added versioned Supabase/PostgreSQL migrations, Row Level Security, least-privilege grants and private portrait-storage contracts.
- Added server-authoritative attraction signals, reciprocal matches, contact entitlements, conversations, messages, blocking, private feedback, safety reports, moderation cases and audit events.
- Added account-deletion cascades and retained audit-identifier anonymisation.
- Added fail-closed publication and eligibility/opposite-sex discovery rules.
- Added true parallel race protection for simultaneous first likes and contact-opening requests.
- Added empty-database replay, pgTAP, race tests and schema lint.

### Auth and resumable onboarding contracts

- Added a provider-injectable passwordless/session adapter with email normalization, redirect configuration, session restore, current-user lookup, auth-state subscription and sign-out.
- Added owner-derived stage persistence with strict per-domain field allowlists.
- Added versioned `onboarding_progress`, first-class prompts/interests and transactional personality save.
- Added owner-only sanitized onboarding snapshots.
- Added `publish_profile()` as the only server-side publication action.
- Publication requires eligible single/adult/serious/community state, family context, a selected privacy portrait, at least two prompts and at least three interests.
- Added cross-account draft-isolation and publication-lifecycle tests.

### Supabase proof lane

- Provisioned non-production `RendezvueProject` in West EU (Ireland) on Nano compute.
- Added a separate `apps/private-preview` interface connected to Supabase using only browser-safe configuration.
- Added protected GitHub Actions deployment through environment `rendezvue-private-preview`.
- Added recursive credential scanning for secret/service-role material, database URLs, access tokens, passwords and private keys.
- Added project Auth health and supported Data API metadata validation.
- Added one shared browser Supabase client for authentication, onboarding, interaction and cleanup.
- Added authenticated provider-orchestrated account cleanup and unauthenticated HTTP 401 verification.

### Private interaction harness

- Added `claim_private_proof_entitlement()` for exactly one synthetic proof contact right per eligible published proof account.
- Prevented a second proof right after consumption.
- Added idempotent conversation opening and participant-only Realtime messages.
- Added `end_match_contact(...)` to close match/conversation state and revoke both attraction signals.
- Added active-match-only portrait-path access and five-minute signed matched-portrait delivery.
- Stopped portrait and message access after contact ending or blocking.
- Added private safety-report and structured-feedback controls without public ratings.

### Provider-orchestrated account cleanup

- Added authenticated Edge Function `delete-private-proof-account`.
- Requires exact confirmation `DELETE_SYNTHETIC_ACCOUNT` and derives the account ID only from the authenticated JWT.
- Lists only private portrait objects below the caller's UUID prefix.
- Deletes object bytes before deleting the Auth account so storage failure leaves the account intact and retryable.
- Uses existing foreign-key cascades and audit anonymisation after Auth deletion.
- Returns only deletion status and object count; paths and credentials are never returned.
- Added Deno type checking and Edge Runtime tests for CORS and unauthenticated HTTP 401.

### Historical validation and remote evidence

- Backend foundation PR #17 merged as `8bbf1398`.
- Concurrency proof PR #19 merged as `5976ddea`.
- Auth/onboarding PR #20 merged as `1de81465`.
- Protected private proof lane PR #22 merged as `5a532629`.
- Supported health-check PR #24 merged as `9403330f`.
- Contact/chat/safety harness PR #25 merged as `11964e91`.
- Provider cleanup PR #26 merged as `8400ebc7`.
- Historical private Hugging Face architecture PR #29 merged as `37420b21`.
- Synthetic seed PR #32 merged as `e058696b` and remote seed execution reported 10 Auth-linked profiles, 10 published profiles and 10 selected portraits.
- Hosted callback experiments PR #33 and OTP experiment PR #34 documented the Hugging Face gateway and free-tier provider constraints; neither authentication route remains canonical.
- Cloudflare canonical staging PR #36 merged as `fad220bc`.
- Fail-closed migration evidence PR #37 merged as `d5947cc3`.
- Cloudflare verifier/Auth deployment repair PR #38 merged as `544022a8`.
- Free-tier PKCE correction PR #39 merged as `5f43022a`.
- Production bootstrap PR #40 merged as `c1632fc4`.
- Protected run `30699577670` proved the canonical Cloudflare Site URL and allow-list, migrations, remote health, cleanup deployment, anonymous rejection and browser credential boundary.
- Production verification run `30712250023` proved the fixed Pages URL served commit `c1632fc4`, real browser-safe Supabase configuration, PKCE auth metadata, security/no-store headers and no Hugging Face runtime dependency.
- CI validates application artifacts, browser/server credential separation, Deno type checking, Edge Runtime/CORS/auth gates, Docker, clean migration replay, pgTAP assertions, true parallel match/contact races and schema lint.
- Real-user admission remains unauthorized.

### Pending review and proof

- Execute WP-057 under issue #41 using two isolated controlled synthetic browser profiles.
- Execute same-browser-profile magic-link callback exchange, consumed-code removal, session recovery and global sign-out using two controlled synthetic accounts.
- Execute persistent two-account onboarding, publication, reciprocal discovery/likes and exactly one match.
- Execute remote one-time entitlement, realtime chat, signed portrait, end-contact, block/report and private feedback.
- Execute authenticated deletion of private objects and both proof accounts, including relational cascades and retained audit anonymisation.
- Complete desktop/mobile field review and camera/privacy portrait review in the eventual integrated Cloudflare application.
- Complete legal, privacy, security and moderation gates before any real-user pilot.

## [0.3.0-alpha.1] - 2026-07-29

### Product rebaseline

- Replaced student-only eligibility with adult, single, serious-intent open membership.
- Retained students as a priority community with optional verification, Campus Mode, events and reduced contact pricing.
- Added life stage, marital history, children, child preference and openness to a partner with children.
- Made fuzzy browser-local privacy portraits the MVP baseline; AI portraits are no longer a dependency.
- Defined free discovery/likes plus paid conversation opening with free replies after contact is opened.
- Separated attraction signals, private experience feedback, safety reports and internal trust signals.
- Prohibited public stars, downvotes, popularity counts and one-review visibility penalties.

### Pilot implementation

- Rebuilt onboarding as a progressive Dutch/English flow with versioned local resume.
- Added simulated private account creation and optional student verification.
- Added profile preview, community promise, diverse synthetic profiles, direct/contextual likes, swipes, deterministic match, simulated contact entitlement and local text chat.
- Added end-contact and private feedback without ranking effect.

## [0.2.0-alpha.4] - 2026-07-28

- Replaced the single imposed avatar with four selectable browser-local privacy portraits.
- Added a 2×2 selection grid and minimum privacy floor.

## [0.2.0-alpha.3] - 2026-07-28

- Tested a stronger monochrome ink-sketch abstraction.

## [0.2.0-alpha.2] - 2026-07-28

- Published and marker-verified the Netherlands-first MBO/HBO/WO pilot.

## [0.2.0-alpha.1] - 2026-07-28

- Pivoted from Morocco to the Netherlands.
- Added Dutch default/English switch, MBO/HBO/WO fixtures and descriptive faith/lifestyle fields.
- Prohibited piety scoring, inferred religion and advertising use of faith data.

## [0.1.0-alpha.7] - 2026-07-27

- Published the first verified hosted prototype.

## [0.1.0-alpha.1] - 2026-07-27

- Established GitHub authority, governance, mobile PWA prototype, camera capture, discovery, matching, chat, safety controls and CI foundations.
