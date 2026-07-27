import { access, readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const required = [
  'README.md', 'CHANGELOG.md', 'SECURITY.md', 'Dockerfile',
  'apps/web/index.html', 'apps/web/app.js', 'apps/web/styles.css',
  'apps/web/manifest.webmanifest', 'apps/web/service-worker.js',
  'apps/web/assets/icons/icon.svg', 'docs/REQUIREMENTS.md',
  'docs/ROADMAP.md', 'docs/WORKPACKAGES.md', 'docs/WORK-CLAIMS.md',
  'docs/HANDOVER.md', 'docs/HUGGINGFACE-PILOT.md',
  'scripts/huggingface_space.py', '.github/workflows/deploy-huggingface.yml'
];

for (const path of required) await access(resolve(root, path));

const manifest = JSON.parse(await readFile(resolve(root, 'apps/web/manifest.webmanifest'), 'utf8'));
if (manifest.display !== 'standalone') throw new Error('PWA manifest must use standalone display.');
if (!Array.isArray(manifest.icons) || manifest.icons.length < 1) throw new Error('PWA manifest requires an icon.');
const iconMetadata = await stat(resolve(root, 'apps/web/assets/icons/icon.svg'));
if (iconMetadata.size < 500) throw new Error('PWA icon appears invalid or empty.');

const html = await readFile(resolve(root, 'apps/web/index.html'), 'utf8');
for (const marker of ['manifest.webmanifest', 'styles.css', 'app.js', 'viewport']) {
  if (!html.includes(marker)) throw new Error(`index.html is missing ${marker}.`);
}

const requirements = await readFile(resolve(root, 'docs/REQUIREMENTS.md'), 'utf8');
for (const marker of ['GitHub shall be the sole authoritative source', 'Hugging Face', 'Prototype acceptance criteria']) {
  if (!requirements.includes(marker)) throw new Error(`Requirements are missing governance marker: ${marker}`);
}

const deploymentGuide = await readFile(resolve(root, 'docs/HUGGINGFACE-PILOT.md'), 'utf8');
for (const marker of ['HF_TOKEN', 'HF_SPACE_ID', '/healthz', 'one-way']) {
  if (!deploymentGuide.includes(marker)) throw new Error(`Hugging Face guide is missing marker: ${marker}`);
}

console.log(`Static validation passed (${required.length} required artifacts).`);
