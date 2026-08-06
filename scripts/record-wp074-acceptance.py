from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path, before, after):
    target = ROOT / path
    source = target.read_text(encoding='utf-8')
    count = source.count(before)
    if count != 1:
        raise RuntimeError(f'{path}: expected one marker, found {count}')
    target.write_text(source.replace(before, after, 1), encoding='utf-8')


def append_once(path, marker, addition):
    target = ROOT / path
    source = target.read_text(encoding='utf-8')
    if marker in source:
        return
    target.write_text(source.rstrip() + '\n\n' + addition.strip() + '\n', encoding='utf-8')


replace_once('docs/ROADMAP.md', '**Version:** 2.15', '**Version:** 2.16')
replace_once(
    'docs/ROADMAP.md',
    '### 1C. Selectable privacy portraits\n\n**Status:** implementation complete; integrated mobile owner review remains.\n\nFour browser-local fuzzy variants, no raw-selfie option and downsampling fallback.',
    '### 1C. Selectable privacy portraits\n\n**Status:** WP-074 technically accepted and canonically delivered; owner visual review remains.\n\nThe four browser-local variants are integrated into the normalized upload/crop flow. A participant must make an explicit bounded choice; there is no raw-selfie public option and no implicit default selection.'
)
roadmap = '''### 2R. Mandatory integrated privacy portrait filters

**Status:** WP-074 technically accepted and canonically delivered; owner visual verification pending.

After framing, participants must explicitly choose one of four bounded browser-local privacy levels. The selected recipe is baked into both card and avatar derivatives before upload; the normalized source remains private. The filter ID is constrained and persisted server-side, the legacy unfiltered registration signature is revoked for authenticated users, and earlier unfiltered participant-prepared cards fail closed pending re-preparation. Detailed evidence: `docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md` and issue #106.

'''
replace_once('docs/ROADMAP.md', '## Phase 3 — Closed city-based PWA pilot', roadmap + '## Phase 3 — Closed city-based PWA pilot')

workpackage = '''## WP-074 — Mandatory integrated privacy portrait filters

**Status:** technically accepted and canonically delivered; owner visual verification pending; issue #106  
The participant upload/crop flow requires an explicit choice among four browser-local privacy levels. Raw card/avatar crops remain in memory only; the selected filter is baked into both public derivatives and persisted as bounded server metadata. Authenticated users cannot call the legacy unfiltered registration signature, and earlier unfiltered participant-prepared cards fail closed pending re-preparation. Synthetic fixtures remain compatible. Detailed evidence: `docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md`.

'''
replace_once('docs/WORKPACKAGES.md', '## WP-080 — Closed city pilot readiness', workpackage + '## WP-080 — Closed city pilot readiness')

claim = '| WC-074 | A participant-prepared portrait cannot become selected until one of four bounded privacy filters is explicitly chosen and baked into both card and avatar derivatives. | Technically accepted and canonically delivered | issue #106, PR #107, WP-074 unit/pgTAP/artifact/canonical acceptance | Browser filtering reduces recognisability but is not anonymity; owner visual acceptance remains pending; real users remain unauthorized. |'
replace_once(
    'docs/WORK-CLAIMS.md',
    '| WC-073 | Multiple matches and conversations are presented as a selectable inbox with participant identity, latest-message context, unread state and selected-thread-scoped messaging and safety actions. | Implemented in source and regression-tested | issue #104, `conversation-inbox-model.test.mjs`, `conversation-inbox-integration.test.mjs`, WP-073 artifact and canonical verifier | Unread state is device-local rather than server-synchronised; canonical owner acceptance with representative multiple conversations remains pending; real users are unauthorized. |',
    '| WC-073 | Multiple matches and conversations are presented as a selectable inbox with participant identity, latest-message context, unread state and selected-thread-scoped messaging and safety actions. | Implemented in source and regression-tested | issue #104, `conversation-inbox-model.test.mjs`, `conversation-inbox-integration.test.mjs`, WP-073 artifact and canonical verifier | Unread state is device-local rather than server-synchronised; canonical owner acceptance with representative multiple conversations remains pending; real users are unauthorized. |\n' + claim
)

changelog = '''### Mandatory integrated privacy portrait filters

- Added WP-074 after owner review exposed that the integrated upload/crop flow had no control for obscuring a participant portrait.
- Restored four bounded browser-local privacy choices with no raw/original option and no implicit default selection.
- Added direct card and avatar previews for every choice and marked the balanced option as recommended.
- Required explicit selection before upload and baked the chosen recipe into both public derivatives.
- Persisted the selected filter ID across the complete server-authoritative preparation.
- Revoked authenticated access to the legacy unfiltered registration signature.
- Fail-closed earlier unfiltered participant-prepared selected cards and returned affected staging profiles to draft for re-preparation.
- Kept normalized source media private, synthetic fixture portraits compatible and private paths out of browser/audit projections.
- Added unit, pgTAP, generated-artifact, protected staging and canonical delivery controls.
- Browser filtering is explicitly not claimed as anonymity; real-user admission remains unauthorized.

'''
replace_once('CHANGELOG.md', '## [Unreleased]\n\n', '## [Unreleased]\n\n' + changelog)

replace_once(
    'docs/HANDOVER.md',
    '**Milestone:** WP-073 scalable conversation inbox implemented; canonical owner verification pending',
    '**Milestone:** WP-074 mandatory privacy portrait filters technically accepted; owner visual verification pending'
)
replace_once(
    'docs/HANDOVER.md',
    '- Scalable conversation inbox: issue #104 / WP-073 / `docs/WP-073-CONVERSATION-INBOX.md`.\n',
    '- Scalable conversation inbox: issue #104 / WP-073 / `docs/WP-073-CONVERSATION-INBOX.md`.\n- Mandatory privacy portrait filters: issue #106 / WP-074 / `docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md`.\n'
)
handover = '''## Current WP-074 privacy portrait correction

Owner review established that the WP-069B upload/crop editor produced recognisable derivatives without offering the four privacy choices accepted in ADR-0006. WP-074 now requires an explicit choice among `softFocus`, `warmVeil`, `monoMist` and `privacyMax`; no raw option exists and no level is preselected. The selected recipe is baked into card and avatar derivatives before upload, while the normalized source remains private. The server persists the bounded filter ID and denies authenticated use of the legacy unfiltered registration signature. Earlier participant-prepared unfiltered cards fail closed and require re-preparation; synthetic fixture portraits remain compatible. Technical and canonical acceptance are recorded in issue #106. Owner visual review remains open. Real-user admission remains unauthorized.

'''
replace_once('docs/HANDOVER.md', '## Current WP-073 conversation-inbox milestone', handover + '## Current WP-073 conversation-inbox milestone')

replace_once(
    'docs/PRIVACY-AND-SAFETY.md',
    '- never publish raw capture;\n',
    '- never publish raw capture;\n- require an explicit bounded privacy-filter choice before participant card/avatar derivatives can be selected;\n- keep raw card/avatar crops in browser memory only and bake the selected filter into uploaded public derivatives;\n'
)

replace_once(
    'docs/decisions/ADR-0006-browser-privacy-filter-grid.md',
    '**Status:** accepted for pilot implementation  ',
    '**Status:** accepted and integrated by WP-074; owner visual acceptance pending  '
)
append_once(
    'docs/decisions/ADR-0006-browser-privacy-filter-grid.md',
    '## 2026-08-06 integration correction',
    '''## 2026-08-06 integration correction

WP-069B unintentionally replaced the visible filter grid with a crop-only derivative pipeline. WP-074 restores this decision inside the normalized source/card/avatar architecture. The stable implementation IDs are `softFocus`, `warmVeil`, `monoMist` and `privacyMax`; no raw option is permitted and no choice is selected implicitly.'''
)

append_once(
    'docs/WP-069B-PROFILE-IMAGE-PREPARATION.md',
    '## WP-074 correction',
    '''## WP-074 correction

Owner review on 2026-08-06 established that WP-069B provided framing and resilient presentation but did not integrate the accepted privacy-filter grid. Its card/avatar derivatives were recognisable crops. WP-074 treats those participant-prepared unfiltered outputs as non-compliant, restores a mandatory four-choice filter step and requires re-preparation. This does not invalidate the WP-069B framing, path, derivative and isolation evidence; it corrects the missing privacy transformation between crop and upload.'''
)

wp074 = ROOT / 'docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md'
source = wp074.read_text(encoding='utf-8')
source = source.replace(
    '**Status:** implementation candidate; independent assurance and canonical owner acceptance pending',
    '**Status:** technically accepted and canonically delivered; owner visual acceptance pending'
)
wp074.write_text(source, encoding='utf-8')

print('WP-074 acceptance administration updated.')
