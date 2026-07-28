# ADR-0006 — Browser-local privacy filter grid

**Status:** accepted for pilot implementation  
**Date:** 2026-07-28

## Context

The previous browser-local avatar experiments failed in opposite directions:

- the softened illustrated treatment remained too close to the selfie;
- the ink-sketch treatment created harsh contours and unattractive facial distortion.

The pilot still needs a usable interim privacy presentation before a server-side generative privacy-portrait pipeline exists.

## Decision

After one live capture and best-frame selection, the browser generates four fixed privacy-filter variants from the same normalized portrait crop. The registrant sees all four in a 2×2 grid and selects one before continuing.

The pilot variants are:

1. soft focus — more recognisable;
2. warm veil — more private;
3. monochrome mist — more private;
4. extra private — strongest blur and lowest detail.

No raw or lightly edited selfie is offered. All preview generation remains in browser memory. The selected result becomes the public prototype portrait; unselected variants and source media are discarded with session state.

## Rationale

- choice reduces the risk of imposing one unsuitable aesthetic on every user;
- fixed variants maintain a minimum privacy floor;
- generating only four low-resolution portraits is practical on mobile browsers;
- the approach is reversible and does not block later server-side generative work;
- it allows direct user testing of the recognisability/privacy trade-off.

## Constraints

- browser filtering is not anonymity;
- acquaintances may still recognise broad silhouette, hair, glasses or headwear;
- output quality varies with lighting, framing and browser implementation;
- this remains an interim pilot solution, not the production avatar architecture;
- production requires target-user testing, fairness review and explicit retention evidence.

## Consequences

The hosted build generates the filter grid during the static build transform. CI checks for all four variants, the selection interaction and deployment metadata. The long-term roadmap continues to target a controlled server-side privacy-portrait generator.
