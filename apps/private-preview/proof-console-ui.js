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

const style = document.createElement('style');
style.textContent = `
  .proof-console { border-color: #aacdbf; }
  .proof-console-heading { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
  .proof-console-heading h2 { margin-top: 0.15rem; }
  .proof-config { margin-top: 1rem; }
  .proof-actions { grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 1rem; }
  .proof-next { margin: 1rem 0; padding: 0.85rem 1rem; border-radius: 0.8rem; background: #eef7f3; line-height: 1.45; }
  .proof-checklist { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.55rem; padding: 0; list-style: none; }
  .proof-step { display: grid; grid-template-columns: 1.6rem 1fr; gap: 0.55rem; align-items: start; border: 1px solid #e0d7cc; border-radius: 0.7rem; padding: 0.65rem 0.75rem; line-height: 1.35; }
  .proof-step-marker { display: inline-grid; place-items: center; width: 1.35rem; height: 1.35rem; border-radius: 999px; background: #ece6de; font-weight: 900; }
  .proof-step.pass { border-color: #a9d1c0; background: #f1f9f5; }
  .proof-step.pass .proof-step-marker { background: #1f6b55; color: white; }
  .proof-step.blocked { border-color: #e0aaa2; background: #fff3f1; }
  .proof-step.blocked .proof-step-marker { background: #a53b32; color: white; }
  .proof-evidence-details { margin-top: 1rem; }
  .proof-evidence-details summary { cursor: pointer; font-weight: 750; margin-bottom: 0.75rem; }
  @media (max-width: 760px) {
    .proof-console-heading { display: grid; }
    .proof-actions, .proof-checklist { grid-template-columns: 1fr; }
  }
`;
document.head.append(style);

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
