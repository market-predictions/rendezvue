import { access, cp, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const dist = resolve(root, 'dist-private-preview');
const branch = String(process.env.CF_PAGES_BRANCH ?? '').trim();
const branchPreview = Boolean(branch && branch !== 'main');

const deploymentPath = resolve(dist, 'deployment.json');
const indexPath = resolve(dist, 'index.html');
const controllerPath = resolve(dist, 'email-otp-controller.js');
const cssPath = resolve(dist, 'email-otp.css');
const accountCopyPath = resolve(dist, 'src/account-experience.js');
const activationPath = resolve(root, 'config/wp075-email-otp-activation.json');

for (const path of [deploymentPath, indexPath, controllerPath, cssPath, accountCopyPath, activationPath]) {
  await access(path, constants.R_OK);
  const info = await stat(path);
  if (!info.isFile() || info.size < 80) throw new Error(`WP-075 artifact input is missing or too small: ${path}`);
}

const deployment = JSON.parse(await readFile(deploymentPath, 'utf8'));
const activation = JSON.parse(await readFile(activationPath, 'utf8'));
if (deployment.realUserAdmissionAuthorized !== false || activation.realUserAdmissionAuthorized !== false) {
  throw new Error('WP-075 may not authorize real-user admission');
}
if (activation.contract !== 'RENDEZVUE_WP075_EMAIL_OTP_ACTIVATION_V1') {
  throw new Error('WP-075 activation contract is missing or unsupported');
}
const buildCommit = String(deployment.buildCommit ?? '').trim();
if (!buildCommit) throw new Error('WP-075 requires a build commit marker');

const desiredOtpDigits = Number(activation.desiredOtpDigits);
const desiredOtpExpirySeconds = Number(activation.desiredOtpExpirySeconds);
if (desiredOtpDigits !== 6 || desiredOtpExpirySeconds !== 600) {
  throw new Error('WP-075 desired OTP parameters differ from the approved 6-digit / 600-second contract');
}

const hostedDeliveryReady = activation.hostedDeliveryReady === true;
if (hostedDeliveryReady) {
  if (activation.activationState !== 'active-hosted-email-otp' || activation.activePasswordlessPath !== 'email-otp') {
    throw new Error('WP-075 hosted delivery cannot activate without the explicit active repository state');
  }
} else if (activation.activationState !== 'blocked-external-mail-provider' || activation.activePasswordlessPath !== 'pkce-magic-link') {
  throw new Error('WP-075 blocked hosted delivery must retain PKCE magic link as the active passwordless path');
}

let index = await readFile(indexPath, 'utf8');
const script = `  <script type="module" src="./email-otp-controller.js?commit=${encodeURIComponent(buildCommit)}"></script>\n`;
const controllerScriptPattern = /\s*<script\s+type="module"\s+src="\.\/email-otp-controller\.js\?commit=[^"]+"><\/script>\s*/g;
index = index.replace(controllerScriptPattern, '\n');
if (hostedDeliveryReady) {
  index = index.replace('</body>', `${script}</body>`);
  if (!index.includes('email-otp-controller.js')) throw new Error('WP-075 active e-mail OTP controller was not assembled');
} else if (index.includes('email-otp-controller.js')) {
  throw new Error('WP-075 blocked hosted delivery may not load the OTP controller on canonical/browser artifacts');
}
await writeFile(indexPath, index, 'utf8');

// The repository retains the complete code-first copy for the future activated
// OTP path. While hosted delivery is blocked, the generated canonical/browser
// artifact must instead describe the actually available PKCE magic-link flow.
// Exact replacements fail closed if the source copy changes, preventing a
// future copy edit from silently reintroducing an unavailable-code promise.
if (!hostedDeliveryReady) {
  let builtCopy = await readFile(accountCopyPath, 'utf8');
  const replacements = new Map([
    [
      "'account.signinIntro': 'Je ontvangt een eenmalige code per e-mail. Voer die in in de browser waarin je Rendezvue wilt gebruiken. In de e-mail staat ook een optionele directe aanmeldlink.'",
      "'account.signinIntro': 'Je ontvangt een eenmalige aanmeldlink per e-mail. Open die in hetzelfde browserprofiel waarin je Rendezvue wilt gebruiken.'"
    ],
    ["'account.existingAction': 'Stuur inlogcode'", "'account.existingAction': 'Aanmeldlink sturen'"],
    [
      "'account.callbackUnusable': 'Deze directe aanmeldlink is verlopen, al gebruikt of niet geldig. Vraag een nieuwe code aan en voer die in in de browser die je wilt gebruiken.'",
      "'account.callbackUnusable': 'Deze aanmeldlink is verlopen, al gebruikt of niet geldig. Vraag een nieuwe link aan.'"
    ],
    [
      "'account.callbackPending': 'De directe aanmeldlink wordt verwerkt. Wil je liever een andere browser gebruiken, open Rendezvue daar en vraag in die browser een nieuwe code aan.'",
      "'account.callbackPending': 'De aanmeldlink wordt verwerkt. Open de link in hetzelfde browserprofiel waarin je hem hebt aangevraagd. Werkt dat niet, vraag dan een nieuwe link aan.'"
    ],
    [
      "'account.requestExisting': 'Controleer je inbox. Als deze aanvraag kan worden uitgevoerd, ontvang je een 6-cijferige inlogcode en een optionele directe aanmeldlink. Controleer ook je spammap.'",
      "'account.requestExisting': 'Controleer je inbox. Als deze aanvraag kan worden uitgevoerd, ontvang je een eenmalige aanmeldlink. Controleer ook je spammap.'"
    ],
    [
      "'account.requestRegistration': 'Controleer je inbox. Als registratie mogelijk is, ontvang je een 6-cijferige code om het nieuwe account te openen.'",
      "'account.requestRegistration': 'Controleer je inbox. Als registratie mogelijk is, ontvang je een eenmalige aanmeldlink om het nieuwe account te openen.'"
    ],
    [
      "'account.signinIntro': 'You receive a one-time code by email. Enter it in the browser where you want to use Rendezvue. The email also contains an optional direct sign-in link.'",
      "'account.signinIntro': 'You receive a one-time sign-in link by email. Open it in the same browser profile where you want to use Rendezvue.'"
    ],
    ["'account.existingAction': 'Send sign-in code'", "'account.existingAction': 'Send sign-in link'"],
    [
      "'account.callbackUnusable': 'This direct sign-in link has expired, was already used or is invalid. Request a new code and enter it in the browser you want to use.'",
      "'account.callbackUnusable': 'This sign-in link has expired, was already used or is invalid. Request a new link.'"
    ],
    [
      "'account.callbackPending': 'The direct sign-in link is being processed. If you prefer another browser, open Rendezvue there and request a new code in that browser.'",
      "'account.callbackPending': 'The sign-in link is being processed. Open it in the same browser profile where you requested it. If that does not work, request a new link.'"
    ],
    [
      "'account.requestExisting': 'Check your inbox. If this request can be completed, you will receive a 6-digit sign-in code and an optional direct sign-in link. Also check spam.'",
      "'account.requestExisting': 'Check your inbox. If this request can be completed, you will receive a one-time sign-in link. Also check spam.'"
    ],
    [
      "'account.requestRegistration': 'Check your inbox. If registration is possible, you will receive a 6-digit code to open the new account.'",
      "'account.requestRegistration': 'Check your inbox. If registration is possible, you will receive a one-time sign-in link to open the new account.'"
    ]
  ]);
  for (const [before, after] of replacements) {
    if (!builtCopy.includes(before)) {
      throw new Error(`WP-075 blocked-mode copy source changed before safe artifact adaptation: ${before.slice(0, 72)}`);
    }
    builtCopy = builtCopy.replace(before, after);
  }
  await writeFile(accountCopyPath, builtCopy, 'utf8');
}

await writeFile(deploymentPath, `${JSON.stringify({
  ...deployment,
  passwordlessPrimary: hostedDeliveryReady ? 'email-otp' : 'pkce-magic-link',
  magicLinkConvenienceRetained: true,
  emailOtpImplementationPresent: true,
  emailOtpHostedDeliveryReady: hostedDeliveryReady,
  emailOtpActivationState: activation.activationState,
  crossBrowserEmailOtp: hostedDeliveryReady,
  desiredEmailOtpDigits: desiredOtpDigits,
  desiredEmailOtpExpirySeconds: desiredOtpExpirySeconds,
  emailOtpDigits: hostedDeliveryReady ? desiredOtpDigits : null,
  emailOtpExpirySeconds: hostedDeliveryReady ? desiredOtpExpirySeconds : null,
  automaticCrossBrowserSessionPropagation: false,
  passwordAuthentication: false
}, null, 2)}\n`, 'utf8');

if (branchPreview) {
  const target = resolve(dist, 'visual-acceptance');
  await mkdir(target, { recursive: true });
  await cp(
    resolve(root, 'scripts/fixtures/wp075-email-otp-acceptance.html'),
    resolve(target, 'wp075-email-otp.html')
  );
  console.log('Branch-only WP-075 visual acceptance route assembled.');
}

console.log(`WP-075 e-mail OTP implementation finalized for ${buildCommit}.`);
console.log(`WP-075 hosted OTP delivery ready: ${hostedDeliveryReady}.`);
console.log(`WP-075 active passwordless path: ${hostedDeliveryReady ? 'email-otp' : 'pkce-magic-link'}.`);
