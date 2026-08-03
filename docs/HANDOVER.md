# Project handover

**Updated:** 2026-08-03  
**Milestone:** controlled two-account Cloudflare proof complete

## GitHub state

- Authority: `market-predictions/rendezvue` `main`.
- Canonical staging URL: `https://rendezvue-private-preview.pages.dev/`.
- Cloudflare migration evidence: issue #35.
- Completed controlled browser proof: issue #41 / WP-057.
- Detailed completion record: `docs/WP-057-COMPLETION.md`.
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

## Current validated backend/browser scope

Validated:

- versioned migrations and empty-database replay;
- RLS and least-privilege grants;
- private portrait storage and active-match access;
- server-authoritative attraction, matching, entitlement, conversation, message, end-contact and block operations;
- private feedback/reporting and hidden moderation/audit domains;
- true parallel match and contact-opening race protection;
- PKCE authentication and one shared browser Supabase client;
- resumable owner-scoped onboarding and server publication;
- Realtime participant-only messaging;
- provider-orchestrated object/Auth/relational cleanup;
- audit identifier anonymisation;
- post-cleanup session non-restoration.

## Immediate next work

### 1. Account lifecycle controls

Create and execute WP-065:

- account recovery;
- duplicate-account prevention and resolution;
- abandoned-account retention policy;
- scheduled cleanup;
- support-safe restoration and deletion procedures.

### 2. Integrated product review

- integrate the proof contracts into the polished Cloudflare product interface;
- complete desktop/mobile field review;
- review camera and privacy-portrait attractiveness/privacy balance;
- complete representative Dutch/English and faith terminology review;
- improve non-technical user guidance for authentication, recovery and deletion.

### 3. Closed-pilot readiness

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

- no account recovery or duplicate-account operations;
- no approved abandonment-retention schedule;
- no production age or liveness assurance;
- no production institution/student verification;
- no payment provider or real entitlement issuer;
- no operational moderation console or SLA;
- no approved Article 9 basis or completed DPIA;
- no real-user authorization;
- the staging proof remains restricted to controlled synthetic adults.
