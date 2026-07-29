import test from 'node:test';
import assert from 'node:assert/strict';
import { label, supportedLanguage, t } from '../src/i18n.js';

test('Dutch remains default with complete English switching', () => {
  assert.equal(supportedLanguage('fr'), 'nl');
  assert.equal(supportedLanguage('en'), 'en');
  assert.equal(t('nl', 'welcomePillStudent'), 'Student-first');
  assert.equal(t('en', 'welcomePillStudent'), 'Student-first');
});

test('family, life-stage and feedback labels are localized', () => {
  assert.equal(label('nl', 'maritalHistories', 'divorced'), 'Gescheiden');
  assert.equal(label('en', 'childStatuses', 'hasChildren'), 'Has children');
  assert.match(label('nl', 'feedbackConcernTags', 'noChemistry'), /Geen klik/);
});
