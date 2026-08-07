# WP-074 / WP-074A — Participant privacy portrait presentations

**Original date:** 2026-08-06  
**Recalibration date:** 2026-08-07  
**Issues:** #106, #109  
**Status:** WP-074 foundation accepted; WP-074A recalibration candidate pending independent assurance and canonical owner acceptance

## Owner findings

WP-074 corrected the earlier defect where participant image upload exposed no privacy control at all. Protected acceptance run `31132414431` proved the mandatory four-choice filter foundation, private source handling, prepared card/avatar derivatives, storage isolation and canonical delivery.

Subsequent owner field review found that the original levels 3 (`monoMist`) and 4 (`privacyMax`) were so heavily obscured that they reduced profile quality without adding useful choice. The owner then explicitly changed the presentation ladder toward recognisability.

This is a product-direction amendment to WP-074, not a rollback of the source-media privacy boundary.

## WP-074A required flow

`upload → frame → choose one of four presentation levels → review → store`

The active presentation identifiers, in order, are:

1. `unfiltered` — **Zonder filter / Unfiltered**;
2. `natural` — **Natural**;
3. `softFocus` — **Soft private** and the recommended option;
4. `warmVeil` — **Balanced**.

No option is selected automatically.

The former `monoMist` and `privacyMax` treatments remain database-compatible for historical preparations but are not offered in the active UI and are rejected for new registrations.

## Meaning of “Unfiltered”

`unfiltered` does **not** mean publishing the uploaded source file.

It means that Rendezvue:

- decodes the participant image in the browser;
- applies the chosen framing;
- renders fresh 960 × 1200 card and 384 × 384 avatar canvases;
- exports those derivatives as metadata-free WebP files;
- applies no additional obscuring blur, pixelation or veil to those two prepared derivatives.

The normalized source remains private, is never the selected portrait and is not delivered as the public profile image.

## Recalibrated visual ladder

- `unfiltered`: no obscuring treatment on the prepared derivative;
- `natural`: new very light treatment (`blur: 3`) close to a normal photo;
- `softFocus`: preserves the former WP-074 level-1 treatment (`blur: 9`) and moves to level 3;
- `warmVeil`: preserves the former WP-074 level-2 treatment (`blur: 13`) and moves to level 4.

The former heavy levels (`blur: 17` and `blur: 24`) are removed from the normal participant flow.

## Privacy boundary

- The original upload is never a public portrait asset.
- The normalized source remains private and can never be selected as the public profile portrait.
- Only prepared card/avatar derivatives can be associated with the selected presentation.
- The selected card remains the only selectable profile portrait role; avatar is a related prepared derivative.
- The server persists the selected presentation identifier on the complete preparation.
- The legacy registration signature without an explicit presentation remains non-executable by authenticated users.
- `raw`, `original` and `none` are not valid presentation identifiers.
- Historical `monoMist` and `privacyMax` records remain readable, but the current RPC rejects them for new writes.
- Audit evidence distinguishes `unfiltered` prepared derivatives from prohibited raw-source publication and contains no Storage paths.
- Browser filtering or lack of filtering is a presentation choice, not an anonymity or biometric-protection claim.

## Architecture

WP-074A remains layered over the verified WP-069B framing model. The privacy portrait controller owns the explicit presentation choice and intercepts portrait submission before the older document handler. Card and avatar are always freshly rendered browser derivatives. `applyPrivacyFilterToCanvas()` implements `unfiltered` as a direct high-quality canvas draw, while the three privacy levels apply progressively stronger treatments.

The database migration `20260807153500_privacy_portrait_gradient_recalibration.sql` separates historical compatibility from the active new-write allowlist.

## Evidence contract

The WP-074A candidate must receive fresh independent assurance. Historical run `31132414431` is foundation evidence only and cannot certify the new product decision.

Fresh assurance must prove:

- the exact UI order `Unfiltered → Natural → Soft private → Balanced` in Dutch/English presentation copy;
- no implicit/default selection;
- the Recommended badge on `Soft private`;
- `unfiltered` renders the framed derivative without obscuration while never publishing the source asset;
- `natural` is materially lighter than the former Soft treatment;
- `softFocus` and `warmVeil` retain the former level-1 and level-2 recipes;
- `monoMist` and `privacyMax` are absent from the active UI and rejected for new writes;
- raw/source-like values remain rejected;
- generated Cloudflare artifact validation;
- empty-database migration replay;
- WP-069B, WP-074 and WP-074A pgTAP assertions;
- existing match and entitlement concurrency races;
- deterministic synthetic seed and schema lint;
- retained Docker build;
- protected staging migration;
- commit-matched canonical delivery of the recalibrated controller/model.

Owner review remains separate from technical assurance. The owner must visually compare the four variants on canonical staging and confirm the new recognisability gradient before issue #109 is closed.

Real-user admission remains unauthorized.
