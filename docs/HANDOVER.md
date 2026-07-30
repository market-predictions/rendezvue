# Project handover

**Updated:** 2026-07-30  
**Milestone:** Phase 2 backend-proof foundation validated

## GitHub state

- Authority: `market-predictions/rendezvue` `main`.
- Product baseline v1: merged through PR #14 and publicly deployed.
- Hugging Face marker fix: merged through PR #15 and verified.
- Binary sex onboarding policy: merged and hosted through PR #16.
- Backend foundation: draft PR #17 on `agent/backend-proof-foundation`; independent CI green before final governance update.
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

## Backend-proof foundation in PR #17

Implemented:

- local Supabase CLI configuration and environment contract;
- versioned PostgreSQL migrations replayable from an empty database;
- Auth-linked profile creation;
- separate eligibility, life stage, family, faith, student verification and privacy portrait records;
- fail-closed profile publication and opposite-sex discovery eligibility;
- attraction signals and normalized reciprocal match transaction;
- contact entitlement and idempotent conversation transaction;
- participant-only messages;
- server-authoritative block transaction that freezes match and conversation and revokes signals;
- controlled private feedback and safety-report RPCs;
- automatic high-severity moderation-case creation;
- audit records and account-deletion identifier anonymisation;
- private privacy-portrait storage;
- Row Level Security plus explicit minimum table/function grants;
- Realtime publication for matches and messages;
- browser-safe backend adapter that leaves the public pilot in `local-demo`;
- ADR-0008 and `docs/BACKEND-PROOF.md`.

## Validation evidence

On head `596f4546a48cca1f1bea80558b6e5dd0bfff5e7c` before governance-only updates:

- existing CI run `30579113688`: success;
- validation run `30579113891`: success;
- application/static artifact tests: success;
- retained Docker build: success;
- local Supabase database start: success;
- full migration reset from an empty database: success;
- 90 pgTAP assertions across four suites: success;
- schema lint: success.

The pgTAP suites demonstrate:

- schema/RLS/policy/function/storage structure;
- authenticated table and function privilege boundaries;
- two-account isolation for eligibility, family and faith;
- hidden incoming likes and reciprocal match creation;
- contact entitlement idempotency;
- participant-only chat;
- private feedback and report visibility;
- high-severity moderation escalation;
- block enforcement across discovery, matching and messaging;
- relational cascade deletion and retained audit anonymisation.

## Explicit limitations

- no remote Supabase project is provisioned;
- no real authentication, recovery or account-deletion orchestration is connected to the PWA;
- repeated-call uniqueness is tested, but true parallel race testing remains;
- actual private object upload and provider-API cleanup are not field-tested;
- public pilot matching/chat remain deterministic and local;
- no payment provider or money movement;
- no operational moderation console or response coverage;
- no production Article 9 basis or DPIA;
- no real-user admission is authorized.

## Immediate next actions after merge

1. add true parallel race tests for reciprocal likes and entitlement consumption;
2. provision a private non-production EU test project only after provider/region/privacy approval;
3. implement the auth/session adapter with magic link or OTP;
4. persist onboarding/profile state in the private preview;
5. validate private object upload, signed delivery and deletion cleanup;
6. connect persistent discovery, likes, matches and realtime messages one domain at a time;
7. build a minimal moderator queue before controlled multi-user testing;
8. retain the public Hugging Face pilot as synthetic `local-demo`.

## Owner review still required

- desktop and mobile field test of the public pilot;
- mobile camera and all privacy portrait variants;
- terminology for faith, marital history, children and community positioning;
- swipe, contextual like, contact right, chat, feedback, report and block;
- confirmation that the man/woman onboarding flow matches the intended community.
