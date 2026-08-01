import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const supabaseUrl = String(process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
const secretKey = String(process.env.SUPABASE_SECRET_KEY ?? '').trim();
const password = String(process.env.RENDEZVUE_SYNTHETIC_PASSWORD ?? '');

if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(supabaseUrl)) throw new Error('SUPABASE_URL must be a hosted Supabase project URL');
if (secretKey.length < 20) throw new Error('SUPABASE_SECRET_KEY is required');
if (password.length < 24) throw new Error('RENDEZVUE_SYNTHETIC_PASSWORD must contain at least 24 characters');

const profiles = JSON.parse(await readFile(path.join(here, 'profiles.json'), 'utf8'));
if (!Array.isArray(profiles) || profiles.length !== 10) throw new Error('Exactly ten profiles are required');

const baseHeaders = Object.freeze({ apikey: secretKey, Authorization: `Bearer ${secretKey}` });

async function request(url, options = {}, operation = 'request') {
  const response = await fetch(url, options);
  const text = await response.text();
  let payload = null;
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = text; }
  }
  if (!response.ok) {
    const detail = typeof payload === 'string' ? payload.slice(0, 500) : JSON.stringify(payload);
    throw new Error(`${operation} failed with HTTP ${response.status}: ${detail}`);
  }
  return payload;
}

function queryString(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  }
  return query.toString();
}

async function rest(table, { method = 'GET', query = {}, body, prefer } = {}) {
  const suffix = queryString(query);
  const headers = { ...baseHeaders };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (prefer) headers.Prefer = prefer;
  return request(`${supabaseUrl}/rest/v1/${table}${suffix ? `?${suffix}` : ''}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  }, `${method} public.${table}`);
}

async function upsert(table, body, conflict = 'user_id') {
  return rest(table, {
    method: 'POST',
    query: { on_conflict: conflict },
    body,
    prefer: 'resolution=merge-duplicates,return=representation'
  });
}

async function listAuthUsers() {
  const users = [];
  for (let page = 1; page <= 20; page += 1) {
    const payload = await request(`${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=100`, { headers: baseHeaders }, 'list Auth users');
    const pageUsers = Array.isArray(payload) ? payload : (payload?.users ?? []);
    users.push(...pageUsers);
    if (pageUsers.length < 100) break;
  }
  return users;
}

async function ensureAuthUser(profile, knownUsers) {
  const bySyntheticId = knownUsers.find((user) => user.user_metadata?.synthetic_id === profile.synthetic_id);
  const byEmail = knownUsers.find((user) => String(user.email ?? '').toLowerCase() === profile.account_email.toLowerCase());
  if (bySyntheticId && byEmail && bySyntheticId.id !== byEmail.id) throw new Error(`Conflicting Auth users for ${profile.synthetic_id}`);
  const existing = bySyntheticId ?? byEmail ?? null;
  if (existing && existing.user_metadata?.is_synthetic !== true && !bySyntheticId) throw new Error(`Refusing to overwrite non-synthetic Auth user ${profile.account_email}`);

  const body = {
    email: profile.account_email,
    password,
    email_confirm: true,
    user_metadata: { synthetic_id: profile.synthetic_id, nickname: profile.nickname, is_synthetic: true },
    app_metadata: { provider: 'email', providers: ['email'], is_synthetic: true, synthetic_seed: 'rendezvue-v1' }
  };

  if (existing) {
    return request(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(existing.id)}`, {
      method: 'PUT',
      headers: { ...baseHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }, `update Auth user ${profile.synthetic_id}`);
  }

  const created = await request(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { ...baseHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }, `create Auth user ${profile.synthetic_id}`);
  knownUsers.push(created);
  return created;
}

async function uploadPortrait(userId, profile) {
  const fileName = path.basename(profile.portrait_path);
  const bytes = await readFile(path.join(here, 'portraits', fileName));
  const objectPath = `${userId}/synthetic/${fileName}`;
  const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/');
  await request(`${supabaseUrl}/storage/v1/object/privacy-portraits/${encodedPath}`, {
    method: 'POST',
    headers: { ...baseHeaders, 'Content-Type': 'image/webp', 'x-upsert': 'true', 'cache-control': '3600' },
    body: bytes
  }, `upload ${fileName}`);
  return objectPath;
}

function publicationTime(position) {
  return new Date(Date.UTC(2026, 7, 1, 8, position, 0)).toISOString();
}

async function seedProfile(profile, userId, position) {
  const now = new Date().toISOString();
  await upsert('profiles', {
    user_id: userId,
    synthetic_id: profile.synthetic_id,
    is_synthetic: true,
    nickname: profile.nickname,
    sex: profile.sex,
    city_region: profile.city,
    language: profile.language,
    relationship_intent: profile.relationship_intent,
    bio: profile.bio,
    publication_status: 'draft',
    profile_completed_at: null,
    published_at: null
  });
  await upsert('eligibility', {
    user_id: userId,
    date_of_birth: profile.date_of_birth,
    current_relationship_state: 'single',
    adult_confirmed: true,
    serious_intent_confirmed: true,
    community_fit_confirmed: true,
    terms_version: 'synthetic-seed-2026-08',
    confirmed_at: now
  });
  await upsert('life_stages', {
    user_id: userId,
    primary_status: profile.life_stage.primary_status,
    education_level: profile.life_stage.education_level,
    institution_id: profile.life_stage.institution_id,
    study_field: profile.life_stage.study_field,
    occupation_category: profile.life_stage.occupation_category,
    institution_visible: profile.life_stage.institution_visible
  });
  await upsert('family_contexts', {
    user_id: userId,
    marital_history: profile.family_context.marital_history,
    has_children: profile.family_context.has_children,
    child_count_band: profile.family_context.child_count_band,
    wants_children: profile.family_context.wants_children,
    accepts_partner_with_children: profile.family_context.accepts_partner_with_children,
    marital_history_visibility: profile.family_context.marital_history_visibility,
    children_visibility: profile.family_context.children_visibility
  });
  await upsert('faith_profiles', {
    user_id: userId,
    faith_identity: profile.faith_profile.faith_identity,
    practice_description: profile.faith_profile.practice_description,
    compatibility_importance: profile.faith_profile.compatibility_importance,
    lifestyle_tags: profile.faith_profile.lifestyle_tags,
    practice_visibility: profile.faith_profile.practice_visibility,
    consent_version: profile.faith_profile.consent_version,
    consented_at: now
  });

  await rest('profile_prompts', { method: 'DELETE', query: { user_id: `eq.${userId}` } });
  await rest('profile_interests', { method: 'DELETE', query: { user_id: `eq.${userId}` } });
  await rest('profile_prompts', {
    method: 'POST',
    body: profile.prompt_answers.map((item, index) => ({ user_id: userId, prompt_key: item.prompt_key, response: item.answer, position: index + 1 })),
    prefer: 'return=representation'
  });
  await rest('profile_interests', {
    method: 'POST',
    body: profile.interests.map((interest, index) => ({ user_id: userId, interest_key: interest, position: index + 1 })),
    prefer: 'return=representation'
  });

  const objectPath = await uploadPortrait(userId, profile);
  await rest('privacy_portraits', {
    method: 'PATCH',
    query: { user_id: `eq.${userId}`, is_public_profile_portrait: 'is.true' },
    body: { is_public_profile_portrait: false },
    prefer: 'return=minimal'
  });
  await upsert('privacy_portraits', {
    user_id: userId,
    object_path: objectPath,
    treatment: profile.portrait_treatment,
    status: 'verified',
    is_public_profile_portrait: true,
    source_retained_until: null
  }, 'user_id,object_path');
  await upsert('onboarding_progress', {
    user_id: userId,
    schema_version: 1,
    current_stage: 'complete',
    completed_stages: ['eligibility','account','identity','life_stage','family','portrait','faith','personality','preview','promise'],
    last_saved_at: now
  });
  await rest('profiles', {
    method: 'PATCH',
    query: { user_id: `eq.${userId}` },
    body: { publication_status: 'published', profile_completed_at: publicationTime(position), published_at: publicationTime(position) },
    prefer: 'return=representation'
  });

  const priorAudit = await rest('audit_events', {
    query: { select: 'id', event_type: 'eq.synthetic_profile_seeded', entity_id: `eq.${profile.synthetic_id}`, limit: 1 }
  });
  if (!Array.isArray(priorAudit) || priorAudit.length === 0) {
    await rest('audit_events', {
      method: 'POST',
      body: {
        actor_user_id: null,
        actor_type: 'system',
        event_type: 'synthetic_profile_seeded',
        subject_user_id: userId,
        entity_type: 'profile',
        entity_id: profile.synthetic_id,
        payload: { source: 'synthetic-seed', synthetic_id: profile.synthetic_id }
      },
      prefer: 'return=minimal'
    });
  }
  return { syntheticId: profile.synthetic_id, userId, objectPath, published: true };
}

const knownUsers = await listAuthUsers();
const results = [];
for (const [index, profile] of profiles.entries()) {
  const user = await ensureAuthUser(profile, knownUsers);
  if (!user?.id) throw new Error(`Auth user id missing for ${profile.synthetic_id}`);
  results.push(await seedProfile(profile, user.id, index + 1));
}

const seededUserFilter = `in.(${results.map((item) => item.userId).join(',')})`;
const seededIdFilter = `in.(${profiles.map((item) => item.synthetic_id).join(',')})`;
const published = await rest('profiles', {
  query: { select: 'user_id,synthetic_id,is_synthetic,publication_status', synthetic_id: seededIdFilter, order: 'synthetic_id.asc' }
});
const selectedPortraits = await rest('privacy_portraits', {
  query: {
    select: 'user_id,object_path,status,is_public_profile_portrait',
    user_id: seededUserFilter,
    treatment: 'eq.synthetic-illustrated-avatar-v1',
    is_public_profile_portrait: 'is.true'
  }
});

if (published.length !== 10 || published.some((row) => row.publication_status !== 'published')) {
  throw new Error(`Remote verification expected 10 published synthetic profiles, found ${published.length}`);
}
if (selectedPortraits.length !== 10) throw new Error(`Remote verification expected 10 selected synthetic portraits, found ${selectedPortraits.length}`);

console.log(JSON.stringify({
  seeded: results.length,
  publishedSyntheticProfiles: published.length,
  selectedSyntheticPortraits: selectedPortraits.length,
  storageBucket: 'privacy-portraits',
  realUserAdmissionAuthorized: false
}, null, 2));
