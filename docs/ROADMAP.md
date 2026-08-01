# Rendezvue roadmap

**Version:** 2.2  
**Updated:** 2026-08-01

## Operating doctrine

- GitHub is the sole source of truth.
- Cloudflare Pages is the canonical web-facing staging host.
- Supabase provides Auth, PostgreSQL/RLS, private Storage, Realtime and Edge Functions.
- Nothing is built, served or tested on the owner's computer.
- Hugging Face is retired as an application host; existing Spaces are historical, non-canonical artifacts and receive no further deployments.
- The staging environment is restricted to controlled synthetic adult accounts. Real-user admission remains unauthorized.
- Rendezvue is adult-only, currently-single and serious-intent, with a student-first community layer rather than student-only admission.
- Fuzzy browser-generated privacy portraits are the MVP baseline; AI portraits are optional.
- Safety, fairness, privacy and legal controls are product features.

## Phase 0 — Foundation and hosting

**Status:** complete.

GitHub authority, CI, static builds, Docker validation and the migration from Hugging Face to one canonical Cloudflare Pages staging application backed by Supabase are complete.

### 0A. Cloudflare canonical staging

**Status:** complete; evidence recorded in issue #35.

Accepted evidence:

- `https://rendezvue-private-preview.pages.dev/` is the sole canonical staging URL;
- production is generated from `main` and serves a commit-matched `deployment.json` for merge commit `c1632fc4c6d5a5d22f27c256fdf066e5d6710966`;
- the production artifact declares `remote-supabase`, not placeholder configuration;
- the browser artifact contains only the Supabase project URL and publishable key;
- browser/server credential scanning remains fail-closed;
- security headers and no-store rules protect runtime configuration and deployment metadata;
- no source, workflow or runbook depends on a Hugging Face runtime.

### 0B. Supabase staging configuration

**Status:** complete for deployment and provider configuration; behavioural browser proof continues in Phase 2D.

Accepted evidence:

- Supabase Auth Site URL and redirect allow-list use the fixed Cloudflare Pages URL;
- passwordless sign-in uses the free-tier default-provider magic link with PKCE;
- only a one-time `?code=` callback is accepted and removed after successful exchange;
- implicit access- and refresh-token URL fragments remain disabled;
- migrations, platform health, Edge Function deployment and anonymous cleanup rejection pass remotely;
- Cloudflare production serves real browser-safe Supabase configuration rather than preview placeholders.

Provider constraint proven on 2026-08-01: numeric `{{ .Token }}` e-mail delivery is unavailable on a free-tier project using Supabase's default mail provider. It requires custom SMTP or a plan change and is therefore outside this proof.

### 0C. Hugging Face retirement

**Status:** complete; historical remote artifacts may remain reachable.

Accepted evidence:

- public and private Hugging Face deployment workflows are removed;
- active Hugging Face helper code and deployment-evidence automation are removed;
- historical deployment evidence remains documented but is not presented as current architecture;
- no further acceptance testing is performed on Hugging Face.

## Phase 1 — Concept and interaction validation

### 1A. Core dating loop

**Status:** complete in source.

Camera demonstration, profile, discovery, contextual like, deterministic match, local-demo chat, report, block and PWA shell.

### 1B. Netherlands and faith model

**Status:** implementation complete; representative terminology review remains.

Dutch/English, MBO/HBO/WO fixtures, descriptive faith fields and private practice visibility.

### 1C. Selectable privacy portraits

**Status:** implementation complete; mobile owner review remains.

Four browser-local fuzzy variants, no raw-selfie option and downsampling fallback.

### 1D. Product baseline v1 and onboarding redefinition

**Status:** complete in source.

Student-first open membership, eligibility, life stage, family context, privacy portraits, profile preview, community promise and man/woman onboarding with derived opposite-sex discovery.

### 1E. Interaction, contact and feedback concept

**Status:** complete in source; field review remains.

Pass, direct/contextual likes, swipes, reciprocal pilot match, simulated contact entitlement, text conversation, end-contact feedback and safety controls without public ratings or automatic feedback penalties.

## Phase 2 — External backend proof

**Status:** active.

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
- relational deletion and audit anonymisation.

### 2C. Authentication, resumable onboarding and Cloudflare deployment

**Status:** deployment implementation and production verification complete; controlled browser execution remains.

Delivered:

- browser PKCE magic-link and persistent session adapter;
- one shared browser Supabase client for authentication, onboarding, interaction and cleanup;
- consumed PKCE callback-code removal after successful session exchange;
- implicit access/refresh token fragments disabled;
- owner-derived onboarding persistence with prompts/interests and sanitized snapshot;
- server-side publication gate and cross-account draft isolation;
- recursive browser-artifact credential scanning;
- authenticated provider-orchestrated private object and Auth-account cleanup;
- protected remote migration/function/URL configuration workflow;
- deterministic synthetic seed with ten Auth-linked published profiles and ten private portraits;
- commit-matched Cloudflare production deployment with real browser-safe Supabase configuration.

Still required:

- controlled same-browser-profile magic-link and session-recovery execution;
- recovery and duplicate-account controls;
- abandonment retention policy and cleanup job.

### 2D. Controlled two-account interaction and cleanup slice

**Status:** active; claimed in issue #41.

Execute only on canonical Cloudflare staging:

1. create or use two controlled synthetic adult accounts in isolated browser profiles;
2. request and open each magic link in the same corresponding browser profile;
3. prove PKCE callback exchange, consumed-code removal, session restore, sign-out and sign-in;
4. persist and publish one synthetic man and one synthetic woman profile;
5. prove draft/family/faith/object isolation cross-account;
6. prove opposite-sex eligible discovery and exactly one reciprocal match;
7. claim one proof contact right and open exactly one conversation;
8. exchange realtime synthetic text messages;
9. validate signed portrait delivery, end-contact, block, report and feedback enforcement;
10. invoke provider cleanup for both accounts;
11. prove private object, Auth, relational and anonymised-audit outcomes.

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
- permanently isolate the synthetic proof entitlement issuer before any real-user environment.

### 2I. Behavioural standing and moderation proof

- feedback credibility and retaliation resistance;
- positive badges and correction prompts;
- explainable limitations and appeals;
- manual moderation console and audit workflow.

## Phase 3 — Closed city-based PWA pilot

**Goal:** operate a constrained real-user pilot in one Dutch city across students, recent graduates and young professionals.

**Gate:** privacy, security, legal and moderation readiness approved and real-user admission explicitly authorized.

## Phase 4 — Monetised Dutch beta

Hosted web checkout, regular pricing, student discount, Campus Mode, broader city coverage, guarded behavioural interventions, verified local events and later audio.

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
