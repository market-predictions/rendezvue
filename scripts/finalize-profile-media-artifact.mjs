import { readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const dist = resolve(root, 'dist-private-preview');
const indexPath = resolve(dist, 'index.html');
const headersPath = resolve(dist, '_headers');
const deploymentPath = resolve(dist, 'deployment.json');

const [indexSource, headersSource, deploymentSource] = await Promise.all([
  readFile(indexPath, 'utf8'), readFile(headersPath, 'utf8'), readFile(deploymentPath, 'utf8')
]);
const deployment = JSON.parse(deploymentSource);
const buildCommit = String(deployment.buildCommit ?? '').trim();
if (!/^[a-f0-9]{7,40}$|^local$/.test(buildCommit)) throw new Error('WP076 finalization requires a valid build commit marker');

for (const file of [
  'profile-media-model.js', 'profile-media-controller.js', 'profile-media-gallery.js', 'profile-media.css', 'src/camera.js'
]) {
  const info = await stat(resolve(dist, file));
  if (!info.isFile() || info.size < 100) throw new Error(`WP076 artifact is missing or unexpectedly small: ${file}`);
}

const entries = [
  `./profile-media-controller.js?commit=${encodeURIComponent(buildCommit)}`,
  `./profile-media-gallery.js?commit=${encodeURIComponent(buildCommit)}`
];
const oldPattern = /\s*<script\s+type="module"\s+src="\.\/(?:profile-media-controller|profile-media-gallery)\.js(?:\?[^\"]*)?"\s*><\/script>\s*/g;
let generatedIndex = indexSource.replace(oldPattern, '\n');
generatedIndex = generatedIndex.replace('</body>', `${entries.map((src) => `  <script type="module" src="${src}"></script>`).join('\n')}\n</body>`);
for (const entry of entries) if (!generatedIndex.includes(entry)) throw new Error(`WP076 module was not added: ${entry}`);

let generatedHeaders = headersSource.replace(
  'Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()',
  'Permissions-Policy: camera=(self), microphone=(), geolocation=(), payment=()'
);
if (!generatedHeaders.includes('Permissions-Policy: camera=(self), microphone=(), geolocation=(), payment=()')) {
  throw new Error('WP076 requires same-origin camera permission while keeping microphone disabled');
}
if (generatedHeaders.includes('Permissions-Policy: camera=(),')) throw new Error('Camera remains disabled by the generated Permissions-Policy');

const cacheControl = 'Cache-Control: no-cache, max-age=0, must-revalidate';
for (const route of ['/profile-media-model.js','/profile-media-controller.js','/profile-media-gallery.js','/profile-media.css','/src/camera.js']) {
  const contract = `${route}\n  ${cacheControl}`;
  if (!generatedHeaders.includes(contract)) generatedHeaders = `${generatedHeaders.trimEnd()}\n\n${contract}\n`;
}

await Promise.all([
  writeFile(indexPath, generatedIndex, 'utf8'),
  writeFile(headersPath, generatedHeaders, 'utf8')
]);
console.log(`WP076 profile-media artifact finalized with commit token ${buildCommit}.`);
