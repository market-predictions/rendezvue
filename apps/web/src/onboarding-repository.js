const STAGE_TABLES = Object.freeze({
  eligibility: 'eligibility',
  identity: 'profiles',
  life_stage: 'life_stages',
  family: 'family_contexts',
  faith: 'faith_profiles'
});

const FIELD_ALLOWLISTS = Object.freeze({
  eligibility: new Set([
    'date_of_birth',
    'current_relationship_state',
    'adult_confirmed',
    'serious_intent_confirmed',
    'community_fit_confirmed',
    'terms_version',
    'confirmed_at',
    'reconfirm_after'
  ]),
  identity: new Set([
    'nickname',
    'sex',
    'city_region',
    'language',
    'relationship_intent',
    'bio',
    'profile_completed_at'
  ]),
  life_stage: new Set([
    'primary_status',
    'education_level',
    'institution_id',
    'study_field',
    'graduation_year',
    'occupation_category',
    'institution_visible'
  ]),
  family: new Set([
    'marital_history',
    'has_children',
    'child_count_band',
    'wants_children',
    'accepts_partner_with_children',
    'marital_history_visibility',
    'children_visibility'
  ]),
  faith: new Set([
    'faith_identity',
    'practice_description',
    'compatibility_importance',
    'lifestyle_tags',
    'practice_visibility',
    'consent_version',
    'consented_at'
  ])
});

function requireClient(client) {
  if (!client?.auth?.getUser || typeof client.from !== 'function' || typeof client.rpc !== 'function') {
    throw new TypeError('A Supabase-compatible client is required');
  }
  return client;
}

function unwrap(result, operation) {
  if (result?.error) {
    const error = new Error(`${operation} failed: ${result.error.message ?? 'unknown error'}`);
    error.cause = result.error;
    throw error;
  }
  return result?.data ?? null;
}

function filterFields(stage, values) {
  const allowlist = FIELD_ALLOWLISTS[stage];
  if (!allowlist) {
    throw new TypeError(`Unsupported onboarding stage: ${stage}`);
  }
  const source = values && typeof values === 'object' ? values : {};
  const filtered = {};
  for (const [key, value] of Object.entries(source)) {
    if (allowlist.has(key)) filtered[key] = value;
  }
  if (Object.keys(filtered).length === 0) {
    throw new TypeError(`No writable fields supplied for stage: ${stage}`);
  }
  return filtered;
}

async function authenticatedUserId(client) {
  const data = unwrap(await client.auth.getUser(), 'current-user lookup');
  const userId = data?.user?.id;
  if (!userId) throw new Error('Authentication required for onboarding persistence');
  return userId;
}

function normalisePrompts(prompts) {
  if (!Array.isArray(prompts)) throw new TypeError('Prompts must be an array');
  return prompts.map((item) => ({
    prompt_key: String(item?.prompt_key ?? '').trim(),
    response: String(item?.response ?? '').trim()
  }));
}

function normaliseInterests(interests) {
  if (!Array.isArray(interests)) throw new TypeError('Interests must be an array');
  return interests.map((value) => String(value ?? '').trim());
}

export function createOnboardingRepository(client) {
  const backend = requireClient(client);

  return Object.freeze({
    async loadSnapshot() {
      return unwrap(await backend.rpc('load_onboarding_snapshot'), 'onboarding snapshot load');
    },

    async saveStage(stage, values) {
      const table = STAGE_TABLES[stage];
      if (!table) throw new TypeError(`Unsupported onboarding stage: ${stage}`);
      const userId = await authenticatedUserId(backend);
      const record = { user_id: userId, ...filterFields(stage, values) };
      const query = backend.from(table).upsert(record, { onConflict: 'user_id' }).select().single();
      return unwrap(await query, `${stage} save`);
    },

    async saveProgress(currentStage, completedStages = [], schemaVersion = 1) {
      const stage = String(currentStage ?? '').trim();
      if (!stage) throw new TypeError('Current onboarding stage is required');
      const completed = [...new Set((completedStages ?? []).map((value) => String(value).trim()).filter(Boolean))];
      return unwrap(
        await backend.rpc('save_onboarding_progress', {
          p_current_stage: stage,
          p_completed_stages: completed,
          p_schema_version: Number(schemaVersion)
        }),
        'onboarding progress save'
      );
    },

    async savePersonality(prompts, interests) {
      return unwrap(
        await backend.rpc('save_profile_personality', {
          p_prompts: normalisePrompts(prompts),
          p_interests: normaliseInterests(interests)
        }),
        'profile personality save'
      );
    },

    async publishProfile() {
      return unwrap(await backend.rpc('publish_profile'), 'profile publication');
    }
  });
}

export { FIELD_ALLOWLISTS, STAGE_TABLES };
