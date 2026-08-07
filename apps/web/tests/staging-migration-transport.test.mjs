import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflow = await readFile(new URL('../../../.github/workflows/configure-cloudflare-staging.yml', import.meta.url), 'utf8');

test('protected staging migrations bypass the fragile Supabase link metadata call', () => {
  assert.match(workflow, /config\/database\/pooler/);
  assert.match(workflow, /Resolve protected database connection without Supabase link/);
  assert.doesNotMatch(workflow, /supabase link\s+--project-ref/);
  assert.match(workflow, /supabase migration list --db-url "\$RENDEZVUE_DB_URL"/);
  assert.match(workflow, /supabase db push --db-url "\$RENDEZVUE_DB_URL"/);
});

test('resolved database URL is protected and assembled from validated pooler fields', () => {
  for (const field of ['db_user', 'db_host', 'db_port', 'db_name']) {
    assert.match(workflow, new RegExp(`['\"]${field}['\"]`));
  }
  assert.match(workflow, /database_type/);
  assert.match(workflow, /pool_mode/);
  assert.match(workflow, /url\.password = process\.env\.SUPABASE_DB_PASSWORD/);
  assert.match(workflow, /url\.searchParams\.set\('sslmode', 'require'\)/);
  assert.match(workflow, /echo "::add-mask::\$db_url"/);
  assert.match(workflow, /RENDEZVUE_DB_URL=%s/);
});

test('WP-074 canonical verifier changes force a fresh staging cycle', () => {
  assert.match(workflow, /\.github\/workflows\/verify-wp074-privacy-portrait-filters\.yml/);
});
