// WP-076 staging camera adapter. Mirrors the reusable camera contract used by the concept app.
let activeStream = null;
let activeRecorder = null;
let activeVideoElement = null;
let recordingTimer = null;
let cameraSession = 0;

export function cameraSupported() {
  return Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
}

export async function startCamera(videoElement) {
  stopCamera();
  cameraSession += 1;
  activeStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 900 } },
    audio: false
  });
  activeVideoElement = videoElement;
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

  const session = cameraSession;
  const localChunks = [];
  const mimeType = chooseMimeType();
  const recorder = new MediaRecorder(activeStream, mimeType ? { mimeType } : undefined);
  activeRecorder = recorder;

  const recordingPromise = new Promise((resolve, reject) => {
    recorder.addEventListener('dataavailable', (event) => { if (event.data.size > 0) localChunks.push(event.data); });
    recorder.addEventListener('error', () => reject(new Error('The browser could not record this camera stream.')));
    recorder.addEventListener('stop', () => {
      if (activeRecorder === recorder) activeRecorder = null;
      if (session !== cameraSession) {
        reject(new DOMException('Camera recording cancelled.', 'AbortError'));
        return;
      }
      resolve(new Blob(localChunks, { type: recorder.mimeType || 'video/webm' }));
    });
  });

  const startedAt = performance.now();
  recordingTimer = window.setInterval(() => {
    const elapsed = Math.min(durationMs, performance.now() - startedAt);
    onTick(elapsed / durationMs);
  }, 80);
  recorder.start(200);
  window.setTimeout(() => {
    if (recorder.state === 'recording') recorder.stop();
    if (recordingTimer) window.clearInterval(recordingTimer);
    recordingTimer = null;
    onTick(1);
  }, durationMs);
  return recordingPromise;
}

export function captureFrame(videoElement, size = 1000) {
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
  cameraSession += 1;
  if (recordingTimer) window.clearInterval(recordingTimer);
  recordingTimer = null;
  const recorder = activeRecorder;
  activeRecorder = null;
  if (recorder?.state === 'recording') recorder.stop();
  activeStream?.getTracks().forEach((track) => track.stop());
  activeStream = null;
  if (activeVideoElement) activeVideoElement.srcObject = null;
  activeVideoElement = null;
}
