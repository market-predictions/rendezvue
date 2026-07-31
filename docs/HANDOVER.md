# Project handover

**Updated:** 2026-07-31  
**Milestone:** private Supabase foundation deployed; dedicated private Hugging Face preview deployment prepared; controlled two-account proof pending

## GitHub state

- Authority: `market-predictions/rendezvue` `main`.
- Product baseline v1: PR #14 merged and publicly deployed.
- Man/woman onboarding policy: PR #16 merged and hosted.
- Backend foundation: PR #17 merged as `8bbf1398`.
- True parallel race proof: PR #19 merged as `5976ddea`.
- Auth/onboarding persistence: PR #20 merged as `1de81465`.
- Protected private Supabase lane: PR #22 merged as `5a532629`.
- Supported remote health checks: PR #24 merged as `9403330f`.
- Contact/chat/safety proof harness: PR #25 merged as `11964e91`.
- Provider-orchestrated account cleanup: PR #26 merged as `8400ebc7`.
- Public pilot remains synthetic `local-demo` on Hugging Face.
- No owner-local Git, Node, Python, Docker or webserver is part of the project workflow.

## Product baseline

Rendezvue is adult, currently-single and serious-intent, with student-first open membership. Student verification is optional. Life stage, marital history, children, child wish, faith/lifestyle, fuzzy privacy portraits, free discovery/likes and paid conversation opening remain separate product domains. Public stars, downvotes and popularity counts are prohibited. The community flow uses man/woman sex options and derives opposite-sex discovery.

## Implemented backend and private proof harness

Implemented and validated:

- versioned Supabase/PostgreSQL migrations;
- RLS and least-privilege grants;
- private portrait storage;
- server-authoritative attraction, matching, contact entitlement, conversation, message, block, feedback and report operations;
- hidden moderation/audit domains and high-severity escalation;
- true parallel first-like and contact-opening race protection;
- magic-link/session adapter and one shared browser Auth client;
- owner-scoped resumable onboarding, prompts/interests and sanitized snapshot;
- server-side profile publication and opposite-sex discovery;
- one-time synthetic proof entitlement that cannot be reissued after consumption;
- participant-controlled contact ending;
- active-match-only selected portrait access;
- Realtime conversation/message publication;
- authenticated Edge Function for UUID-scoped portrait deletion followed by Auth-account deletion;
- relational cascades and retained audit-ID anonymisation;
- exact destructive confirmation with no client-supplied user ID;
- storage-first deletion so object failure leaves the Auth account retryable.

GitHub Actions validation passes 151 pgTAP assertions, true parallel race tests, schema lint, application/artifact checks, Deno Edge Function type checking, Edge Runtime/CORS/auth-gate smoke testing and Docker validation.

## Hosted architecture

Rendezvue has two separate generated Hugging Face lanes:

1. public concept pilot: `solidprivacy/rendezvue`, always `local-demo`;
2. private proof: `solidprivacy/rendezvue-private-preview`, private Static Space connected to `RendezvueProject`.

The private Space deployment route:

- is triggered only from the protected GitHub environment;
- builds in GitHub Actions;
- embeds only the Supabase URL and browser publishable key;
- automatically configures the Supabase Auth HTTPS callback;
- reasserts private Hugging Face visibility;
- uploads the generated static application;
- verifies repository metadata and build commit;
- never publishes the private application through the public Space;
- requires no downloaded artifact or localhost runtime.

## Remote Supabase evidence

Private non-production project:

- project: `RendezvueProject`;
- status: Healthy;
- region: West EU (Ireland);
- compute: Nano;
- protected GitHub environment: `rendezvue-private-preview`;
- public application connection: none.

Protected workflow run **#8** on `main` commit `8400ebc70d02dc6393e00d48a7b02c9f808559cf` proved:

- project migrations linked;
- pending migrations applied;
- remote Auth health passed;
- remote Data API metadata passed;
- authenticated account cleanup deployed;
- unauthenticated cleanup rejected;
- browser artifact contained only the publishable key;
- public Hugging Face pilot remained unchanged;
- real-user admission remained unauthorized.

## Immediate next execution sequence

1. merge the private Hugging Face hosting correction;
2. run **Deploy private Supabase preview** from `main` with `apply_migrations=true`;
3. verify the created Space is private and inaccessible to an unauthorized Hugging Face account;
4. open the private Space in two isolated authorized browser profiles;
5. use two controlled synthetic mailboxes;
6. prove magic-link delivery, callback, session recovery and sign-out;
7. persist and publish one synthetic woman and one synthetic man profile;
8. prove cross-account draft/family/faith/object isolation;
9. prove opposite-sex discovery and reciprocal likes create exactly one match;
10. claim one contact right, open exactly one conversation and exchange realtime messages;
11. prove active-match signed portrait delivery and that access stops after end-contact or block;
12. prove private feedback/reporting exposes no public rating or moderation case;
13. invoke authenticated cleanup for both accounts and verify portrait bytes, Auth users and relational records are removed and retained audit identifiers are anonymised;
14. retain only non-secret evidence in issue #21.

## Explicit limitations

- the dedicated private Hugging Face Space has not yet been created and verified by the protected workflow;
- real magic-link delivery and callback are not yet proven;
- the complete two-account remote journey has not yet been executed;
- authenticated remote cleanup and actual object deletion have not yet been observed;
- recovery and duplicate-account controls remain incomplete;
- no payments, operational moderation, Article 9 production basis or real-user authorization;
- the private proof is restricted to controlled synthetic adult accounts.

## Owner review still required

- desktop/mobile field test of the public pilot;
- mobile camera and all privacy portrait variants;
- terminology for faith, marital history, children and community positioning;
- swipe, contextual like, contact right, chat, feedback, report and block;
- confirmation that the man/woman onboarding flow matches the intended community.
