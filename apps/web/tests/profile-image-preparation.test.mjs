import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROFILE_IMAGE_CONTRACT,
  cropRectForAspect,
  fittedSourceDimensions,
  inspectProfileImage,
  mergeCompletedStages,
  normaliseFraming,
  preparedObjectPaths
} from '../src/profile-image-preparation.js';

test('framing values are normalized into the supported range', () => {
  assert.deepEqual(normaliseFraming({ focalX: -2, focalY: 4, zoom: 9 }), {
    focalX: 0,
    focalY: 1,
    zoom: PROFILE_IMAGE_CONTRACT.maximumZoom
  });
  assert.deepEqual(normaliseFraming({}), {
    focalX: PROFILE_IMAGE_CONTRACT.defaultFocalX,
    focalY: PROFILE_IMAGE_CONTRACT.defaultFocalY,
    zoom: 1
  });
});

test('portrait, landscape and low-resolution sources receive useful warnings', () => {
  const portrait = inspectProfileImage({ width: 1200, height: 1600, size: 500_000, type: 'image/jpeg' });
  assert.equal(portrait.canPrepare, true);
  assert.deepEqual(portrait.warnings, []);

  const landscape = inspectProfileImage({ width: 1800, height: 900, size: 500_000, type: 'image/png' });
  assert.equal(landscape.canPrepare, true);
  assert.equal(landscape.warnings.includes('landscape-source'), true);
  assert.equal(landscape.safeFallbackRecommended, true);

  const small = inspectProfileImage({ width: 320, height: 480, size: 80_000, type: 'image/webp' });
  assert.equal(small.warnings.includes('low-resolution'), true);
});

test('unsupported or oversized sources fail closed', () => {
  assert.equal(inspectProfileImage({ width: 1200, height: 1600, type: 'image/gif' }).canPrepare, false);
  assert.equal(inspectProfileImage({
    width: 1200,
    height: 1600,
    type: 'image/jpeg',
    size: PROFILE_IMAGE_CONTRACT.maximumSourceBytes + 1
  }).canPrepare, false);
});

test('4:5 crop uses focal point while remaining inside a landscape source', () => {
  const crop = cropRectForAspect({
    sourceWidth: 2000,
    sourceHeight: 1000,
    targetWidth: 960,
    targetHeight: 1200,
    framing: { focalX: 0.9, focalY: 0.5, zoom: 1 }
  });
  assert.equal(Math.round(crop.width), 800);
  assert.equal(Math.round(crop.height), 1000);
  assert.equal(Math.round(crop.x), 1200);
  assert.equal(Math.round(crop.y), 0);
});

test('zoom tightens the crop without allowing it beyond source bounds', () => {
  const crop = cropRectForAspect({
    sourceWidth: 1000,
    sourceHeight: 1500,
    targetWidth: 960,
    targetHeight: 1200,
    framing: { focalX: 0, focalY: 0, zoom: 2 }
  });
  assert.equal(crop.x, 0);
  assert.equal(crop.y, 0);
  assert.equal(Math.round(crop.width), 500);
  assert.equal(Math.round(crop.height), 625);
});

test('normalized source dimensions retain aspect ratio and cap the longest edge', () => {
  assert.deepEqual(fittedSourceDimensions(4000, 3000), { width: 2048, height: 1536 });
  assert.deepEqual(fittedSourceDimensions(800, 600), { width: 800, height: 600 });
});

test('prepared paths are deterministic and scoped to the authenticated account', () => {
  const userId = '11111111-2222-4333-8444-555555555555';
  const preparationId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
  assert.deepEqual(preparedObjectPaths(userId, preparationId), {
    source: `${userId}/prepared/${preparationId}/source.webp`,
    card: `${userId}/prepared/${preparationId}/card-4x5.webp`,
    avatar: `${userId}/prepared/${preparationId}/avatar-square.webp`
  });
  assert.throws(() => preparedObjectPaths('not-a-user', preparationId), /UUID/);
});

test('portrait completion merges without erasing existing onboarding stages', () => {
  assert.deepEqual(mergeCompletedStages(['eligibility', 'identity', 'portrait']), ['eligibility', 'identity', 'portrait']);
  assert.deepEqual(mergeCompletedStages(['eligibility']), ['eligibility', 'portrait']);
});
