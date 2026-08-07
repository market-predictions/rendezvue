# ADR-0006 — Browser-local privacy presentation grid

**Status:** revised by WP-074A owner field review; candidate pending independent assurance  
**Original date:** 2026-07-28  
**Revised:** 2026-08-07

## Context

Rendezvue needs a usable interim portrait presentation before any later server-side generative privacy-portrait pipeline exists. The original four-level filter grid was technically implemented and protected-acceptance verified under WP-074, but owner field review found the two strongest treatments excessively blurred and harmful to the dating-profile experience.

The product also needs to distinguish two concepts that the original decision grouped together:

- publishing the original/raw source image, which remains prohibited;
- choosing a freshly rendered, metadata-free prepared card/avatar derivative without an obscuring filter, which the owner now explicitly permits.

## Revised decision

After image selection and framing, the browser presents four fixed presentation choices from the same prepared crop. The registrant sees all four and explicitly selects one before continuing. Nothing is preselected.

The active pilot ladder is:

1. **Zonder filter / Unfiltered** — no obscuring treatment on the freshly rendered prepared derivatives;
2. **Natural** — very light softening;
3. **Soft private** — the former Soft treatment and the recommended balance;
4. **Balanced** — the former Balanced treatment.

The former `monoMist` / Private and `privacyMax` / Extra private levels are retired from the active participant flow because field review found that their additional obscuration did not justify the degradation in profile quality. Existing historical records using those identifiers remain readable but new registrations reject them.

## Source-media boundary

`Unfiltered` is not a raw-source publication mode.

For every option, including Unfiltered:

- the original upload is decoded and framed in the browser;
- fresh 960 × 1200 card and 384 × 384 avatar canvases are rendered;
- those derivatives are exported as metadata-free WebP files;
- the normalized source remains private and cannot be selected as the public profile portrait.

`raw`, `original` and `none` are not valid presentation identifiers.

## Rationale

- the revised ladder gives four perceptibly useful levels rather than two usable and two excessively blurred choices;
- an explicit unfiltered prepared derivative lets participants prioritise recognisability without publishing the original source file;
- a new Natural level provides a small privacy step before the former Soft treatment;
- moving the former Soft and Balanced treatments to levels 3 and 4 preserves already observed, useful treatments;
- Soft private is recommended but not automatically selected, preserving deliberate participant choice;
- historical compatibility is retained without keeping retired treatments available for new writes;
- the approach remains reversible and does not block later server-side generative work.

## Constraints

- an unfiltered prepared derivative is intentionally recognisable;
- browser filtering does not provide anonymity;
- acquaintances may still recognise a participant at any filter level;
- output quality varies with lighting, framing and browser implementation;
- the original source-media privacy boundary must remain independently enforced;
- this remains an interim synthetic-pilot presentation model, not the production privacy architecture;
- real-user deployment requires target-user testing, fairness review, retention evidence, legal/privacy approval and explicit admission authorization.

## Consequences

The active client model and database new-write allowlist use `unfiltered`, `natural`, `softFocus` and `warmVeil`. CI and canonical delivery verification lock the order, recipes, explicit-selection behavior, historical compatibility and raw-source prohibition. The owner must visually accept the recalibrated gradient before WP-074A is closed.
