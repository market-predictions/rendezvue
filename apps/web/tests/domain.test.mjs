import test from 'node:test';
import assert from 'node:assert/strict';
import { ageOnDate, extractEmailDomain, institutionAcceptsEmail, isAdult, validateProfile } from '../src/domain.js';

test('extractEmailDomain normalizes valid email addresses', () => {
  assert.equal(extractEmailDomain(' Student@ETU.UM5.AC.MA '), 'etu.um5.ac.ma');
  assert.equal(extractEmailDomain('invalid'), null);
});

test('institution email accepts configured domains and subdomains', () => {
  assert.equal(institutionAcceptsEmail('um5', 'student@um5.ac.ma'), true);
  assert.equal(institutionAcceptsEmail('um5', 'student@faculty.etu.um5.ac.ma'), true);
  assert.equal(institutionAcceptsEmail('um5', 'student@gmail.com'), false);
  assert.equal(institutionAcceptsEmail('unknown', 'student@um5.ac.ma'), false);
});

test('adult calculation handles birthdays precisely', () => {
  const reference = new Date('2026-07-27T12:00:00Z');
  assert.equal(ageOnDate('2008-07-27', reference), 18);
  assert.equal(ageOnDate('2008-07-28', reference), 17);
  assert.equal(isAdult('2008-07-27', reference), true);
  assert.equal(isAdult('2008-07-28', reference), false);
});

test('profile validation enforces the minimum conversation context', () => {
  const valid = { nickname: 'Amal', intent: 'A serious relationship', interests: ['Books', 'Music', 'Travel'], promptOne: 'Mint tea and a long walk.', promptTwo: 'You communicate clearly.' };
  assert.deepEqual(validateProfile(valid), []);
  assert.ok(validateProfile({ ...valid, interests: ['Books'] }).length > 0);
});
