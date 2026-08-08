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

for (const path of [deploymentPath, indexPath, controllerPath, cssPath]) {
  await access(path, constants.R_OK);
  const info = await stat(path);
  if (!info.isFile() || info.size < 80) throw new Error(`WP-075 artifact input is missing or too small: ${path}`);
}

const deployment = JSON.parse(await readFile(deploymentPath, 'utf8'));
if (deployment.realUserAdmissionAuthorized !== false) {
  throw new Error('WP-075 may not authorize real-user admission');
}
const buildCommit = String(deployment.buildCommit ?? '').trim();
if (!buildCommit) throw new Error('WP-075 requires a build commit marker');

let index = await readFile(indexPath, 'utf8');
const script = `  <script type="module" src="./email-otp-controller.js?commit=${encodeURIComponent(buildCommit)}"></script>\n`;
if (!index.includes('email-otp-controller.js')) {
  index = index.replace('</body>', `${script}</body>`);
}
if (!index.includes('email-otp-controller.js')) throw new Error('WP-075 email OTP controller was not assembled');
await writeFile(indexPath, index, 'utf8');

await writeFile(deploymentPath, `${JSON.stringify({
  ...deployment,
  authFlow: 'email-otp-primary-plus-pkce-magic-link',
  crossBrowserEmailOtp: true,
  emailOtpDigits: 6,
  emailOtpExpirySeconds: 600,
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

console.log(`WP-075 email OTP artifact finalized for ${buildCommit}.`);
