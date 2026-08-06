const MODULE = './privacy-portrait-controller.js';
let loading = false;
let observer = null;

async function activateWhenReady() {
  if (loading || !document.querySelector('#rv-portrait-form')) return;
  loading = true;
  observer?.disconnect();
  await import(MODULE);
}

observer = new MutationObserver(() => {
  activateWhenReady().catch((error) => console.error('Privacy portrait activation failed', error));
});
observer.observe(document.documentElement, { childList: true, subtree: true });
activateWhenReady().catch((error) => console.error('Privacy portrait activation failed', error));

globalThis.addEventListener('pagehide', () => observer?.disconnect(), { once: true });
