export const AVATAR_FILTERS = Object.freeze([
  { id: 'softFocus', privacy: 'balanced' },
  { id: 'warmVeil', privacy: 'private' },
  { id: 'monoMist', privacy: 'private' },
  { id: 'privacyMax', privacy: 'maximum' }
]);

function fitCover(context, source, width, height, zoom = 1.14, yBias = -0.03) {
  const sourceWidth = source.width;
  const sourceHeight = source.height;
  const scale = Math.max(width / sourceWidth, height / sourceHeight) * zoom;
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2 + height * yBias;
  context.drawImage(source, x, y, drawWidth, drawHeight);
}

function filterSupported(context) {
  return typeof context.filter === 'string';
}

function downsampleBlur(source, width, height, strength) {
  const tiny = document.createElement('canvas');
  const divisor = Math.max(4, Math.min(18, Math.round(strength * 0.9)));
  tiny.width = Math.max(24, Math.round(width / divisor));
  tiny.height = Math.max(30, Math.round(height / divisor));
  const tinyContext = tiny.getContext('2d');
  tinyContext.imageSmoothingEnabled = true;
  tinyContext.imageSmoothingQuality = 'high';
  fitCover(tinyContext, source, tiny.width, tiny.height);
  return tiny;
}

function drawFiltered(context, source, width, height, {
  blur = 10,
  grayscale = 0,
  sepia = 0,
  saturate = 1,
  contrast = 1,
  brightness = 1,
  zoom = 1.14
} = {}) {
  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  if (filterSupported(context)) {
    context.filter = [
      `blur(${blur}px)`,
      `grayscale(${Math.round(grayscale * 100)}%)`,
      `sepia(${Math.round(sepia * 100)}%)`,
      `saturate(${Math.round(saturate * 100)}%)`,
      `contrast(${Math.round(contrast * 100)}%)`,
      `brightness(${Math.round(brightness * 100)}%)`
    ].join(' ');
    fitCover(context, source, width, height, zoom);
  } else {
    const blurred = downsampleBlur(source, width, height, blur);
    context.globalAlpha = 0.98;
    context.drawImage(blurred, 0, 0, width, height);
    if (grayscale > 0.45) {
      context.globalCompositeOperation = 'saturation';
      context.fillStyle = '#888';
      context.fillRect(0, 0, width, height);
    }
  }
  context.restore();
}

function addPortraitWindow(context, source, width, height, settings) {
  context.save();
  context.beginPath();
  context.ellipse(width * 0.5, height * 0.42, width * 0.29, height * 0.34, 0, 0, Math.PI * 2);
  context.clip();
  drawFiltered(context, source, width, height, settings);
  context.restore();
}

function addNeutralBackdrop(context, width, height, palette) {
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, palette[0]);
  gradient.addColorStop(0.55, palette[1]);
  gradient.addColorStop(1, palette[2]);
  context.save();
  context.globalCompositeOperation = 'soft-light';
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  context.restore();

  const vignette = context.createRadialGradient(
    width * 0.5, height * 0.42, width * 0.08,
    width * 0.5, height * 0.42, width * 0.72
  );
  vignette.addColorStop(0, 'rgba(255,255,255,.10)');
  vignette.addColorStop(0.64, 'rgba(255,255,255,0)');
  vignette.addColorStop(1, 'rgba(38,26,38,.20)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);
}

function addFrost(context, width, height, amount = 0.12) {
  context.save();
  context.fillStyle = `rgba(255, 251, 247, ${amount})`;
  context.fillRect(0, 0, width, height);
  context.globalAlpha = 0.16;
  context.fillStyle = '#ffffff';
  for (const [x, y, r] of [[0.17, 0.16, 38], [0.82, 0.24, 54], [0.78, 0.82, 34]]) {
    context.beginPath();
    context.arc(width * x, height * y, r, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function addFrame(context, width, height) {
  const margin = 9;
  context.save();
  context.strokeStyle = 'rgba(255,255,255,.70)';
  context.lineWidth = 7;
  context.beginPath();
  context.roundRect(margin, margin, width - margin * 2, height - margin * 2, 32);
  context.stroke();
  context.strokeStyle = 'rgba(83,54,76,.14)';
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(margin + 8, margin + 8, width - (margin + 8) * 2, height - (margin + 8) * 2, 26);
  context.stroke();
  context.restore();
}

const RECIPES = Object.freeze({
  softFocus: {
    base: { blur: 13, saturate: 0.88, contrast: 0.95, brightness: 1.07 },
    center: { blur: 8, saturate: 0.90, contrast: 0.96, brightness: 1.06 },
    palette: ['rgba(255,230,218,.30)', 'rgba(250,246,241,.05)', 'rgba(86,110,103,.18)'],
    frost: 0.10
  },
  warmVeil: {
    base: { blur: 15, sepia: 0.24, saturate: 0.78, contrast: 0.91, brightness: 1.08 },
    center: { blur: 10, sepia: 0.18, saturate: 0.82, contrast: 0.93, brightness: 1.07 },
    palette: ['rgba(255,218,203,.42)', 'rgba(214,158,174,.16)', 'rgba(92,68,88,.20)'],
    frost: 0.15
  },
  monoMist: {
    base: { blur: 14, grayscale: 1, saturate: 0, contrast: 0.92, brightness: 1.08 },
    center: { blur: 9, grayscale: 1, saturate: 0, contrast: 0.95, brightness: 1.07 },
    palette: ['rgba(255,255,255,.28)', 'rgba(236,232,235,.10)', 'rgba(61,52,65,.18)'],
    frost: 0.13
  },
  privacyMax: {
    base: { blur: 21, grayscale: 0.42, sepia: 0.12, saturate: 0.62, contrast: 0.84, brightness: 1.10 },
    center: { blur: 15, grayscale: 0.30, sepia: 0.10, saturate: 0.68, contrast: 0.87, brightness: 1.09 },
    palette: ['rgba(250,228,220,.50)', 'rgba(225,214,222,.28)', 'rgba(74,91,87,.26)'],
    frost: 0.24
  }
});

function renderVariant(sourceCanvas, id, width = 420, height = 520) {
  const recipe = RECIPES[id];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });

  context.fillStyle = '#f7f1ed';
  context.fillRect(0, 0, width, height);
  drawFiltered(context, sourceCanvas, width, height, recipe.base);
  addPortraitWindow(context, sourceCanvas, width, height, recipe.center);
  addNeutralBackdrop(context, width, height, recipe.palette);
  addFrost(context, width, height, recipe.frost);
  addFrame(context, width, height);

  return canvas.toDataURL('image/jpeg', 0.88);
}

export function generateAvatarVariants(sourceCanvas) {
  return AVATAR_FILTERS.map((filter) => ({
    ...filter,
    dataUrl: renderVariant(sourceCanvas, filter.id)
  }));
}

function createSyntheticSource() {
  const canvas = document.createElement('canvas');
  canvas.width = 420;
  canvas.height = 420;
  const context = canvas.getContext('2d');
  const background = context.createLinearGradient(0, 0, 420, 420);
  background.addColorStop(0, '#ead7ce');
  background.addColorStop(1, '#8fa49e');
  context.fillStyle = background;
  context.fillRect(0, 0, 420, 420);
  context.fillStyle = '#463344';
  context.beginPath();
  context.moveTo(62, 420);
  context.quadraticCurveTo(83, 286, 210, 278);
  context.quadraticCurveTo(341, 290, 360, 420);
  context.closePath();
  context.fill();
  context.fillStyle = '#c98f73';
  context.beginPath();
  context.ellipse(210, 190, 92, 112, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#342a34';
  context.beginPath();
  context.moveTo(112, 174);
  context.quadraticCurveTo(119, 60, 214, 55);
  context.quadraticCurveTo(316, 66, 316, 184);
  context.quadraticCurveTo(274, 116, 207, 116);
  context.quadraticCurveTo(147, 121, 112, 174);
  context.fill();
  context.strokeStyle = '#3b3039';
  context.lineWidth = 7;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(157, 187);
  context.quadraticCurveTo(176, 177, 194, 187);
  context.moveTo(228, 187);
  context.quadraticCurveTo(247, 177, 265, 188);
  context.stroke();
  context.fillStyle = '#2b252b';
  context.beginPath();
  context.arc(177, 205, 7, 0, Math.PI * 2);
  context.arc(246, 205, 7, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = '#8f5a54';
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(210, 210);
  context.quadraticCurveTo(197, 247, 214, 255);
  context.stroke();
  context.strokeStyle = '#8e3b55';
  context.lineWidth = 6;
  context.beginPath();
  context.moveTo(174, 278);
  context.quadraticCurveTo(210, 297, 250, 276);
  context.stroke();
  return canvas;
}

export function createFallbackAvatarVariants() {
  return generateAvatarVariants(createSyntheticSource());
}
