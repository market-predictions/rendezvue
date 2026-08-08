# WP-077 → WP-079 integrated UX implementation record

**Date:** 2026-08-08  
**Branch:** `feature/wp077-wp079-integrated-ux`  
**Base:** `4d272021a5575008b731eaeed149a027ea3353d4`  
**Issues:** #126 / #127 / #129  
**Status:** `IMPLEMENTATION_IN_PROGRESS` after owner visual-feedback round; full exact-head validation still running

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
- After owner review, replaces four oversized pill-like phase labels with one compact balanced four-step indicator using small numbered circles plus text labels.

### WP-078 — mobile-first touch hardening

- Replaces the accidental generic text-input treatment of checkbox/radio controls with a control-type-specific indicator and full-row touch target.
- Uses 48 CSS px as the preferred touch target and 44 CSS px as the absolute compact minimum contract.
- Adds explicit `− / +` alternatives around zoom/range controls while retaining the slider.
- Hardens camera, profile-media, discovery, conversation, safety and disclosure controls for coarse pointers.
- Converts the mobile app navigation to a fixed safe-area-aware bottom navigation while leaving desktop navigation density unchanged.
- Keeps mobile form text at 16 CSS px or above and tightens spacing without shrinking real touch targets.
- After owner review, replaces the native browser date-calendar popup on mobile/coarse-pointer layouts with synchronized day/month/year selectors while retaining the canonical ISO date input as the underlying application value.
- After owner review, gives touch/mobile select fields an explicit larger Rendezvue chevron rather than browser-default dropdown chrome.
- After owner review, moves attraction actions immediately below the discovery image and before descriptive profile copy: image → choice → deeper reading.
- After owner review, normalizes participant-name typography between inbox rows and the active conversation header to one shared visual scale.

### WP-079 — synthetic media compatibility

- Adds one deterministic mapping for the ten approved synthetic identities and their existing photorealistic `assets/profiles/*.webp` fixtures.
- Projects those fixtures across synthetic-labelled discovery cards, synthetic full-profile fallback, new-match/inbox rows and selected conversation headers.
- Never assigns `live_camera`, challenge proof or Live-selfie evidence to the stand-in.
- Enables the compatibility only after `deployment.json` confirms:
  - app = `rendezvue-private-preview`;
  - audience = `controlled-synthetic-adult-proof-accounts`;
  - `realUserAdmissionAuthorized = false`.
- Preserves a real prepared/live image when one exists; the synthetic stand-in only replaces obsolete/no-image fixture presentation.

## Owner visual feedback — 2026-08-08 round 1

The first integrated branch-preview acceptance exposed five visible UX mismatches. They are treated as required corrections to the same candidate, not as unrelated enhancements.

| Observation | Required outcome | Verification |
|---|---|---|
| Native date selector opens desktop-like calendar chrome and is not touch-optimized | mobile/coarse-pointer date entry uses large direct day/month/year controls | acceptance fixture + source/artifact regression |
| Native dropdown arrow looks undersized/out of style | select affordance uses a larger deliberate mobile chevron | CSS/source regression + acceptance fixture |
| Four Live-selfie phase pills feel incorrectly scaled | phases read as a compact progress indicator, not four action buttons | composer CSS/source regression + acceptance fixture |
| Like / Overslaan / Met bericht are too far from the visual stimulus | actions sit directly below the image, before descriptive copy | DOM-order regression + acceptance fixture |
| Inbox row and active conversation show the same contact with inconsistent name sizing | participant name uses one shared hierarchy across both contexts | CSS regression + acceptance fixture |

The earlier exact candidate `143e050c53958b986b50e8be3b7bf60b9e0fbf51` is superseded by this correction round and must not be treated as owner-accepted or assurance-current.

## Corrected candidate evidence in progress

Current corrected head: `a2cf3afef83ef4a0d1448c1981b71a53d5f4ee00`.

Observed on that exact head so far:

- CI `31261148198`: PASS.
- WP-069B `31261148215`: PASS.
- WP-069C profile labels `31261148220`: PASS.
- WP-069C seeded vocabulary `31261148196`: PASS.
- WP-071 `31261148212`: PASS.
- WP-072 `31261148222`: PASS.
- WP-073 `31261148230`: PASS.
- WP-074 `31261148200`: PASS.
- WP-076 `31261148221`: PASS.
- Cloudflare Pages branch deployment: PASS on exact head `a2cf3af`.
- Full `Validate Rendezvue` `31261148202`: still running at this record update; no final conclusion claimed yet.

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

Before the corrected candidate can be called release-ready:

1. source syntax and integrated artifact build pass;
2. existing WP-074B/WP-076 regressions pass;
3. WP-077/WP-078/WP-079 regressions include the five owner-feedback corrections and pass;
4. complete Rendezvue validation passes on the exact corrected PR head;
5. Cloudflare branch preview contains an auth-free `visual-acceptance/integrated-ux.html` route built from that same head;
6. owner rechecks mobile DOB/select controls, selfie-step balance, discovery action placement and inbox/contact hierarchy;
7. independent `governance_release_assurance` evaluates the exact owner-accepted candidate under the project-local contract.

A CI-green implementation candidate is not itself a governance PASS or owner visual acceptance.
