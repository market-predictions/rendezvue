# WP-069B — Participant profile image preparation

**Status:** technical foundation complete and canonically verified; owner field review pending  
**Issue:** #91  
**Implementation:** PR #92, merge `a06f2ae7b7c4b5779e80143d62960856e63d9ac7`  
**Protected staging configuration:** run `30994962258`  
**Canonical browser and protected-schema verification:** run `30995029165`

## Purpose

WP-069A improved the controlled synthetic fixtures, but that did not solve the production problem: participants will upload arbitrary portraits, selfies, landscape photographs, tightly framed images and low-resolution sources. WP-069B makes Rendezvue responsible for predictable presentation quality rather than assuming every source image already fits the discovery card.

The raw upload is not used directly as the canonical profile-card image. The user confirms a framing, after which Rendezvue stores a normalized private source and explicit presentation derivatives.

## Delivered user experience

The normal signed-in portrait flow now provides:

- a mobile-first 4:5 card preview;
- drag/pan positioning;
- zoom control and framing reset;
- a visible safe-area guide for face, chin and shoulders;
- a square avatar preview;
- warnings for low resolution, landscape sources and unusually tall/narrow images;
- Dutch and English copy;
- a complete-subject fallback using `contain` over a blurred copy of the same image instead of aggressive face/chin clipping.

The existing advanced synthetic proof uploader remains available only inside the operator test boundary and is not intercepted by the normal product editor.

## Image preparation contract

Accepted browser inputs are JPEG, PNG and WebP, up to 10 MB.

The browser:

1. decodes the source with orientation normalization where supported;
2. lets the user confirm focal position and zoom;
3. re-encodes a metadata-free normalized WebP source, capped at a 2048-pixel longest edge;
4. creates a 960 × 1200 WebP profile-card derivative;
5. creates a 384 × 384 WebP avatar derivative;
6. uploads all three objects to private Storage under one account-scoped preparation ID;
7. registers the complete preparation transactionally;
8. selects only the card derivative as the profile portrait.

This removes ordinary EXIF metadata through browser canvas re-encoding. It is not presented as a forensic anonymization guarantee.

## Persistence model

One preparation ID links three private roles:

- `source` — normalized private source;
- `card` — canonical 4:5 profile-card derivative;
- `avatar` — canonical square derivative.

Persisted framing and quality metadata includes:

- focal X and Y;
- zoom;
- crop aspect;
- source and output dimensions;
- metadata-stripped indicator;
- bounded quality-warning flags.

Database safeguards enforce:

- exact account-scoped Storage paths;
- all three objects must exist before registration;
- only the `card` role can be selected;
- one selected card per account;
- serialized concurrent replacement;
- idempotent retry for one preparation ID;
- anonymous registration denial;
- cross-account RLS isolation;
- no private Storage paths in onboarding snapshots or audit payloads.

Existing controlled proof inserts remain compatible through isolated legacy preparation IDs.

## Evidence

PR validation passed:

- pure framing/crop/unit tests;
- 37 new pgTAP assertions;
- empty-database migration replay;
- all existing database contracts;
- parallel match and entitlement race tests;
- deterministic synthetic seed;
- schema lint;
- generated Cloudflare artifact validation;
- retained Docker build.

Protected run `30994962258` applied both migrations to the existing synthetic Supabase project and passed Auth configuration, health, cleanup authorization and Cloudflare artifact validation.

Canonical run `30995029165` passed:

- commit-matched Cloudflare deployment;
- delivered framing controller, shared model and stylesheet;
- 4:5 and square derivative contract;
- safe-area, pan and zoom markers;
- resilient `contain` plus blurred-background rendering;
- absence of privileged browser capabilities and private-path event leakage;
- protected read-only verification of columns, RPC privileges, one-selected-card enforcement, source/avatar publication prohibition, path redaction, metadata indicators and canonical path rules.

An earlier push-triggered verification ran before the protected configuration workflow completed and failed during browser-artifact inspection. The correctly sequenced `workflow_run` acceptance passed the same merge commit. Canonical acceptance is based on run `30995029165`.

## Explicit limitations

WP-069B does not claim:

- automatic face detection;
- biometric identification or face recognition;
- blur or crop quality as proof of identity;
- automatic rejection of every unsuitable photograph;
- production-scale image processing;
- real-user authorization.

The first release uses dimension/aspect warnings plus user-confirmed framing. The original uploaded file is not retained; the stored source is a normalized WebP derivative. Existing selected-portrait preview persistence after a full refresh must be included in owner review rather than assumed from the immediate local preview.

## Required owner field review

Test the normal product flow with a controlled synthetic account and deliberately difficult files:

1. a tightly framed selfie;
2. a landscape image with the person off-centre;
3. a very tall or narrow image;
4. a low-resolution image;
5. a well-composed 4:5 portrait.

For each source, verify on desktop and mobile:

- warning text is understandable;
- drag and zoom are usable;
- reset restores a sensible frame;
- chin, forehead and shoulders can remain visible;
- card and square previews differ appropriately;
- successful upload selects only the prepared card;
- profile preview remains readable;
- discovery does not crop through the face;
- refresh behaviour is acceptable;
- previous selected portraits are superseded correctly.

Issue #91 remains open until this owner field review is recorded. Real-user admission remains unauthorized.
