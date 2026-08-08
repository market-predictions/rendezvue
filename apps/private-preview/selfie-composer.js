import { applyPrivacyFilterToCanvas } from './privacy-portrait-filters.js';

const STYLE_ID = 'rendezvue-selfie-composer-style';
const BOUNDARY = 'wp077-cohesive-selfie-composer';
const registry = globalThis.__RENDEZVUE_SELFIE_COMPOSER_REGISTRY__ ??= Object.create(null);

const copy = Object.freeze({
  nl: Object.freeze({
    title: 'Maak je live selfie',
    intro: 'Maak de foto, stel de kadrering in, kies je privacy en beoordeel het resultaat zonder van onderdeel te wisselen.',
    resultTitle: 'Jouw resultaat',
    resultEmpty: 'Kies na het maken en kadreren een privacyniveau. Het resultaat verschijnt hier direct.',
    resultHelp: 'Dit is de profielkaart die anderen straks kunnen zien. Je kunt blijven kadreren, zoomen of van privacy wisselen voordat je opslaat.',
    optionalTitle: 'Extra profielfoto’s',
    mediaTitle: 'Kies wat mensen als eerste zien',
    phaseCapture: 'Foto',
    phaseFrame: 'Kadrering',
    phasePrivacy: 'Privacy',
    phaseResult: 'Resultaat'
  }),
  en: Object.freeze({
    title: 'Create your live selfie',
    intro: 'Take the photo, set the framing, choose your privacy and review the result without leaving this task.',
    resultTitle: 'Your result',
    resultEmpty: 'After capture and framing, choose a privacy level. The result appears here immediately.',
    resultHelp: 'This is the profile card other people can see. Keep framing, zooming or changing privacy before you save.',
    optionalTitle: 'Extra profile photos',
    mediaTitle: 'Choose what people see first',
    phaseCapture: 'Photo',
    phaseFrame: 'Framing',
    phasePrivacy: 'Privacy',
    phaseResult: 'Result'
  })
});

let language = document.documentElement.lang === 'en' ? 'en' : 'nl';
let composer = null;
let resultCanvas = null;
let resultPlaceholder = null;
let scheduled = false;
let observer = null;

function text(key) { return copy[language]?.[key] ?? copy.nl[key] ?? key; }

function ensureStyle() {
  if (document.querySelector(`#${STYLE_ID}`)) return;
  const link = document.createElement('link');
  link.id = STYLE_ID;
  link.rel = 'stylesheet';
  link.href = './selfie-composer.css';
  document.head.append(link);
}

function selectedFilterId() {
  return document.querySelector('#rv-privacy-portrait-editor .rv-privacy-filter-option.selected')?.dataset.filterId ?? null;
}

function syncResult() {
  scheduled = false;
  if (!composer || !resultCanvas || !resultPlaceholder) return;
  const source = document.querySelector('#rv-privacy-card-canvas');
  const filterId = selectedFilterId();
  const ready = Boolean(source && source.width > 1 && source.height > 1 && filterId);
  resultCanvas.hidden = !ready;
  resultPlaceholder.hidden = ready;
  composer.classList.toggle('has-result', ready);
  if (!ready) return;
  resultCanvas.width = 384;
  resultCanvas.height = 480;
  applyPrivacyFilterToCanvas(resultCanvas, source, filterId);
  composer.dataset.selectedPrivacy = filterId;
}

function scheduleResultSync() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => requestAnimationFrame(syncResult));
}

function applyCopy() {
  if (!composer) return;
  composer.querySelector('[data-selfie-composer-title]').textContent = text('title');
  composer.querySelector('[data-selfie-composer-intro]').textContent = text('intro');
  composer.querySelector('[data-selfie-result-title]').textContent = text('resultTitle');
  composer.querySelector('[data-selfie-result-empty]').textContent = text('resultEmpty');
  composer.querySelector('[data-selfie-result-help]').textContent = text('resultHelp');
  composer.querySelectorAll('[data-selfie-phase]').forEach((node) => {
    node.querySelector('[data-selfie-phase-label]').textContent = text(node.dataset.selfiePhase);
  });

  const root = composer.closest('.rv-profile-media-shell');
  const optional = root?.querySelector('.rv-profile-media-step.is-optional-media h3');
  if (optional) optional.textContent = text('optionalTitle');
  const mediaHeading = root?.querySelector('.rv-profile-media-library h3');
  if (mediaHeading) mediaHeading.textContent = text('mediaTitle');
}

function createComposer() {
  const section = document.createElement('section');
  section.className = 'rv-selfie-composer';
  section.dataset.wp077Boundary = BOUNDARY;
  section.innerHTML = `
    <header class="rv-selfie-composer-head">
      <div>
        <h3 data-selfie-composer-title></h3>
        <p data-selfie-composer-intro></p>
      </div>
      <ol class="rv-selfie-phase-strip" aria-label="Selfie workflow">
        <li data-selfie-phase="phaseCapture"><span class="rv-selfie-phase-number">1</span><span data-selfie-phase-label></span></li>
        <li data-selfie-phase="phaseFrame"><span class="rv-selfie-phase-number">2</span><span data-selfie-phase-label></span></li>
        <li data-selfie-phase="phasePrivacy"><span class="rv-selfie-phase-number">3</span><span data-selfie-phase-label></span></li>
        <li data-selfie-phase="phaseResult"><span class="rv-selfie-phase-number">4</span><span data-selfie-phase-label></span></li>
      </ol>
    </header>
    <div class="rv-selfie-composer-grid">
      <div class="rv-selfie-composer-workflow" data-selfie-workflow></div>
      <aside class="rv-selfie-result" aria-live="polite">
        <div class="rv-selfie-result-head"><strong data-selfie-result-title></strong><span>4:5</span></div>
        <div class="rv-selfie-result-frame">
          <canvas data-selfie-result-canvas width="384" height="480" hidden></canvas>
          <div class="rv-selfie-result-placeholder" data-selfie-result-empty></div>
        </div>
        <p data-selfie-result-help></p>
      </aside>
    </div>`;
  return section;
}

function mount() {
  if (composer) return;
  const mediaRoot = document.querySelector('.rv-profile-media-shell');
  const form = document.querySelector('#rv-portrait-form');
  const privacyEditor = document.querySelector('#rv-privacy-portrait-editor');
  if (!mediaRoot || !form || !privacyEditor) return;
  const steps = mediaRoot.querySelector('.rv-profile-media-steps');
  const stepList = [...(steps?.querySelectorAll(':scope > .rv-profile-media-step') ?? [])];
  const liveStep = stepList[0];
  const optionalStep = stepList[1];
  const camera = mediaRoot.querySelector('[data-profile-camera]');
  const tray = mediaRoot.querySelector('[data-profile-media-tray]');
  const library = tray?.parentElement;
  if (!liveStep || !optionalStep || !camera || !library) return;

  ensureStyle();
  composer = createComposer();
  const workflow = composer.querySelector('[data-selfie-workflow]');
  liveStep.classList.add('is-live-capture');
  optionalStep.classList.add('is-optional-media');
  library.classList.add('rv-profile-media-library');

  mediaRoot.insertBefore(composer, steps);
  workflow.append(liveStep, camera, form);
  steps.replaceWith(optionalStep);
  steps?.remove();

  resultCanvas = composer.querySelector('[data-selfie-result-canvas]');
  resultPlaceholder = composer.querySelector('[data-selfie-result-empty]');
  form.classList.add('rv-selfie-editor-form');
  privacyEditor.classList.add('rv-selfie-privacy-editor');

  composer.addEventListener('click', scheduleResultSync);
  composer.addEventListener('input', scheduleResultSync);
  composer.addEventListener('pointermove', (event) => {
    if (event.buttons) scheduleResultSync();
  });
  document.querySelector('#rv-portrait-file')?.addEventListener('change', scheduleResultSync);
  globalThis.addEventListener('rendezvue:portrait-prepared', scheduleResultSync);

  applyCopy();
  scheduleResultSync();
  registry.mounted = true;
}

observer = new MutationObserver(() => {
  mount();
  if (composer) scheduleResultSync();
});
observer.observe(document.documentElement, { childList: true, subtree: true });

globalThis.addEventListener('rendezvue:language-change', (event) => {
  language = event.detail?.language === 'en' ? 'en' : 'nl';
  applyCopy();
});

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
globalThis.addEventListener('pagehide', () => observer?.disconnect(), { once: true });

globalThis.__RENDEZVUE_SELFIE_COMPOSER__ = Object.freeze({ boundary: BOUNDARY, version: 2, taskOrder: Object.freeze(['capture','frame','privacy','result','decide']) });
