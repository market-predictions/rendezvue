import { access, readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const required = [
  'README.md', 'CHANGELOG.md', 'package.json',
  'apps/web/index.html', 'apps/web/app.js', 'apps/web/styles.css', 'apps/web/pilot-v1.css',
  'apps/web/manifest.webmanifest', 'apps/web/service-worker.js',
  'apps/web/src/domain.js', 'apps/web/src/i18n.js', 'apps/web/src/camera.js',
  'apps/web/src/avatar.js', 'apps/web/src/demo-data.js', 'apps/web/assets/icons/icon.svg',
  'apps/web/tests/domain.test.mjs', 'apps/web/tests/i18n.test.mjs', 'apps/web/tests/interaction-model.test.mjs',
  'docs/REQUIREMENTS.md', 'docs/ROADMAP.md', 'docs/ARCHITECTURE.md', 'docs/DATA-MODEL.md',
  'docs/ONBOARDING.md', 'docs/INTERACTION-AND-TRUST-MODEL.md', 'docs/PILOT-PROTOCOL.md',
  'docs/WORKPACKAGES.md', 'docs/WORK-CLAIMS.md', 'docs/HANDOVER.md',
  'docs/UX-PRINCIPLES.md', 'docs/PRIVACY-AND-SAFETY.md', 'docs/INSTITUTION-REGISTRY-NL.md',
  'docs/decisions/ADR-0007-product-baseline-v1.md',
  'scripts/build-static.mjs', 'scripts/build-hf-deploy.mjs', 'scripts/validate-static.mjs',
  'infrastructure/huggingface/README.static.md',
  'dist/index.html', 'dist/app.js', 'dist/pilot-v1.css', 'dist/deployment.json',
  '.hf-deploy/README.md', '.hf-deploy/index.html', '.hf-deploy/app.js', '.hf-deploy/source.json'
];

for (const path of required) await access(resolve(root, path));

const manifest = JSON.parse(await readFile(resolve(root, 'apps/web/manifest.webmanifest'), 'utf8'));
if (manifest.display !== 'standalone' || manifest.lang !== 'nl') throw new Error('Manifest must be standalone and Dutch-default.');
const iconMetadata = await stat(resolve(root, 'apps/web/assets/icons/icon.svg'));
if (iconMetadata.size < 300) throw new Error('PWA icon appears invalid.');

const html = await readFile(resolve(root, 'apps/web/index.html'), 'utf8');
for (const marker of ['lang="nl"', 'static-pilot-v1', 'pilot-v1.css', 'manifest.webmanifest', 'app.js']) {
  if (!html.includes(marker)) throw new Error(`index.html is missing ${marker}.`);
}

const domain = await readFile(resolve(root, 'apps/web/src/domain.js'), 'utf8');
for (const marker of ['LIFE_STAGES', 'CURRENT_RELATIONSHIP_STATES', 'MARITAL_HISTORIES', 'CHILD_WISHES', 'FEEDBACK_POSITIVE_TAGS', 'studentVerified: false']) {
  if (!domain.includes(marker)) throw new Error(`Domain model is missing ${marker}.`);
}

const app = await readFile(resolve(root, 'apps/web/app.js'), 'utf8');
for (const marker of ['data-do="direct-like"', 'bindSwipe', 'contactEntitlements', "type: 'feedback'", 'localStorage.setItem', 'generateAvatarVariants']) {
  if (!app.includes(marker)) throw new Error(`Application is missing ${marker}.`);
}
if (app.includes('publicRating') || app.includes('starRating')) throw new Error('Public user ratings are prohibited.');

const i18n = await readFile(resolve(root, 'apps/web/src/i18n.js'), 'utf8');
for (const marker of ['Student-first', 'Nooit getrouwd', 'Gescheiden', 'Heeft kinderen', 'Open gesprek', 'Private feedback', 'Never married', 'Divorced']) {
  if (!i18n.includes(marker)) throw new Error(`Localization is missing ${marker}.`);
}

const portrait = await readFile(resolve(root, 'apps/web/src/avatar.js'), 'utf8');
for (const marker of ['AVATAR_FILTERS', 'softFocus', 'warmVeil', 'monoMist', 'privacyMax', 'downsampleBlur', 'generateAvatarVariants']) {
  if (!portrait.includes(marker)) throw new Error(`Privacy portrait renderer is missing ${marker}.`);
}

const deployment = JSON.parse(await readFile(resolve(root, 'dist/deployment.json'), 'utf8'));
if (deployment.version !== '0.3.0-alpha.1') throw new Error('Unexpected deployment version.');
if (deployment.audience !== 'adult-muslim-community-student-first') throw new Error('Deployment audience is stale.');
if (deployment.portraitMode !== 'browser-local-privacy-filter-grid') throw new Error('Deployment portrait mode is stale.');

const builtApp = await readFile(resolve(root, 'dist/app.js'), 'utf8');
for (const marker of ['direct-like', 'bindSwipe', 'contactEntitlements', 'submit-feedback']) {
  if (!builtApp.includes(marker)) throw new Error(`Built app is missing ${marker}.`);
}
const deployHtml = await readFile(resolve(root, '.hf-deploy/index.html'), 'utf8');
if (!deployHtml.includes('static-pilot-v1')) throw new Error('Hugging Face artifact is missing the v1 marker.');

const requirements = await readFile(resolve(root, 'docs/REQUIREMENTS.md'), 'utf8');
for (const marker of ['student-first, not student-only', 'marital history', 'Contact opening', 'Public star ratings', 'Concept-pilot acceptance criteria']) {
  if (!requirements.includes(marker)) throw new Error(`Requirements are missing ${marker}.`);
}

const architecture = await readFile(resolve(root, 'docs/ARCHITECTURE.md'), 'utf8');
for (const marker of ['AttractionSignal', 'ContactEntitlement', 'Hugging Face', 'PostgreSQL']) {
  if (!architecture.includes(marker)) throw new Error(`Architecture is missing ${marker}.`);
}

const deployReadme = await readFile(resolve(root, '.hf-deploy/README.md'), 'utf8');
for (const marker of ['sdk: static', 'app_file: index.html', 'student-first', 'GitHub is the sole source of truth']) {
  if (!deployReadme.includes(marker)) throw new Error(`Hugging Face metadata is missing ${marker}.`);
}
if (deployReadme.includes('app_build_command:')) throw new Error('Prebuilt deployment must not request a remote build.');

console.log(`Static validation passed (${required.length} required artifacts).`);
