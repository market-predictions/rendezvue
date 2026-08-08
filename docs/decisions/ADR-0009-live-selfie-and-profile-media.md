# ADR-0009 — Separate live-selfie authenticity media from profile presentation media

**Status:** Accepted product direction; implementation under WP-076  
**Date:** 2026-08-08

## Context

The original Rendezvue requirements called for a live front-camera selfie and blink/head-turn challenge before publication. Later profile-image work correctly added resilient upload, crop and privacy controls for arbitrary participant photos, but the product surface collapsed both needs into one file-upload portrait field.

That created two competing requirements:

- a trust/authenticity need: prove that a person was present at the camera during onboarding and keep that evidence meaningful to profile viewers;
- a dating-profile need: let participants present themselves with better or more contextual photos instead of forcing one technical selfie to be their only visual.

Discovery is intentionally one-card/one-primary-image and horizontal gestures are already meaningful for attraction decisions. Adding an in-card swipe carousel would complicate that interaction.

## Decision

Rendezvue will use a **1 + 2 media architecture**:

- one mandatory `Live selfie`, sourced only from the same-session front camera and short challenge;
- up to two optional profile photos from camera or photo library;
- exactly one selected primary prepared card in discovery;
- a full-profile media viewer for all visible prepared media;
- a visible `Live selfie` label and trust explanation in the full profile.

The challenge recording and raw/source media are not public. The visible Live selfie is a freshly rendered metadata-free prepared derivative and is processed through the normal crop/privacy pipeline.

The product will not label this as legal identity verification. Automated liveness, biometric matching, age proof and ID verification remain separate future controls.

## Consequences

### Positive

- authenticity and visual self-presentation no longer compete for one image;
- the Live selfie remains inspectable by another participant rather than collapsing trust into an opaque badge;
- optional photos have a clear interaction purpose inside the full profile;
- discovery remains simple and gesture-safe;
- existing WP-069B/WP-074 image preparation and privacy controls remain reusable;
- camera/gallery provenance becomes explicit and server-authoritative.

### Costs and risks

- profile media persistence becomes multi-slot rather than single-selected-card only;
- public prepared-card access must allow all visible profile media while continuing to deny source/avatar objects;
- same-origin camera permission must be enabled in Cloudflare headers;
- a live-camera challenge without automated classification is a **trust signal**, not proof against all spoofing attacks;
- future face comparison between the Live selfie and optional photos may constitute biometric processing and requires a separate legal/DPIA decision before production use.

## Rejected alternatives

### One selfie only

Rejected because it makes the authentication capture responsible for attractiveness, personality and presentation as well. It is simpler technically but produces a poorer dating profile.

### Multiple public photos without a persistent Live selfie

Rejected because it leaves profile viewers unable to visually connect the authenticity event with the photos they are evaluating.

### Photo carousel directly on the discovery swipe surface

Rejected for the current product because horizontal interaction is already semantically important for dating decisions. Profile media navigation belongs in a deliberate full-profile view.

### Publish the raw challenge capture

Rejected because challenge/source media is a more sensitive data class than a prepared profile derivative and is unnecessary for the viewer trust outcome.
