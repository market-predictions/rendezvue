const STYLE_ID = 'rendezvue-mobile-touch-style';
const BOUNDARY = 'wp078-mobile-first-touch';
const DATE_INPUT_SELECTOR = '#rv-date-of-birth';
const dateMode = globalThis.matchMedia?.('(max-width: 42.5rem), (pointer: coarse), (hover: none)') ?? null;
const dateRegistry = new WeakMap();
let observer = null;

function ensureStyle() {
  if (document.querySelector(`#${STYLE_ID}`)) return;
  const link = document.createElement('link');
  link.id = STYLE_ID;
  link.rel = 'stylesheet';
  link.href = './mobile-touch.css';
  document.head.append(link);
}

function descendantsIncludingSelf(root, selector) {
  const matches = [...(root?.querySelectorAll?.(selector) ?? [])];
  if (root instanceof Element && root.matches(selector)) matches.unshift(root);
  return matches;
}

function dispatchRangeInput(input, delta) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const value = Number(input.value || min);
  const step = Math.max(Number(input.step || 1), 0.01);
  const coarseStep = Math.max(step, (max - min) / 20);
  const next = Math.min(max, Math.max(min, value + delta * coarseStep));
  input.value = String(Math.round(next * 100) / 100);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function enhanceRange(input) {
  if (!(input instanceof HTMLInputElement) || input.type !== 'range' || input.dataset.touchEnhanced === 'true') return;
  input.dataset.touchEnhanced = 'true';
  const parent = input.parentElement;
  if (!parent) return;
  const controls = document.createElement('span');
  controls.className = 'rv-touch-range-controls';
  const minus = document.createElement('button');
  minus.type = 'button';
  minus.className = 'secondary rv-touch-range-step';
  minus.textContent = '−';
  minus.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Zoom out' : 'Uitzoomen');
  const plus = document.createElement('button');
  plus.type = 'button';
  plus.className = 'secondary rv-touch-range-step';
  plus.textContent = '+';
  plus.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Zoom in' : 'Inzoomen');
  minus.addEventListener('click', () => dispatchRangeInput(input, -1));
  plus.addEventListener('click', () => dispatchRangeInput(input, 1));
  parent.insertBefore(controls, input);
  controls.append(minus, input, plus);
}

function interfaceLanguage() {
  return document.documentElement.lang === 'en' ? 'en' : 'nl';
}

function dateCopy(part) {
  const language = interfaceLanguage();
  const values = {
    nl: { day: 'Dag', month: 'Maand', year: 'Jaar', group: 'Geboortedatum' },
    en: { day: 'Day', month: 'Month', year: 'Year', group: 'Date of birth' }
  };
  return values[language][part];
}

function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ''));
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function daysInMonth(year, month) {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

function addOption(select, value, label) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  select.append(option);
}

function populateDateSelects(composer, initial) {
  const day = composer.querySelector('[data-touch-date-part="day"]');
  const month = composer.querySelector('[data-touch-date-part="month"]');
  const year = composer.querySelector('[data-touch-date-part="year"]');
  const selected = {
    day: String(initial?.day ?? day.value ?? ''),
    month: String(initial?.month ?? month.value ?? ''),
    year: String(initial?.year ?? year.value ?? '')
  };

  day.replaceChildren();
  addOption(day, '', dateCopy('day'));
  for (let value = 1; value <= 31; value += 1) addOption(day, String(value), String(value));

  month.replaceChildren();
  addOption(month, '', dateCopy('month'));
  const locale = interfaceLanguage() === 'en' ? 'en-GB' : 'nl-NL';
  const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
  for (let value = 1; value <= 12; value += 1) {
    addOption(month, String(value), formatter.format(new Date(2024, value - 1, 1)));
  }

  year.replaceChildren();
  addOption(year, '', dateCopy('year'));
  const currentYear = new Date().getFullYear();
  const newestAdultYear = currentYear - 18;
  const oldestYear = currentYear - 100;
  const years = [];
  for (let value = newestAdultYear; value >= oldestYear; value -= 1) years.push(value);
  if (initial?.year && !years.includes(initial.year)) years.push(initial.year);
  years.sort((a, b) => b - a);
  for (const value of years) addOption(year, String(value), String(value));

  day.value = selected.day;
  month.value = selected.month;
  year.value = selected.year;
  composer.setAttribute('aria-label', dateCopy('group'));
  day.setAttribute('aria-label', dateCopy('day'));
  month.setAttribute('aria-label', dateCopy('month'));
  year.setAttribute('aria-label', dateCopy('year'));
}

function syncDateInput(input, composer) {
  const day = composer.querySelector('[data-touch-date-part="day"]');
  const month = composer.querySelector('[data-touch-date-part="month"]');
  const year = composer.querySelector('[data-touch-date-part="year"]');
  const yearValue = Number(year.value);
  const monthValue = Number(month.value);
  let dayValue = Number(day.value);
  if (yearValue && monthValue && dayValue) {
    const maximum = daysInMonth(yearValue, monthValue);
    if (dayValue > maximum) {
      dayValue = maximum;
      day.value = String(maximum);
    }
    input.value = `${String(yearValue).padStart(4, '0')}-${String(monthValue).padStart(2, '0')}-${String(dayValue).padStart(2, '0')}`;
  } else {
    input.value = '';
  }
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function syncDateComposer(input, composer) {
  const parsed = parseIsoDate(input.value);
  if (!parsed) return;
  composer.querySelector('[data-touch-date-part="day"]').value = String(parsed.day);
  composer.querySelector('[data-touch-date-part="month"]').value = String(parsed.month);
  composer.querySelector('[data-touch-date-part="year"]').value = String(parsed.year);
}

function setDateMode(input, composer, active) {
  const originalRequired = input.dataset.touchOriginalRequired === 'true';
  composer.hidden = !active;
  input.classList.toggle('rv-touch-date-native-hidden', active);
  input.required = active ? false : originalRequired;
  input.tabIndex = active ? -1 : 0;
  if (active) input.setAttribute('aria-hidden', 'true');
  else input.removeAttribute('aria-hidden');
  for (const select of composer.querySelectorAll('select')) select.required = active;
}

function enhanceDateInput(input) {
  if (!(input instanceof HTMLInputElement) || input.dataset.touchDateEnhanced === 'true') return;
  const label = input.closest('label');
  if (!label) return;
  input.dataset.touchDateEnhanced = 'true';
  input.dataset.touchOriginalRequired = String(input.required);
  const composer = document.createElement('span');
  composer.className = 'rv-touch-date-composer';
  composer.setAttribute('role', 'group');
  composer.innerHTML = `
    <select data-touch-date-part="day"></select>
    <select data-touch-date-part="month"></select>
    <select data-touch-date-part="year"></select>`;
  label.append(composer);
  populateDateSelects(composer, parseIsoDate(input.value));
  for (const select of composer.querySelectorAll('select')) {
    select.classList.add('rv-touch-select');
    select.addEventListener('change', () => syncDateInput(input, composer));
  }
  input.addEventListener('change', () => syncDateComposer(input, composer));
  dateRegistry.set(input, composer);
  setDateMode(input, composer, dateMode?.matches === true);
}

function updateDateMode() {
  for (const [input, composer] of [...document.querySelectorAll(`${DATE_INPUT_SELECTOR}[data-touch-date-enhanced="true"]`)].map((input) => [input, dateRegistry.get(input)])) {
    if (composer) setDateMode(input, composer, dateMode?.matches === true);
  }
}

function enhanceSelect(select) {
  if (!(select instanceof HTMLSelectElement)) return;
  select.classList.add('rv-touch-select');
}

function reorderDiscoveryCard(card) {
  if (!(card instanceof Element) || card.dataset.touchActionOrder === 'media-actions-copy') return;
  const media = card.querySelector(':scope > .rv-discovery-media');
  const actions = card.querySelector(':scope > .rv-discovery-actions');
  const context = card.querySelector(':scope > .rv-context-form');
  if (!media || !actions) return;
  media.after(actions);
  if (context) actions.after(context);
  card.dataset.touchActionOrder = 'media-actions-copy';
}

function enhance(root = document) {
  ensureStyle();
  document.documentElement.classList.add('rv-touch-contract');
  for (const input of descendantsIncludingSelf(root, 'input[type="range"]')) enhanceRange(input);
  for (const input of descendantsIncludingSelf(root, DATE_INPUT_SELECTOR)) enhanceDateInput(input);
  for (const select of descendantsIncludingSelf(root, 'select')) enhanceSelect(select);
  for (const label of descendantsIncludingSelf(root, '.rv-check')) label.classList.add('rv-touch-choice-row');
  for (const summary of descendantsIncludingSelf(root, 'summary')) summary.classList.add('rv-touch-summary');
  for (const card of descendantsIncludingSelf(root, '.rv-discovery-card')) reorderDiscoveryCard(card);
}

observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) if (node instanceof Element) enhance(node);
  }
});
observer.observe(document.documentElement, { childList: true, subtree: true });
enhance();
dateMode?.addEventListener?.('change', updateDateMode);

globalThis.addEventListener('rendezvue:language-change', () => {
  for (const input of document.querySelectorAll('input[type="range"][data-touch-enhanced="true"]')) {
    const controls = input.parentElement;
    const [minus, plus] = controls?.querySelectorAll('button') ?? [];
    if (minus) minus.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Zoom out' : 'Uitzoomen');
    if (plus) plus.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Zoom in' : 'Inzoomen');
  }
  for (const input of document.querySelectorAll(`${DATE_INPUT_SELECTOR}[data-touch-date-enhanced="true"]`)) {
    const composer = dateRegistry.get(input);
    if (composer) populateDateSelects(composer, parseIsoDate(input.value));
  }
});

globalThis.addEventListener('pagehide', () => {
  observer?.disconnect();
  dateMode?.removeEventListener?.('change', updateDateMode);
}, { once: true });

globalThis.__RENDEZVUE_MOBILE_TOUCH__ = Object.freeze({
  boundary: BOUNDARY,
  version: 2,
  preferredTargetCssPx: 48,
  absoluteMinimumCssPx: 44,
  mobileDateControl: 'day-month-year',
  discoveryActionOrder: 'media-actions-copy'
});
