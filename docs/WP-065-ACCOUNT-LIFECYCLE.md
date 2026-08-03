# WP-065 — Account recovery and lifecycle controls

**Status:** active — WP-065A, WP-065B and WP-065D complete; WP-065C blocked  
**Issue:** #54  
**Started:** 2026-08-03  
**WP-065A/B accepted:** 2026-08-03  
**WP-065D accepted:** 2026-08-03

## Objective

Close the account-lifecycle gaps after WP-057 without introducing account enumeration, accidental duplicate accounts, unsafe support bypasses or premature automated deletion.

## WP-065A — Registration and existing-account recovery separation

**Status:** complete.

Registration and existing-account access use the same Supabase passwordless provider but are separate product actions.

Accepted contract:

- existing-account sign-in and recovery use `shouldCreateUser: false`;
- registration alone may use `shouldCreateUser: true`;
- the default `requestMagicLink()` path is fail-closed for existing accounts;
- the Cloudflare proof UI presents two explicit actions;
- the browser response does not reveal whether the account exists, uses another provider or received a message;
- unit tests and an artifact validator reject regressions.

Evidence:

- PR #55 merged as `a0b5ad00ebc97f54276e49a721a6f54eb7491cd4`;
- ordinary CI, application/artifact, Cloudflare, Docker, migration, pgTAP, concurrency, seed and schema-lint checks passed.

This closes the immediate duplicate-account risk caused by a mistyped address during an existing-account access attempt. It does not provide account merging or mailbox-access restoration.

## WP-065B — Lifecycle state and retention candidates

**Status:** complete and remotely verified; non-destructive.

Accepted contract:

- server-authoritative lifecycle state and relevant activity timestamps;
- versioned retention-policy configuration rather than hard-coded client values;
- no active policy by default;
- explicit open-ended or time-bounded retention holds;
- explainable candidate enumeration for inactive draft accounts;
- exclusion of recent activity, published profiles, active matches, unresolved safety/moderation work and active holds;
- candidate enumeration only for `service_role`;
- no Auth deletion, Storage deletion or scheduler.

Evidence:

- PR #56 merged as `68bbca625f3ee0e1954594f58a0fb2934d7624f2`;
- migration `20260803134500_account_lifecycle_retention_candidates.sql`;
- pgTAP contract `010_account_retention_candidates.test.sql`;
- PR #58 added the protected read-only staging verifier;
- PR #59 moved the verifier into a `bash -n`-checked script after the original YAML heredoc failed before reaching Supabase;
- PR #60 retained the service-role-only function boundary and changed the Management API verifier to calculate aggregate candidates through the same read-only CTE and exclusions;
- protected run `30841983060` verified remotely:
  - lifecycle schema present;
  - active retention policies: `0`;
  - cleanup candidates: `0`;
  - `anon` and `authenticated` enumeration denied;
  - `service_role` enumeration allowed;
  - destructive cleanup and scheduler absent.

No account identifiers or candidate rows are written to workflow or issue evidence.

## WP-065C — Guarded scheduled cleanup

**Status:** blocked.

This phase must not be implemented or activated until retention policy, legal basis and operational ownership are approved.

Required gates:

- approved retention periods and policy version;
- DPIA, privacy-notice and legal-basis alignment;
- explicit grace period and user-notification design;
- dry-run evidence over synthetic fixtures;
- idempotent provider cleanup using authenticated/server-authoritative identity;
- no client-selected account UUID or broad object prefix;
- retention holds and unresolved safety cases remain fail-closed;
- rollback, support and incident procedures documented;
- named operational owner for policy activation and candidate review;
- real-user cleanup disabled until real-user admission is separately authorized.

## WP-065D — Support-safe recovery investigation cases

**Status:** complete and remotely verified; investigation-only.

Accepted contract:

- service-only cases for `duplicate_account` and `mailbox_access_loss` investigations;
- controlled state machine from opening through evidence collection, review, escalation, resolution/rejection and closure;
- optimistic expected-state transitions to reject stale operator actions;
- only opaque ticket, operator and evidence references; raw mailbox addresses are rejected;
- one or two Auth account references according to case kind;
- account references use `ON DELETE SET NULL`, preserving support history without retaining deleted Auth identifiers;
- append-only case events and sanitized audit events;
- `anon` and `authenticated` cannot read or open cases;
- `service_role` may read cases and invoke controlled open/transition functions but cannot insert or update the tables directly;
- no account merge, Auth restoration, e-mail change, support-led deletion or automatic decision function.

Evidence:

- issue #62 and PR #63;
- merge commit `a514443aad5ea4469e4632bc16ce8bc4dd72a148`;
- migrations `20260803185000_account_support_recovery_cases.sql` and `20260803185100_account_support_deletion_safe_references.sql`;
- pgTAP contract `011_account_support_recovery_cases.test.sql` with 38 assertions;
- protected staging migration run `30843752237` passed;
- protected support verifier run `30843828895` confirmed remotely:
  - support schema present;
  - support cases/events: `0 / 0`;
  - anonymous/authenticated access denied;
  - service-role direct writes denied;
  - service-role controlled open/transition functions allowed;
  - account merge, Auth restoration, e-mail change and support deletion functions absent.

WP-065D supplies an auditable investigation control plane only. It does not establish acceptable identity-proof methods, merge duplicate accounts, change an Auth identity or restore access after mailbox loss.

## Remaining lifecycle work

- define and approve evidence standards for duplicate-account and mailbox-loss investigations;
- design any future manual account resolution or restoration action separately, with dual control, audit, notification and rollback;
- define operational retention-hold creation, review and release procedures;
- approve retention policy, grace period and notification copy;
- perform guarded dry-run and scheduled cleanup only after WP-065C gates are satisfied.

## Current boundary

- canonical environment remains synthetic-only Cloudflare staging;
- real-user admission is unauthorized;
- no active retention policy exists;
- no cleanup candidate currently exists;
- no support case currently exists;
- no account merge or mailbox-access restoration function exists;
- no scheduled or automatic deletion path exists.
