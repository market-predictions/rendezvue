# Rendezvue roadmap

**Version:** 1.1  
**Updated:** 2026-07-30

## Operating doctrine

- GitHub is authoritative; Hugging Face is a generated web-facing pilot.
- Rendezvue is open-membership, adult-only and serious-intent, with a student-first community layer.
- Local marketplace density and safe interaction are validated before national expansion.
- Privacy portraits are implementation-neutral; fuzzy browser portraits are the MVP baseline.
- Safety, fairness, privacy and legal controls are product features.
- The public concept pilot remains synthetic until a private backend, moderation and legal gates are approved.

## Phase 0 — Foundation and hosting

**Status:** complete.

Delivered: governance, dependency-light PWA, CI, Static Space deployment, Docker fallback and hosted marker verification.

## Phase 1 — Concept and interaction validation

### 1A. Core dating loop

**Status:** complete.

Camera demonstration, profile, discovery, contextual like, deterministic match, local chat, report, block and PWA shell.

### 1B. Netherlands and faith model

**Status:** implementation complete; representative terminology review remains.

Dutch/English, MBO/HBO/WO fixtures, descriptive faith fields and private practice visibility.

### 1C. Selectable privacy portraits

**Status:** implementation and hosted deployment complete; mobile owner review remains.

Four browser-local fuzzy variants, no raw-selfie option and downsampling fallback.

### 1D. Product baseline v1 and onboarding redefinition

**Status:** complete and hosted.

Delivered:

- student-first rather than student-only positioning;
- eligibility and private-account simulation;
- resumable local onboarding;
- life stage and optional student verification;
- marital history, children, child wish and openness to a partner with children;
- privacy portrait terminology and integrated filter grid;
- profile preview and community promise;
- synthetic profiles across student, graduate, employed and self-employed life stages;
- binary sex selection for this community with opposite-sex discovery derived automatically.

### 1E. Interaction, contact and feedback concept

**Status:** complete and hosted; field review remains.

Delivered:

- pass, direct like and contextual like;
- left/right swipe gestures plus accessible buttons;
- reciprocal pilot match;
- simulated contact entitlement and indicative regular/student pricing;
- text conversation;
- end-contact flow and structured private feedback;
- no public ratings and no automatic feedback-based visibility penalty.

**Remaining Phase-1 gate:** desktop/mobile field review, mobile camera/privacy-portrait review, swipe/chat review, terminology review and logging of material defects in issue #2.

## Phase 2 — External backend proof

**Status:** active.

### 2A. Backend foundation and migration contract

**Status:** implementation and independent CI complete in PR #17; merge review.

Delivered:

- Supabase local configuration under version control;
- PostgreSQL migrations for account, profile, eligibility, life stage, family, faith, student verification and privacy portrait domains;
- server-authoritative attraction signals, reciprocal matches, contact entitlements, conversations and messages;
- server-authoritative block, feedback and safety-report operations;
- moderation cases, audit events and account-deletion anonymisation;
- private portrait storage and Row Level Security;
- fail-closed publication and opposite-sex discovery eligibility;
- explicit table and function privileges;
- browser-safe backend adapter contract while the public build stays in `local-demo` mode.

Validation evidence on head `596f4546`:

- existing CI run `30579113688`: success;
- validation run `30579113891`: success;
- clean local database start and migration replay: success;
- 90 pgTAP assertions across structure, two-account authorization, function privileges and deletion: success;
- schema lint, application/artifact checks and retained Docker build: success.

### 2B. Local schema and authorization proof

**Status:** substantial proof complete; adversarial concurrency and storage cleanup remain.

Demonstrated:

- migrations replay from an empty local database;
- cross-account isolation for eligibility, family and faith records;
- incoming likes remain hidden from their target;
- reciprocal calls create one normalized match under repeated retries;
- one entitlement creates one conversation idempotently;
- only conversation participants can read messages;
- private feedback and reports are hidden from their subject;
- high-severity reports create an inaccessible moderation case;
- blocking freezes match and conversation, revokes signals and prevents further messaging;
- account deletion cascades owned relational records and anonymises retained audit identifiers.

Still required in issue #18:

- true parallel/concurrent race tests rather than sequential retry tests;
- actual private object upload and provider-API deletion cleanup;
- negative publication-lifecycle tests through the client role;
- controlled private preview evidence.

### 2C. Authentication and resumable accounts

**Next implementation package.**

- email magic link or OTP;
- account recovery;
- duplicate-account controls;
- account deletion orchestration, including object cleanup;
- abandoned-onboarding retention;
- onboarding state persisted per authenticated user.

### 2D. Controlled multi-user interaction slice

- private preview deployment, not the public Hugging Face pilot;
- two controlled adult test accounts;
- persistent profiles and discovery;
- reciprocal likes and exactly one match;
- server-issued pilot contact entitlement;
- realtime text conversation;
- block, report and end-contact enforcement.

### 2E. Institution and student-benefit verification

- DUO/RIO institution identity;
- separately evidenced mailbox domains;
- annual expiry and graduation transition;
- student discount entitlement;
- Campus Mode privacy.

### 2F. Age and liveness proofs

- privacy-preserving age assurance;
- replay threat model;
- randomized challenges;
- error thresholds and appeal paths.

### 2G. Sensitive-data and fairness proof

- DPIA/legal review for faith data;
- family-context minimisation;
- approved discovery projection and visibility controls;
- ranking fairness and deletion controls.

### 2H. Contact and payment proof

- Mollie-versus-Stripe decision;
- hosted checkout;
- webhook idempotency;
- refunds and online cancellation;
- entitlement ledger;
- no payment until the free funnel creates repeatable value.

### 2I. Behavioural standing and moderation proof

- feedback credibility and retaliation resistance;
- positive badges and correction prompts;
- explainable limitations and appeals;
- manual moderation console and audit workflow.

## Phase 3 — Closed city-based PWA pilot

**Goal:** operate a constrained real-user pilot in one Dutch city across students, recent graduates and young professionals.

Scope:

- invite-only real accounts;
- production authentication and external database;
- age and serious-intent friction;
- optional verified student layer;
- live capture and privacy portrait;
- persistent discovery, matching, contact opening and text chat;
- manual moderation console and support coverage;
- deletion, retention and incident procedures;
- initially free contact rights or a clearly labelled pricing experiment.

**Gate:** privacy, security, legal and moderation readiness approved and real-user admission explicitly authorized.

## Phase 4 — Monetised Dutch beta

- hosted web checkout;
- regular plan and student discount;
- Campus Mode for verified students;
- broader city coverage;
- recommendation explanations and exposure fairness;
- private behavioural feedback with guarded interventions;
- small verified local events;
- in-app audio only after moderation readiness.

## Phase 5 — National scale and Belgium assessment

National institution coverage, local density expansion, partnership channels and only then a separate Belgian legal/language/institution assessment.

## Phase 6 — Native shells

Add thin iOS/Android shells only where app-store distribution, push reliability, camera controls, calling or device security justify the complexity.

## Stop or reconsider criteria

- insufficient relevant local profile density;
- users require ordinary public photos before matching;
- privacy portraits are not attractive enough;
- verification abandonment is prohibitive;
- serious-intent positioning does not produce better conversations;
- moderation or sensitive-data obligations are not operationally viable;
- monetisation materially suppresses contact formation;
- feedback mechanisms show unacceptable bias or retaliation.
