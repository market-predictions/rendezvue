function fitCover(context, source, width, height) {
  const sourceWidth = source.width;
  const sourceHeight = source.height;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  context.drawImage(source, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

function buildEdgeLayer(sourceCanvas, width, height) {
  const sample = document.createElement('canvas');
  sample.width = Math.round(width / 2);
  sample.height = Math.round(height / 2);
  const sampleContext = sample.getContext('2d', { willReadFrequently: true });
  fitCover(sampleContext, sourceCanvas, sample.width, sample.height);
  const image = sampleContext.getImageData(0, 0, sample.width, sample.height);
  const gray = new Float32Array(sample.width * sample.height);
  for (let index = 0, pixel = 0; index < image.data.length; index += 4, pixel += 1) {
    gray[pixel] = image.data[index] * 0.299 + image.data[index + 1] * 0.587 + image.data[index + 2] * 0.114;
  }
  const edges = sampleContext.createImageData(sample.width, sample.height);
  const sx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  for (let y = 1; y < sample.height - 1; y += 1) {
    for (let x = 1; x < sample.width - 1; x += 1) {
      let gx = 0;
      let gy = 0;
      let kernel = 0;
      for (let ky = -1; ky <= 1; ky += 1) {
        for (let kx = -1; kx <= 1; kx += 1) {
          const value = gray[(y + ky) * sample.width + x + kx];
          gx += value * sx[kernel];
          gy += value * sy[kernel];
          kernel += 1;
        }
      }
      const magnitude = Math.min(255, Math.hypot(gx, gy));
      const alpha = magnitude < 56 ? 0 : Math.min(95, (magnitude - 45) * 0.72);
      const target = (y * sample.width + x) * 4;
      edges.data[target] = 42;
      edges.data[target + 1] = 27;
      edges.data[target + 2] = 41;
      edges.data[target + 3] = alpha;
    }
  }
  sampleContext.putImageData(edges, 0, 0);
  return sample;
}

function addRomanticLighting(context, width, height) {
  const wash = context.createLinearGradient(0, 0, width, height);
  wash.addColorStop(0, 'rgba(255, 226, 211, 0.34)');
  wash.addColorStop(0.5, 'rgba(246, 204, 215, 0.08)');
  wash.addColorStop(1, 'rgba(60, 80, 78, 0.24)');
  context.globalCompositeOperation = 'soft-light';
  context.fillStyle = wash;
  context.fillRect(0, 0, width, height);
  const glow = context.createRadialGradient(width * 0.68, height * 0.18, 10, width * 0.68, height * 0.18, width * 0.72);
  glow.addColorStop(0, 'rgba(255,255,255,.30)');
  glow.addColorStop(0.45, 'rgba(255,225,202,.10)');
  glow.addColorStop(1, 'rgba(80,45,70,.12)');
  context.globalCompositeOperation = 'screen';
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);
  context.globalCompositeOperation = 'source-over';
  context.fillStyle = 'rgba(255,255,255,.22)';
  for (const [x, y, radius] of [[0.15, 0.17, 20], [0.85, 0.28, 32], [0.78, 0.82, 18]]) {
    context.beginPath();
    context.arc(width * x, height * y, radius, 0, Math.PI * 2);
    context.fill();
  }
}

function addIllustratedFrame(context, width, height) {
  const margin = 10;
  context.strokeStyle = 'rgba(255,255,255,.72)';
  context.lineWidth = 7;
  context.beginPath();
  context.roundRect(margin, margin, width - margin * 2, height - margin * 2, 34);
  context.stroke();
  context.strokeStyle = 'rgba(87,54,76,.16)';
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(margin + 8, margin + 8, width - (margin + 8) * 2, height - (margin + 8) * 2, 28);
  context.stroke();
}

export function stylizeFrame(sourceCanvas, width = 420, height = 520) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.save();
  context.filter = 'blur(4px) saturate(1.14) contrast(1.06) brightness(1.05)';
  fitCover(context, sourceCanvas, width, height);
  context.restore();
  context.save();
  context.globalAlpha = 0.58;
  context.filter = 'saturate(1.08) contrast(1.04)';
  fitCover(context, sourceCanvas, width, height);
  context.restore();
  const edges = buildEdgeLayer(sourceCanvas, width, height);
  context.save();
  context.globalCompositeOperation = 'multiply';
  context.globalAlpha = 0.54;
  context.filter = 'blur(.35px)';
  context.drawImage(edges, 0, 0, width, height);
  context.restore();
  addRomanticLighting(context, width, height);
  addIllustratedFrame(context, width, height);
  return canvas.toDataURL('image/jpeg', 0.91);
}

export function createFallbackAvatar() {
  const canvas = document.createElement('canvas');
  canvas.width = 420;
  canvas.height = 520;
  const context = canvas.getContext('2d');
  const background = context.createLinearGradient(0, 0, 420, 520);
  background.addColorStop(0, '#f2d6c8');
  background.addColorStop(0.55, '#d79aa7');
  background.addColorStop(1, '#53736d');
  context.fillStyle = background;
  context.fillRect(0, 0, 420, 520);
  context.fillStyle = 'rgba(255,255,255,.22)';
  context.beginPath();
  context.arc(330, 78, 72, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(72, 435, 95, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#4c3045';
  context.beginPath();
  context.moveTo(85, 520);
  context.quadraticCurveTo(102, 346, 210, 335);
  context.quadraticCurveTo(328, 350, 342, 520);
  context.closePath();
  context.fill();
  context.fillStyle = '#d79a78';
  context.beginPath();
  context.ellipse(210, 230, 89, 106, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#3e2938';
  context.beginPath();
  context.moveTo(112, 205);
  context.quadraticCurveTo(120, 91, 214, 85);
  context.quadraticCurveTo(312, 96, 313, 219);
  context.quadraticCurveTo(280, 152, 210, 145);
  context.quadraticCurveTo(148, 151, 112, 205);
  context.fill();
  context.strokeStyle = '#4d3437';
  context.lineWidth = 6;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(157, 220);
  context.quadraticCurveTo(175, 211, 192, 220);
  context.moveTo(229, 220);
  context.quadraticCurveTo(246, 211, 263, 221);
  context.stroke();
  context.fillStyle = '#2c2528';
  context.beginPath();
  context.ellipse(176, 238, 7, 9, 0, 0, Math.PI * 2);
  context.ellipse(244, 238, 7, 9, 0, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = '#9d625c';
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(210, 245);
  context.quadraticCurveTo(198, 274, 214, 284);
  context.stroke();
  context.strokeStyle = '#9e3e5a';
  context.lineWidth = 7;
  context.beginPath();
  context.moveTo(174, 309);
  context.quadraticCurveTo(210, 334, 249, 307);
  context.stroke();
  context.fillStyle = 'rgba(236,129,137,.25)';
  context.beginPath();
  context.arc(157, 278, 14, 0, Math.PI * 2);
  context.arc(265, 278, 14, 0, Math.PI * 2);
  context.fill();
  addRomanticLighting(context, 420, 520);
  addIllustratedFrame(context, 420, 520);
  return canvas.toDataURL('image/jpeg', 0.91);
}
