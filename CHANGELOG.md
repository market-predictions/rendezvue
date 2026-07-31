# Changelog

All notable project changes are recorded here. The project uses pre-release semantic versions during the pilot.

## [Unreleased]

### Backend proof foundation

- Added versioned Supabase/PostgreSQL migrations, Row Level Security, least-privilege grants and private portrait-storage contracts.
- Added server-authoritative attraction signals, reciprocal matches, contact entitlements, conversations, messages, blocking, private feedback, safety reports, moderation cases and audit events.
- Added account-deletion cascades and audit-identifier anonymisation.
- Added fail-closed publication and eligibility/opposite-sex discovery rules.
- Added true parallel race protection for simultaneous first likes and contact-opening requests.
- Added CI database startup, empty-database replay, pgTAP, race tests and schema lint.

### Auth and resumable onboarding contracts

- Added an injectable magic-link/session adapter with email normalization, session restore, current-user lookup, auth-state subscription and local sign-out.
- Added owner-derived stage persistence with strict per-domain field allowlists.
- Added versioned `onboarding_progress`.
- Added first-class `profile_prompts` and `profile_interests` records.
- Added transactional `save_profile_personality(...)`.
- Added owner-only `load_onboarding_snapshot()` that excludes evidence references and private portrait object paths.
- Added `publish_profile()` as the only server-side publication action.
- Publication now requires eligible single/adult/serious/community state, family context, a selected pending/verified privacy portrait, at least two prompts and at least three interests.
- Added cross-account draft-isolation and publication-lifecycle tests.
- Made database CI startup idempotent by removing a stale local stack before startup.

### Private Supabase proof lane

- Provisioned `RendezvueProject` in West EU (Ireland) on Nano compute as a non-production proof project.
- Added a separate `apps/private-preview` interface that is never copied into the public Hugging Face artifact.
- Added controlled magic-link/session, synthetic onboarding, private portrait upload, publication, discovery, like and match-inspection flows.
- Added a private artifact builder that embeds only the project URL, an `sb_publishable_...` key and the exact Auth redirect URL.
- Added syntax checks and a credential-boundary scan that rejects `sb_secret_...`, service-role material, database URLs, access tokens, database passwords and private keys.
- Added protected manual GitHub Actions deployment through environment `rendezvue-private-preview`.
- Added complete protected configuration diagnostics that report all missing values in one run.
- Replaced the unreliable direct `/rest/v1/` root probe with project Auth health plus supported Supabase Management API OpenAPI metadata validation.
- Protected workflow run #7 on commit `9403330f` successfully linked and applied repository migrations, passed remote Auth and Data API metadata checks, validated the browser/server credential boundary and uploaded one short-lived private proof artifact.
- Confirmed that the public Hugging Face pilot remained unchanged in `local-demo` and that real-user admission remained unauthorized.
- Advanced `docs/PRIVATE-SUPABASE-PREVIEW.md` to the controlled two-account proof protocol.

### Validation

- Backend foundation PR #17 merged as `8bbf1398`.
- Concurrency proof PR #19 merged as `5976ddea`.
- Auth/onboarding PR #20 merged as `1de81465`.
- Protected private proof lane PR #22 merged as `5a532629`.
- Configuration diagnostics PR #23 merged as `ecae0b48`.
- Supported health-check PR #24 merged as `9403330f`.
- Local validation continues to pass 118 pgTAP assertions, true parallel match/contact races, schema lint, client tests, app/artifact checks and Docker validation.
- Remote workflow run #7 completed successfully and generated one three-day private proof artifact.

### Completed since 0.3.0-alpha.1

- Merged product baseline PR #14 and marker-verified the hosted v1 pilot.
- Fixed the Hugging Face v1 marker contract in PR #15.
- Merged and hosted PR #16 with man/woman onboarding and derived opposite-sex discovery.
- Merged the server-authoritative backend foundation, concurrency proof and local auth/onboarding contracts.
- Provisioned and migrated the private EU Supabase proof project.
- Proved remote Auth/Data API availability and the browser/server credential boundary.

### Pending review and proof

- Desktop/mobile field review of the public pilot and camera/privacy portraits.
- Real magic-link delivery, callback and session recovery using two controlled synthetic accounts.
- Persistent two-account onboarding, publication, reciprocal discovery/likes and exactly one match.
- Actual private object access, signed delivery and provider-API deletion cleanup.
- Administrative synthetic contact-entitlement orchestration, realtime chat, block/report and end-contact proof.
- Legal, privacy, security and moderation gates before any real-user pilot.

## [0.3.0-alpha.1] - 2026-07-29

### Product rebaseline

- Replaced student-only eligibility with adult, single, serious-intent open membership.
- Retained students as a priority community with optional verification, Campus Mode, events and reduced contact pricing.
- Added life stage for students, recent graduates, employees, self-employed users, job seekers and others.
- Added marital history, children, child-count band, future child preference and openness to a partner with children.
- Made fuzzy browser-local privacy portraits the MVP baseline; AI portraits are no longer a dependency.
- Defined free discovery/likes plus paid conversation opening with free replies after contact is opened.
- Separated attraction signals, private experience feedback, safety reports and internal trust signals.
- Prohibited public stars, downvotes, popularity counts and one-review visibility penalties.

### Pilot implementation

- Rebuilt onboarding as a progressive ten-stage Dutch/English flow with versioned local resume.
- Added simulated private account creation and optional student verification.
- Added public-profile preview and community promise.
- Added diverse synthetic profiles, direct/contextual likes, swipes, deterministic match, simulated contact entitlement and local text chat.
- Added end-contact and private feedback without ranking effect.
- Integrated privacy portraits directly in source and added product/data/governance documentation.

### Validation

- Local `npm run check` passed with 44 required artifacts and 10/10 tests.
- CI runs `30475799061` and `30475799089` passed.

### Safety and claims

- Kept the repository synthetic-only and unsuitable for real-user admission.
- Prohibited identifiable child data and clarified that eligibility/student/camera claims are not production verification.
- Kept payment and reputation enforcement non-operational.

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

## [0.1.0-alpha.6] - 2026-07-27

- Replaced remote building with direct upload of a GitHub-built Static Space artifact.

## [0.1.0-alpha.5] - 2026-07-27

- Added automatic deployment status reporting.

## [0.1.0-alpha.4] - 2026-07-27

- Corrected Static Space public URL verification.

## [0.1.0-alpha.3] - 2026-07-27

- Switched to a free Static Space while retaining Docker CI validation.

## [0.1.0-alpha.2] - 2026-07-27

- Added automated Hugging Face Space creation and deployment polling.

## [0.1.0-alpha.1] - 2026-07-27

- Established GitHub authority, governance, mobile PWA prototype, camera capture, discovery, matching, chat, safety controls and CI foundations.
