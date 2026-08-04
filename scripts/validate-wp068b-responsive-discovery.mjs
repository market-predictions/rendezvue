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

const [sourceCss, generatedCss, sourceDeck, generatedDeck] = await Promise.all([
  readFile(resolve(root, 'apps/private-preview/discovery-deck.css'), 'utf8'),
  readFile(resolve(dist, 'discovery-deck.css'), 'utf8'),
  readFile(resolve(root, 'apps/private-preview/discovery-deck.js'), 'utf8'),
  readFile(resolve(dist, 'discovery-deck.js'), 'utf8')
]);

for (const [css, label] of [[sourceCss, 'source CSS'], [generatedCss, 'generated CSS']]) {
  requireMarker(css, 'container-name: rv-discovery-deck;', `${label} must name the discovery container`);
  requireMarker(css, 'container-type: inline-size;', `${label} must base responsive decisions on container width`);
  requireMarker(css, 'grid-template-areas:', `${label} must assign non-overlapping layout regions`);
  requireMarker(css, '"media"\n    "copy"\n    "actions"\n    "context"', `${label} must default to a stacked portrait/copy/actions/context layout`);
  requireMarker(css, 'grid-area: media;', `${label} must place the portrait in its own grid area`);
  requireMarker(css, 'grid-area: copy;', `${label} must place profile information in its own grid area`);
  requireMarker(css, 'grid-area: actions;', `${label} must place actions in their own grid area`);
  requireMarker(css, 'grid-area: context;', `${label} must place contextual input in its own grid area`);
  requireMarker(css, 'position: static !important;', `${label} must keep actions in normal layout flow`);
  requireMarker(css, 'aspect-ratio: auto !important;', `${label} must not let a fixed portrait ratio force column overflow`);
  requireMarker(css, 'min-width: 0;', `${label} must allow grid children to shrink without overlap`);
  requireMarker(css, '@container rv-discovery-deck (min-width: 48rem)', `${label} must activate split layout from card width`);
  requireMarker(css, 'minmax(21rem, 1.08fr) minmax(20rem, 0.92fr)', `${label} must reserve usable portrait and copy columns`);
  requireMarker(css, '"media copy"\n      "media actions"\n      "media context"', `${label} must keep split regions non-overlapping`);
  requireMarker(css, '@container rv-discovery-deck (max-width: 23.99rem)', `${label} must retain a narrow-card fallback`);
  forbidPattern(css, /@media\s*\(min-width:\s*760px\)[\s\S]*?rv-discovery-card-active/i, `${label} must not switch discovery layout from viewport width`);
  forbidPattern(css, /\.rv-discovery-deck\s+\.rv-discovery-actions\s*\{[^}]*position:\s*(?:absolute|fixed|sticky)/i, `${label} must not float actions over portrait or copy`);
}

for (const [deck, label] of [[sourceDeck, 'source controller'], [generatedDeck, 'generated controller']]) {
  requireMarker(deck, "card.hidden = !active;", `${label} must retain one active profile`);
  requireMarker(deck, "controls.actions.hidden = false;", `${label} must retain visible actions`);
  forbidPattern(deck, /style\.(?:left|right|top|bottom|position)\s*=/i, `${label} must not position discovery controls inline`);
}

if (failures.length) {
  console.error('WP-068B responsive discovery validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('WP-068B responsive discovery validated (container-driven layout, stacked fallback, non-overlapping portrait/copy/actions/context regions).');
