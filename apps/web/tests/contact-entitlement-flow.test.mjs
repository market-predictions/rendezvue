import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  contactOpenErrorCode,
  contactOpenErrorMessage
} from '../../private-preview/contact-entitlement-model.js';

const shell = readFileSync(
  new URL('../../private-preview/product-shell.js', import.meta.url),
  'utf8'
);
const productModel = readFileSync(
  new URL('../../private-preview/product-model.js', import.meta.url),
  'utf8'
);
const migration = readFileSync(
  new URL('../../../supabase/migrations/20260805194500_private_proof_entitlement_terms_alignment.sql', import.meta.url),
  'utf8'
);

test('current and legacy synthetic terms are explicitly aligned', () => {
  assert.match(productModel, /terms_version:\s*'synthetic-product-2026-08'/);
  assert.match(migration, /'synthetic-product-2026-08'/);
  assert.match(migration, /'synthetic-proof-2026-07'/);
  assert.doesNotMatch(migration, /terms_version\s+like/i);
  assert.match(migration, /raise exception 'published synthetic proof profile required'/);
});

test('the client validates entitlement activation before opening a conversation', () => {
  assert.match(
    shell,
    /unwrap\(\s*await supabase\.rpc\('claim_private_proof_entitlement'\),\s*'contact entitlement activation'\s*\)/
  );
  assert.match(shell, /contactOpenErrorMessage\(error, state\.language\)/);
  assert.doesNotMatch(shell, /A right may already exist or have been consumed/);
});

test('contact errors map to stable product codes', () => {
  assert.equal(
    contactOpenErrorCode(new Error('conversation open: no contact entitlement available')),
    'entitlement_unavailable'
  );
  assert.equal(
    contactOpenErrorCode(new Error('contact entitlement activation: published synthetic proof profile required')),
    'profile_required'
  );
  assert.equal(contactOpenErrorCode(new Error('active match required')), 'match_inactive');
  assert.equal(contactOpenErrorCode(new Error('unexpected backend problem')), 'unknown');
});

test('participants receive bilingual product copy instead of backend text', () => {
  const technical = new Error('conversation open: no contact entitlement available');
  const dutch = contactOpenErrorMessage(technical, 'nl');
  const english = contactOpenErrorMessage(technical, 'en');

  assert.equal(dutch, 'Het eenmalige test-contactrecht is al gebruikt of niet meer geldig.');
  assert.equal(english, 'The one-time test contact right has already been used or is no longer valid.');
  assert.doesNotMatch(dutch, /contact entitlement|conversation open/i);
  assert.doesNotMatch(english, /no contact entitlement available|conversation open/i);
});
