# WP-068 — Discovery field-review hardening

Status: **complete for the owner-observed discovery defects and canonically verified**  
Updated: 2026-08-04  
Canonical staging: `https://rendezvue-private-preview.pages.dev/`

## Purpose

WP-068 converts the first owner field-review findings from the WP-067 discovery experience into testable, deployed product repairs. The work remains restricted to controlled synthetic staging and does not authorize real users.

## WP-068A — Single-card interaction repair

Owner evidence showed a long portrait wall with no usable profile information or visible interaction controls.

Accepted result:

- one active discovery profile at a time;
- profile name, city/life stage, relationship intent and biography attached to the portrait;
- explicit Pass, Like and Respond actions;
- profile position and progress;
- inactive cards hidden and removed from keyboard interaction;
- successful actions advance to the next profile;
- contextual response remains available;
- commit-versioned discovery module and stylesheet;
- cache revalidation prevents stale application modules from suppressing the current deck.

Evidence:

- issue #78;
- implementation PR #79, merge `1035a5492ff4cb2e6233bc5bd4b1fa5d7227ecae`;
- cache-coherence PR #80, merge `03739181baa8bfbb35663f6e152b1bf7aa9d69fb`;
- canonical verification run `30935664310`;
- completion PR #81, merge `eccad2515ef2221d94633dbd464fb3bf7dcd065e`.

## WP-068B — Responsive layout hardening

A second owner screenshot showed the portrait covering profile text and the action controls floating across the portrait at an intermediate browser width.

Root cause:

- the split layout was selected from browser viewport width rather than the actual discovery-card width;
- a fixed portrait height combined with a 4:5 aspect-ratio requirement forced the media region beyond its assigned grid column.

Accepted result:

- the discovery card is stacked by default: portrait, copy, actions and contextual form;
- responsive decisions use a named inline-size container;
- split portrait/details layout activates only when the card container is at least 48rem wide;
- portrait, copy, actions and contextual form occupy explicit non-overlapping grid regions;
- grid children use `min-width: 0` and remain shrinkable;
- split columns have enforced minimum usable widths;
- actions remain in normal layout flow and are never sticky, fixed or absolute;
- narrow and intermediate widths retain the safe stacked layout.

Evidence:

- issue #82;
- implementation PR #83, merge `4e862a5d3b7d7d9721f552b8bdb2a2ffdcc15401`;
- canonical responsive verification run `30948012861`;
- completion PR #84, merge `d80107ec02d76bbe5cc8e27ed56da5f7f6fe862f`;
- detailed record: `docs/WP-068B-RESPONSIVE-DISCOVERY-LAYOUT.md`.

## WP-068C — Seeded portrait fallback

The same field-review screenshot showed a large initial tile for a profile that should have used one of the bundled synthetic portraits.

Accepted result:

- extended display names are normalized for accents, punctuation and whitespace;
- an approved seeded name can be resolved when it appears as a complete token inside an extended display name;
- resolution is limited to the ten approved synthetic names: Yasmin, Bilal, Amina, Idris, Maryam, Samir, Noura, Youssef, Hafsa and Omar;
- only portrait-less initial tiles are repaired;
- genuinely unknown names retain the initial fallback;
- an unavailable local asset fails back safely;
- no external URL, Supabase Storage path, signed URL, browser client or privileged API is used;
- the fallback module is commit-versioned and cache-revalidated with the discovery deck.

Evidence:

- issue #85;
- implementation PR #86, merge `3c5ad35f1d14c62edee02191ea11be2ead068868`;
- canonical verification run `30949504738`, confirming the versioned module, approved token resolution, synthetic manifest and portrait delivery, with external/private portrait sources absent.

## Validation

Across WP-068A/B/C, the following gates passed:

- application and generated-artifact tests;
- bilingual action-copy tests;
- one-active-card and keyboard-boundary checks;
- responsive container-query and non-overlap checks;
- seeded-name normalization and fail-closed resolution tests;
- Cloudflare artifact and canonical delivery checks;
- security and privileged-capability scans;
- retained Docker build;
- clean Supabase startup;
- independent empty-database migration replay;
- all database contracts;
- parallel match and entitlement races;
- deterministic synthetic seed;
- schema lint.

## Unchanged boundaries

WP-068 does not change:

- Auth, account recovery or account lifecycle;
- database schema, RLS or server-authoritative attraction/matching semantics;
- private portrait storage or signed portrait access;
- support, email-replacement or retention machinery;
- real-user admission.

## Next field-review focus

The next owner review should exercise the repaired discovery experience at narrow mobile, intermediate tablet/desktop and wide desktop widths, then continue through Like, contextual response, match and conversation.

Further findings should be recorded as small evidence-based hardening packages rather than speculative redesigns. Remaining programme gates are still the disposable-account product proof, WP-065F mailbox proof, operational support/retention governance, moderation, legal, security and accessibility readiness.
