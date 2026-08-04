import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  discoveryDeckCopy,
  discoveryDeckStyleHref,
  normaliseDiscoveryLanguage,
  resolveDiscoveryDeckProgress
} from '../apps/private-preview/discovery-deck.js';

const root = resolve(process.cwd());
const dist = resolve(root, 'dist-private-preview');
const read = (path) => readFile(resolve(root, path), 'utf8');
const failures = [];

function requireMarker(source, marker, message) {
  if (!source.includes(marker)) failures.push(message);
}

function forbidPattern(source, pattern, message) {
  if (pattern.test(source)) failures.push(message);
}

const [
  accountShell,
  productShell,
  deckSource,
  deckCss,
  generatedIndex,
  generatedHeaders,
  generatedDeployment,
  generatedAccountShell,
  generatedProductShell,
  generatedDeck,
  generatedDeckCss
] = await Promise.all([
  read('apps/private-preview/account-shell.js'),
  read('apps/private-preview/product-shell.js'),
  read('apps/private-preview/discovery-deck.js'),
  read('apps/private-preview/discovery-deck.css'),
  readFile(resolve(dist, 'index.html'), 'utf8'),
  readFile(resolve(dist, '_headers'), 'utf8'),
  readFile(resolve(dist, 'deployment.json'), 'utf8'),
  readFile(resolve(dist, 'account-shell.js'), 'utf8'),
  readFile(resolve(dist, 'product-shell.js'), 'utf8'),
  readFile(resolve(dist, 'discovery-deck.js'), 'utf8'),
  readFile(resolve(dist, 'discovery-deck.css'), 'utf8')
]);

const deployment = JSON.parse(generatedDeployment);
const buildCommit = String(deployment.buildCommit ?? '').trim();
const versionedModule = `./discovery-deck.js?commit=${encodeURIComponent(buildCommit)}`;

for (const [source, label] of [[accountShell, 'source account shell'], [generatedAccountShell, 'generated account shell']]) {
  requireMarker(source, "import './discovery-deck.js';", `${label} must load the discovery deck controller as a fallback`);
}

requireMarker(generatedIndex, versionedModule, 'generated index must load the discovery deck through a commit-versioned direct module entry');
const directDeckEntries = generatedIndex.match(/<script\s+type="module"\s+src="\.\/discovery-deck\.js\?commit=[^"]+"\s*><\/script>/g) ?? [];
if (directDeckEntries.length !== 1) failures.push('generated index must contain exactly one commit-versioned direct discovery deck entry');

for (const path of ['/index.html', '/account-shell.js', '/product-shell.js', '/product-shell.css', '/discovery-deck.js', '/discovery-deck.css']) {
  const contract = `${path}\n  Cache-Control: no-cache, max-age=0, must-revalidate`;
  requireMarker(generatedHeaders, contract, `generated headers are missing the cache-coherence contract for ${path}`);
}

for (const [source, label] of [[productShell, 'source product shell'], [generatedProductShell, 'generated product shell']]) {
  requireMarker(source, "copy.className = 'rv-discovery-copy';", `${label} must render visible discovery profile copy`);
  requireMarker(source, "actions.className = 'rv-discovery-actions';", `${label} must render discovery actions`);
  requireMarker(source, "actions.append(pass, like, context);", `${label} must retain Pass, Like and contextual-like controls`);
  requireMarker(source, "recordSignal(profile, 'pass'", `${label} must connect Pass to the authoritative signal action`);
  requireMarker(source, "recordSignal(profile, 'like'", `${label} must connect Like to the authoritative signal action`);
}

for (const [source, label] of [[deckSource, 'source deck'], [generatedDeck, 'generated deck']]) {
  requireMarker(source, "querySelectorAll(':scope > .rv-discovery-card')", `${label} must enumerate discovery cards only`);
  requireMarker(source, "card.hidden = !active;", `${label} must expose only one active discovery card`);
  requireMarker(source, "card.toggleAttribute('inert', !active);", `${label} must remove inactive cards from keyboard interaction`);
  requireMarker(source, "copy.hidden = false;", `${label} must force profile information visible`);
  requireMarker(source, "controls.actions.hidden = false;", `${label} must force interaction controls visible`);
  requireMarker(source, "card.dataset.discoveryCardComplete", `${label} must record whether profile copy and controls are complete`);
  requireMarker(source, "dataset.discoveryAction = 'pass'", `${label} is missing the Pass presentation contract`);
  requireMarker(source, "dataset.discoveryAction = 'like'", `${label} is missing the Like presentation contract`);
  requireMarker(source, "dataset.discoveryAction = 'context'", `${label} is missing the contextual-like presentation contract`);
  requireMarker(source, "resolveDiscoveryDeckProgress", `${label} must maintain discovery position and progress`);
  requireMarker(source, "discoveryDeckStyleHref(import.meta.url)", `${label} must propagate its commit token to the stylesheet`);
  forbidPattern(source, /createClient\s*\(|auth\.admin|service_role|sb_secret_|SUPABASE_SERVICE_ROLE_KEY/i, `${label} must not introduce a second client or privileged browser capability`);
}

for (const [source, label] of [[deckCss, 'source deck CSS'], [generatedDeckCss, 'generated deck CSS']]) {
  requireMarker(source, '.rv-discovery-deck > .rv-discovery-card[hidden]', `${label} must hide inactive cards`);
  requireMarker(source, '.rv-discovery-deck > .rv-discovery-card-active', `${label} must style exactly one active card`);
  requireMarker(source, 'display: block !important;', `${label} must override accidental profile-copy hiding`);
  requireMarker(source, '.rv-discovery-deck .rv-discovery-actions', `${label} must keep the action area visible`);
  requireMarker(source, 'position: static !important;', `${label} must keep actions in a dedicated non-overlapping layout region`);
  requireMarker(source, '[data-discovery-action="pass"]', `${label} is missing distinct Pass styling`);
  requireMarker(source, '[data-discovery-action="like"]', `${label} is missing distinct Like styling`);
  requireMarker(source, '[data-discovery-action="context"]', `${label} is missing distinct contextual-like styling`);
}

if (normaliseDiscoveryLanguage('fr-FR') !== 'nl') failures.push('discovery deck must default to Dutch');
if (normaliseDiscoveryLanguage('en-GB') !== 'en') failures.push('discovery deck must support explicit English');
if (discoveryDeckStyleHref('https://example.test/discovery-deck.js?commit=abc1234') !== 'https://example.test/discovery-deck.css?commit=abc1234') {
  failures.push('discovery deck stylesheet does not inherit the module commit token');
}

const initial = resolveDiscoveryDeckProgress(10, 10);
const advanced = resolveDiscoveryDeckProgress(10, 7);
const complete = resolveDiscoveryDeckProgress(10, 0);
if (initial.current !== 1 || initial.percent !== 0) failures.push('initial discovery deck progress is incorrect');
if (advanced.current !== 4 || advanced.percent !== 30) failures.push('advanced discovery deck progress is incorrect');
if (complete.current !== 10 || complete.percent !== 100) failures.push('completed discovery deck progress is incorrect');

for (const language of ['nl', 'en']) {
  if (!/Overslaan|Pass/.test(discoveryDeckCopy(language, 'pass'))) failures.push(`${language} Pass label is missing`);
  if (!/Leuk|Like/.test(discoveryDeckCopy(language, 'like'))) failures.push(`${language} Like label is missing`);
  if (!/Reageer|Respond/.test(discoveryDeckCopy(language, 'context'))) failures.push(`${language} contextual-like label is missing`);
}

if (failures.length) {
  console.error('WP-068A discovery-deck validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`WP-068A discovery deck validated (commit ${buildCommit}, single active card, visible profile copy, dedicated Pass/Like/Respond region).`);
