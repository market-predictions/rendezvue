# WP-065 — Account recovery and lifecycle controls

**Status:** active  
**Issue:** #54  
**Started:** 2026-08-03

## Objective

Close the account-lifecycle gaps after WP-057 without introducing account enumeration, accidental duplicate accounts or premature automated deletion.

## WP-065A — Registration and recovery separation

Registration and existing-account access use the same Supabase passwordless provider but are separate product actions.

Required contract:

- existing-account sign-in and recovery use `shouldCreateUser: false`;
- registration alone may use `shouldCreateUser: true`;
- the default `requestMagicLink()` path is fail-closed for existing accounts;
- the Cloudflare proof UI presents two explicit actions;
- the browser response does not reveal whether the account exists, uses another provider or received a message;
- unit tests and an artifact validator reject regressions.

This closes the immediate duplicate-account risk caused by mistyped recovery addresses.

## WP-065B — Lifecycle state and retention candidates

This phase is non-destructive.

Planned contract:

- maintain server-authoritative account lifecycle state and relevant activity timestamps;
- express retention policy through a versioned configuration rather than hard-coded client values;
- produce explainable cleanup candidates and exclusion reasons;
- exclude active accounts, published accounts, active matches/conversations, unresolved safety or moderation records, suspension/appeal cases and explicit retention holds;
- expose candidate enumeration only to a protected service role;
- write audit evidence for policy changes and candidate runs;
- perform no Auth or Storage deletion.

## WP-065C — Guarded scheduled cleanup

This phase remains blocked until retention policy, legal basis and operational ownership are approved.

Required gates:

- policy approval and DPIA alignment;
- dry-run evidence over synthetic fixtures;
- explicit grace period and user notification design;
- idempotent provider cleanup using authenticated/server-authoritative identity;
- no client-selected account UUID or broad object prefix;
- retention holds and unresolved safety cases remain fail-closed;
- rollback and support procedures documented;
- real-user cleanup disabled until real-user admission is separately authorized.

## Current boundary

- canonical environment remains synthetic-only Cloudflare staging;
- real-user admission is unauthorized;
- WP-065A changes only Auth request intent, UI wording, tests and artifact validation;
- no database migration or destructive job is included in WP-065A.
