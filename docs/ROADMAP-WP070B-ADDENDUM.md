# Roadmap addendum — WP-070B dual-control moderation authorization

**Date:** 2026-08-08  
**Parent:** WP-070 Trust & Safety Operations  
**Issue:** #139  
**Priority:** P1 pilot-readiness dependency  
**Status:** `OUTCOME_CONFIRMED`

## Outcome confirmation

WP-070B is outcome-confirmed on canonical `main` commit `7e868bd08234028da86f5210158ff0a76de54335`.

The implementation was independently assured before merge. A first post-merge verifier exposed a sequencing race: remote verification could start before the protected backend workflow had finished applying the newly merged migrations. Repair PR #141 changed the gate from parallel `push` verification to a causally ordered `workflow_run` chain and bound all evidence to the upstream exact `head_sha`.

Final post-action evidence:

- protected backend configuration run `31275987796`: PASS on `7e868bd08234028da86f5210158ff0a76de54335`;
- protected WP-070B verifier run `31276028649`: PASS on the same exact commit;
- remote migrations/schema/RPC/privilege/stale-recovery/durable-audit contract: PASS;
- canonical Cloudflare deployment boundary: exact-commit matched;
- enforcement execution capability: not introduced;
- real-user admission: unauthorized.

## Sequencing decision

WP-070A and WP-070B are now both `OUTCOME_CONFIRMED`.

Current Trust & Safety sequence:

1. **WP-070A — intake and triage:** complete and remotely verified;
2. **WP-070B — proposal + independent review:** complete and remotely verified;
3. **next WP-070 package:** define and prove the next policy-bound layer without weakening the already-proven intake or dual-control authorization boundaries;
4. later WP-070 packages: specialist escalation procedures, appeals, support ownership and incident response;
5. WP-080 closed-city pilot authorization only after the complete Trust & Safety, legal, privacy, security, support, accessibility and authentication gates are independently satisfied.

The next package must not infer that an approved WP-070B proposal is permission for unrestricted or irreversible enforcement. Any executor must be separately scoped, policy-bound, independently assured and remotely verified.

## Relation to WP-075

WP-075 remains P1 and mandatory before real-user pilot admission, but hosted e-mail OTP activation is externally blocked on custom SMTP or an explicitly authorized provider/plan change. The browser/client implementation remains in source while canonical staging truthfully retains PKCE magic-link authentication.

That external dependency does not justify idling the independent Trust & Safety readiness line and does not authorize weakening WP-075.

## Why authorization precedes enforcement

WP-070B is deliberately non-effectful. It creates immutable proposal snapshots and a second-operator decision but does not execute the proposed action.

This ordering ensures that any future executor can be built against an already-proven authorization object with:

- exact case-version binding;
- independent reviewer evidence;
- critical-safety escalation rules;
- one terminal decision under concurrency;
- sanitized audit history;
- no participant-accessible moderation state.

A future enforcement package must consume this contract rather than inventing its own approval state.

## Critical-safety boundary

Critical reports may not receive an ordinary approval in WP-070B. They can be rejected or escalated for a later specialist/policy path. External reporting obligations/procedures remain a separate legal/operational dependency and are not inferred from code.

## Pilot boundary

WP-070B does not authorize real-user moderation operations or real-user admission. Its completion confirms only that the dual-control authorization foundation is implemented, independently assured and remotely present. The absence of a separately governed enforcement, specialist-escalation, appeals and operating-procedure layer remains a WP-080 blocker.
