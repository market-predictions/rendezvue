import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

const root = resolve(process.cwd());
const target = resolve(root, 'dist-private-preview');

async function collectFiles(directory) {
  const entries = await readdir(directory);
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry);
    const info = await stat(path);
    if (info.isDirectory()) files.push(...await collectFiles(path));
    else files.push(path);
  }
  return files;
}

const required = [
  'index.html',
  'app.js',
  'interaction-proof.js',
  'styles.css',
  'runtime-config.js',
  'deployment.json',
  'src/auth-session.js',
  'src/backend-contract.js',
  'src/onboarding-repository.js'
];

for (const file of required) {
  await readFile(resolve(target, file), 'utf8');
}

const deployment = JSON.parse(await readFile(resolve(target, 'deployment.json'), 'utf8'));
if (deployment.backendMode !== 'supabase-proof') throw new Error('Private artifact is not in supabase-proof mode');
if (deployment.publicPilotChanged !== false) throw new Error('Private preview must not claim to change the public pilot');
if (deployment.containsServerSecrets !== false) throw new Error('Private preview secret boundary is not asserted');
if (deployment.sharedBrowserAuthClient !== true) throw new Error('Private preview does not assert one shared browser Auth client');

const runtime = await readFile(resolve(target, 'runtime-config.js'), 'utf8');
if (!runtime.includes('sb_publishable_')) throw new Error('Private artifact does not contain a publishable browser key');
if (!runtime.includes('supabase-proof')) throw new Error('Runtime config is not in supabase-proof mode');

const index = await readFile(resolve(target, 'index.html'), 'utf8');
if (!index.includes('interaction-proof.js')) throw new Error('Private interaction proof module is not loaded');
if (!index.includes('claim-proof-entitlement')) throw new Error('Private contact-entitlement control is missing');
if (!index.includes('message-form')) throw new Error('Private messaging control is missing');

const app = await readFile(resolve(target, 'app.js'), 'utf8');
if (!app.includes('export const supabase = createClient(')) {
  throw new Error('Private app does not export the shared Supabase client');
}

const interaction = await readFile(resolve(target, 'interaction-proof.js'), 'utf8');
if (!interaction.startsWith("import { supabase } from './app.js';")) {
  throw new Error('Interaction proof does not import the shared Supabase client');
}
if (interaction.includes('createClient(') || interaction.includes('detectSessionInUrl')) {
  throw new Error('Interaction proof must not create a second Auth client');
}
for (const rpc of [
  'claim_private_proof_entitlement',
  'open_match_conversation',
  'get_matched_portrait_path',
  'end_match_contact',
  'block_user',
  'create_safety_report',
  'submit_interaction_feedback'
]) {
  if (!interaction.includes(rpc)) throw new Error(`Interaction proof does not reference ${rpc}`);
}

const prohibitedPatterns = [
  /sb_secret_/i,
  /service_role/i,
  /SUPABASE_ACCESS_TOKEN/i,
  /SUPABASE_DB_PASSWORD/i,
  /postgres(?:ql)?:\/\//i,
  /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/i
];

for (const file of await collectFiles(target)) {
  const contents = await readFile(file, 'utf8');
  for (const pattern of prohibitedPatterns) {
    if (pattern.test(contents)) {
      throw new Error(`Prohibited server credential material found in ${relative(root, file)}: ${pattern}`);
    }
  }
}

console.log(`Private preview artifact validation passed (${required.length} required files).`);
