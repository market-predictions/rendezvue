export const PROFILE_MEDIA_SLOTS = Object.freeze([
  'live_selfie',
  'profile_photo_1',
  'profile_photo_2'
]);

export const PROFILE_MEDIA_ORIGINS = Object.freeze([
  'live_camera',
  'camera',
  'gallery',
  'legacy'
]);

export const LIVE_CAPTURE_PROOF_VERSION = 'blink-turn-v1';

export function requireProfileMediaSlot(value) {
  const slot = String(value ?? '').trim();
  if (!PROFILE_MEDIA_SLOTS.includes(slot)) throw new TypeError('Unsupported profile media slot');
  return slot;
}

export function requireCaptureOrigin(slotValue, originValue) {
  const slot = requireProfileMediaSlot(slotValue);
  const origin = String(originValue ?? '').trim();
  if (!PROFILE_MEDIA_ORIGINS.includes(origin)) throw new TypeError('Unsupported profile media capture origin');
  if (slot === 'live_selfie' && origin !== 'live_camera') {
    throw new TypeError('The live selfie must come directly from the live camera');
  }
  if (slot !== 'live_selfie' && !['camera', 'gallery', 'legacy'].includes(origin)) {
    throw new TypeError('Profile photos must come from the camera or photo library');
  }
  return origin;
}

export function profileMediaSlotOrder(slotValue) {
  const slot = requireProfileMediaSlot(slotValue);
  return PROFILE_MEDIA_SLOTS.indexOf(slot) + 1;
}

export function isLiveSelfieSlot(slotValue) {
  return String(slotValue ?? '').trim() === 'live_selfie';
}

export function profileMediaLabel(language, slotValue) {
  const slot = requireProfileMediaSlot(slotValue);
  const en = language === 'en';
  const labels = {
    live_selfie: en ? 'Live selfie' : 'Live selfie',
    profile_photo_1: en ? 'Profile photo 1' : 'Profielfoto 1',
    profile_photo_2: en ? 'Profile photo 2' : 'Profielfoto 2'
  };
  return labels[slot];
}

export function profileMediaTrustCopy(language) {
  return language === 'en'
    ? 'Captured directly with the front camera during onboarding. This is a live-camera trust signal, not legal identity verification.'
    : 'Rechtstreeks met de frontcamera vastgelegd tijdens onboarding. Dit is een live-camera vertrouwenssignaal, geen wettelijke identiteitsverificatie.';
}

export function profileMediaContext({ slot, captureOrigin, makePrimary = false } = {}) {
  const normalizedSlot = requireProfileMediaSlot(slot);
  const normalizedOrigin = requireCaptureOrigin(normalizedSlot, captureOrigin);
  return Object.freeze({
    slot: normalizedSlot,
    captureOrigin: normalizedOrigin,
    makePrimary: Boolean(makePrimary),
    captureProofVersion: normalizedSlot === 'live_selfie' ? LIVE_CAPTURE_PROOF_VERSION : null
  });
}
