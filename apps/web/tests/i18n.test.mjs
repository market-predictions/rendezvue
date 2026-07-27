import test from 'node:test';
import assert from 'node:assert/strict';
import { label, supportedLanguage, t } from '../src/i18n.js';

test('Dutch is the default and English is the supported alternative', () => {
  assert.equal(supportedLanguage(undefined), 'nl');
  assert.equal(supportedLanguage('nl'), 'nl');
  assert.equal(supportedLanguage('en'), 'en');
  assert.equal(supportedLanguage('fr'), 'nl');
});

test('core Dutch and English labels are available', () => {
  assert.equal(t('nl', 'educationLabels.mbo'), 'MBO');
  assert.match(t('en', 'educationLabels.mbo'), /vocational/i);
  assert.equal(label('nl', 'faithPractices', 'moderate'), 'Gematigd praktiserend');
  assert.equal(label('en', 'intents', 'marriage'), 'Marriage-oriented');
});

test('translation interpolation replaces named values', () => {
  assert.equal(t('nl', 'likeSent', { name: 'Samira' }), 'Like verstuurd naar Samira.');
});
