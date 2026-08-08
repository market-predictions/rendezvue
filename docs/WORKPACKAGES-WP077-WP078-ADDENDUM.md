# Work-package addendum — WP-077 / WP-078

**Date:** 2026-08-08  
**Applies until:** the next consolidated `docs/WORKPACKAGES.md` revision

## WP-077 — Cohesive selfie creation, framing, privacy and result flow

**Status:** planned; P1 real-user readiness; issue #126  
**Dependency:** current WP-076 owner-correction closeout  
**Blocks:** WP-078 and final integrated mobile owner acceptance

Live-selfie creation becomes one bounded participant task: capture/retake → inspect → frame/zoom → choose WP-074B privacy presentation → inspect the current prepared result → confirm/refine/retake. Optional profile-photo management remains separate and subordinate. The privacy ladder, camera-origin requirement, private raw/challenge boundaries, publication semantics and non-identity-verification language remain unchanged.

Detailed contract: `docs/WP-077-COHESIVE-SELFIE-CREATION-FLOW.md`.

## WP-078 — Mobile-first touch interaction hardening

**Status:** planned; P1 real-user readiness; issue #127  
**Dependency:** WP-077 task architecture  
**Blocks:** final integrated mobile owner acceptance and WP-080 pilot readiness

Apply one explicit touch-control system across forms, checkbox/radio rows, date/select/text controls, range/zoom, file/camera actions, navigation, disclosure rows, discovery, profile media, messaging, safety and account actions. Mobile/coarse-pointer interaction becomes finger-first while desktop retains compact premium density. Existing generic-input regression assumptions are replaced with control-type-specific contracts.

Detailed contract: `docs/WP-078-MOBILE-FIRST-TOUCH-HARDENING.md`.

## Sequence

```text
WP-076 correction closeout
        ↓
WP-077
        ↓
WP-078
        ↓
integrated desktop/mobile acceptance
        ↓
WP-080
```

WP-075 remains a separate P1 authentication lane and may execute in parallel if independent capacity exists. WP-075, WP-077 and WP-078 are all required before real-user admission.
