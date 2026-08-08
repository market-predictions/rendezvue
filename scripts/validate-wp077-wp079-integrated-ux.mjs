import { access, readFile, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const dist = resolve(root, 'dist-private-preview');
const read = (path) => readFile(resolve(root, path), 'utf8');
const readDist = (path) => readFile(resolve(dist, path), 'utf8');

const [
  index,
  deploymentText,
  composer,
  composerCss,
  touch,
  touchCss,
  syntheticModel,
  syntheticController,
  profileMediaModel,
  privacyController,
  finalizer,
  fixture
] = await Promise.all([
  readDist('index.html'),
  readDist('deployment.json'),
  read('apps/private-preview/selfie-composer.js'),
  read('apps/private-preview/selfie-composer.css'),
  read('apps/private-preview/mobile-touch.js'),
  read('apps/private-preview/mobile-touch.css'),
  read('apps/private-preview/synthetic-profile-media.js'),
  read('apps/private-preview/synthetic-profile-media-controller.js'),
  read('apps/private-preview/profile-media-model.js'),
  read('apps/private-preview/privacy-portrait-controller.js'),
  read('scripts/finalize-integrated-ux-artifact.mjs'),
  read('scripts/fixtures/wp077-wp079-integrated-acceptance.html')
]);
const deployment = JSON.parse(deploymentText);
const buildCommit = String(deployment.buildCommit ?? '').trim();

function requireMatch(source, pattern, message) {
  if (!pattern.test(source)) throw new Error(message);
}
function forbidMatch(source, pattern, message) {
  if (pattern.test(source)) throw new Error(message);
}

for (const file of [
  'selfie-composer.js','selfie-composer.css','mobile-touch.js','mobile-touch.css',
  'synthetic-profile-media.js','synthetic-profile-media-controller.js','synthetic-profile-media.css'
]) {
  const info = await stat(resolve(dist, file));
  if (!info.isFile() || info.size < 150) throw new Error(`Integrated UX built file is missing or too small: ${file}`);
}

for (const module of ['selfie-composer','mobile-touch','synthetic-profile-media-controller']) {
  const token = `./${module}.js?commit=${encodeURIComponent(buildCommit)}`;
  if (!index.includes(token)) throw new Error(`Integrated UX module is not commit-pinned in the built artifact: ${module}`);
}

requireMatch(composer, /taskOrder:\s*Object\.freeze\(\['capture','frame','privacy','result','decide'\]\)/, 'WP-077 task order contract is missing');
requireMatch(composer, /workflow\.append\(liveStep, camera, form\)/, 'WP-077 does not colocate capture, camera and editor');
requireMatch(composer, /steps\.replaceWith\(optionalStep\)/, 'WP-077 does not move optional media after the composer');
requireMatch(composer, /applyPrivacyFilterToCanvas\(resultCanvas, source, filterId\)/, 'WP-077 result does not use the canonical privacy filter renderer');
requireMatch(composerCss, /rv-selfie-composer-grid/, 'WP-077 composer layout CSS is missing');
requireMatch(composerCss, /grid-template-columns:minmax\(0,1\.35fr\) minmax\(15rem,\.65fr\)/, 'WP-077 desktop result adjacency is missing');
requireMatch(composerCss, /@media\(max-width:48rem\)/, 'WP-077 mobile local composition is missing');
requireMatch(privacyController, /let selectedFilterId = null;/, 'WP-074B no-default privacy selection was weakened');
requireMatch(privacyController, /if \(!selectedFilterId\) throw new Error\(text\('chooseFilter'\)\)/, 'Explicit privacy selection gate is missing');

requireMatch(touch, /preferredTargetCssPx:\s*48/, 'WP-078 preferred touch target contract is missing');
requireMatch(touch, /absoluteMinimumCssPx:\s*44/, 'WP-078 absolute touch minimum contract is missing');
requireMatch(touch, /rv-touch-range-step/, 'WP-078 range step buttons are missing');
requireMatch(touchCss, /input\[type="checkbox"\].*min-height:1\.55rem!important/s, 'WP-078 checkbox indicator reset is missing');
requireMatch(touchCss, /rv-touch-choice-row.*min-height:3\.65rem/s, 'WP-078 full-row choice target is missing');
requireMatch(touchCss, /@media \(pointer:coarse\),\(hover:none\)/, 'WP-078 coarse-pointer contract is missing');
requireMatch(touchCss, /rv-nav\{position:fixed!important/, 'WP-078 mobile bottom navigation is missing');
requireMatch(touchCss, /font-size:1rem;min-height:3\.25rem/, 'WP-078 mobile form font/target contract is missing');

const expectedNames = ['yasmin','bilal','amina','idris','maryam','samir','noura','youssef','hafsa','omar'];
for (const name of expectedNames) requireMatch(syntheticModel, new RegExp(`${name}:\\s*Object\\.freeze`), `WP-079 synthetic mapping is missing ${name}`);
requireMatch(syntheticModel, /liveSelfieEvidence:\s*false/, 'WP-079 fixture boundary incorrectly implies live-selfie evidence');
requireMatch(syntheticModel, /captureOrigin:\s*null/, 'WP-079 fixture boundary incorrectly assigns a capture origin');
requireMatch(syntheticController, /deployment\?\.audience === SYNTHETIC_AUDIENCE/, 'WP-079 is not gated to the synthetic deployment audience');
requireMatch(syntheticController, /deployment\?\.realUserAdmissionAuthorized === false/, 'WP-079 is not gated on real-user admission being disabled');
requireMatch(syntheticController, /\/synthetic\/i\.test\(badge\.textContent/, 'WP-079 discovery stand-in is not restricted to synthetic-labelled cards');
requireMatch(syntheticController, /synthetic-fixture-standin/, 'WP-079 truthful stand-in provenance marker is missing');
forbidMatch(syntheticController, /captureOrigin\s*[:=]\s*['"]live_camera['"]/, 'WP-079 must never fabricate live-camera provenance');
forbidMatch(syntheticController, /captureProofVersion|blink-turn-v1/, 'WP-079 must never fabricate capture proof');
requireMatch(profileMediaModel, /slot === 'live_selfie' && origin !== 'live_camera'/, 'WP-076 live-selfie camera invariant was weakened');

if (deployment.realUserAdmissionAuthorized !== false) throw new Error('Integrated UX build unexpectedly authorizes real users');
if (deployment.audience !== 'controlled-synthetic-adult-proof-accounts') throw new Error('Integrated UX build is not a controlled synthetic audience');

requireMatch(finalizer, /branchPreview = Boolean\(branch && branch !== 'main'\)/, 'Integrated visual acceptance route is not branch-preview-only');
requireMatch(finalizer, /visual-acceptance['"], 'integrated-ux\.html'/, 'Integrated visual acceptance route is missing from finalizer');
requireMatch(fixture, /Visual acceptance zonder login/, 'Integrated visual fixture banner is missing');
requireMatch(fixture, /Mobile-first formelementen/, 'Integrated visual fixture does not show mobile form controls');
requireMatch(fixture, /Selfie composer/, 'Integrated visual fixture does not show the selfie composer');
requireMatch(fixture, /Maryam/, 'Integrated visual fixture does not show synthetic profile consistency');
forbidMatch(fixture, /runtime-config\.js|app\.js|supabase|signIn|auth-session/i, 'Integrated visual fixture must stay backend/auth-free');

const branch = String(deployment.cloudflareBranch ?? '').trim();
if (branch && branch !== 'main') {
  await access(resolve(dist, 'visual-acceptance', 'integrated-ux.html'), constants.R_OK);
  const builtFixture = await readDist('visual-acceptance/integrated-ux.html');
  forbidMatch(builtFixture, /runtime-config\.js|app\.js|supabase|signIn|auth-session/i, 'Built integrated visual fixture is not auth-free');
}

console.log('WP-077/WP-078/WP-079 integrated UX artifact validated.');
