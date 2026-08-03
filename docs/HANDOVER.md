# Project handover

**Updated:** 2026-08-03  
**Milestone:** WP-066 product-facing account and recovery UX accepted on canonical staging

## GitHub state

- Authority: `market-predictions/rendezvue` `main`.
- Canonical staging URL: `https://rendezvue-private-preview.pages.dev/`.
- Cloudflare deployment and backend evidence: issue #35.
- Completed controlled browser proof: issue #41 / WP-057.
- Account lifecycle evidence: issue #54 / `docs/WP-065-ACCOUNT-LIFECYCLE.md`.
- Account-support case foundation: issue #62 / PR #63.
- Evidence and dual-control decision foundation: issue #65 / PR #66.
- Registered-email replacement foundation: issue #68 / PR #69 / `docs/WP-065F-EMAIL-REPLACEMENT-FOUNDATION.md`.
- Product-facing account/recovery UX: issue #71 / PR #72 / `docs/WP-066-ACCOUNT-RECOVERY-UX.md`.
- Detailed WP-057 completion record: `docs/WP-057-COMPLETION.md`.
- Supabase project: `RendezvueProject`, Healthy, West EU (Ireland), Nano.
- Real-user admission is not authorized.

## Architecture

GitHub is the sole source of truth. Cloudflare Pages is the only web-facing staging host. Supabase provides Auth, PostgreSQL/RLS, private Storage, Realtime and Edge Functions.

The former public and private Hugging Face Spaces are historical, non-canonical artifacts. No further functional acceptance testing is performed there.

## Accepted WP-057 outcome

Two isolated browser profiles and two controlled synthetic adult accounts completed the full proof sequence:

- same-profile PKCE magic-link exchange;
- callback consumption and session restore;
- explicit sign-out and re-authentication;
- persistent onboarding and server publication;
- opposite-sex discovery and one reciprocal match;
- one proof entitlement and one conversation;
- Realtime messages in both directions without refresh;
- matched private portrait access;
- private feedback and safety reporting;
- normal contact ending and a separate block path;
- server-authoritative revocation of new portrait access and message writes;
- provider cleanup for both accounts;
- private-object, Auth and relational deletion with retained audit anonymisation;
- no session restoration after final cleanup in either browser profile.

No access token, refresh token, JWT, callback code, signed URL, private object path or server credential was recorded.

## Cleanup defect resolved

The first account-A cleanup attempt failed while leaving the account authenticated and retryable.

Root cause: the direct `conversations.opened_by_user_id` foreign key used `ON DELETE RESTRICT`, which could block deletion of the account that opened the conversation.

PR #52 changed the foreign key to `ON DELETE CASCADE`, added a regression test and proved account B remains while account A and the shared interaction state are removed. Protected staging run `30805876163` applied the migration and both account cleanups then succeeded.

## Accepted WP-065A/B outcome

WP-065A and WP-065B are complete; WP-065C remains blocked.

Demonstrated:

- existing-account sign-in/recovery uses `shouldCreateUser: false`;
- explicit registration is the only magic-link action that may create an Auth user;
- the browser response does not reveal account existence or delivery state;
- lifecycle records are created for new and existing Auth users;
- relevant account activity updates lifecycle state;
- retention policies are versioned and inactive by default;
- explicit retention holds are supported;
- only inactive draft accounts can become candidates;
- recent activity, publication, active matches, unresolved safety/moderation work and active holds exclude candidacy;
- `anon` and `authenticated` cannot enumerate candidates;
- `service_role` can enumerate candidates;
- no delete function or scheduler exists.

Protected run `30841983060` verified the remote staging state with zero active policies and zero cleanup candidates.

## Accepted WP-065D outcome

WP-065D is complete as an investigation and evidence-control foundation.

Demonstrated:

- internal case kinds for duplicate-account and mailbox-access-loss investigations;
- controlled state transitions with optimistic expected-state checks;
- only opaque ticket, operator and evidence references; raw mailbox addresses are rejected;
- one or two Auth references according to case kind;
- deletion-safe `ON DELETE SET NULL` references while support history remains;
- append-only case events and sanitized audit payloads;
- no ordinary-user access;
- service role can read cases and invoke controlled open/transition functions but cannot write tables directly;
- case processing does not mutate Auth users;
- no account merge, Auth restoration, e-mail change, support deletion or automatic decision function exists.

Evidence:

- issue #62;
- PR #63 merged as `a514443aad5ea4469e4632bc16ce8bc4dd72a148`;
- 38 pgTAP assertions;
- protected staging migration run `30843752237`;
- protected remote verifier run `30843828895` confirming schema present, cases/events `0 / 0`, ordinary-user access denied, direct service writes denied and only controlled functions allowed.

## Accepted WP-065E outcome

WP-065E is complete as an evidence-classification and four-eyes decision foundation.

Demonstrated:

- controlled evidence categories and subject scopes;
- evidence strength is derived by the server from category rather than selected freely by an operator;
- opaque token references only; mailbox-address-shaped evidence is rejected;
- outcomes are constrained to insufficient evidence, rejected, approved for action or escalated;
- approval requires two distinct supportive categories, at least one strong category and no conflict;
- duplicate-account approval requires coverage for both accounts;
- mailbox-loss approval requires two qualifying primary-account assertions;
- conflicts block approval and require rejection or escalation;
- proposals snapshot case state, state timestamp and an evidence fingerprint;
- evidence or case changes invalidate stale review;
- proposer and reviewer must be different operators;
- append-only decision events and sanitized audits;
- ordinary users have no access;
- service role can read and invoke controlled evidence/proposal/review functions but cannot write tables directly;
- approval does not execute an account action or mutate Auth users.

Evidence:

- issue #65;
- PR #66 merged as `98af90a56954db689c50bd6ebbb201e056328d53`;
- 62 pgTAP assertions;
- protected staging migration run `30850758553`;
- protected verifier run `30850822452` confirming schema present, evidence/decisions/events `0 / 0 / 0`, ordinary-user access denied, direct service writes denied, controlled functions allowed and dangerous mutation functions absent.

## Accepted WP-065F foundation

WP-065F is complete as a deployed technical foundation for replacing a registered login e-mail address after mailbox loss. A remote end-to-end mailbox execution proof remains pending.

Demonstrated:

- mailbox-access-loss cases only;
- approved WP-065E `approved_for_action` decision required;
- action requester is the original decision proposer;
- action approver is the independent decision reviewer;
- target-mailbox possession and manual identity-review evidence required;
- Auth user is derived from the approved case and cannot be selected by the caller;
- no plaintext current or target e-mail address in public action, event or audit tables;
- normalized SHA-256 fingerprints only;
- target-address collision protection;
- one active action per account;
- two-hour execution window, three-attempt limit and thirty-day cooldown;
- idempotent claim, completion and reconciliation;
- internal service-only Edge Function updates exactly the approved Auth user and requests a non-creating PKCE magic link for the new address;
- append-only events and sanitized audits;
- ordinary-user read and invocation denied;
- direct service-role table writes denied;
- no account merge, password change, support deletion or retention activation.

Evidence:

- issue #68;
- PR #69 merged as `2a5579101a04d801ef4383c9b2e8237766474b0e`;
- 58 pgTAP assertions;
- Deno type-check and static privacy/security validation;
- protected staging migration run `30854571921`;
- protected deployment/verifier run `30854641803`, confirming action/event schema present, actions/events `0 / 0`, plaintext e-mail columns `0`, ordinary invocation denied, direct service writes denied and internal executor deployed.

No remote e-mail was changed. A disposable synthetic account and mailbox capable of receiving the new magic link are required for the controlled execution proof.

## Accepted WP-066 outcome

WP-066 is complete as a product-facing account and recovery experience on canonical synthetic staging.

Demonstrated:

- canonical staging opens with the account experience rather than the backend proof console;
- Dutch is the default language;
- English copy parity and an explicit language switch;
- separate sign-in and account-creation actions;
- existing-account entry remains fail-closed and registration remains the only account-creation path;
- generic request confirmations do not reveal account existence or delivery success;
- language-aware guidance for expired, used and wrong-browser magic links;
- plain-language mailbox-loss support guidance without internal support terminology;
- users are warned not to create a duplicate account because matches and conversations are not merged automatically;
- the signed-in e-mail address is masked;
- global sign-out and understandable deletion consequences are exposed;
- responsive mobile layout and visible keyboard focus;
- the complete WP-057 proof harness remains available under an advanced synthetic-test disclosure;
- the product shell uses the shared Supabase client and cannot call Auth admin or the WP-065F executor.

Evidence:

- issue #71;
- PR #72 merged as `45461d51a4cc6ad09b019e0b9165a9bb54ed4cb1`;
- account-experience unit tests and dedicated WP-066 source/generated-artifact validation;
- full application, Cloudflare, Docker, migration, pgTAP, concurrency, seed and schema-lint suite passed;
- canonical production run `30857567262` confirmed commit-matched deployment, remote Supabase configuration, PKCE magic links, disabled implicit token fragments and security/no-store headers;
- protected backend run `30857567127` passed canonical Auth URL/allow-list, remote health, cleanup deployment, anonymous cleanup rejection and browser credential boundary.

WP-066 does not create a browser support console or authorize real users. Detailed evidence: `docs/WP-066-ACCOUNT-RECOVERY-UX.md`.

## Current validated backend/browser scope

Validated:

- versioned migrations and empty-database replay;
- RLS and least-privilege grants;
- private portrait storage and active-match access;
- server-authoritative attraction, matching, entitlement, conversation, message, end-contact and block operations;
- private feedback/reporting and hidden moderation/audit domains;
- true parallel match and contact-opening race protection;
- PKCE authentication and one shared browser Supabase client;
- product-facing Dutch/English account entry and recovery explanation;
- fail-closed registration versus existing-account recovery intent;
- non-enumerating request responses and callback guidance;
- masked signed-in identity, global sign-out and deletion explanation;
- resumable owner-scoped onboarding and server publication;
- Realtime participant-only messaging;
- provider-orchestrated object/Auth/relational cleanup;
- audit identifier anonymisation;
- post-cleanup session non-restoration;
- non-destructive lifecycle state, retention holds and service-only candidate enumeration;
- service-only duplicate/mailbox-loss investigation cases;
- controlled identity-evidence assertions and independent decision review;
- stale-case and stale-evidence rejection;
- dual-controlled registered-email replacement foundation;
- remote deployment and ordinary-user invocation rejection;
- no remote replacement execution claimed.

## Immediate next work

### 1. Broader product-shell integration

- bring onboarding, privacy-portrait selection, profile preview, discovery, matching and conversation into the same polished shell as WP-066;
- remove operator and proof terminology from normal screens;
- retain synthetic diagnostic controls behind an advanced/operator boundary;
- complete desktop and mobile field review;
- review camera and privacy-portrait attractiveness/privacy balance;
- complete representative Dutch/English and faith terminology review.

### 2. Complete the controlled WP-065F execution proof

- provide one disposable synthetic account with an old address and a disposable target mailbox that can receive a PKCE magic link;
- open a synthetic mailbox-loss case, register evidence, obtain independent decision and action approval;
- execute the internal function once;
- prove the old address no longer signs in, the new address receives the link and restores the same account/profile;
- prove the action/event/audit history remains sanitized and idempotent;
- clean up the disposable account after evidence collection.

### 3. Define operational support policy

- approve real-world identity evidence and rejection/escalation thresholds;
- name proposer, reviewer and executor roles;
- build secure support tooling rather than direct database/workflow use;
- approve old/new-address notification, objection and appeal language;
- define fraud, rollback, rate-limit and incident procedures;
- keep duplicate-account merging out of scope unless separately approved.

### 4. Define retention-hold operations and WP-065C decision

- define who may create, review and release a hold;
- approve retention periods and policy version;
- align DPIA, legal basis and privacy notices;
- design grace period and user notifications;
- name the operational owner and review cadence;
- prove synthetic dry-run, rollback and support procedures;
- keep all scheduling and destructive automation disabled until those gates pass.

### 5. Closed-pilot readiness

Before any real-user admission:

- legal basis, DPIA and privacy notices;
- sensitive faith/family data minimisation;
- age/liveness decision and appeal route;
- student-benefit verification design;
- moderation queue, support, incident response and deletion operations;
- accessibility and security review;
- payment architecture only after free-funnel value is demonstrated;
- explicit authorization for a constrained city-based pilot.

## Provider and deployment constraints

- Numeric `{{ .Token }}` e-mail OTP remains unavailable with the current Supabase free-tier/default-mail-provider combination; standard PKCE magic links remain canonical.
- Direct Cloudflare Pages environment variables remain the preferred steady-state configuration source; the validated previous-canonical-deployment bootstrap is transitional.
- A previously issued signed portrait URL remains usable until its short expiry; the terminal proof establishes that no new URL can be issued and no new message can be written.

## Explicit limitations

- WP-065E/F are technical contracts, not an approved real-world identity/support policy;
- WP-066 is a product-facing explanation, not a secure operational support console;
- no remote WP-065F e-mail replacement has yet been executed;
- no disposable target mailbox is currently available to complete that proof;
- no account merging or support password change;
- no approved abandonment-retention schedule or active retention policy;
- no scheduled or automatic deletion;
- no production age or liveness assurance;
- no production institution/student verification;
- no payment provider or real entitlement issuer;
- no operational moderation console or SLA;
- no approved Article 9 basis or completed DPIA;
- no real-user authorization;
- the staging proof remains restricted to controlled synthetic adults.
