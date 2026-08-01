const anchor = document.querySelector('#auth-panel');

if (!anchor) throw new Error('WP-057 proof console anchor is missing');

const section = document.createElement('section');
section.className = 'panel proof-console';
section.id = 'wp057-proof-console';
section.innerHTML = `
  <div class="proof-console-heading">
    <div>
      <p class="eyebrow">WP-057 · CONTROLLED TWO-ACCOUNT PROOF</p>
      <h2>Begeleide Cloudflare-browsertest</h2>
    </div>
    <span id="wp057-status" class="badge muted">0/20 geslaagd</span>
  </div>
  <p class="hint">Gebruik dezelfde run-ID in twee geïsoleerde browserprofielen. Kies rol A voor het synthetische vrouwenprofiel en rol B voor het synthetische mannenprofiel. E-mailadressen, tokens, UUID's, objectpaden en signed URL's worden niet in het bewijs opgenomen.</p>
  <div class="grid-form proof-config">
    <label>
      Gedeelde proof-run-ID
      <input id="wp057-run-id" autocomplete="off" spellcheck="false" placeholder="wp57-20260801-abc123">
    </label>
    <label>
      Browserrol
      <select id="wp057-role">
        <option value="">Kies rol</option>
        <option value="a">Rol A · synthetische vrouw</option>
        <option value="b">Rol B · synthetische man</option>
      </select>
    </label>
  </div>
  <div class="action-grid proof-actions">
    <button id="wp057-new-run" class="secondary" type="button">Nieuwe run-ID</button>
    <button id="wp057-configure" type="button">Rol instellen en fixture invullen</button>
    <button id="wp057-refresh-session" class="secondary" type="button">Sessierestore met refresh testen</button>
    <button id="wp057-like-peer" type="button">Gekoppeld proofprofiel liken</button>
    <button id="wp057-diagnostics" class="secondary" type="button">Diagnostiek uitvoeren</button>
    <button id="wp057-copy-evidence" class="secondary" type="button">Gesanitiseerd bewijs kopiëren</button>
    <button id="wp057-reset" class="secondary" type="button">Lokale proofstatus resetten</button>
  </div>
  <p id="wp057-next-action" class="proof-next" aria-live="polite">Maak één run-ID en gebruik exact dezelfde run-ID in beide geïsoleerde browserprofielen.</p>
  <ol id="wp057-checklist" class="proof-checklist"></ol>
  <details class="proof-evidence-details">
    <summary>Gesanitiseerde evidence-preview</summary>
    <pre id="wp057-evidence-preview"></pre>
  </details>
`;
anchor.before(section);

const userSummary = document.querySelector('#user-summary');
if (userSummary) {
  const scrubIdentity = () => {
    if (userSummary.textContent !== '—' && userSummary.textContent !== 'Gecontroleerd synthetisch testaccount actief') {
      userSummary.textContent = 'Gecontroleerd synthetisch testaccount actief';
    }
  };
  new MutationObserver(scrubIdentity).observe(userSummary, { childList: true, characterData: true, subtree: true });
  scrubIdentity();
}
