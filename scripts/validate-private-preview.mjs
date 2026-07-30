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

const runtime = await readFile(resolve(target, 'runtime-config.js'), 'utf8');
if (!runtime.includes('sb_publishable_')) throw new Error('Private artifact does not contain a publishable browser key');
if (!runtime.includes('supabase-proof')) throw new Error('Runtime config is not in supabase-proof mode');

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
