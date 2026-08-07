const MODULE = './privacy-portrait-controller.js';
const LADDER_UI = './privacy-portrait-ladder-ui.js';
let loading = false;
let observer = null;

function detachLegacyFileListener() {
  const legacyInput = document.querySelector('#rv-portrait-file');
  if (!legacyInput || legacyInput.dataset.wp074Clean === 'true') return;
  const cleanInput = legacyInput.cloneNode(true);
  cleanInput.dataset.wp074Clean = 'true';
  legacyInput.replaceWith(cleanInput);
}

async function activateWhenReady() {
  if (loading || !document.querySelector('#rv-portrait-form')) return;
  loading = true;
  observer?.disconnect();
  detachLegacyFileListener();
  await import(MODULE);
  await import(LADDER_UI);
}

observer = new MutationObserver(() => {
  activateWhenReady().catch((error) => console.error('Privacy portrait activation failed', error));
});
observer.observe(document.documentElement, { childList: true, subtree: true });
activateWhenReady().catch((error) => console.error('Privacy portrait activation failed', error));

globalThis.addEventListener('pagehide', () => observer?.disconnect(), { once: true });
