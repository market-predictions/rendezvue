# Project handover

**Updated:** 2026-08-03  
**Milestone:** WP-065A/B account-entry and lifecycle proof remotely accepted

## GitHub state

- Authority: `market-predictions/rendezvue` `main`.
- Canonical staging URL: `https://rendezvue-private-preview.pages.dev/`.
- Cloudflare migration evidence: issue #35.
- Completed controlled browser proof: issue #41 / WP-057.
- Account lifecycle evidence: issue #54 / `docs/WP-065-ACCOUNT-LIFECYCLE.md`.
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

PR #52:

- changed the foreign key to `ON DELETE CASCADE`;
- added a regression test covering an ended match, ended conversation and message;
- proved account B remains while account A and the shared interaction state are removed.

Protected staging run `30805876163` applied the migration, redeployed the cleanup function and passed migration, health, anonymous-rejection and artifact gates. Both account cleanups then succeeded.

## Accepted WP-065A/B outcome

WP-065A and WP-065B are complete; WP-065C remains blocked.

Demonstrated:

- existing-account sign-in/recovery uses `shouldCreateUser: false`;
- explicit registration is the only magic-link action that may create an Auth user;
- the browser response does not reveal account existence or delivery state;
- the Cloudflare artifact has a regression gate for registration/recovery separation;
- lifecycle records are created for new and existing Auth users;
- relevant profile, onboarding, portrait, attraction and message activity updates lifecycle state;
- retention policies are versioned and inactive by default;
- explicit retention holds are supported;
- only inactive draft accounts can become candidates;
- recent activity, publication, active matches, unresolved safety/moderation work and active holds exclude candidacy;
- `anon` and `authenticated` cannot enumerate candidates;
- `service_role` can enumerate candidates;
- no delete function or scheduler exists.

Protected run `30841983060` verified the remote staging state:

- lifecycle schema present;
- active retention policies: `0`;
- cleanup candidates: `0`;
- ordinary-user enumeration denied;
- service-role enumeration allowed.

The original verifier failed first on YAML heredoc parsing and then because the Management API role correctly could not execute the service-only function. PRs #59 and #60 fixed the verifier without widening database permissions.

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
- non-destructive lifecycle state, retention holds and service-only candidate enumeration.

## Immediate next work

### 1. Resolve remaining account-support lifecycle gaps

- define support-led duplicate-account investigation and resolution;
- define restoration/recovery when the registered mailbox is no longer accessible;
- define retention-hold creation, review and release procedures;
- ensure support actions are audited and do not disclose account existence improperly.

### 2. Approve or reject WP-065C policy activation

Before any cleanup automation:

- approve retention periods and policy version;
- align DPIA, legal basis and privacy notices;
- design grace period and user notifications;
- name the operational owner and review cadence;
- prove a synthetic dry-run and rollback/support procedure;
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

- no support-led duplicate-account merge or resolution procedure;
- no recovery when the registered mailbox is inaccessible;
- no approved abandonment-retention schedule or active retention policy;
- no scheduled or automatic deletion;
- no production age or liveness assurance;
- no production institution/student verification;
- no payment provider or real entitlement issuer;
- no operational moderation console or SLA;
- no approved Article 9 basis or completed DPIA;
- no real-user authorization;
- the staging proof remains restricted to controlled synthetic adults.
