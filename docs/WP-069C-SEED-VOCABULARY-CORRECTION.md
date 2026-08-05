# WP-069C seeded relationship-intent vocabulary correction

**Date:** 2026-08-05  
**Issue:** #94  
**Status:** implemented and locally validated; canonical owner confirmation pending

## Field finding

Owner review of canonical staging found mixed-language profile intent labels in the Dutch interface: `Marriage oriented` appeared alongside `Serieuze relatie`.

## Root cause

The canonical synthetic seed uses two relationship-intent identifiers: `serious_relationship` and `marriage_oriented`. The initial WP-069C display mapper explicitly localized the first value but omitted the second. The generic snake-case fallback therefore converted the omitted identifier to English-looking presentation text instead of Dutch customer copy.

## Correction

- `marriage_oriented` now renders as `Kennismaking met huwelijk als doel` in Dutch.
- `marriage_oriented` now renders as `Getting to know someone with marriage in mind` in English.
- The model test reads `synthetic-seed/profiles.json` and requires the complete seeded relationship-intent vocabulary to match explicit bilingual copy.
- A dedicated verifier tests the source, canonical seed, generated Cloudflare artifact and commit-matched canonical deployment.
- Profile preview and discovery continue to use the same shared presentation boundary.
- Backend identifiers and stored data remain unchanged.

## Validation

The correction passed:

- 12 product-model tests;
- complete synthetic-seed validation for ten profiles and ten portraits;
- Cloudflare artifact generation;
- source and generated-artifact marker checks for both relationship-intent values in Dutch and English.

## Limitations

Issue #94 remains open until the owner visually confirms the corrected labels on canonical staging. Real-user admission remains unauthorized.
