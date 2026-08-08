# WP-070B addendum — stale proposal recovery

**Date:** 2026-08-08  
**Parent:** WP-070B dual-control moderation action authorization  
**Issue:** #139  
**Status:** implementation in progress

## Why this addendum exists

An authorization proposal is intentionally bound to the exact moderation case version, state and proposing assignment. If any of those values changes, review must fail closed.

A pure fail-closed implementation creates an operational dead-end if the stale proposal remains `pending`: the one-pending-proposal-per-case invariant would prevent a fresh proposal even though the old proposal can no longer be reviewed.

WP-070B therefore adds a terminal `superseded` state and a controlled service-only stale-recovery RPC.

## Safety contract

`supersede_stale_moderation_action_proposal` may terminally invalidate a proposal **only when the underlying case/version/state/assignment no longer matches its immutable snapshot**.

It cannot supersede a still-current proposal.

A supersede operation:

- changes only the authorization proposal to `superseded`;
- records a terminal timestamp;
- does not create or falsify an independent review record;
- records a sanitized service audit containing the opaque operator reference, proposal/current case version and state, and bounded reason code;
- does not include reporter identity or report free text;
- does not mutate the moderation case or report;
- does not restrict discovery/contact;
- does not block, suspend, terminate or delete a participant;
- does not mutate Supabase Auth;
- does not authorize real-user moderation operations or real-user admission.

After supersede, the existing one-pending index allows a fresh proposal to be created only against the then-current investigating case state and assignment.

## Evidence requirement

The database contract must prove:

1. a current proposal cannot be arbitrarily superseded;
2. a case-version change makes the old proposal unreviewable;
3. the proven-stale proposal can be terminally superseded through the controlled service RPC;
4. no independent review row is fabricated;
5. one sanitized supersede audit is created and retains the opaque operator reference;
6. a fresh proposal can subsequently bind the new case version;
7. one-pending-per-case is restored;
8. no enforcement or account mutation occurs.

The protected post-merge verifier must confirm both WP-070B migrations and the stale-recovery RPC/privilege boundary remotely before `OUTCOME_CONFIRMED`.
