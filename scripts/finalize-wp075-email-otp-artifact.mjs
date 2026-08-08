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
const activationPath = resolve(root, 'config/wp075-email-otp-activation.json');

for (const path of [deploymentPath, indexPath, controllerPath, cssPath, activationPath]) {
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
