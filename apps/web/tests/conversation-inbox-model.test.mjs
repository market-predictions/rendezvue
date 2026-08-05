import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildConversationInbox,
  chooseInitialMatchId,
  conversationReadStorageKey,
  formatConversationListTime,
  markConversationRead,
  otherParticipantId,
  readConversationMarkers,
  truncateConversationPreview
} from '../../private-preview/conversation-inbox-model.js';

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, String(value)); }
  };
}

const currentUserId = 'user-current';
const matches = [
  {
    id: 'match-amir',
    user_a_id: currentUserId,
    user_b_id: 'user-amir',
    status: 'active',
    matched_at: '2026-08-05T20:00:00.000Z'
  },
  {
    id: 'match-noor',
    user_a_id: 'user-noor',
    user_b_id: currentUserId,
    status: 'active',
    matched_at: '2026-08-04T20:00:00.000Z'
  },
  {
    id: 'match-new',
    user_a_id: currentUserId,
    user_b_id: 'user-new',
    status: 'active',
    matched_at: '2026-08-05T21:00:00.000Z'
  }
];

const conversations = [
  { id: 'conversation-amir', match_id: 'match-amir', status: 'open', opened_at: '2026-08-05T20:10:00.000Z' },
  { id: 'conversation-noor', match_id: 'match-noor', status: 'open', opened_at: '2026-08-04T20:10:00.000Z' }
];

const profiles = new Map([
  ['user-amir', { display: { nickname: 'Amir', city: 'Utrecht', lifeStage: 'employed', portraitAsset: './amir.webp' } }],
  ['user-noor', { display: { nickname: 'Noor', city: 'Rotterdam', lifeStage: 'student', portraitAsset: './noor.webp' } }],
  ['user-new', { display: { nickname: 'Mina', city: 'Den Haag', lifeStage: 'student', portraitAsset: './mina.webp' } }]
]);

const latestMessages = new Map([
  ['conversation-amir', {
    id: 'message-amir',
    conversation_id: 'conversation-amir',
    sender_user_id: 'user-amir',
    body: 'Zullen we morgen verder praten?',
    created_at: '2026-08-05T22:32:00.000Z'
  }],
  ['conversation-noor', {
    id: 'message-noor',
    conversation_id: 'conversation-noor',
    sender_user_id: currentUserId,
    body: 'Dat klinkt goed.',
    created_at: '2026-08-05T21:15:00.000Z'
  }]
]);

test('otherParticipantId resolves both match orientations and rejects unrelated users', () => {
  assert.equal(otherParticipantId(matches[0], currentUserId), 'user-amir');
  assert.equal(otherParticipantId(matches[1], currentUserId), 'user-noor');
  assert.equal(otherParticipantId(matches[0], 'unrelated'), null);
});

test('conversation inbox separates conversations from new matches and orders by activity', () => {
  const inbox = buildConversationInbox({
    matches,
    conversations,
    profilesByUserId: profiles,
    portraitsByUserId: new Map([['user-amir', 'signed-amir.webp']]),
    latestMessagesByConversationId: latestMessages,
    currentUserId,
    readMarkers: {}
  });

  assert.deepEqual(inbox.conversations.map((entry) => entry.nickname), ['Amir', 'Noor']);
  assert.deepEqual(inbox.newMatches.map((entry) => entry.nickname), ['Mina']);
  assert.equal(inbox.conversations[0].portraitUrl, 'signed-amir.webp');
  assert.equal(inbox.conversations[0].latestMessagePreview, 'Zullen we morgen verder praten?');
  assert.equal(inbox.conversations[0].unread, true);
  assert.equal(inbox.conversations[1].unread, false);
  assert.equal(chooseInitialMatchId(inbox, null), 'match-amir');
  assert.equal(chooseInitialMatchId(inbox, 'match-new'), 'match-new');
});

test('read markers persist only timestamps and clear the unread state', () => {
  const storage = memoryStorage();
  assert.equal(conversationReadStorageKey(currentUserId), `rendezvue:conversation-read:${currentUserId}`);
  assert.deepEqual(readConversationMarkers(storage, currentUserId), {});

  const markers = markConversationRead(
    storage,
    currentUserId,
    'conversation-amir',
    '2026-08-05T22:32:00.000Z'
  );
  assert.equal(markers['conversation-amir'], '2026-08-05T22:32:00.000Z');

  const inbox = buildConversationInbox({
    matches,
    conversations,
    profilesByUserId: profiles,
    latestMessagesByConversationId: latestMessages,
    currentUserId,
    readMarkers: readConversationMarkers(storage, currentUserId)
  });
  assert.equal(inbox.conversations[0].unread, false);
  assert.equal(storage.getItem(conversationReadStorageKey(currentUserId)).includes('Zullen we'), false);
});

test('conversation previews are compact and list times adapt to recency', () => {
  assert.equal(truncateConversationPreview('  Eén   twee   drie  '), 'Eén twee drie');
  assert.equal(truncateConversationPreview('abcdefghijklmnopqrstuvwxyz', 12), 'abcdefghijk…');

  const now = new Date('2026-08-05T22:45:00.000Z');
  assert.match(formatConversationListTime('2026-08-05T22:32:00.000Z', 'nl', now), /22:32/);
  assert.ok(formatConversationListTime('2026-08-03T12:00:00.000Z', 'nl', now).length >= 2);
  assert.ok(formatConversationListTime('2026-07-01T12:00:00.000Z', 'nl', now).includes('jul'));
  assert.ok(formatConversationListTime('2025-07-01T12:00:00.000Z', 'en', now).includes('2025'));
});
