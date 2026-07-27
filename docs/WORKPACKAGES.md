# Work packages

Work packages are the operational units of the roadmap. Status values are `planned`, `active`, `blocked`, `review`, or `complete`.

## WP-000 — Repository foundation

**Status:** complete  
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
- CI builds the Docker image;
- deployment workflow is present and documented;
- documentation states Hugging Face is not authoritative;
- milestone 0.1 was approved and squash-merged.

## WP-010 — Mobile PWA interaction prototype

**Status:** complete  
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
- browser smoke test;
- no captured media persisted by the prototype;
- product and architecture milestone approved by the owner.

## WP-015 — Hosted Hugging Face prototype

**Status:** active  
**Objective:** provide a working public mobile-browser prototype without requiring reviewers to install local development tools.

### Scope

- create or confirm a public, free Hugging Face Static Space;
- build the browser application reproducibly into `dist/`;
- mirror accepted GitHub `main` source one way;
- wait for the hosted static build;
- verify the direct public page and Rendezvue deployment marker;
- publish the verified URL in GitHub Actions;
- document activation and troubleshooting;
- record deployment evidence.

### Implemented evidence

- GitHub Actions configuration and Hugging Face credentials were accepted by the first hosted run;
- the first Docker Space attempt returned HTTP 402 because new Docker Spaces require a paid plan;
- free Static Space creation and synchronization are implemented as the corrective path;
- deterministic static build and deployment marker are implemented;
- deployment helper, CI validation and web-only guide are updated;
- Docker remains available for later backend phases but is no longer the pilot host.

### Current action

- merge the Static Space correction;
- allow the resulting `main` deployment to run automatically;
- inspect and correct any static build or browser-hosting issue.

### Completion gate

- deployment succeeds without a paid Hugging Face plan;
- direct public URL serves the current Rendezvue build marker;
- camera flow is tested through the direct HTTPS URL;
- public URL opens on representative Android and iPhone browsers;
- running Space matches GitHub `main`;
- work claims and handover record the verified URL and workflow run.

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
