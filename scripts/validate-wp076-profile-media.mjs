import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const dist = resolve(root, 'dist-private-preview');

const [
  model,
  controller,
  gallery,
  css,
  index,
  headers,
  migration,
  build
] = await Promise.all([
  readFile(resolve(dist, 'profile-media-model.js'), 'utf8'),
  readFile(resolve(dist, 'profile-media-controller.js'), 'utf8'),
  readFile(resolve(dist, 'profile-media-gallery.js'), 'utf8'),
  readFile(resolve(dist, 'profile-media.css'), 'utf8'),
  readFile(resolve(dist, 'index.html'), 'utf8'),
  readFile(resolve(dist, '_headers'), 'utf8'),
  readFile(resolve(root, 'supabase/migrations/20260808100500_live_selfie_profile_media.sql'), 'utf8'),
  readFile(resolve(root, 'scripts/build-private-preview.mjs'), 'utf8')
]);

const required = [
  [model, "'live_selfie'"],
  [model, "'profile_photo_1'"],
  [model, "'profile_photo_2'"],
  [controller, "captureOrigin: 'live_camera'"],
  [controller, 'recordChallenge(video'],
  [controller, "trustTitle: 'Live selfie voor vertrouwen'"],
  [controller, "noLegalIdentity: 'Aanwezig'"],
  [controller, 'Dit is geen identiteitscontrole.'],
  [gallery, 'get_discovery_profile_media'],
  [gallery, 'discoveryPrimaryImageCount: 1'],
  [css, '.rv-profile-media-dialog'],
  [css, '.rv-profile-media-intro{display:grid'],
  [css, '.rv-profile-media-intro p{grid-column:1/-1'],
  [migration, 'live selfie required before publication'],
  [migration, 'raw_or_challenge_media_public'],
  [index, 'profile-media-controller.js'],
  [headers, 'camera=(self)'],
  [headers, 'microphone=()'],
  [build, 'assembleBranchVisualAcceptance'],
  [build, 'if (!isCloudflarePreview) return;'],
  [build, 'visual-acceptance/wp076.html']
];

for (const [source, marker] of required) {
  if (!source.includes(marker)) throw new Error(`WP076 artifact marker missing: ${marker}`);
}

if (/data-gallery-(slot|button)=["']live_selfie/.test(controller)) {
  throw new Error('WP076 live selfie must remain camera-only');
}

console.log('WP076 live-selfie/profile-media artifact validation passed.');
