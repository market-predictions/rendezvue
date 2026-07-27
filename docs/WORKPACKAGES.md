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
- Hugging Face deployment workflow.

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

**Status:** review  
**Objective:** provide a working public mobile-browser prototype without requiring reviewers to install local development tools.

### Scope

- create or confirm a public, free Hugging Face Static Space;
- build the browser application reproducibly into `dist/`;
- package a complete `.hf-deploy/` artifact with Space metadata;
- upload the prebuilt artifact from GitHub Actions;
- verify the direct public page and Rendezvue deployment marker;
- publish the verified URL in GitHub Actions and issue #2;
- document activation, evidence and troubleshooting.

### Implemented evidence

- credentials and free Static Space creation were accepted;
- the paid Docker path and unreliable remote-build path were removed;
- GitHub generates and validates the complete deployable artifact;
- direct `hf upload` replaces remote building and source mirroring;
- deployment succeeded for commit `edec6c59bdc2b46acf6652d1c03671006e86f250`;
- workflow run `30305071548` verified the Rendezvue marker;
- public URL: `https://solidprivacy-rendezvue.static.hf.space/`;
- Docker remains available for later backend phases but is not the pilot host.

### Remaining review

- open the direct URL on desktop and mobile;
- complete the four-second camera flow;
- test Android Chrome, Samsung Internet and iPhone Safari where available;
- record any browser-specific defects.

### Completion gate

- deployment succeeds without a paid Hugging Face plan — **passed**;
- direct public URL serves the current Rendezvue marker — **passed**;
- running Space matches GitHub `main` — **passed at recorded commit**;
- camera flow works through the direct HTTPS URL — pending field test;
- public URL opens on representative Android and iPhone browsers — pending field test;
- work claims and handover record the evidence — passed.

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
