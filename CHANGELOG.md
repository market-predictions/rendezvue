# Changelog

All notable project changes are recorded here. The project uses pre-release semantic versions during the pilot.

## [Unreleased]

### Backend proof foundation

- Added versioned Supabase local configuration and PostgreSQL migrations for the server-authoritative domain model.
- Added separate account-linked records for profiles, eligibility, life stage, family context, faith profile, student verification and privacy portraits.
- Added attraction signals, normalized reciprocal matches, contact entitlements, idempotent conversation opening and participant-only messages.
- Added server-authoritative blocking that freezes the match/conversation and revokes attraction signals.
- Added controlled private-feedback and safety-report RPCs so clients cannot choose credibility weight, report status or moderation priority.
- Added automatic high-severity moderation-case creation and audit events.
- Added account-deletion cascade tests and anonymisation of retained audit identifiers.
- Added private privacy-portrait storage policies, one-selected-portrait enforcement and fail-closed publication lifecycle rules.
- Added opposite-sex and eligibility-aware discovery through a non-recursive security-definer predicate.
- Added explicit least-privilege table and function grants alongside Row Level Security.
- Added Realtime publication for matches and messages while retaining RLS as the access boundary.
- Added a browser-safe backend contract with `local-demo` as the public default.
- Added ADR-0008, `docs/BACKEND-PROOF.md` and updated requirements, architecture, data model, roadmap, work packages, claims and handover.
- Added a database CI job that starts a clean local stack, replays migrations, runs pgTAP and lints the schema.

### Backend proof validation

- Existing CI run `30579113688` passed.
- Validation run `30579113891` passed application/artifact checks, retained Docker build, empty-database start/reset, 90 pgTAP assertions and schema lint.
- Demonstrated two-account isolation for eligibility, family and faith records.
- Demonstrated hidden incoming likes, normalized reciprocal matching and retry-safe contact opening.
- Demonstrated participant-only messaging, private feedback/report visibility and high-severity moderation escalation.
- Demonstrated block enforcement across discovery, matching and messaging.
- Demonstrated relational account deletion and audit identifier anonymisation.

### Completed since 0.3.0-alpha.1

- Merged product baseline PR #14 and marker-verified the hosted v1 pilot.
- Fixed the v1 Hugging Face deployment marker contract in PR #15.
- Merged and hosted PR #16 to replace gender-identity/seeking questions with man/woman sex selection and derived opposite-sex discovery.

### Pending review and proof

- Desktop/mobile field review of the public pilot and camera/privacy portraits.
- True parallel race tests for reciprocal likes and contact-entitlement consumption.
- Actual private object upload, signed delivery and provider-API deletion cleanup.
- Private non-production backend provisioning and provider/region/privacy approval.
- Auth/session adapter, recovery and persistent onboarding integration.
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
- Added diverse student, graduate, employed and self-employed synthetic profiles, including divorced, widowed and parent profiles.
- Added direct likes, contextual likes and pointer swipe gestures with accessible button alternatives.
- Added deterministic reciprocal match, simulated contact entitlement, indicative regular/student pricing and local text chat.
- Added end-contact and structured private feedback without ranking effect.
- Integrated the privacy-filter grid directly in source and removed the fragile build-time patch architecture.
- Added data-model, onboarding, interaction/trust and pilot-protocol documentation plus ADR-0007.
- Added a pull-request validation workflow for application, generated artifacts and retained Docker builds.

### Validation

- Local `npm run check` passed with 44 required artifacts and 10/10 tests.
- Existing CI run `30475799061` passed application, artifact, Python helper and Docker validation.
- New validation run `30475799089` passed application/artifact and retained Docker jobs.

### Safety and claims

- Kept the repository synthetic-only and explicitly unsuitable for real-user admission.
- Added family-data minimisation and prohibited identifiable child data.
- Clarified that single status, student status and camera flow are not production verification.
- Kept payment, feedback ranking and enforcement non-operational in the concept pilot.

## [0.2.0-alpha.4] - 2026-07-28

### Changed

- Replaced the single imposed ink-sketch avatar with four selectable browser-local privacy portraits.
- Introduced a 2×2 selection grid before profile creation.
- Enforced a minimum blur/privacy floor; no raw or lightly edited selfie is available.
- Added Soft focus, Warm veil, Monochrome mist and Extra private recipes with a downsampling fallback.

## [0.2.0-alpha.3] - 2026-07-28

- Tested a stronger monochrome ink-sketch abstraction and recorded its privacy and aesthetic limitations.

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

- Switched from a paid Docker Space path to a free Static Space while retaining Docker CI validation.

## [0.1.0-alpha.2] - 2026-07-27

- Added automated Hugging Face Space creation and deployment polling.

## [0.1.0-alpha.1] - 2026-07-27

- Established GitHub authority, governance, a mobile PWA prototype, camera capture, discovery, matching, chat, safety controls and CI foundations.
