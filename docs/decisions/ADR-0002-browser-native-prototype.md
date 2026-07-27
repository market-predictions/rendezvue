# ADR-0002: Use a dependency-light browser-native prototype

**Status:** accepted for Phase 1 only  
**Date:** 2026-07-27

## Context

The largest uncertainty is whether privacy avatars provide sufficient attraction and trust. Framework selection is not currently the highest-risk decision, and package/network dependencies create avoidable bootstrap and deployment complexity.

## Decision

Implement the first product loop with standard HTML, CSS and JavaScript modules, using browser-native camera and PWA APIs. Keep domain and capture modules separable so they can be ported later.

## Consequences

Advantages:

- immediate reproducibility;
- very small runtime footprint;
- no framework lock-in before user validation;
- simple Docker/Hugging Face deployment;
- clear understanding of browser capability limits.

Costs:

- the UI layer will likely be replaced or refactored for production;
- complex state, accessibility and localization will eventually benefit from a mature component ecosystem;
- this decision must be reviewed in Phase 2, not treated as permanent architecture.
