import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const dist = resolve(root, 'dist-private-preview');
const failures = [];
const requireMarker = (source, marker, message) => { if (!source.includes(marker)) failures.push(message); };
const forbid = (source, pattern, message) => { if (pattern.test(source)) failures.push(message); };

const [controller, loader, ladderUi, discoverySelected, css, filterModel, filterTest, surfaceTest,
  migration074a, migration074b, migrationDiscovery, databaseTest016, databaseTest017, databaseTest018,
  profilePreparationTest, finalizer, builtController, builtLoader, builtLadderUi, builtDiscoverySelected,
  builtCss, builtFilterModel, builtIndex, headers] = await Promise.all([
  readFile(resolve(root, 'apps/private-preview/privacy-portrait-controller.js'), 'utf8'),
  readFile(resolve(root, 'apps/private-preview/privacy-portrait-loader.js'), 'utf8'),
  readFile(resolve(root, 'apps/private-preview/privacy-portrait-ladder-ui.js'), 'utf8'),
  readFile(resolve(root, 'apps/private-preview/discovery-selected-portrait.js'), 'utf8'),
  readFile(resolve(root, 'apps/private-preview/privacy-portrait-filters.css'), 'utf8'),
  readFile(resolve(root, 'apps/private-preview/privacy-portrait-filters.js'), 'utf8'),
  readFile(resolve(root, 'apps/web/tests/privacy-portrait-filters.test.mjs'), 'utf8'),
  readFile(resolve(root, 'apps/web/tests/privacy-portrait-surface-binding.test.mjs'), 'utf8'),
  readFile(resolve(root, 'supabase/migrations/20260807153500_privacy_portrait_gradient_recalibration.sql'), 'utf8'),
  readFile(resolve(root, 'supabase/migrations/20260807193000_privacy_portrait_ladder_remap.sql'), 'utf8'),
  readFile(resolve(root, 'supabase/migrations/20260807193500_discovery_selected_portrait_delivery.sql'), 'utf8'),
  readFile(resolve(root, 'supabase/tests/database/016_privacy_portrait_gradient_recalibration.test.sql'), 'utf8'),
  readFile(resolve(root, 'supabase/tests/database/017_privacy_portrait_ladder_remap.test.sql'), 'utf8'),
  readFile(resolve(root, 'supabase/tests/database/018_discovery_selected_portrait_delivery.test.sql'), 'utf8'),
  readFile(resolve(root, 'supabase/tests/database/014_profile_image_preparation.test.sql'), 'utf8'),
  readFile(resolve(root, 'scripts/finalize-discovery-deck-artifact.mjs'), 'utf8'),
  readFile(resolve(dist, 'privacy-portrait-controller.js'), 'utf8'),
  readFile(resolve(dist, 'privacy-portrait-loader.js'), 'utf8'),
  readFile(resolve(dist, 'privacy-portrait-ladder-ui.js'), 'utf8'),
  readFile(resolve(dist, 'discovery-selected-portrait.js'), 'utf8'),
  readFile(resolve(dist, 'privacy-portrait-filters.css'), 'utf8'),
  readFile(resolve(dist, 'privacy-portrait-filters.js'), 'utf8'),
  readFile(resolve(dist, 'index.html'), 'utf8'),
  readFile(resolve(dist, '_headers'), 'utf8')
]);

for (const [source, label] of [[controller, 'source controller'], [builtController, 'built controller']]) {
  requireMarker(source, "BOUNDARY = 'wp074-privacy-portrait-filters'", `${label} must retain the privacy portrait boundary`);
  requireMarker(source, 'mandatoryFilterSelection: true', `${label} must require an explicit choice`);
  requireMarker(source, 'publicRawPortraitAllowed: false', `${label} must keep source publication prohibited`);
  requireMarker(source, 'selectedFilterId = null', `${label} must start without a default selection`);
  requireMarker(source, 'applyPrivacyFilterToCanvas(card, rawCard, filterId)', `${label} must bake the selected card treatment`);
  requireMarker(source, 'applyPrivacyFilterToCanvas(avatar, rawAvatar, filterId)', `${label} must bake the selected avatar treatment`);
  requireMarker(source, 'p_privacy_filter_id: output.filterId', `${label} must persist the same selected treatment`);
  forbid(source, /selectedFilterId\s*=\s*['"](?:unfiltered|natural|softFocus|warmVeil|morePrivate|monoMist|privacyMax)/, `${label} must not preselect a treatment`);
}

for (const [source, label] of [[loader, 'source loader'], [builtLoader, 'built loader']]) {
  requireMarker(source, "const LADDER_UI = './privacy-portrait-ladder-ui.js'", `${label} must load WP-074B customer copy`);
  requireMarker(source, 'await import(MODULE)', `${label} must load the controller first`);
  requireMarker(source, 'await import(LADDER_UI)', `${label} must load ladder copy after controller`);
}

for (const [source, label] of [[ladderUi, 'source ladder UI'], [builtLadderUi, 'built ladder UI']]) {
  requireMarker(source, "activeIds: Object.freeze(['unfiltered', 'softFocus', 'warmVeil', 'morePrivate'])", `${label} must lock four active IDs in order`);
  requireMarker(source, "recommendedId: 'softFocus'", `${label} must place Recommended on customer-facing Natural`);
  requireMarker(source, 'defaultSelection: null', `${label} must declare no default`);
  requireMarker(source, "title: 'Zacht privé'", `${label} must expose Dutch Soft private`);
  requireMarker(source, "title: 'Soft private'", `${label} must expose English Soft private`);
  requireMarker(source, "title: 'Meer privé'", `${label} must expose Dutch More private`);
  requireMarker(source, "title: 'More private'", `${label} must expose English More private`);
  requireMarker(source, "softFocus: Object.freeze({\n      title: 'Natural'", `${label} must map former Soft recipe to Natural`);
}

for (const [source, label] of [[filterModel, 'source filter model'], [builtFilterModel, 'built filter model']]) {
  for (const id of ['unfiltered', 'softFocus', 'warmVeil', 'morePrivate']) requireMarker(source, `id: '${id}'`, `${label} is missing ${id}`);
  for (const blur of [0, 9, 13, 15]) requireMarker(source, `blur: ${blur}`, `${label} is missing blur ${blur}`);
  requireMarker(source, "recipe.id === 'unfiltered'", `${label} must preserve unfiltered prepared derivative rendering`);
  forbid(source, /id:\s*['"](?:natural|monoMist|privacyMax|raw|none|original)/, `${label} must exclude retired/raw active IDs`);
}

requireMarker(filterTest, "['unfiltered', 'softFocus', 'warmVeil', 'morePrivate']", 'unit tests must lock active IDs');
requireMarker(filterTest, 'morePrivate.blur < 17', 'unit tests must bound More private below legacy monoMist');
requireMarker(surfaceTest, "applyPrivacyFilterToCanvas\\(card, rawCard, filterId\\)", 'surface regression must bind card to selected filter');
requireMarker(surfaceTest, "rpc\\('get_discovery_portrait_path'", 'surface regression must cover selected discovery portrait');
requireMarker(surfaceTest, "rpc\\('get_matched_portrait_path'", 'surface regression must cover selected match/chat portrait');

requireMarker(migration074a, "'unfiltered', 'natural', 'softFocus', 'warmVeil'", 'WP-074A history must remain intact');
requireMarker(migration074b, "'unfiltered', 'natural', 'softFocus', 'warmVeil', 'morePrivate'", 'WP-074B constraint must add More private while retaining history');
requireMarker(migration074b, "v_filter not in ('unfiltered', 'softFocus', 'warmVeil', 'morePrivate')", 'WP-074B new-write allowlist must match active client IDs');
requireMarker(migration074b, "'raw_public_portrait_allowed', false", 'WP-074B audit must prohibit raw publication');
forbid(migration074b, /jsonb_build_object\([\s\S]*?(?:object_path|\.webp)/i, 'WP-074B audit must not expose Storage paths');

for (const [source, label] of [[discoverySelected, 'source discovery binding'], [builtDiscoverySelected, 'built discovery binding']]) {
  requireMarker(source, "rpc('get_discovery_portrait_path'", `${label} must request the selected discovery card path`);
  requireMarker(source, "createSignedUrl(objectPath, 300)", `${label} must create a short-lived signed card URL`);
  requireMarker(source, "portraitSource = 'selected-prepared-card'", `${label} must identify selected prepared-card replacement`);
}
requireMarker(migrationDiscovery, 'pp.asset_role = \'card\'', 'discovery storage authorization must be card-only');
requireMarker(migrationDiscovery, 'pp.is_public_profile_portrait', 'discovery must expose only selected card rows');
requireMarker(migrationDiscovery, "p.publication_status = 'published'", 'discovery must require a published profile');
requireMarker(migrationDiscovery, 'pp.user_id <> v_actor', 'discovery must not expose own storage through the cross-account helper');
requireMarker(migrationDiscovery, 'portrait_objects_read_discovery', 'private bucket must use a dedicated discovery read policy');
forbid(migrationDiscovery, /asset_role\s*=\s*'source'/, 'discovery authorization must never allow source assets');

requireMarker(databaseTest016, 'explicit unfiltered derivative presentation is accepted', 'prior source privacy proof must remain');
requireMarker(databaseTest017, 'former active natural identifier is historical-only for new registrations', 'pgTAP must retire old Natural from new writes');
requireMarker(databaseTest017, 'exact selected presentation ID is persisted on all derivatives', 'pgTAP must bind derivatives to exact selected ID');
requireMarker(databaseTest018, 'discovery resolves exactly the selected public prepared card', 'pgTAP must prove exact selected discovery card');
requireMarker(databaseTest018, 'normalized source is never readable through discovery', 'pgTAP must deny source access');
requireMarker(databaseTest018, 'block revokes discovery storage access to the selected card', 'pgTAP must prove block revocation');
requireMarker(profilePreparationTest, "asset_role = 'card'", 'profile preparation must keep card as public role');

for (const [source, label] of [[css, 'source CSS'], [builtCss, 'built CSS']]) {
  requireMarker(source, '.rv-privacy-filter-grid', `${label} must style option grid`);
  requireMarker(source, '.rv-privacy-filter-option.selected', `${label} must expose selection state`);
  requireMarker(source, '.rv-privacy-filter-recommended', `${label} must expose Recommended`);
}

for (const file of ['privacy-portrait-ladder-ui.js', 'discovery-selected-portrait.js']) {
  requireMarker(finalizer, `'${file}'`, `artifact finalizer must include ${file}`);
}
requireMarker(builtIndex, './discovery-selected-portrait.js?commit=', 'built index must load commit-versioned selected discovery portraits');
requireMarker(builtIndex, './privacy-portrait-loader.js?commit=', 'built index must keep commit-versioned privacy loading');
for (const route of ['/discovery-selected-portrait.js', '/privacy-portrait-loader.js', '/privacy-portrait-controller.js', '/privacy-portrait-ladder-ui.js', '/privacy-portrait-filters.js', '/privacy-portrait-filters.css']) {
  requireMarker(headers, `${route}\n  Cache-Control: no-cache, max-age=0, must-revalidate`, `headers must revalidate ${route}`);
}

if (failures.length) {
  console.error('WP-074B privacy portrait validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('WP-074B validated: Unfiltered → Natural(former Soft) → Soft private(former Balanced) → More private; source remains private and selected prepared portraits bind across preview/discovery/match surfaces.');
