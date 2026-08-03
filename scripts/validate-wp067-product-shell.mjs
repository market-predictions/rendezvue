import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  derivePartnerSex,
  normaliseProductLanguage,
  productCopyKeys,
  projectDiscoveryProfile
} from '../apps/private-preview/product-model.js';

const root = resolve(process.cwd());
const dist = resolve(root, 'dist-private-preview');
const read = (path) => readFile(resolve(root, path), 'utf8');
const failures = [];
const requireMarker = (source, marker, message) => {
  if (!source.includes(marker)) failures.push(message);
};
const forbidPattern = (source, pattern, message) => {
  if (pattern.test(source)) failures.push(message);
};

const [accountShell, productShell, productModel, productCss, generatedAccountShell, generatedProductShell, generatedModel] = await Promise.all([
  read('apps/private-preview/account-shell.js'),
  read('apps/private-preview/product-shell.js'),
  read('apps/private-preview/product-model.js'),
  read('apps/private-preview/product-shell.css'),
  readFile(resolve(dist, 'account-shell.js'), 'utf8'),
  readFile(resolve(dist, 'product-shell.js'), 'utf8'),
  readFile(resolve(dist, 'product-model.js'), 'utf8')
]);

for (const [source, label] of [[productShell, 'source'], [generatedProductShell, 'generated artifact']]) {
  requireMarker(source, "import { supabase } from './app.js';", `${label} must reuse the shared Supabase browser client`);
  requireMarker(source, "createOnboardingRepository", `${label} must use the established onboarding repository`);
  requireMarker(source, "record_attraction_signal", `${label} is missing server-authoritative attraction signals`);
  requireMarker(source, "open_match_conversation", `${label} is missing server-authoritative conversation opening`);
  requireMarker(source, ".from('messages')", `${label} is missing participant-scoped messages`);
  requireMarker(source, "postgres_changes", `${label} is missing Realtime message subscription`);
  requireMarker(source, "end_match_contact", `${label} is missing end-contact handling`);
  requireMarker(source, "block_user", `${label} is missing blocking`);
  requireMarker(source, "create_safety_report", `${label} is missing private safety reporting`);
  requireMarker(source, "privacy-portraits", `${label} is missing private portrait storage`);
  requireMarker(source, "textContent = profile.display.nickname", `${label} must render profile copy through textContent`);
  requireMarker(source, "advancedTools.dataset.productBoundary = 'operator-synthetic-only'", `${label} must retain an explicit operator-only proof boundary`);

  forbidPattern(source, /createClient\s*\(/, `${label} must not create a second Supabase client`);
  forbidPattern(source, /auth\.admin|service_role|sb_secret_|SUPABASE_SERVICE_ROLE_KEY/i, `${label} contains prohibited administrative credential or Auth material`);
  forbidPattern(source, /execute-account-email-replacement|claim_account_email_replacement|complete_account_email_replacement/i, `${label} must not expose the support e-mail replacement executor`);
  forbidPattern(source, /deleteUser\s*\(|updateUserById\s*\(/, `${label} must not perform browser-side Auth administration`);
  forbidPattern(source, /account merge|merge account|merge_accounts/i, `${label} must not introduce account merging`);
  forbidPattern(source, /\.textContent\s*=\s*[^;\n]*(?:activeMatch|otherUserId|targetUserId|user\.id|\.user_id)/, `${label} appears to expose an internal identifier as visible text`);
}

requireMarker(accountShell, "import './product-shell.js';", 'account shell must load the integrated product shell');
requireMarker(accountShell, "rendezvue:language-change", 'account shell must broadcast language changes');
requireMarker(generatedAccountShell, "import './product-shell.js';", 'generated account shell must load the integrated product shell');
requireMarker(productModel, "if (sex === 'woman') return 'man';", 'partner preference must be derived from woman to man');
requireMarker(productModel, "if (sex === 'man') return 'woman';", 'partner preference must be derived from man to woman');
forbidPattern(productModel, /nonbinary|non-binair|partner_preference|who_to_meet/i, 'product model must not reintroduce a selectable partner or unsupported sex option');
requireMarker(productCss, '.rv-nav', 'product CSS is missing mobile application navigation');
requireMarker(productCss, '.rv-discovery-card', 'product CSS is missing discovery cards');
requireMarker(productCss, '.rv-bubble', 'product CSS is missing conversation bubbles');
requireMarker(generatedModel, 'projectDiscoveryProfile', 'generated product model is missing the product-safe projection');

if (normaliseProductLanguage('fr') !== 'nl') failures.push('Dutch must remain the default product language');
if (derivePartnerSex('woman') !== 'man' || derivePartnerSex('man') !== 'woman') failures.push('derived partner policy is incorrect');
if (JSON.stringify(productCopyKeys('nl')) !== JSON.stringify(productCopyKeys('en'))) failures.push('Dutch and English product copy keys differ');
const projection = projectDiscoveryProfile({ user_id: 'internal-id', nickname: 'Yasmin' });
if (JSON.stringify(projection.display).includes('internal-id')) failures.push('product display projection leaks the internal account identifier');

const portraits = ['yasmin', 'bilal', 'amina', 'idris', 'maryam', 'samir', 'noura', 'youssef', 'hafsa', 'omar'];
for (const name of portraits) {
  const info = await stat(resolve(dist, 'assets', 'profiles', `${name}.webp`));
  if (!info.isFile() || info.size < 1000) failures.push(`generated synthetic portrait is missing or too small: ${name}.webp`);
}
const manifest = JSON.parse(await readFile(resolve(dist, 'assets', 'profiles', 'manifest.json'), 'utf8'));
if (manifest.syntheticOnly !== true || manifest.count !== portraits.length) failures.push('synthetic portrait manifest is invalid');

if (failures.length) {
  console.error('WP-067 product-shell validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`WP-067 integrated product shell validated (${portraits.length} synthetic portraits, shared Auth client, product-safe projections).`);