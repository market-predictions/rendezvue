const STYLE_ID = 'rendezvue-mobile-touch-style';
const BOUNDARY = 'wp078-mobile-first-touch';
let observer = null;

function ensureStyle() {
  if (document.querySelector(`#${STYLE_ID}`)) return;
  const link = document.createElement('link');
  link.id = STYLE_ID;
  link.rel = 'stylesheet';
  link.href = './mobile-touch.css';
  document.head.append(link);
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

function enhance(root = document) {
  ensureStyle();
  document.documentElement.classList.add('rv-touch-contract');
  for (const input of root.querySelectorAll?.('input[type="range"]') ?? []) enhanceRange(input);
  for (const label of root.querySelectorAll?.('.rv-check') ?? []) label.classList.add('rv-touch-choice-row');
  for (const summary of root.querySelectorAll?.('summary') ?? []) summary.classList.add('rv-touch-summary');
}

observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) if (node instanceof Element) enhance(node);
  }
});
observer.observe(document.documentElement, { childList: true, subtree: true });
enhance();

globalThis.addEventListener('rendezvue:language-change', () => {
  for (const input of document.querySelectorAll('input[type="range"][data-touch-enhanced="true"]')) {
    const controls = input.parentElement;
    const [minus, plus] = controls?.querySelectorAll('button') ?? [];
    if (minus) minus.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Zoom out' : 'Uitzoomen');
    if (plus) plus.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Zoom in' : 'Inzoomen');
  }
});

globalThis.addEventListener('pagehide', () => observer?.disconnect(), { once: true });
globalThis.__RENDEZVUE_MOBILE_TOUCH__ = Object.freeze({ boundary: BOUNDARY, version: 1, preferredTargetCssPx: 48, absoluteMinimumCssPx: 44 });
