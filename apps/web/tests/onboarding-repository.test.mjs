import test from 'node:test';
import assert from 'node:assert/strict';
import { createOnboardingRepository } from '../src/onboarding-repository.js';

function makeClient() {
  const calls = [];
  const client = {
    auth: {
      async getUser() {
        calls.push(['getUser']);
        return { data: { user: { id: '00000000-0000-0000-0000-0000000000a1' } }, error: null };
      }
    },
    from(table) {
      return {
        upsert(record, options) {
          calls.push(['upsert', table, record, options]);
          return {
            select() {
              return {
                async single() {
                  return { data: record, error: null };
                }
              };
            }
          };
        }
      };
    },
    async rpc(name, args) {
      calls.push(['rpc', name, args]);
      return { data: { name, args: args ?? null }, error: null };
    }
  };
  return { client, calls };
}

test('stage saves are owner-scoped and field allowlisted', async () => {
  const fake = makeClient();
  const repository = createOnboardingRepository(fake.client);
  const result = await repository.saveStage('identity', {
    user_id: 'attacker-controlled',
    nickname: 'Amina',
    sex: 'woman',
    city_region: 'Rotterdam',
    publication_status: 'published',
    unknown: 'discard me'
  });
  assert.deepEqual(result, {
    user_id: '00000000-0000-0000-0000-0000000000a1',
    nickname: 'Amina',
    sex: 'woman',
    city_region: 'Rotterdam'
  });
  assert.deepEqual(fake.calls[1], [
    'upsert',
    'profiles',
    result,
    { onConflict: 'user_id' }
  ]);
});

test('unsupported or empty stage writes fail before a backend call', async () => {
  const fake = makeClient();
  const repository = createOnboardingRepository(fake.client);
  await assert.rejects(() => repository.saveStage('payment', { value: true }), /Unsupported onboarding stage/);
  await assert.rejects(() => repository.saveStage('family', { user_id: 'ignored' }), /No writable fields/);
});

test('progress is deduplicated and saved through an authenticated RPC', async () => {
  const fake = makeClient();
  const repository = createOnboardingRepository(fake.client);
  await repository.saveProgress('family', ['eligibility', 'identity', 'identity'], 2);
  assert.deepEqual(fake.calls[0], [
    'rpc',
    'save_onboarding_progress',
    {
      p_current_stage: 'family',
      p_completed_stages: ['eligibility', 'identity'],
      p_schema_version: 2
    }
  ]);
});

test('personality content is normalized and saved atomically', async () => {
  const fake = makeClient();
  const repository = createOnboardingRepository(fake.client);
  await repository.savePersonality(
    [
      { prompt_key: ' family ', response: ' Samen bouwen ' },
      { prompt_key: ' weekend ', response: ' Wandelen ' }
    ],
    [' reizen ', ' koken ', ' familie ']
  );
  assert.deepEqual(fake.calls[0], [
    'rpc',
    'save_profile_personality',
    {
      p_prompts: [
        { prompt_key: 'family', response: 'Samen bouwen' },
        { prompt_key: 'weekend', response: 'Wandelen' }
      ],
      p_interests: ['reizen', 'koken', 'familie']
    }
  ]);
});

test('snapshot and publication use dedicated server operations', async () => {
  const fake = makeClient();
  const repository = createOnboardingRepository(fake.client);
  assert.equal((await repository.loadSnapshot()).name, 'load_onboarding_snapshot');
  assert.equal((await repository.publishProfile()).name, 'publish_profile');
  assert.deepEqual(fake.calls, [
    ['rpc', 'load_onboarding_snapshot', undefined],
    ['rpc', 'publish_profile', undefined]
  ]);
});
