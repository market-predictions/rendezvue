# Project handover

**Updated:** 2026-07-31  
**Milestone:** complete private Supabase harness deployed remotely; controlled two-account proof pending

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
- Public pilot remains synthetic `local-demo` on Hugging Face and was marker-verified after PR #26.

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

The local proof baseline passes 151 pgTAP assertions, true parallel race tests, schema lint, application/artifact checks, Deno Edge Function type checking, local Edge Runtime/CORS/auth-gate smoke testing and Docker validation.

## Remote Supabase evidence

Private non-production project:

- project: `RendezvueProject`;
- status: Healthy;
- region: West EU (Ireland);
- compute: Nano;
- protected GitHub environment: `rendezvue-private-preview`;
- public application connection: none.

Protected workflow run **#8** on `main` commit `8400ebc70d02dc6393e00d48a7b02c9f808559cf` succeeded:

- project migrations linked: yes;
- pending migrations applied: true;
- remote Auth health: passed;
- remote Data API metadata: passed;
- authenticated private account cleanup function deployed: yes;
- unauthenticated cleanup rejection: passed;
- browser artifact contains only the publishable key: validated;
- one short-lived complete private proof artifact generated;
- public Hugging Face pilot changed: no;
- real-user admission authorized: no.

The Node.js 20 annotation from `actions/upload-artifact@v4` is an upstream runner warning and did not affect the successful run.

## Immediate next execution sequence

1. download the single short-lived artifact from protected workflow run #8 before its three-day retention expires;
2. extract it and serve `dist-private-preview` on `http://127.0.0.1:4174/`;
3. use two controlled synthetic mailboxes in two isolated browser profiles;
4. prove magic-link delivery, callback, session recovery and sign-out;
5. persist and publish one synthetic woman and one synthetic man profile;
6. prove cross-account draft/family/faith/object isolation;
7. prove opposite-sex discovery and reciprocal likes create exactly one match;
8. claim one contact right, open exactly one persistent conversation and exchange realtime messages;
9. prove active-match signed portrait delivery and that access stops after end-contact or block;
10. prove private feedback/reporting exposes no public rating or moderation case;
11. invoke authenticated cleanup for both accounts and verify portrait bytes, Auth users and relational records are removed and retained audit identifiers are anonymised;
12. retain only non-secret evidence in issue #21.

## Explicit limitations

- real magic-link delivery and callback are not yet proven;
- the complete two-account remote journey has not yet been executed;
- authenticated remote cleanup and actual object deletion have not yet been observed;
- recovery and duplicate-account controls remain incomplete;
- no payments, operational moderation, Article 9 production basis or real-user authorization;
- the private artifact is short-lived and restricted to controlled synthetic adult proof accounts.

## Owner review still required

- desktop/mobile field test of the public pilot;
- mobile camera and all privacy portrait variants;
- terminology for faith, marital history, children and community positioning;
- swipe, contextual like, contact right, chat, feedback, report and block;
- confirmation that the man/woman onboarding flow matches the intended community.
