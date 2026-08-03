# Project handover

**Updated:** 2026-08-03  
**Milestone:** WP-065D support-safe recovery investigation foundation remotely accepted

## GitHub state

- Authority: `market-predictions/rendezvue` `main`.
- Canonical staging URL: `https://rendezvue-private-preview.pages.dev/`.
- Cloudflare migration evidence: issue #35.
- Completed controlled browser proof: issue #41 / WP-057.
- Account lifecycle evidence: issue #54 / `docs/WP-065-ACCOUNT-LIFECYCLE.md`.
- Account-support foundation evidence: issue #62 / PR #63.
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

WP-065D does not establish which identity evidence is sufficient and does not authorize any account merge, e-mail change or restoration action.

## Current validated backend/browser scope

Validated:

- versioned migrations and empty-database replay;
- RLS and least-privilege grants;
- private portrait storage and active-match access;
- server-authoritative attraction, matching, entitlement, conversation, message, end-contact and block operations;
- private feedback/reporting and hidden moderation/audit domains;
- true parallel match and contact-opening race protection;
- PKCE authentication and one shared browser Supabase client;
- fail-closed registration versus existing-account recovery intent;
- resumable owner-scoped onboarding and server publication;
- Realtime participant-only messaging;
- provider-orchestrated object/Auth/relational cleanup;
- audit identifier anonymisation;
- post-cleanup session non-restoration;
- non-destructive lifecycle state, retention holds and service-only candidate enumeration;
- service-only duplicate/mailbox-loss investigation cases with controlled transitions and retained sanitized history.

## Immediate next work

### 1. Define support decision and action policy

- define acceptable identity evidence for duplicate-account and mailbox-loss cases;
- define rejection, escalation, appeal and user-notification rules;
- decide whether any account merge, e-mail change or access restoration is legally and technically acceptable;
- when acceptable, design that action as a separate package with dual control, idempotency, audit, rollback and explicit user notification;
- do not extend the current investigation functions into Auth mutation.

### 2. Define retention-hold operations and WP-065C decision

- define who may create, review and release a hold;
- approve retention periods and policy version;
- align DPIA, legal basis and privacy notices;
- design grace period and user notifications;
- name the operational owner and review cadence;
- prove synthetic dry-run, rollback and support procedures;
- keep all scheduling and destructive automation disabled until those gates pass.

### 3. Integrated product review

- integrate the proof contracts into the polished Cloudflare product interface;
- complete desktop/mobile field review;
- review camera and privacy-portrait attractiveness/privacy balance;
- complete representative Dutch/English and faith terminology review;
- improve non-technical user guidance for authentication, recovery and deletion.

### 4. Closed-pilot readiness

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

- no approved identity-proof standard for duplicate-account or mailbox-loss cases;
- no account merge, Auth identity change or mailbox-access restoration function;
- no approved abandonment-retention schedule or active retention policy;
- no scheduled or automatic deletion;
- no production age or liveness assurance;
- no production institution/student verification;
- no payment provider or real entitlement issuer;
- no operational moderation console or SLA;
- no approved Article 9 basis or completed DPIA;
- no real-user authorization;
- the staging proof remains restricted to controlled synthetic adults.
