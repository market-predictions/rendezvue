# WP-072 synthetic contact-entitlement activation

**Date:** 2026-08-05  
**Issue:** #100  
**Status:** implementation in review; canonical owner verification pending

## Owner finding

The canonical Matches screen showed an active match with Proof Noor, but pressing **Gesprek openen** failed with the raw backend error:

`conversation open: no contact entitlement available`

The error was not an ordinary exhausted-right state. It exposed a contract mismatch between the current product onboarding data and the older private-proof entitlement helper.

## Root cause

The current product model stores `terms_version = synthetic-product-2026-08`. The entitlement RPC accepted only `synthetic-proof-2026-07`, so a fully completed and published current product profile failed the entitlement eligibility check.

The browser then compounded the defect by awaiting `supabase.rpc('claim_private_proof_entitlement')` without unwrapping the returned `{ data, error }` structure. Supabase therefore returned an error object without throwing, the product shell continued, and `open_match_conversation()` surfaced the downstream technical message.

## Repair

- Added a forward migration that allowlists both controlled synthetic contracts:
  - `synthetic-proof-2026-07` for the earlier proof fixture;
  - `synthetic-product-2026-08` for the current product onboarding flow.
- Unknown and ordinary terms remain fail-closed.
- The one-time entitlement audit invariant remains unchanged, so consuming one right cannot mint another.
- The product shell now unwraps the entitlement RPC before calling the conversation-opening RPC.
- Failed activation stops the flow immediately.
- Added bilingual product-facing error mapping; raw database messages are no longer shown to participants.

## Regression contract

Application tests verify:

- the current product terms version appears in both product and migration contracts;
- the legacy controlled proof version remains accepted;
- broad wildcard acceptance is not introduced;
- the entitlement call is explicitly unwrapped before conversation opening;
- technical errors map to stable bilingual product copy.

The private-proof pgTAP scenario now validates both current and legacy terms independently while retaining the unknown-terms rejection test and the one-time-consumption assertions.

## Delivery boundary

The protected staging workflow must apply the migration and successfully validate the Cloudflare artifact. The canonical verifier must match the merged commit and inspect the delivered product shell and error model. Issue #100 remains open until the owner confirms that **Gesprek openen** succeeds for the current Proof Noor match after a hard refresh.

Real-user admission remains unauthorized.
