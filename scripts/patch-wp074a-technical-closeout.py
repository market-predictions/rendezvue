from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path: str, before: str, after: str) -> None:
    file = ROOT / path
    source = file.read_text(encoding='utf-8')
    count = source.count(before)
    if count != 1:
        raise RuntimeError(f'{path}: expected one marker, found {count}: {before[:100]!r}')
    file.write_text(source.replace(before, after, 1), encoding='utf-8')

# WP evidence record.
replace_once(
    'docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md',
    '**Status:** WP-074 foundation accepted; WP-074A recalibration candidate pending independent assurance and canonical owner acceptance',
    '**Status:** WP-074A technically complete and canonically verified; owner visual acceptance pending',
)
replace_once(
    'docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md',
    '## Evidence contract\n\nThe WP-074A candidate must receive fresh independent assurance. Historical run `31132414431` is foundation evidence only and cannot certify the new product decision.\n\nFresh assurance must prove:',
    '## Evidence and acceptance\n\nHistorical run `31132414431` remains foundation evidence only. Fresh WP-074A assurance is complete.\n\nAccepted implementation and delivery evidence:\n\n- PR #110 merged the recalibrated product as `461b71d5f992f33936e87bc07a8b3336ae597c50`;\n- exact final candidate head `7764c6368aa81c76ef503929354e52f55564ad34` passed CI and full `Validate Rendezvue` run `31194940950`;\n- that run covered application/artifact checks, retained Docker, clean and empty-database migration replay, all pgTAP contracts, parallel match/entitlement races, deterministic seed and schema lint;\n- post-merge staging exposed an external Supabase `link` metadata regression; issue #111 tracked the deployment blocker;\n- PRs #112 and #113 replaced `supabase link` with a masked PRIMARY Supavisor session endpoint on port 5432 and documented `--db-url` migration transport;\n- PR #113 merged as `50ac252087b75ee930aff2cb36275995a55f093d`;\n- protected staging run `31197276822` passed database connection resolution, migration state before/after, pending migration application, cleanup deployment, Auth configuration, remote health, unauthenticated cleanup rejection and Cloudflare artifact validation;\n- canonical WP-074A run `31197343371` passed both the recalibrated contract and commit-matched delivered-asset verification.\n\nThe accepted technical contract proves:',
)
replace_once(
    'docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md',
    '- protected staging migration;\n- commit-matched canonical delivery of the recalibrated controller/model.\n\nOwner review remains separate from technical assurance.',
    '- protected staging migration;\n- commit-matched canonical delivery of the recalibrated controller/model.\n\nIssue #111 is closed as completed. Issue #109 remains open because owner review remains separate from technical assurance.',
)

# Roadmap status and immediate next action.
replace_once(
    'docs/ROADMAP.md',
    '**Status:** WP-074A implementation candidate; independent assurance and canonical owner verification pending; issue #109.',
    '**Status:** WP-074A technically complete and canonically verified; owner visual acceptance pending; issue #109.',
)
replace_once(
    'docs/ROADMAP.md',
    '1. Complete independent assurance and canonical deployment of WP-074A, then owner-review the recalibrated Unfiltered → Natural → Soft private → Balanced portrait gradient.',
    '1. Owner-review the canonically delivered WP-074A **Unfiltered → Natural → Soft private → Balanced** portrait gradient and record visual acceptance in issue #109.',
)

# Work package register.
replace_once(
    'docs/WORKPACKAGES.md',
    '**Status:** implementation candidate; independent assurance and canonical owner verification pending; issue #109  \nOwner field review superseded the original WP-074 visual ladder because levels 3 and 4 were excessively blurred. The active choices become Unfiltered, Natural, Soft private and Balanced with no default selection and Soft private recommended. Unfiltered is a prepared metadata-free derivative, never the original upload. Historical heavy IDs remain database-compatible but are excluded from the active client and rejected for new registrations. Fresh application, database, artifact, migration, race, seed, Docker, staging and canonical assurance is required before the recalibration is technically complete. Detailed evidence: `docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md`.',
    '**Status:** technically complete and canonically verified; owner visual acceptance pending; issue #109  \nOwner field review superseded the original WP-074 visual ladder because levels 3 and 4 were excessively blurred. The active choices are Unfiltered, Natural, Soft private and Balanced with no default selection and Soft private recommended. Unfiltered is a prepared metadata-free derivative, never the original upload. Historical heavy IDs remain database-compatible but are excluded from the active client and rejected for new registrations. PR #110 merged the product; run `31194940950` passed full repository assurance; protected staging run `31197276822` applied the migration through the hardened Supavisor session transport; canonical run `31197343371` verified delivered assets. Detailed evidence: `docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md`.',
)

# Work claim evidence/state.
replace_once(
    'docs/WORK-CLAIMS.md',
    '| WC-074 | Participants can explicitly select Unfiltered, Natural, Soft private or Balanced prepared portrait derivatives while the original source remains private and non-selectable. | Implementation candidate; independent assurance pending | issue #109, WP-074A client/model tests, migration and pgTAP contract | Unfiltered is recognisable by design; it is a metadata-free prepared derivative, not the original upload. Real-user authorization is not claimed. |',
    '| WC-074 | Participants can explicitly select Unfiltered, Natural, Soft private or Balanced prepared portrait derivatives while the original source remains private and non-selectable. | Demonstrated in source, full repository assurance, protected staging and canonical delivery | issue #109, PR #110, run `31194940950`, protected run `31197276822`, canonical run `31197343371` | Owner visual acceptance remains pending. Unfiltered is recognisable by design; it is a metadata-free prepared derivative, not the original upload. Real-user authorization is not claimed. |',
)

# Handover state/evidence.
replace_once(
    'docs/HANDOVER.md',
    '**Milestone:** WP-074A privacy portrait recognisability recalibration in independent review',
    '**Milestone:** WP-074A privacy portrait recognisability recalibration technically complete; owner visual acceptance pending',
)
replace_once(
    'docs/HANDOVER.md',
    'The active candidate is now **Zonder filter / Unfiltered → Natural → Soft private → Balanced** with no default selection and Soft private recommended. Unfiltered means a newly rendered metadata-free 4:5 card and square avatar derivative without obscuring blur; the uploaded/normalized source remains private and cannot become the selected profile portrait. Natural is a new light treatment; Soft private and Balanced preserve the former useful Soft and Balanced recipes. Historical `monoMist` and `privacyMax` records remain readable but new writes reject them. Historical protected run `31132414431` remains foundation evidence only; WP-074A requires a fresh independent assurance and commit-matched staging proof. Issue #109 stays open for final owner visual acceptance.',
    'The active canonical ladder is now **Zonder filter / Unfiltered → Natural → Soft private → Balanced** with no default selection and Soft private recommended. Unfiltered means a newly rendered metadata-free 4:5 card and square avatar derivative without obscuring blur; the uploaded/normalized source remains private and cannot become the selected profile portrait. Natural is a new light treatment; Soft private and Balanced preserve the former useful Soft and Balanced recipes. Historical `monoMist` and `privacyMax` records remain readable but new writes reject them. PR #110 merged as `461b71d5f992f33936e87bc07a8b3336ae597c50`; full assurance run `31194940950`, protected staging run `31197276822` and canonical WP-074A run `31197343371` passed. The staging migration transport was hardened in PRs #112/#113 after external Supabase CLI metadata drift; issue #111 is closed. Issue #109 stays open only for final owner visual acceptance.',
)

# Changelog evidence.
replace_once(
    'CHANGELOG.md',
    '- Extended normal Cloudflare validation and canonical verification to lock the new ladder and source-media privacy boundary.\n- Closed superseded PR #108 because its old closeout claim prohibited any unfiltered public derivative.',
    '- Extended normal Cloudflare validation and canonical verification to lock the new ladder and source-media privacy boundary.\n- PR #110 merged the recalibrated product; full repository run `31194940950`, protected staging run `31197276822` and canonical run `31197343371` passed.\n- Hardened protected migrations in PRs #112/#113 after an external Supabase CLI `link` metadata regression; migrations now use a masked PRIMARY Supavisor session endpoint and `--db-url`; issue #111 is closed.\n- Closed superseded PR #108 because its old closeout claim prohibited any unfiltered public derivative.',
)

print('WP-074A technical closeout documentation patched.')
