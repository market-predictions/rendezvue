import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  normaliseSyntheticDisplayName,
  seededPortraitAssetForDisplayName
} from '../apps/private-preview/discovery-portrait-fallback.js';

const root = resolve(process.cwd());
const dist = resolve(root, 'dist-private-preview');
const failures = [];

function requireMarker(source, marker, message) {
  if (!source.includes(marker)) failures.push(message);
}

function forbidPattern(source, pattern, message) {
  if (pattern.test(source)) failures.push(message);
}

const [
  sourceFallback,
  generatedFallback,
  generatedIndex,
  generatedHeaders,
  generatedDeployment,
  manifestSource
] = await Promise.all([
  readFile(resolve(root, 'apps/private-preview/discovery-portrait-fallback.js'), 'utf8'),
  readFile(resolve(dist, 'discovery-portrait-fallback.js'), 'utf8'),
  readFile(resolve(dist, 'index.html'), 'utf8'),
  readFile(resolve(dist, '_headers'), 'utf8'),
  readFile(resolve(dist, 'deployment.json'), 'utf8'),
  readFile(resolve(dist, 'assets/profiles/manifest.json'), 'utf8')
]);

const deployment = JSON.parse(generatedDeployment);
const manifest = JSON.parse(manifestSource);
const buildCommit = String(deployment.buildCommit ?? '').trim();
const versionedEntry = `./discovery-portrait-fallback.js?commit=${encodeURIComponent(buildCommit)}`;
const expectedNames = ['yasmin','bilal','amina','idris','maryam','samir','noura','youssef','hafsa','omar'];

requireMarker(generatedIndex, versionedEntry, 'generated index must load the commit-versioned portrait fallback module');
requireMarker(generatedHeaders, '/discovery-portrait-fallback.js\n  Cache-Control: no-cache, max-age=0, must-revalidate', 'generated headers must revalidate the portrait fallback module');
if (manifest.syntheticOnly !== true) failures.push('profile manifest must remain synthetic-only');
if (JSON.stringify(manifest.names) !== JSON.stringify(expectedNames)) failures.push('profile manifest names differ from the approved fallback set');

for (const [source, label] of [[sourceFallback, 'source fallback'], [generatedFallback, 'generated fallback']]) {
  requireMarker(source, 'SEEDED_PORTRAITS', `${label} must contain the approved portrait allowlist`);
  requireMarker(source, 'seededPortraitAssetForDisplayName', `${label} must expose deterministic extended-name resolution`);
  requireMarker(source, "tokens.find((token) => SEEDED_PORTRAIT_SET.has(token))", `${label} must resolve only allowlisted name tokens`);
  requireMarker(source, "image.dataset.syntheticPortraitFallback = 'seeded'", `${label} must mark repaired synthetic portraits`);
  requireMarker(source, "media.replaceChildren(image)", `${label} must replace only the initial fallback tile`);
  requireMarker(source, "image.addEventListener('error', () => image.remove()", `${label} must fail back to the initial tile when an asset cannot load`);
  forbidPattern(source, /https?:\/\//i, `${label} must not fetch external portrait assets`);
  forbidPattern(source, /supabase|storage|signedUrl|createClient|service_role|auth\.admin/i, `${label} must not access private storage or privileged APIs`);
}

if (normaliseSyntheticDisplayName(' Ámina — Utrecht ') !== 'amina utrecht') failures.push('display-name normalization is incorrect');
if (seededPortraitAssetForDisplayName('Amina Noor') !== './assets/profiles/amina.webp') failures.push('extended Amina name does not resolve');
if (seededPortraitAssetForDisplayName('Student · Youssef El Amrani') !== './assets/profiles/youssef.webp') failures.push('extended Youssef name does not resolve');
if (seededPortraitAssetForDisplayName('Proof A') !== null) failures.push('unknown names must remain on the initial fallback');

if (failures.length) {
  console.error('WP-068C seeded portrait validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`WP-068C seeded portrait fallback validated (commit ${buildCommit}, approved synthetic token resolution only).`);
