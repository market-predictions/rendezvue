# Roadmap addendum — WP-070B dual-control moderation authorization

**Date:** 2026-08-08  
**Parent:** WP-070 Trust & Safety Operations  
**Issue:** #139  
**Priority:** P1 pilot-readiness dependency  
**Status:** implementation in progress

## Sequencing decision

WP-070A is `OUTCOME_CONFIRMED`. Its intake/triage queue is therefore a stable dependency for the next Trust & Safety layer.

The next package is **WP-070B — dual-control moderation action authorization foundation** because a later enforcement system must not be able to move directly from one operator's investigation to an irreversible/material participant action.

Current Trust & Safety sequence:

1. **WP-070A — intake and triage:** complete and remotely verified;
2. **WP-070B — proposal + independent review:** current package;
3. later WP-070 package(s): policy-bound enforcement execution, specialist escalation procedures, appeals, support ownership and incident response;
4. WP-080 closed-city pilot authorization only after the complete Trust & Safety, legal, privacy, security, support, accessibility and authentication gates are independently satisfied.

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

WP-070B does not authorize real-user moderation operations or real-user admission. Completion requires protected remote verification after merge; even then, the absence of an enforcement executor means the package remains an authorization foundation only.
