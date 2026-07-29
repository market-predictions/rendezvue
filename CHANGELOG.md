# Changelog

All notable project changes are recorded here. The project uses pre-release semantic versions during the pilot.

## [Unreleased]

### Pending validation

- Publish product baseline v1 branch, run CI and review the generated Hugging Face build on mobile.
- Select an external backend proof for persistent accounts, matching and realtime text chat.
- Complete legal, privacy, security and moderation gates before any real-user pilot.

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
