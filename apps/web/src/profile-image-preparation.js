export const PROFILE_IMAGE_CONTRACT = Object.freeze({
  acceptedMimeTypes: Object.freeze(['image/jpeg', 'image/png', 'image/webp']),
  maximumSourceBytes: 10 * 1024 * 1024,
  sourceMaximumEdge: 2048,
  cardWidth: 960,
  cardHeight: 1200,
  avatarWidth: 384,
  avatarHeight: 384,
  minimumUsefulWidth: 640,
  minimumUsefulHeight: 640,
  defaultFocalX: 0.5,
  defaultFocalY: 0.42,
  minimumZoom: 1,
  maximumZoom: 3
});

function finiteNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, finiteNumber(value, minimum)));
}

export function normaliseFraming(value = {}) {
  return Object.freeze({
    focalX: clamp(value.focalX ?? PROFILE_IMAGE_CONTRACT.defaultFocalX, 0, 1),
    focalY: clamp(value.focalY ?? PROFILE_IMAGE_CONTRACT.defaultFocalY, 0, 1),
    zoom: clamp(
      value.zoom ?? PROFILE_IMAGE_CONTRACT.minimumZoom,
      PROFILE_IMAGE_CONTRACT.minimumZoom,
      PROFILE_IMAGE_CONTRACT.maximumZoom
    )
  });
}

export function inspectProfileImage({ width, height, size = 0, type = '' } = {}) {
  const sourceWidth = Math.max(0, Math.round(finiteNumber(width, 0)));
  const sourceHeight = Math.max(0, Math.round(finiteNumber(height, 0)));
  const sourceBytes = Math.max(0, Math.round(finiteNumber(size, 0)));
  const mimeType = String(type ?? '').toLowerCase();
  const warnings = [];

  if (!PROFILE_IMAGE_CONTRACT.acceptedMimeTypes.includes(mimeType)) warnings.push('unsupported-type');
  if (sourceBytes > PROFILE_IMAGE_CONTRACT.maximumSourceBytes) warnings.push('file-too-large');
  if (sourceWidth < PROFILE_IMAGE_CONTRACT.minimumUsefulWidth || sourceHeight < PROFILE_IMAGE_CONTRACT.minimumUsefulHeight) {
    warnings.push('low-resolution');
  }
  if (sourceWidth > 0 && sourceHeight > 0) {
    const aspect = sourceWidth / sourceHeight;
    if (aspect > 1.35) warnings.push('landscape-source');
    if (aspect < 0.52) warnings.push('very-tall-source');
  } else {
    warnings.push('unreadable-image');
  }

  return Object.freeze({
    width: sourceWidth,
    height: sourceHeight,
    size: sourceBytes,
    type: mimeType,
    warnings: Object.freeze([...new Set(warnings)]),
    canPrepare: !warnings.includes('unsupported-type') && !warnings.includes('file-too-large') && !warnings.includes('unreadable-image'),
    safeFallbackRecommended: warnings.includes('low-resolution') || warnings.includes('landscape-source') || warnings.includes('very-tall-source')
  });
}

export function cropRectForAspect({
  sourceWidth,
  sourceHeight,
  targetWidth,
  targetHeight,
  framing
}) {
  const sw = finiteNumber(sourceWidth, 0);
  const sh = finiteNumber(sourceHeight, 0);
  const tw = finiteNumber(targetWidth, 0);
  const th = finiteNumber(targetHeight, 0);
  if (sw <= 0 || sh <= 0 || tw <= 0 || th <= 0) {
    throw new TypeError('Positive source and target dimensions are required');
  }

  const { focalX, focalY, zoom } = normaliseFraming(framing);
  const sourceAspect = sw / sh;
  const targetAspect = tw / th;
  let cropWidth;
  let cropHeight;

  if (sourceAspect > targetAspect) {
    cropHeight = sh;
    cropWidth = sh * targetAspect;
  } else {
    cropWidth = sw;
    cropHeight = sw / targetAspect;
  }

  cropWidth /= zoom;
  cropHeight /= zoom;

  const centreX = focalX * sw;
  const centreY = focalY * sh;
  const x = clamp(centreX - cropWidth / 2, 0, sw - cropWidth);
  const y = clamp(centreY - cropHeight / 2, 0, sh - cropHeight);

  return Object.freeze({ x, y, width: cropWidth, height: cropHeight });
}

export function fittedSourceDimensions(width, height, maximumEdge = PROFILE_IMAGE_CONTRACT.sourceMaximumEdge) {
  const sourceWidth = finiteNumber(width, 0);
  const sourceHeight = finiteNumber(height, 0);
  const edge = finiteNumber(maximumEdge, PROFILE_IMAGE_CONTRACT.sourceMaximumEdge);
  if (sourceWidth <= 0 || sourceHeight <= 0 || edge <= 0) throw new TypeError('Positive dimensions are required');
  const scale = Math.min(1, edge / Math.max(sourceWidth, sourceHeight));
  return Object.freeze({
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale))
  });
}

export function preparedObjectPaths(userId, preparationId) {
  const user = String(userId ?? '').trim();
  const preparation = String(preparationId ?? '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(user) || !/^[0-9a-f-]{36}$/i.test(preparation)) {
    throw new TypeError('Valid user and preparation UUIDs are required');
  }
  const prefix = `${user}/prepared/${preparation}`;
  return Object.freeze({
    source: `${prefix}/source.webp`,
    card: `${prefix}/card-4x5.webp`,
    avatar: `${prefix}/avatar-square.webp`
  });
}

export function mergeCompletedStages(completedStages, requiredStage = 'portrait') {
  const stages = Array.isArray(completedStages) ? completedStages : [];
  return Object.freeze([...new Set([...stages.map((value) => String(value).trim()).filter(Boolean), requiredStage])]);
}
