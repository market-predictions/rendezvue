# Handover — WP-074B privacy portrait ladder remap

Repository: `market-predictions/rendezvue`  
Issue: #115  
Pull request: #116  
Branch: `feature/wp074b-privacy-ladder-remap`  
Status: implementation candidate; technical validation green before final administration commit; protected deployment and owner visual acceptance pending

## Owner-directed outcome

The active privacy portrait ladder is remapped to:

1. **Zonder filter / Unfiltered** — existing `unfiltered`, blur 0.
2. **Natural** — existing/former Soft private `softFocus`, blur 9, Recommended.
3. **Zacht privé / Soft private** — existing/former Balanced `warmVeil`, blur 13.
4. **Meer privé / More private** — new `morePrivate`, blur 15 with bounded pixel/grayscale treatment below the rejected legacy heavy tiers.

No option is selected by default.

## Compatibility

- Historical `natural` remains database-readable but is removed from the active client and rejected for new writes.
- Historical `monoMist` and `privacyMax` remain database-compatible and rejected for new writes.
- Existing `softFocus` and `warmVeil` stored derivatives retain their technical IDs and pixels; only their customer-facing ladder meaning changes as explicitly directed.
- Real-user admission remains unauthorized.

## Privacy and cross-surface behavior

- Uploaded/normalized source stays private and cannot become the selected public portrait.
- Card and avatar are generated from the same explicit selected presentation and persist that exact presentation ID.
- Own profile preview uses the freshly generated selected card and subsequently the selected server card.
- Discovery now requests only the selected prepared `card` of another published, unblocked profile and receives a short-lived signed URL. Source, avatar and non-selected derivatives remain unavailable through the discovery policy.
- De-publication or block removes new discovery-path authorization; previously issued signed URLs retain their ordinary bounded expiry behavior.
- Existing synthetic discovery fixtures remain a fail-safe fallback if a selected card cannot be resolved uniquely.
- Match/chat continues through the existing server-authorized selected matched-portrait path.

## Main files added/changed

- `.github/workflows/verify-wp074-privacy-portrait-filters.yml`
- `apps/private-preview/privacy-portrait-filters.js`
- `apps/private-preview/privacy-portrait-loader.js`
- `apps/private-preview/privacy-portrait-ladder-ui.js`
- `apps/private-preview/discovery-selected-portrait.js`
- `apps/web/tests/privacy-portrait-filters.test.mjs`
- `apps/web/tests/privacy-portrait-surface-binding.test.mjs`
- `supabase/migrations/20260807193000_privacy_portrait_ladder_remap.sql`
- `supabase/migrations/20260807193500_discovery_selected_portrait_delivery.sql`
- `supabase/tests/database/017_privacy_portrait_ladder_remap.test.sql`
- `supabase/tests/database/018_discovery_selected_portrait_delivery.test.sql`
- `supabase/tests/database/014_profile_image_preparation.test.sql` — one stale test fixture changed from retired `natural` to active `softFocus`; no production relaxation.
- `scripts/finalize-discovery-deck-artifact.mjs`
- `scripts/validate-wp074-privacy-portrait-filters.mjs`
- `docs/WP-074B-PRIVACY-PORTRAIT-LADDER.md`
- `docs/WORKPACKAGES.md`
- `docs/WORK-CLAIMS.md`
- `CHANGELOG.md`
- this handover.

## Tests and evidence

Implementation code head before administration: `ac9b0e80624c1c82572f257bcd8831d7a68ad973`.

Green evidence on that exact code head:

- Dedicated `Verify WP074 privacy portrait filters` run `31204115559`: success.
- Full `Validate Rendezvue` run `31204115617`: success.
- Application/artifact checks: success.
- Cloudflare Pages staging/cleanup boundary checks: success.
- Retained Docker build: success.
- Empty-database migration replay: success.
- Database contract / pgTAP tests: success.
- Parallel match and entitlement race tests: success.
- Deterministic synthetic seed: success.
- Schema lint: success.

The initial full validation on the preceding code head exposed one stale test fixture in `014_profile_image_preparation.test.sql` still using the retired new-write `natural` ID. Only that fixture was corrected to `softFocus`; production allowlists remained fail-closed. The full suite then passed.

Because the administration files above add commits after the green code head, final exact-PR-head CI must be green again before merge.

## Deployment status

- GitHub PR validation: green for the code head; final administrative-head validation pending.
- Supabase protected staging migration: pending merge/final candidate validation.
- Cloudflare canonical staging: pending merge and commit-matched delivery.
- Owner visual acceptance: pending canonical staging.

## Remaining subjective gate

After protected migration and commit-matched canonical deployment, the owner should visually confirm:

- Natural is clearly different from Unfiltered;
- Soft private is clearly stronger than Natural;
- More private is clearly stronger than Soft private without becoming excessively vague;
- Recommended is on Natural;
- no option starts selected;
- selected portrait remains consistent in own preview and representative discovery/match/chat surfaces.

## Next step

Wait for final exact-head PR CI. If green, merge PR #116, apply the new migrations through the protected staging route, verify commit-matched Cloudflare delivery, then request owner visual acceptance. Do not authorize real users.