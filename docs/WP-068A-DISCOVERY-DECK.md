# WP-068A — Discovery card interaction repair

**Status:** complete on controlled synthetic Cloudflare staging  
**Owner feedback:** 2026-08-04 screenshot showed a vertical portrait wall without visible profile information or interaction controls  
**Implementation issue:** #78  
**Implementation PR:** #79  
**Implementation merge:** `1035a5492ff4cb2e6233bc5bd4b1fa5d7227ecae`  
**Cache-coherence repair PR:** #80  
**Accepted canonical commit:** `03739181baa8bfbb35663f6e152b1bf7aa9d69fb`  
**Canonical verification:** run `30935664310`

## Defect

The WP-067 discovery source created profile copy and Pass, Like and contextual-like controls, but the owner field review showed that the canonical presentation behaved as a long wall of large synthetic portraits. Name, city/life stage, relationship intention, biography and interaction controls were not effectively visible.

This was treated as a product defect rather than user error.

## Accepted product behavior

The discovery experience now:

- presents exactly one active profile at a time;
- keeps all remaining profiles hidden, inert and outside keyboard interaction;
- shows profile position and deck progress;
- keeps name, city/life stage, relationship intention and biography visibly attached to the portrait;
- provides persistent and visually distinct `Overslaan`, `Leuk` and `Reageer` controls in Dutch;
- provides equivalent Pass, Like and Respond controls in English;
- retains the contextual-like message form;
- advances to the next profile after the existing authoritative attraction-signal action succeeds;
- scrolls the next active card back into view;
- uses a centered portrait/details card on mobile and a split portrait/details layout on wider screens;
- preserves product-safe display projections without exposing account identifiers.

## Technical implementation

`discovery-deck.js` is an additive presentation controller over the existing WP-067 discovery and Supabase RPC logic. It does not replace or weaken the authoritative signal, matching, RLS or Auth contracts.

`discovery-deck.css` enforces visible profile information and controls, including a reachable sticky mobile action area.

The controller records a module version, allows a commit-versioned controller to take authority over an older unversioned controller and propagates its commit token to the stylesheet.

## Cache-coherence defect and repair

PR #79 passed all source, generated-artifact and backend checks. Its first canonical verification still failed because deployment metadata and the new deck assets were current while Cloudflare served an older cached `account-shell.js` without the new import.

PR #80 repaired the release boundary by:

- inserting a direct `discovery-deck.js?commit=<build commit>` module entry into generated `index.html`;
- propagating the same commit token to `discovery-deck.css`;
- allowing the versioned controller to supersede a stale or unversioned controller;
- serving `/`, the index and product/deck JavaScript and CSS with `no-cache, max-age=0, must-revalidate`;
- validating generated HTML and `_headers` before deployment;
- verifying the exact versioned URLs and response headers on canonical staging.

## Validation

The implementation and cache repair passed:

- 55+ Node application tests, including deck progression, bilingual labels and stylesheet commit propagation;
- generated Cloudflare artifact validation;
- one-active-card and visible-copy/action contracts;
- second-client and privileged-browser-capability rejection;
- retained Docker build;
- clean Supabase startup;
- independent empty-database migration replay;
- all pgTAP database contracts;
- parallel match and entitlement race tests;
- deterministic synthetic seed;
- schema lint.

Canonical run `30935664310` verified on `https://rendezvue-private-preview.pages.dev/`:

- commit-matched deployment `03739181baa8bfbb35663f6e152b1bf7aa9d69fb`;
- commit-versioned discovery module and stylesheet;
- root and product asset cache revalidation;
- one active profile at a time;
- visible profile information;
- persistent Pass, Like and Respond controls;
- inactive cards hidden and inert;
- no privileged browser capability.

## Boundaries

- The portraits remain deterministic synthetic seed art; portrait attractiveness and stylistic quality are a separate field-review topic.
- This package does not activate swiping gestures; explicit buttons remain the reliable baseline.
- No database schema, Auth, RLS, support, retention, payment or real-user-admission behavior changed.
- Real-user admission remains unauthorized.
