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

### Validation

- Backend foundation PR #17 merged as `8bbf1398`.
- Concurrency proof PR #19 merged as `5976ddea`.
- CI run `30581908986` passed for PR #20 implementation head `61bb93c6`.
- Validation run `30581908380` passed application/artifact checks, auth/onboarding client tests, retained Docker build, empty-database migration replay, 118 pgTAP assertions, true parallel race tests and schema lint.

### Completed since 0.3.0-alpha.1

- Merged product baseline PR #14 and marker-verified the hosted v1 pilot.
- Fixed the Hugging Face v1 marker contract in PR #15.
- Merged and hosted PR #16 with man/woman onboarding and derived opposite-sex discovery.
- Merged the server-authoritative backend foundation and database concurrency proof.

### Pending review and proof

- Desktop/mobile field review of the public pilot and camera/privacy portraits.
- Approved private non-production Supabase project and EU region.
- Real magic-link delivery, redirect and recovery tests.
- Actual private object upload, signed delivery and provider-API deletion cleanup.
- Private multi-user preview with controlled synthetic accounts.
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
