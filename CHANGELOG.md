# Changelog

All notable project changes are recorded here. The project uses pre-release semantic versions during the pilot.

## [Unreleased]

### Controlled two-account Cloudflare proof completed

- Completed WP-057 in issue #41 using two isolated browser profiles and two controlled synthetic adult accounts.
- Proved same-browser-profile Supabase PKCE magic-link exchange, callback consumption, session restoration, explicit global sign-out and re-authentication for both roles.
- Persisted and server-published one synthetic woman and one synthetic man profile.
- Proved opposite-sex discovery, reciprocal likes and exactly one shared match.
- Claimed one synthetic proof contact entitlement, opened one conversation and exchanged Realtime messages in both directions without refresh.
- Proved active-match private portrait access, private structured feedback and private safety reporting without public ratings or moderation disclosure.
- Proved normal contact ending and a separate block path.
- Added and used a participant-scoped server-authoritative revocation RPC proving the conversation closed, no new portrait access could be issued and new message writes were rejected.
- Removed the displayed matched portrait and disabled message controls after revocation confirmation.
- Completed authenticated provider cleanup for both proof accounts, including private portrait objects, Supabase Auth users and relational records while retaining anonymised audit evidence.
- Verified neither isolated browser profile restored a session after final cleanup and refresh.
- Added `docs/WP-057-COMPLETION.md` as the consolidated non-secret completion record.

### Account-cleanup defect repaired

- Observed the first account-A cleanup fail with a non-2xx Edge Function response while the account remained authenticated and retryable.
- Identified `conversations.opened_by_user_id -> auth.users(id) ON DELETE RESTRICT` as the blocker for deleting the account that opened the conversation.
- PR #52 changed the foreign key to `ON DELETE CASCADE`.
- Added a regression test covering an ended match, ended conversation and message while preserving the other participant.
- CI passed application/artifact checks, Docker, empty-database migration replay, pgTAP, concurrency, deterministic seed and schema lint.
- Protected staging run `30805876163` applied the migration, redeployed the cleanup function and passed remote health, anonymous rejection and browser-artifact validation.
- Retried cleanup successfully for account A and then account B.

### Governance advancement

- Marked WP-035 complete for controlled proof.
- Marked WP-050 complete for the controlled persistent-service slice.
- Marked WP-055 complete for the current backend proof scope.
- Marked WP-057 complete.
- Marked WP-058 complete for controlled provider cleanup.
- Added WP-065 for account recovery, duplicate-account resolution, abandonment retention and scheduled cleanup.
- Advanced the roadmap from browser-proof execution to lifecycle controls, integrated mobile review and closed-pilot readiness.
- Real-user admission remains unauthorized.

### Cloudflare Pages canonical staging

- Selected `https://rendezvue-private-preview.pages.dev/` as the sole canonical web-facing staging URL.
- Kept GitHub as the source of truth and Supabase as the Auth, PostgreSQL/RLS, private Storage, Realtime and Edge Function backend.
- Retired Hugging Face as an application host.
- Added Cloudflare-specific build metadata, security/no-store headers and protected Supabase configuration workflows.
- Added post-merge commit-matched production verification.
- Added fail-closed placeholder handling and a controlled production bootstrap from previously public validated browser configuration when native Pages variables are absent.

### Passwordless authentication provider correction

- Proved that Supabase free-tier projects using the default mail provider cannot customize the passwordless e-mail template for numeric `{{ .Token }}` delivery.
- Standardized on the default Supabase magic link with PKCE and the fixed Cloudflare redirect URL.
- Required each link to be requested and opened in the same isolated browser profile.
- Accepted only a one-time `?code=` callback and removed the consumed code from browser history.
- Disabled implicit access and refresh token URL fragments.

### Synthetic profile seed

- Added ten varied synthetic WebP portraits and ten canonical structured profile records.
- Added JSON, CSV, deterministic SQL and protected remote seed routes.
- Added explicit `is_synthetic` and `synthetic_id` markers.
- Created ten confirmed Auth-linked test users, ten published discovery profiles and ten selected private Storage portraits.

### Backend proof foundation

- Added versioned Supabase/PostgreSQL migrations, Row Level Security, least-privilege grants and private portrait-storage contracts.
- Added server-authoritative attraction signals, reciprocal matches, contact entitlements, conversations, messages, blocking, private feedback, safety reports, moderation cases and audit events.
- Added account-deletion cascades and retained audit-identifier anonymisation.
- Added fail-closed publication and opposite-sex discovery rules.
- Added true parallel race protection for simultaneous first likes and contact-opening requests.
- Added empty-database replay, pgTAP, race tests and schema lint.

### Auth and resumable onboarding contracts

- Added a provider-injectable passwordless/session adapter with normalization, redirect configuration, session restore, current-user lookup, auth-state subscription and sign-out.
- Added owner-derived stage persistence with strict field allowlists.
- Added versioned onboarding progress, prompts/interests and transactional personality save.
- Added owner-only sanitized onboarding snapshots.
- Added `publish_profile()` as the only server-side publication action.
- Added cross-account draft-isolation and publication-lifecycle tests.

### Private interaction and cleanup harness

- Added exactly one synthetic proof contact right per eligible published proof account.
- Prevented a second proof right after consumption.
- Added idempotent conversation opening and participant-only Realtime messages.
- Added participant-controlled contact ending and active-match-only private portrait access.
- Added private safety-report and structured-feedback controls without public ratings.
- Added authenticated Edge Function `delete-private-proof-account` with exact destructive confirmation and JWT-derived account identity.
- Deleted UUID-scoped object bytes before Auth deletion and returned only sanitized deletion status and object count.
- Added Deno type checking, CORS tests and unauthenticated HTTP 401 verification.

### Remaining gates

- Implement account recovery and duplicate-account controls.
- Approve abandonment retention and scheduled cleanup.
- Replace the transition Cloudflare bootstrap with direct Pages environment variables when operationally available.
- Integrate proof contracts into the polished Cloudflare product interface.
- Complete desktop/mobile camera and privacy-portrait review.
- Complete legal, DPIA, sensitive-data, age/liveness, accessibility, moderation, support and security readiness.
- Authorize a constrained real-user city pilot explicitly before admitting any real users.

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
