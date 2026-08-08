# WP-077 — Cohesive selfie creation, framing, privacy and result flow

**Date:** 2026-08-08  
**Issue:** #126  
**Priority:** P1 — real-user-readiness UX  
**Status:** planned; next UX-architecture package after WP-076 owner-correction closeout

## Owner observation

The Live-selfie architecture is functionally separated into capture, image preparation, privacy presentation and profile-media/result areas, but the participant experiences those as one task: **make the best usable selfie**.

In the current composition, the participant may need to move up and down through the page to:

1. take or retake the Live selfie;
2. inspect the capture;
3. frame and zoom it;
4. choose a privacy presentation;
5. inspect the prepared result;
6. return to an earlier control when the result is not good enough.

That is a workflow-architecture defect. Related controls are individually understandable, but their spatial separation makes one coherent task feel like several unrelated form sections.

## Governing principle

**Task coherence precedes control polish.**

Rendezvue should first make the complete Live-selfie preparation loop one bounded workflow. Only after that final structure is stable should WP-078 apply the global mobile-first touch-control system.

The participant should never have to remember where a related control lives elsewhere on the page while refining the current selfie.

## Required participant flow

The primary Live-selfie composer follows this order:

1. **Capture** — start camera challenge, take the Live selfie or retake it.
2. **Inspect** — immediately see the captured/prepared frame that will be edited.
3. **Frame** — pan and zoom with the existing safe-area guidance.
4. **Privacy** — choose one WP-074B presentation: Zonder filter / Unfiltered, Natural, Zacht privé / Soft private or Meer privé / More private.
5. **Result** — immediately see the current prepared result affected by framing and privacy selection.
6. **Decide** — use this selfie, refine it or retake it without leaving the composer.

Optional profile-photo management comes **after** this primary workflow and must not interrupt it.

## Desktop composition

Desktop may use a wider task workspace, preferably with:

- controls and sequence on one side;
- a persistent or locally adjacent prepared-result preview on the other;
- framing/privacy changes reflected without navigating to another page section;
- optional extra-photo management visually separated below the completed Live-selfie task.

Desktop must remain compact and premium rather than inheriting an oversized mobile layout.

## Mobile composition

Mobile uses one compact sequential composer:

- no unrelated section between capture, framing, privacy selection and result;
- the next relevant control or result remains within the same local task region;
- the result preview is adjacent to the controls that alter it, or remains locally reachable through a compact sticky/step treatment;
- retake/refine loops stay inside the composer;
- the workflow does not require precision scrolling between distant blocks.

WP-077 may introduce the local mobile composition needed to make the flow coherent, but global touch-target sizing and full-product control hardening belong to WP-078.

## State contract

- A newly started selfie preparation keeps the WP-074B rule that no privacy presentation is silently selected.
- Once the participant deliberately selects a privacy presentation, that selection may persist while they refine or retake within the same active edit session so repeated comparison does not create unnecessary work.
- Framing and privacy changes must update the visible prepared result deterministically.
- Confirming the selfie commits the current explicit preparation; stale result state may not be presented as current.
- Retaking must not expose or persist the short challenge recording as profile media.

## Preserved boundaries

WP-077 does **not** change:

- the camera-origin Live-selfie requirement from WP-076;
- the rule that challenge/raw media remains private and is not profile media;
- the absence of any legal identity-verification claim;
- the absence of an automated-liveness claim;
- the WP-074B privacy ladder or prepared-derivative privacy boundary;
- publication gating, Storage/RLS or discovery-primary semantics unless a separately proven defect requires a scoped correction;
- the maximum of two optional camera/gallery profile photos.

## Acceptance criteria

1. At representative mobile width, a participant can complete capture → frame/zoom → privacy → result → confirm/retake without scrolling through an unrelated section or rediscovering a related control elsewhere on the page.
2. The current result is visually adjacent to the controls that modify it.
3. Retake and refinement stay in the same composer.
4. Optional profile-photo controls are subordinate to and separated from Live-selfie creation.
5. Desktop preserves a compact premium composition and does not simply scale up the mobile stack.
6. The WP-074B no-default-selection rule remains true for a new preparation.
7. Existing WP-074B and WP-076 privacy, camera, trust and publication contracts continue to pass.
8. Keyboard/focus semantics, reduced-motion support and explicit button alternatives remain intact.
9. An auth-free synthetic branch-preview acceptance route shows the complete workflow architecture for owner review.
10. Regression coverage checks workflow order, local adjacency/state consistency and preserved privacy/trust boundaries.

## Evidence plan

- source-level workflow/state tests;
- existing WP-074B and WP-076 regression suites;
- generated Cloudflare artifact checks;
- representative mobile-width and desktop-width synthetic visual acceptance;
- exact-candidate CI;
- independent `governance_release_assurance` before release/merge when required by the project-local consequential-change contract;
- owner visual acceptance after a branch/canonical preview exposes the complete flow.

## Dependency and sequence

```text
WP-076 owner-correction closeout
        ↓
WP-077 cohesive selfie task architecture
        ↓
WP-078 mobile-first touch interaction hardening
        ↓
integrated desktop/mobile owner acceptance
        ↓
WP-080 closed-pilot readiness
```

WP-075 cross-browser OTP remains a separate P1 authentication lane. It may execute in parallel when there is independent implementation capacity; it does not need to interrupt the WP-077 → WP-078 UX dependency chain. Both lines are mandatory before real-user admission.
