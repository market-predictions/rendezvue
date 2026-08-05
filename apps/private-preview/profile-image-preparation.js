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

const STYLE_ID = 'rendezvue-profile-image-preparation-style';
const MODULE_BOUNDARY = 'wp070-profile-image-preparation';
const copy = Object.freeze({
  nl: Object.freeze({
    title: 'Bepaal hoe je portret zichtbaar wordt',
    intro: 'Sleep de foto en zoom totdat je gezicht, kin en schouders prettig in beeld staan. Het origineel wordt niet destructief bijgesneden.',
    zoom: 'Zoom',
    reset: 'Kadrering herstellen',
    cardPreview: 'Profielkaart 4:5',
    avatarPreview: 'Avatar vierkant',
    safeArea: 'Houd gezicht en kin binnen het veilige gebied.',
    preparing: 'Afbeelding wordt veilig voorbereid…',
    prepared: 'Je portret is voorbereid en privé opgeslagen.',
    choose: 'Kies eerst een afbeelding.',
    unsupported: 'Gebruik een JPEG-, PNG- of WebP-afbeelding.',
    tooLarge: 'De afbeelding mag maximaal 10 MB zijn.',
    unreadable: 'Deze afbeelding kon niet worden gelezen.',
    lowResolution: 'Deze afbeelding heeft een lage resolutie. Het resultaat kan minder scherp zijn.',
    landscape: 'Dit is een liggende afbeelding. Controleer de 4:5-kadrering extra goed.',
    veryTall: 'Dit is een zeer smalle afbeelding. Controleer of gezicht en schouders volledig zichtbaar blijven.'
  }),
  en: Object.freeze({
    title: 'Choose how your portrait will appear',
    intro: 'Drag and zoom until your face, chin and shoulders sit comfortably in frame. The source is never destructively cropped.',
    zoom: 'Zoom',
    reset: 'Reset framing',
    cardPreview: '4:5 profile card',
    avatarPreview: 'Square avatar',
    safeArea: 'Keep the face and chin inside the safe area.',
    preparing: 'Preparing your image safely…',
    prepared: 'Your portrait has been prepared and stored privately.',
    choose: 'Choose an image first.',
    unsupported: 'Use a JPEG, PNG or WebP image.',
    tooLarge: 'The image may not exceed 10 MB.',
    unreadable: 'This image could not be read.',
    lowResolution: 'This image has a low resolution. The result may be less sharp.',
    landscape: 'This is a landscape image. Check the 4:5 framing carefully.',
    veryTall: 'This is a very narrow image. Check that the face and shoulders remain fully visible.'
  })
});

if (!document.querySelector(`#${STYLE_ID}`)) {
  const link = document.createElement('link');
  link.id = STYLE_ID;
  link.rel = 'stylesheet';
  link.href = './profile-image-preparation.css';
  document.head.append(link);
}

globalThis.__RENDEZVUE_PROFILE_IMAGE_PREPARATION__ = Object.freeze({
  boundary: MODULE_BOUNDARY,
  version: 1
});

let language = document.documentElement.lang === 'en' ? 'en' : 'nl';
let editor = null;
let preparedCardUrl = null;
let sourceImage = null;
let sourceFile = null;
let inspection = null;
let framing = normaliseFraming();
let dragState = null;
let busy = false;

function text(key) {
  return copy[language]?.[key] ?? copy.nl[key] ?? key;
}

function unwrap(result, operation) {
  if (result?.error) {
    const error = new Error(`${operation}: ${result.error.message ?? 'unknown error'}`);
    error.cause = result.error;
    throw error;
  }
  return result?.data ?? null;
}

function status(message, kind = 'info') {
  const target = document.querySelector('#rv-portrait-status');
  if (!target) return;
  target.textContent = message;
  target.hidden = !message;
  target.className = `rv-status ${kind}`;
}

function warningMessage(code) {
  return ({
    'unsupported-type': text('unsupported'),
    'file-too-large': text('tooLarge'),
    'unreadable-image': text('unreadable'),
    'low-resolution': text('lowResolution'),
    'landscape-source': text('landscape'),
    'very-tall-source': text('veryTall')
  })[code] ?? code;
}

function updateCopy() {
  if (!editor) return;
  for (const element of editor.root.querySelectorAll('[data-image-copy]')) {
    element.textContent = text(element.dataset.imageCopy);
  }
  renderWarnings();
}

async function decodeImage(file) {
  if ('createImageBitmap' in globalThis) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      return await createImageBitmap(file);
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function sourceDimensions() {
  return {
    width: Number(sourceImage?.width ?? sourceImage?.naturalWidth ?? 0),
    height: Number(sourceImage?.height ?? sourceImage?.naturalHeight ?? 0)
  };
}

function drawCrop(canvas, targetWidth, targetHeight, activeFraming = framing) {
  if (!sourceImage) return;
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext('2d', { alpha: false });
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.fillStyle = '#e8e0d8';
  context.fillRect(0, 0, targetWidth, targetHeight);
  const dimensions = sourceDimensions();
  const crop = cropRectForAspect({
    sourceWidth: dimensions.width,
    sourceHeight: dimensions.height,
    targetWidth,
    targetHeight,
    framing: activeFraming
  });
  context.drawImage(
    sourceImage,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );
}

function drawFullSource(canvas) {
  const dimensions = sourceDimensions();
  const fitted = fittedSourceDimensions(dimensions.width, dimensions.height);
  canvas.width = fitted.width;
  canvas.height = fitted.height;
  const context = canvas.getContext('2d', { alpha: false });
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.fillStyle = '#fff';
  context.fillRect(0, 0, fitted.width, fitted.height);
  context.drawImage(sourceImage, 0, 0, fitted.width, fitted.height);
}

function renderEditor() {
  if (!editor || !sourceImage) return;
  drawCrop(editor.cardCanvas, 480, 600);
  drawCrop(editor.avatarCanvas, 384, 384);
  editor.zoom.value = String(framing.zoom);
  editor.root.hidden = false;
}

function renderWarnings() {
  if (!editor) return;
  editor.warnings.replaceChildren();
  if (!inspection?.warnings?.length) {
    editor.warnings.hidden = true;
    return;
  }
  for (const code of inspection.warnings) {
    if (['unsupported-type', 'file-too-large', 'unreadable-image'].includes(code)) continue;
    const item = document.createElement('li');
    item.textContent = warningMessage(code);
    editor.warnings.append(item);
  }
  editor.warnings.hidden = !editor.warnings.children.length;
}

function closeSourceImage() {
  if (typeof sourceImage?.close === 'function') sourceImage.close();
  sourceImage = null;
}

async function handleFileSelection(file) {
  closeSourceImage();
  sourceFile = file ?? null;
  inspection = inspectProfileImage({ size: file?.size, type: file?.type });
  if (!file) {
    editor.root.hidden = true;
    status('', 'info');
    return;
  }
  if (inspection.warnings.includes('unsupported-type')) throw new Error(text('unsupported'));
  if (inspection.warnings.includes('file-too-large')) throw new Error(text('tooLarge'));

  sourceImage = await decodeImage(file);
  const dimensions = sourceDimensions();
  inspection = inspectProfileImage({
    width: dimensions.width,
    height: dimensions.height,
    size: file.size,
    type: file.type
  });
  if (!inspection.canPrepare) throw new Error(text('unreadable'));
  framing = normaliseFraming({ focalX: 0.5, focalY: dimensions.height >= dimensions.width ? 0.42 : 0.5, zoom: 1 });
  renderWarnings();
  renderEditor();
  status('', 'info');
}

function canvasBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob || blob.type !== 'image/webp') {
        reject(new Error('This browser cannot create the required WebP portrait derivative'));
        return;
      }
      resolve(blob);
    }, 'image/webp', quality);
  });
}

async function createDerivatives() {
  const sourceCanvas = document.createElement('canvas');
  const cardCanvas = document.createElement('canvas');
  const avatarCanvas = document.createElement('canvas');
  drawFullSource(sourceCanvas);
  drawCrop(cardCanvas, PROFILE_IMAGE_CONTRACT.cardWidth, PROFILE_IMAGE_CONTRACT.cardHeight);
  drawCrop(avatarCanvas, PROFILE_IMAGE_CONTRACT.avatarWidth, PROFILE_IMAGE_CONTRACT.avatarHeight);
  const [source, card, avatar] = await Promise.all([
    canvasBlob(sourceCanvas, 0.92),
    canvasBlob(cardCanvas, 0.88),
    canvasBlob(avatarCanvas, 0.86)
  ]);
  return Object.freeze({ source, card, avatar });
}

async function uploadPreparedPortrait() {
  if (busy) return;
  if (!sourceFile || !sourceImage || !inspection?.canPrepare) throw new Error(text('choose'));
  busy = true;
  const submit = editor.form.querySelector('button[type="submit"]');
  if (submit) submit.disabled = true;
  status(text('preparing'), 'info');
  const uploadedPaths = [];

  try {
    const current = unwrap(await supabase.auth.getUser(), 'current user lookup');
    const userId = current?.user?.id;
    if (!userId) throw new Error('Authentication required');
    const preparationId = crypto.randomUUID();
    const paths = preparedObjectPaths(userId, preparationId);
    const derivatives = await createDerivatives();
    const bucket = supabase.storage.from('privacy-portraits');

    for (const [role, path] of Object.entries(paths)) {
      const blob = derivatives[role];
      unwrap(await bucket.upload(path, blob, {
        cacheControl: '3600',
        contentType: 'image/webp',
        upsert: false
      }), `${role} portrait upload`);
      uploadedPaths.push(path);
    }

    const dimensions = sourceDimensions();
    unwrap(await supabase.rpc('register_prepared_portrait', {
      p_preparation_id: preparationId,
      p_source_object_path: paths.source,
      p_card_object_path: paths.card,
      p_avatar_object_path: paths.avatar,
      p_focal_x: framing.focalX,
      p_focal_y: framing.focalY,
      p_zoom: framing.zoom,
      p_source_width: Math.round(dimensions.width),
      p_source_height: Math.round(dimensions.height),
      p_quality_flags: inspection.warnings
    }), 'prepared portrait registration');

    const snapshot = unwrap(await supabase.rpc('load_onboarding_snapshot'), 'onboarding snapshot load');
    const completedStages = mergeCompletedStages(snapshot?.progress?.completed_stages, 'portrait');
    unwrap(await supabase.rpc('save_onboarding_progress', {
      p_current_stage: 'preview',
      p_completed_stages: completedStages,
      p_schema_version: Number(snapshot?.progress?.schema_version ?? 1)
    }), 'portrait progress save');

    if (preparedCardUrl) URL.revokeObjectURL(preparedCardUrl);
    preparedCardUrl = URL.createObjectURL(derivatives.card);
    applyPreparedPreview();
    globalThis.dispatchEvent(new CustomEvent('rendezvue:portrait-prepared', {
      detail: Object.freeze({
        preparationId,
        cardObjectPath: paths.card,
        avatarObjectPath: paths.avatar,
        framing,
        qualityFlags: inspection.warnings
      })
    }));
    status(text('prepared'), 'success');
  } catch (error) {
    if (uploadedPaths.length) await supabase.storage.from('privacy-portraits').remove(uploadedPaths);
    status(error?.message ?? String(error), 'error');
    throw error;
  } finally {
    busy = false;
    if (submit) submit.disabled = false;
  }
}

function setBackdrop(media, image) {
  if (!media || !image?.src) return;
  media.classList.add('rv-resilient-portrait-media');
  let backdrop = media.querySelector(':scope > .rv-resilient-portrait-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('span');
    backdrop.className = 'rv-resilient-portrait-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    media.prepend(backdrop);
  }
  backdrop.style.backgroundImage = `url(${JSON.stringify(image.currentSrc || image.src)})`;
  image.classList.add('rv-resilient-portrait-image');
}

function decoratePortraitRendering(root = document) {
  for (const image of root.querySelectorAll('.rv-discovery-media img, .rv-profile-preview-media img, #rv-portrait-preview img')) {
    setBackdrop(image.parentElement, image);
  }
}

function applyPreparedPreview() {
  if (!preparedCardUrl) return;
  const portraitPreview = document.querySelector('#rv-portrait-preview');
  if (portraitPreview) {
    const image = document.createElement('img');
    image.src = preparedCardUrl;
    image.alt = '';
    portraitPreview.replaceChildren(image);
    setBackdrop(portraitPreview, image);
  }
  const profileMedia = document.querySelector('#rv-profile-preview .rv-profile-preview-media');
  if (profileMedia) {
    const image = document.createElement('img');
    image.src = preparedCardUrl;
    image.alt = '';
    profileMedia.replaceChildren(image);
    setBackdrop(profileMedia, image);
  }
}

function editorMarkup() {
  const root = document.createElement('section');
  root.id = 'rv-image-preparation-editor';
  root.className = 'rv-image-preparation';
  root.dataset.wp070Boundary = MODULE_BOUNDARY;
  root.hidden = true;
  root.innerHTML = `
    <div class="rv-image-preparation-heading">
      <h3 data-image-copy="title"></h3>
      <p data-image-copy="intro"></p>
    </div>
    <div class="rv-image-preparation-layout">
      <div>
        <p class="rv-image-preview-label" data-image-copy="cardPreview"></p>
        <div class="rv-image-frame rv-image-frame-card">
          <canvas id="rv-image-card-canvas" aria-label="4:5 profile framing preview"></canvas>
          <span class="rv-image-safe-area" aria-hidden="true"></span>
        </div>
        <p class="rv-image-safe-copy" data-image-copy="safeArea"></p>
      </div>
      <div>
        <p class="rv-image-preview-label" data-image-copy="avatarPreview"></p>
        <div class="rv-image-frame rv-image-frame-avatar"><canvas id="rv-image-avatar-canvas" aria-label="Square avatar preview"></canvas></div>
      </div>
    </div>
    <label class="rv-image-zoom"><span data-image-copy="zoom"></span><input id="rv-image-zoom" type="range" min="1" max="3" step="0.01" value="1"></label>
    <button id="rv-image-reset" class="secondary" type="button" data-image-copy="reset"></button>
    <ul id="rv-image-warnings" class="rv-image-warnings" hidden></ul>
  `;
  return root;
}

function enhancePortraitForm() {
  const form = document.querySelector('#rv-portrait-form');
  if (!form || form.dataset.wp070Enhanced === 'true') return;
  const input = form.querySelector('#rv-portrait-file');
  if (!input) return;
  const root = editorMarkup();
  form.insertBefore(root, form.querySelector('button[type="submit"]'));
  form.dataset.wp070Enhanced = 'true';
  editor = {
    form,
    input,
    root,
    cardCanvas: root.querySelector('#rv-image-card-canvas'),
    avatarCanvas: root.querySelector('#rv-image-avatar-canvas'),
    zoom: root.querySelector('#rv-image-zoom'),
    warnings: root.querySelector('#rv-image-warnings')
  };

  input.addEventListener('change', () => handleFileSelection(input.files?.[0]).catch((error) => status(error.message, 'error')));
  editor.zoom.addEventListener('input', () => {
    framing = normaliseFraming({ ...framing, zoom: editor.zoom.value });
    renderEditor();
  });
  root.querySelector('#rv-image-reset').addEventListener('click', () => {
    const dimensions = sourceDimensions();
    framing = normaliseFraming({ focalX: 0.5, focalY: dimensions.height >= dimensions.width ? 0.42 : 0.5, zoom: 1 });
    renderEditor();
  });

  const frame = editor.cardCanvas.parentElement;
  frame.addEventListener('pointerdown', (event) => {
    if (!sourceImage) return;
    frame.setPointerCapture(event.pointerId);
    dragState = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, framing };
  });
  frame.addEventListener('pointermove', (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    const rect = frame.getBoundingClientRect();
    const dx = (event.clientX - dragState.x) / Math.max(1, rect.width);
    const dy = (event.clientY - dragState.y) / Math.max(1, rect.height);
    framing = normaliseFraming({
      focalX: clamp(dragState.framing.focalX - dx / dragState.framing.zoom, 0, 1),
      focalY: clamp(dragState.framing.focalY - dy / dragState.framing.zoom, 0, 1),
      zoom: dragState.framing.zoom
    });
    renderEditor();
  });
  const endDrag = (event) => {
    if (dragState?.pointerId === event.pointerId) dragState = null;
  };
  frame.addEventListener('pointerup', endDrag);
  frame.addEventListener('pointercancel', endDrag);
  updateCopy();
}

document.addEventListener('submit', (event) => {
  if (event.target?.id !== 'rv-portrait-form') return;
  event.preventDefault();
  event.stopImmediatePropagation();
  uploadPreparedPortrait().catch(() => {});
}, true);

globalThis.addEventListener('rendezvue:language-change', (event) => {
  language = event.detail?.language === 'en' ? 'en' : 'nl';
  updateCopy();
});

const observer = new MutationObserver((mutations) => {
  enhancePortraitForm();
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node instanceof Element) decoratePortraitRendering(node);
    }
  }
  decoratePortraitRendering();
  applyPreparedPreview();
});
observer.observe(document.documentElement, { childList: true, subtree: true });
enhancePortraitForm();
decoratePortraitRendering();

globalThis.addEventListener('pagehide', () => {
  observer.disconnect();
  closeSourceImage();
  if (preparedCardUrl) URL.revokeObjectURL(preparedCardUrl);
}, { once: true });
