export const PRIVACY_PORTRAIT_FILTERS = Object.freeze([
  Object.freeze({
    id: 'unfiltered',
    privacyRank: 1,
    recommended: false,
    blur: 0,
    pixelDivisor: 1,
    grayscale: 0,
    sepia: 0,
    saturation: 1,
    contrast: 1,
    brightness: 1,
    veil: 'rgba(0, 0, 0, 0)'
  }),
  Object.freeze({
    // Former customer-facing Soft private recipe; now the recommended Natural tier.
    id: 'softFocus',
    privacyRank: 2,
    recommended: true,
    blur: 9,
    pixelDivisor: 7,
    grayscale: 0,
    sepia: 0.04,
    saturation: 0.92,
    contrast: 0.96,
    brightness: 1.04,
    veil: 'rgba(250, 244, 238, 0.10)'
  }),
  Object.freeze({
    // Former customer-facing Balanced recipe; now Soft private.
    id: 'warmVeil',
    privacyRank: 3,
    recommended: false,
    blur: 13,
    pixelDivisor: 9,
    grayscale: 0,
    sepia: 0.16,
    saturation: 0.82,
    contrast: 0.92,
    brightness: 1.06,
    veil: 'rgba(237, 213, 203, 0.18)'
  }),
  Object.freeze({
    // Deliberately stronger than former Balanced, but materially lighter than legacy monoMist/privacyMax.
    id: 'morePrivate',
    privacyRank: 4,
    recommended: false,
    blur: 15,
    pixelDivisor: 10,
    grayscale: 0.08,
    sepia: 0.12,
    saturation: 0.76,
    contrast: 0.90,
    brightness: 1.06,
    veil: 'rgba(236, 220, 216, 0.21)'
  })
]);

export const PRIVACY_PORTRAIT_FILTER_IDS = Object.freeze(
  PRIVACY_PORTRAIT_FILTERS.map(({ id }) => id)
);

export function normalisePrivacyFilterId(value) {
  const candidate = String(value ?? '').trim();
  return PRIVACY_PORTRAIT_FILTER_IDS.includes(candidate) ? candidate : null;
}

export function requirePrivacyFilterId(value) {
  const filterId = normalisePrivacyFilterId(value);
  if (!filterId) throw new TypeError('A supported privacy portrait presentation must be selected');
  return filterId;
}

export function privacyFilterDefinition(value) {
  const filterId = requirePrivacyFilterId(value);
  return PRIVACY_PORTRAIT_FILTERS.find(({ id }) => id === filterId);
}

function drawPixelated(context, source, width, height, divisor) {
  const tiny = document.createElement('canvas');
  tiny.width = Math.max(20, Math.round(width / divisor));
  tiny.height = Math.max(20, Math.round(height / divisor));
  const tinyContext = tiny.getContext('2d', { alpha: false });
  tinyContext.imageSmoothingEnabled = true;
  tinyContext.imageSmoothingQuality = 'high';
  tinyContext.drawImage(source, 0, 0, tiny.width, tiny.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(tiny, 0, 0, width, height);
}

export function applyPrivacyFilterToCanvas(target, source, value) {
  if (!target || !source) throw new TypeError('Target and source canvases are required');
  const recipe = privacyFilterDefinition(value);
  const width = Math.max(1, Number(target.width || source.width || 1));
  const height = Math.max(1, Number(target.height || source.height || 1));
  target.width = width;
  target.height = height;
  const context = target.getContext('2d', { alpha: false });

  context.save();
  context.fillStyle = '#e8e0d8';
  context.fillRect(0, 0, width, height);

  if (recipe.id === 'unfiltered') {
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(source, 0, 0, width, height);
  } else if (typeof context.filter === 'string') {
    context.filter = [
      `blur(${recipe.blur}px)`,
      `grayscale(${Math.round(recipe.grayscale * 100)}%)`,
      `sepia(${Math.round(recipe.sepia * 100)}%)`,
      `saturate(${Math.round(recipe.saturation * 100)}%)`,
      `contrast(${Math.round(recipe.contrast * 100)}%)`,
      `brightness(${Math.round(recipe.brightness * 100)}%)`
    ].join(' ');
    const bleed = Math.max(6, recipe.blur * 1.4);
    context.drawImage(source, -bleed, -bleed, width + bleed * 2, height + bleed * 2);
    context.filter = 'none';
  } else {
    drawPixelated(context, source, width, height, recipe.pixelDivisor);
  }

  context.fillStyle = recipe.veil;
  context.fillRect(0, 0, width, height);
  context.restore();
  return target;
}
