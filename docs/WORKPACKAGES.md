# Work packages

Work packages are the operational units of the roadmap. Status values are `planned`, `active`, `blocked`, `review`, or `complete`.

## WP-000 — Repository foundation

**Status:** review  
**Objective:** make GitHub authoritative and establish reproducible governance and deployment structure.

### Scope

- requirements, roadmap, changelog and handover;
- work claims and architecture decisions;
- contribution and security policies;
- CI;
- Docker image;
- Hugging Face synchronization workflow.

### Acceptance evidence

- `npm run check` passes;
- Docker image builds and health endpoint responds;
- deployment workflow is syntactically present and gated by `HF_SPACE_ID`;
- documentation states Hugging Face is not authoritative.

### Remaining decision

- exact Hugging Face Space identifier and deployment credential setup.

## WP-010 — Mobile PWA interaction prototype

**Status:** review  
**Objective:** implement the complete local product loop without implying production verification.

### Scope

- onboarding and adult-only copy;
- institution and email-domain validation;
- camera permission and timed capture;
- in-memory frame extraction;
- prototype stylization;
- profile/privacy configuration;
- discovery and contextual likes;
- match/chat demonstration;
- safety controls;
- PWA manifest and service worker.

### Acceptance evidence

- automated institution-domain tests;
- static-file and manifest validation;
- manual browser smoke test;
- no captured media persisted by the prototype.

## WP-020 — Moroccan institution registry

**Status:** planned  
**Objective:** create a sourced, maintainable registry of recognised institutions and student email domains.

### Key outputs

- institution source schema;
- verification date and status;
- domain/subdomain rules;
- administrative management interface;
- unknown-domain review workflow.

## WP-030 — Production identity-friction stack

**Status:** planned  
**Objective:** implement phone verification, adult access assurance and account-risk controls.

## WP-040 — Production liveness

**Status:** planned  
**Objective:** detect randomized blink/head-turn challenge completion with documented attack limits.

## WP-050 — Production avatar generation

**Status:** planned  
**Objective:** create recognisable, attractive, fair and temporally stable animated avatars with short retention of source media.

## WP-060 — Persistent application services

**Status:** planned  
**Objective:** implement account, profile, discovery, matching, messaging and notification services using external persistent infrastructure.

## WP-070 — Trust and safety operations

**Status:** planned  
**Objective:** implement moderation tooling, child-safety procedures, appeals, audit logs and enforcement operations.

## WP-080 — Closed pilot readiness

**Status:** planned  
**Objective:** meet legal, privacy, security, accessibility and operational release gates for selected institutions.

## WP-090 — Native shell

**Status:** deferred  
**Objective:** add native capabilities after PWA evidence justifies the investment.
