# Rendezvue roadmap

**Version:** 0.8  
**Updated:** 2026-07-28

## Operating doctrine

- GitHub is the source of truth.
- Hugging Face is a disposable, one-way generated pilot deployment.
- Work advances through explicit work packages and evidence-based gates.
- Demonstrated prototype behaviour is separated from production claims.
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

**Goal:** determine whether a privacy-first dating product for Muslim students in Dutch MBO, HBO and WO is understandable, attractive and culturally credible.

### Phase 1A — Core dating flow

**Status:** complete and hosted.

Delivered:

- adult-only onboarding language;
- live-camera interaction;
- privacy portrait preview;
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
- 39 synthetic Dutch institution/domain fixtures;
- faith background, daily practice, compatibility importance and lifestyle tags;
- private-by-default visibility for faith practice;
- no piety score or inferred religious identity;
- Dutch synthetic MBO, HBO and WO profiles;
- automatic hosted deployment.

Research questions:

1. Does the Dutch positioning feel credible rather than exclusionary or administrative?
2. Do MBO, HBO and WO users feel equally represented?
3. Are faith categories understandable without implying judgement?
4. Is practice visibility sufficiently private and controllable?
5. Does switching between Dutch and English preserve orientation and form progress?

### Phase 1C — Selectable privacy-filter grid

**Status:** implementation and CI complete; merge, hosted verification and owner camera review pending.

Purpose:

The softened-photo treatment was too revealing and the ink-sketch treatment was visually unacceptable. The interim pilot therefore lets the registrant choose among controlled browser-local privacy variants generated from the same captured frame.

Deliverables:

- four fixed recipes: Soft focus, Warm veil, Monochrome mist and Extra private;
- a 2×2 preview grid before profile creation;
- explicit recognisability/privacy labels;
- no raw or lightly edited selfie option;
- a minimum blur/privacy floor for every recipe;
- consistent crop, tonal neutralisation and framing;
- browser-local preview generation;
- downsampling fallback where Canvas filters are inconsistent;
- Dutch and English copy;
- deployment and anti-regression validation;
- ADR-0006 and work-claim boundaries.

Research questions:

1. Is the 2×2 grid understandable without explanation?
2. Is each preview large enough on a mobile device?
3. Does at least one recipe retain sufficient visual attraction?
4. Is Soft focus too revealing?
5. Is Extra private too abstract to be useful?
6. Do results remain acceptable across lighting, skin tones, hijab/headwear, glasses and facial hair?
7. Should weak recipes be removed rather than expanded into more choices?

**Gate:** hosted marker verification succeeds, the owner completes a real-camera review, and weak or overly revealing variants are logged for tuning or removal.

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

### 2D. Production privacy portrait

The filter grid is an interim presentation, not the production avatar architecture.

- define and approve a controlled visual style;
- prototype server-side generation from one selected frame;
- preserve broad appearance while reducing exact photographic fidelity;
- evaluate identity resemblance and privacy distance;
- define deception and beautification limits;
- validate hijab/headwear, skin tone, facial hair and glasses handling;
- implement source-media retention and deletion evidence;
- quantify cost and latency;
- retain smart cropped blur as a failure fallback.

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
- liveness and production privacy-portrait generation;
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

- no browser or generated privacy portrait is both attractive and private enough;
- users require public real-face photos before matching;
- MBO/HBO/WO or faith fields produce unacceptable exclusion or confusion;
- verification and age assurance create prohibitive abandonment;
- target community acquisition cannot create sufficient local density;
- moderation requirements exceed viable capacity;
- biometric or religious-data processing cannot be justified proportionately;
- avatar cost or latency is economically unworkable.
