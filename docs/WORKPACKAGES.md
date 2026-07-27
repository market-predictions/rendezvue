# Work packages

Status values are `planned`, `active`, `blocked`, `review`, or `complete`.

## WP-000 — Repository foundation

**Status:** complete  
**Objective:** establish GitHub authority, CI, governance and reproducible deployment.

Evidence:

- requirements, roadmap, work claims, handover and ADRs;
- static and Docker validation;
- automated Hugging Face deployment;
- hosted marker verification.

## WP-010 — Core PWA interaction prototype

**Status:** complete  
**Objective:** demonstrate the complete dating flow without claiming production verification.

Evidence:

- onboarding, camera, avatar preview, profile and privacy;
- discovery, contextual likes, deterministic matching and local chat;
- report, block and pause controls;
- PWA manifest and service worker;
- synthetic-only data.

## WP-015 — Hosted Hugging Face prototype

**Status:** review  
**Objective:** provide a working public prototype without local development tools.

Evidence:

- free Static Space;
- prebuilt `.hf-deploy/` artifact;
- direct upload from GitHub Actions;
- public marker verification;
- URL: `https://solidprivacy-rendezvue.static.hf.space/`.

Remaining gate:

- repeat field review after the Netherlands pivot;
- camera test on at least one mobile browser;
- record browser-specific defects.

## WP-016 — Netherlands Muslim-student pivot

**Status:** review  
**Objective:** convert the prototype from a Moroccan higher-education concept into a Dutch-first product for Muslim students aged 18+ in MBO, HBO and WO.

Scope delivered:

- Dutch default and English top-level switch;
- Netherlands-first positioning;
- MBO, HBO and WO institution categories;
- independent 18+ eligibility rule;
- Dutch synthetic institution/domain fixtures;
- faith background and daily-practice self-description;
- faith compatibility preference;
- optional lifestyle tags;
- private-by-default faith-practice visibility;
- Dutch synthetic MBO, HBO and WO discovery profiles;
- illustrated avatar renderer;
- updated requirements, roadmap, privacy model and handover;
- hosted deployment.

Acceptance evidence:

- unit tests cover all three education sectors;
- Dutch is the manifest and document default;
- English switch is present throughout the flow;
- no numeric piety score exists;
- the avatar renderer no longer uses coarse color quantization;
- CI validates both static deployment artifacts and Docker fallback;
- hosted workflow serves the marker-confirmed build;
- deployment commit `30192de007e2de85bd95ef6a3a4ff57155dd4d82` verified in workflow run `30311060515`.

Remaining completion gate:

- owner reviews the Dutch onboarding, faith flow and avatar treatment;
- mobile camera flow is tested;
- material UX defects are logged or resolved.

## WP-020 — Authoritative Dutch institution registry

**Status:** planned  
**Objective:** create a sourced and maintainable registry of recognised MBO, HBO and WO institutions plus verified student email domains.

Key outputs:

- DUO/RIO source ingestion;
- institution identity, sector, locations and status;
- source date and refresh cadence;
- separate student-domain verification evidence;
- institutional exceptions and aliases;
- unknown-domain review workflow;
- administrative management interface.

The current 39 institutions and domains are pilot fixtures only.

## WP-025 — Faith profile validation and legal basis

**Status:** planned  
**Objective:** validate the faith model with target users and establish a lawful, proportionate production design for religious-belief data.

Key outputs:

- moderated user research;
- category and terminology review;
- explicit consent or other valid Article 9 condition;
- privacy notice and withdrawal path;
- visibility and deletion controls;
- anti-discrimination safeguards;
- prohibition on advertising use and inferred faith classification.

## WP-030 — Production identity-friction stack

**Status:** planned  
**Objective:** implement phone verification, age assurance and account-risk controls, including the under-18 MBO risk.

## WP-040 — Production liveness

**Status:** planned  
**Objective:** detect randomized blink/head-turn completion with documented attack limits.

## WP-050 — Production avatar generation

**Status:** planned  
**Objective:** create recognisable, attractive, fair and stable illustrated avatars with short source-media retention.

## WP-060 — Persistent application services

**Status:** planned  
**Objective:** implement accounts, profiles, discovery, matching, messaging and notifications using external persistent infrastructure.

## WP-070 — Trust and safety operations

**Status:** planned  
**Objective:** implement moderation, child-safety procedures, appeals, audit logs and enforcement.

## WP-080 — Closed Dutch pilot readiness

**Status:** planned  
**Objective:** meet legal, privacy, security, accessibility and operational gates for selected Dutch institutions.

## WP-090 — Belgium assessment

**Status:** deferred  
**Objective:** assess Belgian institutions, languages, law and community distribution after Dutch validation.

## WP-100 — Native shell

**Status:** deferred  
**Objective:** add native capabilities only after PWA evidence justifies the investment.
