# Rendezvue roadmap

**Version:** 1.0  
**Updated:** 2026-07-29

## Operating doctrine

- GitHub is authoritative; Hugging Face is a generated web-facing pilot.
- Rendezvue is open-membership, adult-only and serious-intent, with a student-first community layer.
- Local marketplace density and safe interaction are validated before national expansion.
- Privacy portraits are implementation-neutral; fuzzy browser portraits are the MVP baseline.
- Safety, fairness, privacy and legal controls are product features.

## Phase 0 — Foundation and hosting

**Status:** complete.

Delivered: governance, dependency-light PWA, CI, Static Space deployment, Docker fallback and hosted marker verification.

## Phase 1 — Concept and interaction validation

### 1A. Core dating loop

**Status:** complete.

Camera demonstration, profile, discovery, contextual like, deterministic match, local chat, report, block and PWA shell.

### 1B. Netherlands and faith model

**Status:** complete; terminology review remains.

Dutch/English, MBO/HBO/WO fixtures, descriptive faith fields and private practice visibility.

### 1C. Selectable privacy portraits

**Status:** complete in code; mobile owner review remains.

Four browser-local fuzzy variants, no raw-selfie option and downsampling fallback.

### 1D. Product baseline v1 and onboarding redefinition

**Status:** active on `agent/product-baseline-v1-pilot`.

Deliverables:

- student-first rather than student-only positioning;
- eligibility and private-account simulation;
- resumable local onboarding;
- life stage and optional student verification;
- marital history, children, child wish and openness to a partner with children;
- privacy portrait terminology and integrated filter grid;
- profile preview and community promise;
- synthetic profiles across student, graduate, employed and self-employed life stages.

### 1E. Interaction, contact and feedback concept

**Status:** active in the same milestone.

Deliverables:

- pass, direct like and contextual like;
- left/right swipe gestures plus accessible buttons;
- reciprocal pilot match;
- simulated contact entitlement and indicative regular/student pricing;
- text conversation;
- end-contact flow and structured private feedback;
- no public ratings and no automatic feedback-based visibility penalty.

**Gate for Phase 1:** CI passes, Hugging Face marker verifies, owner tests mobile camera/onboarding/swipe/chat, and material defects are logged.

## Phase 2 — External backend proof

### 2A. Authentication and resumable accounts

Email magic link or OTP, account recovery, duplicate-account controls, deletion and abandoned-onboarding retention.

### 2B. Persistent domain model

PostgreSQL schema for Account, Eligibility, Profile, LifeStage, StudentVerification, FamilyContext, FaithProfile, PrivacyPortrait, AttractionSignal, Match, ContactEntitlement, Conversation, Feedback and ModerationCase.

### 2C. Authorization and realtime messaging

Row-level policies, private storage, server-authoritative block enforcement and realtime text chat.

### 2D. Institution and student-benefit verification

DUO/RIO institution identity, separately evidenced mailbox domains, annual expiry, student discount entitlement and Campus Mode privacy.

### 2E. Age and liveness proofs

Privacy-preserving age assurance, replay threat model, randomized challenges, error thresholds and appeal paths.

### 2F. Sensitive-data and fairness proof

DPIA/legal review for faith data, family-context minimisation, ranking fairness, explicit visibility and deletion controls.

### 2G. Contact and payment proof

Mollie-versus-Stripe decision, hosted checkout, webhook idempotency, refunds, online cancellation and entitlement ledger. No payment until the free funnel creates repeatable value.

### 2H. Behavioural standing proof

Feedback credibility, retaliation resistance, positive badges, correction prompts, explainable limitations and human moderation.

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
- initially free contact rights or clearly labelled pricing experiment.

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
