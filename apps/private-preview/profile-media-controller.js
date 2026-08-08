import { supabase } from './app.js';
import { cameraSupported, startCamera, recordChallenge, captureFrame, stopCamera } from './src/camera.js';
import {
  LIVE_CAPTURE_PROOF_VERSION,
  PROFILE_MEDIA_SLOTS,
  profileMediaContext,
  profileMediaLabel,
  profileMediaTrustCopy
} from './profile-media-model.js';

const STYLE_ID = 'rendezvue-profile-media-style';
const BOUNDARY = 'wp076-live-selfie-profile-media';
const CAMERA_DURATION_MS = 4000;

const copy = Object.freeze({
  nl: Object.freeze({
    title: 'Foto’s en live selfie',
    intro: 'Eén live selfie geeft vertrouwen dat er echt iemand achter het profiel zit. Voeg daarnaast maximaal twee foto’s toe die beter laten zien wie je bent.',
    trustTitle: 'Live selfie voor vertrouwen',
    trustBody: 'Je maakt deze foto rechtstreeks met de frontcamera. Alleen de voorbereide profielversie kan zichtbaar worden; de korte opname bewaren we niet als profielmedia. Dit is geen identiteitscontrole.',
    liveTitle: '1. Maak je live selfie',
    liveBody: 'Kijk in de camera, knipper rustig en draai je hoofd licht. We leggen daarna één stil beeld vast voor je profiel.',
    liveStart: 'Camera starten',
    liveRecord: 'Start live-check',
    liveCancel: 'Camera sluiten',
    liveChallenge: 'Kijk in de camera · knipper rustig · draai je hoofd licht naar links en rechts.',
    liveReady: 'Live selfie vastgelegd. Kies nu de kadrering en het privacyniveau hieronder.',
    optionalTitle: '2. Voeg eventueel twee andere foto’s toe',
    optionalBody: 'Deze foto’s zijn voor uitstraling en persoonlijkheid. Je kunt ze direct maken of uit je fotobibliotheek kiezen.',
    optionalSlotOne: 'Een tweede beeld van jou, bijvoorbeeld andere kleding of setting.',
    optionalSlotTwo: 'Nog een aanvullend beeld als dat echt iets toevoegt aan je profiel.',
    takePhoto: 'Maak foto',
    choosePhoto: 'Kies uit foto’s',
    capture: 'Foto maken',
    closeCamera: 'Annuleren',
    mediaTitle: '3. Kies wat mensen als eerste zien',
    mediaBody: 'Discovery toont één hoofdfoto. In het volledige profiel zijn je andere foto’s én de gemarkeerde live selfie te zien.',
    emptyLive: 'Nog geen live selfie',
    emptyPhoto: 'Nog geen extra foto',
    primary: 'Hoofdfoto',
    makePrimary: 'Maak hoofdfoto',
    remove: 'Uit profiel verwijderen',
    replace: 'Vervang via de knoppen hierboven',
    preparing: 'Kies hieronder de kadrering en het privacyniveau en sla de foto daarna op.',
    assigned: 'Foto is aan je profiel toegevoegd.',
    removed: 'Foto is uit je zichtbare profiel verwijderd.',
    primaryChanged: 'Hoofdfoto aangepast.',
    liveRequired: 'Maak eerst je live selfie voordat je het profiel publiceert.',
    readyToPublish: 'Live selfie aanwezig. Je kunt je profiel publiceren wanneer de rest compleet is.',
    cameraUnsupported: 'Deze browser ondersteunt de live-camera-opname niet. Gebruik een recente mobiele browser met cameratoegang.',
    cameraDenied: 'De camera kon niet worden geopend. Controleer de cameratoestemming van je browser.',
    livePending: 'Nog nodig',
    noLegalIdentity: 'Aanwezig'
  }),
  en: Object.freeze({
    title: 'Photos and live selfie',
    intro: 'One live selfie adds confidence that a real person is behind the profile. Add up to two other photos to show more of who you are.',
    trustTitle: 'Live selfie for trust',
    trustBody: 'You take this photo directly with the front camera. Only the prepared profile version can be shown; the short recording is not stored as profile media. This is not identity verification.',
    liveTitle: '1. Take your live selfie',
    liveBody: 'Look at the camera, blink naturally and turn your head slightly. We then capture one still image for your profile.',
    liveStart: 'Start camera',
    liveRecord: 'Start live check',
    liveCancel: 'Close camera',
    liveChallenge: 'Look at the camera · blink naturally · turn your head slightly left and right.',
    liveReady: 'Live selfie captured. Now choose framing and privacy level below.',
    optionalTitle: '2. Optionally add two other photos',
    optionalBody: 'These photos are for personality and presentation. Take them now or choose them from your photo library.',
    optionalSlotOne: 'A second view of you, for example different clothing or setting.',
    optionalSlotTwo: 'One more image only if it genuinely adds something to your profile.',
    takePhoto: 'Take photo',
    choosePhoto: 'Choose from photos',
    capture: 'Take photo',
    closeCamera: 'Cancel',
    mediaTitle: '3. Choose what people see first',
    mediaBody: 'Discovery shows one primary photo. Your full profile shows the other photos and the clearly marked live selfie.',
    emptyLive: 'No live selfie yet',
    emptyPhoto: 'No extra photo yet',
    primary: 'Primary photo',
    makePrimary: 'Make primary',
    remove: 'Remove from profile',
    replace: 'Replace using the buttons above',
    preparing: 'Choose framing and privacy level below, then save the photo.',
    assigned: 'Photo added to your profile.',
    removed: 'Photo removed from your visible profile.',
    primaryChanged: 'Primary photo changed.',
    liveRequired: 'Take your live selfie before publishing your profile.',
    readyToPublish: 'Live selfie present. You can publish when the rest of your profile is complete.',
    cameraUnsupported: 'This browser does not support live camera capture. Use a recent mobile browser with camera access.',
    cameraDenied: 'The camera could not be opened. Check your browser camera permission.',
    livePending: 'Needed',
    noLegalIdentity: 'Present'
  })
});

let language = document.documentElement.lang === 'en' ? 'en' : 'nl';
let root = null;
let form = null;
let sourceInput = null;
let submit = null;
let cameraPanel = null;
let video = null;
let cameraMode = null;
let pendingContext = null;
let mediaRows = [];
let mediaUrls = new Map();
let busy = false;

function text(key) { return copy[language]?.[key] ?? copy.nl[key] ?? key; }
function unwrap(result, context) { if (result?.error) throw new Error(`${context}: ${result.error.message ?? result.error}`); return result?.data; }

function ensureStyle() {
  if (document.querySelector(`#${STYLE_ID}`)) return;
  const link = document.createElement('link');
  link.id = STYLE_ID;
  link.rel = 'stylesheet';
  link.href = './profile-media.css';
  document.head.append(link);
}

function setStatus(message, kind = '') {
  const target = root?.querySelector('[data-profile-media-status]');
  if (!target) return;
  target.textContent = message || '';
  target.className = `rv-profile-media-status ${kind}`.trim();
  target.hidden = !message;
}

function canvasFile(canvas, name) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => {
    if (!blob) return reject(new Error('Camera frame could not be encoded'));
    resolve(new File([blob], name, { type: 'image/webp', lastModified: Date.now() }));
  }, 'image/webp', 0.92));
}

function assignFileToPrivacyEditor(file, context) {
  if (!sourceInput) return;
  pendingContext = Object.freeze({
    ...profileMediaContext(context),
    previousPrimaryPreparationId: mediaRows.find((row) => row.is_primary)?.preparation_id ?? null
  });
  const transfer = new DataTransfer();
  transfer.items.add(file);
  sourceInput.files = transfer.files;
  sourceInput.dispatchEvent(new Event('change', { bubbles: true }));
  if (submit) {
    submit.hidden = false;
    submit.textContent = language === 'en' ? 'Save this profile photo' : 'Deze profielfoto opslaan';
  }
  setStatus(text('preparing'));
}

async function openCamera(mode) {
  if (!cameraSupported()) return setStatus(text('cameraUnsupported'), 'error');
  cameraMode = mode;
  cameraPanel.hidden = false;
  cameraPanel.querySelector('[data-camera-challenge]').hidden = mode !== 'live_selfie';
  cameraPanel.querySelector('[data-camera-start-record]').hidden = mode !== 'live_selfie';
  cameraPanel.querySelector('[data-camera-capture]').hidden = mode === 'live_selfie';
  cameraPanel.querySelector('[data-camera-progress]').style.width = '0%';
  try {
    await startCamera(video);
    setStatus('');
    video.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch {
    cameraPanel.hidden = true;
    cameraMode = null;
    setStatus(text('cameraDenied'), 'error');
  }
}

function closeCamera() {
  stopCamera();
  cameraMode = null;
  if (cameraPanel) cameraPanel.hidden = true;
}

async function runLiveChallenge() {
  if (busy || cameraMode !== 'live_selfie') return;
  busy = true;
  const progress = cameraPanel.querySelector('[data-camera-progress]');
  try {
    const challengeBlob = await recordChallenge(video, {
      durationMs: CAMERA_DURATION_MS,
      onTick: (ratio) => { progress.style.width = `${Math.round(ratio * 100)}%`; }
    });
    const frame = captureFrame(video, 1000);
    const file = await canvasFile(frame, `rendezvue-live-selfie-${Date.now()}.webp`);
    // Deliberately release the challenge bytes. WP-076 does not upload or publish challenge video.
    void challengeBlob.size;
    closeCamera();
    assignFileToPrivacyEditor(file, {
      slot: 'live_selfie', captureOrigin: 'live_camera', makePrimary: mediaRows.length === 0
    });
    setStatus(text('liveReady'), 'success');
  } catch (error) {
    setStatus(error?.message ?? String(error), 'error');
  } finally {
    busy = false;
  }
}

async function captureOptionalPhoto() {
  if (busy || !['profile_photo_1', 'profile_photo_2'].includes(cameraMode)) return;
  busy = true;
  try {
    const slot = cameraMode;
    const frame = captureFrame(video, 1000);
    const file = await canvasFile(frame, `rendezvue-${slot}-${Date.now()}.webp`);
    closeCamera();
    assignFileToPrivacyEditor(file, { slot, captureOrigin: 'camera', makePrimary: mediaRows.length === 0 });
  } catch (error) {
    setStatus(error?.message ?? String(error), 'error');
  } finally { busy = false; }
}

function signedUrlFor(row) { return mediaUrls.get(row.preparation_id) ?? ''; }

function renderTray() {
  const tray = root?.querySelector('[data-profile-media-tray]');
  if (!tray) return;
  tray.replaceChildren();
  for (const slot of PROFILE_MEDIA_SLOTS) {
    const row = mediaRows.find((item) => item.profile_media_slot === slot);
    const card = document.createElement('article');
    card.className = `rv-profile-media-slot${slot === 'live_selfie' ? ' is-live' : ''}${row?.is_primary ? ' is-primary' : ''}`;
    const media = document.createElement('div');
    media.className = 'rv-profile-media-slot-media';
    if (row) {
      const image = document.createElement('img'); image.alt = ''; image.src = signedUrlFor(row); media.append(image);
    } else {
      const placeholder = document.createElement('div'); placeholder.className = 'rv-profile-media-slot-placeholder';
      placeholder.textContent = slot === 'live_selfie' ? text('emptyLive') : text('emptyPhoto'); media.append(placeholder);
    }
    const head = document.createElement('div'); head.className = 'rv-profile-media-slot-head';
    const label = document.createElement('strong'); label.textContent = profileMediaLabel(language, slot); head.append(label);
    if (slot === 'live_selfie' && row) { const chip = document.createElement('span'); chip.className = 'rv-profile-media-chip'; chip.textContent = 'LIVE'; head.append(chip); }
    const actions = document.createElement('div'); actions.className = 'rv-profile-media-slot-actions';
    if (row) {
      if (row.is_primary) { const primary = document.createElement('span'); primary.className = 'rv-profile-media-chip'; primary.textContent = text('primary'); actions.append(primary); }
      else {
        const primary = document.createElement('button'); primary.type = 'button'; primary.className = 'secondary'; primary.textContent = text('makePrimary');
        primary.addEventListener('click', () => setPrimary(row.preparation_id)); actions.append(primary);
      }
      if (slot !== 'live_selfie') {
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'secondary'; remove.textContent = text('remove');
        remove.addEventListener('click', () => removeOptional(slot)); actions.append(remove);
      } else {
        const trust = document.createElement('small'); trust.textContent = text('replace'); actions.append(trust);
      }
    }
    card.append(media, head, actions); tray.append(card);
  }
  const hasLive = mediaRows.some((row) => row.profile_media_slot === 'live_selfie');
  const trustBadge = root.querySelector('[data-live-trust-badge]');
  if (trustBadge) {
    trustBadge.textContent = text(hasLive ? 'noLegalIdentity' : 'livePending');
    trustBadge.classList.toggle('is-pending', !hasLive);
  }
  const publish = document.querySelector('#rv-publish-profile');
  if (publish) publish.disabled = !hasLive;
  const hint = root.querySelector('[data-profile-publish-hint]');
  if (hint) { hint.textContent = text(hasLive ? 'readyToPublish' : 'liveRequired'); hint.classList.toggle('ready', hasLive); }
}

async function refreshMedia() {
  for (const url of mediaUrls.values()) URL.revokeObjectURL?.(url);
  mediaUrls = new Map();
  mediaRows = unwrap(await supabase.rpc('get_own_profile_media'), 'profile media load') ?? [];
  await Promise.all(mediaRows.map(async (row) => {
    const signed = unwrap(await supabase.storage.from('privacy-portraits').createSignedUrl(row.object_path, 300), 'profile media signed URL');
    if (signed?.signedUrl) mediaUrls.set(row.preparation_id, signed.signedUrl);
  }));
  renderTray();
  const primary = mediaRows.find((row) => row.is_primary);
  const primaryUrl = primary ? signedUrlFor(primary) : '';
  if (primaryUrl) {
    const target = document.querySelector('#rv-profile-preview .rv-profile-preview-media');
    if (target) { const image = document.createElement('img'); image.alt = ''; image.src = primaryUrl; target.replaceChildren(image); }
  }
  return mediaRows;
}

async function persistSchemaV2Progress() {
  const snapshot = unwrap(await supabase.rpc('load_onboarding_snapshot'), 'onboarding snapshot load');
  unwrap(await supabase.rpc('save_onboarding_progress', {
    p_current_stage: snapshot?.progress?.current_stage ?? 'portrait',
    p_completed_stages: snapshot?.progress?.completed_stages ?? [],
    p_schema_version: Math.max(2, Number(snapshot?.progress?.schema_version ?? 1))
  }), 'WP076 onboarding schema adoption');
}

async function finishAssignment(event) {
  if (!pendingContext) return;
  const context = pendingContext;
  pendingContext = null;
  try {
    unwrap(await supabase.rpc('assign_prepared_profile_media', {
      p_preparation_id: event.detail.preparationId,
      p_profile_media_slot: context.slot,
      p_capture_origin: context.captureOrigin,
      p_previous_primary_preparation_id: context.previousPrimaryPreparationId,
      p_make_primary: context.makePrimary,
      p_capture_proof_version: context.captureProofVersion
    }), 'profile media assignment');
    await persistSchemaV2Progress();
    await refreshMedia();
    if (submit) submit.hidden = true;
    setStatus(text('assigned'), 'success');
  } catch (error) {
    if (context.previousPrimaryPreparationId) {
      await supabase.rpc('set_primary_profile_media', { p_preparation_id: context.previousPrimaryPreparationId });
    }
    setStatus(error?.message ?? String(error), 'error');
  }
}

async function setPrimary(preparationId) {
  try { unwrap(await supabase.rpc('set_primary_profile_media', { p_preparation_id: preparationId }), 'primary profile media'); await refreshMedia(); setStatus(text('primaryChanged'), 'success'); }
  catch (error) { setStatus(error?.message ?? String(error), 'error'); }
}

async function removeOptional(slot) {
  try { unwrap(await supabase.rpc('remove_optional_profile_media', { p_profile_media_slot: slot }), 'optional profile media removal'); await refreshMedia(); setStatus(text('removed'), 'success'); }
  catch (error) { setStatus(error?.message ?? String(error), 'error'); }
}

function galleryInput(slot) {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/jpeg,image/png,image/webp'; input.hidden = true; input.dataset.gallerySlot = slot;
  input.addEventListener('change', () => { const file = input.files?.[0]; if (file) assignFileToPrivacyEditor(file, { slot, captureOrigin: 'gallery', makePrimary: mediaRows.length === 0 }); input.value = ''; });
  return input;
}

function markup() {
  const section = document.createElement('section');
  section.className = 'rv-profile-media-shell'; section.dataset.wp076Boundary = BOUNDARY;
  section.innerHTML = `
    <div class="rv-profile-media-intro"><div><strong data-media-copy="trustTitle"></strong><p data-media-copy="trustBody"></p></div><span class="rv-live-trust-badge" data-live-trust-badge></span></div>
    <div class="rv-profile-media-steps">
      <section class="rv-profile-media-step"><h3 data-media-copy="liveTitle"></h3><p data-media-copy="liveBody"></p><div class="rv-profile-media-actions"><button type="button" data-live-camera data-media-copy="liveStart"></button></div></section>
      <section class="rv-profile-media-step"><h3 data-media-copy="optionalTitle"></h3><p data-media-copy="optionalBody"></p><div class="rv-profile-media-add-list">
        <div class="rv-profile-media-add-row"><div><strong data-slot-label="profile_photo_1"></strong><small data-media-copy="optionalSlotOne"></small></div><div class="rv-profile-media-actions"><button type="button" class="secondary" data-camera-slot="profile_photo_1" data-media-copy="takePhoto"></button><button type="button" class="secondary" data-gallery-button="profile_photo_1" data-media-copy="choosePhoto"></button></div></div>
        <div class="rv-profile-media-add-row"><div><strong data-slot-label="profile_photo_2"></strong><small data-media-copy="optionalSlotTwo"></small></div><div class="rv-profile-media-actions"><button type="button" class="secondary" data-camera-slot="profile_photo_2" data-media-copy="takePhoto"></button><button type="button" class="secondary" data-gallery-button="profile_photo_2" data-media-copy="choosePhoto"></button></div></div>
      </div></section>
    </div>
    <div class="rv-profile-media-camera" data-profile-camera hidden><video playsinline muted></video><p data-camera-challenge data-media-copy="liveChallenge"></p><div class="rv-profile-media-progress"><span data-camera-progress></span></div><div class="rv-profile-media-camera-actions"><button type="button" data-camera-start-record data-media-copy="liveRecord"></button><button type="button" data-camera-capture data-media-copy="capture"></button><button type="button" class="secondary" data-camera-close data-media-copy="closeCamera"></button></div></div>
    <div><h3 data-media-copy="mediaTitle"></h3><p data-media-copy="mediaBody"></p><div class="rv-profile-media-tray" data-profile-media-tray></div><p class="rv-profile-media-publish-hint" data-profile-publish-hint></p></div>
    <div class="rv-profile-media-status" data-profile-media-status hidden></div>`;
  section.append(galleryInput('profile_photo_1'), galleryInput('profile_photo_2'));
  return section;
}

function applyCopy() {
  if (!root) return;
  root.querySelectorAll('[data-media-copy]').forEach((node) => { node.textContent = text(node.dataset.mediaCopy); });
  root.querySelectorAll('[data-slot-label]').forEach((node) => { node.textContent = profileMediaLabel(language, node.dataset.slotLabel); });
  const heading = form?.closest('.rv-card')?.querySelector('.rv-section-heading h2');
  const intro = form?.closest('.rv-card')?.querySelector('.rv-section-heading p');
  if (heading) { heading.removeAttribute('data-rv-i18n'); heading.textContent = text('title'); }
  if (intro) { intro.removeAttribute('data-rv-i18n'); intro.textContent = text('intro'); }
  renderTray();
}

function mount() {
  if (root || !globalThis.__RENDEZVUE_PRIVACY_PORTRAIT_FILTERS__) return;
  form = document.querySelector('#rv-portrait-form'); sourceInput = document.querySelector('#rv-portrait-file');
  if (!form || !sourceInput || form.dataset.wp074Enhanced !== 'true') return;
  ensureStyle();
  root = markup();
  form.parentElement.insertBefore(root, form);
  form.classList.add('rv-profile-media-privacy-form');
  sourceInput.closest('label')?.classList.add('rv-profile-media-source-input');
  submit = form.querySelector('button[type="submit"]'); if (submit) submit.hidden = true;
  cameraPanel = root.querySelector('[data-profile-camera]'); video = cameraPanel.querySelector('video');
  root.querySelector('[data-live-camera]').addEventListener('click', () => openCamera('live_selfie'));
  root.querySelectorAll('[data-camera-slot]').forEach((button) => button.addEventListener('click', () => openCamera(button.dataset.cameraSlot)));
  root.querySelectorAll('[data-gallery-button]').forEach((button) => button.addEventListener('click', () => root.querySelector(`[data-gallery-slot="${button.dataset.galleryButton}"]`)?.click()));
  root.querySelector('[data-camera-start-record]').addEventListener('click', runLiveChallenge);
  root.querySelector('[data-camera-capture]').addEventListener('click', captureOptionalPhoto);
  root.querySelector('[data-camera-close]').addEventListener('click', closeCamera);
  applyCopy();
  refreshMedia().catch((error) => setStatus(error.message, 'error'));
}

const observer = new MutationObserver(mount); observer.observe(document.documentElement, { childList: true, subtree: true });
globalThis.addEventListener('rendezvue:portrait-prepared', finishAssignment);
globalThis.addEventListener('rendezvue:language-change', (event) => { language = event.detail?.language === 'en' ? 'en' : 'nl'; applyCopy(); });
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
globalThis.addEventListener('pagehide', () => { observer.disconnect(); closeCamera(); for (const url of mediaUrls.values()) URL.revokeObjectURL?.(url); }, { once: true });

globalThis.__RENDEZVUE_PROFILE_MEDIA__ = Object.freeze({ boundary: BOUNDARY, version: 1, maxVisibleMedia: 3, requiredLiveSelfie: true, legalIdentityVerified: false });
