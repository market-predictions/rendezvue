# WP-068B — Responsive discovery layout hardening

Status: **complete and canonically verified**  
Owner evidence: field-review screenshot on 2026-08-04  
Implementation PR: #83  
Canonical implementation commit: `4e862a5d3b7d7d9721f552b8bdb2a2ffdcc15401`  
Canonical verification run: `30948012861`

## Problem

The first single-card discovery implementation still failed at intermediate desktop and tablet widths. The browser viewport was wide enough to activate the desktop split layout, but the discovery card itself was substantially narrower because it sat inside the Rendezvue product container.

The portrait retained a fixed height and a 4:5 aspect-ratio requirement. That combination forced the media region to demand more width than its assigned grid column. The portrait consequently intruded into the profile-copy column, while the action controls appeared to float across the image.

## Accepted layout contract

Discovery now uses the card container rather than the browser viewport as its responsive boundary.

The safe default is a stacked card:

1. portrait;
2. complete profile copy;
3. Pass, Like and Respond controls;
4. contextual-response form when opened.

A split portrait/details layout activates only when the discovery container itself is at least 48rem wide. The split layout reserves minimum usable widths for both columns and assigns portrait, copy, actions and contextual form to explicit grid regions.

## Implementation

- named inline-size container: `rv-discovery-deck`;
- stacked-by-default grid areas;
- container-query split at 48rem card width;
- `min-width: 0` on all grid children;
- portrait ratio no longer determines split-column width;
- action controls remain in normal document flow;
- no sticky, fixed or absolute action bar;
- narrow-card fallback keeps controls in one column;
- existing one-profile-at-a-time controller, RLS/RPC authority and bilingual labels remain unchanged.

## Regression protection

The repository now rejects:

- viewport-driven discovery split layouts;
- missing container-query boundaries;
- missing portrait/copy/actions/context grid regions;
- floating discovery actions;
- fixed portrait ratio forcing grid overflow;
- split columns without minimum usable widths;
- removal of the narrow-card fallback.

The existing WP-068A validator was adjusted to require a dedicated non-overlapping action region. A new WP-068B validator checks both source and generated Cloudflare artifacts.

## Validation evidence

All pull-request gates passed:

- application and generated-artifact checks;
- WP-068A and WP-068B discovery contracts;
- Cloudflare build and security boundary checks;
- retained Docker build;
- clean Supabase startup;
- independent migration replay;
- all database contracts;
- match and entitlement concurrency tests;
- deterministic synthetic seed;
- schema lint.

Canonical Cloudflare run `30948012861` confirmed:

- commit-matched deployment;
- card-container responsive boundary;
- stacked narrow/intermediate layout;
- split-layout minimum widths;
- non-overlapping portrait, copy, action and context regions;
- no floating action controls;
- real-user admission remains unauthorized.

## Boundaries

This package changes presentation only. It does not change:

- Auth or account lifecycle;
- database schema or RLS;
- discovery/matching signal semantics;
- support and email-replacement machinery;
- retention policy;
- real-user admission.

## Next owner review

Reload canonical staging and test the discovery card at:

- narrow mobile width;
- tablet/intermediate browser width;
- wide desktop width.

The acceptance criterion is visual: portrait, all text and all controls must remain fully separated and readable at each width.
