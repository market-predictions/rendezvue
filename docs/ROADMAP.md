# Rendezvue roadmap

**Version:** 0.8  
**Updated:** 2026-07-28

## Operating doctrine

- GitHub is the source of truth.
- Hugging Face is a disposable, one-way generated pilot deployment.
- Work advances through explicit work packages and evidence-based gates.
- Demonstrated prototype behavior is separated from production claims.
- High-risk uncertainties are tested before broad feature expansion.
- Safety, privacy and legal constraints are product requirements.
- Dutch is the default language; English is the supported alternative.
- The Netherlands launches before any Belgium expansion.

## Phase 0 — Foundation and hosting

**Status:** complete.

Delivered:

- governance documents and architecture decisions;
- browser-native PWA foundation;
- CI, static and retained Docker builds;
- free Hugging Face Static Space deployment;
- verified public deployment pipeline.

## Phase 1 — Netherlands interaction prototype

**Goal:** determine whether a privacy-avatar product for Muslim students in Dutch MBO, HBO and WO is understandable, attractive and culturally credible.

### Phase 1A — Core dating flow

**Status:** complete and hosted.

Delivered:

- adult-only onboarding language;
- live-camera interaction;
- privacy avatar preview;
- profile, discovery, matching and local chat;
- report, block and pause controls;
- installable PWA structure.

### Phase 1B — Netherlands and faith pivot

**Status:** implementation, CI and hosted deployment complete; owner and target-user review pending.

Delivered:

- Netherlands replaces Morocco as launch geography;
- MBO, HBO and WO are peer education categories;
- Dutch is the default language;
- English remains available from a top-level switch;
- 39 synthetic Dutch institution/domain fixtures replace Moroccan fixtures;
- faith background, daily practice, compatibility importance and lifestyle tags;
- private-by-default visibility for faith practice;
- no piety score or inferred religious identity;
- Dutch synthetic MBO, HBO and WO profiles;
- improved local avatar rendering with smoothing, line extraction and warm illustration treatment;
- updated requirements, privacy model, work packages, work claims and handover;
- successful hosted deployment at `https://solidprivacy-rendezvue.static.hf.space/` from commit `30192de007e2de85bd95ef6a3a4ff57155dd4d82`.

Research questions:

1. Does the Dutch positioning feel credible and specific rather than exclusionary or administrative?
2. Do MBO, HBO and WO users feel equally represented?
3. Are faith categories understandable without implying judgement?
4. Is practice visibility sufficiently private and controllable?
5. Does the illustrated avatar provide more attraction and privacy than the previous pixelized treatment?
6. Does switching between Dutch and English preserve orientation and form progress?

**Gate:** the owner approves the hosted direction, material defects are logged, and a moderated target-user test protocol is ready.

## Phase 2 — High-risk technical proofs

### 2A. Authoritative Dutch student verification

- build the institution registry from DUO/RIO data;
- cover MBO, HBO and WO;
- verify student mailbox domains separately;
- implement real email possession verification;
- design current-student-document fallback;
- define annual reverification and institution exceptions.

### 2B. Adult access

- select a privacy-preserving age-assurance method;
- explicitly account for under-18 MBO students;
- assess bias, false rejection and appeals;
- implement suspected-minor escalation.

### 2C. Liveness

- browser-compatible face landmarks;
- randomized blink/head-turn challenges;
- replay and injection threat analysis;
- representative Android and iPhone coverage;
- measurable false-accept and false-reject thresholds.

### 2D. Avatar pipeline

- approve a romantic illustrated style;
- evaluate identity resemblance and fairness;
- define deception and beautification limits;
- validate head covering, skin tone, facial hair and glasses handling;
- implement server job orchestration and source-media deletion evidence;
- quantify cost and latency.

### 2E. Faith-data legality and product validation

- perform a DPIA/legal review for religious-belief data;
- define explicit and separable consent or another valid Article 9 condition;
- validate self-description and preference categories with target users;
- test withdrawal and deletion controls;
- establish anti-discrimination and anti-harassment safeguards;
- prohibit advertising use and inferred religious classification.

**Gate:** each component passes a written acceptance protocol and legal/safety review.

## Phase 3 — Closed Dutch PWA MVP

**Goal:** operate a real but deliberately constrained pilot in one Dutch city or a small institution cluster.

Scope:

- authoritative institution and domain data;
- external PostgreSQL and object storage;
- production authentication;
- phone and student-email verification;
- age assurance;
- liveness and avatar generation;
- Dutch and English production copy;
- profiles, discovery, matching and text chat;
- faith/lifestyle compatibility with user-controlled visibility;
- moderation console and safety operations;
- privacy-conscious PWA push notifications.

**Gate:** privacy, security and legal assessments approved; moderation coverage and deletion flows proven; real-user admission explicitly authorized.

## Phase 4 — Dutch public beta

- broader institution coverage;
- annual student reverification;
- recommendation and compatibility refinement;
- invisible mode;
- voice notes after moderation validation;
- abuse and reliability hardening;
- measured expansion by local marketplace density.

## Phase 5 — Belgium evaluation

Belgium is not a copy-paste extension. Before implementation:

- map Flemish and Belgian education categories and registers;
- validate Dutch/French language requirements;
- evaluate institution email practices;
- assess legal and moderation implications;
- confirm a credible community launch channel.

## Phase 6 — Native shells

Add thin Android and iOS shells only where native capability materially improves:

- notification reliability;
- camera and codec control;
- secure credential storage;
- app/device integrity signals;
- deep links and app-store distribution;
- screenshot deterrence on future sensitive screens;
- improved calling.

## Stop / reconsider criteria

Pause or change direction if evidence shows:

- illustrated avatars are too inaccurate or unattractive;
- users require public real-face photos before matching;
- MBO/HBO/WO or faith fields produce unacceptable exclusion or confusion;
- verification and age assurance create prohibitive abandonment;
- target community acquisition cannot create sufficient local density;
- moderation requirements exceed viable capacity;
- biometric or religious-data processing cannot be justified proportionately;
- avatar cost or latency is economically unworkable.
