# Rendezvue roadmap

**Version:** 1.8  
**Updated:** 2026-07-31

## Operating doctrine

- GitHub is authoritative; Hugging Face hosts generated web applications.
- Nothing is built, served or tested on the owner's computer.
- Rendezvue is adult-only, currently-single and serious-intent, with a student-first community layer rather than student-only admission.
- Local marketplace density and safe interaction are validated before national expansion.
- Fuzzy browser-generated privacy portraits are the MVP baseline; AI portraits are optional.
- Safety, fairness, privacy and legal controls are product features.
- The public Hugging Face pilot remains synthetic `local-demo`.
- The private Supabase proof is deployed to a separate private Hugging Face Static Space and restricted to controlled synthetic adult accounts.

## Phase 0 — Foundation and hosting

**Status:** complete.

Governance, dependency-light PWA, CI, Static Space deployment, Docker fallback and hosted marker verification are delivered.

## Phase 1 — Concept and interaction validation

### 1A. Core dating loop

**Status:** complete.

Camera demonstration, profile, discovery, contextual like, deterministic match, local-demo chat, report, block and PWA shell.

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

**Status:** complete.

Versioned Supabase/PostgreSQL configuration, Auth-linked domain records, RLS, private portrait storage, server-authoritative likes/matches/contact/chat/block/feedback/reporting, moderation/audit contracts and account-deletion anonymisation are delivered.

### 2B. Schema, authorization and concurrency proof

**Status:** complete in GitHub Actions.

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

### 2C. Authentication, resumable onboarding and hosted private deployment

**Status:** implementation complete; private Hugging Face deployment and controlled account execution next.

Delivered and validated:

- injectable magic-link/session adapter;
- one generated browser Auth client shared by callback, onboarding, interaction and cleanup modules;
- owner-derived onboarding persistence with prompts/interests and sanitized snapshot;
- server-side publication gate and cross-account draft isolation;
- recursive credential scan rejecting service/secret keys, database URLs, access tokens, passwords and private keys;
- authenticated provider-orchestrated private object and Auth-account cleanup;
- exact destructive confirmation with account identity derived only from the JWT;
- Deno type checking and GitHub Actions Edge Runtime/CORS/auth-gate testing;
- protected remote migration and function deployment;
- a dedicated private Hugging Face Static Space deployment route;
- automatic Supabase Auth Site URL and redirect allow-list configuration for the private HTTPS callback;
- explicit private-visibility and deployed-artifact verification;
- no local Git, Node, Python, Docker, webserver or localhost callback requirement.

Remote provider evidence from workflow run **#8** on commit `8400ebc70d02dc6393e00d48a7b02c9f808559cf`:

- `RendezvueProject` Healthy in West EU (Ireland), Nano compute;
- repository migrations linked and pending migrations applied;
- remote Auth health passed;
- remote Data API metadata passed;
- `delete-private-proof-account` deployed;
- unauthenticated cleanup request rejected;
- browser artifact validated with only the publishable key;
- public Hugging Face pilot unchanged in `local-demo`;
- no real-user admission authorized.

Still required:

- execute and verify the new private Hugging Face deployment workflow;
- real magic-link delivery, callback and session recovery with controlled synthetic mailboxes;
- authenticated remote cleanup with actual object deletion evidence;
- recovery and duplicate-account controls;
- abandonment retention policy and cleanup job.

### 2D. Controlled two-account interaction and cleanup slice

**Status:** implementation and automated proof complete; hosted browser execution pending.

Implemented and covered by the 151-assertion/backend/artifact/function suite:

- one-time synthetic proof contact entitlement that cannot be reissued after consumption;
- idempotent participant conversation opening;
- participant-only text messages and Realtime publication;
- active-match-only selected portrait access;
- short-lived signed portrait UI;
- normal end-contact closing match/conversation and revoking both signals;
- block, private safety report and private structured feedback controls;
- provider cleanup deleting UUID-scoped portrait bytes before Auth account deletion;
- relational cascades and retained audit anonymisation;
- browser control requiring exact confirmation;
- no second Auth client or server credential in the generated artifact;
- CORS preflight and unauthenticated cleanup rejection.

Current execution gate:

- open the dedicated private Hugging Face Space in two isolated authorized browser profiles;
- create two controlled adult synthetic accounts;
- prove magic-link delivery, callback, session recovery and sign-out;
- persist onboarding and publish one synthetic man and one synthetic woman profile;
- upload private synthetic portraits;
- prove opposite-sex eligible discovery and exactly one reciprocal match;
- prove draft/family/faith/object isolation cross-account;
- claim one proof contact right and open exactly one conversation;
- exchange realtime synthetic text messages;
- validate signed portrait delivery, end-contact, block, report and feedback enforcement;
- invoke provider cleanup for both accounts;
- prove private object, Auth, relational and anonymised-audit outcomes.

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
- production entitlement ledger;
- no payment until the free funnel creates repeatable value;
- remove or permanently isolate the synthetic proof entitlement issuer before any real-user environment.

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
