# Project handover

**Updated:** 2026-07-31  
**Milestone:** private EU Supabase project provisioned; protected proof lane prepared

## GitHub state

- Authority: `market-predictions/rendezvue` `main`.
- Product baseline v1: PR #14 merged and publicly deployed.
- Deployment marker fix: PR #15 merged and verified.
- Man/woman onboarding policy: PR #16 merged and hosted.
- Backend foundation: PR #17 merged as `8bbf1398`.
- True parallel race proof: PR #19 merged as `5976ddea`.
- Auth/onboarding persistence: PR #20 merged as `1de81465`.
- Protected private Supabase lane: draft PR #22 on `agent/private-supabase-preview-foundation`.
- Public pilot remains synthetic `local-demo` on Hugging Face.

## Product baseline

Rendezvue is adult, currently-single and serious-intent, with student-first open membership. Student verification is optional. Life stage, marital history, children, child wish, faith/lifestyle, fuzzy privacy portraits, free discovery/likes and paid conversation opening remain separate product domains. Public stars, downvotes and popularity counts are prohibited. The community flow uses man/woman sex options and derives opposite-sex discovery.

## Public concept pilot

The public PWA demonstrates progressive Dutch/English onboarding, simulated student verification, live selfie/privacy portraits, synthetic discovery, pass/direct/contextual likes, swipe, deterministic match, simulated contact right, local text chat, feedback, report and block. It is not a real multi-user service and receives no private Supabase runtime configuration.

## Merged backend and onboarding foundation

Implemented and validated on `main`:

- versioned Supabase/PostgreSQL migrations;
- RLS and least-privilege grants;
- private portrait-storage contract;
- server-authoritative attraction, match, contact, conversation, messaging, block, feedback and report operations;
- hidden moderation/audit domains and high-severity escalation;
- relational deletion and audit anonymisation;
- true parallel first-like and contact-opening race protection;
- provider-injectable magic-link/session adapter;
- owner-derived onboarding persistence;
- first-class prompts/interests and transactional personality save;
- owner-only sanitized onboarding snapshot;
- server-side publication gate and cross-account draft isolation.

The local proof baseline passed 118 pgTAP assertions, true parallel race tests, schema lint, client tests, app/artifact checks and Docker validation.

## Supabase project evidence

Owner evidence received on 2026-07-31:

- project: `RendezvueProject`;
- status: Healthy;
- region: West EU (Ireland);
- compute: Nano;
- remote migrations: none;
- dashboard GitHub repository connection: none.

This is an approved non-production proof project, not a production backend or real-user environment.

## PR #22 — protected private proof lane

Implemented:

- separate `apps/private-preview` source tree, excluded from the public build;
- browser proof interface for magic-link Auth, synthetic onboarding, owner snapshot, private portrait upload, publication, discovery, like and match inspection;
- runtime builder that accepts only project URL, `sb_publishable_...` key and exact callback URL;
- syntax validation and recursive artifact scan for server secrets;
- protected manual workflow using GitHub environment `rendezvue-private-preview`;
- project-reference/URL consistency check;
- `supabase link`, migration listing and optional `supabase db push`;
- remote Auth/Data API health checks;
- three-day private workflow artifact;
- complete provisioning and two-account proof runbook in `docs/PRIVATE-SUPABASE-PREVIEW.md`.

The first PR #22 technical head passed the public application checks, retained Docker build and the private artifact/credential-boundary job. The final governance head must pass the complete validation suite before merge.

## Required protected configuration

Create GitHub environment `rendezvue-private-preview` with owner review and `main`-only deployment.

Environment secrets:

- `SUPABASE_PROJECT_REF`;
- `SUPABASE_ACCESS_TOKEN`;
- `SUPABASE_DB_PASSWORD`;
- `SUPABASE_URL`;
- `SUPABASE_PUBLISHABLE_KEY` using `sb_publishable_...`.

Environment variable:

- `RENDEZVUE_AUTH_REDIRECT_URL`, initially `http://127.0.0.1:4174/`.

The exact callback URL must also be added to Supabase Authentication → URL Configuration. Never place these values in source, issues, screenshots or chat.

## Immediate next execution sequence

1. merge PR #22 after final CI;
2. create and protect GitHub environment `rendezvue-private-preview`;
3. add the five secrets and callback variable;
4. configure the exact callback in Supabase Auth;
5. manually run **Deploy private Supabase preview** from `main` with migrations enabled;
6. retain migration and health-check evidence;
7. download and locally serve the short-lived private artifact;
8. create two controlled synthetic adult accounts in isolated browser profiles;
9. validate persistent onboarding, portraits, publication, opposite-sex discovery, reciprocal likes and exactly one match;
10. add administrative pilot-entitlement orchestration and then validate realtime conversation, block/report and deletion cleanup.

## Explicit limitations

- repository migrations are not yet deployed to the remote project;
- protected GitHub environment values are not yet configured through the current development connection;
- real magic-link delivery/callback is unproven;
- recovery and duplicate-account handling are incomplete;
- private object signed delivery and provider cleanup are unproven;
- no private multi-user proof has yet completed;
- no payments, operational moderation, Article 9 production basis or real-user authorization.

## Owner review still required

- desktop/mobile field test of the public pilot;
- mobile camera and all privacy portrait variants;
- terminology for faith, marital history, children and community positioning;
- swipe, contextual like, contact right, chat, feedback, report and block;
- confirmation that the man/woman onboarding flow matches the intended community.
