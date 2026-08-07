# WP-074B — Privacy portrait ladder remap

**Date:** 2026-08-07  
**Issue:** #115  
**Status:** implementation candidate

## Owner decision

The WP-074A ladder is replaced by a tighter four-step recognisability gradient:

1. **Zonder filter / Unfiltered** — current `unfiltered` recipe, blur 0.
2. **Natural** — current/former Soft private recipe, technical ID `softFocus`, blur 9.
3. **Zacht privé / Soft private** — current/former Balanced recipe, technical ID `warmVeil`, blur 13.
4. **Meer privé / More private** — new `morePrivate` recipe, blur 15, stronger than former Balanced but deliberately below the former heavy `monoMist` blur 17 and `privacyMax` blur 24 treatments.

The removed WP-074A `natural` recipe (blur 3) remains database-readable for historical records but is not an active client choice and is rejected for new registrations. Historical `monoMist` and `privacyMax` remain database-compatible only.

## UX contract

- no option is selected automatically;
- Recommended is attached to technical ID `softFocus`, which is now customer-facing **Natural**;
- Dutch labels are `Zonder filter`, `Natural`, `Zacht privé`, `Meer privé`;
- English labels are `Unfiltered`, `Natural`, `Soft private`, `More private`;
- the original/normalized source remains private and cannot become the selected public profile portrait;
- card and avatar are freshly rendered from the same explicit selected presentation ID;
- only the prepared card role can be selected as the public profile portrait.

## Cross-surface binding

WP-074B closes an existing synthetic-product-shell gap: discovery previously preferred bundled synthetic fixture portraits even when a participant had a selected prepared card. A dedicated discovery binding now requests only the selected prepared card for published, unblocked profiles. The private Storage policy allows that exact selected card and denies source/avatar/non-selected objects. The bundled synthetic image remains a fallback when no selected prepared card is available.

Own profile preview continues to use the freshly prepared selected card immediately and the server-selected public card after reload. Match/chat continues through the server-authorized matched portrait path. Both prepared card and avatar persist the same privacy presentation identifier.

## More private boundary

The new `morePrivate` treatment is intentionally bounded:

- blur 15 (< legacy `monoMist` 17);
- pixel divisor 10 (< legacy `monoMist` 12);
- grayscale 0.08 (far below legacy `monoMist` 0.72);
- saturation 0.76 (well above legacy `monoMist` 0.42);
- a moderate veil rather than the former heavy wash.

This is designed to create a perceptible fourth step without returning to the formerly rejected vague/over-obscured look.

## Verification contract

The candidate must prove:

- exact active client ID order `unfiltered`, `softFocus`, `warmVeil`, `morePrivate`;
- Recommended on `softFocus`/Natural and no default selection;
- blur progression 0 → 9 → 13 → 15;
- client and server new-write allowlists agree;
- former `natural`, `monoMist` and `privacyMax` are rejected for new writes but remain historically readable;
- source is never public through discovery;
- discovery can read only an exact selected prepared card of a published, unblocked profile;
- block/unpublish revokes discovery portrait access;
- card/avatar persist the exact selected presentation ID;
- source/application tests, generated artifact validator, empty-database migration replay, pgTAP, race/seed/schema checks and retained Docker build pass;
- protected staging migration and commit-matched Cloudflare delivery pass before owner visual acceptance.

Real-user admission remains unauthorized.
