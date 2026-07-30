# Rendezvue roadmap

**Version:** 1.2  
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

Governance, dependency-light PWA, CI, Static Space deployment, Docker fallback and hosted marker verification are delivered.

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

Student-first open membership, eligibility, life stage, family context, privacy portraits, profile preview, community promise and man/woman onboarding with derived opposite-sex discovery are delivered.

### 1E. Interaction, contact and feedback concept

**Status:** complete and hosted; field review remains.

Pass, direct/contextual likes, swipes, reciprocal pilot match, simulated contact entitlement, text conversation, end-contact feedback and safety controls are delivered without public ratings or automatic feedback penalties.

**Remaining Phase-1 gate:** desktop/mobile field review, mobile camera/privacy-portrait review, swipe/chat review, terminology review and logging of material defects in issue #2.

## Phase 2 — External backend proof

**Status:** active.

### 2A. Backend foundation and migration contract

**Status:** complete; merged through PR #17.

Versioned Supabase/PostgreSQL configuration, Auth-linked domain records, RLS, private portrait storage, server-authoritative likes/matches/contact/chat/block/feedback/reporting, moderation/audit contracts and account-deletion anonymisation are delivered.

### 2B. Local schema, authorization and concurrency proof

**Status:** core database proof complete; merged through PR #19.

Demonstrated:

- empty-database migration replay;
- cross-account private-data isolation;
- hidden incoming likes;
- retry-safe and truly parallel reciprocal matching;
- retry-safe and truly parallel contact opening with one entitlement consumed;
- participant-only messages;
- private feedback/report visibility;
- moderation escalation;
- block enforcement;
- relational deletion and audit anonymisation.

### 2C. Authentication and resumable accounts

**Status:** auth/session and onboarding-persistence contracts complete in PR #20; private provider integration pending.

Delivered and independently validated:

- injectable magic-link/session adapter;
- email normalization, session restore, current-user lookup, auth-state subscription and local sign-out;
- owner-derived stage persistence with field allowlists;
- versioned `onboarding_progress`;
- first-class profile prompts and interests;
- transactional personality save;
- owner-only onboarding snapshot without evidence references or private portrait object paths;
- server-side publication gate requiring eligibility, family context, selected portrait, two prompts and three interests;
- cross-account draft isolation;
- idempotent CI startup after stale local-stack cleanup.

Validation on head `61bb93c6`:

- CI run `30581908986`: success;
- validation run `30581908380`: success;
- 118 pgTAP assertions: success;
- existing true parallel race proof: success;
- schema lint, application/artifact checks and Docker build: success.

Still required:

- approved private non-production Supabase project in an EU region;
- real magic-link delivery and callback validation;
- recovery and duplicate-account controls;
- provider-orchestrated account deletion including private object cleanup;
- abandonment retention policy and job;
- private preview evidence with controlled synthetic test accounts.

### 2D. Controlled multi-user interaction slice

**Next after private environment provisioning.**

- private preview deployment, not the public Hugging Face pilot;
- two controlled adult test accounts;
- persistent onboarding, profiles and discovery;
- reciprocal likes and one match;
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

Hosted web checkout, regular pricing, student discount, Campus Mode, broader city coverage, guarded behavioural interventions, verified local events and later audio.

## Phase 5 — National scale and Belgium assessment

National institution coverage, local density expansion and partnerships, followed only then by a separate Belgian legal/language/institution assessment.

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
