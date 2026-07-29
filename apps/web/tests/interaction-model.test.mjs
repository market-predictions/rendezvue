import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('pilot includes swipe, direct like, contextual like, contact entitlement and private feedback', async () => {
  const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
  for (const marker of ['bindSwipe', 'data-do="direct-like"', 'id="like-form"', 'contactEntitlements', "type: 'feedback'", 'feedbackSaved']) assert.ok(app.includes(marker), marker);
});

test('passes do not feed a public reputation score', async () => {
  const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
  assert.ok(app.includes('passedProfileIds.push'));
  assert.equal(app.includes('starRating'), false);
  assert.equal(app.includes('publicLikeCount'), false);
});
