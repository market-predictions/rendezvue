# Roadmap addendum — WP-077 / WP-078 UX sequence

**Date:** 2026-08-08  
**Applies to:** Rendezvue roadmap 2.18 until incorporated into the next full roadmap revision

## Owner field findings

Two related but distinct usability findings are now explicit:

1. **Workflow clustering defect:** Live-selfie capture, framing/zoom, privacy choice and result inspection are parts of one participant task but are currently distributed across multiple blocks, causing repeated page scrolling while refining one selfie.
2. **Mobile touch defect:** the responsive interface is not yet consistently finger-first; several controls retain small/native interaction affordances or desktop interaction assumptions even when the surrounding mobile layout is large.

These must not be implemented in the reverse order. Touch-hardening an interim workflow would create rework and could preserve the wrong information architecture.

## New work packages

### WP-077 — Cohesive selfie creation, framing, privacy and result flow

**Issue:** #126  
**Priority:** P1 real-user readiness  
**Dependency:** satisfied — WP-076 owner correction merged as `c62b6fad3d67535726055599680f888aa071310d`  
**Current position:** next UX-architecture package

Make Live-selfie generation one bounded task composer:

```text
capture / retake
      ↓
inspect
      ↓
frame + zoom
      ↓
choose privacy presentation
      ↓
inspect current prepared result
      ↓
confirm / refine / retake
```

Optional profile-photo management follows after the Live-selfie task and does not interrupt it.

Full contract: `docs/WP-077-COHESIVE-SELFIE-CREATION-FLOW.md`.

### WP-078 — Mobile-first touch interaction hardening

**Issue:** #127  
**Priority:** P1 real-user readiness  
**Dependency:** WP-077

Apply one control-type-specific touch contract across the product: checkbox/radio rows, inputs, selects, dates, range/zoom, buttons, navigation, media controls, disclosures, discovery, messaging, safety and account actions. Mobile/coarse-pointer surfaces become finger-first while desktop retains its compact premium density.

Full contract: `docs/WP-078-MOBILE-FIRST-TOUCH-HARDENING.md`.

## Revised UX critical path

```text
WP-076 owner correction — complete
        ↓
WP-077 cohesive selfie workflow architecture — next
        ↓
WP-078 mobile-first touch hardening
        ↓
integrated desktop/mobile owner acceptance
        ↓
WP-080 closed-city pilot readiness
```

## Relationship to WP-075

WP-075 cross-browser passwordless OTP remains **P1 real-user readiness**. It is an authentication lane rather than a dependency of the media-UX line.

Therefore:

- WP-075 may execute in parallel when separate implementation capacity is available;
- WP-075 does not interrupt the WP-077 → WP-078 dependency chain merely for numbering/order;
- if only one implementation lane is available while owner review is actively focused on the current profile/media experience, complete WP-077 and WP-078 before returning to WP-075;
- WP-075, WP-077 and WP-078 are all mandatory before WP-080 real-user admission can be authorized.

## Immediate-next interpretation

Until the next consolidated roadmap revision, interpret the immediate queue as:

1. execute WP-077 cohesive selfie flow;
2. execute WP-078 mobile-first touch hardening;
3. complete or continue WP-075 in the independent authentication lane;
4. run consolidated desktop/mobile acceptance on the final UX structure;
5. continue remaining legal/privacy/security/support/moderation/accessibility gates;
6. consider WP-080 only after all mandatory gates pass.

Real-user admission remains unauthorized throughout.
