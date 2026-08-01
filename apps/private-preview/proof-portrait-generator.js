import { supabase } from './app.js';

const CONFIG_KEY = 'rendezvue.wp057.config.v1';
const actions = document.querySelector('.proof-actions');
const output = document.querySelector('#result-output');
const logList = document.querySelector('#proof-log');

if (!actions || !output || !logList) throw new Error('WP-057 portrait generator UI is incomplete');

const button = document.createElement('button');
button.id = 'wp057-generate-portrait';
button.type = 'button';
button.textContent = 'Synthetisch proofportret genereren';
actions.append(button);

function appendLog(message, level = 'info') {
  const item = document.createElement('li');
  item.textContent = `${new Date().toLocaleTimeString('nl-NL')} — ${message}`;
  if (level === 'error') item.classList.add('error');
  logList.prepend(item);
}

function unwrap(result, operation) {
  if (result?.error) throw new Error(`${operation}: ${result.error.message ?? 'onbekende fout'}`);
  return result?.data ?? null;
}

function loadProofConfig() {
  const parsed = JSON.parse(localStorage.getItem(CONFIG_KEY) ?? 'null');
  if (!parsed?.runId || !['a', 'b'].includes(parsed.role)) {
    throw new Error('Stel eerst een geldige WP-057 run-ID en browserrol in');
  }
  return parsed;
}

function hashRun(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function drawSyntheticPortrait(config) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('Browsercanvas is niet beschikbaar');

  const seed = hashRun(`${config.runId}.${config.role}`);
  const hue = config.role === 'a' ? 28 + (seed % 24) : 168 + (seed % 34);
  const accent = (hue + 62) % 360;

  const background = context.createLinearGradient(0, 0, 512, 512);
  background.addColorStop(0, `hsl(${hue} 52% 88%)`);
  background.addColorStop(1, `hsl(${accent} 42% 78%)`);
  context.fillStyle = background;
  context.fillRect(0, 0, 512, 512);

  context.globalAlpha = 0.18;
  for (let index = 0; index < 18; index += 1) {
    context.beginPath();
    context.arc((seed * (index + 3)) % 512, (seed * (index + 11)) % 512, 18 + ((seed + index * 17) % 58), 0, Math.PI * 2);
    context.fillStyle = `hsl(${(hue + index * 19) % 360} 48% 55%)`;
    context.fill();
  }
  context.globalAlpha = 1;

  context.fillStyle = `hsl(${(hue + 190) % 360} 28% 24%)`;
  context.beginPath();
  context.ellipse(256, 238, 106, 128, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = `hsl(${(hue + 32) % 360} 38% 70%)`;
  context.beginPath();
  context.ellipse(256, 246, 82, 100, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = `hsl(${(accent + 180) % 360} 32% 30%)`;
  context.beginPath();
  context.moveTo(104, 512);
  context.quadraticCurveTo(128, 355, 256, 344);
  context.quadraticCurveTo(384, 355, 408, 512);
  context.closePath();
  context.fill();

  context.strokeStyle = 'rgba(255,255,255,0.55)';
  context.lineWidth = 7;
  context.beginPath();
  context.arc(256, 248, 155, 0.18 * Math.PI, 0.82 * Math.PI);
  context.stroke();

  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Synthetisch WebP-portret kon niet worden gemaakt'));
    }, 'image/webp', 0.86);
  });
}

button.addEventListener('click', async () => {
  button.disabled = true;
  let uploadedPath = null;
  try {
    const config = loadProofConfig();
    const authData = unwrap(await supabase.auth.getUser(), 'Gebruiker ophalen mislukt');
    const user = authData?.user;
    if (!user) throw new Error('Meld eerst het gecontroleerde synthetische account aan');

    const blob = await canvasToBlob(drawSyntheticPortrait(config));
    const objectPath = `${user.id}/${crypto.randomUUID()}.webp`;
    uploadedPath = objectPath;

    unwrap(await supabase.storage.from('privacy-portraits').upload(objectPath, blob, {
      cacheControl: '3600',
      contentType: 'image/webp',
      upsert: false
    }), 'Synthetisch portret uploaden mislukt');

    unwrap(await supabase
      .from('privacy_portraits')
      .update({ is_public_profile_portrait: false })
      .eq('user_id', user.id)
      .eq('is_public_profile_portrait', true), 'Vorige profielportret deselecteren mislukt');

    const portrait = unwrap(await supabase
      .from('privacy_portraits')
      .insert({
        user_id: user.id,
        object_path: objectPath,
        treatment: 'wp057-browser-generated-synthetic',
        status: 'pending',
        is_public_profile_portrait: true
      })
      .select('status,is_public_profile_portrait,treatment')
      .single(), 'Synthetisch portret registreren mislukt');

    unwrap(await supabase.rpc('save_onboarding_progress', {
      p_current_stage: 'preview',
      p_completed_stages: ['eligibility', 'account', 'identity', 'life_stage', 'family', 'portrait', 'faith', 'personality'],
      p_schema_version: 1
    }), 'Onboardingvoortgang na portret opslaan mislukt');

    output.textContent = JSON.stringify({
      portraitGeneratedInBrowser: true,
      objectStoredPrivately: true,
      status: portrait.status,
      selected: portrait.is_public_profile_portrait === true,
      treatment: portrait.treatment
    }, null, 2);

    globalThis.dispatchEvent(new CustomEvent('rendezvue:proof-event', {
      detail: { step: 'portraitSelected', status: 'pass', details: { count: 1, present: true } }
    }));
    appendLog('Synthetisch WP-057 privacyportret in de browser gemaakt, privé geüpload en geselecteerd.');
  } catch (error) {
    if (uploadedPath) {
      await supabase.storage.from('privacy-portraits').remove([uploadedPath]).catch(() => undefined);
    }
    appendLog(error instanceof Error ? error.message : String(error), 'error');
  } finally {
    button.disabled = false;
  }
});
