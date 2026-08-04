const STYLE_ID = 'rendezvue-discovery-deck-style';

const COPY = Object.freeze({
  nl: Object.freeze({
    position: ({ current, total }) => `Profiel ${current} van ${total}`,
    guidance: () => 'Kies een actie om naar het volgende profiel te gaan.',
    complete: () => 'Je hebt alle beschikbare proefprofielen bekeken.',
    pass: () => '✕ Overslaan',
    like: () => '♥ Leuk',
    context: () => '💬 Reageer',
    card: ({ current, total }) => `Ontdekkingsprofiel ${current} van ${total}`,
    incomplete: () => 'Dit profiel kon niet volledig worden weergegeven. Vernieuw de profielen.'
  }),
  en: Object.freeze({
    position: ({ current, total }) => `Profile ${current} of ${total}`,
    guidance: () => 'Choose an action to continue to the next profile.',
    complete: () => 'You have viewed all available test profiles.',
    pass: () => '✕ Pass',
    like: () => '♥ Like',
    context: () => '💬 Respond',
    card: ({ current, total }) => `Discovery profile ${current} of ${total}`,
    incomplete: () => 'This profile could not be displayed completely. Refresh the profiles.'
  })
});

export function normaliseDiscoveryLanguage(language) {
  return String(language ?? '').toLowerCase().startsWith('en') ? 'en' : 'nl';
}

export function discoveryDeckCopy(language, key, replacements = {}) {
  const resolved = normaliseDiscoveryLanguage(language);
  const formatter = COPY[resolved][key];
  if (!formatter) throw new TypeError(`Unknown discovery deck copy key: ${key}`);
  return formatter(replacements);
}

export function resolveDiscoveryDeckProgress(total, remaining) {
  const safeRemaining = Math.max(0, Number.parseInt(String(remaining), 10) || 0);
  const safeTotal = Math.max(safeRemaining, Number.parseInt(String(total), 10) || 0);
  if (!safeTotal) return Object.freeze({ total: 0, remaining: 0, current: 0, completed: 0, percent: 0 });
  const completed = Math.min(safeTotal, Math.max(0, safeTotal - safeRemaining));
  const current = safeRemaining ? Math.min(safeTotal, completed + 1) : safeTotal;
  const percent = safeRemaining
    ? Math.round((completed / safeTotal) * 100)
    : 100;
  return Object.freeze({ total: safeTotal, remaining: safeRemaining, current, completed, percent });
}

function installStyle() {
  if (document.querySelector(`#${STYLE_ID}`)) return;
  const link = document.createElement('link');
  link.id = STYLE_ID;
  link.rel = 'stylesheet';
  link.href = './discovery-deck.css';
  document.head.append(link);
}

function createDeckMeta(list) {
  let meta = document.querySelector('#rv-discovery-deck-meta');
  if (meta) return meta;

  meta = document.createElement('div');
  meta.id = 'rv-discovery-deck-meta';
  meta.className = 'rv-discovery-deck-meta';
  meta.hidden = true;

  const row = document.createElement('div');
  row.className = 'rv-discovery-deck-row';

  const position = document.createElement('strong');
  position.id = 'rv-discovery-position';

  const guidance = document.createElement('span');
  guidance.id = 'rv-discovery-guidance';

  row.append(position, guidance);

  const progress = document.createElement('div');
  progress.className = 'rv-discovery-deck-progress';
  progress.setAttribute('role', 'progressbar');
  progress.setAttribute('aria-valuemin', '0');
  progress.setAttribute('aria-valuemax', '100');
  progress.setAttribute('aria-valuenow', '0');

  const bar = document.createElement('span');
  bar.id = 'rv-discovery-deck-bar';
  progress.append(bar);

  meta.append(row, progress);
  list.before(meta);
  return meta;
}

function actionButtons(card) {
  const actions = card.querySelector('.rv-discovery-actions');
  if (!actions) return null;
  const buttons = [...actions.querySelectorAll('button')];
  if (buttons.length < 3) return null;
  return Object.freeze({ actions, pass: buttons[0], like: buttons[1], context: buttons[2] });
}

function enhanceCard(card, language, current, total) {
  const copy = card.querySelector('.rv-discovery-copy');
  const controls = actionButtons(card);
  if (!copy || !controls) {
    card.dataset.discoveryCardComplete = 'false';
    return false;
  }

  card.dataset.discoveryCardComplete = 'true';
  card.classList.add('rv-discovery-card-enhanced');
  card.setAttribute('aria-label', discoveryDeckCopy(language, 'card', { current, total }));
  copy.hidden = false;
  controls.actions.hidden = false;

  controls.pass.dataset.discoveryAction = 'pass';
  controls.like.dataset.discoveryAction = 'like';
  controls.context.dataset.discoveryAction = 'context';
  controls.pass.textContent = discoveryDeckCopy(language, 'pass');
  controls.like.textContent = discoveryDeckCopy(language, 'like');
  controls.context.textContent = discoveryDeckCopy(language, 'context');

  controls.pass.setAttribute('aria-label', discoveryDeckCopy(language, 'pass').replace(/^.\s*/, ''));
  controls.like.setAttribute('aria-label', discoveryDeckCopy(language, 'like').replace(/^.\s*/, ''));
  controls.context.setAttribute('aria-label', discoveryDeckCopy(language, 'context').replace(/^..\s*/, ''));
  return true;
}

function initialiseDiscoveryDeck() {
  const list = document.querySelector('#rv-discovery-list');
  if (!list || list.dataset.discoveryDeckReady === 'true') return;

  installStyle();
  list.dataset.discoveryDeckReady = 'true';
  list.classList.add('rv-discovery-deck');

  const meta = createDeckMeta(list);
  const position = meta.querySelector('#rv-discovery-position');
  const guidance = meta.querySelector('#rv-discovery-guidance');
  const progress = meta.querySelector('.rv-discovery-deck-progress');
  const bar = meta.querySelector('#rv-discovery-deck-bar');
  const status = document.querySelector('#rv-discovery-status');
  const refresh = document.querySelector('#rv-refresh-discovery');

  const deck = {
    total: 0,
    lastRemaining: 0,
    resetRequested: true,
    scheduled: false
  };

  function language() {
    return normaliseDiscoveryLanguage(document.documentElement.lang);
  }

  function showDeckDefect(message) {
    if (!status) return;
    status.textContent = message;
    status.className = 'rv-status error';
    status.hidden = false;
  }

  function syncDeck() {
    deck.scheduled = false;
    const cards = [...list.querySelectorAll(':scope > .rv-discovery-card')];
    const remaining = cards.length;

    if (!remaining) {
      meta.hidden = false;
      position.textContent = deck.total
        ? discoveryDeckCopy(language(), 'complete')
        : '';
      guidance.textContent = '';
      progress.setAttribute('aria-valuenow', deck.total ? '100' : '0');
      bar.style.width = deck.total ? '100%' : '0%';
      deck.lastRemaining = 0;
      return;
    }

    if (deck.resetRequested || !deck.total || remaining > deck.total) {
      deck.total = remaining;
      deck.resetRequested = false;
    }

    const state = resolveDiscoveryDeckProgress(deck.total, remaining);
    let complete = true;

    cards.forEach((card, index) => {
      const active = index === 0;
      card.hidden = !active;
      card.toggleAttribute('inert', !active);
      card.setAttribute('aria-hidden', String(!active));
      card.classList.toggle('rv-discovery-card-active', active);
      if (active) complete = enhanceCard(card, language(), state.current, state.total) && complete;
    });

    meta.hidden = false;
    position.textContent = discoveryDeckCopy(language(), 'position', state);
    guidance.textContent = discoveryDeckCopy(language(), 'guidance', state);
    progress.setAttribute('aria-valuenow', String(state.percent));
    bar.style.width = `${state.percent}%`;

    if (!complete) showDeckDefect(discoveryDeckCopy(language(), 'incomplete'));
    deck.lastRemaining = remaining;
  }

  function scheduleSync() {
    if (deck.scheduled) return;
    deck.scheduled = true;
    globalThis.requestAnimationFrame(syncDeck);
  }

  const observer = new MutationObserver(scheduleSync);
  observer.observe(list, { childList: true });

  refresh?.addEventListener('click', () => {
    deck.resetRequested = true;
  }, { capture: true });

  globalThis.addEventListener('rendezvue:language-change', scheduleSync);
  globalThis.addEventListener('pagehide', () => observer.disconnect(), { once: true });
  scheduleSync();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseDiscoveryDeck, { once: true });
  } else {
    queueMicrotask(initialiseDiscoveryDeck);
  }
}
