# Roadmap addendum — WP-070A moderation intake and triage

**Date:** 2026-08-08  
**Parent:** WP-070 Trust & Safety Operations  
**Issue:** #134  
**Priority:** P1 pilot-readiness dependency  
**Status:** merged to main; protected staging migration applied; post-action remote verification in progress through issue #136 / PR #137

## Sequencing decision

WP-075 remains a mandatory Phase-3 entry gate but is externally blocked because the current Supabase Free project uses the default e-mail provider and therefore cannot customize the hosted passwordless e-mail template to include the OTP token. Custom SMTP or an explicitly authorized paid-plan/provider change is required before WP-075 can complete.

Control therefore advances the highest-value independent pilot-readiness work rather than weakening WP-075 or idling the project.

Current sequence:

1. keep the merged WP-075 browser/client implementation dormant on canonical staging while hosted OTP delivery is unproven; PKCE magic link remains the truthful active passwordless path;
2. close WP-070A post-action evidence on exact main with a durable protected remote verifier;
3. repair the generic Cloudflare verifier so it follows the current WP-073 conversation-controller architecture rather than stale pre-WP-073 source markers;
4. after WP-070A reaches independently confirmed remote completion, continue later WP-070 operational layers for enforcement policy, appeals, support ownership and incident response;
5. continue Phase-3 readiness work that does not require real-user admission;
6. return to WP-075 activation immediately when custom SMTP or an authorized plan/provider change makes hosted OTP delivery executable;
7. real-user admission remains prohibited until every Phase-3 entry gate, including WP-075, is complete and an explicit admission decision is recorded.

## WP-070A evidence state

The implementation candidate passed independent governance/release assurance and PR #135 was merged to main as `ccaa89778c089ff4254c7d8ce79fb8b963049045`.

Post-merge protected staging run `31266031198` successfully applied the pending repository migrations, including:

- `20260808154500_moderation_intake_triage.sql`;
- `20260808160000_moderation_claim_event_consistency.sql`.

The generic canonical Pages verifier then failed on an obsolete requirement that `open_match_conversation` must still live in `product-shell.js`; WP-073 intentionally moved that responsibility into `conversation-inbox-controller.js`. Issue #136 / PR #137 treats this as verifier drift and adds a dedicated read-only protected WP-070A verifier so database completion is not inferred from a stale UI-source marker.

WP-070A is not `OUTCOME_CONFIRMED` until that exact-main protected verifier passes.

## Why WP-070A precedes a moderator UI

The existing backend can receive reports, but an operator-facing console would be unsafe if case claiming, stale-write handling, queue priority, event history and controlled state transitions are not yet server-authoritative. WP-070A therefore hardens the operational state machine first. A later UI must consume these functions rather than invent moderation state client-side.

## Scope boundary

WP-070A is non-enforcement infrastructure. It may organize and record review work, but it may not suspend, ban, delete, automatically sanction, expose private moderation state to participants or authorize real-user moderation operations.
