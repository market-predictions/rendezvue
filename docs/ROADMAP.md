# Rendezvue roadmap

**Version:** 2.12  
**Updated:** 2026-08-05

## Operating doctrine

- GitHub is the sole source of truth.
- Cloudflare Pages is the canonical web-facing staging host.
- Supabase provides Auth, PostgreSQL/RLS, private Storage, Realtime and Edge Functions.
- Nothing is built, served or tested on the owner's computer.
- Hugging Face is retired as an application host; existing Spaces are historical, non-canonical artifacts.
- Staging is restricted to controlled synthetic adult accounts. Real-user admission remains unauthorized.
- Rendezvue is adult-only, currently-single and serious-intent, with a student-first community layer rather than student-only admission.
- Fuzzy browser-generated privacy portraits are the MVP baseline; AI portraits are optional.
- Safety, fairness, privacy and legal controls are product features.

## Phase 0 — Foundation and hosting

**Status:** complete.

GitHub authority, CI, generated artifacts, retained Docker validation, Cloudflare Pages staging and Supabase backend configuration are complete.

Accepted evidence includes:

- canonical staging URL `https://rendezvue-private-preview.pages.dev/`;
- commit-matched Cloudflare production metadata;
- browser-safe Supabase configuration only;
- PKCE magic links with implicit token fragments disabled;
- security and no-store headers;
- protected migration, health and Edge Function deployment workflows;
- no active Hugging Face runtime dependency.

## Phase 1 — Concept and interaction validation

### 1A. Core dating loop

**Status:** complete in source.

Camera demonstration, profile, discovery, contextual like, deterministic match, local-demo chat, report, block and installable PWA shell.

### 1B. Netherlands and faith model

**Status:** implementation complete; representative terminology review remains.

Dutch/English, MBO/HBO/WO fixtures, descriptive faith fields and private practice visibility.

### 1C. Selectable privacy portraits

**Status:** implementation complete; integrated mobile owner review remains.

Four browser-local fuzzy variants, no raw-selfie option and downsampling fallback.

### 1D. Product baseline v1 and onboarding redefinition

**Status:** complete in source and integrated product shell.

Adult/single/serious membership, student-first positioning, eligibility, life stage, family context, privacy portraits, profile preview, community promise and man/woman onboarding with derived opposite-sex discovery.

### 1E. Interaction, contact and feedback concept

**Status:** complete in source and integrated product shell; field review remains.

Pass, direct/contextual likes, swipes, reciprocal match, contact entitlement, text conversation, end-contact feedback and safety controls without public ratings or automatic feedback penalties.

## Phase 2 — External backend proof

**Status:** core controlled proof and integrated synthetic product shell complete; production-readiness work continues.

### 2A. Backend foundation and migration contract

**Status:** complete.

Versioned Supabase/PostgreSQL configuration, Auth-linked domain records, RLS, private portrait storage, server-authoritative likes/matches/contact/chat/block/feedback/reporting, moderation/audit contracts and account-deletion anonymisation.

### 2B. Schema, authorization and concurrency proof

**Status:** complete in GitHub Actions.

Demonstrated:

- empty-database migration replay;
- cross-account private-data isolation;
- hidden incoming likes;
- retry-safe and truly parallel reciprocal matching;
- retry-safe and truly parallel contact opening;
- participant-only messages;
- private feedback/report visibility;
- block enforcement;
- relational deletion and audit anonymisation;
- cleanup of a conversation opener after an ended conversation;
- service-only lifecycle, support-case, evidence/decision and registered-email replacement contracts.

### 2C. Authentication, resumable onboarding and Cloudflare deployment

**Status:** controlled proof complete; product-facing account and signed-in product journeys integrated; operational recovery remains unauthorized.

Demonstrated in the canonical Cloudflare browser proof, WP-065A/B/D/E/F, WP-066 and WP-067:

- same-browser-profile PKCE magic-link exchange for two isolated accounts;
- consumed callback handling and session restoration;
- explicit global sign-out and re-authentication;
- persistent onboarding and server-side profile publication;
- browser/server credential separation;
- authenticated provider-orchestrated cleanup;
- no session restoration after final cleanup;
- existing-account access cannot silently create a new account;
- explicit registration remains the only account-creation action;
- Dutch-first and English-capable product account entry;
- generic request messages that do not reveal account existence or delivery state;
- plain-language expired, used and wrong-browser magic-link guidance;
- user-facing mailbox-loss guidance without internal support terminology;
- masked signed-in address, global sign-out and understandable deletion consequences;
- mobile product navigation for Start, Profile, Discover, Matches and Account;
- resumable eligibility, identity, life-stage, family, faith, personality and portrait flow;
- woman/man-only sex selection with opposite-sex discovery derived automatically;
- private portrait upload, profile preview and server-side publication;
- ten synthetic portrait-backed discovery profiles;
- pass, direct like and contextual like through server-authoritative signals;
- match, one synthetic contact right, participant-only Realtime conversation and safety actions;
- product-safe visible projections without account, match, conversation or private-object identifiers;
- complete synthetic proof controls retained behind an advanced disclosure;
- server-authoritative lifecycle state and service-only non-destructive retention candidates;
- service-only audited investigation cases for duplicate-account and mailbox-access-loss requests;
- controlled evidence categories and case-kind approval thresholds;
- conflicting evidence blocks approval;
- case/evidence snapshots invalidate stale review;
- independent reviewer separation of duties;
- mailbox-loss-only registered-email replacement foundation with no caller-selected user ID;
- only hashed e-mail fingerprints in public action/event/audit records;
- short approval expiry, bounded retries, target-address collision protection and cooldown;
- idempotent server-side executor and post-change non-creating PKCE magic-link request;
- ordinary-user invocation denied remotely.

Still required:

- owner-led desktop and mobile field review of the integrated product journey;
- controlled disposable-account exercise of the new product shell when suitable mailboxes are available;
- a disposable synthetic mailbox/account for the controlled remote e-mail-replacement execution proof;
- approve an operational identity-evidence policy and operator procedures;
- build secure support tooling and user-notification/objection flows;
- define fraud, rollback, escalation and incident controls;
- keep duplicate-account merging outside scope unless separately approved;
- approve retention policy, user notification and operational ownership;
- guarded cleanup dry-run and scheduling only after policy and DPIA approval;
- direct Cloudflare Pages environment variables instead of the transition bootstrap.

### 2D. Controlled two-account interaction and cleanup slice

**Status:** complete; accepted in issue #41 on 2026-08-03.

Completed on canonical Cloudflare staging:

1. two controlled synthetic adult accounts in isolated browser profiles;
2. PKCE magic links opened in the same corresponding profiles;
3. callback consumption, session restore, sign-out and re-authentication;
4. persistent publication of one synthetic woman and one synthetic man profile;
5. cross-account private-domain isolation;
6. opposite-sex discovery and exactly one reciprocal match;
7. one proof contact right and one conversation;
8. Realtime messages in both directions without refresh;
9. matched private portrait access;
10. private feedback and safety reporting;
11. normal end-contact and a separate block path;
12. server-authoritative revocation of new portrait access and message writes;
13. authenticated provider cleanup for both accounts;
14. private-object, Auth and relational cleanup with audit anonymisation;
15. both browser profiles remained signed out after refresh.

The first account-A cleanup exposed a restrictive conversation-opener foreign key. PR #52 changed it to `ON DELETE CASCADE`, added a regression test and was deployed through protected staging run `30805876163`; cleanup then passed for both accounts.

Detailed evidence: `docs/WP-057-COMPLETION.md`.

### 2E. Institution and student-benefit verification

**Status:** planned.

- DUO/RIO institution identity;
- separately evidenced mailbox domains;
- annual expiry and graduation transition;
- student discount entitlement;
- Campus Mode privacy.

### 2F. Age and liveness proofs

**Status:** planned.

- privacy-preserving age assurance;
- replay threat model;
- randomized challenges;
- error thresholds and appeal paths.

### 2G. Sensitive-data and fairness proof

**Status:** planned.

- DPIA/legal review for faith data;
- family-context minimisation;
- approved discovery projection and visibility controls;
- ranking fairness and deletion controls.

### 2H. Contact and payment proof

**Status:** planned.

- Mollie-versus-Stripe decision;
- hosted checkout;
- webhook idempotency;
- refunds and online cancellation;
- production entitlement ledger;
- no payment until the free funnel creates repeatable value;
- permanently isolate the synthetic proof entitlement issuer before any real-user environment.

### 2I. Behavioural standing and moderation proof

**Status:** planned.

- feedback credibility and retaliation resistance;
- positive badges and correction prompts;
- explainable limitations and appeals;
- manual moderation console and audit workflow.

### 2J. Account recovery and lifecycle controls

**Status:** WP-065A/B/D/E complete; WP-065F foundation complete; WP-065C blocked.

Completed:

- fail-closed distinction between existing-account recovery/sign-in and registration;
- browser response that does not disclose account existence or delivery state;
- server-authoritative lifecycle/activity state;
- versioned retention policies with no active default;
- explicit retention holds;
- service-role-only non-destructive candidate enumeration;
- service-only account-support cases with opaque references, controlled transitions, append-only events and sanitized audits;
- controlled evidence categories, scopes, derived strengths and assessments;
- case-kind approval thresholds, conflict blocking and both-account coverage;
- evidence fingerprints and case-state snapshots that invalidate stale review;
- independent reviewer separation of duties;
- mailbox-loss-only registered-email replacement action model;
- current/target addresses represented by normalized SHA-256 fingerprints in public records;
- target-mailbox proof, current-address consistency and uniqueness checks;
- independent action approval, two-hour expiry, three-attempt limit and thirty-day cooldown;
- idempotent internal executor with reconciliation after partial finalization;
- ordinary users denied access to lifecycle and support-control data;
- local pgTAP, Deno/static validation and protected remote verification;
- protected lifecycle run `30841983060`: schema present, active policies `0`, candidates `0`, ordinary-user enumeration denied;
- protected support migration run `30843752237` and verifier run `30843828895`: support schema present, cases/events `0 / 0`, direct service writes denied, controlled functions allowed, dangerous mutation functions absent;
- protected WP-065E migration run `30850758553` and verifier run `30850822452`: evidence/decision schema present, evidence/decisions/events `0 / 0 / 0`, ordinary-user access denied, direct service writes denied and controlled functions allowed;
- protected WP-065F migration run `30854571921` and verifier run `30854641803`: action/event schema present, actions/events `0 / 0`, plaintext e-mail columns `0`, ordinary invocation denied, direct service writes denied and internal executor deployed.

Not yet proven or authorized:

- remote end-to-end replacement with a disposable mailbox receiving the new magic link;
- operational use for real support requests;
- account merging;
- password reset through support;
- activation of any retention policy;
- user grace-period and notification workflow;
- scheduled cleanup;
- real-user deletion automation.

Detailed evidence: `docs/WP-065-ACCOUNT-LIFECYCLE.md`, `docs/WP-065F-EMAIL-REPLACEMENT-FOUNDATION.md`, issue #54, issue #62, issue #65 and issue #68.

### 2K. Product-facing account and recovery experience

**Status:** complete for controlled synthetic staging; accepted in issue #71.

WP-066 replaced the operator-first landing view with a mobile-first account experience while retaining the proof harness under an advanced disclosure.

Completed:

- Dutch remains the default language;
- English copy parity and an explicit language switch;
- separate sign-in and account-creation actions;
- generic non-enumerating request messages;
- language-aware expired/used/wrong-browser callback guidance;
- plain-language mailbox-loss support explanation and duplicate-account warning;
- masked signed-in e-mail address;
- global sign-out and understandable deletion consequences;
- responsive layout and visible keyboard focus;
- shared Supabase browser client retained;
- no browser-callable Auth admin or WP-065F executor;
- dedicated source and built-artifact regression validator;
- canonical production run `30857567262` commit-matched to PR #72 merge `45461d51a4cc6ad09b019e0b9165a9bb54ed4cb1`;
- protected backend run `30857567127` passed remote health, Auth URL/allow-list, cleanup deployment, anonymous rejection and browser credential boundary.

Detailed evidence: `docs/WP-066-ACCOUNT-RECOVERY-UX.md`.

### 2L. Integrated onboarding, discovery and conversation product shell

**Status:** complete for controlled synthetic staging; accepted in issue #74.

WP-067 integrated the already-proven backend contracts into the normal signed-in product experience.

Completed:

- five-tab mobile product navigation;
- resumable multi-section onboarding;
- derived opposite-sex discovery without a separate partner selector;
- private synthetic portrait upload and preview;
- server-authoritative profile publication;
- ten synthetic portrait-backed discovery cards;
- pass, direct like and contextual like;
- match and synthetic contact-right handling;
- participant-only Realtime chat;
- normal end-contact, block and private safety report paths;
- Dutch default and English key parity;
- product-safe visible projections with internal identifiers excluded;
- one shared browser client and no browser-accessible admin, support executor or server credential;
- 51 application tests and complete repository regression pass;
- PR #75 merged as `21596e03ddf624f4eca5b272c77539985617e742`;
- protected backend run `30860142461` passed;
- stale production-verifier marker repaired in PR #76, merged as `2bcd6f884ab6cc7a4ef68291b46e03e754be845b`;
- strengthened canonical product run `30860701792` passed account/product markers, synthetic asset delivery, privileged-capability scan, PKCE, no-store and security headers.

Not yet proven:

- a new signed-in end-to-end journey through the integrated shell using disposable accounts;
- owner acceptance on representative desktop and mobile devices;
- real-user usability, accessibility, scale or operational readiness.

Detailed evidence: `docs/WP-067-INTEGRATED-PRODUCT-SHELL.md`.

### 2N. Customer-facing profile value presentation

**Status:** WP-069C implementation corrected after owner field review; canonical owner verification pending.

Profile preview and discovery translate stable backend relationship-intent and life-stage values at the presentation boundary. The complete synthetic-seed relationship-intent vocabulary (`serious_relationship` and `marriage_oriented`) now has explicit Dutch and English copy, and the regression suite derives that vocabulary directly from the canonical seed. Custom prose remains untouched and unknown snake-case values are humanised rather than exposed with underscores.

## Phase 3 — Closed city-based PWA pilot

**Status:** not authorized.

**Goal:** operate a constrained real-user pilot in one Dutch city across students, recent graduates and young professionals.

**Entry gates:**

- operational identity-evidence policy and support procedures approved;
- controlled end-to-end e-mail-replacement proof completed or the capability explicitly disabled;
- secure support tooling, user notifications, objection and incident procedures approved;
- retention policy, DPIA alignment, notification and operational ownership approved;
- owner-led integrated mobile UX and privacy-portrait review accepted;
- controlled disposable-account product-shell field proof completed;
- legal basis, DPIA and privacy notices approved;
- age/liveness and student-benefit verification decisions approved;
- moderation, support, incident and deletion operations staffed;
- security and accessibility review passed;
- explicit real-user admission decision recorded.

## Phase 4 — Monetised Dutch beta

Hosted checkout, regular pricing, student discount, Campus Mode, broader city coverage, guarded behavioural interventions, verified local events and later audio.

## Phase 5 — National scale and Belgium assessment

National institution coverage and local-density expansion, followed only then by a separate Belgian legal/language/institution assessment.

## Phase 6 — Native shells

Add thin iOS/Android shells only where app-store distribution, push reliability, camera controls, calling or device security justify the complexity.

## Immediate next work

1. Owner-led desktop and mobile review of the complete account-to-conversation journey.
2. Controlled disposable-account execution of WP-067 and the separate WP-065F mailbox-replacement proof when suitable mailboxes are available.
3. Product refinements from field review: portrait attractiveness, profile density, navigation clarity and representative Dutch/English terminology.
4. Operational support, retention/DPIA, moderation, accessibility, security and legal readiness.
5. Explicit closed-city pilot decision only after all entry gates pass.

## Stop or reconsider criteria

- insufficient relevant local profile density;
- users require ordinary public photos before matching;
- privacy portraits are not attractive enough;
- verification abandonment is prohibitive;
- serious-intent positioning does not produce better conversations;
- moderation or sensitive-data obligations are not operationally viable;
- monetisation materially suppresses contact formation;
- feedback mechanisms show unacceptable bias or retaliation.
## Phase 2M — Profile image quality and resilient participant preparation

**Status:** WP-069A complete; WP-069B technical foundation complete and canonically verified; owner field review pending.

WP-069A replaced the childlike synthetic discovery fixtures with ten unique, realistic adult synthetic portraits and added durable canonical delivery verification.

WP-069B addresses the production condition that participants will upload inconsistent source material. The normal portrait flow now provides user-controlled 4:5 framing, pan, zoom, reset, safe-area guidance, a square avatar preview and warnings for low-resolution, landscape and unusually narrow images. Source files are orientation-normalized where supported and browser-re-encoded to a private metadata-free WebP source. Explicit 960×1200 card and 384×384 avatar derivatives are generated and registered under one preparation ID.

The database permits only the card role to become the selected profile portrait, enforces one selected card per account, serializes replacement, validates exact private paths and redacts Storage coordinates from onboarding snapshots and audit evidence. Resilient rendering uses the complete prepared image over a blurred background instead of cropping through face, forehead or chin merely to fill the card.

Accepted technical evidence:

- WP-069A issue #89, PRs #88/#90 and canonical run `30960048211`;
- WP-069B issue #91 and PR #92 merged as `a06f2ae7b7c4b5779e80143d62960856e63d9ac7`;
- protected migration/configuration run `30994962258`;
- correctly sequenced canonical browser and protected-schema run `30995029165`;
- pure framing tests, 37 new pgTAP assertions, complete migration replay, existing database contracts, race tests, seed, lint, Cloudflare and Docker validation.

The next acceptance action is an owner-led desktop/mobile field review using deliberately difficult controlled uploads: tight selfie, off-centre landscape, tall/narrow source, low-resolution source and well-composed 4:5 portrait. Automatic face recognition is not included or claimed. Real-user admission remains unauthorized.
