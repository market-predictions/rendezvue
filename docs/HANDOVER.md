# Project handover

**Updated:** 2026-07-30  
**Milestone:** Phase 2 backend-proof foundation

## GitHub state

- Authority: `market-predictions/rendezvue` `main`.
- Product baseline v1: merged through PR #14 and publicly deployed.
- Hugging Face marker fix: merged through PR #15 and verified.
- Binary sex onboarding policy: merged through PR #16; deployment verification follows the normal main workflow.
- Active development branch: `agent/backend-proof-foundation`.
- Public pilot: `https://solidprivacy-rendezvue.static.hf.space/`.

## Strategic baseline

- student-only is replaced by student-first open membership;
- eligibility is adult, currently single and serious-intent based;
- student status is an optional verified benefit layer;
- life stage covers student, recent graduate, employed, self-employed, job-seeking and other;
- marital history, existing children, child wish and openness to a partner with children are separate;
- browser-local fuzzy privacy portraits are the MVP baseline;
- AI avatars are optional later experiments;
- registration, discovery and likes are free in the target model;
- a contact entitlement opens a reciprocal match and both parties then reply freely;
- likes, private feedback, safety reports and internal trust signals are separate;
- public stars, downvotes and popularity counts are prohibited;
- this community onboarding uses only man/woman sex options and derives opposite-sex discovery automatically.

## Current public concept pilot

Implemented and hosted:

- progressive resumable Dutch/English onboarding;
- simulated private account and optional student verification;
- life stage, family context, relationship intent and faith/lifestyle fields;
- profile preview and field visibility controls;
- live selfie flow and four privacy portrait variants;
- diverse synthetic profiles;
- pass, direct like, contextual like and left/right swipe;
- deterministic reciprocal match;
- simulated regular/student contact pricing and one pilot contact right;
- text chat, end-contact, structured private feedback, report and block;
- local persistence with a versioned demo-state schema;
- no automatic feedback-based ranking effect.

## Backend-proof foundation on active branch

Added:

- local Supabase CLI configuration;
- environment contract that keeps the public build in `local-demo` by default;
- versioned PostgreSQL migration;
- Auth-linked profile creation;
- separate eligibility, life stage, family, faith, student verification and privacy portrait records;
- attraction signals and reciprocal match transaction;
- contact entitlement and idempotent conversation transaction;
- messages, blocks, feedback, safety reports, moderation cases and audit events;
- private privacy-portrait storage;
- Row Level Security and fail-closed sensitive domains;
- Realtime publication for matches and messages;
- browser-safe backend adapter contract;
- repository tests for required tables, functions, RLS and secret boundaries;
- `docs/BACKEND-PROOF.md` execution and acceptance plan.

## Explicit limitations

- no remote Supabase project is provisioned;
- no real authentication, recovery or account deletion is integrated into the PWA;
- migration has not yet been applied through a clean local `supabase db reset` in CI;
- no two-account RLS test has been executed yet;
- public pilot matching/chat remain deterministic and local;
- no payment provider or money movement;
- no operational moderation console or response coverage;
- no production Article 9 basis or DPIA;
- no real-user admission is authorized.

## Immediate next actions

1. validate the backend branch in GitHub CI;
2. apply the migration from an empty local Supabase stack;
3. add SQL tests for cross-account isolation and transactional concurrency;
4. merge the foundation only when static and database-contract checks are green;
5. provision a private non-production EU test project after provider/region/privacy approval;
6. integrate authentication and onboarding persistence in a private preview;
7. replace deterministic likes/matches/chat one domain at a time;
8. implement a minimal moderator workflow before controlled multi-user testing.

## Owner review still required

- desktop and mobile field test of the public pilot;
- mobile camera and all privacy portrait variants;
- terminology for faith, marital history, children and community positioning;
- swipe, contextual like, contact right, chat, feedback, report and block;
- confirmation that the man/woman onboarding flow matches the intended community.
