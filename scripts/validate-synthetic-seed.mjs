import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const seedRoot = path.join(root, 'synthetic-seed');
const profiles = JSON.parse(await readFile(path.join(seedRoot, 'profiles.json'), 'utf8'));

const expected = new Map([
  ['Yasmin', { age: 24, city: 'Amsterdam', status: 'student', display: 'HBO-student', marital: 'never_married', children: 0 }],
  ['Bilal', { age: 27, city: 'Rotterdam', status: 'employed', display: 'Werkend', marital: 'never_married', children: 0 }],
  ['Amina', { age: 29, city: 'Utrecht', status: 'employed', display: 'Werkend', marital: 'divorced', children: 1 }],
  ['Idris', { age: 31, city: 'Eindhoven', status: 'employed', display: 'Werkend', marital: 'never_married', children: 0 }],
  ['Maryam', { age: 26, city: 'Den Haag', status: 'student', display: 'Masterstudent', marital: 'never_married', children: 0 }],
  ['Samir', { age: 33, city: 'Tilburg', status: 'employed', display: 'Werkend', marital: 'divorced', children: 2 }],
  ['Noura', { age: 30, city: 'Groningen', status: 'employed', display: 'Werkend', marital: 'never_married', children: 0 }],
  ['Youssef', { age: 28, city: 'Arnhem', status: 'self_employed', display: 'Ondernemer', marital: 'never_married', children: 0 }],
  ['Hafsa', { age: 32, city: 'Leiden', status: 'employed', display: 'Werkend', marital: 'divorced', children: 0 }],
  ['Omar', { age: 25, city: 'Breda', status: 'student', display: 'MBO-student', marital: 'never_married', children: 0 }]
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function ageOn(dateString, reference = new Date('2026-08-01T00:00:00Z')) {
  const dob = new Date(`${dateString}T00:00:00Z`);
  let age = reference.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday = reference.getUTCMonth() < dob.getUTCMonth()
    || (reference.getUTCMonth() === dob.getUTCMonth() && reference.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }
  return rows.filter((item) => item.some((value) => value !== ''));
}

assert(Array.isArray(profiles), 'profiles.json must contain an array');
assert(profiles.length === 10, `Expected 10 profiles, found ${profiles.length}`);

const ids = new Set();
const emails = new Set();
const localUserIds = new Set();
const portraitNames = new Set();
const bios = new Set();
const workValues = new Set();
const faithDescriptions = new Set();

for (const profile of profiles) {
  const target = expected.get(profile.nickname);
  assert(target, `Unexpected profile nickname: ${profile.nickname}`);
  assert(profile.is_synthetic === true, `${profile.nickname} is not marked synthetic`);
  assert(/^synthetic-[a-z]+-\d{3}$/.test(profile.synthetic_id), `${profile.nickname} has an invalid synthetic_id`);
  assert(!ids.has(profile.synthetic_id), `Duplicate synthetic_id: ${profile.synthetic_id}`);
  ids.add(profile.synthetic_id);
  assert(profile.account_email.endsWith('@rendezvue.test'), `${profile.nickname} does not use the reserved test domain`);
  assert(!emails.has(profile.account_email), `Duplicate email: ${profile.account_email}`);
  emails.add(profile.account_email);
  assert(/^[0-9a-f-]{36}$/.test(profile.local_user_id), `${profile.nickname} has an invalid local UUID`);
  assert(!localUserIds.has(profile.local_user_id), `Duplicate local user id: ${profile.local_user_id}`);
  localUserIds.add(profile.local_user_id);
  assert(['woman', 'man'].includes(profile.sex), `${profile.nickname} has an unsupported sex value`);
  assert(profile.age === target.age, `${profile.nickname} age differs from the approved composition`);
  assert(ageOn(profile.date_of_birth) === profile.age, `${profile.nickname} date of birth does not produce age ${profile.age} on 2026-08-01`);
  assert(profile.city === target.city, `${profile.nickname} city differs from the approved composition`);
  assert(profile.life_stage?.primary_status === target.status, `${profile.nickname} life stage differs from the approved composition`);
  assert(profile.life_stage?.display === target.display, `${profile.nickname} display life stage differs from the approved composition`);
  assert(profile.family_context?.marital_history === target.marital, `${profile.nickname} marital history differs from the approved composition`);
  assert(profile.family_context?.children_count === target.children, `${profile.nickname} child count differs from the approved composition`);
  assert(profile.family_context?.has_children === (target.children > 0), `${profile.nickname} has_children is inconsistent`);
  assert(typeof profile.bio === 'string' && profile.bio.length >= 90, `${profile.nickname} needs a substantive bio`);
  assert(!bios.has(profile.bio), `${profile.nickname} reuses another biography`);
  bios.add(profile.bio);
  assert(typeof profile.education_or_work === 'string' && profile.education_or_work.length >= 3, `${profile.nickname} lacks education/work content`);
  workValues.add(profile.education_or_work);
  assert(typeof profile.faith_profile?.practice_description === 'string', `${profile.nickname} lacks a faith practice description`);
  faithDescriptions.add(profile.faith_profile.practice_description);
  assert(Array.isArray(profile.interests) && profile.interests.length === 5, `${profile.nickname} must have exactly five interests`);
  assert(new Set(profile.interests).size === profile.interests.length, `${profile.nickname} has duplicate interests`);
  assert(Array.isArray(profile.prompt_answers) && profile.prompt_answers.length === 2, `${profile.nickname} must have exactly two prompt answers`);
  for (const prompt of profile.prompt_answers) {
    assert(prompt.prompt_key && prompt.prompt && prompt.answer, `${profile.nickname} has an incomplete prompt`);
    assert(prompt.answer.length >= 35, `${profile.nickname} has an underspecified prompt answer`);
  }
  assert(Array.isArray(profile.personality_tags) && profile.personality_tags.length >= 3, `${profile.nickname} needs personality tags`);
  assert(profile.publication_status === 'published', `${profile.nickname} is not designated for publication`);
  assert(!('mockup' in profile) && !('interface' in profile), `${profile.nickname} contains interface/mock-up data`);

  const portraitFile = path.basename(profile.portrait_path);
  assert(!portraitNames.has(portraitFile), `Duplicate portrait file: ${portraitFile}`);
  portraitNames.add(portraitFile);
  const portraitPath = path.join(root, profile.portrait_path);
  const info = await stat(portraitPath);
  assert(info.size >= 10_000, `${portraitFile} is unexpectedly small`);
  const header = await readFile(portraitPath);
  assert(header.subarray(0, 4).toString('ascii') === 'RIFF', `${portraitFile} is not a RIFF WebP`);
  assert(header.subarray(8, 12).toString('ascii') === 'WEBP', `${portraitFile} is not a WebP image`);
}

assert(workValues.size >= 9, 'Education/work values are not sufficiently varied');
assert(faithDescriptions.size === 10, 'Religious lifestyle descriptions must differ for all profiles');
assert(portraitNames.size === 10, 'Expected ten unique portrait files');

const csvRows = parseCsvRows(await readFile(path.join(seedRoot, 'profiles.csv'), 'utf8'));
assert(csvRows.length === 11, `profiles.csv must contain one header and ten data rows, found ${csvRows.length}`);
csvRows[0][0] = csvRows[0][0].replace(/^\uFEFF/, '');
assert(csvRows[0].includes('synthetic_id') && csvRows[0].includes('portrait_path'), 'profiles.csv lacks canonical columns');

const sql = await readFile(path.join(seedRoot, 'seed.sql'), 'utf8');
for (const table of [
  'profiles', 'eligibility', 'life_stages', 'family_contexts', 'faith_profiles',
  'profile_interests', 'profile_prompts', 'privacy_portraits', 'onboarding_progress'
]) {
  assert(sql.includes(`public.${table}`), `seed.sql does not populate public.${table}`);
}
assert((sql.match(/synthetic_profile_seeded/g) ?? []).length === 10, 'seed.sql must create one seed audit event per profile');

console.log(JSON.stringify({
  valid: true,
  profileCount: profiles.length,
  portraitCount: portraitNames.size,
  cities: [...new Set(profiles.map((profile) => profile.city))].length,
  educationOrWorkValues: workValues.size,
  faithDescriptions: faithDescriptions.size
}, null, 2));
