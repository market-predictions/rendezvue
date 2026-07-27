import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EDUCATION_LEVELS,
  INSTITUTIONS,
  ageOnDate,
  createInitialState,
  extractEmailDomain,
  getInstitutionsByType,
  institutionAcceptsEmail,
  isAdult,
  validateFaithProfile,
  validateProfile
} from '../src/domain.js';

test('Dutch pilot fixtures cover MBO, HBO and WO', () => {
  assert.deepEqual(new Set(INSTITUTIONS.map((institution) => institution.type)), new Set(EDUCATION_LEVELS));
  for (const level of EDUCATION_LEVELS) assert.ok(getInstitutionsByType(level).length >= 10, `${level} should have at least ten pilot fixtures`);
});

test('extractEmailDomain normalizes valid email addresses', () => {
  assert.equal(extractEmailDomain(' Student@STUDENT.HU.NL '), 'student.hu.nl');
  assert.equal(extractEmailDomain('invalid'), null);
});

test('institution email accepts configured domains and subdomains', () => {
  assert.equal(institutionAcceptsEmail('hu', 'student@student.hu.nl'), true);
  assert.equal(institutionAcceptsEmail('rocva', 'student@portal.student.rocva.nl'), true);
  assert.equal(institutionAcceptsEmail('hu', 'student@gmail.com'), false);
  assert.equal(institutionAcceptsEmail('unknown', 'student@student.hu.nl'), false);
});

test('adult calculation handles birthdays precisely', () => {
  const reference = new Date('2026-07-27T12:00:00Z');
  assert.equal(ageOnDate('2008-07-27', reference), 18);
  assert.equal(ageOnDate('2008-07-28', reference), 17);
  assert.equal(isAdult('2008-07-27', reference), true);
  assert.equal(isAdult('2008-07-28', reference), false);
});

test('profile validation enforces conversation context using stable keys', () => {
  const valid = { nickname: 'Amal', intent: 'serious', interests: ['books', 'music', 'travel'], promptOne: 'Chai and a long walk.', promptTwo: 'You communicate clearly.' };
  assert.deepEqual(validateProfile(valid), []);
  assert.ok(validateProfile({ ...valid, interests: ['books'] }).includes('interests'));
});

test('faith profile uses self-description rather than a numeric religiosity score', () => {
  const valid = { faithIdentity: 'muslim', faithPractice: 'moderate', faithImportance: 'important', faithTags: ['family', 'noAlcohol'] };
  assert.deepEqual(validateFaithProfile(valid), []);
  assert.ok(validateFaithProfile({ ...valid, faithPractice: '10/10' }).includes('faithPractice'));
});

test('faith practice visibility is private by default', () => {
  assert.equal(createInitialState().profile.showFaithPractice, false);
});
