import { cp, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const dist = resolve(root, 'dist-private-preview');
const indexPath = resolve(dist, 'index.html');
const headersPath = resolve(dist, '_headers');
const deploymentPath = resolve(dist, 'deployment.json');

const [indexSource, headersSource, deploymentSource] = await Promise.all([
  readFile(indexPath, 'utf8'),
  readFile(headersPath, 'utf8'),
  readFile(deploymentPath, 'utf8')
]);
const deployment = JSON.parse(deploymentSource);
const buildCommit = String(deployment.buildCommit ?? '').trim();
if (!/^[a-f0-9]{7,40}$|^local$/.test(buildCommit)) throw new Error('Integrated UX finalization requires a valid build commit marker');
if (deployment.realUserAdmissionAuthorized !== false) throw new Error('Integrated synthetic UX artifact may not authorize real-user admission');

const requiredFiles = [
  'selfie-composer.js',
  'selfie-composer.css',
  'mobile-touch.js',
  'mobile-touch.css',
  'synthetic-profile-media.js',
  'synthetic-profile-media-controller.js',
  'synthetic-profile-media.css'
];
for (const file of requiredFiles) {
  const info = await stat(resolve(dist, file));
  if (!info.isFile() || info.size < 150) throw new Error(`Integrated UX artifact is missing or unexpectedly small: ${file}`);
}

const entries = [
  `./selfie-composer.js?commit=${encodeURIComponent(buildCommit)}`,
  `./mobile-touch.js?commit=${encodeURIComponent(buildCommit)}`,
  `./synthetic-profile-media-controller.js?commit=${encodeURIComponent(buildCommit)}`
];
const stalePattern = /\s*<script\s+type="module"\s+src="\.\/(?:selfie-composer|mobile-touch|synthetic-profile-media-controller)\.js(?:\?[^\"]*)?"\s*><\/script>\s*/g;
let generatedIndex = indexSource.replace(stalePattern, '\n');
generatedIndex = generatedIndex.replace('</body>', `${entries.map((src) => `  <script type="module" src="${src}"></script>`).join('\n')}\n</body>`);
for (const entry of entries) if (!generatedIndex.includes(entry)) throw new Error(`Integrated UX module was not added: ${entry}`);

const cacheControl = 'Cache-Control: no-cache, max-age=0, must-revalidate';
let generatedHeaders = headersSource;
for (const route of requiredFiles.map((file) => `/${file}`)) {
  const contract = `${route}\n  ${cacheControl}`;
  if (!generatedHeaders.includes(contract)) generatedHeaders = `${generatedHeaders.trimEnd()}\n\n${contract}\n`;
}

const branch = String(deployment.cloudflareBranch ?? '').trim();
const branchPreview = Boolean(branch && branch !== 'main');
if (branchPreview) {
  const visualTarget = resolve(dist, 'visual-acceptance');
  await mkdir(visualTarget, { recursive: true });
  await cp(
    resolve(root, 'scripts/fixtures/wp077-wp079-integrated-acceptance.html'),
    resolve(visualTarget, 'integrated-ux.html')
  );
  const visualRoute = `/visual-acceptance/integrated-ux.html\n  ${cacheControl}`;
  if (!generatedHeaders.includes(visualRoute)) generatedHeaders = `${generatedHeaders.trimEnd()}\n\n${visualRoute}\n`;
  console.log('Branch-only WP-077/WP-078/WP-079 integrated visual acceptance route assembled.');
}

await Promise.all([
  writeFile(indexPath, generatedIndex, 'utf8'),
  writeFile(headersPath, generatedHeaders, 'utf8')
]);

console.log(`Integrated UX artifact finalized with commit token ${buildCommit}.`);
