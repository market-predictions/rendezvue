import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BACKEND_MODES,
  BACKEND_RPC,
  backendConfigurationStatus,
  normaliseBackendConfig,
  assertServerAuthoritativeOperation
} from '../src/backend-contract.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.resolve(here, '../../../supabase/migrations/20260730203000_backend_proof_foundation.sql');
const migration = fs.readFileSync(migrationPath, 'utf8');

test('backend defaults to the safe local demo mode', () => {
  assert.deepEqual(normaliseBackendConfig(), {
    mode: BACKEND_MODES.LOCAL_DEMO,
    url: '',
    publishableKey: ''
  });
  assert.equal(backendConfigurationStatus().ready, true);
});

test('remote backend proof requires URL and publishable key', () => {
  assert.equal(backendConfigurationStatus({ mode: BACKEND_MODES.SUPABASE_PROOF }).ready, false);
  assert.equal(
    backendConfigurationStatus({
      mode: BACKEND_MODES.SUPABASE_PROOF,
      url: 'https://example.supabase.co',
      publishableKey: 'publishable-key-long-enough-for-proof'
    }).ready,
    true
  );
});

test('security-sensitive mutations are server authoritative', () => {
  assert.throws(
    () => assertServerAuthoritativeOperation(BACKEND_RPC.RECORD_ATTRACTION_SIGNAL),
    /server-authoritative backend/
  );
  assert.throws(
    () => assertServerAuthoritativeOperation(BACKEND_RPC.OPEN_MATCH_CONVERSATION),
    /server-authoritative backend/
  );
});

test('migration contains required domain and RLS boundaries', () => {
  const requiredFragments = [
    'create table if not exists public.profiles',
    'create table if not exists public.eligibility',
    'create table if not exists public.attraction_signals',
    'create table if not exists public.matches',
    'create table if not exists public.contact_entitlements',
    'create table if not exists public.conversations',
    'create table if not exists public.messages',
    'create table if not exists public.blocks',
    'create table if not exists public.interaction_feedback',
    'create table if not exists public.safety_reports',
    'alter table public.messages enable row level security',
    'create policy messages_participants_insert',
    'create or replace function public.record_attraction_signal',
    'create or replace function public.open_match_conversation',
    "insert into storage.buckets (id, name, public"
  ];
  for (const fragment of requiredFragments) {
    assert.equal(migration.includes(fragment), true, `missing migration contract: ${fragment}`);
  }
});

test('migration does not expose moderation or audit tables to users', () => {
  assert.match(migration, /revoke all on public\.moderation_cases from anon, authenticated/);
  assert.match(migration, /revoke all on public\.audit_events from anon, authenticated/);
  assert.doesNotMatch(migration, /create policy .*moderation_cases.*authenticated/);
});
