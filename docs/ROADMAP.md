# Rendezvue roadmap

**Version:** 0.4  
**Updated:** 2026-07-27

## Operating doctrine

- GitHub is the source of truth.
- Hugging Face is a disposable, one-way synchronized pilot deployment.
- Work advances through explicit work packages and evidence-based gates.
- Claims distinguish demonstrated prototype behavior from planned production capability.
- High-risk uncertainties are tested before broad feature expansion.
- Safety and privacy controls are not deferred until launch.
- Hosting architecture should match actual product needs; browser-only phases should not require paid server compute.

## Phase 0 — Foundation and governance

**Goal:** establish a reproducible project with unambiguous authority and handover.

Deliverables:

- repository governance and contribution model;
- requirements baseline;
- roadmap, work packages, work claims and changelog;
- architecture and decision records;
- static and Docker build targets;
- CI and Hugging Face synchronization workflow;
- security and privacy warnings for the public repository.

**Gate:** repository checks pass and every implemented claim is traceable.

**Status:** complete. Milestone 0.1 was approved, CI passed and PR #1 was squash-merged to `main`.

## Phase 1 — Interaction prototype

**Goal:** validate whether users understand and value private animated avatars as sufficient visual input for dating discovery.

Deliverables:

- mobile onboarding;
- institution/email-domain interaction;
- live-camera capture interaction;
- local non-production avatar preview;
- profile privacy controls;
- single-card discovery;
- contextual likes;
- mutual-match simulation;
- text-chat demonstration;
- report, block, unmatch and pause controls;
- installable PWA shell.

Research questions:

1. Is the avatar sufficiently representative to create attraction without publishing the real face?
2. Does the privacy proposition increase willingness to register?
3. Does hiding the institution by default improve perceived safety or reduce trust?
4. Are contextual likes more useful than a generic swipe alone?
5. Is the live-capture process acceptable on mid-range Android devices?

**Gate:** moderated user testing shows that the core proposition is understood and the avatar is useful enough to choose whether to engage.

**Status:** functional technical prototype complete; hosted access and external user testing not yet completed.

### Phase 1A — Hosted prototype deployment

**Goal:** make the approved prototype reviewable on real mobile browsers without requiring local development tools or a paid hosting plan.

Deliverables:

- deterministic static build from `apps/web/` to `dist/`;
- automatic creation or confirmation of a public Hugging Face Static Space;
- one-way synchronization from GitHub `main`;
- hosted static-build polling;
- direct public-page and deployment-marker verification;
- verified public URL in the GitHub Actions summary;
- web-only activation and troubleshooting guide;
- deployment evidence in changelog, work claims and handover.

**Gate:** the workflow succeeds, the direct public URL opens on representative phones, camera access is tested through HTTPS and the running source matches GitHub `main`.

**Status:** active. Credentials and repository variables were accepted. The first Docker attempt failed with HTTP 402 because new Docker Spaces require a paid plan. A free Static Space correction is implemented and awaiting hosted confirmation.

## Phase 2 — High-risk technical proofs

**Goal:** replace prototype substitutions with independently validated technical components.

### 2A. Student verification

- authoritative Moroccan institution registry;
- domain ownership checks;
- real email delivery;
- fallback-document workflow;
- annual reverification rules.

### 2B. Adult access

- select privacy-preserving age-assurance method;
- assess bias, false rejection and appeals;
- test escalation and suspected-minor operations.

### 2C. Liveness

- browser-compatible face landmarks;
- random blink/head-turn challenge;
- replay and injection threat analysis;
- device and browser coverage;
- measurable false-accept/false-reject thresholds.

### 2D. Avatar pipeline

- approved visual style;
- identity resemblance and fairness evaluation;
- quality and deception thresholds;
- server job orchestration;
- source-media deletion evidence;
- generation cost and latency model.

**Gate:** each component passes a written acceptance protocol on representative users and devices.

## Phase 3 — Closed PWA MVP

**Goal:** operate a real but deliberately constrained pilot.

Scope:

- one city or a small set of institutions;
- external PostgreSQL;
- external object storage;
- production authentication;
- phone and institutional-email verification;
- age assurance;
- liveness and avatar generation;
- profiles, discovery, matching and text chat;
- moderation console;
- safety operations;
- PWA push notifications;
- French and Arabic/RTL.

The Static Space may continue to serve the frontend, but persistent application services must be hosted externally or moved to an appropriate backend platform.

**Gate:** privacy and safety assessments approved; monitoring and moderation coverage proven; kill switches and deletion flows tested.

## Phase 4 — Public PWA beta

- broader institution coverage;
- annual student reverification;
- improved recommendations;
- invisible mode;
- refined notification engagement;
- voice notes after moderation validation;
- reliability and abuse hardening;
- measured marketplace-density expansion.

**Gate:** healthy local match and reply rates without an unacceptable safety burden.

## Phase 5 — Native shells

Add thin Android and iOS shells only where native capability materially improves the product:

- reliable push;
- native camera and codec control;
- secure credential storage;
- app/device integrity signals;
- deep links;
- screenshot deterrence on sensitive future screens;
- app-store distribution;
- improved audio/video calling.

The shell shall not duplicate server-side product logic.

## Stop / reconsider criteria

The project should pause or change direction if validated testing shows any of the following:

- avatars are consistently too inaccurate or unattractive to support dating choices;
- users demand public real-face photos before matching;
- age and student verification create prohibitive abandonment;
- sufficient local student density cannot be reached economically;
- safety or moderation requirements exceed viable operating capacity;
- avatar processing cost or latency is incompatible with expected acquisition economics;
- regulatory constraints make the proposed biometric flow disproportionate.
