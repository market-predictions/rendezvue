import { access, readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const required = [
  'README.md', 'CHANGELOG.md', 'SECURITY.md', 'Dockerfile',
  'apps/web/index.html', 'apps/web/app.js', 'apps/web/styles.css',
  'apps/web/manifest.webmanifest', 'apps/web/service-worker.js',
  'apps/web/src/domain.js', 'apps/web/src/i18n.js', 'apps/web/src/avatar.js',
  'apps/web/assets/icons/icon.svg', 'apps/web/tests/domain.test.mjs', 'apps/web/tests/i18n.test.mjs',
  'docs/REQUIREMENTS.md', 'docs/ROADMAP.md', 'docs/WORKPACKAGES.md', 'docs/WORK-CLAIMS.md',
  'docs/HANDOVER.md', 'docs/HUGGINGFACE-PILOT.md', 'docs/PRIVACY-AND-SAFETY.md',
  'docs/UX-PRINCIPLES.md', 'docs/INSTITUTION-REGISTRY-NL.md', 'docs/FAITH-PROFILE-MODEL.md',
  'docs/decisions/ADR-0005-netherlands-muslim-student-pivot.md',
  'scripts/build-static.mjs', 'scripts/build-hf-deploy.mjs',
  'scripts/huggingface_space.py', '.github/workflows/deploy-huggingface.yml',
  'infrastructure/huggingface/README.static.md',
  'dist/index.html', 'dist/manifest.webmanifest', 'dist/deployment.json',
  '.hf-deploy/README.md', '.hf-deploy/index.html',
  '.hf-deploy/manifest.webmanifest', '.hf-deploy/source.json'
];

for (const path of required) await access(resolve(root, path));

const manifest = JSON.parse(await readFile(resolve(root, 'apps/web/manifest.webmanifest'), 'utf8'));
if (manifest.display !== 'standalone') throw new Error('PWA manifest must use standalone display.');
if (manifest.lang !== 'nl') throw new Error('Dutch must be the default PWA language.');
if (!Array.isArray(manifest.icons) || manifest.icons.length < 1) throw new Error('PWA manifest requires an icon.');
const iconMetadata = await stat(resolve(root, 'apps/web/assets/icons/icon.svg'));
if (iconMetadata.size < 500) throw new Error('PWA icon appears invalid or empty.');

const html = await readFile(resolve(root, 'apps/web/index.html'), 'utf8');
for (const marker of ['lang="nl"', 'manifest.webmanifest', 'styles.css', 'app.js', 'viewport', 'rendezvue-deployment']) {
  if (!html.includes(marker)) throw new Error(`index.html is missing ${marker}.`);
}

const domain = await readFile(resolve(root, 'apps/web/src/domain.js'), 'utf8');
for (const marker of ["type: 'mbo'", "type: 'hbo'", "type: 'wo'", 'FAITH_PRACTICES', 'LIFESTYLE_TAGS', 'showFaithPractice: false']) {
  if (!domain.includes(marker)) throw new Error(`Dutch domain model is missing ${marker}.`);
}

const i18n = await readFile(resolve(root, 'apps/web/src/i18n.js'), 'utf8');
for (const marker of ['nl:', 'en:', 'MBO · HBO · WO', 'Geloof & leefstijl', 'Faith & lifestyle']) {
  if (!i18n.includes(marker)) throw new Error(`Localization model is missing ${marker}.`);
}

const avatar = await readFile(resolve(root, 'apps/web/src/avatar.js'), 'utf8');
for (const marker of ['buildEdgeLayer', 'addRomanticLighting', 'addIllustratedFrame']) {
  if (!avatar.includes(marker)) throw new Error(`Illustrated avatar renderer is missing ${marker}.`);
}
if (avatar.includes('quantize(')) throw new Error('Coarse pixel quantization must not return in the Netherlands milestone.');

const builtHtml = await readFile(resolve(root, 'dist/index.html'), 'utf8');
if (!builtHtml.includes('rendezvue-deployment')) throw new Error('Static build is missing the deployment marker.');
const deployHtml = await readFile(resolve(root, '.hf-deploy/index.html'), 'utf8');
if (!deployHtml.includes('rendezvue-deployment')) throw new Error('Hugging Face artifact is missing the deployment marker.');

const deployment = JSON.parse(await readFile(resolve(root, 'dist/deployment.json'), 'utf8'));
if (deployment.market !== 'netherlands') throw new Error('Deployment metadata must identify the Netherlands market.');
if (!deployment.education?.includes('mbo') || !deployment.languages?.includes('nl')) throw new Error('Deployment metadata is missing education or language scope.');

const deployReadme = await readFile(resolve(root, '.hf-deploy/README.md'), 'utf8');
for (const marker of ['sdk: static', 'app_file: index.html', 'GitHub is the sole source of truth', 'MBO', 'HBO', 'WO']) {
  if (!deployReadme.includes(marker)) throw new Error(`Hugging Face deployment metadata is missing: ${marker}`);
}
if (deployReadme.includes('app_build_command:')) throw new Error('Prebuilt deployment must not request a Hugging Face build command.');

const requirements = await readFile(resolve(root, 'docs/REQUIREMENTS.md'), 'utf8');
for (const marker of ['GitHub shall be the sole authoritative source', 'Netherlands', 'MBO', 'HBO', 'WO', 'Dutch', 'English', 'religious beliefs', 'Prototype acceptance criteria']) {
  if (!requirements.includes(marker)) throw new Error(`Requirements are missing marker: ${marker}`);
}

const institutionPlan = await readFile(resolve(root, 'docs/INSTITUTION-REGISTRY-NL.md'), 'utf8');
for (const marker of ['DUO/RIO', 'student mailbox domains', 'pilot fixtures']) {
  if (!institutionPlan.includes(marker)) throw new Error(`Institution plan is missing ${marker}.`);
}

const faithModel = await readFile(resolve(root, 'docs/FAITH-PROFILE-MODEL.md'), 'utf8');
for (const marker of ['never a numeric religiosity score', 'Article 9', 'private']) {
  if (!faithModel.includes(marker)) throw new Error(`Faith profile model is missing ${marker}.`);
}

const deploymentGuide = await readFile(resolve(root, 'docs/HUGGINGFACE-PILOT.md'), 'utf8');
for (const marker of ['HF_TOKEN', 'HF_SPACE_ID', 'Static Space', 'one-way']) {
  if (!deploymentGuide.includes(marker)) throw new Error(`Hugging Face guide is missing marker: ${marker}`);
}

console.log(`Static validation passed (${required.length} required artifacts).`);
