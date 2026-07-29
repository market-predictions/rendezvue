import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EDUCATION_LEVELS, INSTITUTIONS, ageOnDate, createInitialState, extractEmailDomain, getInstitutionsByType,
  institutionAcceptsEmail, isAdult, isEligible, validateFaithProfile, validateFamilyContext, validateIdentity,
  validateLifeStage, validateProfile
} from '../src/domain.js';

test('Dutch pilot fixtures cover MBO, HBO and WO', () => {
  assert.deepEqual(new Set(INSTITUTIONS.map((institution) => institution.type)), new Set(EDUCATION_LEVELS));
  for (const level of EDUCATION_LEVELS) assert.ok(getInstitutionsByType(level).length >= 10);
});

test('institution email validation remains an optional student entitlement proof', () => {
  assert.equal(extractEmailDomain(' Student@STUDENT.HU.NL '), 'student.hu.nl');
  assert.equal(institutionAcceptsEmail('hu', 'student@student.hu.nl'), true);
  assert.equal(institutionAcceptsEmail('hu', 'student@gmail.com'), false);
  const nonStudent = createInitialState();
  nonStudent.profile.lifeStage = 'employed';
  assert.deepEqual(validateLifeStage(nonStudent.profile), []);
});

test('eligibility is adult, single and serious but not student-only', () => {
  const reference = new Date('2026-07-29T12:00:00Z');
  assert.equal(ageOnDate('2008-07-29', reference), 18);
  assert.equal(isAdult('2008-07-30', reference), false);
  assert.equal(isEligible({ dateOfBirth: '1998-01-01', currentRelationshipState: 'single', communityFit: true, seriousIntent: true }, reference), true);
  assert.equal(isEligible({ dateOfBirth: '1998-01-01', currentRelationshipState: 'married', communityFit: true, seriousIntent: true }, reference), false);
});

test('identity and family context are separate validated domains', () => {
  const identity = { nickname: 'Amal', genderIdentity: 'woman', seeking: 'men', city: 'Rotterdam' };
  assert.deepEqual(validateIdentity(identity), []);
  const family = { maritalHistory: 'divorced', childStatus: 'hasChildren', childCountBand: 'one', childWish: 'openToMore', acceptsPartnerChildren: 'yes', intent: 'marriage' };
  assert.deepEqual(validateFamilyContext(family), []);
  assert.ok(validateFamilyContext({ ...family, maritalHistory: '' }).includes('maritalHistory'));
});

test('profile validation requires conversation context, not popularity', () => {
  const valid = { interests: ['books', 'music', 'travel'], promptOne: 'Chai and a long walk.', promptTwo: 'You communicate clearly.' };
  assert.deepEqual(validateProfile(valid), []);
  assert.ok(validateProfile({ ...valid, interests: ['books'] }).includes('interests'));
});

test('faith profile has no numeric religiosity score and stays private by default', () => {
  const valid = { faithIdentity: 'muslim', faithPractice: 'moderate', faithImportance: 'important', faithTags: ['family'] };
  assert.deepEqual(validateFaithProfile(valid), []);
  assert.ok(validateFaithProfile({ ...valid, faithPractice: '10/10' }).includes('faithPractice'));
  assert.equal(createInitialState().profile.showFaithPractice, false);
});
