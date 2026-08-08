# WP-078 — Mobile-first touch interaction hardening

**Date:** 2026-08-08  
**Issue:** #127  
**Priority:** P1 — real-user-readiness UX  
**Status:** planned; depends on WP-077 task architecture

## Owner observation

The current product is responsive in layout but not yet consistently mobile-first in interaction. The profile screenshot exposes the clearest example: confirmation rows are visually large while the actual native checkbox affordance remains tiny. Similar touch friction can occur in navigation, range/zoom, media controls, language controls, disclosures, discovery actions, messaging and safety actions.

## Governing principle

**Design for the finger on mobile/coarse-pointer devices without making desktop unnecessarily oversized.**

Responsive layout and responsive interaction are separate concerns:

- viewport/container breakpoints control layout;
- `pointer: coarse` / `hover: none` and mobile breakpoints control touch ergonomics.

## Central control contract

Controls must be classified explicitly rather than inheriting one generic `input` rule:

- text/e-mail/date inputs;
- selects;
- textareas;
- checkbox/radio rows;
- range/zoom controls;
- file/camera controls;
- primary/secondary/destructive buttons;
- navigation controls;
- disclosure/summary rows;
- media viewer controls.

Primary touch controls should target at least 48×48 CSS pixels on coarse-pointer/mobile surfaces. Secondary compact controls may use 44×44 as an absolute lower bound where density materially matters.

## Scope

- make checkbox/radio rows fully tappable and give the visible state affordance proportional size;
- ensure checkbox/radio inputs do not inherit text-input padding, min-height or box styling;
- preserve native date/select pickers while giving them comfortable touch sizing;
- keep mobile form text large enough to avoid unintended browser auto-zoom;
- enlarge range/zoom thumb and track interaction and provide explicit `− / +` or equivalent button alternatives where helpful;
- harden bottom navigation and high-frequency product actions;
- harden NL/EN controls, `<summary>` disclosures and account actions;
- harden discovery pass/like/respond actions;
- harden conversation list, back/send and safety/report/block/end-contact actions;
- harden WP-076/WP-077 camera, media-slot, viewer and confirm/retake actions;
- optimize vertical rhythm for one-hand scanning without merely making every element larger;
- prevent horizontal overflow on representative small viewports;
- preserve keyboard focus, screen-reader labeling and reduced-motion behavior;
- provide an auth-free synthetic mobile-control gallery for owner acceptance.

## Preserved boundaries

WP-078 does not redefine the Live-selfie task order; WP-077 must establish that first. It also does not change authentication, Storage/RLS, publication, privacy, trust, match, conversation or moderation semantics.

Desktop should retain the current premium density and hierarchy unless a specific accessibility defect requires a shared change.

## Acceptance criteria

1. On coarse-pointer/mobile surfaces, primary interactive targets are at least 48×48 CSS pixels and secondary compact targets are never below 44×44 without an explicit exception.
2. Checkbox/radio rows are fully tappable and the visible checkbox/radio state is proportionate to the row.
3. Checkbox/radio controls do not inherit text-input min-height/padding/box styling.
4. Text/date/select controls remain readable, comfortable and native-platform friendly.
5. Range/zoom is comfortably operable by touch and has an explicit non-drag alternative where useful.
6. Bottom navigation and other high-frequency actions are one-hand operable.
7. No horizontal overflow appears at representative widths such as 320, 360, 390 and 430 CSS pixels.
8. Desktop pointer layouts preserve premium compact density.
9. Keyboard focus, screen-reader semantics and reduced-motion behavior remain intact.
10. Regression tests are control-type specific instead of asserting one generic input size.
11. An auth-free branch-preview control gallery exposes representative checked/unchecked, input, select, date, textarea, range, buttons, upload/media, navigation and message-composer states.

## Dependency

WP-078 starts after WP-077 has fixed the selfie workflow architecture. This prevents touch-hardening controls that are about to be moved or recomposed.

WP-075 cross-browser OTP is a separate P1 authentication lane and may run in parallel if separate implementation capacity exists. WP-075, WP-077 and WP-078 all remain mandatory before WP-080 real-user pilot authorization.
