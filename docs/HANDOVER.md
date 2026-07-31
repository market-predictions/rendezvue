# Project handover

**Updated:** 2026-07-31  
**Milestone:** remote Supabase migrations and private artifact proof succeeded

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

This proves remote deployment and browser/server credential separation. It does not yet prove magic-link delivery, two-account interaction, private object deletion or operational moderation.

## Private proof lane

Implemented:

- separate `apps/private-preview` source tree, excluded from the public build;
- browser proof interface for magic-link Auth, synthetic onboarding, owner snapshot, private portrait upload, publication, discovery, like and match inspection;
- runtime builder that accepts only project URL, `sb_publishable_...` key and exact callback URL;
- syntax validation and recursive artifact scan for server secrets;
- protected manual workflow using GitHub environment `rendezvue-private-preview`;
- project-reference/URL consistency check;
- `supabase link`, migration listing and `supabase db push`;
- project Auth and supported Data API metadata health checks;
- three-day private workflow artifact;
- complete provisioning and two-account proof runbook in `docs/PRIVATE-SUPABASE-PREVIEW.md`.

## Immediate next execution sequence

1. download the short-lived artifact from successful workflow run #7;
2. extract it locally and serve `dist-private-preview` on `http://127.0.0.1:4174/`;
3. use two controlled synthetic mailboxes in two isolated browser profiles;
4. prove magic-link delivery, callback, session restore and sign-out;
5. persist and resume onboarding for both accounts;
6. publish one synthetic man and one synthetic woman profile with private synthetic portraits;
7. prove opposite-sex discovery and reciprocal likes create exactly one match;
8. prove neither account can read the other account's draft/family/faith data;
9. add administrative pilot-entitlement orchestration;
10. validate realtime text conversation, block/report and end-contact enforcement;
11. validate signed portrait delivery and provider-side object cleanup;
12. delete both accounts and retain relational/object cleanup evidence.

## Explicit limitations

- real magic-link delivery and callback are not yet proven;
- recovery and duplicate-account handling are incomplete;
- private object signed delivery and provider cleanup are unproven;
- no private two-account interaction proof has yet completed;
- no payments, operational moderation, Article 9 production basis or real-user authorization;
- the workflow artifact is short-lived and intended only for controlled synthetic proof accounts.

## Owner review still required

- desktop/mobile field test of the public pilot;
- mobile camera and all privacy portrait variants;
- terminology for faith, marital history, children and community positioning;
- swipe, contextual like, contact right, chat, feedback, report and block;
- confirmation that the man/woman onboarding flow matches the intended community.
