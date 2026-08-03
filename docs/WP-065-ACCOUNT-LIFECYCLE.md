# WP-065 — Account recovery and lifecycle controls

**Status:** active — WP-065A, WP-065B, WP-065D and WP-065E complete; WP-065F foundation complete; WP-065C blocked  
**Issue:** #54  
**Started:** 2026-08-03  
**WP-065A/B accepted:** 2026-08-03  
**WP-065D accepted:** 2026-08-03  
**WP-065E accepted:** 2026-08-03  
**WP-065F foundation accepted:** 2026-08-03

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

## WP-065E — Identity evidence and dual-control support decisions

**Status:** complete and remotely verified; classification-only.

Accepted contract:

- controlled evidence categories, subject scopes, system-derived strengths and assessments;
- opaque token references only; raw mailbox-address-shaped evidence is rejected;
- `approved_for_action`, `insufficient_evidence`, `rejected` and `escalated` outcomes;
- approval requires at least two distinct supportive categories, at least one strong category and no conflicting evidence;
- duplicate-account approval requires evidence coverage for both referenced accounts;
- mailbox-loss approval requires two qualifying primary-account assertions;
- conflicting evidence blocks approval and cannot be downgraded to merely insufficient evidence;
- proposals snapshot case state, case-state timestamp and an evidence fingerprint;
- case or evidence changes invalidate the proposal before review;
- an independent reviewer must differ from the proposing operator;
- append-only proposal/review events and sanitized audits;
- `anon` and `authenticated` cannot read or invoke the evidence/decision functions;
- `service_role` has read access and controlled evidence/proposal/review execution only, without direct writes;
- `approved_for_action` remains a reviewed classification and does not execute a downstream action.

Evidence:

- issue #65 and PR #66;
- merge commit `98af90a56954db689c50bd6ebbb201e056328d53`;
- migration `20260803202500_account_support_identity_evidence_decisions.sql`;
- pgTAP contract `012_account_support_identity_evidence_decisions.test.sql` with 62 assertions;
- protected staging migration run `30850758553` passed;
- protected verifier run `30850822452` confirmed remotely:
  - evidence/decision schema present;
  - evidence/decisions/events: `0 / 0 / 0`;
  - anonymous/authenticated access denied;
  - service-role direct writes denied;
  - service-role controlled evidence/proposal/review functions allowed;
  - account merge, Auth restoration, e-mail change, deletion and action-execution functions absent.

WP-065E establishes evidence classification and four-eyes review only. It does not approve an operational identity-proof policy or authorize account mutation.

## WP-065F — Dual-controlled registered-email replacement

**Status:** technical foundation complete and remotely verified; controlled execution proof pending.

Accepted foundation:

- applies only to `mailbox_access_loss` cases;
- requires an approved WP-065E `approved_for_action` decision;
- the action requester must be the original decision proposer;
- the action approver must be the independent decision reviewer;
- target-mailbox possession and manual identity-review evidence are required;
- no caller-selected Auth user ID;
- current and target e-mail addresses are not persisted in plaintext in public action, event or audit tables;
- normalized SHA-256 fingerprints are persisted instead;
- one active action per account;
- target-address collision protection;
- two-hour execution window after approval;
- maximum three execution attempts;
- thirty-day cooldown after completion;
- idempotent claim, completion and reconciliation;
- append-only events and sanitized audit payloads;
- internal Edge Function derives the Auth user from the approved case, changes exactly that user's e-mail address and requests a non-creating PKCE magic link for the new address;
- ordinary users cannot read or invoke the action path;
- service-role direct table writes remain denied;
- account merge, password change, support deletion and retention activation remain absent.

Evidence:

- issue #68 and PR #69;
- merge commit `2a5579101a04d801ef4383c9b2e8237766474b0e`;
- migrations `20260803231500_account_support_email_replacement_actions.sql` and `20260803231600_account_email_replacement_cancel_guard.sql`;
- Edge Function `execute-account-email-replacement`;
- pgTAP contract `013_account_email_replacement_actions.test.sql` with 58 assertions;
- Deno type-check and static privacy/security validation passed;
- protected staging migration run `30854571921` passed;
- protected deployment/verifier run `30854641803` confirmed remotely:
  - action/event schema present;
  - actions/events: `0 / 0`;
  - plaintext e-mail columns: `0`;
  - ordinary-user access and invocation denied;
  - service-role direct writes denied;
  - controlled functions and internal executor deployed;
  - account-merge, password-change and support-deletion functions absent.

No remote e-mail replacement was executed. The controlled end-to-end proof remains pending because no disposable synthetic mailbox is available to receive the replacement magic link. Detailed evidence: `docs/WP-065F-EMAIL-REPLACEMENT-FOUNDATION.md`.

## Remaining lifecycle work

- provide a disposable synthetic mailbox and account for a controlled WP-065F end-to-end execution proof;
- approve the operational real-world identity-evidence policy and support playbook before any real-user use;
- build secure support tooling rather than exposing service functions or workflows to operators;
- define user notice, objection, fraud, rollback and incident procedures;
- keep duplicate-account merging out of scope unless separately approved and designed;
- define operational retention-hold creation, review and release procedures;
- approve retention policy, grace period and notification copy;
- perform guarded dry-run and scheduled cleanup only after WP-065C gates are satisfied.

## Current boundary

- canonical environment remains synthetic-only Cloudflare staging;
- real-user admission is unauthorized;
- no active retention policy exists;
- no cleanup candidate currently exists;
- no support case, evidence assertion, decision or e-mail-replacement action currently exists;
- the e-mail-replacement foundation is deployed but has not performed a remote replacement;
- no account merge, password-change or scheduled deletion path exists.
