import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const authSource = read('apps/web/src/auth-session.js');
const appSource = read('apps/private-preview/app.js');

const failures = [];
const requireSource = (source, pattern, message) => {
  if (!pattern.test(source)) failures.push(message);
};
const forbidSource = (source, pattern, message) => {
  if (pattern.test(source)) failures.push(message);
};

requireSource(
  authSource,
  /requestMagicLink\(emailValue\)[\s\S]*requestEmailLink\(emailValue, 'existing_account'\)/,
  'requestMagicLink must default to the existing-account path'
);
requireSource(
  authSource,
  /requestExistingAccountMagicLink\(emailValue\)[\s\S]*requestEmailLink\(emailValue, 'existing_account'\)/,
  'the adapter must expose an explicit existing-account method'
);
requireSource(
  authSource,
  /requestRegistrationMagicLink\(emailValue\)[\s\S]*requestEmailLink\(emailValue, 'registration'\)/,
  'the adapter must expose an explicit registration method'
);
requireSource(
  authSource,
  /shouldCreateUser:\s*registration/,
  'account creation must be controlled only by the explicit registration mode'
);
forbidSource(
  authSource,
  /requestMagicLink\(emailValue\)[\s\S]{0,240}shouldCreateUser:\s*true/,
  'the default magic-link method must never enable account creation'
);

requireSource(
  appSource,
  /Bestaand account aanmelden of herstellen/,
  'the Cloudflare proof UI must expose the existing-account action explicitly'
);
requireSource(
  appSource,
  /Nieuw synthetisch account registreren/,
  'the Cloudflare proof UI must expose registration as a separate explicit action'
);
requireSource(
  appSource,
  /requestExistingAccountMagicLink\(email\)/,
  'the existing-account UI action must call the fail-closed adapter method'
);
requireSource(
  appSource,
  /requestRegistrationMagicLink\(email\)/,
  'the registration UI action must call the registration adapter method'
);
requireSource(
  appSource,
  /zonder accountstatus vrij te geven/,
  'the browser response must state the non-enumeration boundary'
);
forbidSource(
  appSource,
  /Magic link aangevraagd voor \$\{result\.email\}/,
  'the old ambiguous magic-link success path must be absent'
);

if (failures.length) {
  console.error('WP-065 account-entry validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('WP-065 account-entry separation validated.');
