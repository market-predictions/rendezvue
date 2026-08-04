import { readFile, stat, writeFile } from 'node:fs/promises';
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
if (!/^[a-f0-9]{7,40}$|^local$/.test(buildCommit)) {
  throw new Error('Discovery deck finalization requires a valid build commit marker');
}

for (const file of ['discovery-deck.js', 'discovery-deck.css']) {
  const info = await stat(resolve(dist, file));
  if (!info.isFile() || info.size < 100) {
    throw new Error(`Discovery deck artifact is missing or unexpectedly small: ${file}`);
  }
}

const versionedModule = `./discovery-deck.js?commit=${encodeURIComponent(buildCommit)}`;
const directModulePattern = /\s*<script\s+type="module"\s+src="\.\/discovery-deck\.js(?:\?[^\"]*)?"\s*><\/script>\s*/g;
let generatedIndex = indexSource.replace(directModulePattern, '\n');
generatedIndex = generatedIndex.replace(
  '</body>',
  `  <script type="module" src="${versionedModule}"></script>\n</body>`
);

if (!generatedIndex.includes(versionedModule)) {
  throw new Error('Commit-versioned discovery deck module was not added to the generated index');
}

const cacheControl = 'Cache-Control: no-cache, max-age=0, must-revalidate';
const cacheRoutes = [
  '/',
  '/index.html',
  '/account-shell.js',
  '/product-shell.js',
  '/product-shell.css',
  '/discovery-deck.js',
  '/discovery-deck.css'
];
let generatedHeaders = headersSource.trimEnd();
for (const route of cacheRoutes) {
  const contract = `${route}\n  ${cacheControl}`;
  if (!generatedHeaders.includes(contract)) {
    generatedHeaders += `\n\n${contract}`;
  }
}
generatedHeaders += '\n';

await Promise.all([
  writeFile(indexPath, generatedIndex, 'utf8'),
  writeFile(headersPath, generatedHeaders, 'utf8')
]);

console.log(`Discovery deck entry finalized with commit token ${buildCommit}.`);
