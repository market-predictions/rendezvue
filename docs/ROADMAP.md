# Rendezvue roadmap

**Version:** 2.3  
**Updated:** 2026-08-03

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

**Status:** complete in source.

Adult/single/serious membership, student-first positioning, eligibility, life stage, family context, privacy portraits, profile preview, community promise and man/woman onboarding with derived opposite-sex discovery.

### 1E. Interaction, contact and feedback concept

**Status:** complete in source; field review remains.

Pass, direct/contextual likes, swipes, reciprocal match, contact entitlement, text conversation, end-contact feedback and safety controls without public ratings or automatic feedback penalties.

## Phase 2 — External backend proof

**Status:** core controlled proof complete; production-readiness work continues.

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
- cleanup of a conversation opener after an ended conversation.

### 2C. Authentication, resumable onboarding and Cloudflare deployment

**Status:** controlled proof complete; recovery and lifecycle controls remain.

Demonstrated in the canonical Cloudflare browser proof:

- same-browser-profile PKCE magic-link exchange for two isolated accounts;
- consumed callback handling and session restoration;
- explicit global sign-out and re-authentication;
- persistent onboarding and server-side profile publication;
- browser/server credential separation;
- authenticated provider-orchestrated cleanup;
- no session restoration after final cleanup.

Still required:

- account recovery controls;
- duplicate-account prevention and resolution;
- abandonment retention policy and scheduled cleanup;
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

## Phase 3 — Closed city-based PWA pilot

**Status:** not authorized.

**Goal:** operate a constrained real-user pilot in one Dutch city across students, recent graduates and young professionals.

**Entry gates:**

- recovery, duplicate-account and retention controls complete;
- integrated mobile UX and privacy-portrait review accepted;
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

## Stop or reconsider criteria

- insufficient relevant local profile density;
- users require ordinary public photos before matching;
- privacy portraits are not attractive enough;
- verification abandonment is prohibitive;
- serious-intent positioning does not produce better conversations;
- moderation or sensitive-data obligations are not operationally viable;
- monetisation materially suppresses contact formation;
- feedback mechanisms show unacceptable bias or retaliation.
