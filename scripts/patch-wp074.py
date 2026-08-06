from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


def write(path, content):
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding='utf-8')


def replace_once(path, before, after):
    source = read(path)
    count = source.count(before)
    if count != 1:
        raise RuntimeError(f'{path}: expected one marker, found {count}: {before[:100]!r}')
    write(path, source.replace(before, after, 1))


privacy_module = r'''export const PRIVACY_PORTRAIT_FILTERS = Object.freeze([
  Object.freeze({
    id: 'softFocus',
    privacyRank: 1,
    recommended: false,
    blur: 9,
    pixelDivisor: 7,
    grayscale: 0,
    sepia: 0.04,
    saturation: 0.92,
    contrast: 0.96,
    brightness: 1.04,
    veil: 'rgba(250, 244, 238, 0.10)'
  }),
  Object.freeze({
    id: 'warmVeil',
    privacyRank: 2,
    recommended: true,
    blur: 13,
    pixelDivisor: 9,
    grayscale: 0,
    sepia: 0.16,
    saturation: 0.82,
    contrast: 0.92,
    brightness: 1.06,
    veil: 'rgba(237, 213, 203, 0.18)'
  }),
  Object.freeze({
    id: 'monoMist',
    privacyRank: 3,
    recommended: false,
    blur: 17,
    pixelDivisor: 12,
    grayscale: 0.72,
    sepia: 0,
    saturation: 0.42,
    contrast: 0.88,
    brightness: 1.08,
    veil: 'rgba(239, 239, 241, 0.22)'
  }),
  Object.freeze({
    id: 'privacyMax',
    privacyRank: 4,
    recommended: false,
    blur: 24,
    pixelDivisor: 17,
    grayscale: 0.38,
    sepia: 0.08,
    saturation: 0.58,
    contrast: 0.82,
    brightness: 1.10,
    veil: 'rgba(232, 224, 226, 0.30)'
  })
]);

export const PRIVACY_PORTRAIT_FILTER_IDS = Object.freeze(
  PRIVACY_PORTRAIT_FILTERS.map(({ id }) => id)
);

export function normalisePrivacyFilterId(value) {
  const candidate = String(value ?? '').trim();
  return PRIVACY_PORTRAIT_FILTER_IDS.includes(candidate) ? candidate : null;
}

export function requirePrivacyFilterId(value) {
  const filterId = normalisePrivacyFilterId(value);
  if (!filterId) throw new TypeError('A supported privacy portrait filter must be selected');
  return filterId;
}

export function privacyFilterDefinition(value) {
  const filterId = requirePrivacyFilterId(value);
  return PRIVACY_PORTRAIT_FILTERS.find(({ id }) => id === filterId);
}

function drawPixelated(context, source, width, height, divisor) {
  const tiny = document.createElement('canvas');
  tiny.width = Math.max(20, Math.round(width / divisor));
  tiny.height = Math.max(20, Math.round(height / divisor));
  const tinyContext = tiny.getContext('2d', { alpha: false });
  tinyContext.imageSmoothingEnabled = true;
  tinyContext.imageSmoothingQuality = 'high';
  tinyContext.drawImage(source, 0, 0, tiny.width, tiny.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(tiny, 0, 0, width, height);
}

export function applyPrivacyFilterToCanvas(target, source, value) {
  if (!target || !source) throw new TypeError('Target and source canvases are required');
  const recipe = privacyFilterDefinition(value);
  const width = Math.max(1, Number(target.width || source.width || 1));
  const height = Math.max(1, Number(target.height || source.height || 1));
  target.width = width;
  target.height = height;
  const context = target.getContext('2d', { alpha: false });
  context.save();
  context.fillStyle = '#e8e0d8';
  context.fillRect(0, 0, width, height);

  if (typeof context.filter === 'string') {
    context.filter = [
      `blur(${recipe.blur}px)`,
      `grayscale(${Math.round(recipe.grayscale * 100)}%)`,
      `sepia(${Math.round(recipe.sepia * 100)}%)`,
      `saturate(${Math.round(recipe.saturation * 100)}%)`,
      `contrast(${Math.round(recipe.contrast * 100)}%)`,
      `brightness(${Math.round(recipe.brightness * 100)}%)`
    ].join(' ');
    const bleed = Math.max(6, recipe.blur * 1.4);
    context.drawImage(source, -bleed, -bleed, width + bleed * 2, height + bleed * 2);
    context.filter = 'none';
  } else {
    drawPixelated(context, source, width, height, recipe.pixelDivisor);
  }

  context.fillStyle = recipe.veil;
  context.fillRect(0, 0, width, height);
  context.restore();
  return target;
}
'''
write('apps/web/src/privacy-portrait-filters.js', privacy_module)

privacy_test = r'''import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRIVACY_PORTRAIT_FILTERS,
  PRIVACY_PORTRAIT_FILTER_IDS,
  normalisePrivacyFilterId,
  privacyFilterDefinition,
  requirePrivacyFilterId
} from '../src/privacy-portrait-filters.js';

test('privacy portrait selection exposes exactly four bounded choices', () => {
  assert.deepEqual(PRIVACY_PORTRAIT_FILTER_IDS, ['softFocus', 'warmVeil', 'monoMist', 'privacyMax']);
  assert.equal(PRIVACY_PORTRAIT_FILTERS.length, 4);
  assert.equal(PRIVACY_PORTRAIT_FILTERS.filter(({ recommended }) => recommended).length, 1);
  assert.equal(PRIVACY_PORTRAIT_FILTERS.find(({ recommended }) => recommended)?.id, 'warmVeil');
});

test('privacy strength increases monotonically across the fixed choices', () => {
  assert.deepEqual(PRIVACY_PORTRAIT_FILTERS.map(({ privacyRank }) => privacyRank), [1, 2, 3, 4]);
  assert.deepEqual(PRIVACY_PORTRAIT_FILTERS.map(({ blur }) => blur), [9, 13, 17, 24]);
  assert.ok(privacyFilterDefinition('privacyMax').pixelDivisor > privacyFilterDefinition('softFocus').pixelDivisor);
});

test('unknown, empty and technical values fail closed', () => {
  assert.equal(normalisePrivacyFilterId('warmVeil'), 'warmVeil');
  assert.equal(normalisePrivacyFilterId(''), null);
  assert.equal(normalisePrivacyFilterId('raw'), null);
  assert.equal(normalisePrivacyFilterId('none'), null);
  assert.throws(() => requirePrivacyFilterId(undefined), /must be selected/);
  assert.throws(() => requirePrivacyFilterId('soft-focus'), /must be selected/);
});
'''
write('apps/web/tests/privacy-portrait-filters.test.mjs', privacy_test)

# Integrate the shared filter module into the browser controller.
replace_once(
    'apps/private-preview/profile-image-preparation.js',
    "  preparedObjectPaths\n} from './src/profile-image-preparation.js';",
    "  preparedObjectPaths\n} from './src/profile-image-preparation.js';\nimport {\n  PRIVACY_PORTRAIT_FILTERS,\n  applyPrivacyFilterToCanvas,\n  requirePrivacyFilterId\n} from './src/privacy-portrait-filters.js';"
)
replace_once(
    'apps/private-preview/profile-image-preparation.js',
    "const MODULE_BOUNDARY = 'wp069b-profile-image-preparation';",
    "const MODULE_BOUNDARY = 'wp074-privacy-portrait-filters';"
)
replace_once(
    'apps/private-preview/profile-image-preparation.js',
    "    intro: 'Sleep de foto en zoom totdat je gezicht, kin en schouders prettig in beeld staan. Het origineel wordt niet destructief bijgesneden.',",
    "    intro: 'Bepaal eerst de kadrering. Kies daarna verplicht hoeveel detail anderen mogen zien; alleen die gefilterde versie wordt gedeeld.',"
)
replace_once(
    'apps/private-preview/profile-image-preparation.js',
    "    prepared: 'Je portret is voorbereid en privé opgeslagen.',\n    choose: 'Kies eerst een afbeelding.',",
    "    prepared: 'Je gekozen privacyportret is voorbereid en privé opgeslagen.',\n    choose: 'Kies eerst een afbeelding.',\n    chooseFilter: 'Kies eerst een privacyfilter.',\n    privacyTitle: 'Kies je privacyniveau',\n    privacyIntro: 'De bron blijft privé. Alleen de gekozen gefilterde profielkaart en avatar worden aan anderen getoond.',\n    recommended: 'Aanbevolen',\n    save: 'Privacyportret opslaan',\n    softFocusTitle: 'Zacht',\n    softFocusDescription: 'Meer herkenbaar, maar altijd zichtbaar verzacht.',\n    warmVeilTitle: 'Gebalanceerd',\n    warmVeilDescription: 'Aanbevolen balans tussen herkenning en privacy.',\n    monoMistTitle: 'Privé',\n    monoMistDescription: 'Minder kleur en minder gezichtsdetail.',\n    privacyMaxTitle: 'Extra privé',\n    privacyMaxDescription: 'Sterkste vervaging en laagste detailniveau.',"
)
replace_once(
    'apps/private-preview/profile-image-preparation.js',
    "    intro: 'Drag and zoom until your face, chin and shoulders sit comfortably in frame. The source is never destructively cropped.',",
    "    intro: 'Set the framing first. Then choose how much detail others may see; only that filtered version is shared.',"
)
replace_once(
    'apps/private-preview/profile-image-preparation.js',
    "    prepared: 'Your portrait has been prepared and stored privately.',\n    choose: 'Choose an image first.',",
    "    prepared: 'Your selected privacy portrait has been prepared and stored privately.',\n    choose: 'Choose an image first.',\n    chooseFilter: 'Choose a privacy filter first.',\n    privacyTitle: 'Choose your privacy level',\n    privacyIntro: 'The source stays private. Only the selected filtered profile card and avatar are shown to others.',\n    recommended: 'Recommended',\n    save: 'Save privacy portrait',\n    softFocusTitle: 'Soft',\n    softFocusDescription: 'More recognisable, but always visibly softened.',\n    warmVeilTitle: 'Balanced',\n    warmVeilDescription: 'Recommended balance between recognition and privacy.',\n    monoMistTitle: 'Private',\n    monoMistDescription: 'Less colour and less facial detail.',\n    privacyMaxTitle: 'Extra private',\n    privacyMaxDescription: 'Strongest obscuration and lowest detail.',"
)
replace_once(
    'apps/private-preview/profile-image-preparation.js',
    "  version: 1",
    "  version: 2,\n  mandatoryFilterSelection: true,\n  publicRawPortraitAllowed: false"
)
replace_once(
    'apps/private-preview/profile-image-preparation.js',
    "let framing = normaliseFraming();\nlet dragState = null;",
    "let framing = normaliseFraming();\nlet selectedFilterId = null;\nlet dragState = null;"
)
replace_once(
    'apps/private-preview/profile-image-preparation.js',
    "function updateCopy() {\n  if (!editor) return;\n  for (const element of editor.root.querySelectorAll('[data-image-copy]')) {\n    element.textContent = text(element.dataset.imageCopy);\n  }\n  renderWarnings();\n}",
    "function updateCopy() {\n  if (!editor) return;\n  for (const element of editor.root.querySelectorAll('[data-image-copy]')) {\n    element.textContent = text(element.dataset.imageCopy);\n  }\n  if (editor.submit) editor.submit.textContent = text('save');\n  renderFilterSelectionState();\n  renderWarnings();\n}"
)

insert_after_source = """function drawFullSource(canvas) {
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
"""
insert_filters = insert_after_source + r'''
function filterCopyKey(filterId, suffix) {
  return `${filterId}${suffix}`;
}

function renderFilterSelectionState() {
  if (!editor) return;
  for (const button of editor.filterButtons ?? []) {
    const selected = button.dataset.filterId === selectedFilterId;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
  if (editor.submit) editor.submit.disabled = !sourceImage || !selectedFilterId || busy;
}

function renderPrivacyVariants() {
  if (!editor || !sourceImage) return;
  for (const button of editor.filterButtons) {
    const filterId = button.dataset.filterId;
    applyPrivacyFilterToCanvas(button.querySelector('[data-filter-card]'), editor.cardCanvas, filterId);
    applyPrivacyFilterToCanvas(button.querySelector('[data-filter-avatar]'), editor.avatarCanvas, filterId);
  }
  renderFilterSelectionState();
}

function selectPrivacyFilter(value) {
  selectedFilterId = requirePrivacyFilterId(value);
  renderFilterSelectionState();
  status('', 'info');
}
'''
replace_once('apps/private-preview/profile-image-preparation.js', insert_after_source, insert_filters)
replace_once(
    'apps/private-preview/profile-image-preparation.js',
    "  editor.zoom.value = String(framing.zoom);\n  editor.root.hidden = false;",
    "  editor.zoom.value = String(framing.zoom);\n  editor.root.hidden = false;\n  renderPrivacyVariants();"
)
replace_once(
    'apps/private-preview/profile-image-preparation.js',
    "  sourceFile = file ?? null;\n  inspection = inspectProfileImage({ size: file?.size, type: file?.type });",
    "  sourceFile = file ?? null;\n  selectedFilterId = null;\n  inspection = inspectProfileImage({ size: file?.size, type: file?.type });"
)
replace_once(
    'apps/private-preview/profile-image-preparation.js',
    "async function createDerivatives() {\n  const sourceCanvas = document.createElement('canvas');\n  const cardCanvas = document.createElement('canvas');\n  const avatarCanvas = document.createElement('canvas');\n  drawFullSource(sourceCanvas);\n  drawCrop(cardCanvas, PROFILE_IMAGE_CONTRACT.cardWidth, PROFILE_IMAGE_CONTRACT.cardHeight);\n  drawCrop(avatarCanvas, PROFILE_IMAGE_CONTRACT.avatarWidth, PROFILE_IMAGE_CONTRACT.avatarHeight);\n  const [source, card, avatar] = await Promise.all([\n    canvasBlob(sourceCanvas, 0.92),\n    canvasBlob(cardCanvas, 0.88),\n    canvasBlob(avatarCanvas, 0.86)\n  ]);\n  return Object.freeze({ source, card, avatar });\n}",
    "async function createDerivatives() {\n  const filterId = requirePrivacyFilterId(selectedFilterId);\n  const sourceCanvas = document.createElement('canvas');\n  const rawCardCanvas = document.createElement('canvas');\n  const rawAvatarCanvas = document.createElement('canvas');\n  const cardCanvas = document.createElement('canvas');\n  const avatarCanvas = document.createElement('canvas');\n  drawFullSource(sourceCanvas);\n  drawCrop(rawCardCanvas, PROFILE_IMAGE_CONTRACT.cardWidth, PROFILE_IMAGE_CONTRACT.cardHeight);\n  drawCrop(rawAvatarCanvas, PROFILE_IMAGE_CONTRACT.avatarWidth, PROFILE_IMAGE_CONTRACT.avatarHeight);\n  cardCanvas.width = PROFILE_IMAGE_CONTRACT.cardWidth;\n  cardCanvas.height = PROFILE_IMAGE_CONTRACT.cardHeight;\n  avatarCanvas.width = PROFILE_IMAGE_CONTRACT.avatarWidth;\n  avatarCanvas.height = PROFILE_IMAGE_CONTRACT.avatarHeight;\n  applyPrivacyFilterToCanvas(cardCanvas, rawCardCanvas, filterId);\n  applyPrivacyFilterToCanvas(avatarCanvas, rawAvatarCanvas, filterId);\n  const [source, card, avatar] = await Promise.all([\n    canvasBlob(sourceCanvas, 0.92),\n    canvasBlob(cardCanvas, 0.88),\n    canvasBlob(avatarCanvas, 0.86)\n  ]);\n  return Object.freeze({ source, card, avatar, filterId });\n}"
)
replace_once(
    'apps/private-preview/profile-image-preparation.js',
    "  if (!sourceFile || !sourceImage || !inspection?.canPrepare) throw new Error(text('choose'));",
    "  if (!sourceFile || !sourceImage || !inspection?.canPrepare) throw new Error(text('choose'));\n  if (!selectedFilterId) throw new Error(text('chooseFilter'));"
)
replace_once(
    'apps/private-preview/profile-image-preparation.js',
    "      p_source_height: Math.round(dimensions.height),\n      p_quality_flags: inspection.warnings",
    "      p_source_height: Math.round(dimensions.height),\n      p_privacy_filter_id: derivatives.filterId,\n      p_quality_flags: inspection.warnings"
)
replace_once(
    'apps/private-preview/profile-image-preparation.js',
    "        preparationId,\n        framing,\n        qualityFlags: inspection.warnings",
    "        preparationId,\n        framing,\n        privacyFilterId: derivatives.filterId,\n        qualityFlags: inspection.warnings"
)

filter_markup_function = r'''
function privacyFilterMarkup() {
  return PRIVACY_PORTRAIT_FILTERS.map(({ id, recommended }) => `
    <button type="button" class="rv-privacy-filter-option" data-filter-id="${id}" aria-pressed="false">
      ${recommended ? '<span class="rv-privacy-filter-recommended" data-image-copy="recommended"></span>' : ''}
      <span class="rv-privacy-filter-previews" aria-hidden="true">
        <canvas data-filter-card width="192" height="240"></canvas>
        <canvas data-filter-avatar width="112" height="112"></canvas>
      </span>
      <strong data-image-copy="${filterCopyKey(id, 'Title')}"></strong>
      <span data-image-copy="${filterCopyKey(id, 'Description')}"></span>
    </button>
  `).join('');
}

'''
replace_once(
    'apps/private-preview/profile-image-preparation.js',
    "function editorMarkup() {",
    filter_markup_function + "function editorMarkup() {"
)
replace_once(
    'apps/private-preview/profile-image-preparation.js',
    "    <button id=\"rv-image-reset\" class=\"secondary\" type=\"button\" data-image-copy=\"reset\"></button>\n    <ul id=\"rv-image-warnings\" class=\"rv-image-warnings\" hidden></ul>",
    "    <button id=\"rv-image-reset\" class=\"secondary\" type=\"button\" data-image-copy=\"reset\"></button>\n    <section class=\"rv-privacy-filter-picker\" aria-labelledby=\"rv-privacy-filter-title\">\n      <div class=\"rv-privacy-filter-heading\">\n        <h4 id=\"rv-privacy-filter-title\" data-image-copy=\"privacyTitle\"></h4>\n        <p data-image-copy=\"privacyIntro\"></p>\n      </div>\n      <div class=\"rv-privacy-filter-grid\">${privacyFilterMarkup()}</div>\n    </section>\n    <ul id=\"rv-image-warnings\" class=\"rv-image-warnings\" hidden></ul>"
)
replace_once(
    'apps/private-preview/profile-image-preparation.js',
    "    zoom: root.querySelector('#rv-image-zoom'),\n    warnings: root.querySelector('#rv-image-warnings')\n  };",
    "    zoom: root.querySelector('#rv-image-zoom'),\n    warnings: root.querySelector('#rv-image-warnings'),\n    filterButtons: [...root.querySelectorAll('[data-filter-id]')],\n    submit: form.querySelector('button[type=\"submit\"]')\n  };\n  if (editor.submit) editor.submit.disabled = true;\n  for (const button of editor.filterButtons) {\n    button.addEventListener('click', () => selectPrivacyFilter(button.dataset.filterId));\n  }"
)

# Improve product-level copy before an image is selected.
replace_once(
    'apps/private-preview/product-model.js',
    "    'portrait.intro': 'Gebruik uitsluitend een synthetische afbeelding in deze test. Het bestand blijft privé opgeslagen; alleen het gekozen privacyportret wordt gebruikt.',\n    'portrait.file': 'JPEG, PNG of WebP',\n    'portrait.upload': 'Uploaden en selecteren',",
    "    'portrait.intro': 'Gebruik uitsluitend een synthetische afbeelding in deze test. Na het kadreren kies je verplicht een privacyfilter; alleen de gefilterde versie wordt gedeeld.',\n    'portrait.file': 'JPEG, PNG of WebP',\n    'portrait.upload': 'Privacyportret opslaan',"
)
replace_once(
    'apps/private-preview/product-model.js',
    "    'portrait.intro': 'Use a synthetic image only in this test. The file remains privately stored; only the selected privacy portrait is used.',\n    'portrait.file': 'JPEG, PNG or WebP',\n    'portrait.upload': 'Upload and select',",
    "    'portrait.intro': 'Use a synthetic image only in this test. After framing, you must choose a privacy filter; only the filtered version is shared.',\n    'portrait.file': 'JPEG, PNG or WebP',\n    'portrait.upload': 'Save privacy portrait',"
)

# Add premium, accessible privacy-choice styling.
css_append = r'''

/* WP-074: mandatory browser-local privacy portrait selection. */
.rv-privacy-filter-picker {
  display: grid;
  gap: 0.75rem;
  padding-top: 0.2rem;
}

.rv-privacy-filter-heading h4 {
  margin: 0;
  color: #211b18;
  font-size: 0.95rem;
}

.rv-privacy-filter-heading p {
  margin: 0.28rem 0 0;
  color: #6d625a;
  font-size: 0.78rem;
  line-height: 1.45;
}

.rv-privacy-filter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.rv-privacy-filter-option {
  position: relative;
  display: grid;
  gap: 0.42rem;
  min-width: 0;
  padding: 0.7rem;
  border: 1px solid #d8cec4;
  border-radius: 1rem;
  background: #fff;
  color: #3e352f;
  text-align: left;
  box-shadow: 0 6px 18px rgba(57, 42, 32, 0.05);
}

.rv-privacy-filter-option:hover {
  transform: none;
  border-color: #9dbdaf;
  background: #f8fcfa;
}

.rv-privacy-filter-option:focus-visible {
  outline: 3px solid rgba(33, 95, 80, 0.28);
  outline-offset: 2px;
}

.rv-privacy-filter-option.selected {
  border-color: #215f50;
  background: #edf6f2;
  box-shadow: 0 0 0 2px rgba(33, 95, 80, 0.16), 0 8px 22px rgba(33, 95, 80, 0.08);
}

.rv-privacy-filter-option strong {
  color: #211b18;
  font-size: 0.86rem;
}

.rv-privacy-filter-option > span:last-child {
  color: #6d625a;
  font-size: 0.72rem;
  line-height: 1.4;
}

.rv-privacy-filter-previews {
  position: relative;
  display: block;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  border-radius: 0.72rem;
  background: #e2dad3;
}

.rv-privacy-filter-previews [data-filter-card] {
  display: block;
  width: 72%;
  height: 100%;
  object-fit: cover;
}

.rv-privacy-filter-previews [data-filter-avatar] {
  position: absolute;
  right: 0.4rem;
  bottom: 0.4rem;
  width: 34%;
  height: auto;
  aspect-ratio: 1;
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(33, 27, 24, 0.18);
}

.rv-privacy-filter-recommended {
  position: absolute;
  z-index: 2;
  top: 0.45rem;
  right: 0.45rem;
  padding: 0.24rem 0.42rem;
  border-radius: 999px;
  background: #215f50;
  color: #fff !important;
  font-size: 0.61rem !important;
  font-weight: 850;
  letter-spacing: 0.02em;
}

@media (max-width: 36rem) {
  .rv-privacy-filter-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .rv-privacy-filter-option {
    grid-template-columns: minmax(7rem, 0.7fr) minmax(0, 1fr);
    align-items: center;
  }

  .rv-privacy-filter-option strong,
  .rv-privacy-filter-option > span:last-child {
    grid-column: 2;
  }

  .rv-privacy-filter-previews {
    grid-row: 1 / span 2;
  }
}
'''
write('apps/private-preview/profile-image-preparation.css', read('apps/private-preview/profile-image-preparation.css').rstrip() + css_append + '\n')

# Cloudflare artifact must carry the new shared filter module and cache contract.
replace_once(
    'scripts/build-private-preview.mjs',
    "for (const file of ['auth-session.js', 'backend-contract.js', 'onboarding-repository.js', 'account-experience.js', 'profile-image-preparation.js']) {",
    "for (const file of ['auth-session.js', 'backend-contract.js', 'onboarding-repository.js', 'account-experience.js', 'profile-image-preparation.js', 'privacy-portrait-filters.js']) {"
)
replace_once(
    'scripts/finalize-discovery-deck-artifact.mjs',
    "'profile-image-preparation.js', 'profile-image-preparation.css', 'src/profile-image-preparation.js']",
    "'profile-image-preparation.js', 'profile-image-preparation.css', 'src/profile-image-preparation.js', 'src/privacy-portrait-filters.js']"
)
replace_once(
    'scripts/finalize-discovery-deck-artifact.mjs',
    "  '/src/profile-image-preparation.js'\n];",
    "  '/src/profile-image-preparation.js',\n  '/src/privacy-portrait-filters.js'\n];"
)

migration = r'''-- WP-074: require an explicit privacy filter for new participant-prepared portraits.

alter table public.privacy_portraits
  add column if not exists privacy_filter_id text;

alter table public.privacy_portraits
  drop constraint if exists privacy_portraits_filter_id_check,
  add constraint privacy_portraits_filter_id_check check (
    privacy_filter_id is null
    or privacy_filter_id in ('softFocus', 'warmVeil', 'monoMist', 'privacyMax')
  );

-- Existing synthetic fixtures remain compatible. Previously prepared participant
-- cards without a filter are fail-closed and must be prepared again.
with affected as (
  update public.privacy_portraits
  set is_public_profile_portrait = false,
      status = 'superseded',
      updated_at = timezone('utc', now())
  where is_public_profile_portrait
    and treatment = 'prepared-card-4x5-webp'
    and privacy_filter_id is null
  returning user_id
)
update public.profiles
set publication_status = 'draft',
    published_at = null,
    updated_at = timezone('utc', now())
where user_id in (select user_id from affected);

revoke execute on function public.register_prepared_portrait(
  uuid, text, text, text, numeric, numeric, numeric, integer, integer, text[]
) from authenticated;

create or replace function public.register_prepared_portrait(
  p_preparation_id uuid,
  p_source_object_path text,
  p_card_object_path text,
  p_avatar_object_path text,
  p_focal_x numeric,
  p_focal_y numeric,
  p_zoom numeric,
  p_source_width integer,
  p_source_height integer,
  p_privacy_filter_id text,
  p_quality_flags text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_card_id uuid;
  v_filter text := nullif(trim(coalesce(p_privacy_filter_id, '')), '');
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if v_filter is null or v_filter not in ('softFocus', 'warmVeil', 'monoMist', 'privacyMax') then
    raise exception 'supported privacy filter required';
  end if;

  v_card_id := public.register_prepared_portrait(
    p_preparation_id,
    p_source_object_path,
    p_card_object_path,
    p_avatar_object_path,
    p_focal_x,
    p_focal_y,
    p_zoom,
    p_source_width,
    p_source_height,
    p_quality_flags
  );

  update public.privacy_portraits
  set privacy_filter_id = v_filter,
      treatment = case asset_role
        when 'source' then 'normalized-source-webp'
        when 'card' then 'privacy-' || v_filter || '-card-4x5-webp'
        when 'avatar' then 'privacy-' || v_filter || '-avatar-square-webp'
        else treatment
      end,
      updated_at = timezone('utc', now())
  where user_id = v_user_id
    and preparation_id = p_preparation_id;

  insert into public.audit_events (
    actor_user_id, actor_type, event_type, subject_user_id, entity_type, entity_id, payload
  ) values (
    v_user_id,
    'user',
    'privacy_portrait_filter_selected',
    v_user_id,
    'privacy_portrait_preparation',
    p_preparation_id::text,
    jsonb_build_object(
      'privacy_filter_id', v_filter,
      'public_derivatives_filtered', true,
      'raw_public_portrait_allowed', false
    )
  );

  return v_card_id;
end;
$$;

revoke all on function public.register_prepared_portrait(
  uuid, text, text, text, numeric, numeric, numeric, integer, integer, text, text[]
) from public, anon;
grant execute on function public.register_prepared_portrait(
  uuid, text, text, text, numeric, numeric, numeric, integer, integer, text, text[]
) to authenticated;
'''
write('supabase/migrations/20260806225500_privacy_portrait_filter_selection.sql', migration)

# Upgrade the existing database proof to the new mandatory signature and metadata.
db = read('supabase/tests/database/014_profile_image_preparation.test.sql')
db = db.replace('select plan(37);', 'select plan(45);', 1)
db = db.replace(
    "select has_column('public', 'privacy_portraits', 'quality_flags', 'privacy portraits record bounded quality flags');",
    "select has_column('public', 'privacy_portraits', 'quality_flags', 'privacy portraits record bounded quality flags');\nselect has_column('public', 'privacy_portraits', 'privacy_filter_id', 'privacy portraits persist the selected privacy filter');",
    1
)
old_sig = 'public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text[])'
new_sig = 'public.register_prepared_portrait(uuid,text,text,text,numeric,numeric,numeric,integer,integer,text,text[])'
db = db.replace(old_sig, new_sig)
marker = "select ok(\n  has_function_privilege('authenticated', '" + new_sig + "', 'EXECUTE'),\n  'authenticated callers can register a prepared portrait'\n);"
db = db.replace(marker, marker + "\nselect ok(\n  not has_function_privilege('authenticated', '" + old_sig + "', 'EXECUTE'),\n  'authenticated callers cannot bypass mandatory privacy filtering through the legacy signature'\n);", 1)
# Add a filter ID before every quality flag argument in the six existing calls.
replacements = [
    ("0.52, 0.41, 1.18, 1800, 2400,\n  array['low-resolution']", "0.52, 0.41, 1.18, 1800, 2400,\n  'warmVeil', array['low-resolution']"),
    ("0.5, 0.5, 1, 1200, 1600, '{}'::text[]", "0.5, 0.5, 1, 1200, 1600, 'softFocus', '{}'::text[]"),
    ("0.5, 0.5, 9, 1200, 1600, '{}'::text[]", "0.5, 0.5, 9, 1200, 1600, 'softFocus', '{}'::text[]"),
    ("0.48, 0.44, 1.05, 1400, 2100,\n  array['very-tall-source']", "0.48, 0.44, 1.05, 1400, 2100,\n  'privacyMax', array['very-tall-source']")
]
for before, after in replacements:
    db = db.replace(before, after)
first_metadata_marker = "select is((select count(*) from public.privacy_portraits where metadata_stripped), 3::bigint, 'all stored assets record metadata stripping');"
db = db.replace(first_metadata_marker, first_metadata_marker + r'''
select is((select count(*) from public.privacy_portraits where privacy_filter_id = 'warmVeil'), 3::bigint, 'selected filter is persisted on the complete preparation');
select is((select treatment from public.privacy_portraits where asset_role = 'card'), 'privacy-warmVeil-card-4x5-webp', 'selected card treatment identifies the baked privacy filter');
select is((select treatment from public.privacy_portraits where asset_role = 'avatar'), 'privacy-warmVeil-avatar-square-webp', 'avatar treatment identifies the same baked privacy filter');''', 1)
snapshot_marker = "select ok(\n  not (public.load_onboarding_snapshot() -> 'privacy_portrait' ? 'source_object_path'),\n  'onboarding snapshot redacts normalized source path'\n);"
db = db.replace(snapshot_marker, snapshot_marker + r'''
select is(public.load_onboarding_snapshot() #>> '{privacy_portrait,privacy_filter_id}', 'warmVeil', 'onboarding snapshot exposes the non-sensitive selected filter ID');''', 1)
audit_marker = "select ok(\n  (select payload::text not like '%.webp%' from public.audit_events where event_type = 'prepared_portrait_registered' order by id desc limit 1),\n  'prepared portrait audit event contains no Storage paths'\n);"
db = db.replace(audit_marker, audit_marker + r'''
select is(
  (select payload->>'privacy_filter_id' from public.audit_events where event_type = 'privacy_portrait_filter_selected' order by id desc limit 1),
  'warmVeil',
  'privacy-filter audit records the bounded selected filter without paths'
);''', 1)
invalid_anchor = "select throws_ok(\n  $$ select public.register_prepared_portrait(\n    '20000000-0000-4000-8000-000000000001',"
invalid_test = r'''select throws_ok(
  $$ select public.register_prepared_portrait(
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000001/source.webp',
    '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000001/card-4x5.webp',
    '10000000-0000-4000-8000-000000000001/prepared/20000000-0000-4000-8000-000000000001/avatar-square.webp',
    0.5, 0.5, 1, 1200, 1600, 'raw', '{}'::text[]
  ) $$,
  'supported privacy filter required',
  'database rejects raw or unknown privacy-filter values'
);

'''
if invalid_anchor not in db:
    raise RuntimeError('database invalid-filter insertion anchor missing')
db = db.replace(invalid_anchor, invalid_test + invalid_anchor, 1)
write('supabase/tests/database/014_profile_image_preparation.test.sql', db)

validator = r'''import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const dist = resolve(root, 'dist-private-preview');
const failures = [];
const requireMarker = (source, marker, message) => { if (!source.includes(marker)) failures.push(message); };
const forbid = (source, pattern, message) => { if (pattern.test(source)) failures.push(message); };

const files = await Promise.all([
  readFile(resolve(root, 'apps/private-preview/profile-image-preparation.js'), 'utf8'),
  readFile(resolve(root, 'apps/private-preview/profile-image-preparation.css'), 'utf8'),
  readFile(resolve(root, 'apps/web/src/privacy-portrait-filters.js'), 'utf8'),
  readFile(resolve(root, 'supabase/migrations/20260806225500_privacy_portrait_filter_selection.sql'), 'utf8'),
  readFile(resolve(root, 'supabase/tests/database/014_profile_image_preparation.test.sql'), 'utf8'),
  readFile(resolve(dist, 'profile-image-preparation.js'), 'utf8'),
  readFile(resolve(dist, 'profile-image-preparation.css'), 'utf8'),
  readFile(resolve(dist, 'src/privacy-portrait-filters.js'), 'utf8'),
  readFile(resolve(dist, '_headers'), 'utf8')
]);
const [controller, css, model, migration, databaseTest, builtController, builtCss, builtModel, headers] = files;

for (const [source, label] of [[controller, 'source controller'], [builtController, 'built controller']]) {
  requireMarker(source, "MODULE_BOUNDARY = 'wp074-privacy-portrait-filters'", `${label} must expose the WP-074 boundary`);
  requireMarker(source, 'PRIVACY_PORTRAIT_FILTERS', `${label} must render the bounded privacy choices`);
  requireMarker(source, 'selectedFilterId = null', `${label} must start without an implicit selection`);
  requireMarker(source, "throw new Error(text('chooseFilter'))", `${label} must fail closed without a selected filter`);
  requireMarker(source, 'applyPrivacyFilterToCanvas(cardCanvas, rawCardCanvas, filterId)', `${label} must bake the selected filter into the card derivative`);
  requireMarker(source, 'applyPrivacyFilterToCanvas(avatarCanvas, rawAvatarCanvas, filterId)', `${label} must bake the same filter into the avatar derivative`);
  requireMarker(source, 'p_privacy_filter_id: derivatives.filterId', `${label} must persist the filter server-side`);
  requireMarker(source, 'publicRawPortraitAllowed: false', `${label} must declare that public raw portraits are forbidden`);
  forbid(source, /selectedFilterId\s*=\s*['\"](?:softFocus|warmVeil|monoMist|privacyMax)/, `${label} must not preselect a privacy level`);
}

for (const [source, label] of [[model, 'source filter model'], [builtModel, 'built filter model']]) {
  for (const id of ['softFocus', 'warmVeil', 'monoMist', 'privacyMax']) requireMarker(source, `id: '${id}'`, `${label} is missing ${id}`);
  requireMarker(source, 'PRIVACY_PORTRAIT_FILTERS.length', `${label} test contract must remain discoverable`);
  requireMarker(source, "if (!filterId) throw new TypeError", `${label} must reject unsupported filters`);
  requireMarker(source, 'blur: 24', `${label} must retain a materially stronger maximum privacy recipe`);
  forbid(source, /id:\s*['\"](?:raw|none|original)/, `${label} must not offer an unfiltered public option`);
}

for (const [source, label] of [[css, 'source CSS'], [builtCss, 'built CSS']]) {
  requireMarker(source, '.rv-privacy-filter-grid', `${label} must style the four-choice grid`);
  requireMarker(source, '.rv-privacy-filter-option.selected', `${label} must make selection visible`);
  requireMarker(source, '.rv-privacy-filter-recommended', `${label} must identify the recommended bounded choice`);
  requireMarker(source, '@media (max-width: 36rem)', `${label} must retain a mobile layout`);
}

requireMarker(migration, 'add column if not exists privacy_filter_id text', 'migration must persist filter metadata');
requireMarker(migration, "privacy_filter_id in ('softFocus', 'warmVeil', 'monoMist', 'privacyMax')", 'migration must constrain filter IDs');
requireMarker(migration, "treatment = 'prepared-card-4x5-webp'", 'migration must fail-close existing unfiltered participant cards');
requireMarker(migration, "revoke execute on function public.register_prepared_portrait", 'migration must disable the legacy bypass signature');
requireMarker(migration, "raise exception 'supported privacy filter required'", 'new RPC must reject absent or unknown filters');
requireMarker(migration, "'raw_public_portrait_allowed', false", 'audit evidence must record the raw-public prohibition');
forbid(migration, /jsonb_build_object\([\s\S]*?(?:object_path|\.webp)/i, 'new filter audit payload must not expose Storage paths');

requireMarker(databaseTest, 'select plan(45);', 'database proof must include the expanded WP-074 assertions');
requireMarker(databaseTest, 'cannot bypass mandatory privacy filtering', 'database proof must cover the old-signature bypass');
requireMarker(databaseTest, 'database rejects raw or unknown privacy-filter values', 'database proof must cover fail-closed filter validation');
requireMarker(databaseTest, 'selected filter is persisted on the complete preparation', 'database proof must cover filter persistence');
requireMarker(databaseTest, 'onboarding snapshot exposes the non-sensitive selected filter ID', 'database proof must cover refresh metadata');

requireMarker(headers, '/src/privacy-portrait-filters.js\n  Cache-Control: no-cache, max-age=0, must-revalidate', 'generated headers must revalidate the filter model');

if (failures.length) {
  console.error('WP-074 privacy portrait validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('WP-074 privacy portrait filters validated (mandatory four-choice UI, baked card/avatar derivatives, server metadata, legacy-bypass revocation and fail-closed migration).');
'''
write('scripts/validate-wp074-privacy-portrait-filters.mjs', validator)

# Add validator and syntax checks to normal project commands.
replace_once(
    'package.json',
    'node scripts/validate-wp069b-profile-image-preparation.mjs",',
    'node scripts/validate-wp069b-profile-image-preparation.mjs && node scripts/validate-wp074-privacy-portrait-filters.mjs",'
)
replace_once(
    'package.json',
    'node --check apps/web/src/profile-image-preparation.js &&',
    'node --check apps/web/src/profile-image-preparation.js && node --check apps/web/src/privacy-portrait-filters.js &&'
)
replace_once(
    'package.json',
    'node --check scripts/validate-wp069b-profile-image-preparation.mjs && npm run build:cloudflare',
    'node --check scripts/validate-wp069b-profile-image-preparation.mjs && node --check scripts/validate-wp074-privacy-portrait-filters.mjs && npm run build:cloudflare'
)

# Update the older WP-069B validator to the upgraded contract without weakening it.
wp069 = read('scripts/validate-wp069b-profile-image-preparation.mjs')
wp069 = wp069.replace("  finalizer: 'scripts/finalize-discovery-deck-artifact.mjs'", "  finalizer: 'scripts/finalize-discovery-deck-artifact.mjs',\n  filterModel: 'apps/web/src/privacy-portrait-filters.js'")
wp069 = wp069.replace("  finalizer,\n  generatedController,", "  finalizer,\n  filterModel,\n  generatedController,")
wp069 = wp069.replace("  readFile(resolve(root, paths.finalizer), 'utf8'),\n  readFile(resolve(dist, 'profile-image-preparation.js'), 'utf8'),", "  readFile(resolve(root, paths.finalizer), 'utf8'),\n  readFile(resolve(root, paths.filterModel), 'utf8'),\n  readFile(resolve(dist, 'profile-image-preparation.js'), 'utf8'),")
wp069 = wp069.replace("requireMarker(databaseTest, 'select plan(37);', 'database proof must have the complete WP-069B plan');", "requireMarker(databaseTest, 'select plan(45);', 'database proof must include the extended WP-069B/WP-074 plan');")
wp069 = wp069.replace("requireMarker(migration, \"'prepared-card-4x5-webp'\", 'registration must identify the canonical card treatment');", "requireMarker(migration, \"'prepared-card-4x5-webp'\", 'legacy registration helper must identify the pre-filter card treatment before WP-074 wraps it');")
wp069 += "\nrequireMarker(filterModel, \"id: 'privacyMax'\", 'WP-069B validation must recognize the integrated WP-074 filter boundary');\n"
write('scripts/validate-wp069b-profile-image-preparation.mjs', wp069)

# Project administration.
wp_doc = r'''# WP-074 — Mandatory privacy portrait filters

**Date:** 2026-08-06  
**Issue:** #106  
**Status:** implementation candidate; independent assurance and canonical owner acceptance pending

## Owner finding

The integrated WP-069B upload and crop flow did not expose any control to obscure a participant portrait. It produced recognisable card and avatar crops while the interface called the result a privacy portrait. That contradicted ADR-0006 and the product privacy promise.

## Required flow

`upload → frame → choose one of four bounded privacy levels → review → store`

The four stable filter identifiers are `softFocus`, `warmVeil`, `monoMist` and `privacyMax`. There is no raw, original or none option. `warmVeil` is marked as the recommended balance, but no option is selected automatically.

## Privacy boundary

- The normalized source remains private and is never the selected portrait.
- Raw card/avatar crops exist only as browser-memory intermediates.
- The selected privacy recipe is baked into both the 960×1200 card and 384×384 avatar before upload.
- The server persists the selected filter ID on the complete preparation.
- The legacy registration signature is no longer executable by authenticated users.
- Existing participant-prepared selected cards without filter metadata are deselected and the affected staging profile returns to draft until re-prepared.
- Existing synthetic fixture portraits remain compatible.
- Browser filtering reduces recognisability but is not anonymity or biometric protection.

## Evidence contract

The candidate must pass application tests, generated-artifact validation, empty-database migration replay, pgTAP, concurrency races, deterministic seed, schema lint, protected staging migration and commit-matched canonical delivery checks. Owner review must then compare all four variants on desktop and mobile and confirm that discovery, matches and conversation views use only the selected filtered portrait.

Real-user admission remains unauthorized.
'''
write('docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md', wp_doc)

replace_once('docs/ROADMAP.md', '**Version:** 2.15', '**Version:** 2.16')
replace_once(
    'docs/ROADMAP.md',
    "### 1C. Selectable privacy portraits\n\n**Status:** implementation complete; integrated mobile owner review remains.\n\nFour browser-local fuzzy variants, no raw-selfie option and downsampling fallback.",
    "### 1C. Selectable privacy portraits\n\n**Status:** WP-074 implementation candidate; independent assurance and integrated owner review pending.\n\nThe earlier four-variant browser concept is being restored inside the current normalized upload/crop pipeline. New participant preparations require an explicit bounded filter choice; no raw-selfie public option exists. Existing unfiltered participant preparations fail closed and must be prepared again."
)
roadmap_section = r'''
### 2R. Mandatory integrated privacy portrait filters

**Status:** WP-074 implementation candidate; independent assurance and canonical owner verification pending.

After framing, participants must explicitly choose one of four bounded browser-local privacy levels. The selected recipe is baked into both card and avatar derivatives before upload; the normalized source remains private. The filter ID is constrained and persisted server-side, the legacy unfiltered registration signature is revoked for authenticated users, and existing unfiltered participant-prepared cards are deselected. Detailed evidence: `docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md`.

'''
replace_once('docs/ROADMAP.md', '## Phase 3 — Closed city-based PWA pilot', roadmap_section + '## Phase 3 — Closed city-based PWA pilot')

workpackage = r'''
## WP-074 — Mandatory integrated privacy portrait filters

**Status:** implementation candidate; independent assurance and canonical owner verification pending; issue #106  
The current participant upload/crop flow now requires an explicit choice among four browser-local privacy levels. Raw card/avatar crops remain in memory only; the selected filter is baked into both public derivatives and persisted as bounded server metadata. Authenticated users cannot call the legacy unfiltered registration signature, and existing unfiltered participant-prepared cards fail closed pending re-preparation. Synthetic fixtures remain compatible. Detailed evidence: `docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md`.

'''
replace_once('docs/WORKPACKAGES.md', '## WP-080 — Closed city pilot readiness', workpackage + '## WP-080 — Closed city pilot readiness')
replace_once(
    'docs/WORK-CLAIMS.md',
    "| WC-073 | Multiple matches and conversations are presented as a selectable inbox with participant identity, latest-message context, unread state and selected-thread-scoped messaging and safety actions. | Implemented in source and regression-tested | issue #104, `conversation-inbox-model.test.mjs`, `conversation-inbox-integration.test.mjs`, WP-073 artifact and canonical verifier | Unread state is device-local rather than server-synchronised; canonical owner acceptance with representative multiple conversations remains pending; real users are unauthorized. |",
    "| WC-073 | Multiple matches and conversations are presented as a selectable inbox with participant identity, latest-message context, unread state and selected-thread-scoped messaging and safety actions. | Implemented in source and regression-tested | issue #104, `conversation-inbox-model.test.mjs`, `conversation-inbox-integration.test.mjs`, WP-073 artifact and canonical verifier | Unread state is device-local rather than server-synchronised; canonical owner acceptance with representative multiple conversations remains pending; real users are unauthorized. |\n| WC-074 | A participant-prepared portrait cannot become selected until one of four bounded privacy filters is explicitly chosen and baked into both card and avatar derivatives. | Implementation candidate; source, database and artifact assurance pending | issue #106, WP-074 application/pgTAP/artifact/canonical verifiers | Browser filtering reduces detail but is not anonymity; existing unfiltered participant preparations require re-preparation; real users remain unauthorized. |"
)

changelog_section = r'''### Mandatory integrated privacy portrait filters

- Added WP-074 after owner review exposed that the integrated upload/crop flow had no control for obscuring a participant portrait.
- Restored four bounded browser-local privacy choices with no raw/original option and no implicit default selection.
- Added direct card and avatar previews for every choice and marked the balanced option as recommended.
- Required explicit selection before upload and baked the chosen recipe into both public derivatives.
- Persisted the selected filter ID across the complete server-authoritative preparation.
- Revoked authenticated access to the legacy unfiltered registration signature.
- Fail-closed existing unfiltered participant-prepared selected cards and return affected staging profiles to draft for re-preparation.
- Kept normalized source media private, synthetic fixture portraits compatible and private paths out of browser/audit projections.
- Added application, pgTAP, generated-artifact and canonical delivery controls.
- Browser filtering is explicitly not claimed as anonymity; real-user admission remains unauthorized.

'''
replace_once('CHANGELOG.md', '## [Unreleased]\n\n', '## [Unreleased]\n\n' + changelog_section)

replace_once(
    'docs/HANDOVER.md',
    '**Milestone:** WP-073 scalable conversation inbox implemented; canonical owner verification pending',
    '**Milestone:** WP-074 mandatory privacy portrait filters in implementation; independent assurance pending'
)
replace_once(
    'docs/HANDOVER.md',
    '- Scalable conversation inbox: issue #104 / WP-073 / `docs/WP-073-CONVERSATION-INBOX.md`.\n',
    '- Scalable conversation inbox: issue #104 / WP-073 / `docs/WP-073-CONVERSATION-INBOX.md`.\n- Mandatory privacy portrait filters: issue #106 / WP-074 / `docs/WP-074-PRIVACY-PORTRAIT-FILTERS.md`.\n'
)
handover_section = r'''## Current WP-074 privacy portrait correction

Owner review established that the current WP-069B upload/crop editor produced recognisable derivatives without offering the four privacy choices previously accepted in ADR-0006. WP-074 integrates those choices into the normal flow: after framing, the participant must explicitly choose `softFocus`, `warmVeil`, `monoMist` or `privacyMax`. No raw option exists and no level is preselected. The selected recipe is baked into card and avatar derivatives before upload, while the normalized source remains private. The server persists the bounded filter ID and denies authenticated use of the legacy unfiltered registration signature. Existing participant-prepared unfiltered cards fail closed and require re-preparation; synthetic fixture portraits remain compatible. Issue #106 remains open for independent assurance and owner visual acceptance. Real-user admission remains unauthorized.

'''
replace_once('docs/HANDOVER.md', '## Current WP-073 conversation-inbox milestone', handover_section + '## Current WP-073 conversation-inbox milestone')

# Correct the stale decision status without rewriting its historical rationale.
replace_once(
    'docs/decisions/ADR-0006-browser-privacy-filter-grid.md',
    '**Status:** accepted for pilot implementation  ',
    '**Status:** accepted; integrated in the current participant flow by WP-074 pending canonical owner acceptance  '
)
adr_append = r'''

## 2026-08-06 integration correction

WP-069B unintentionally replaced the visible filter grid with an unfiltered crop pipeline. WP-074 restores this decision inside the normalized source/card/avatar architecture. The stable implementation IDs are `softFocus`, `warmVeil`, `monoMist` and `privacyMax`; no raw option is permitted and no choice is selected implicitly.
'''
write('docs/decisions/ADR-0006-browser-privacy-filter-grid.md', read('docs/decisions/ADR-0006-browser-privacy-filter-grid.md').rstrip() + adr_append + '\n')

privacy_doc_anchor = '- never publish raw capture;\n'
replace_once(
    'docs/PRIVACY-AND-SAFETY.md',
    privacy_doc_anchor,
    privacy_doc_anchor + '- require an explicit bounded privacy-filter choice before participant card/avatar derivatives can be selected;\n- keep raw card/avatar crops in browser memory only and bake the selected filter into the uploaded public derivatives;\n'
)

# Record the discovery honestly in the earlier WP record.
append_wp069 = r'''

## WP-074 correction

Owner review on 2026-08-06 established that WP-069B provided framing and resilient presentation but did not integrate the accepted privacy-filter grid. Its card/avatar derivatives were recognisable crops. WP-074 treats those participant-prepared unfiltered outputs as non-compliant, restores a mandatory four-choice filter step and requires re-preparation. This does not invalidate the WP-069B framing, path, derivative and isolation evidence; it corrects the missing privacy transformation between crop and upload.
'''
write('docs/WP-069B-PROFILE-IMAGE-PREPARATION.md', read('docs/WP-069B-PROFILE-IMAGE-PREPARATION.md').rstrip() + append_wp069 + '\n')

print('WP-074 implementation patch applied.')
