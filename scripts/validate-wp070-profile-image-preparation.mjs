import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const dist = resolve(root, 'dist-private-preview');
const failures = [];

function requireMarker(source, marker, message) {
  if (!source.includes(marker)) failures.push(message);
}

function forbidPattern(source, pattern, message) {
  if (pattern.test(source)) failures.push(message);
}

const paths = Object.freeze({
  controller: 'apps/private-preview/profile-image-preparation.js',
  model: 'apps/web/src/profile-image-preparation.js',
  css: 'apps/private-preview/profile-image-preparation.css',
  accountShell: 'apps/private-preview/account-shell.js',
  migration: 'supabase/migrations/20260805084500_profile_image_preparation.sql',
  snapshotMigration: 'supabase/migrations/20260805084600_profile_image_snapshot_redaction.sql',
  databaseTest: 'supabase/tests/database/014_profile_image_preparation.test.sql',
  build: 'scripts/build-private-preview.mjs',
  finalizer: 'scripts/finalize-discovery-deck-artifact.mjs'
});

const [
  controller,
  model,
  css,
  accountShell,
  migration,
  snapshotMigration,
  databaseTest,
  build,
  finalizer,
  generatedController,
  generatedModel,
  generatedCss,
  generatedAccountShell,
  generatedHeaders
] = await Promise.all([
  readFile(resolve(root, paths.controller), 'utf8'),
  readFile(resolve(root, paths.model), 'utf8'),
  readFile(resolve(root, paths.css), 'utf8'),
  readFile(resolve(root, paths.accountShell), 'utf8'),
  readFile(resolve(root, paths.migration), 'utf8'),
  readFile(resolve(root, paths.snapshotMigration), 'utf8'),
  readFile(resolve(root, paths.databaseTest), 'utf8'),
  readFile(resolve(root, paths.build), 'utf8'),
  readFile(resolve(root, paths.finalizer), 'utf8'),
  readFile(resolve(dist, 'profile-image-preparation.js'), 'utf8'),
  readFile(resolve(dist, 'src/profile-image-preparation.js'), 'utf8'),
  readFile(resolve(dist, 'profile-image-preparation.css'), 'utf8'),
  readFile(resolve(dist, 'account-shell.js'), 'utf8'),
  readFile(resolve(dist, '_headers'), 'utf8')
]);

for (const [source, label] of [[controller, 'source controller'], [generatedController, 'generated controller']]) {
  requireMarker(source, "import { supabase } from './app.js';", `${label} must reuse the shared authenticated browser client`);
  requireMarker(source, "from './src/profile-image-preparation.js';", `${label} must use the shared preparation model`);
  requireMarker(source, "event.target?.id !== 'rv-portrait-form'", `${label} must intercept only the normal product portrait form`);
  requireMarker(source, 'event.stopImmediatePropagation();', `${label} must prevent the legacy raw-upload handler from running`);
  requireMarker(source, "createImageBitmap(file, { imageOrientation: 'from-image' })", `${label} must normalize source orientation where supported`);
  requireMarker(source, "canvas.toBlob", `${label} must derive browser-safe encoded assets`);
  requireMarker(source, "'image/webp'", `${label} must create WebP derivatives`);
  requireMarker(source, "supabase.rpc('register_prepared_portrait'", `${label} must register the complete preparation transactionally`);
  requireMarker(source, "supabase.rpc('load_onboarding_snapshot'", `${label} must merge existing onboarding progress`);
  requireMarker(source, "supabase.rpc('save_onboarding_progress'", `${label} must persist portrait completion without erasing prior stages`);
  requireMarker(source, 'rv-image-safe-area', `${label} must provide visible safe-area guidance`);
  requireMarker(source, 'pointermove', `${label} must support user-controlled pan framing`);
  requireMarker(source, 'rv-resilient-portrait-backdrop', `${label} must provide a resilient blurred fallback`);
  requireMarker(source, 'function ensurePreparedImage(container)', `${label} must update prepared previews idempotently`);
  forbidPattern(source, /createClient\s*\(/, `${label} must not create a second Supabase client`);
  forbidPattern(source, /service_role|sb_secret_|SUPABASE_SERVICE_ROLE_KEY|auth\.admin/i, `${label} must not expose privileged browser capabilities`);
  forbidPattern(source, /https?:\/\/(?!esm\.sh)/i, `${label} must not introduce external image or upload services`);
}

for (const [source, label] of [[model, 'source model'], [generatedModel, 'generated model']]) {
  requireMarker(source, "acceptedMimeTypes: Object.freeze(['image/jpeg', 'image/png', 'image/webp'])", `${label} must use a bounded input type allowlist`);
  requireMarker(source, 'maximumSourceBytes: 10 * 1024 * 1024', `${label} must enforce a ten-megabyte source limit`);
  requireMarker(source, 'cardWidth: 960', `${label} must define the canonical card width`);
  requireMarker(source, 'cardHeight: 1200', `${label} must define the canonical card height`);
  requireMarker(source, 'avatarWidth: 384', `${label} must define the canonical avatar width`);
  requireMarker(source, "warnings.push('landscape-source')", `${label} must warn on landscape sources`);
  requireMarker(source, "warnings.push('low-resolution')", `${label} must warn on low-resolution sources`);
  requireMarker(source, 'cropRectForAspect', `${label} must derive crops from focal metadata`);
  requireMarker(source, 'preparedObjectPaths', `${label} must generate account-scoped private paths`);
  requireMarker(source, "source: `${prefix}/source.webp`", `${label} must use a normalized source path`);
  requireMarker(source, "card: `${prefix}/card-4x5.webp`", `${label} must use a canonical card derivative path`);
  requireMarker(source, "avatar: `${prefix}/avatar-square.webp`", `${label} must use a canonical avatar derivative path`);
  requireMarker(source, 'mergeCompletedStages', `${label} must preserve existing onboarding progress`);
}

for (const [source, label] of [[css, 'source CSS'], [generatedCss, 'generated CSS']]) {
  requireMarker(source, '.rv-image-frame-card', `${label} must style the user framing editor`);
  requireMarker(source, 'aspect-ratio: 4 / 5;', `${label} must expose a 4:5 card frame`);
  requireMarker(source, '.rv-image-safe-area', `${label} must show the crop safe area`);
  requireMarker(source, '.rv-resilient-portrait-backdrop', `${label} must include the blurred background fallback`);
  requireMarker(source, 'filter: blur(20px)', `${label} must visually soften unused image space`);
  requireMarker(source, 'object-fit: contain !important;', `${label} must preserve the complete prepared subject rather than clipping it`);
  requireMarker(source, 'touch-action: none;', `${label} must support controlled touch panning`);
  forbidPattern(source, /\.rv-resilient-portrait-image\s*\{[^}]*object-fit:\s*cover/is, `${label} must never force resilient portraits back to cover cropping`);
}

for (const [source, label] of [[accountShell, 'source account shell'], [generatedAccountShell, 'generated account shell']]) {
  const preparationIndex = source.indexOf("import './profile-image-preparation.js';");
  const productIndex = source.indexOf("import './product-shell.js';");
  if (preparationIndex < 0 || productIndex < 0 || preparationIndex > productIndex) {
    failures.push(`${label} must load preparation before the legacy product upload handler`);
  }
}

requireMarker(build, "'profile-image-preparation.js'", 'Cloudflare build must copy the shared preparation model');
requireMarker(finalizer, "'profile-image-preparation.css'", 'artifact finalizer must require the preparation stylesheet');
requireMarker(finalizer, "'/profile-image-preparation.js'", 'artifact finalizer must revalidate the preparation controller');
requireMarker(finalizer, "'/src/profile-image-preparation.js'", 'artifact finalizer must revalidate the shared model');
for (const route of ['/profile-image-preparation.js', '/profile-image-preparation.css', '/src/profile-image-preparation.js']) {
  requireMarker(generatedHeaders, `${route}\n  Cache-Control: no-cache, max-age=0, must-revalidate`, `generated headers must revalidate ${route}`);
}

requireMarker(migration, "add column if not exists preparation_id uuid", 'migration must link derivative records by preparation ID');
requireMarker(migration, "asset_role in ('source', 'card', 'avatar')", 'migration must restrict supported asset roles');
requireMarker(migration, "not is_public_profile_portrait or asset_role = 'card'", 'migration must prevent source/avatar publication');
requireMarker(migration, 'privacy_portraits_one_selected_card', 'migration must enforce one selected card per account');
requireMarker(migration, 'pg_advisory_xact_lock', 'registration must serialize concurrent preparations per account');
requireMarker(migration, "is distinct from (v_prefix || 'source.webp')", 'registration must validate exact account-scoped source path');
requireMarker(migration, "is distinct from (v_prefix || 'card-4x5.webp')", 'registration must validate exact account-scoped card path');
requireMarker(migration, "is distinct from (v_prefix || 'avatar-square.webp')", 'registration must validate exact account-scoped avatar path');
requireMarker(migration, "from storage.objects object", 'registration must require all derivative objects before database registration');
requireMarker(migration, "'prepared-card-4x5-webp'", 'registration must identify the canonical card treatment');
requireMarker(migration, "'prepared-avatar-square-webp'", 'registration must identify the canonical avatar treatment');
requireMarker(migration, "'normalized-source-webp'", 'registration must identify the normalized source treatment');
requireMarker(migration, "'metadata_stripped', true", 'audit evidence must record metadata stripping');
forbidPattern(migration.match(/jsonb_build_object\([\s\S]*?\n\s*\)\n\s*\);/i)?.[0] ?? '', /object_path|\.webp/i, 'audit payload must not include private Storage paths');
requireMarker(snapshotMigration, "- 'source_object_path'", 'onboarding snapshot must redact normalized source path');
requireMarker(snapshotMigration, "- 'object_path'", 'onboarding snapshot must redact selected card path');

requireMarker(databaseTest, 'select plan(37);', 'database proof must have the complete WP-070 plan');
requireMarker(databaseTest, 'another authenticated account cannot read prepared portrait metadata', 'database proof must cover cross-account isolation');
requireMarker(databaseTest, 'retry is idempotent for the same preparation ID', 'database proof must cover idempotency');
requireMarker(databaseTest, 'new preparation atomically supersedes the former selected card', 'database proof must cover replacement semantics');
requireMarker(databaseTest, 'legacy direct portrait inserts receive an isolated preparation ID', 'database proof must retain legacy compatibility');
requireMarker(databaseTest, 'source asset cannot be promoted to selected profile portrait', 'database proof must reject source publication');

if (failures.length) {
  console.error('WP-070 profile image preparation validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('WP-070 profile image preparation validated (user framing, private normalized source, 4:5 and square derivatives, focal metadata, resilient rendering and persistence isolation).');
