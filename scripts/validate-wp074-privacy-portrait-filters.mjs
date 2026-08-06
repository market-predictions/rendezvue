import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const dist = resolve(root, 'dist-private-preview');
const failures = [];
const requireMarker = (source, marker, message) => { if (!source.includes(marker)) failures.push(message); };
const forbid = (source, pattern, message) => { if (pattern.test(source)) failures.push(message); };

const [controller, css, filterModel, filterTest, migration, databaseTest, finalizer,
  builtController, builtCss, builtFilterModel, builtIndex, headers] = await Promise.all([
  readFile(resolve(root, 'apps/private-preview/privacy-portrait-controller.js'), 'utf8'),
  readFile(resolve(root, 'apps/private-preview/privacy-portrait-filters.css'), 'utf8'),
  readFile(resolve(root, 'apps/private-preview/privacy-portrait-filters.js'), 'utf8'),
  readFile(resolve(root, 'apps/web/tests/privacy-portrait-filters.test.mjs'), 'utf8'),
  readFile(resolve(root, 'supabase/migrations/20260806225500_privacy_portrait_filter_selection.sql'), 'utf8'),
  readFile(resolve(root, 'supabase/tests/database/015_privacy_portrait_filter_selection.test.sql'), 'utf8'),
  readFile(resolve(root, 'scripts/finalize-discovery-deck-artifact.mjs'), 'utf8'),
  readFile(resolve(dist, 'privacy-portrait-controller.js'), 'utf8'),
  readFile(resolve(dist, 'privacy-portrait-filters.css'), 'utf8'),
  readFile(resolve(dist, 'privacy-portrait-filters.js'), 'utf8'),
  readFile(resolve(dist, 'index.html'), 'utf8'),
  readFile(resolve(dist, '_headers'), 'utf8')
]);

for (const [source, label] of [[controller, 'source controller'], [builtController, 'built controller']]) {
  requireMarker(source, "BOUNDARY = 'wp074-privacy-portrait-filters'", `${label} must expose WP-074`);
  requireMarker(source, 'mandatoryFilterSelection: true', `${label} must declare mandatory selection`);
  requireMarker(source, 'publicRawPortraitAllowed: false', `${label} must prohibit raw public portraits`);
  requireMarker(source, 'selectedFilterId = null', `${label} must start without an implicit choice`);
  requireMarker(source, "throw new Error(text('chooseFilter'))", `${label} must fail closed without a choice`);
  requireMarker(source, 'applyPrivacyFilterToCanvas(card, rawCard, filterId)', `${label} must bake the card filter`);
  requireMarker(source, 'applyPrivacyFilterToCanvas(avatar, rawAvatar, filterId)', `${label} must bake the avatar filter`);
  requireMarker(source, 'p_privacy_filter_id: output.filterId', `${label} must persist the selected filter`);
  requireMarker(source, "globalThis.addEventListener('submit'", `${label} must intercept before the legacy unfiltered submit path`);
  forbid(source, /selectedFilterId\s*=\s*['"](?:softFocus|warmVeil|monoMist|privacyMax)/, `${label} must not preselect a filter`);
}

for (const [source, label] of [[filterModel, 'source filter model'], [builtFilterModel, 'built filter model']]) {
  for (const id of ['softFocus', 'warmVeil', 'monoMist', 'privacyMax']) requireMarker(source, `id: '${id}'`, `${label} is missing ${id}`);
  requireMarker(source, "if (!filterId) throw new TypeError('A supported privacy portrait filter must be selected')", `${label} must reject unsupported values`);
  requireMarker(source, 'blur: 24', `${label} must retain the strongest recipe`);
  forbid(source, /id:\s*['"](?:raw|none|original)/, `${label} must not offer an unfiltered option`);
}

requireMarker(filterTest, "['softFocus', 'warmVeil', 'monoMist', 'privacyMax']", 'unit tests must lock the four filter IDs');
requireMarker(filterTest, "normalisePrivacyFilterId('raw')", 'unit tests must reject raw-like values');
for (const [source, label] of [[css, 'source CSS'], [builtCss, 'built CSS']]) {
  requireMarker(source, '.rv-privacy-filter-grid', `${label} must style the choice grid`);
  requireMarker(source, '.rv-privacy-filter-option.selected', `${label} must show selection`);
  requireMarker(source, '.rv-privacy-filter-recommended', `${label} must show the recommendation`);
  requireMarker(source, '@media (max-width: 36rem)', `${label} must support mobile`);
}

requireMarker(migration, 'add column if not exists privacy_filter_id text', 'migration must persist filter metadata');
requireMarker(migration, "privacy_filter_id in ('softFocus', 'warmVeil', 'monoMist', 'privacyMax')", 'migration must constrain filter IDs');
requireMarker(migration, "treatment = 'prepared-card-4x5-webp'", 'migration must fail-close prior unfiltered participant cards');
requireMarker(migration, 'from public, anon, authenticated', 'migration must revoke the legacy authenticated bypass');
requireMarker(migration, "raise exception 'supported privacy filter required'", 'new RPC must reject missing or unknown filters');
requireMarker(migration, "'raw_public_portrait_allowed', false", 'audit must record raw-public prohibition');
forbid(migration, /jsonb_build_object\([\s\S]*?(?:object_path|\.webp)/i, 'filter audit must not expose Storage paths');

requireMarker(databaseTest, 'select plan(16);', 'database proof must declare all assertions');
requireMarker(databaseTest, 'cannot bypass filtering through the legacy signature', 'database proof must cover legacy bypass denial');
requireMarker(databaseTest, 'database rejects raw-like filter values', 'database proof must cover fail-closed validation');
requireMarker(databaseTest, 'selected filter is persisted on all preparation assets', 'database proof must cover persistence');
requireMarker(databaseTest, 'snapshot exposes only the non-sensitive filter ID', 'database proof must cover refresh metadata');
requireMarker(databaseTest, 'filter audit contains no Storage paths', 'database proof must cover audit redaction');

requireMarker(finalizer, '`./privacy-portrait-controller.js?commit=${encodeURIComponent(buildCommit)}`', 'finalizer must add a commit-versioned controller');
requireMarker(builtIndex, './privacy-portrait-controller.js?commit=', 'built index must load the controller');
for (const route of ['/privacy-portrait-controller.js', '/privacy-portrait-filters.js', '/privacy-portrait-filters.css']) {
  requireMarker(headers, `${route}\n  Cache-Control: no-cache, max-age=0, must-revalidate`, `headers must revalidate ${route}`);
}

if (failures.length) {
  console.error('WP-074 privacy portrait validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('WP-074 validated: explicit four-choice filter UI, no raw option, filtered card/avatar upload, constrained metadata, legacy bypass denial and commit-versioned delivery.');
