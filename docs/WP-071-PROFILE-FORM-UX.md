# WP-071 profile-form visual hierarchy and premium UX

**Date:** 2026-08-05  
**Issue:** #98  
**Status:** implementation in review; canonical owner confirmation pending

## Owner finding

The profile form rendered section titles, field labels and entered values with too little typographic separation. Labels and values appeared almost equal in size and weight, especially at desktop zoom levels. The result was a dense, form-like surface that was harder to scan and did not meet the intended premium consumer-app quality.

## Design intent

The form now follows one explicit scan hierarchy:

1. **Section grouping** identifies the current topic without becoming an oversized heading.
2. **Field labels** are compact, quieter supporting copy.
3. **Entered values** are larger, darker and remain the primary scan target.
4. **Focus state** clearly identifies the active control without changing layout.

This is a hierarchy correction, not a reduction in usability. Touch targets remain at least 3.25 rem high, labels remain permanently visible and the mobile form remains single-column.

## Implementation

- Reduced direct field-label text to `0.78rem`, with quieter colour and controlled weight.
- Increased primary input and select values to `1.03rem` with stronger contrast.
- Kept textarea copy readable at `1rem` with a more relaxed `1.55` line height.
- Removed inherited top margins inside profile controls and replaced them with explicit label-to-control spacing.
- Added calmer fieldset surfaces, rounded section markers and more consistent horizontal and vertical rhythm.
- Added hover, focus, `focus-within`, caret and placeholder treatments.
- Increased the desktop share available to the relationship-intent column while preserving the existing two-column structure.
- Added an explicit mobile override so all profile sections remain one column below 680 px.
- Kept backend values, data submission, Auth, RLS, Storage and real-user admission unchanged.

## Regression contract

`apps/web/tests/profile-form-ux.test.mjs` verifies:

- entered values are materially larger than labels;
- controls retain minimum touch-target height;
- focus treatment remains present;
- the identity section allocates extra width to relationship intent;
- the mobile breakpoint collapses that layout safely;
- fieldset and legend grouping remain distinct but quiet.

`.github/workflows/verify-wp071-profile-form-hierarchy.yml` checks source CSS, the generated Cloudflare artifact and, after merge, the commit-matched canonical stylesheet.

## Acceptance boundary

Technical completion does not equal owner acceptance. Issue #98 remains open until the canonical form has been visually reviewed on representative desktop and mobile widths. Real-user admission remains unauthorized.
