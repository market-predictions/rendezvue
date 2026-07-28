import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function replaceRequired(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`Filter-grid build patch could not find ${label}.`);
  return source.replace(before, after);
}

export async function applyPrivacyFilterGrid(targetDirectory) {
  const appPath = resolve(targetDirectory, 'app.js');
  const i18nPath = resolve(targetDirectory, 'src/i18n.js');
  const stylesPath = resolve(targetDirectory, 'styles.css');

  let app = await readFile(appPath, 'utf8');
  app = replaceRequired(
    app,
    "import { createFallbackAvatar, stylizeFrame } from './src/avatar.js';",
    "import { createFallbackAvatar, createFallbackAvatarVariants, generateAvatarVariants, stylizeFrame } from './src/avatar.js';",
    'avatar import'
  );

  app = replaceRequired(
    app,
    "function avatarView() { return `<main class=\"shell\">${step(3, 'stepAvatar')}<section class=\"card\">${badge(tr('illustratedPreview'), 'warning')}<h1>${esc(tr('yourAvatar'))}</h1><p>${esc(tr('avatarBody'))}</p><div class=\"avatar-preview illustrated\"><img src=\"${avatar()}\" alt=\"${esc(tr('yourAvatar'))}\"></div>${note(tr('avatarRule'))}<div class=\"actions\"><button class=\"quiet\" data-do=\"retake\">${esc(tr('retake'))}</button><button class=\"primary\" data-do=\"accept-avatar\">${esc(tr('useAvatar'))}</button></div></section></main>`; }",
    `function avatarView() {
  const variants = state.avatarVariants || [];
  const cards = variants.map((variant) => {
    const selected = state.selectedAvatarStyle === variant.id;
    return \`<button type="button" class="privacy-filter-card \${selected ? 'selected' : ''}" data-do="select-avatar" data-value="\${esc(variant.id)}" role="radio" aria-checked="\${selected}"><img src="\${variant.dataUrl}" alt="\${esc(optionLabel('avatarStyles', variant.id))}"><span><strong>\${esc(optionLabel('avatarStyles', variant.id))}</strong><small>\${esc(optionLabel('avatarPrivacy', variant.privacy))}</small></span><i aria-hidden="true">✓</i></button>\`;
  }).join('');
  return \`<main class="shell">\${step(3, 'stepAvatar')}<section class="card">\${badge(tr('filterPreview'), 'warning')}<h1>\${esc(tr('chooseAvatar'))}</h1><p>\${esc(tr('avatarBody'))}</p><div class="privacy-filter-grid" role="radiogroup" aria-label="\${esc(tr('chooseAvatar'))}">\${cards}</div>\${note(tr('avatarRule'))}<div class="actions"><button class="quiet" data-do="retake">\${esc(tr('retake'))}</button><button class="primary" data-do="accept-avatar" \${state.avatarDataUrl ? '' : 'disabled'}>\${esc(tr('useAvatar'))}</button></div></section></main>\`;
}`,
    'avatar view'
  );

  app = replaceRequired(
    app,
    "state.capturedFrame = captureFrame(video); state.avatarDataUrl = stylizeFrame(state.capturedFrame); state.captureComplete = true;",
    "state.capturedFrame = captureFrame(video); state.avatarVariants = generateAvatarVariants(state.capturedFrame); state.selectedAvatarStyle = state.avatarVariants[0].id; state.avatarDataUrl = state.avatarVariants[0].dataUrl; state.captureComplete = true;",
    'camera avatar generation'
  );

  app = replaceRequired(
    app,
    "if (action === 'fallback') { state.avatarDataUrl = createFallbackAvatar(); state.captureComplete = true; return go('avatar'); }",
    "if (action === 'fallback') { state.avatarVariants = createFallbackAvatarVariants(); state.selectedAvatarStyle = state.avatarVariants[0].id; state.avatarDataUrl = state.avatarVariants[0].dataUrl; state.captureComplete = true; return go('avatar'); }",
    'fallback avatar generation'
  );

  app = replaceRequired(
    app,
    "if (action === 'retake') { state.avatarDataUrl = null; state.capturedFrame = null; return go('capture'); }",
    "if (action === 'retake') { state.avatarDataUrl = null; state.avatarVariants = []; state.selectedAvatarStyle = ''; state.capturedFrame = null; return go('capture'); }",
    'avatar retake reset'
  );

  app = replaceRequired(
    app,
    "if (action === 'accept-avatar') { if (videoUrl) URL.revokeObjectURL(videoUrl); videoUrl = null; state.avatarAccepted = true; return go('profile'); }",
    "if (action === 'select-avatar') { const variant = state.avatarVariants?.find((item) => item.id === target.dataset.value); if (!variant) return; state.selectedAvatarStyle = variant.id; state.avatarDataUrl = variant.dataUrl; return render(); }\n  if (action === 'accept-avatar') { if (!state.avatarDataUrl) return notify(tr('selectFilterFirst')); if (videoUrl) URL.revokeObjectURL(videoUrl); videoUrl = null; state.avatarAccepted = true; return go('profile'); }",
    'avatar selection action'
  );

  await writeFile(appPath, app, 'utf8');

  let i18n = await readFile(i18nPath, 'utf8');
  i18n = replaceRequired(
    i18n,
    "stepAvatar: 'Avatarvoorbeeld', illustratedPreview: 'Geïllustreerd prototype', yourAvatar: 'Jouw privacy-avatar',\n    avatarBody: 'Deze lokale illustratiestijl test een zachtere, romantischere avatar. Het is nog niet het uiteindelijke generatieve model.',\n    avatarRule: '<strong>Productieregel:</strong> flatterend en stijlvol mag; leeftijd, huidskleur en gezichtsstructuur wezenlijk veranderen niet.', retake: 'Opnieuw opnemen', useAvatar: 'Gebruik avatar',",
    "stepAvatar: 'Privacyfilter', illustratedPreview: 'Geïllustreerd prototype', filterPreview: 'Vier lokale varianten', yourAvatar: 'Jouw privacyportret', chooseAvatar: 'Kies hoe privé je portret wordt',\n    avatarBody: 'Alle vier varianten komen uit hetzelfde camerabeeld en blijven lokaal in je browser. Kies de balans tussen herkenbaarheid en privacy die bij jou past.',\n    avatarRule: '<strong>Privacygrens:</strong> geen enkele optie toont de onbewerkte selfie. Meer vervaging geeft meer afstand, maar geen volledige anonimiteit.', retake: 'Opnieuw opnemen', useAvatar: 'Gebruik dit portret', selectFilterFirst: 'Kies eerst een privacyfilter.',",
    'Dutch avatar copy'
  );
  i18n = replaceRequired(
    i18n,
    "educationLabels: { mbo: 'MBO', hbo: 'HBO', wo: 'WO' },",
    "avatarStyles: { softFocus: 'Zachte focus', warmVeil: 'Warme sluier', monoMist: 'Monochrome mist', privacyMax: 'Extra privé' },\n    avatarPrivacy: { balanced: 'Meer herkenbaar', private: 'Meer privé', maximum: 'Meeste privacy' },\n    educationLabels: { mbo: 'MBO', hbo: 'HBO', wo: 'WO' },",
    'Dutch filter labels'
  );
  i18n = replaceRequired(
    i18n,
    "cameraReady: 'Camera ready.', cameraFailed: 'Camera could not start.', recordingFailed: 'Recording failed.', stepAvatar: 'Avatar preview', illustratedPreview: 'Illustrated prototype', yourAvatar: 'Your privacy avatar',\n    avatarBody: 'This local illustration treatment tests a softer, more romantic avatar. It is not the final generative model.', avatarRule: '<strong>Production rule:</strong> flattering and stylish is acceptable; materially changing age, skin tone or facial structure is not.',\n    retake: 'Retake', useAvatar: 'Use avatar',",
    "cameraReady: 'Camera ready.', cameraFailed: 'Camera could not start.', recordingFailed: 'Recording failed.', stepAvatar: 'Privacy filter', illustratedPreview: 'Illustrated prototype', filterPreview: 'Four local variants', yourAvatar: 'Your privacy portrait', chooseAvatar: 'Choose how private your portrait should be',\n    avatarBody: 'All four variants come from the same camera frame and remain local in your browser. Choose the balance between recognisability and privacy that suits you.', avatarRule: '<strong>Privacy floor:</strong> no option shows the unedited selfie. Stronger blur creates more distance, but not complete anonymity.',\n    retake: 'Retake', useAvatar: 'Use this portrait', selectFilterFirst: 'Choose a privacy filter first.',",
    'English avatar copy'
  );
  i18n = replaceRequired(
    i18n,
    "educationLabels: { mbo: 'MBO – vocational', hbo: 'HBO – applied sciences', wo: 'WO – research university' },",
    "avatarStyles: { softFocus: 'Soft focus', warmVeil: 'Warm veil', monoMist: 'Monochrome mist', privacyMax: 'Extra private' },\n    avatarPrivacy: { balanced: 'More recognisable', private: 'More private', maximum: 'Most private' },\n    educationLabels: { mbo: 'MBO – vocational', hbo: 'HBO – applied sciences', wo: 'WO – research university' },",
    'English filter labels'
  );
  await writeFile(i18nPath, i18n, 'utf8');

  let styles = await readFile(stylesPath, 'utf8');
  styles += `\n\n/* Privacy filter selection grid */\n.privacy-filter-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.72rem;margin:1rem 0 1.15rem}\n.privacy-filter-card{position:relative;min-height:0;padding:.48rem;border:2px solid var(--line);border-radius:22px;text-align:left;color:var(--ink);background:#fff;box-shadow:0 8px 24px rgba(55,31,52,.08);overflow:hidden}\n.privacy-filter-card img{display:block;width:100%;aspect-ratio:.81;object-fit:cover;border-radius:16px;background:var(--lav)}\n.privacy-filter-card span{display:grid;gap:.12rem;padding:.58rem .28rem .22rem}\n.privacy-filter-card strong{font-size:.82rem;line-height:1.15}\n.privacy-filter-card small{font-size:.7rem}\n.privacy-filter-card i{position:absolute;top:.72rem;right:.72rem;width:28px;height:28px;display:none;place-items:center;border-radius:50%;color:#fff;background:var(--plum);font-style:normal;box-shadow:0 5px 14px rgba(55,31,52,.24)}\n.privacy-filter-card.selected{border-color:var(--plum);box-shadow:0 11px 30px rgba(109,49,88,.20);transform:translateY(-2px)}\n.privacy-filter-card.selected i{display:grid}\n.privacy-filter-card:focus-visible{outline:3px solid rgba(109,49,88,.28);outline-offset:2px}\n@media(max-width:370px){.privacy-filter-grid{gap:.5rem}.privacy-filter-card{padding:.36rem;border-radius:18px}.privacy-filter-card img{border-radius:13px}.privacy-filter-card strong{font-size:.76rem}}\n`;
  await writeFile(stylesPath, styles, 'utf8');
}
