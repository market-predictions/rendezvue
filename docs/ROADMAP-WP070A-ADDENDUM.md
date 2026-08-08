# Roadmap addendum — WP-070A moderation intake and triage

**Date:** 2026-08-08  
**Parent:** WP-070 Trust & Safety Operations  
**Issue:** #134  
**Priority:** P1 pilot-readiness dependency  
**Status:** implementation in progress

## Sequencing decision

WP-075 remains a mandatory Phase-3 entry gate but is externally blocked because the current Supabase Free project uses the default e-mail provider and therefore cannot customize the hosted passwordless e-mail template to include the OTP token. Custom SMTP or an explicitly authorized paid-plan change is required before WP-075 can complete.

Control therefore advances the highest-value independent pilot-readiness work rather than weakening WP-075 or idling the project.

Current sequence:

1. preserve the merged WP-075 browser/client implementation and external mail-provider blocker;
2. implement **WP-070A moderation intake and triage foundation**;
3. follow with later WP-070 operational layers for enforcement policy, appeals, support ownership and incident response only after the non-enforcement queue/state model is independently assured;
4. continue Phase-3 readiness work that does not require real-user admission;
5. return to WP-075 immediately when custom SMTP or an authorized plan change makes hosted OTP delivery executable;
6. real-user admission remains prohibited until every Phase-3 entry gate, including WP-075, is complete and an explicit admission decision is recorded.

## Why WP-070A precedes a moderator UI

The existing backend can receive reports, but an operator-facing console would be unsafe if case claiming, stale-write handling, queue priority, event history and controlled state transitions are not yet server-authoritative. WP-070A therefore hardens the operational state machine first. A later UI must consume these functions rather than invent moderation state client-side.

## Scope boundary

WP-070A is non-enforcement infrastructure. It may organize and record review work, but it may not suspend, ban, delete, automatically sanction, expose private moderation state to participants or authorize real-user moderation operations.
