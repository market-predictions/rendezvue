function quantize(value, steps = 6) {
  const interval = 255 / (steps - 1);
  return Math.round(value / interval) * interval;
}

export function stylizeFrame(sourceCanvas, size = 420) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(sourceCanvas, 0, 0, size, size);
  const image = context.getImageData(0, 0, size, size);
  const data = image.data;
  for (let index = 0; index < data.length; index += 4) {
    const average = (data[index] + data[index + 1] + data[index + 2]) / 3;
    data[index] = quantize(data[index] * 1.08 + average * 0.04);
    data[index + 1] = quantize(data[index + 1] * 0.98 + average * 0.02);
    data[index + 2] = quantize(data[index + 2] * 1.02 + 12);
  }
  context.putImageData(image, 0, 0);
  const wash = context.createLinearGradient(0, 0, size, size);
  wash.addColorStop(0, 'rgba(255, 221, 211, 0.28)');
  wash.addColorStop(0.55, 'rgba(120, 52, 92, 0.08)');
  wash.addColorStop(1, 'rgba(61, 39, 76, 0.22)');
  context.globalCompositeOperation = 'soft-light';
  context.fillStyle = wash;
  context.fillRect(0, 0, size, size);
  context.globalCompositeOperation = 'source-over';
  context.strokeStyle = 'rgba(255,255,255,.55)';
  context.lineWidth = 8;
  context.strokeRect(5, 5, size - 10, size - 10);
  return canvas.toDataURL('image/jpeg', 0.84);
}

export function createFallbackAvatar() {
  const canvas = document.createElement('canvas');
  canvas.width = 420;
  canvas.height = 420;
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, 420, 420);
  gradient.addColorStop(0, '#f5c7cd');
  gradient.addColorStop(1, '#6d3158');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 420, 420);
  context.fillStyle = '#d89b77';
  context.beginPath();
  context.arc(210, 180, 92, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#38222f';
  context.beginPath();
  context.arc(210, 145, 100, Math.PI, Math.PI * 2);
  context.fill();
  context.fillStyle = '#fff';
  context.globalAlpha = 0.14;
  context.beginPath();
  context.arc(330, 75, 60, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;
  return canvas.toDataURL('image/jpeg', 0.84);
}
