# Roadmap addendum — WP-077 / WP-078 / WP-079 UX and test sequence

**Date:** 2026-08-08  
**Applies to:** Rendezvue roadmap 2.18 until incorporated into the next full roadmap revision

## Owner field findings

Three related but distinct findings are now explicit:

1. **Workflow clustering defect:** Live-selfie capture, framing/zoom, privacy choice and result inspection are parts of one participant task but are currently distributed across multiple blocks, causing repeated page scrolling while refining one selfie.
2. **Mobile touch defect:** the responsive interface is not yet consistently finger-first; several controls retain small/native interaction affordances or desktop interaction assumptions even when the surrounding mobile layout is large.
3. **Synthetic fixture compatibility defect:** the ten established synthetic profiles have approved photorealistic portraits but predate the mandatory Live-selfie architecture, allowing obsolete illustrated/avatar fallbacks to reappear during discovery and matching.

The first two must not be implemented in reverse order. WP-079 is deliberately deferred until after the final workflow/touch structure is stable, but must be complete before the integrated discovery/matching acceptance run.

## Work packages

### WP-077 — Cohesive selfie creation, framing, privacy and result flow

**Issue:** #126  
**Priority:** P1 real-user readiness  
**Dependency:** satisfied — WP-076 owner correction merged as `c62b6fad3d67535726055599680f888aa071310d`  
**Current position:** next UX-architecture package

Make Live-selfie generation one bounded task composer: capture/retake → inspect → frame/zoom → choose privacy presentation → inspect result → confirm/refine/retake. Optional profile-photo management follows after the Live-selfie task and does not interrupt it.

Full contract: `docs/WP-077-COHESIVE-SELFIE-CREATION-FLOW.md`.

### WP-078 — Mobile-first touch interaction hardening

**Issue:** #127  
**Priority:** P1 real-user readiness  
**Dependency:** WP-077

Apply one control-type-specific touch contract across forms, navigation, media controls, disclosures, discovery, messaging, safety and account actions. Mobile/coarse-pointer surfaces become finger-first while desktop retains compact premium density.

Full contract: `docs/WP-078-MOBILE-FIRST-TOUCH-HARDENING.md`.

### WP-079 — Synthetic profile photo stand-ins for Live-selfie-era discovery

**Issue:** #129  
**Priority:** P2 integrated test readiness  
**Dependency:** schedule after WP-077/WP-078; required before consolidated discovery/matching owner acceptance

Reuse each known synthetic seed profile's existing approved photorealistic portrait as the synthetic-only visual stand-in for the Live-selfie-era primary media position. Preserve truthful provenance and do not weaken the ordinary-account invariant that a real `live_selfie` requires a genuine `live_camera` capture.

Full contract: `docs/WP-079-SYNTHETIC-LIVE-SELFIE-STANDIN-COMPATIBILITY.md`.

## Revised UX/test critical path

```text
WP-076 owner correction — complete
        ↓
WP-077 cohesive selfie workflow architecture — next
        ↓
WP-078 mobile-first touch hardening
        ↓
WP-079 synthetic media compatibility
        ↓
integrated desktop/mobile discovery + matching + profile-selection acceptance
        ↓
WP-080 closed-city pilot readiness
```

## Relationship to WP-075

WP-075 cross-browser passwordless OTP remains **P1 real-user readiness**. It is an authentication lane rather than a dependency of the media-UX/test-fixture line.

Therefore:

- WP-075 may execute in parallel when separate implementation capacity is available;
- WP-075 does not interrupt the WP-077 → WP-078 → WP-079 dependency sequence merely for numbering/order;
- WP-075 remains mandatory before any real-user admission;
- WP-079 is not a production-authentication gate but is mandatory before the consolidated synthetic discovery/matching acceptance run.

## Immediate-next interpretation

Until the next consolidated roadmap revision, interpret the immediate queue as:

1. execute WP-077 cohesive selfie flow;
2. execute WP-078 mobile-first touch hardening;
3. execute WP-079 synthetic media compatibility;
4. complete or continue WP-075 in the independent authentication lane;
5. run consolidated desktop/mobile discovery, profile-selection, matching and conversation acceptance on the final UX structure;
6. continue remaining legal/privacy/security/support/moderation/accessibility gates;
7. consider WP-080 only after all mandatory gates pass.

Real-user admission remains unauthorized throughout.
