import { supabase } from './app.js';
import {
  PROFILE_IMAGE_CONTRACT,
  clamp,
  cropRectForAspect,
  fittedSourceDimensions,
  inspectProfileImage,
  mergeCompletedStages,
  normaliseFraming,
  preparedObjectPaths
} from './src/profile-image-preparation.js';
import {
  PRIVACY_PORTRAIT_FILTERS,
  applyPrivacyFilterToCanvas,
  requirePrivacyFilterId
} from './privacy-portrait-filters.js';

const BOUNDARY = 'wp074-privacy-portrait-filters';
const STYLE_ID = 'rendezvue-privacy-portrait-filters-style';
const copy = Object.freeze({
  nl: Object.freeze({
    outerIntro: 'Gebruik uitsluitend een synthetische afbeelding in deze test. Na het kadreren kies je hoe herkenbaar je profielbeeld mag zijn; de originele bron blijft privé.',
    title: 'Bepaal de kadrering',
    intro: 'Sleep de foto en zoom totdat gezicht, kin en schouders prettig in beeld staan.',
    zoom: 'Zoom', reset: 'Kadrering herstellen', card: 'Profielkaart 4:5', avatar: 'Avatar vierkant',
    safe: 'Houd gezicht en kin binnen het veilige gebied.', privacyTitle: 'Kies je privacyniveau',
    privacyIntro: 'De originele bron blijft privé. Alleen de gekozen profielkaart en avatar worden gedeeld; Zonder filter betekent geen vervaging van deze afgeleiden.',
    recommended: 'Aanbevolen', save: 'Profielbeeld opslaan', choose: 'Kies eerst een afbeelding.',
    chooseFilter: 'Kies eerst een privacyniveau.', preparing: 'Je profielbeeld wordt veilig voorbereid…',
    prepared: 'Je gekozen profielbeeld is voorbereid en privé opgeslagen.',
    unsupported: 'Gebruik een JPEG-, PNG- of WebP-afbeelding.', tooLarge: 'De afbeelding mag maximaal 10 MB zijn.',
    unreadable: 'Deze afbeelding kon niet worden gelezen.', lowResolution: 'Deze afbeelding heeft een lage resolutie.',
    landscape: 'Dit is een liggende afbeelding. Controleer de 4:5-kadrering extra goed.',
    veryTall: 'Dit is een zeer smalle afbeelding. Controleer of gezicht en schouders zichtbaar blijven.',
    unfilteredTitle: 'Zonder filter', unfilteredDescription: 'Geen vervaging. Je gekadreerde profielkaart en avatar blijven herkenbaar; de originele upload blijft privé.',
    naturalTitle: 'Natural', naturalDescription: 'Zeer lichte verzachting, dicht bij een normale foto.',
    softFocusTitle: 'Soft private', softFocusDescription: 'Lichte privacyfilter; nog goed herkenbaar.',
    warmVeilTitle: 'Balanced', warmVeilDescription: 'Meer afscherming met behoud van een bruikbaar en herkenbaar profielbeeld.'
  }),
  en: Object.freeze({
    outerIntro: 'Use a synthetic image only in this test. After framing, choose how recognisable your profile image may be; the original source stays private.',
    title: 'Set the framing', intro: 'Drag and zoom until the face, chin and shoulders sit comfortably in frame.',
    zoom: 'Zoom', reset: 'Reset framing', card: '4:5 profile card', avatar: 'Square avatar',
    safe: 'Keep the face and chin inside the safe area.', privacyTitle: 'Choose your privacy level',
    privacyIntro: 'The original source stays private. Only the selected profile card and avatar are shared; Unfiltered means these derivatives are not blurred.',
    recommended: 'Recommended', save: 'Save profile image', choose: 'Choose an image first.',
    chooseFilter: 'Choose a privacy level first.', preparing: 'Preparing your profile image safely…',
    prepared: 'Your selected profile image has been prepared and stored privately.',
    unsupported: 'Use a JPEG, PNG or WebP image.', tooLarge: 'The image may not exceed 10 MB.',
    unreadable: 'This image could not be read.', lowResolution: 'This image has a low resolution.',
    landscape: 'This is a landscape image. Check the 4:5 framing carefully.',
    veryTall: 'This is a very narrow image. Check that face and shoulders remain visible.',
    unfilteredTitle: 'Unfiltered', unfilteredDescription: 'No obscuring filter. Your framed profile card and avatar stay recognisable; the original upload stays private.',
    naturalTitle: 'Natural', naturalDescription: 'Very light softening, close to a regular photo.',
    softFocusTitle: 'Soft private', softFocusDescription: 'A light privacy filter while remaining clearly recognisable.',
    warmVeilTitle: 'Balanced', warmVeilDescription: 'More privacy while keeping the profile image usable and recognisable.'
  })
});

if (!document.querySelector(`#${STYLE_ID}`)) {
  const link = document.createElement('link');
  link.id = STYLE_ID;
  link.rel = 'stylesheet';
  link.href = './privacy-portrait-filters.css';
  document.head.append(link);
}

globalThis.__RENDEZVUE_PRIVACY_PORTRAIT_FILTERS__ = Object.freeze({
  boundary: BOUNDARY,
  version: 2,
  mandatoryFilterSelection: true,
  publicRawPortraitAllowed: false,
  publicUnfilteredDerivativeAllowed: true,
  filterIds: Object.freeze(PRIVACY_PORTRAIT_FILTERS.map(({ id }) => id))
});

let language = document.documentElement.lang === 'en' ? 'en' : 'nl';
let form;
let input;
let root;
let cardCanvas;
let avatarCanvas;
let zoomInput;
let warnings;
let submit;
let filterButtons = [];
let sourceImage = null;
let sourceFile = null;
let inspection = null;
let framing = normaliseFraming();
let selectedFilterId = null;
let dragState = null;
let preparedCardUrl = null;
let busy = false;

const text = (key) => copy[language]?.[key] ?? copy.nl[key] ?? key;
const unwrap = (result, operation) => {
  if (result?.error) throw new Error(`${operation}: ${result.error.message ?? 'unknown error'}`);
  return result?.data ?? null;
};

function setStatus(message, kind = 'info') {
  const target = document.querySelector('#rv-portrait-status');
  if (!target) return;
  target.textContent = message;
  target.hidden = !message;
  target.className = `rv-status ${kind}`;
}

function updateCopy() {
  if (!root) return;
  for (const element of root.querySelectorAll('[data-privacy-copy]')) {
    element.textContent = text(element.dataset.privacyCopy);
  }
  const outer = document.querySelector('[data-rv-i18n="portrait.intro"]');
  if (outer) outer.textContent = text('outerIntro');
  if (submit) submit.textContent = text('save');
  renderSelection();
}

async function decodeImage(file) {
  if ('createImageBitmap' in globalThis) {
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); }
    catch { return await createImageBitmap(file); }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    await image.decode();
    return image;
  } finally { URL.revokeObjectURL(url); }
}

function closeSource() {
  if (typeof sourceImage?.close === 'function') sourceImage.close();
  sourceImage = null;
}

function dimensions() {
  return {
    width: Number(sourceImage?.width ?? sourceImage?.naturalWidth ?? 0),
    height: Number(sourceImage?.height ?? sourceImage?.naturalHeight ?? 0)
  };
}

function drawCrop(canvas, width, height) {
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { alpha: false });
  context.fillStyle = '#e8e0d8';
  context.fillRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  const source = dimensions();
  const crop = cropRectForAspect({ sourceWidth: source.width, sourceHeight: source.height, targetWidth: width, targetHeight: height, framing });
  context.drawImage(sourceImage, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
}

function drawFullSource(canvas) {
  const source = dimensions();
  const fitted = fittedSourceDimensions(source.width, source.height);
  canvas.width = fitted.width;
  canvas.height = fitted.height;
  const context = canvas.getContext('2d', { alpha: false });
  context.fillStyle = '#fff';
  context.fillRect(0, 0, fitted.width, fitted.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(sourceImage, 0, 0, fitted.width, fitted.height);
}

function renderSelection() {
  for (const button of filterButtons) {
    const selected = button.dataset.filterId === selectedFilterId;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
  if (submit) submit.disabled = busy || !sourceImage || !selectedFilterId;
}

function renderVariants() {
  if (!sourceImage) return;
  for (const button of filterButtons) {
    applyPrivacyFilterToCanvas(button.querySelector('[data-filter-card]'), cardCanvas, button.dataset.filterId);
    applyPrivacyFilterToCanvas(button.querySelector('[data-filter-avatar]'), avatarCanvas, button.dataset.filterId);
  }
  renderSelection();
}

function renderEditor() {
  if (!sourceImage) return;
  drawCrop(cardCanvas, 480, 600);
  drawCrop(avatarCanvas, 384, 384);
  zoomInput.value = String(framing.zoom);
  root.hidden = false;
  renderVariants();
}

function renderWarnings() {
  warnings.replaceChildren();
  const messages = {
    'low-resolution': text('lowResolution'),
    'landscape-source': text('landscape'),
    'very-tall-source': text('veryTall')
  };
  for (const code of inspection?.warnings ?? []) {
    if (!messages[code]) continue;
    const item = document.createElement('li');
    item.textContent = messages[code];
    warnings.append(item);
  }
  warnings.hidden = !warnings.children.length;
}

async function selectFile(file) {
  closeSource();
  sourceFile = file ?? null;
  selectedFilterId = null;
  inspection = inspectProfileImage({ size: file?.size, type: file?.type });
  if (!file) { root.hidden = true; renderSelection(); return; }
  if (inspection.warnings.includes('unsupported-type')) throw new Error(text('unsupported'));
  if (inspection.warnings.includes('file-too-large')) throw new Error(text('tooLarge'));
  sourceImage = await decodeImage(file);
  const source = dimensions();
  inspection = inspectProfileImage({ width: source.width, height: source.height, size: file.size, type: file.type });
  if (!inspection.canPrepare) throw new Error(text('unreadable'));
  framing = normaliseFraming({ focalX: 0.5, focalY: source.height >= source.width ? 0.42 : 0.5, zoom: 1 });
  renderWarnings();
  renderEditor();
  setStatus('');
}

const canvasBlob = (canvas, quality) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => blob?.type === 'image/webp' ? resolve(blob) : reject(new Error('WebP portrait creation is unavailable')), 'image/webp', quality);
});

async function derivatives() {
  const filterId = requirePrivacyFilterId(selectedFilterId);
  const sourceCanvas = document.createElement('canvas');
  const rawCard = document.createElement('canvas');
  const rawAvatar = document.createElement('canvas');
  const card = document.createElement('canvas');
  const avatar = document.createElement('canvas');
  drawFullSource(sourceCanvas);
  drawCrop(rawCard, PROFILE_IMAGE_CONTRACT.cardWidth, PROFILE_IMAGE_CONTRACT.cardHeight);
  drawCrop(rawAvatar, PROFILE_IMAGE_CONTRACT.avatarWidth, PROFILE_IMAGE_CONTRACT.avatarHeight);
  card.width = PROFILE_IMAGE_CONTRACT.cardWidth;
  card.height = PROFILE_IMAGE_CONTRACT.cardHeight;
  avatar.width = PROFILE_IMAGE_CONTRACT.avatarWidth;
  avatar.height = PROFILE_IMAGE_CONTRACT.avatarHeight;
  applyPrivacyFilterToCanvas(card, rawCard, filterId);
  applyPrivacyFilterToCanvas(avatar, rawAvatar, filterId);
  const [source, cardBlob, avatarBlob] = await Promise.all([
    canvasBlob(sourceCanvas, 0.92), canvasBlob(card, 0.88), canvasBlob(avatar, 0.86)
  ]);
  return Object.freeze({ source, card: cardBlob, avatar: avatarBlob, filterId });
}

function applyPreview(blob) {
  if (preparedCardUrl) URL.revokeObjectURL(preparedCardUrl);
  preparedCardUrl = URL.createObjectURL(blob);
  for (const container of [document.querySelector('#rv-portrait-preview'), document.querySelector('#rv-profile-preview .rv-profile-preview-media')]) {
    if (!container) continue;
    const image = document.createElement('img');
    image.src = preparedCardUrl;
    image.alt = '';
    image.style.cssText = 'width:100%;height:100%;object-fit:contain;position:relative;z-index:1';
    container.replaceChildren(image);
  }
}

async function upload() {
  if (busy) return;
  if (!sourceFile || !sourceImage || !inspection?.canPrepare) throw new Error(text('choose'));
  if (!selectedFilterId) throw new Error(text('chooseFilter'));
  busy = true;
  renderSelection();
  setStatus(text('preparing'));
  const uploaded = [];
  try {
    const current = unwrap(await supabase.auth.getUser(), 'current user lookup');
    const userId = current?.user?.id;
    if (!userId) throw new Error('Authentication required');
    const preparationId = crypto.randomUUID();
    const paths = preparedObjectPaths(userId, preparationId);
    const output = await derivatives();
    const bucket = supabase.storage.from('privacy-portraits');
    for (const [role, path] of Object.entries(paths)) {
      unwrap(await bucket.upload(path, output[role], { cacheControl: '3600', contentType: 'image/webp', upsert: false }), `${role} portrait upload`);
      uploaded.push(path);
    }
    const source = dimensions();
    unwrap(await supabase.rpc('register_prepared_portrait', {
      p_preparation_id: preparationId,
      p_source_object_path: paths.source,
      p_card_object_path: paths.card,
      p_avatar_object_path: paths.avatar,
      p_focal_x: framing.focalX,
      p_focal_y: framing.focalY,
      p_zoom: framing.zoom,
      p_source_width: Math.round(source.width),
      p_source_height: Math.round(source.height),
      p_privacy_filter_id: output.filterId,
      p_quality_flags: inspection.warnings
    }), 'privacy portrait registration');
    const snapshot = unwrap(await supabase.rpc('load_onboarding_snapshot'), 'onboarding snapshot load');
    unwrap(await supabase.rpc('save_onboarding_progress', {
      p_current_stage: 'preview',
      p_completed_stages: mergeCompletedStages(snapshot?.progress?.completed_stages, 'portrait'),
      p_schema_version: Number(snapshot?.progress?.schema_version ?? 1)
    }), 'portrait progress save');
    applyPreview(output.card);
    globalThis.dispatchEvent(new CustomEvent('rendezvue:portrait-prepared', { detail: Object.freeze({ preparationId, privacyFilterId: output.filterId, framing }) }));
    setStatus(text('prepared'), 'success');
  } catch (error) {
    if (uploaded.length) await supabase.storage.from('privacy-portraits').remove(uploaded);
    setStatus(error?.message ?? String(error), 'error');
    throw error;
  } finally {
    busy = false;
    renderSelection();
  }
}

function filterMarkup() {
  return PRIVACY_PORTRAIT_FILTERS.map(({ id, recommended }) => `
    <button type="button" class="rv-privacy-filter-option" data-filter-id="${id}" aria-pressed="false">
      ${recommended ? '<span class="rv-privacy-filter-recommended" data-privacy-copy="recommended"></span>' : ''}
      <span class="rv-privacy-filter-previews" aria-hidden="true"><canvas data-filter-card width="192" height="240"></canvas><canvas data-filter-avatar width="112" height="112"></canvas></span>
      <strong data-privacy-copy="${id}Title"></strong><span data-privacy-copy="${id}Description"></span>
    </button>`).join('');
}

function mount() {
  form = document.querySelector('#rv-portrait-form');
  input = document.querySelector('#rv-portrait-file');
  if (!form || !input || form.dataset.wp074Enhanced === 'true') return;
  document.querySelector('#rv-image-preparation-editor')?.remove();
  form.dataset.wp069bEnhanced = 'true';
  form.dataset.wp074Enhanced = 'true';
  root = document.createElement('section');
  root.id = 'rv-privacy-portrait-editor';
  root.className = 'rv-image-preparation';
  root.dataset.wp074Boundary = BOUNDARY;
  root.hidden = true;
  root.innerHTML = `
    <div class="rv-image-preparation-heading"><h3 data-privacy-copy="title"></h3><p data-privacy-copy="intro"></p></div>
    <div class="rv-image-preparation-layout">
      <div><p class="rv-image-preview-label" data-privacy-copy="card"></p><div class="rv-image-frame rv-image-frame-card"><canvas id="rv-privacy-card-canvas"></canvas><span class="rv-image-safe-area" aria-hidden="true"></span></div><p class="rv-image-safe-copy" data-privacy-copy="safe"></p></div>
      <div><p class="rv-image-preview-label" data-privacy-copy="avatar"></p><div class="rv-image-frame rv-image-frame-avatar"><canvas id="rv-privacy-avatar-canvas"></canvas></div></div>
    </div>
    <label class="rv-image-zoom"><span data-privacy-copy="zoom"></span><input id="rv-privacy-zoom" type="range" min="1" max="3" step="0.01" value="1"></label>
    <button id="rv-privacy-reset" class="secondary" type="button" data-privacy-copy="reset"></button>
    <section class="rv-privacy-filter-picker" aria-labelledby="rv-privacy-filter-title"><div class="rv-privacy-filter-heading"><h4 id="rv-privacy-filter-title" data-privacy-copy="privacyTitle"></h4><p data-privacy-copy="privacyIntro"></p></div><div class="rv-privacy-filter-grid">${filterMarkup()}</div></section>
    <ul id="rv-privacy-warnings" class="rv-image-warnings" hidden></ul>`;
  form.insertBefore(root, form.querySelector('button[type="submit"]'));
  cardCanvas = root.querySelector('#rv-privacy-card-canvas');
  avatarCanvas = root.querySelector('#rv-privacy-avatar-canvas');
  zoomInput = root.querySelector('#rv-privacy-zoom');
  warnings = root.querySelector('#rv-privacy-warnings');
  submit = form.querySelector('button[type="submit"]');
  filterButtons = [...root.querySelectorAll('[data-filter-id]')];
  submit.disabled = true;
  for (const button of filterButtons) button.addEventListener('click', () => { selectedFilterId = requirePrivacyFilterId(button.dataset.filterId); renderSelection(); setStatus(''); });
  input.addEventListener('change', () => selectFile(input.files?.[0]).catch((error) => setStatus(error.message, 'error')));
  zoomInput.addEventListener('input', () => { framing = normaliseFraming({ ...framing, zoom: zoomInput.value }); renderEditor(); });
  root.querySelector('#rv-privacy-reset').addEventListener('click', () => { const source = dimensions(); framing = normaliseFraming({ focalX: 0.5, focalY: source.height >= source.width ? 0.42 : 0.5, zoom: 1 }); renderEditor(); });
  const frame = cardCanvas.parentElement;
  frame.addEventListener('pointerdown', (event) => { if (!sourceImage) return; frame.setPointerCapture(event.pointerId); dragState = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, framing }; });
  frame.addEventListener('pointermove', (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    const rect = frame.getBoundingClientRect();
    framing = normaliseFraming({
      focalX: clamp(dragState.framing.focalX - (event.clientX - dragState.x) / Math.max(1, rect.width) / dragState.framing.zoom, 0, 1),
      focalY: clamp(dragState.framing.focalY - (event.clientY - dragState.y) / Math.max(1, rect.height) / dragState.framing.zoom, 0, 1),
      zoom: dragState.framing.zoom
    });
    renderEditor();
  });
  const endDrag = (event) => { if (dragState?.pointerId === event.pointerId) dragState = null; };
  frame.addEventListener('pointerup', endDrag);
  frame.addEventListener('pointercancel', endDrag);
  updateCopy();
}

// Window capture precedes the legacy document-capture handler so every public derivative
// follows the explicitly selected presentation level, including the deliberate unfiltered option.
globalThis.addEventListener('submit', (event) => {
  if (event.target?.id !== 'rv-portrait-form') return;
  event.preventDefault();
  event.stopImmediatePropagation();
  upload().catch(() => {});
}, true);

globalThis.addEventListener('rendezvue:language-change', (event) => {
  language = event.detail?.language === 'en' ? 'en' : 'nl';
  updateCopy();
});

mount();
globalThis.addEventListener('pagehide', () => {
  closeSource();
  if (preparedCardUrl) URL.revokeObjectURL(preparedCardUrl);
}, { once: true });
