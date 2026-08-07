import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../../..', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('prepared card and avatar are rendered from the same explicit selected presentation', async () => {
  const controller = await read('apps/private-preview/privacy-portrait-controller.js');
  assert.match(controller, /const filterId = requirePrivacyFilterId\(selectedFilterId\)/);
  assert.match(controller, /applyPrivacyFilterToCanvas\(card, rawCard, filterId\)/);
  assert.match(controller, /applyPrivacyFilterToCanvas\(avatar, rawAvatar, filterId\)/);
  assert.match(controller, /p_privacy_filter_id: output\.filterId/);
  assert.match(controller, /selectedFilterId = null/);
});

test('public preview uses the prepared selected card and never the source canvas', async () => {
  const controller = await read('apps/private-preview/privacy-portrait-controller.js');
  const shell = await read('apps/private-preview/product-shell.js');
  assert.match(controller, /applyPreview\(output\.card\)/);
  assert.match(shell, /const portraitUrl = state\.localPortraitUrl \|\| state\.ownPortraitUrl/);
  assert.match(shell, /eq\('is_public_profile_portrait', true\)/);
  assert.doesNotMatch(shell, /source_object_path.*createSignedUrl/s);
});

test('privacy matrix preserves exact prepared card and avatar geometry', async () => {
  const css = await read('apps/private-preview/privacy-portrait-filters.css');
  assert.match(css, /\[data-filter-card\]\s*\{[^}]*width:\s*auto;[^}]*height:\s*100%;[^}]*aspect-ratio:\s*4\/5;/s);
  assert.match(css, /\[data-filter-avatar\]\s*\{[^}]*width:\s*34%;[^}]*height:\s*auto;[^}]*aspect-ratio:\s*1\/1;/s);
  assert.doesNotMatch(css, /\[data-filter-card\]\s*\{[^}]*width:\s*72%;[^}]*height:\s*100%;/s);
});

test('discovery replaces fixture fallback only with the selected published prepared card', async () => {
  const discovery = await read('apps/private-preview/discovery-selected-portrait.js');
  const migration = await read('supabase/migrations/20260807193500_discovery_selected_portrait_delivery.sql');
  assert.match(discovery, /rpc\('get_discovery_portrait_path'/);
  assert.match(discovery, /createSignedUrl\(objectPath, 300\)/);
  assert.match(discovery, /portraitSource = 'selected-prepared-card'/);
  assert.match(migration, /pp\.asset_role = 'card'/);
  assert.match(migration, /pp\.is_public_profile_portrait/);
  assert.match(migration, /p\.publication_status = 'published'/);
  assert.match(migration, /pp\.user_id <> v_actor/);
  assert.doesNotMatch(migration, /asset_role = 'source'/);
});

test('match and chat portrait surfaces resolve the server-authorized selected portrait path', async () => {
  const inbox = await read('apps/private-preview/conversation-inbox-controller.js');
  assert.match(inbox, /rpc\('get_matched_portrait_path'/);
  assert.match(inbox, /createSignedUrl\(objectPath, 300\)/);
  assert.match(inbox, /if \(entry\?\.portraitUrl\)/);
  assert.match(inbox, /image\.src = entry\.portraitUrl/);
});
