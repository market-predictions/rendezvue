# WP-066 — Product-facing account and recovery UX

**Status:** complete and deployed to canonical synthetic staging  
**Issue:** #71  
**Implementation PR:** #72  
**Accepted:** 2026-08-03

## Objective

Replace the operator-first account proof surface with an understandable, mobile-first account entry and recovery experience while retaining the complete synthetic backend harness behind an advanced disclosure.

## Delivered user experience

The canonical Cloudflare page now opens with a product-facing account surface rather than the backend proof console.

Users receive:

- Dutch as the default interface language;
- an explicit English toggle with copy parity;
- separate `Aanmeldlink sturen` and `Nieuw account aanmaken` actions;
- a clear statement that ordinary sign-in never silently creates an account;
- generic request confirmations that do not reveal whether an account exists or whether delivery succeeded;
- plain-language guidance for expired, used and wrong-browser magic links;
- a `Geen toegang meer tot je e-mailadres?` explanation of the support route;
- a warning not to create a duplicate account because matches and conversations are not merged automatically;
- a signed-in account overview with the login address masked;
- global sign-out;
- an understandable account-deletion explanation and explicit confirmation gate;
- responsive mobile layout and visible keyboard focus.

## Recovery explanation boundary

The user-facing recovery explanation states that:

- support may replace a login address only as an exceptional route;
- ownership must first be checked;
- support never asks for the password or a complete mailbox code;
- a second employee reviews the decision;
- creating a second account is not the recommended workaround.

The page does not expose internal support case states, evidence categories, operator references, hashes, action IDs or executor details.

## Advanced synthetic tools

The pre-existing profile, portrait, discovery, matching, entitlement, chat, reporting, blocking, cleanup, proof-result and proof-log controls remain available under `Geavanceerde synthetische testtools`.

This preserves the accepted WP-057 and WP-065 validation harness without presenting it as the ordinary user experience.

## Security and privacy contract

- one shared Supabase browser client remains authoritative;
- existing-account access continues to use `shouldCreateUser: false`;
- registration remains the only account-creation path;
- callback processing remains PKCE-based;
- consumed codes and provider error parameters are removed from the address bar;
- the product shell cannot invoke Auth admin methods;
- the product shell cannot invoke the WP-065F registered-email replacement executor;
- no service-role key, secret key or database credential is present in the browser artifact;
- branch previews with placeholder configuration display the backend as unavailable;
- real-user admission remains unauthorized.

## Validation

Implementation PR #72 merged as `45461d51a4cc6ad09b019e0b9165a9bb54ed4cb1`.

The branch passed:

- unit tests for Dutch/English parity;
- generic non-enumerating request messages;
- account-email masking;
- callback classification and URL cleanup;
- dedicated WP-066 source and generated-artifact validation;
- existing WP-057 proof validators;
- existing WP-065 account-entry validator;
- existing WP-065F safety validator;
- application and artifact checks;
- retained Docker build;
- Cloudflare build and security-boundary validation;
- empty-database migration replay;
- all pgTAP contracts;
- concurrency tests;
- deterministic synthetic seed;
- schema lint.

Canonical evidence:

- Cloudflare production verification run `30857567262` confirmed commit-matched deployment, remote rather than placeholder Supabase configuration, PKCE magic links, disabled implicit token fragments and security/no-store headers;
- protected backend run `30857567127` confirmed the canonical Auth URL and allow-list, remote health, cleanup deployment, anonymous cleanup rejection and browser credential boundary.

## Explicit limitations

WP-066 is a product-facing account and recovery explanation, not an operational support console.

It does not:

- execute an e-mail replacement from the browser;
- complete the WP-065F disposable-mailbox execution proof;
- authorize real support operations;
- merge accounts;
- activate retention cleanup;
- admit real users;
- replace formal legal, privacy, accessibility or security acceptance.

## Next product work

- complete controlled WP-065F execution when two suitable disposable mailboxes are available;
- conduct owner review on mobile and desktop;
- integrate the broader onboarding, privacy-portrait, discovery and conversation experience into the same polished product shell;
- approve operational support policy and secure internal tooling before real use;
- progress closed-pilot readiness only after legal, privacy, moderation, age/liveness, accessibility and operational gates are satisfied.
