import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { productCopy } from '../../private-preview/product-model.js';

const shell = readFileSync(
  new URL('../../private-preview/product-shell.js', import.meta.url),
  'utf8'
);
const controller = readFileSync(
  new URL('../../private-preview/conversation-inbox-controller.js', import.meta.url),
  'utf8'
);
const model = readFileSync(
  new URL('../../private-preview/conversation-inbox-model.js', import.meta.url),
  'utf8'
);
const css = readFileSync(
  new URL('../../private-preview/product-shell.css', import.meta.url),
  'utf8'
);

test('matches view exposes separate conversation, new-match and selected-thread regions', () => {
  assert.match(shell, /id="rv-conversation-list"/);
  assert.match(shell, /id="rv-new-match-list"/);
  assert.match(shell, /id="rv-ended-match-list"/);
  assert.match(shell, /id="rv-conversation-header"/);
  assert.match(shell, /id="rv-conversation-panel"/);
  assert.match(shell, /createConversationInboxController/);
  assert.doesNotMatch(shell, /id="rv-match-content"/);
  assert.doesNotMatch(shell, /function loadMatch\s*\(/);
  assert.doesNotMatch(shell, /activeMatch:/);
});

test('controller keeps selection, previews, messages and realtime scoped to one match', () => {
  assert.match(controller, /selectedMatchId/);
  assert.match(controller, /state\.inbox\.all\.find/);
  assert.match(controller, /from\('matches'\)/);
  assert.match(controller, /from\('conversations'\)/);
  assert.match(controller, /order\('created_at', \{ ascending: false \}\)\s*\.limit\(1\)/);
  assert.match(controller, /filter: `conversation_id=eq\.\$\{conversation\.id\}`/);
  assert.match(controller, /loadSelectedMessages/);
  assert.match(controller, /markConversationRead/);
  assert.doesNotMatch(controller, /localStorage[^\n]+body/);
});

test('inbox model separates new matches, conversation activity and private read markers', () => {
  assert.match(model, /conversations:/);
  assert.match(model, /newMatches:/);
  assert.match(model, /latestMessagePreview/);
  assert.match(model, /unread/);
  assert.match(model, /rendezvue:conversation-read:/);
  assert.match(model, /timestampValue\(latestMessage\?\.created_at\)/);
});

test('desktop and mobile layouts retain clear selected-conversation context', () => {
  assert.match(css, /WP-073: scalable match and conversation inbox/);
  assert.match(css, /grid-template-columns: minmax\(17rem, 0\.72fr\) minmax\(0, 1\.45fr\)/);
  assert.match(css, /\.rv-thread-row\.selected/);
  assert.match(css, /\.rv-thread-row\.unread/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /\.rv-messaging-shell\.conversation-open \.rv-thread-panel \{ display: none; \}/);
  assert.match(css, /\.rv-messaging-shell\.conversation-open \.rv-conversation-panel \{ display: grid; \}/);
  assert.match(css, /\.rv-conversation-back \{ display: inline-flex; \}/);
});

test('conversation navigation copy has Dutch and English parity', () => {
  const keys = [
    'matches.conversations',
    'matches.newMatches',
    'matches.selectConversation',
    'matches.selectConversationHint',
    'matches.noMessages',
    'matches.unread',
    'chat.activeWith',
    'chat.back'
  ];
  for (const key of keys) {
    assert.ok(productCopy('nl', key).trim(), `Missing Dutch copy for ${key}`);
    assert.ok(productCopy('en', key).trim(), `Missing English copy for ${key}`);
  }
});
