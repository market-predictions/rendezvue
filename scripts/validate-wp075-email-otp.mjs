import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const dist = resolve(root, 'dist-private-preview');
const read = (path) => readFile(resolve(root, path), 'utf8');
const readDist = (path) => readFile(resolve(dist, path), 'utf8');

const [adapter, copy, controller, css, template, config, workflow, finalizer, index, deploymentText] = await Promise.all([
  read('apps/web/src/auth-session.js'),
  read('apps/web/src/account-experience.js'),
  read('apps/private-preview/email-otp-controller.js'),
  read('apps/private-preview/email-otp.css'),
  read('supabase/templates/magic-link.html'),
  read('supabase/config.toml'),
  read('.github/workflows/configure-wp075-email-otp.yml'),
  read('scripts/finalize-wp075-email-otp-artifact.mjs'),
  readDist('index.html'),
  readDist('deployment.json')
]);
const deployment = JSON.parse(deploymentText);
const buildCommit = String(deployment.buildCommit ?? '').trim();

function requireMatch(source, pattern, message) {
  if (!pattern.test(source)) throw new Error(message);
}
function forbidMatch(source, pattern, message) {
  if (pattern.test(source)) throw new Error(message);
}
function requireIncludes(source, value, message) {
  if (!source.includes(value)) throw new Error(message);
}

requireMatch(adapter, /['"]verifyOtp['"]/, 'WP-075 adapter does not require verifyOtp');
requireMatch(adapter, /verifyEmailOtp\(emailValue, tokenValue\)/, 'WP-075 verifyEmailOtp adapter method is missing');
requireIncludes(adapter, "auth.verifyOtp({ email, token, type: 'email' })", 'WP-075 adapter does not verify email OTP');
requireMatch(adapter, /shouldCreateUser:\s*registration/, 'WP-075 request path lost explicit registration separation');
requireIncludes(adapter, 'requestExistingAccountEmailOtp', 'WP-075 existing-account OTP request alias is missing');
requireIncludes(adapter, 'requestRegistrationEmailOtp', 'WP-075 registration OTP request alias is missing');
forbidMatch(adapter, /signInWithPassword|password:/, 'WP-075 must remain passwordless');

for (const key of ['account.otpTitle','account.otpIntro','account.otpLabel','account.otpVerify','account.otpResend','account.otpInvalid','account.otpVerified']) {
  requireIncludes(copy, `'${key}'`, `WP-075 copy is missing ${key}`);
}
requireIncludes(copy, '6-cijferige inlogcode', 'Dutch request copy is not code-first');
requireIncludes(copy, '6-digit sign-in code', 'English request copy is not code-first');
forbidMatch(copy, /same browser profile where you requested|hetzelfde browserprofiel waarin je hem hebt aangevraagd/, 'Legacy same-browser instruction remains customer-facing');

requireIncludes(controller, 'stopImmediatePropagation()', 'WP-075 controller does not take over the legacy request handler fail-safely');
requireIncludes(controller, 'autocomplete="one-time-code"', 'WP-075 OTP input does not support one-time-code autocomplete');
requireIncludes(controller, 'inputmode="numeric"', 'WP-075 OTP input is not numeric-touch optimized');
requireIncludes(controller, 'requestExistingAccountEmailOtp', 'WP-075 controller does not use existing-account OTP request');
requireIncludes(controller, 'requestRegistrationEmailOtp', 'WP-075 controller does not preserve explicit registration');
requireIncludes(controller, 'verifyEmailOtp', 'WP-075 controller does not verify the entered code');
requireMatch(controller, /sessionPropagation:\s*false/, 'WP-075 controller does not declare session isolation');
forbidMatch(controller, /localStorage.*access_token|refresh_token|document\.cookie/, 'WP-075 must not copy session material between browsers');
requireIncludes(css, '@media(max-width:36rem),(pointer:coarse)', 'WP-075 OTP control lacks mobile/coarse-pointer layout');

for (const marker of ['RENDEZVUE_WP075_EMAIL_OTP_V1','{{ .Token }}','{{ .ConfirmationURL }}']) {
  requireIncludes(template, marker, `WP-075 email template is missing ${marker}`);
}
requireMatch(config, /otp_length\s*=\s*6/, 'Local Supabase OTP length is not 6');
requireMatch(config, /otp_expiry\s*=\s*600/, 'Local Supabase OTP expiry is not 600 seconds');
requireIncludes(config, '[auth.email.template.magic_link]', 'Local Supabase magic-link/OTP template binding is missing');

// Hosted configuration must be transaction-like: one field at a time, read-back
// after each field, rollback of every attempted write on failure, and sanitized
// API errors rather than dumping the protected Auth response/configuration.
requireIncludes(workflow, "mailer_templates_magic_link_content: readFileSync('supabase/templates/magic-link.html', 'utf8')", 'Hosted template target is not repository managed');
requireIncludes(workflow, 'mailer_otp_length: Number(process.env.OTP_LENGTH)', 'Hosted OTP length is not managed by the deployment workflow');
requireIncludes(workflow, 'mailer_otp_exp: Number(process.env.OTP_EXPIRY_SECONDS)', 'Hosted OTP expiry is not managed by the deployment workflow');
requireIncludes(workflow, 'async function patchOne(key, value, purpose = \'apply\')', 'Hosted Auth repair is not field-isolated');
requireIncludes(workflow, 'const observed = await readHosted()', 'Hosted Auth field writes are not immediately read back');
requireMatch(workflow, /attempted\.push\(key\);\s*await patchOne\(key, desired\[key\]\)/s, 'Hosted Auth writes are not rollback-eligible before read-back');
requireIncludes(workflow, 'for (const key of [...attempted].reverse())', 'Hosted Auth repair lacks reverse-order rollback');
requireIncludes(workflow, "await patchOne(key, before[key], 'rollback')", 'Hosted Auth rollback does not restore observed pre-state');
requireIncludes(workflow, "const allowed = ['code', 'error', 'message', 'msg', 'details']", 'Hosted Auth failures are not sanitized');
forbidMatch(workflow, /console\.(?:log|error)\([^\n]*raw\)/, 'Hosted Auth workflow must not dump raw Management API responses');
requireIncludes(workflow, 'RENDEZVUE_WP075_EMAIL_OTP_V1', 'Hosted OTP workflow does not verify the template marker');

const scriptToken = `./email-otp-controller.js?commit=${encodeURIComponent(buildCommit)}`;
requireIncludes(index, scriptToken, 'Built artifact does not commit-pin the WP-075 OTP controller');
if (deployment.authFlow !== 'pkce-magic-link-cloudflare-staging') throw new Error('WP-075 must preserve the established PKCE callback compatibility contract');
if (deployment.passwordlessPrimary !== 'email-otp') throw new Error('Built artifact does not declare email OTP as the passwordless primary');
if (deployment.magicLinkConvenienceRetained !== true) throw new Error('Built artifact does not retain magic-link convenience');
if (deployment.crossBrowserEmailOtp !== true || deployment.emailOtpDigits !== 6 || deployment.emailOtpExpirySeconds !== 600) throw new Error('Built artifact OTP metadata differs from WP-075');
if (deployment.automaticCrossBrowserSessionPropagation !== false) throw new Error('Built artifact unexpectedly allows cross-browser session propagation');
if (deployment.passwordAuthentication !== false) throw new Error('Built artifact unexpectedly enables password authentication');
if (deployment.realUserAdmissionAuthorized !== false) throw new Error('WP-075 may not authorize real users');
requireIncludes(finalizer, 'branchPreview', 'WP-075 acceptance route is not branch-gated');

const branch = String(deployment.cloudflareBranch ?? '').trim();
if (branch && branch !== 'main') {
  await access(resolve(dist, 'visual-acceptance', 'wp075-email-otp.html'), constants.R_OK);
  const fixture = await readDist('visual-acceptance/wp075-email-otp.html');
  forbidMatch(fixture, /<script\b|runtime-config\.js|app\.js|createClient\(/i, 'WP-075 visual acceptance route must remain auth/backend-free');
}

console.log('WP-075 cross-browser email OTP artifact validated.');
