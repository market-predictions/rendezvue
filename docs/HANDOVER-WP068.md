# Handover addendum — WP-068 discovery hardening

**Updated:** 2026-08-04  
**Current product-review milestone:** WP-068 discovery field-review hardening accepted on canonical staging

This addendum supplements `docs/HANDOVER.md`. The earlier WP-067 product-shell milestone remains valid, but the discovery presentation described there has since received three owner-driven hardening packages.

## Canonical state

- Repository authority: `market-predictions/rendezvue` `main`.
- Canonical staging: `https://rendezvue-private-preview.pages.dev/`.
- Real-user admission: unauthorized.
- Latest accepted discovery implementation:
  - WP-068A one-profile deck and cache coherence;
  - WP-068B container-responsive non-overlapping layout;
  - WP-068C approved seeded portrait fallback for extended display names.

## Current discovery behavior

- One active profile is shown at a time.
- The card contains a portrait, complete visible profile copy, Pass, Like and Respond controls, and an optional contextual-response form.
- Successful Pass or Like advances to the next profile.
- Inactive cards are hidden and inert.
- Narrow and intermediate card widths use a stacked layout.
- Split portrait/details layout activates only when the card container itself is sufficiently wide.
- Portrait, copy, actions and contextual form occupy separate layout regions.
- Action controls do not float over portrait or copy.
- The discovery module, stylesheet and seeded-portrait fallback use commit-versioned delivery and cache revalidation.
- Extended display names can resolve one of the ten bundled approved synthetic portraits; unknown names remain initials.

## Accepted evidence

### WP-068A

- issue #78;
- PR #79 merge `1035a5492ff4cb2e6233bc5bd4b1fa5d7227ecae`;
- PR #80 merge `03739181baa8bfbb35663f6e152b1bf7aa9d69fb`;
- canonical run `30935664310`;
- completion merge `eccad2515ef2221d94633dbd464fb3bf7dcd065e`.

### WP-068B

- issue #82;
- PR #83 merge `4e862a5d3b7d7d9721f552b8bdb2a2ffdcc15401`;
- canonical run `30948012861`;
- completion merge `d80107ec02d76bbe5cc8e27ed56da5f7f6fe862f`.

### WP-068C

- issue #85;
- PR #86 merge `3c5ad35f1d14c62edee02191ea11be2ead068868`;
- canonical run `30949504738`.

Detailed milestone record: `docs/WP-068-DISCOVERY-HARDENING.md`.

## Immediate next review

1. Hard-refresh canonical staging and open **Discover**.
2. Review the active card at narrow mobile, intermediate and wide desktop widths.
3. Confirm the portrait, all profile text and all controls remain separate and readable.
4. Confirm extended seeded names show the expected synthetic portrait instead of an initial tile.
5. Exercise Pass, Like and Respond and confirm progression to the next profile.
6. Continue into match and conversation to identify the next evidence-based UX defects.

## Remaining programme gates

- disposable-account end-to-end product proof;
- WP-065F disposable-mailbox replacement proof;
- operational identity/support policy and secure support tooling;
- retention/DPIA decision and controlled deletion operations;
- moderation, legal, security and accessibility readiness;
- explicit authorization before any real-user pilot.
