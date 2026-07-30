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
const migrationsDirectory = path.resolve(here, '../../../supabase/migrations');
const migration = fs.readdirSync(migrationsDirectory)
  .filter((name) => name.endsWith('.sql'))
  .sort()
  .map((name) => fs.readFileSync(path.join(migrationsDirectory, name), 'utf8'))
  .join('\n');

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

test('security-sensitive operations are server authoritative', () => {
  for (const operation of [
    BACKEND_RPC.LOAD_ONBOARDING_SNAPSHOT,
    BACKEND_RPC.SAVE_ONBOARDING_PROGRESS,
    BACKEND_RPC.SAVE_PROFILE_PERSONALITY,
    BACKEND_RPC.PUBLISH_PROFILE,
    BACKEND_RPC.RECORD_ATTRACTION_SIGNAL,
    BACKEND_RPC.OPEN_MATCH_CONVERSATION,
    BACKEND_RPC.BLOCK_USER,
    BACKEND_RPC.SUBMIT_INTERACTION_FEEDBACK,
    BACKEND_RPC.CREATE_SAFETY_REPORT
  ]) {
    assert.throws(
      () => assertServerAuthoritativeOperation(operation),
      /server-authoritative backend/
    );
  }
});

test('migrations contain required domain and RLS boundaries', () => {
  const requiredFragments = [
    'create table if not exists public.profiles',
    'create table if not exists public.eligibility',
    'create table if not exists public.onboarding_progress',
    'create table if not exists public.profile_prompts',
    'create table if not exists public.profile_interests',
    'create table if not exists public.attraction_signals',
    'create table if not exists public.matches',
    'create table if not exists public.contact_entitlements',
    'create table if not exists public.conversations',
    'create table if not exists public.messages',
    'create table if not exists public.blocks',
    'create table if not exists public.interaction_feedback',
    'create table if not exists public.safety_reports',
    'alter table public.messages enable row level security',
    'alter table public.onboarding_progress enable row level security',
    'create policy messages_participants_insert',
    'create or replace function public.save_onboarding_progress',
    'create or replace function public.save_profile_personality',
    'create or replace function public.load_onboarding_snapshot',
    'create or replace function public.publish_profile',
    'create or replace function public.record_attraction_signal',
    'create or replace function public.open_match_conversation',
    'create or replace function public.block_user',
    'create or replace function public.submit_interaction_feedback',
    'create or replace function public.create_safety_report',
    'create or replace function public.is_conversation_available',
    "insert into storage.buckets (id, name, public"
  ];
  for (const fragment of requiredFragments) {
    assert.equal(migration.includes(fragment), true, `missing migration contract: ${fragment}`);
  }
});

test('migrations do not expose moderation or audit tables to users', () => {
  assert.match(migration, /revoke all on public\.moderation_cases from anon, authenticated/);
  assert.match(migration, /revoke all on public\.audit_events from anon, authenticated/);
  assert.doesNotMatch(migration, /create policy .*moderation_cases.*authenticated/);
});

test('blocking cannot bypass the server transaction', () => {
  assert.match(migration, /drop policy if exists blocks_owner_insert/);
  assert.match(migration, /drop policy if exists blocks_owner_delete/);
  assert.match(migration, /update public\.matches[\s\S]*status = 'blocked'/);
  assert.match(migration, /update public\.conversations[\s\S]*status = 'blocked'/);
  assert.match(migration, /set revoked_at = coalesce/);
});

test('feedback and reports cannot choose trust or moderation state directly', () => {
  assert.match(migration, /drop policy if exists feedback_reviewer_insert/);
  assert.match(migration, /drop policy if exists reports_reporter_insert/);
  assert.match(migration, /credibility_weight = 0\.5000/);
  assert.match(migration, /status, priority[\s\S]*'triage'/);
});

test('profile publication and onboarding are fail-closed', () => {
  assert.match(migration, /profile_publication_requirements_met/);
  assert.match(migration, /count\(\*\) from public\.profile_prompts[\s\S]*>= 2/);
  assert.match(migration, /count\(\*\) from public\.profile_interests[\s\S]*>= 3/);
  assert.match(migration, /profile publication requirements not met/);
  assert.match(migration, /privacy_portraits_one_selected_idx/);
  assert.match(migration, /can_discover_profile/);
});
