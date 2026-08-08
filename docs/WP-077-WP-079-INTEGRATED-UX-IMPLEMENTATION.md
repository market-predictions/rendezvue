# WP-077 → WP-079 integrated UX implementation record

**Date:** 2026-08-08  
**Branch:** `feature/wp077-wp079-integrated-ux`  
**Base:** `4d272021a5575008b731eaeed149a027ea3353d4`  
**Issues:** #126 / #127 / #129  
**Status:** `IMPLEMENTATION_IN_PROGRESS` until exact-head CI and independent assurance complete

## Primary objective

Deliver the current profile/media UX sequence as one coherent candidate before the next owner acceptance session:

1. WP-077: one bounded Live-selfie task composer;
2. WP-078: mobile-first/coarse-pointer touch hardening on the final structure;
3. WP-079: synthetic-only photorealistic portrait compatibility for integrated discovery/matching tests.

WP-075 remains an independent authentication lane and is not modified by this candidate.

## Implemented scope

### WP-077 — cohesive selfie composer

- Reuses the existing WP-076 camera challenge/capture and WP-074B framing/privacy editor rather than replacing their proven privacy/security behavior.
- Moves Live-selfie capture, camera panel and the existing framing/privacy form into one `.rv-selfie-composer` task region.
- Places optional profile-photo management after that bounded task.
- Adds an adjacent desktop result panel and a locally adjacent mobile result panel.
- Renders the current result with the same `applyPrivacyFilterToCanvas` implementation used by the canonical privacy ladder.
- Preserves `selectedFilterId = null` for a new preparation and therefore preserves explicit no-default privacy choice.
- Keeps capture → frame → privacy → result → decide as the explicit task order.

### WP-078 — mobile-first touch hardening

- Replaces the accidental generic text-input treatment of checkbox/radio controls with a control-type-specific indicator and full-row touch target.
- Uses 48 CSS px as the preferred touch target and 44 CSS px as the absolute compact minimum contract.
- Adds explicit `− / +` alternatives around zoom/range controls while retaining the slider.
- Hardens camera, profile-media, discovery, conversation, safety and disclosure controls for coarse pointers.
- Converts the mobile app navigation to a fixed safe-area-aware bottom navigation while leaving desktop navigation density unchanged.
- Keeps mobile form text at 16 CSS px or above and tightens spacing without shrinking real touch targets.

### WP-079 — synthetic media compatibility

- Adds one deterministic mapping for the ten approved synthetic identities and their existing photorealistic `assets/profiles/*.webp` fixtures.
- Projects those fixtures across synthetic-labelled discovery cards, synthetic full-profile fallback, new-match/inbox rows and selected conversation headers.
- Never assigns `live_camera`, challenge proof or Live-selfie evidence to the stand-in.
- Enables the compatibility only after `deployment.json` confirms:
  - app = `rendezvue-private-preview`;
  - audience = `controlled-synthetic-adult-proof-accounts`;
  - `realUserAdmissionAuthorized = false`.
- Preserves a real prepared/live image when one exists; the synthetic stand-in only replaces obsolete/no-image fixture presentation.

## Preserved boundaries

The candidate does **not** change:

- `live_selfie -> live_camera` enforcement;
- private challenge/raw-media handling;
- WP-074B privacy ladder or explicit-selection rule;
- Supabase RLS/Storage publication semantics;
- legal-identity/liveness claims;
- real-user admission authorization;
- WP-075 authentication behavior.

## Acceptance/evidence plan

Before the candidate can be called release-ready:

1. source syntax and integrated artifact build pass;
2. existing WP-074B/WP-076 regressions pass;
3. new WP-077/WP-078/WP-079 regressions pass;
4. complete Rendezvue validation passes on the exact PR head;
5. Cloudflare branch preview contains an auth-free `visual-acceptance/integrated-ux.html` route;
6. independent `governance_release_assurance` evaluates the exact candidate under the project-local contract;
7. owner visual acceptance checks mobile form controls, selfie workflow clustering and realistic synthetic discovery/matching presentation.

A CI-green implementation candidate is not itself a governance PASS or owner visual acceptance.
