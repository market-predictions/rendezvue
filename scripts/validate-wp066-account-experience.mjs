import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const sourceIndex = read('apps/private-preview/index.html');
const shell = read('apps/private-preview/account-shell.js');
const copy = read('apps/web/src/account-experience.js');
const builtIndex = read('dist-private-preview/index.html');
const builtShell = read('dist-private-preview/account-shell.js');

const failures = [];
const requireMarker = (source, marker, message) => {
  if (!source.includes(marker)) failures.push(message);
};
const forbidPattern = (source, pattern, message) => {
  if (pattern.test(source)) failures.push(message);
};

for (const marker of [
  'data-language="nl"',
  'data-language="en"',
  'magic-link-form',
  'recovery-help',
  'account-request-status',
  'auth-callback-status',
  'account-email-summary',
  'delete-account-form',
  'advanced-tools'
]) {
  requireMarker(sourceIndex, marker, `source account page is missing ${marker}`);
  requireMarker(builtIndex, marker, `built account page is missing ${marker}`);
}

for (const marker of [
  "requestedLanguage || storedLanguage() || 'nl'",
  'genericAccountRequestMessage',
  'classifyAuthCallback',
  'maskAccountEmail',
  "runtime.remoteBackendConfigured === true",
  "import { supabase } from './app.js';"
]) {
  requireMarker(shell, marker, `account shell is missing ${marker}`);
  requireMarker(builtShell, marker, `built account shell is missing ${marker}`);
}

for (const key of [
  'account.existingAction',
  'account.registrationAction',
  'account.privacyHint',
  'account.recoverySummary',
  'account.recoveryStepOne',
  'account.recoveryStepTwo',
  'account.recoveryStepThree',
  'account.recoveryWarning',
  'account.callbackUnusable',
  'account.callbackPending',
  'account.signOut',
  'account.deleteSummary'
]) {
  const occurrences = copy.split(`'${key}'`).length - 1;
  if (occurrences < 2) failures.push(`${key} does not have Dutch and English copy`);
}

forbidPattern(shell, /navigator\.language/, 'Dutch must remain the default rather than inheriting the browser language');
forbidPattern(shell, /createClient\s*\(/, 'account shell must reuse the shared Supabase client');
forbidPattern(shell, /auth\.admin|execute-account-email-replacement|change_account_auth_email/i, 'account shell may not expose support account mutation');
forbidPattern(copy, /account (?:exists|does not exist)|unknown account|adres bestaat|adres is onbekend/i, 'account copy may not enumerate account existence');
forbidPattern(sourceIndex, /service_role|sb_secret_|SUPABASE_ACCESS_TOKEN/i, 'account page contains prohibited server credential terminology');

if (failures.length) {
  console.error('WP-066 account experience validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('WP-066 product-facing account and recovery experience validated.');
