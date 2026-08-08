# WP-079 — Synthetic profile photo stand-ins for Live-selfie-era discovery

**Date:** 2026-08-08  
**Issue:** #129  
**Priority:** P2 — integrated test readiness  
**Status:** planned; execute after WP-077 and WP-078, before consolidated discovery/matching owner acceptance

## Owner observation

WP-076 introduced a genuine camera-origin Live selfie as the required authenticity medium for newly published participant profiles. The ten established synthetic discovery fixtures predate that architecture. Each already has one approved photorealistic synthetic portrait, but those fixtures do not carry genuine Live-selfie capture evidence.

The current Live-selfie-era presentation can therefore expose the old illustrated/avatar fallback instead of the approved synthetic portrait. That makes discovery and matchmaking visually regress exactly when the product is being prepared for integrated UX testing.

## Classification

Current classification: `IMPORTANT_DEFERRABLE`.

It becomes `REQUIRED_FOR_CURRENT_RELEASE` when Rendezvue enters the consolidated post-WP-078 desktop/mobile discovery, profile-selection, matching and conversation acceptance run.

## Required outcome

The known synthetic seed profiles must consistently show their already-approved photorealistic synthetic portrait on discovery, full-profile, match/new-match and inbox/conversation surfaces.

For those controlled fixtures, that portrait acts as the **visual stand-in for the Live-selfie-era primary-media position**. This is a staging/test compatibility mechanism only. It is not genuine Live-selfie evidence.

## Truthfulness and security boundary

WP-079 may not weaken or falsify the WP-076 production contract.

Specifically:

- `live_selfie` continues to require `capture_origin = live_camera` for ordinary participant media;
- no seeded portrait may be labelled internally as a successful live-camera capture merely to satisfy a schema or UI expectation;
- no challenge result, liveness proof or capture-proof version may be forged;
- no generic fallback may allow an ordinary account to substitute a gallery/legacy image when a genuine Live selfie is required;
- the compatibility path must be deterministically restricted to the known synthetic seed fixtures;
- real-user admission remains unauthorized.

If the persistent profile-media schema cannot express truthful synthetic-fixture provenance without weakening the live-camera invariant, the implementation should use a narrow synthetic projection/adapter rather than modifying the invariant.

## Preferred implementation shape

1. Inventory the canonical ten synthetic discovery identities and their WP-069A approved photorealistic assets.
2. Maintain one deterministic identity-to-asset mapping.
3. Add a clearly synthetic-scoped compatibility projection that supplies this asset as the effective primary image where Live-selfie-era product surfaces would otherwise fall back to obsolete illustrated avatars.
4. Reuse the same resolver across discovery, full profile, matches/new matches and conversation/inbox presentation wherever possible.
5. Preserve truthful provenance: the asset is a synthetic fixture stand-in, not a live-camera capture.
6. Keep neutral/initial fallback only for profiles that genuinely have no resolvable approved image and are not one of the known seed fixtures.

## Canonical synthetic identities

The compatibility covers the ten established synthetic identities:

- Yasmin
- Bilal
- Amina
- Idris
- Maryam
- Samir
- Noura
- Youssef
- Hafsa
- Omar

Their approved photorealistic assets remain the WP-069A source of truth.

## Acceptance criteria

1. Every one of the ten known synthetic identities resolves to its approved photorealistic portrait in discovery.
2. The same identity resolves to the same portrait in full-profile, match/new-match and inbox/conversation surfaces where a portrait is shown.
3. The illustrated/avatar fallback no longer appears merely because a known synthetic fixture lacks genuine Live-selfie capture evidence.
4. WP-076 tests continue to enforce that a real `live_selfie` must originate from `live_camera`.
5. The compatibility is unavailable to unknown or ordinary participant accounts.
6. No synthetic fixture receives a genuine Live-selfie trust claim, liveness claim or legal identity-verification claim.
7. The deterministic WP-069A mapping remains stable and regression-tested.
8. Discovery/matching owner testing after WP-078 can be performed using realistic photographs rather than obsolete avatars.

## Regression and evidence plan

- unit tests for deterministic synthetic identity-to-portrait resolution;
- explicit negative test that a non-seeded profile cannot use the fixture stand-in path;
- preserved WP-076 profile-media model test proving `live_selfie -> live_camera`;
- rendered synthetic acceptance coverage for at least discovery, one full profile, one new match and one inbox row;
- exact-candidate CI and complete Rendezvue validation;
- owner field review as part of the consolidated post-WP-078 acceptance run.

Because this is synthetic staging compatibility rather than a production-authentication or real-user admission change, it does not need to interrupt WP-077/WP-078. Any implementation candidate must still preserve the project-local implementation/assurance separation appropriate to the final change set.

## Roadmap sequence

```text
WP-077 cohesive selfie composer
        ↓
WP-078 mobile-first touch hardening
        ↓
WP-079 synthetic media compatibility
        ↓
consolidated desktop/mobile discovery + matching acceptance
        ↓
WP-080 closed-city pilot readiness
```

WP-075 remains a separate P1 authentication lane and is mandatory before any real-user admission.
