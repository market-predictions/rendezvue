# WP-065F — Dual-controlled registered-email replacement

**Status:** technical foundation complete and remotely verified; controlled execution proof pending  
**Issue:** #68  
**Accepted foundation:** 2026-08-03

## Decision

Rendezvue will support replacement of a registered login e-mail address when a user has lost access to the original mailbox, subject to strong identity evidence and independent approval.

Account merging remains outside this package.

## Implemented control path

1. Support opens a `mailbox_access_loss` case.
2. Opaque evidence assertions are recorded under WP-065E.
3. The original operator proposes `approved_for_action`.
4. A different operator reviews and approves that decision.
5. The original proposer requests an e-mail-replacement action.
6. The same independent reviewer approves the action.
7. The internal Edge Function receives only the action ID, idempotency key and proposed new address.
8. The function derives the Auth user from the approved case, validates fingerprints and uniqueness, updates exactly that Auth user and requests a PKCE magic link for the new address.

## Security and privacy controls

- mailbox-loss cases only;
- no caller-selected Auth user ID;
- no account merge or password change;
- no plaintext current or target e-mail address in public action, event or audit tables;
- normalized SHA-256 fingerprints only;
- target-mailbox possession and manual identity-review evidence required;
- original proposer and independent reviewer must be different people;
- stale case state or changed evidence invalidates approval;
- one active action per account;
- two-hour execution window after approval;
- maximum three execution attempts;
- thirty-day cooldown after success;
- target address must not belong to another Auth account;
- idempotent claiming, completion and reconciliation;
- append-only action events and sanitized audit payloads;
- ordinary users cannot read or invoke the internal path;
- service role cannot write the action tables directly.

## Evidence

- issue #68;
- PR #69 merged as `2a5579101a04d801ef4383c9b2e8237766474b0e`;
- migrations:
  - `20260803231500_account_support_email_replacement_actions.sql`;
  - `20260803231600_account_email_replacement_cancel_guard.sql`;
- Edge Function `execute-account-email-replacement`;
- pgTAP contract `013_account_email_replacement_actions.test.sql` with 58 assertions;
- Deno type-check and static privacy/security validator passed;
- ordinary CI, application/artifact, Cloudflare, Docker, migration replay, database contracts, concurrency, seed and schema lint passed;
- protected staging migration run `30854571921` passed;
- protected deployment/verifier run `30854641803` confirmed:
  - action/event schema present;
  - actions/events: `0 / 0`;
  - plaintext e-mail columns: `0`;
  - ordinary-user access and invocation denied;
  - service-role direct writes denied;
  - controlled functions and internal executor deployed;
  - account-merge, password-change and support-deletion functions absent.

## Current limitation

No remote e-mail replacement was executed. A legitimate end-to-end proof requires a disposable synthetic account plus a disposable mailbox that can receive the replacement magic link. No such mailbox is currently available to the project.

Local database contracts prove the state machine, Auth-address transition prerequisite, idempotent completion, collision protection, cooldown and deletion-safe history. They do not replace the pending remote mailbox-delivery proof.

## Operational boundary

The technical foundation does not yet authorize support staff to use this process for real users. Before operational activation, Rendezvue still requires:

- an approved real-world identity-evidence policy;
- named support roles and a four-eyes procedure;
- user-facing notice and objection language;
- incident, fraud, rollback and escalation procedures;
- secure support tooling rather than direct database or workflow use;
- explicit real-user and operational authorization.
