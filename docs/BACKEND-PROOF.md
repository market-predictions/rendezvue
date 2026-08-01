# Backend proof foundation

**Version:** 0.2  
**Updated:** 2026-08-01  
**Status:** remote synthetic proof project operational; Cloudflare browser acceptance pending

## 1. Purpose

The backend proof converts the local deterministic concept into a server-authoritative multi-user system without admitting real dating users. The proof must demonstrate that controlled synthetic accounts can authenticate, complete a profile, discover eligible profiles, like each other, create one match, consume one contact entitlement, exchange messages, enforce safety actions and delete their private data without bypassing authorization.

GitHub remains authoritative. Cloudflare Pages is the canonical web-facing staging host. Supabase owns persistent state. Hugging Face is not part of the current runtime architecture.

## 2. Selected proof platform

Supabase is the proof platform because it supports versioned SQL migrations and Auth/PostgreSQL/Storage/Realtime/Edge Functions. PostgreSQL Row Level Security is the primary authorization boundary. The project is non-production, synthetic-only and hosted in West EU (Ireland).

No production vendor commitment or real-user authorization follows from this proof.

## 3. Repository layout

```text
apps/private-preview/             Supabase-connected browser proof
scripts/build-private-preview.mjs Cloudflare Pages artifact builder
scripts/validate-private-preview.mjs
supabase/config.toml
supabase/migrations/
supabase/functions/
supabase/tests/
synthetic-seed/
```

Secrets never belong in GitHub or browser artifacts. Cloudflare receives only `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.

## 4. Implemented domain boundary

The migrations define:

- `profiles`;
- `eligibility`;
- `life_stages`;
- `family_contexts`;
- `faith_profiles`;
- `student_verifications`;
- `privacy_portraits`;
- `profile_prompts` and `profile_interests`;
- `onboarding_progress`;
- `attraction_signals`;
- `matches`;
- `contact_entitlements`;
- `conversations` and `messages`;
- `blocks`;
- `interaction_feedback`;
- `safety_reports`;
- `moderation_cases`;
- `audit_events`.

The Auth user ID is the stable account key. Public profile, eligibility, student evidence, family context and faith data remain separate records.

## 5. Server-authoritative operations

### Attraction and match

`record_attraction_signal(...)` derives the actor from `auth.uid()`, rejects invalid or blocked interaction, stores the signal and creates exactly one normalized match after reciprocal attraction.

### Contact right and conversation

`claim_private_proof_entitlement()` issues at most one synthetic proof right. `open_match_conversation(...)` locks the match and entitlement, confirms participant/block state, consumes one right idempotently and creates or returns one conversation.

### Messaging and portrait access

Only participants in an open conversation may exchange messages. Realtime never bypasses table RLS. Active matched participants may receive a short-lived signed URL to the selected private portrait; access stops after ending or blocking contact.

### Safety and cleanup

Feedback, safety reports, moderation cases and audit events remain distinct. `delete-private-proof-account` derives identity from the JWT, requires exact confirmation, removes UUID-scoped private objects first and then deletes the Auth account so relational cascades and audit anonymisation run.

## 6. Authorization baseline

- users can edit only their own private profile domains;
- discovery exposes only approved published fields;
- incoming likes are hidden;
- matches, conversations and messages are participant-only;
- feedback is private to its reviewer;
- reports are not visible to their subject;
- moderation and audit domains are unavailable to ordinary users;
- portraits live in a private bucket below the owner UUID prefix;
- service-role operations never execute in the browser;
- the publishable key relies on RLS and does not grant privileged access.

## 7. Authentication and staging delivery

The Cloudflare application requests a numeric e-mail OTP. The Supabase template sends `{{ .Token }}`, and the already-open application verifies it with `verifyOtp({ type: 'email' })`.

The browser ignores URL callback parameters and fragments. Access and refresh tokens must not appear in the staging URL. The protected workflow configures the Supabase Site URL and allow-list to `https://rendezvue-private-preview.pages.dev/`.

## 8. Proof sequence

### Automated proof

- clean migration replay;
- pgTAP authorization and lifecycle assertions;
- true parallel attraction/match and contact-opening races;
- Edge Function CORS and anonymous-auth rejection;
- deterministic synthetic SQL seed;
- browser artifact syntax and credential scan;
- Cloudflare headers and deployment metadata validation.

### Remote provider proof

- protected migrations and platform health;
- cleanup function deployment;
- Supabase Auth Site URL, allow-list and OTP template configuration;
- ten Auth-linked synthetic published profiles;
- ten selected private portraits.

### Controlled browser proof

- commit-matched Cloudflare production deployment;
- two isolated controlled accounts;
- OTP and session recovery;
- onboarding, publication and cross-account isolation;
- discovery, reciprocal attraction and one match;
- one contact right and one conversation;
- realtime messages and signed portrait;
- end-contact, block, report and feedback;
- authenticated object/Auth/relational/audit cleanup.

## 9. Acceptance criteria

The proof is accepted only when:

- production Cloudflare `deployment.json` matches accepted GitHub `main`;
- protected Supabase configuration succeeds;
- two-account browser execution proves the complete interaction and cleanup sequence;
- no server credential appears in Cloudflare or Git history;
- no URL carries access or refresh tokens;
- documentation and work claims continue to prohibit real-user admission.

## 10. Remaining packages

1. Execute WP-057 on Cloudflare Pages.
2. Add recovery and duplicate-account controls.
3. Define abandonment retention and cleanup.
4. Complete provider, DPA and DPIA gates.
5. Build operational moderation only after proof acceptance.
