import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(
  new URL('../../private-preview/product-shell.css', import.meta.url),
  'utf8'
);

function ruleBody(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 'm'));
  assert.ok(match, `Missing CSS rule for ${selector}`);
  return match[1];
}

function remValue(body, property) {
  const match = body.match(new RegExp(`${property}:\\s*([0-9.]+)rem`));
  assert.ok(match, `Missing rem value for ${property}`);
  return Number(match[1]);
}

test('profile fields give labels and values deliberately different visual weight', () => {
  const label = ruleBody('.rv-fieldset > label > span');
  const controls = ruleBody('.rv-fieldset input,\n.rv-fieldset select,\n.rv-fieldset textarea');

  const labelSize = remValue(label, 'font-size');
  const valueSize = remValue(controls, 'font-size');

  assert.ok(valueSize >= labelSize + 0.2, 'Field values must be materially larger than labels');
  assert.match(label, /color:\s*var\(--rv-field-label\)/);
  assert.match(label, /font-weight:\s*720/);
  assert.match(controls, /font-weight:\s*640/);
  assert.match(controls, /margin-top:\s*0/);
});

test('profile controls retain premium touch targets and focus treatment', () => {
  const compactControls = ruleBody('.rv-fieldset input,\n.rv-fieldset select');
  const focus = ruleBody('.rv-fieldset input:focus,\n.rv-fieldset select:focus,\n.rv-fieldset textarea:focus');

  assert.ok(remValue(compactControls, 'min-height') >= 3.25);
  assert.match(focus, /box-shadow:\s*0 0 0 4px var\(--rv-field-focus\)/);
  assert.match(focus, /border-color:\s*#4e8b78/);
  assert.match(css, /\.rv-fieldset > label:focus-within > span/);
});

test('identity layout gives relationship intent more room and collapses safely on mobile', () => {
  const desktop = ruleBody('#rv-profile-form > .rv-fieldset:nth-of-type(2)');
  assert.match(desktop, /minmax\(12rem, 0\.72fr\) minmax\(20rem, 1\.28fr\)/);

  const mobileBlock = css.match(/@media \(max-width: 680px\) \{([\s\S]*?)\n\}/);
  assert.ok(mobileBlock, 'Missing mobile profile-form breakpoint');
  assert.match(mobileBlock[1], /#rv-profile-form > \.rv-fieldset:nth-of-type\(2\)/);
  assert.match(mobileBlock[1], /grid-template-columns:\s*1fr/);
});

test('fieldset grouping is quiet, rounded and distinct from individual values', () => {
  const fieldset = ruleBody('.rv-fieldset');
  const legend = ruleBody('.rv-fieldset legend');

  assert.match(fieldset, /border-radius:\s*1\.2rem/);
  assert.match(fieldset, /background:\s*linear-gradient/);
  assert.match(legend, /border-radius:\s*999px/);
  assert.match(legend, /font-size:\s*0\.82rem/);
  assert.match(css, /WP-071: make the value the primary scan target/);
});
