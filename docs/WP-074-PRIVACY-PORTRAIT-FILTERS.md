# WP-074 — Mandatory privacy portrait filters

**Date:** 2026-08-06  
**Issue:** #106  
**Status:** implementation candidate; independent assurance and canonical owner acceptance pending

## Owner finding

The integrated WP-069B upload and crop flow did not expose any control to obscure a participant portrait. It produced recognisable card and avatar crops while the interface called the result a privacy portrait. That contradicted ADR-0006 and the product privacy promise.

## Required flow

`upload → frame → choose one of four bounded privacy levels → review → store`

The four stable filter identifiers are `softFocus`, `warmVeil`, `monoMist` and `privacyMax`. There is no raw, original or none option. `warmVeil` is marked as the recommended balance, but no option is selected automatically.

## Privacy boundary

- The normalized source remains private and is never the selected portrait.
- Raw card/avatar crops exist only as browser-memory intermediates.
- The selected privacy recipe is baked into both the 960 × 1200 card and 384 × 384 avatar before upload.
- The server persists the selected filter ID on the complete preparation.
- The legacy registration signature is no longer executable by authenticated users.
- Existing participant-prepared selected cards without filter metadata are deselected and the affected staging profile returns to draft until re-prepared.
- Existing synthetic fixture portraits remain compatible.
- Browser filtering reduces recognisability but is not anonymity or biometric protection.

## Architecture

WP-074 is a separate controller layered over the already verified WP-069B framing model. It mounts after the existing product shell, replaces the visible crop editor, and intercepts the portrait-form submit event at the window capture boundary before the legacy document handler can upload an unfiltered card. This preserves the established framing, path and storage-isolation model while adding a fail-closed privacy transformation.

## Evidence contract

The candidate must pass:

- all application tests, including the exact four-option and raw-value rejection tests;
- generated Cloudflare artifact validation;
- empty-database migration replay;
- pgTAP database assertions for the new RPC, old-signature revocation, filter metadata, treatments, snapshot and audit redaction;
- existing match and entitlement concurrency races;
- deterministic synthetic seed and schema lint;
- protected staging migration and commit-matched canonical delivery checks.

Owner review must compare all four variants on representative desktop and mobile widths and confirm that discovery, matches and conversation views use only the selected filtered portrait.

Real-user admission remains unauthorized.
