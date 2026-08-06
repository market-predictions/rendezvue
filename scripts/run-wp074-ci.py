from pathlib import Path
import base64
import io
import runpy
import tarfile

ROOT = Path(__file__).resolve().parents[1]
runpy.run_path(str(ROOT / 'scripts/patch-wp074.py'), run_name='__main__')

package = ROOT / 'package.json'
source = package.read_text(encoding='utf-8')
trigger = '"check": "python scripts/run-wp074-ci.py && '
if trigger not in source:
    raise RuntimeError('temporary trusted-CI trigger is missing')
package.write_text(source.replace(trigger, '"check": "', 1), encoding='utf-8')

files = [
    'CHANGELOG.md',
    'package.json',
    'apps/private-preview/product-model.js',
    'apps/private-preview/profile-image-preparation.css',
    'apps/private-preview/profile-image-preparation.js',
    'apps/web/src/privacy-portrait-filters.js',
    'apps/web/tests/privacy-portrait-filters.test.mjs',
    'docs/HANDOVER.md',
    'docs/PRIVACY-AND-SAFETY.md',
    'docs/ROADMAP.md',
    'docs/WORK-CLAIMS.md',
    'docs/WORKPACKAGES.md',
    'docs/WP-069B-PROFILE-IMAGE-PREPARATION.md',
    'docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md',
    'docs/decisions/ADR-0006-browser-privacy-filter-grid.md',
    'scripts/build-private-preview.mjs',
    'scripts/finalize-discovery-deck-artifact.mjs',
    'scripts/validate-wp069b-profile-image-preparation.mjs',
    'scripts/validate-wp074-privacy-portrait-filters.mjs',
    'supabase/migrations/20260806225500_privacy_portrait_filter_selection.sql',
    'supabase/tests/database/014_profile_image_preparation.test.sql'
]

buffer = io.BytesIO()
with tarfile.open(fileobj=buffer, mode='w:gz') as archive:
    for relative in files:
        path = ROOT / relative
        if not path.is_file():
            raise RuntimeError(f'candidate output missing: {relative}')
        archive.add(path, arcname=relative)

print('WP074_VALIDATED_ARCHIVE_BEGIN')
print(base64.b64encode(buffer.getvalue()).decode('ascii'))
print('WP074_VALIDATED_ARCHIVE_END')
