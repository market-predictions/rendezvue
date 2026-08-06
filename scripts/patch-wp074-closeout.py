from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path: str, before: str, after: str) -> None:
    file = ROOT / path
    source = file.read_text(encoding='utf-8')
    if source.count(before) != 1:
        raise RuntimeError(f'{path}: expected exactly one marker, found {source.count(before)}')
    file.write_text(source.replace(before, after, 1), encoding='utf-8')


changelog = """### Mandatory privacy portrait filters restored and protected-acceptance verified

- Restored the four fixed browser-local privacy choices from ADR-0006: `softFocus`, `warmVeil`, `monoMist` and `privacyMax`.
- No raw, original or none option exists and no privacy level is selected implicitly.
- The selected recipe is baked into both the public 4:5 card and square avatar before upload; the normalized source remains private.
- Persisted and constrained the selected filter identifier across each preparation, revoked the authenticated legacy unfiltered registration signature and returned earlier unfiltered participant cards to draft.
- Added lifecycle-safe controller loading, direct card/avatar previews, bilingual copy, unit tests, pgTAP, source/artifact validation and a commit-matched canonical verifier.
- Protected acceptance run `31132414431` passed application and Cloudflare checks, empty-database migration replay, all pgTAP contracts, parallel races, deterministic seed, schema lint, Docker build, protected staging migration and canonical module delivery.
- Browser filtering reduces recognisability but is not anonymity. Real-user admission remains unauthorized.

"""
replace_once('CHANGELOG.md', '## [Unreleased]\n\n', '## [Unreleased]\n\n' + changelog)

replace_once('docs/ROADMAP.md', '**Version:** 2.15  \n**Updated:** 2026-08-05', '**Version:** 2.16  \n**Updated:** 2026-08-06')
roadmap = """### 2R. Mandatory privacy portrait filters

**Status:** WP-074 technically complete and protected-acceptance verified; canonical owner visual acceptance pending.

The normal participant portrait flow now requires an explicit choice among four bounded browser-local privacy variants after framing. No raw/original/none option exists and no level is preselected. The chosen treatment is baked into both public derivatives before upload, while the normalized source remains private. The server persists and constrains the filter ID, denies the legacy authenticated unfiltered registration path and fail-closes earlier participant cards that lack filter metadata. Protected run `31132414431` passed the complete application, database, race, seed, Docker, staging-migration and canonical-delivery chain. Detailed evidence: `docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md`.

"""
replace_once('docs/ROADMAP.md', '## Phase 3 — Closed city-based PWA pilot', roadmap + '## Phase 3 — Closed city-based PWA pilot')

workpackage = """## WP-074 — Mandatory privacy portrait filters

**Status:** technically complete and protected-acceptance verified; canonical owner visual acceptance pending; issue #106  
The participant upload flow now requires one of four bounded privacy treatments after framing. Raw card/avatar crops remain in browser memory only; the selected recipe is baked into both public derivatives before upload, while the normalized source stays private. The database constrains and persists the filter ID, denies the authenticated legacy unfiltered signature and deselects earlier participant-prepared cards without filter metadata. Protected run `31132414431` passed application, artifact, empty-database migration, all pgTAP, race, seed, lint, Docker, staging migration and canonical delivery checks. Detailed evidence: `docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md`.

"""
replace_once('docs/WORKPACKAGES.md', '## WP-080 — Closed city pilot readiness', workpackage + '## WP-080 — Closed city pilot readiness')

wc073 = "| WC-073 | Multiple matches and conversations are presented as a selectable inbox with participant identity, latest-message context, unread state and selected-thread-scoped messaging and safety actions. | Implemented in source and regression-tested | issue #104, `conversation-inbox-model.test.mjs`, `conversation-inbox-integration.test.mjs`, WP-073 artifact and canonical verifier | Unread state is device-local rather than server-synchronised; canonical owner acceptance with representative multiple conversations remains pending; real users are unauthorized. |"
wc074 = "| WC-074 | A participant-prepared public profile card and avatar cannot be registered through the normal authenticated flow without one explicit bounded browser-local privacy treatment. | Demonstrated in source, database, protected staging and canonical delivery | issue #106, PR #107, 89 application tests, 54 combined WP-069B/WP-074 pgTAP assertions and protected run `31132414431` | Browser filtering reduces recognisability but is not anonymity; visual owner acceptance on representative portraits and devices remains pending; real users are unauthorized. |"
replace_once('docs/WORK-CLAIMS.md', wc073, wc073 + '\n' + wc074)

replace_once('docs/HANDOVER.md', '**Updated:** 2026-08-05  \n**Milestone:** WP-073 scalable conversation inbox implemented; canonical owner verification pending', '**Updated:** 2026-08-06  \n**Milestone:** WP-074 privacy portrait filters protected-acceptance verified; canonical owner visual acceptance pending')
replace_once('docs/HANDOVER.md', '- Scalable conversation inbox: issue #104 / WP-073 / `docs/WP-073-CONVERSATION-INBOX.md`.\n', '- Scalable conversation inbox: issue #104 / WP-073 / `docs/WP-073-CONVERSATION-INBOX.md`.\n- Mandatory privacy portrait filters: issue #106 / PR #107 / WP-074 / `docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md`.\n')
handover = """## Current WP-074 privacy-portrait milestone

Owner review found that the integrated upload/crop surface still produced recognisable card and avatar derivatives without exposing the four privacy choices accepted in ADR-0006. WP-074 now waits for the signed-in profile form, detaches the former unfiltered input listener, requires an explicit choice among `softFocus`, `warmVeil`, `monoMist` and `privacyMax`, and bakes the selected treatment into both public derivatives before upload. No raw/original/none option exists and no level is preselected. The normalized source remains private. The staging database now persists and constrains the filter ID, denies the authenticated legacy unfiltered signature and returns prior participant-prepared cards without filter metadata to draft.

Protected run `31132414431` passed 89 application tests, the generated Cloudflare contract, empty-database replay, all WP-069B/WP-074 pgTAP assertions, parallel races, deterministic ten-profile seed, schema lint, retained Docker build, protected staging migration and canonical module verification. Issue #106 remains open only for owner visual confirmation across representative desktop/mobile portraits and discovery, match and conversation surfaces. Browser filtering reduces recognisability but is not anonymity. Real-user admission remains unauthorized.

"""
replace_once('docs/HANDOVER.md', '## Current WP-073 conversation-inbox milestone', handover + '## Current WP-073 conversation-inbox milestone')

replace_once('docs/PRIVACY-AND-SAFETY.md', '- never publish raw capture;\n- process locally where feasible;', '- never publish raw capture;\n- require one explicit bounded privacy treatment before participant card/avatar registration;\n- provide no raw, original or none option and do not preselect a level;\n- bake the selected treatment into both public derivatives before upload;\n- keep the normalized source private and redact all Storage paths from browser snapshots and audit payloads;\n- process locally where feasible;')

replace_once('docs/decisions/ADR-0006-browser-privacy-filter-grid.md', '**Status:** accepted for pilot implementation', '**Status:** implemented and protected-acceptance verified for synthetic staging')
evidence = """## Implementation evidence

WP-074 implements this decision in the normal signed-in portrait flow. The browser presents exactly four variants, requires an explicit choice, filters both card and avatar before upload and exposes no raw/original/none path. The database persists a constrained filter identifier, denies the legacy authenticated unfiltered registration signature and returns earlier participant-prepared unfiltered cards to draft. Protected run `31132414431` passed application, artifact, empty-database migration, pgTAP, race, deterministic seed, lint, Docker, protected staging migration and canonical-delivery verification. Owner visual acceptance remains pending. Browser filtering remains a recognisability reduction, not anonymity.

"""
replace_once('docs/decisions/ADR-0006-browser-privacy-filter-grid.md', '## Consequences', evidence + '## Consequences')

replace_once('docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md', '**Status:** implementation candidate; independent assurance and canonical owner acceptance pending', '**Status:** technically complete and protected-acceptance verified; canonical owner visual acceptance pending')
replace_once('docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md', 'The candidate must pass:', 'Protected acceptance run `31132414431` passed:')
replace_once('docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md', '- protected staging migration and commit-matched canonical delivery checks.\n\nOwner review must compare', '- protected staging migration and commit-matched canonical delivery checks.\n\nThe run accepted commit `bf9eeec90dd0c72f1f5a1417a531240a7a4c1c36`, with product implementation ancestor `82b07bb7f69d14071706deb61a9cdb8a69fc9eab`, and applied the WP-074 migration to protected staging. All 89 application tests and all WP-069B/WP-074 database assertions passed.\n\nOwner review must compare')

print('WP-074 closeout documentation patched successfully.')
