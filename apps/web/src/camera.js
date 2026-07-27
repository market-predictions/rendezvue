let activeStream = null;
let activeRecorder = null;
let chunks = [];
let recordingTimer = null;

export function cameraSupported() {
  return Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
}

export async function startCamera(videoElement) {
  stopCamera();
  activeStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
    audio: false
  });
  videoElement.srcObject = activeStream;
  await videoElement.play();
  return activeStream;
}

function chooseMimeType() {
  const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
}

export async function recordChallenge(videoElement, { durationMs = 4000, onTick = () => {} } = {}) {
  if (!activeStream) await startCamera(videoElement);
  if (activeRecorder?.state === 'recording') throw new Error('A recording is already in progress.');

  chunks = [];
  const mimeType = chooseMimeType();
  activeRecorder = new MediaRecorder(activeStream, mimeType ? { mimeType } : undefined);

  const recordingPromise = new Promise((resolve, reject) => {
    activeRecorder.addEventListener('dataavailable', (event) => { if (event.data.size > 0) chunks.push(event.data); });
    activeRecorder.addEventListener('error', () => reject(new Error('The browser could not record this camera stream.')));
    activeRecorder.addEventListener('stop', () => {
      const blob = new Blob(chunks, { type: activeRecorder.mimeType || 'video/webm' });
      chunks = [];
      resolve(blob);
    });
  });

  const startedAt = performance.now();
  recordingTimer = window.setInterval(() => {
    const elapsed = Math.min(durationMs, performance.now() - startedAt);
    onTick(elapsed / durationMs);
  }, 80);

  activeRecorder.start(200);
  window.setTimeout(() => {
    if (activeRecorder?.state === 'recording') activeRecorder.stop();
    if (recordingTimer) window.clearInterval(recordingTimer);
    recordingTimer = null;
    onTick(1);
  }, durationMs);

  return recordingPromise;
}

export function captureFrame(videoElement, size = 420) {
  if (!videoElement.videoWidth || !videoElement.videoHeight) throw new Error('No camera frame is available yet.');
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const sourceSize = Math.min(videoElement.videoWidth, videoElement.videoHeight);
  const sourceX = (videoElement.videoWidth - sourceSize) / 2;
  const sourceY = (videoElement.videoHeight - sourceSize) / 2;
  context.translate(size, 0);
  context.scale(-1, 1);
  context.drawImage(videoElement, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
  return canvas;
}

export function stopCamera() {
  if (recordingTimer) window.clearInterval(recordingTimer);
  recordingTimer = null;
  if (activeRecorder?.state === 'recording') activeRecorder.stop();
  activeRecorder = null;
  chunks = [];
  activeStream?.getTracks().forEach((track) => track.stop());
  activeStream = null;
}
