# Project handover

**Updated:** 2026-07-30  
**Milestone:** Phase 2C auth/session and resumable onboarding contracts validated

## GitHub state

- Authority: `market-predictions/rendezvue` `main`.
- Product baseline v1: PR #14 merged and publicly deployed.
- Deployment marker fix: PR #15 merged and verified.
- Man/woman onboarding policy: PR #16 merged and hosted.
- Backend foundation: PR #17 merged as `8bbf1398`.
- True parallel race proof: PR #19 merged as `5976ddea`.
- Auth/onboarding persistence: draft PR #20 on `agent/auth-onboarding-persistence`; CI and validation green before governance-only updates.
- Public pilot: `https://solidprivacy-rendezvue.static.hf.space/` and remains synthetic `local-demo`.

## Product baseline

Rendezvue is adult, currently-single and serious-intent, with student-first open membership. Student verification is optional. Life stage, marital history, children, child wish, faith/lifestyle, fuzzy privacy portraits, free discovery/likes and paid conversation opening remain separate product domains. Public stars, downvotes and popularity counts are prohibited. The community flow uses man/woman sex options and derives opposite-sex discovery.

## Hosted concept pilot

The public PWA demonstrates progressive Dutch/English onboarding, simulated student verification, live selfie/privacy portraits, synthetic discovery, pass/direct/contextual likes, swipe, deterministic match, simulated contact right, local text chat, feedback, report and block. It is not a real multi-user service.

## Merged backend foundation

Implemented and validated on `main`:

- versioned Supabase/PostgreSQL migrations;
- RLS and least-privilege table/function grants;
- private portrait storage contract;
- server-authoritative attraction, match, contact, conversation, messaging, block, feedback and report operations;
- hidden moderation/audit domains;
- high-severity escalation;
- relational deletion and audit anonymisation;
- true parallel first-like and contact-opening race protection.

## PR #20 — auth and resumable onboarding

Implemented:

- injectable magic-link/session adapter;
- personal-email normalization;
- session restore and current-user lookup;
- auth-state subscription and local sign-out;
- `onboarding_progress` with schema version and completed stages;
- `profile_prompts` and `profile_interests` as first-class records;
- owner-derived stage writes with strict field allowlists;
- transactional prompts/interests save;
- owner-only onboarding snapshot excluding evidence references and private object paths;
- server-side publication requiring eligibility, family context, selected privacy portrait, two prompts and three interests;
- cross-account isolation for draft onboarding/profile content;
- idempotent CI startup that removes stale local stacks.

## Validation evidence

On implementation head `61bb93c67a8a03c2c66fe76c573f0b06750c935e`:

- CI run `30581908986`: success;
- validation run `30581908380`: success;
- application/static artifact checks: success;
- auth and onboarding client tests: success;
- retained Docker build: success;
- clean local database start and full migration replay: success;
- 118 pgTAP assertions: success;
- true parallel match/contact race tests: success;
- schema lint and clean shutdown: success.

The new tests prove that another account cannot read or update draft progress, prompts or interests; publication fails without a selected portrait; a complete profile publishes through one RPC; onboarding becomes complete; and snapshots omit private object paths.

## Explicit limitations

- no private Supabase project is provisioned;
- no real email or magic-link delivery is configured;
- no real account recovery or duplicate-account handling;
- no provider-orchestrated account/media deletion;
- no actual object upload or signed portrait delivery;
- no private multi-user preview;
- public matching/chat remain deterministic and local;
- no payments, operational moderation, Article 9 production basis or real-user authorization.

## Next actions after PR #20 merge

1. approve a private non-production Supabase project and EU region;
2. configure a preview URL, publishable key and magic-link redirect;
3. test two controlled synthetic accounts end to end;
4. validate recovery and account deletion including private object cleanup;
5. connect persistent discovery, likes, matches and realtime messages to a private preview;
6. add a minimal moderator queue before any controlled user research;
7. keep the public Hugging Face build in `local-demo`.

## Owner review still required

- desktop/mobile field test of the public pilot;
- mobile camera and all privacy portrait variants;
- terminology for faith, marital history, children and community positioning;
- swipe, contextual like, contact right, chat, feedback, report and block;
- confirmation that the man/woman onboarding flow matches the intended community.
