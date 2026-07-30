# Backend proof foundation

**Version:** 0.1  
**Updated:** 2026-07-30  
**Status:** implementation foundation; no remote project provisioned

## 1. Purpose

The backend proof converts the local deterministic concept pilot into a server-authoritative multi-user system without admitting real dating users yet. The first proof must demonstrate that two synthetic or controlled test accounts can authenticate, complete a profile, like each other, create one match, consume one contact entitlement, exchange messages, block each other and create a safety report without bypassing authorization.

GitHub remains authoritative. Hugging Face remains the generated public frontend. Persistent state is hosted outside Hugging Face.

## 2. Selected proof candidate

Supabase is the leading proof platform because its local workflow supports versioned SQL migrations and a local Auth/PostgreSQL/Storage stack. The proof uses native PostgreSQL Row Level Security as the primary authorization boundary. Provider adoption remains reversible: the SQL domain model and browser adapter contract avoid provider-specific business semantics where practical.

No production vendor commitment is made by this branch. A remote project, data-processing review, region decision and cost approval remain separate gates.

## 3. Repository layout

```text
supabase/
  config.toml
  migrations/
    20260730203000_backend_proof_foundation.sql

apps/web/src/
  backend-contract.js

apps/web/tests/
  backend-contract.test.mjs
```

Secrets never belong in GitHub. `.env.example` contains only names and browser-safe placeholders.

## 4. Implemented domain boundary

The foundation migration defines:

- `profiles`;
- `eligibility`;
- `life_stages`;
- `family_contexts`;
- `faith_profiles`;
- `student_verifications`;
- `privacy_portraits`;
- `attraction_signals`;
- `matches`;
- `contact_entitlements`;
- `conversations`;
- `messages`;
- `blocks`;
- `interaction_feedback`;
- `safety_reports`;
- `moderation_cases`;
- `audit_events`.

The Auth user ID is the stable account key. Public profile, eligibility, student evidence, family context and faith data remain separate records.

## 5. Server-authoritative operations

### Attraction signal and match

`record_attraction_signal(...)`:

1. derives the actor from `auth.uid()`;
2. rejects self-interaction, unpublished targets and blocked pairs;
3. inserts or updates pass, like or contextual like;
4. checks for a reciprocal active like;
5. creates exactly one normalized match;
6. writes an audit event;
7. returns the signal and optional match ID.

A pass remains a private attraction choice. It does not alter general profile standing.

### Contact entitlement and conversation

`open_match_conversation(...)`:

1. locks the active match;
2. confirms the caller is a participant;
3. rejects blocked pairs;
4. returns an already existing conversation idempotently;
5. locks and consumes one valid contact entitlement;
6. creates one conversation;
7. records the audit event.

Both participants can reply after one participant opens the conversation. A browser redirect or client-side flag can never create an entitlement.

## 6. Authorization baseline

- users can edit only their own private profile domains;
- published profile basics can be discovered unless either party has blocked the other;
- incoming likes are not directly queryable by the target;
- matches and conversations are readable only by participants;
- messages can be inserted only by a participant in an open conversation;
- feedback is private to its reviewer;
- reports are visible to their reporter and operational roles, not the subject;
- moderation cases and audit events have no authenticated-user policies;
- privacy portraits use a private bucket and a user-ID folder prefix;
- Realtime publication is limited initially to `messages` and `matches`, with RLS remaining authoritative.

## 7. Fail-closed choices

The first migration deliberately does not expose full family or faith records to other users. A later discovery projection will expose only approved fields according to explicit visibility settings. This avoids accidental sensitive-data leakage while the profile compatibility model is still being validated.

The migration also does not implement:

- moderator role claims;
- production admin access;
- paid entitlement issuance;
- formal age or liveness evidence;
- student-document upload;
- recommendation ranking;
- behavioural standing aggregation;
- push notifications;
- media messages;
- audio or video calling.

## 8. Proof sequence

### Backend proof A — local schema

- install the Supabase CLI;
- run `supabase start`;
- run `supabase db reset`;
- verify the migration applies from an empty database;
- run repository tests;
- inspect RLS through two local Auth accounts.

### Backend proof B — controlled multi-user slice

- provision a private non-production project in an approved EU region;
- configure magic-link or OTP authentication;
- connect a non-public preview build;
- create two controlled adult test accounts;
- validate profile ownership and block enforcement;
- create reciprocal likes and exactly one match;
- issue one pilot contact entitlement server-side;
- open one conversation and exchange messages;
- verify report privacy and audit creation;
- delete both accounts and confirm cascading deletion.

### Backend proof C — frontend integration

- add a Supabase client only to a non-public preview build;
- retain `local-demo` as the public synthetic default;
- replace local persistence module by module;
- show explicit environment and data-boundary labels;
- prohibit real-user invitation until legal, privacy and moderation gates pass.

## 9. Acceptance criteria

The foundation is accepted when:

- CI validates the repository and backend contract tests;
- a clean local database reset applies the migration;
- RLS tests prove cross-account isolation;
- reciprocal likes create one match under concurrency;
- one entitlement opens one conversation idempotently;
- block enforcement prevents new interaction and messages;
- reports do not become ordinary profile ratings;
- no service-role secret appears in frontend artifacts or Git history;
- documentation and work claims remain explicit that real-user admission is prohibited.

## 10. Next implementation packages

1. SQL test harness for RLS and transactional functions.
2. Auth/session adapter and onboarding persistence.
3. Discovery projection with approved visibility rules.
4. Server-authoritative block/report/end-contact functions.
5. Realtime message subscription and pagination.
6. Minimal moderation console for controlled testers.
7. Provider, region, DPA and DPIA decision gate.
