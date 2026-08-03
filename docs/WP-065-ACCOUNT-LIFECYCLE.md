# WP-065 — Account recovery and lifecycle controls

**Status:** active — WP-065A and WP-065B complete; WP-065C blocked  
**Issue:** #54  
**Started:** 2026-08-03  
**WP-065A/B accepted:** 2026-08-03

## Objective

Close the account-lifecycle gaps after WP-057 without introducing account enumeration, accidental duplicate accounts or premature automated deletion.

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

This closes the immediate duplicate-account risk caused by a mistyped address during an existing-account access attempt. It does not yet provide support-led merging or resolution of genuinely duplicated accounts.

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

## Remaining lifecycle work outside the completed A/B slice

- support-led duplicate-account investigation and resolution;
- restoration or recovery where the user has lost access to the registered mailbox;
- operational hold creation/release procedures;
- approved retention policy and notification copy;
- guarded dry-run and scheduled cleanup only after WP-065C gates are satisfied.

## Current boundary

- canonical environment remains synthetic-only Cloudflare staging;
- real-user admission is unauthorized;
- no active retention policy exists;
- no cleanup candidate currently exists;
- no scheduled or automatic deletion path exists.
