import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOnboardingPayload,
  derivePartnerSex,
  isAdultDate,
  normaliseInterests,
  normaliseProductLanguage,
  onboardingProgress,
  portraitAssetForNickname,
  productCopy,
  profileDisplayValue,
  productCopyKeys,
  profilePreview,
  projectDiscoveryProfile,
  resolveProductTab
} from '../../private-preview/product-model.js';

test('Dutch is the product default and English has complete key parity', () => {
  assert.equal(normaliseProductLanguage('fr-FR'), 'nl');
  assert.equal(normaliseProductLanguage('EN-gb'), 'en');
  assert.deepEqual(productCopyKeys('nl'), productCopyKeys('en'));
  assert.equal(productCopy('nl', 'nav.discover'), 'Ontdekken');
  assert.equal(productCopy('en', 'nav.discover'), 'Discover');
});

test('profile enums are localized before customer-facing display', () => {
  assert.equal(profileDisplayValue('nl', 'relationshipIntent', 'serious_relationship'), 'Serieuze relatie');
  assert.equal(profileDisplayValue('en', 'relationshipIntent', 'serious_relationship'), 'Serious relationship');
  assert.equal(profileDisplayValue('nl', 'lifeStage', 'recent_graduate'), 'Recent afgestudeerd');
  assert.equal(profileDisplayValue('en', 'lifeStage', 'self_employed'), 'Self-employed');
  assert.equal(profileDisplayValue('nl', 'relationshipIntent', 'Kennismaking met huwelijk als doel'), 'Kennismaking met huwelijk als doel');
  assert.equal(profileDisplayValue('nl', 'relationshipIntent', 'future_enum_value'), 'Future enum value');
  assert.equal(profileDisplayValue('nl', 'relationshipIntent', 'serious_relationship').includes('_'), false);
});

test('partner preference is derived only from sex', () => {
  assert.equal(derivePartnerSex('woman'), 'man');
  assert.equal(derivePartnerSex('man'), 'woman');
  assert.throws(() => derivePartnerSex('nonbinary'), /woman or man/);
});

test('adult date validation uses the exact eighteenth birthday', () => {
  const now = new Date('2026-08-04T00:00:00Z');
  assert.equal(isAdultDate('2008-08-04', now), true);
  assert.equal(isAdultDate('2008-08-05', now), false);
  assert.equal(isAdultDate('not-a-date', now), false);
});

test('onboarding payload is server-compatible and has no selectable partner field', () => {
  const payload = buildOnboardingPayload({
    dateOfBirth: '1998-02-03',
    adultConfirmed: true,
    singleConfirmed: true,
    seriousConfirmed: true,
    communityConfirmed: true,
    nickname: 'Noor',
    sex: 'woman',
    city: 'Utrecht',
    relationshipIntent: 'Serieuze kennismaking',
    bio: 'Boeken en rustige wandelingen.',
    primaryStatus: 'student',
    educationLevel: 'hbo',
    studyField: 'Zorg',
    maritalHistory: 'never_married',
    hasChildren: false,
    wantsChildren: 'maybe',
    acceptsChildren: 'yes',
    faithIdentity: 'Moslimachtergrond',
    practiceDescription: 'Persoonlijk en rustig',
    compatibilityImportance: 'important',
    practiceVisibility: 'after_match',
    lifestyleTags: 'halal, familie',
    promptOne: 'Koffie en wandelen',
    promptTwo: 'Eerlijkheid',
    interests: 'boeken, wandelen, Boeken',
    language: 'nl'
  }, new Date('2026-08-04T00:00:00Z'));

  assert.equal(payload.partnerSex, 'man');
  assert.equal(payload.stages.identity.sex, 'woman');
  assert.equal('partner_preference' in payload.stages.identity, false);
  assert.deepEqual(payload.personality.interests, ['boeken', 'wandelen']);
  assert.equal(payload.stages.life_stage.occupation_category, null);
});

test('eligibility cannot be bypassed by form values', () => {
  assert.throws(() => buildOnboardingPayload({
    dateOfBirth: '2010-01-01',
    adultConfirmed: true,
    singleConfirmed: true,
    seriousConfirmed: true,
    communityConfirmed: true,
    nickname: 'Test',
    sex: 'man',
    city: 'Rotterdam',
    relationshipIntent: 'Serious'
  }, new Date('2026-08-04T00:00:00Z')), /Eligibility/);
});

test('discovery projection keeps the account identifier outside display data', () => {
  const projected = projectDiscoveryProfile({
    user_id: '11111111-2222-3333-4444-555555555555',
    nickname: 'Yasmin',
    sex: 'woman',
    city_region: 'Amsterdam',
    relationship_intent: 'Huwelijk als doel',
    bio: 'Koffie en etentjes',
    primary_status: 'student'
  });
  assert.equal(projected.targetUserId, '11111111-2222-3333-4444-555555555555');
  assert.equal(Object.hasOwn(projected.display, 'user_id'), false);
  assert.equal(JSON.stringify(projected.display).includes('11111111'), false);
  assert.equal(projected.display.portraitAsset, './assets/profiles/yasmin.webp');
});

test('seeded portraits are deterministic and unknown names fall back safely', () => {
  assert.equal(portraitAssetForNickname('Bilal'), './assets/profiles/bilal.webp');
  assert.equal(portraitAssetForNickname('Unknown Person'), null);
});

test('progress and tab helpers fail closed', () => {
  assert.deepEqual(onboardingProgress(['eligibility', 'identity']), {
    count: 2,
    total: 8,
    percent: 25,
    complete: false
  });
  assert.equal(resolveProductTab('matches'), 'matches');
  assert.equal(resolveProductTab('admin'), 'home');
});

test('profile preview contains product copy only', () => {
  assert.deepEqual(profilePreview({
    nickname: 'Omar',
    sex: 'man',
    city: 'Den Haag',
    primaryStatus: 'employed',
    relationshipIntent: 'Serieuze kennismaking',
    bio: 'Sport en familie',
    interests: 'sport, familie'
  }), {
    nickname: 'Omar',
    city: 'Den Haag',
    lifeStage: 'employed',
    relationshipIntent: 'Serieuze kennismaking',
    bio: 'Sport en familie',
    interests: ['sport', 'familie'],
    partnerSex: 'woman'
  });
});

test('interest normalization removes blanks, duplicates and excess values', () => {
  const values = normaliseInterests('A, b, a, , c, d, e, f, g, h, i, j, k, l, m');
  assert.deepEqual(values.slice(0, 3), ['a', 'b', 'c']);
  assert.equal(values.length, 12);
});