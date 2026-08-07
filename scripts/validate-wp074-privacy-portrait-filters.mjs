import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const dist = resolve(root, 'dist-private-preview');
const failures = [];
const requireMarker = (source, marker, message) => { if (!source.includes(marker)) failures.push(message); };
const forbid = (source, pattern, message) => { if (pattern.test(source)) failures.push(message); };

const [controller, loader, css, filterModel, filterTest, migration074, migration074a,
  databaseTest015, databaseTest016, profilePreparationTest, finalizer,
  builtController, builtLoader, builtCss, builtFilterModel, builtIndex, headers] = await Promise.all([
  readFile(resolve(root, 'apps/private-preview/privacy-portrait-controller.js'), 'utf8'),
  readFile(resolve(root, 'apps/private-preview/privacy-portrait-loader.js'), 'utf8'),
  readFile(resolve(root, 'apps/private-preview/privacy-portrait-filters.css'), 'utf8'),
  readFile(resolve(root, 'apps/private-preview/privacy-portrait-filters.js'), 'utf8'),
  readFile(resolve(root, 'apps/web/tests/privacy-portrait-filters.test.mjs'), 'utf8'),
  readFile(resolve(root, 'supabase/migrations/20260806225500_privacy_portrait_filter_selection.sql'), 'utf8'),
  readFile(resolve(root, 'supabase/migrations/20260807153500_privacy_portrait_gradient_recalibration.sql'), 'utf8'),
  readFile(resolve(root, 'supabase/tests/database/015_privacy_portrait_filter_selection.test.sql'), 'utf8'),
  readFile(resolve(root, 'supabase/tests/database/016_privacy_portrait_gradient_recalibration.test.sql'), 'utf8'),
  readFile(resolve(root, 'supabase/tests/database/014_profile_image_preparation.test.sql'), 'utf8'),
  readFile(resolve(root, 'scripts/finalize-discovery-deck-artifact.mjs'), 'utf8'),
  readFile(resolve(dist, 'privacy-portrait-controller.js'), 'utf8'),
  readFile(resolve(dist, 'privacy-portrait-loader.js'), 'utf8'),
  readFile(resolve(dist, 'privacy-portrait-filters.css'), 'utf8'),
  readFile(resolve(dist, 'privacy-portrait-filters.js'), 'utf8'),
  readFile(resolve(dist, 'index.html'), 'utf8'),
  readFile(resolve(dist, '_headers'), 'utf8')
]);

for (const [source, label] of [[controller, 'source controller'], [builtController, 'built controller']]) {
  requireMarker(source, "BOUNDARY = 'wp074-privacy-portrait-filters'", `${label} must expose the WP-074 boundary`);
  requireMarker(source, 'version: 2', `${label} must expose the recalibrated contract version`);
  requireMarker(source, 'mandatoryFilterSelection: true', `${label} must require an explicit presentation choice`);
  requireMarker(source, 'publicRawPortraitAllowed: false', `${label} must keep original/raw source publication prohibited`);
  requireMarker(source, 'publicUnfilteredDerivativeAllowed: true', `${label} must distinguish an unfiltered prepared derivative from raw source media`);
  requireMarker(source, 'selectedFilterId = null', `${label} must start without an implicit choice`);
  requireMarker(source, "throw new Error(text('chooseFilter'))", `${label} must fail closed without a choice`);
  requireMarker(source, 'applyPrivacyFilterToCanvas(card, rawCard, filterId)', `${label} must render the selected card presentation`);
  requireMarker(source, 'applyPrivacyFilterToCanvas(avatar, rawAvatar, filterId)', `${label} must render the selected avatar presentation`);
  requireMarker(source, 'p_privacy_filter_id: output.filterId', `${label} must persist the selected presentation`);
  requireMarker(source, 'unfilteredTitle', `${label} must expose the explicit unfiltered copy`);
  requireMarker(source, 'naturalTitle', `${label} must expose the natural copy`);
  requireMarker(source, "softFocusTitle: 'Soft private'", `${label} must name level 3 Soft private in Dutch staging copy`);
  requireMarker(source, "warmVeilTitle: 'Balanced'", `${label} must name level 4 Balanced`);
  requireMarker(source, "globalThis.addEventListener('submit'", `${label} must intercept the legacy submit path`);
  forbid(source, /selectedFilterId\s*=\s*['"](?:unfiltered|natural|softFocus|warmVeil|monoMist|privacyMax)/, `${label} must not preselect a presentation`);
}

for (const [source, label] of [[filterModel, 'source filter model'], [builtFilterModel, 'built filter model']]) {
  for (const id of ['unfiltered', 'natural', 'softFocus', 'warmVeil']) requireMarker(source, `id: '${id}'`, `${label} is missing ${id}`);
  requireMarker(source, "if (!filterId) throw new TypeError('A supported privacy portrait presentation must be selected')", `${label} must reject unsupported values`);
  requireMarker(source, "recipe.id === 'unfiltered'", `${label} must render unfiltered derivatives without blur or pixelation`);
  requireMarker(source, 'blur: 0', `${label} must provide the unfiltered level`);
  requireMarker(source, 'blur: 3', `${label} must provide a very light Natural level`);
  requireMarker(source, 'blur: 9', `${label} must preserve the former Soft treatment as level 3`);
  requireMarker(source, 'blur: 13', `${label} must preserve the former Balanced treatment as level 4`);
  forbid(source, /id:\s*['"](?:monoMist|privacyMax)/, `${label} must remove the former heavy levels from the active UI model`);
  forbid(source, /id:\s*['"](?:raw|none|original)/, `${label} must never model source/raw publication as a presentation choice`);
}

requireMarker(filterTest, "['unfiltered', 'natural', 'softFocus', 'warmVeil']", 'unit tests must lock the four recalibrated presentation IDs');
requireMarker(filterTest, "normalisePrivacyFilterId('unfiltered')", 'unit tests must accept the explicit unfiltered derivative choice');
requireMarker(filterTest, "normalisePrivacyFilterId('monoMist'), null", 'unit tests must remove monoMist from the active model');
requireMarker(filterTest, "normalisePrivacyFilterId('privacyMax'), null", 'unit tests must remove privacyMax from the active model');
requireMarker(filterTest, "normalisePrivacyFilterId('raw')", 'unit tests must continue rejecting raw/source-like values');

for (const [source, label] of [[css, 'source CSS'], [builtCss, 'built CSS']]) {
  requireMarker(source, '.rv-privacy-filter-grid', `${label} must style the choice grid`);
  requireMarker(source, '.rv-privacy-filter-option.selected', `${label} must show selection`);
  requireMarker(source, '.rv-privacy-filter-recommended', `${label} must show the recommendation`);
  requireMarker(source, '@media (max-width: 36rem)', `${label} must support mobile`);
}

requireMarker(migration074, 'add column if not exists privacy_filter_id text', 'WP-074 foundation migration must persist presentation metadata');
requireMarker(migration074, 'from public, anon, authenticated', 'WP-074 foundation must keep the legacy unfiltered registration bypass revoked');
requireMarker(migration074a, "'unfiltered', 'natural', 'softFocus', 'warmVeil'", 'WP-074A migration must define the active four-write allowlist');
requireMarker(migration074a, "'monoMist', 'privacyMax'", 'WP-074A database constraint must remain compatible with historical preparations');
requireMarker(migration074a, "v_filter not in ('unfiltered', 'natural', 'softFocus', 'warmVeil')", 'WP-074A RPC must reject legacy heavy treatments for new writes');
requireMarker(migration074a, "raise exception 'supported privacy presentation required'", 'WP-074A RPC must reject missing or unknown presentations');
requireMarker(migration074a, "'public_derivatives_filtered', v_filter <> 'unfiltered'", 'WP-074A audit must distinguish filtered and unfiltered prepared derivatives');
requireMarker(migration074a, "'unfiltered_derivative_selected', v_filter = 'unfiltered'", 'WP-074A audit must record deliberate unfiltered derivative selection');
requireMarker(migration074a, "'raw_public_portrait_allowed', false", 'WP-074A audit must keep raw/source publication prohibited');
forbid(migration074a, /jsonb_build_object\([\s\S]*?(?:object_path|\.webp)/i, 'WP-074A audit must not expose Storage paths');

requireMarker(databaseTest015, 'cannot bypass filtering through the legacy signature', 'WP-074 database proof must retain legacy bypass denial');
requireMarker(databaseTest015, 'filter audit contains no Storage paths', 'WP-074 database proof must retain audit redaction');
requireMarker(databaseTest016, 'select plan(17);', 'WP-074A database proof must declare all assertions');
requireMarker(databaseTest016, 'former heavy monoMist presentation is rejected for new writes', 'WP-074A database proof must reject monoMist for new writes');
requireMarker(databaseTest016, 'former heavy privacyMax presentation is rejected for new writes', 'WP-074A database proof must reject privacyMax for new writes');
requireMarker(databaseTest016, 'explicit unfiltered derivative presentation is accepted', 'WP-074A database proof must cover deliberate unfiltered derivative registration');
requireMarker(databaseTest016, 'only the prepared card derivative can be selected publicly', 'WP-074A database proof must preserve the source-media privacy boundary');
requireMarker(databaseTest016, 'audit distinguishes an unfiltered prepared derivative from prohibited raw source publication', 'WP-074A database proof must distinguish unfiltered derivative from raw source media');
requireMarker(databaseTest016, 'presentation audit contains no Storage paths', 'WP-074A database proof must cover audit redaction');
requireMarker(profilePreparationTest, "'natural'", 'WP-069B regression must exercise an active recalibrated presentation instead of privacyMax');

for (const [source, label] of [[loader, 'source loader'], [builtLoader, 'built loader']]) {
  requireMarker(source, "document.querySelector('#rv-portrait-form')", `${label} must wait for the signed-in form`);
  requireMarker(source, 'import(MODULE)', `${label} must activate the controller only when ready`);
}
requireMarker(finalizer, '`./privacy-portrait-loader.js?commit=${encodeURIComponent(buildCommit)}`', 'finalizer must add a commit-versioned loader');
requireMarker(builtIndex, './privacy-portrait-loader.js?commit=', 'built index must load the lifecycle-aware loader');
for (const route of ['/privacy-portrait-loader.js', '/privacy-portrait-controller.js', '/privacy-portrait-filters.js', '/privacy-portrait-filters.css']) {
  requireMarker(headers, `${route}\n  Cache-Control: no-cache, max-age=0, must-revalidate`, `headers must revalidate ${route}`);
}

if (failures.length) {
  console.error('WP-074A privacy portrait validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('WP-074A validated: Unfiltered → Natural → Soft private → Balanced, source media remains private, heavy levels are removed from new writes, and delivery stays commit-versioned.');
