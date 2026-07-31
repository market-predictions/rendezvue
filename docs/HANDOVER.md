# Project handover

**Updated:** 2026-07-31  
**Milestone:** remote Supabase foundation proven; complete synthetic interaction and cleanup harness validated locally

## GitHub state

- Authority: `market-predictions/rendezvue` `main`.
- Product baseline v1: PR #14 merged and publicly deployed.
- Deployment marker fix: PR #15 merged and verified.
- Man/woman onboarding policy: PR #16 merged and hosted.
- Backend foundation: PR #17 merged as `8bbf1398`.
- True parallel race proof: PR #19 merged as `5976ddea`.
- Auth/onboarding persistence: PR #20 merged as `1de81465`.
- Protected private Supabase lane: PR #22 merged as `5a532629`.
- Missing-setting diagnostics: PR #23 merged as `ecae0b48`.
- Supported remote health checks: PR #24 merged as `9403330f`.
- Contact/chat/safety proof harness: PR #25 merged as `11964e91`.
- Provider-orchestrated account cleanup: PR #26 in validation.
- Public pilot remains synthetic `local-demo` on Hugging Face and was marker-verified after PR #25.

## Product baseline

Rendezvue is adult, currently-single and serious-intent, with student-first open membership. Student verification is optional. Life stage, marital history, children, child wish, faith/lifestyle, fuzzy privacy portraits, free discovery/likes and paid conversation opening remain separate product domains. Public stars, downvotes and popularity counts are prohibited. The community flow uses man/woman sex options and derives opposite-sex discovery.

## Public concept pilot

The public PWA demonstrates progressive Dutch/English onboarding, simulated student verification, live selfie/privacy portraits, synthetic discovery, pass/direct/contextual likes, swipe, deterministic match, simulated contact right, local text chat, feedback, report and block. It is not a real multi-user service and receives no private Supabase runtime configuration.

## Backend, interaction and cleanup foundation

Implemented and validated:

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
- server-side publication gate and cross-account draft isolation;
- one-time synthetic proof entitlement that cannot be reissued after consumption;
- participant-controlled contact ending;
- active-match-only selected portrait access;
- private conversation and message Realtime publication;
- authenticated Edge Function for private-object and Auth-account cleanup;
- exact destructive confirmation with no client-supplied user ID;
- storage-first deletion so object failure leaves the Auth account retryable;
- local browser control using the one shared Supabase client;
- protected deployment and anonymous-request rejection check.

The current local proof baseline passes 151 pgTAP assertions, true parallel race tests, schema lint, client/artifact checks, Deno Edge Function type checking, function runtime/auth-gate smoke testing and Docker validation.

## Supabase project and remote proof evidence

Private non-production project:

- project: `RendezvueProject`;
- status: Healthy;
- region: West EU (Ireland);
- compute: Nano;
- protected GitHub environment: `rendezvue-private-preview`;
- public application connection: none.

Private preview workflow run #7 succeeded on commit `9403330f`:

- repository migrations linked: yes;
- pending migrations applied: true;
- remote Auth health: passed;
- remote Data API metadata: passed;
- browser artifact publishable-key boundary: validated;
- generated artifacts: one short-lived private proof artifact;
- public Hugging Face pilot changed: no;
- real-user admission authorized: no.

This proves remote deployment and browser/server credential separation for migrations through `9403330f`. PR #25 adds the interaction migration; PR #26 adds the cleanup function. Both require a fresh protected workflow run after PR #26 is merged.

## Private proof lane

Implemented and validated in the generated artifact:

- separate `apps/private-preview` source tree, excluded from the public build;
- one shared browser Auth client for PKCE callback, onboarding, interaction and cleanup operations;
- magic-link Auth, synthetic onboarding, owner snapshot and private portrait upload;
- server-side publication, opposite-sex discovery, like and match inspection;
- one-time synthetic proof contact entitlement;
- idempotent conversation opening;
- participant-only realtime text messaging;
- short-lived signed matched-portrait delivery;
- normal end-contact, block, safety report and private feedback controls;
- authenticated provider cleanup of private portraits and Auth user;
- runtime builder accepting only project URL, `sb_publishable_...` key and exact callback URL;
- syntax validation and recursive artifact scan for server secrets;
- protected manual workflow using GitHub environment `rendezvue-private-preview`;
- migration push, Edge Function deploy, platform health and unauthenticated cleanup rejection checks;
- three-day private workflow artifact;
- complete two-account proof protocol in `docs/PRIVATE-SUPABASE-PREVIEW.md` and issue #21.

## Immediate next execution sequence

1. merge PR #26 after final CI is green;
2. start `Deploy private Supabase preview` from `main` with `apply_migrations: true`;
3. verify the interaction migration and `delete-private-proof-account` function deploy;
4. verify remote Auth/Data API health and unauthenticated cleanup HTTP 401;
5. download the newly generated short-lived artifact rather than run #7;
6. serve `dist-private-preview` on `http://127.0.0.1:4174/`;
7. use two controlled synthetic mailboxes in two isolated browser profiles;
8. prove Auth, session recovery, onboarding, publication, discovery and exactly one match;
9. prove one contact right, one persistent conversation, realtime messages and active-match portrait delivery;
10. prove end-contact, block, private report and private feedback enforcement;
11. invoke provider cleanup for both accounts and verify private object, relational, Auth and anonymised-audit outcomes;
12. retain evidence without tokens, magic links, signed URLs, keys or object paths.

## Explicit limitations

- real magic-link delivery and callback are not yet proven;
- recovery and duplicate-account handling are incomplete;
- remote signed delivery and provider cleanup are not yet executed;
- no private two-account interaction proof has yet completed;
- no payments, operational moderation, Article 9 production basis or real-user authorization;
- the workflow artifact is short-lived and intended only for controlled synthetic proof accounts.

## Owner review still required

- desktop/mobile field test of the public pilot;
- mobile camera and all privacy portrait variants;
- terminology for faith, marital history, children and community positioning;
- swipe, contextual like, contact right, chat, feedback, report and block;
- confirmation that the man/woman onboarding flow matches the intended community.
