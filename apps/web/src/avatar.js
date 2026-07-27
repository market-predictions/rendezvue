function fitCover(context, source, width, height) {
  const sourceWidth = source.width;
  const sourceHeight = source.height;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  context.drawImage(source, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

function sampleSource(sourceCanvas, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.filter = 'blur(1.8px) contrast(1.06)';
  fitCover(context, sourceCanvas, width, height);
  context.filter = 'none';
  return canvas;
}

function luminanceData(image) {
  const gray = new Float32Array(image.width * image.height);
  for (let source = 0, target = 0; source < image.data.length; source += 4, target += 1) {
    gray[target] = image.data[source] * 0.299 + image.data[source + 1] * 0.587 + image.data[source + 2] * 0.114;
  }
  return gray;
}

function localAverage(gray, width, height, radius = 4) {
  const integralWidth = width + 1;
  const integral = new Float64Array((width + 1) * (height + 1));
  for (let y = 1; y <= height; y += 1) {
    let row = 0;
    for (let x = 1; x <= width; x += 1) {
      row += gray[(y - 1) * width + x - 1];
      integral[y * integralWidth + x] = integral[(y - 1) * integralWidth + x] + row;
    }
  }
  const average = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    const top = Math.max(0, y - radius);
    const bottom = Math.min(height - 1, y + radius);
    for (let x = 0; x < width; x += 1) {
      const left = Math.max(0, x - radius);
      const right = Math.min(width - 1, x + radius);
      const sum = integral[(bottom + 1) * integralWidth + right + 1]
        - integral[top * integralWidth + right + 1]
        - integral[(bottom + 1) * integralWidth + left]
        + integral[top * integralWidth + left];
      average[y * width + x] = sum / ((right - left + 1) * (bottom - top + 1));
    }
  }
  return average;
}

function sobelMagnitude(gray, width, height) {
  const output = new Float32Array(width * height);
  const sx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      let gx = 0;
      let gy = 0;
      let kernel = 0;
      for (let ky = -1; ky <= 1; ky += 1) {
        for (let kx = -1; kx <= 1; kx += 1) {
          const value = gray[(y + ky) * width + x + kx];
          gx += value * sx[kernel];
          gy += value * sy[kernel];
          kernel += 1;
        }
      }
      output[y * width + x] = Math.hypot(gx, gy);
    }
  }
  return output;
}

function buildInkLayer(sourceCanvas, width, height) {
  const workingWidth = 210;
  const workingHeight = Math.round(workingWidth * height / width);
  const sample = sampleSource(sourceCanvas, workingWidth, workingHeight);
  const context = sample.getContext('2d', { willReadFrequently: true });
  const image = context.getImageData(0, 0, workingWidth, workingHeight);
  const gray = luminanceData(image);
  const average = localAverage(gray, workingWidth, workingHeight, 5);
  const edges = sobelMagnitude(gray, workingWidth, workingHeight);
  const output = context.createImageData(workingWidth, workingHeight);

  for (let pixel = 0; pixel < gray.length; pixel += 1) {
    const localContrast = average[pixel] - gray[pixel];
    const edge = edges[pixel];
    const isStrongLine = edge > 92 || localContrast > 23;
    const isSoftLine = edge > 54 || localContrast > 15;
    const isFlatShadow = gray[pixel] < average[pixel] - 10 && gray[pixel] < 116;
    let tone = 250;
    if (isStrongLine) tone = 27;
    else if (isSoftLine) tone = 69;
    else if (isFlatShadow) tone = 207;
    const target = pixel * 4;
    output.data[target] = tone;
    output.data[target + 1] = tone;
    output.data[target + 2] = tone;
    output.data[target + 3] = 255;
  }

  context.putImageData(output, 0, 0);
  const enlarged = document.createElement('canvas');
  enlarged.width = width;
  enlarged.height = height;
  const enlargedContext = enlarged.getContext('2d');
  enlargedContext.imageSmoothingEnabled = true;
  enlargedContext.imageSmoothingQuality = 'high';
  enlargedContext.drawImage(sample, 0, 0, width, height);
  return enlarged;
}

function addPaperAndAccent(context, width, height) {
  const paper = context.createLinearGradient(0, 0, width, height);
  paper.addColorStop(0, '#fffdf9');
  paper.addColorStop(0.62, '#f7f2ec');
  paper.addColorStop(1, '#eee6df');
  context.globalCompositeOperation = 'destination-over';
  context.fillStyle = paper;
  context.fillRect(0, 0, width, height);
  context.globalCompositeOperation = 'source-over';

  const halo = context.createRadialGradient(width * 0.5, height * 0.38, 12, width * 0.5, height * 0.38, width * 0.58);
  halo.addColorStop(0, 'rgba(255,255,255,.18)');
  halo.addColorStop(0.72, 'rgba(255,255,255,0)');
  halo.addColorStop(1, 'rgba(111,71,89,.08)');
  context.fillStyle = halo;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = 'rgba(98,60,79,.18)';
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(12, 12, width - 24, height - 24, 34);
  context.stroke();
}

export function stylizeFrame(sourceCanvas, width = 420, height = 520) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.fillStyle = '#fbf8f4';
  context.fillRect(0, 0, width, height);

  const ink = buildInkLayer(sourceCanvas, width, height);
  context.save();
  context.globalCompositeOperation = 'multiply';
  context.globalAlpha = 0.94;
  context.filter = 'contrast(1.13)';
  context.drawImage(ink, 0, 0);
  context.restore();

  addPaperAndAccent(context, width, height);
  return canvas.toDataURL('image/jpeg', 0.9);
}

export function createFallbackAvatar() {
  const canvas = document.createElement('canvas');
  canvas.width = 420;
  canvas.height = 520;
  const context = canvas.getContext('2d');
  context.fillStyle = '#fbf8f4';
  context.fillRect(0, 0, 420, 520);
  context.strokeStyle = '#252126';
  context.fillStyle = '#252126';
  context.lineCap = 'round';
  context.lineJoin = 'round';

  context.lineWidth = 8;
  context.beginPath();
  context.moveTo(113, 201);
  context.bezierCurveTo(104, 125, 147, 78, 215, 78);
  context.bezierCurveTo(291, 78, 326, 134, 308, 220);
  context.bezierCurveTo(299, 283, 273, 342, 211, 357);
  context.bezierCurveTo(151, 341, 119, 285, 113, 201);
  context.stroke();

  context.lineWidth = 11;
  context.beginPath();
  context.moveTo(107, 191);
  context.bezierCurveTo(115, 92, 190, 49, 264, 82);
  context.bezierCurveTo(310, 103, 326, 144, 312, 202);
  context.moveTo(126, 154);
  context.bezierCurveTo(164, 112, 222, 106, 278, 139);
  context.stroke();

  context.lineWidth = 6;
  context.beginPath();
  context.moveTo(151, 224);
  context.quadraticCurveTo(174, 210, 196, 224);
  context.moveTo(226, 224);
  context.quadraticCurveTo(249, 210, 270, 224);
  context.stroke();
  context.beginPath();
  context.arc(174, 226, 5, 0, Math.PI * 2);
  context.arc(248, 226, 5, 0, Math.PI * 2);
  context.fill();

  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(211, 234);
  context.quadraticCurveTo(199, 272, 216, 282);
  context.stroke();
  context.beginPath();
  context.moveTo(177, 310);
  context.quadraticCurveTo(211, 330, 250, 307);
  context.stroke();

  context.lineWidth = 7;
  context.beginPath();
  context.moveTo(150, 350);
  context.quadraticCurveTo(141, 410, 78, 477);
  context.moveTo(273, 348);
  context.quadraticCurveTo(282, 410, 345, 477);
  context.moveTo(78, 477);
  context.quadraticCurveTo(210, 426, 345, 477);
  context.stroke();

  addPaperAndAccent(context, 420, 520);
  return canvas.toDataURL('image/jpeg', 0.9);
}
