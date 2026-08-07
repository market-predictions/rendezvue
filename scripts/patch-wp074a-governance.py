from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path: str, before: str, after: str) -> None:
    file = ROOT / path
    source = file.read_text(encoding='utf-8')
    count = source.count(before)
    if count != 1:
        raise RuntimeError(f'{path}: expected one marker, found {count}: {before[:80]!r}')
    file.write_text(source.replace(before, after, 1), encoding='utf-8')


def append_once(path: str, marker: str, addition: str) -> None:
    file = ROOT / path
    source = file.read_text(encoding='utf-8')
    if addition.strip() in source:
        return
    if marker not in source:
        raise RuntimeError(f'{path}: missing append marker {marker!r}')
    file.write_text(source.replace(marker, marker + addition, 1), encoding='utf-8')


# Roadmap version, old privacy-grid description, WP-074A work and immediate next gate.
replace_once(
    'docs/ROADMAP.md',
    '**Version:** 2.15  \n**Updated:** 2026-08-05',
    '**Version:** 2.16  \n**Updated:** 2026-08-07',
)
replace_once(
    'docs/ROADMAP.md',
    '### 1C. Selectable privacy portraits\n\n**Status:** implementation complete; integrated mobile owner review remains.\n\nFour browser-local fuzzy variants, no raw-selfie option and downsampling fallback.',
    '### 1C. Selectable portrait presentations\n\n**Status:** WP-074 foundation accepted; WP-074A recognisability recalibration in review.\n\nParticipants explicitly choose among four prepared portrait presentations. The original/raw source remains private. WP-074A recalibrates the active ladder to Unfiltered, Natural, Soft private and Balanced; Unfiltered is a freshly rendered metadata-free card/avatar derivative without obscuring blur, not the uploaded source file.',
)
replace_once(
    'docs/ROADMAP.md',
    '### 2Q. Scalable conversation inbox\n\n**Status:** WP-073 implementation in review; canonical owner verification pending.\n\nMatches now scale into an inbox with separate ongoing conversations, new matches and previous contacts. Conversation rows expose participant identity, latest-message context, activity time and unread state; the selected thread has a persistent identity header. Desktop uses a list/detail layout and mobile uses an explicit list-to-conversation transition. Message, Realtime and safety actions remain scoped to the selected match. Detailed evidence: `docs/WP-073-CONVERSATION-INBOX.md`.\n',
    '### 2Q. Scalable conversation inbox\n\n**Status:** WP-073 implementation in review; canonical owner verification pending.\n\nMatches now scale into an inbox with separate ongoing conversations, new matches and previous contacts. Conversation rows expose participant identity, latest-message context, activity time and unread state; the selected thread has a persistent identity header. Desktop uses a list/detail layout and mobile uses an explicit list-to-conversation transition. Message, Realtime and safety actions remain scoped to the selected match. Detailed evidence: `docs/WP-073-CONVERSATION-INBOX.md`.\n\n### 2R. Privacy portrait recognisability recalibration\n\n**Status:** WP-074A implementation candidate; independent assurance and canonical owner verification pending; issue #109.\n\nOwner field review found the former Private and Extra private levels excessively blurred. WP-074A changes the active ladder to **Unfiltered → Natural → Soft private → Balanced**. Unfiltered is a normalized, framed, metadata-free card/avatar derivative without an obscuring filter; the original source remains private and cannot become the selected profile portrait. Natural is a new very light treatment, while Soft private and Balanced preserve the former useful WP-074 level-1 and level-2 recipes. Historical `monoMist` and `privacyMax` records remain readable but those treatments are hidden from the active UI and rejected for new registrations. Detailed evidence: `docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md`.\n',
)
replace_once(
    'docs/ROADMAP.md',
    '1. Owner-led desktop and mobile review of the complete account-to-conversation journey.\n2. Controlled disposable-account execution of WP-067 and the separate WP-065F mailbox-replacement proof when suitable mailboxes are available.\n3. Product refinements from field review: portrait attractiveness, profile density, navigation clarity and representative Dutch/English terminology.',
    '1. Complete independent assurance and canonical deployment of WP-074A, then owner-review the recalibrated Unfiltered → Natural → Soft private → Balanced portrait gradient.\n2. Owner-led desktop and mobile review of the complete account-to-conversation journey.\n3. Controlled disposable-account execution of WP-067 and the separate WP-065F mailbox-replacement proof when suitable mailboxes are available.\n4. Product refinements from field review: portrait attractiveness, profile density, navigation clarity and representative Dutch/English terminology.',
)
# Fix numbering after inserting an item.
replace_once('docs/ROADMAP.md', '4. Operational support, retention/DPIA, moderation, accessibility, security and legal readiness.\n5. Explicit closed-city pilot decision only after all entry gates pass.', '5. Operational support, retention/DPIA, moderation, accessibility, security and legal readiness.\n6. Explicit closed-city pilot decision only after all entry gates pass.')

# Work package register.
replace_once(
    'docs/WORKPACKAGES.md',
    '## WP-080 — Closed city pilot readiness',
    '## WP-074A — Privacy portrait recognisability recalibration\n\n**Status:** implementation candidate; independent assurance and canonical owner verification pending; issue #109  \nOwner field review superseded the original WP-074 visual ladder because levels 3 and 4 were excessively blurred. The active choices become Unfiltered, Natural, Soft private and Balanced with no default selection and Soft private recommended. Unfiltered is a prepared metadata-free derivative, never the original upload. Historical heavy IDs remain database-compatible but are excluded from the active client and rejected for new registrations. Fresh application, database, artifact, migration, race, seed, Docker, staging and canonical assurance is required before the recalibration is technically complete. Detailed evidence: `docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md`.\n\n## WP-080 — Closed city pilot readiness',
)

# Work claims: repair old broad claim and add candidate claim.
replace_once(
    'docs/WORK-CLAIMS.md',
    '| WC-007 | The browser produces four fuzzy privacy portraits. | Implemented | renderer and UI | Blur is not anonymity or liveness. |',
    '| WC-007 | The browser presents four explicit prepared portrait presentation choices. | Recalibration candidate under WP-074A | renderer, UI and issue #109 | The original source remains private; Unfiltered is intentionally recognisable and blur is not anonymity. |',
)
append_once(
    'docs/WORK-CLAIMS.md',
    '| WC-073 | Multiple matches and conversations are presented as a selectable inbox with participant identity, latest-message context, unread state and selected-thread-scoped messaging and safety actions. | Implemented in source and regression-tested | issue #104, `conversation-inbox-model.test.mjs`, `conversation-inbox-integration.test.mjs`, WP-073 artifact and canonical verifier | Unread state is device-local rather than server-synchronised; canonical owner acceptance with representative multiple conversations remains pending; real users are unauthorized. |',
    '\n| WC-074 | Participants can explicitly select Unfiltered, Natural, Soft private or Balanced prepared portrait derivatives while the original source remains private and non-selectable. | Implementation candidate; independent assurance pending | issue #109, WP-074A client/model tests, migration and pgTAP contract | Unfiltered is recognisable by design; it is a metadata-free prepared derivative, not the original upload. Real-user authorization is not claimed. |',
)

# Handover top and new current milestone section.
replace_once(
    'docs/HANDOVER.md',
    '**Updated:** 2026-08-05  \n**Milestone:** WP-073 scalable conversation inbox implemented; canonical owner verification pending',
    '**Updated:** 2026-08-07  \n**Milestone:** WP-074A privacy portrait recognisability recalibration in independent review',
)
replace_once(
    'docs/HANDOVER.md',
    '- Scalable conversation inbox: issue #104 / WP-073 / `docs/WP-073-CONVERSATION-INBOX.md`.\n',
    '- Scalable conversation inbox: issue #104 / WP-073 / `docs/WP-073-CONVERSATION-INBOX.md`.\n- Privacy portrait recognisability recalibration: issue #109 / WP-074A / `docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md`.\n',
)
replace_once(
    'docs/HANDOVER.md',
    '## Current WP-073 conversation-inbox milestone',
    '## Current WP-074A privacy portrait recalibration\n\nOwner field review after WP-074 protected acceptance found the former Private and Extra private options too blurred to improve the experience. Issue #109 therefore supersedes the original visual ladder. The active candidate is now **Zonder filter / Unfiltered → Natural → Soft private → Balanced** with no default selection and Soft private recommended. Unfiltered means a newly rendered metadata-free 4:5 card and square avatar derivative without obscuring blur; the uploaded/normalized source remains private and cannot become the selected profile portrait. Natural is a new light treatment; Soft private and Balanced preserve the former useful Soft and Balanced recipes. Historical `monoMist` and `privacyMax` records remain readable but new writes reject them. Historical protected run `31132414431` remains foundation evidence only; WP-074A requires a fresh independent assurance and commit-matched staging proof. Issue #109 stays open for final owner visual acceptance. Real-user admission remains unauthorized.\n\n## Current WP-073 conversation-inbox milestone',
)

# Changelog entry at the top of Unreleased.
replace_once(
    'CHANGELOG.md',
    '## [Unreleased]\n\n### Scalable conversation inbox',
    '## [Unreleased]\n\n### Privacy portrait recognisability recalibration\n\n- Added WP-074A after owner field review found the former Private and Extra private levels excessively blurred.\n- Replaced the active ladder with **Zonder filter / Unfiltered**, **Natural**, **Soft private** and **Balanced**.\n- Defined Unfiltered as a freshly rendered metadata-free prepared card/avatar derivative without obscuring blur; the original upload and normalized source remain private.\n- Added a new very-light Natural treatment (`blur: 3`).\n- Moved the former Soft recipe to Soft private at level 3 and made it Recommended without preselection.\n- Moved the former Balanced recipe to level 4.\n- Removed `monoMist` and `privacyMax` from the active client and rejected them for new registrations while retaining historical database compatibility.\n- Added a new migration and pgTAP proof distinguishing unfiltered prepared derivatives from prohibited raw-source publication.\n- Extended normal Cloudflare validation and canonical verification to lock the new ladder and source-media privacy boundary.\n- Closed superseded PR #108 because its old closeout claim prohibited any unfiltered public derivative.\n- Real-user admission remains unauthorized.\n\n### Scalable conversation inbox',
)

print('WP-074A governance documentation patched.')
