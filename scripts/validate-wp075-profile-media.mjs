import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (path) => readFile(resolve(root, path), 'utf8');

const [index, headers, controller, gallery, model, css] = await Promise.all([
  read('dist-private-preview/index.html'),
  read('dist-private-preview/_headers'),
  read('dist-private-preview/profile-media-controller.js'),
  read('dist-private-preview/profile-media-gallery.js'),
  read('dist-private-preview/profile-media-model.js'),
  read('dist-private-preview/profile-media.css')
]);

assert.match(index, /profile-media-controller\.js\?commit=/);
assert.match(index, /profile-media-gallery\.js\?commit=/);
assert.match(headers, /Permissions-Policy: camera=\(self\), microphone=\(\), geolocation=\(\), payment=\(\)/);
assert.doesNotMatch(headers, /Permissions-Policy: camera=\(\),/);
assert.match(controller, /recordChallenge\(video/);
assert.match(controller, /slot:\s*'live_selfie',\s*captureOrigin:\s*'live_camera'/s);
assert.match(controller, /profile_photo_1/);
assert.match(controller, /profile_photo_2/);
assert.match(controller, /assign_prepared_profile_media/);
assert.match(controller, /set_primary_profile_media/);
assert.match(gallery, /get_discovery_profile_media/);
assert.match(gallery, /Live selfie/);
assert.match(gallery, /profileMediaTrustCopy/);
assert.match(model, /legal identity verification|wettelijke identiteitsverificatie/);
assert.match(model, /'live_selfie'/);
assert.match(model, /'profile_photo_1'/);
assert.match(model, /'profile_photo_2'/);
assert.match(css, /\.rv-profile-media-tray/);
assert.match(css, /\.rv-profile-media-dialog/);

console.log('WP076 profile-media Cloudflare artifact contract passed.');
