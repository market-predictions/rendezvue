import { supabase } from './app.js';
import { createOnboardingRepository } from './src/onboarding-repository.js';
import {
  PRODUCT_STAGES,
  buildOnboardingPayload,
  derivePartnerSex,
  normaliseProductLanguage,
  onboardingProgress,
  productCopy,
  profilePreview,
  projectDiscoveryProfile,
  resolveProductTab
} from './product-model.js';

const STYLE_ID = 'rendezvue-product-shell-style';
if (!document.querySelector(`#${STYLE_ID}`)) {
  const link = document.createElement('link');
  link.id = STYLE_ID;
  link.rel = 'stylesheet';
  link.href = './product-shell.css';
  document.head.append(link);
}

const authenticatedArea = document.querySelector('#authenticated-area');
const signedInCard = authenticatedArea?.querySelector('.signed-in-card');
const settingsCard = authenticatedArea?.querySelector('.settings-card');
const advancedTools = authenticatedArea?.querySelector('.advanced-tools');
const onboarding = createOnboardingRepository(supabase);

const state = {
  language: normaliseProductLanguage(document.documentElement.lang),
  user: null,
  snapshot: null,
  completedStages: new Set(),
  currentTab: 'home',
  localPortraitUrl: null,
  ownPortraitUrl: null,
  discovery: [],
  activeMatch: null,
  activeConversation: null,
  otherUserId: null,
  otherProfile: null,
  matchedPortraitUrl: null,
  realtimeChannel: null
};

function productTemplate() {
  return `
    <section id="rendezvue-product-app" class="rv-app" aria-label="Rendezvue product experience">
      <header class="rv-app-header">
        <div>
          <p data-rv-i18n="home.eyebrow">JOUW RENDEZVUE</p>
          <h2>Rendezvue</h2>
        </div>
        <span id="rv-stage-pill" class="rv-stage-pill">0%</span>
      </header>

      <nav class="rv-nav" aria-label="Rendezvue">
        <button type="button" data-rv-tab="home" class="active" data-rv-i18n="nav.home">Start</button>
        <button type="button" data-rv-tab="profile" data-rv-i18n="nav.profile">Profiel</button>
        <button type="button" data-rv-tab="discover" data-rv-i18n="nav.discover">Ontdekken</button>
        <button type="button" data-rv-tab="matches" data-rv-i18n="nav.matches">Matches</button>
        <button type="button" data-rv-tab="account" data-rv-i18n="nav.account">Account</button>
      </nav>

      <div id="rv-global-status" class="rv-status" role="status" aria-live="polite" hidden></div>

      <section class="rv-view active" data-rv-view="home">
        <article class="rv-card rv-hero-card">
          <p data-rv-i18n="home.eyebrow">JOUW RENDEZVUE</p>
          <h2 data-rv-i18n="home.title">Rustig kennismaken, met duidelijke intenties.</h2>
          <p data-rv-i18n="home.intro">Maak je profiel af, kies een privacyportret en ontdek andere synthetische proefprofielen.</p>
          <div class="rv-progress-wrap">
            <div class="rv-progress-meta">
              <span data-rv-i18n="home.progress">Profielvoortgang</span>
              <strong id="rv-progress-label">0 / 8</strong>
            </div>
            <div class="rv-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="rv-progress-bar"></span></div>
          </div>
          <div class="rv-hero-actions">
            <button type="button" data-rv-go="profile" data-rv-i18n="home.continue">Ga verder met je profiel</button>
            <button type="button" class="secondary" data-rv-go="discover" data-rv-i18n="home.discover">Bekijk profielen</button>
          </div>
        </article>
        <p class="rv-status warning" data-rv-i18n="home.staging">Dit blijft een gecontroleerde synthetische testomgeving. Er worden geen echte gebruikers toegelaten.</p>
      </section>

      <section class="rv-view" data-rv-view="profile">
        <article class="rv-card">
          <div class="rv-section-heading">
            <div>
              <h2 data-rv-i18n="profile.title">Bouw je profiel</h2>
              <p data-rv-i18n="profile.intro">Je antwoorden helpen om relevante profielen te tonen.</p>
            </div>
          </div>
          <form id="rv-profile-form" class="rv-form" novalidate>
            <fieldset class="rv-fieldset">
              <legend data-rv-i18n="profile.eligibility">Basis en intentie</legend>
              <label class="wide"><span data-rv-i18n="profile.birthDate">Geboortedatum</span><input id="rv-date-of-birth" type="date" required value="1998-01-01"></label>
              <div class="rv-checks">
                <label class="rv-check"><input id="rv-adult-confirmed" type="checkbox" required checked><span data-rv-i18n="profile.adult">Ik ben 18 jaar of ouder</span></label>
                <label class="rv-check"><input id="rv-single-confirmed" type="checkbox" required checked><span data-rv-i18n="profile.single">Ik ben op dit moment single</span></label>
                <label class="rv-check"><input id="rv-serious-confirmed" type="checkbox" required checked><span data-rv-i18n="profile.serious">Ik zoek een serieuze kennismaking</span></label>
                <label class="rv-check"><input id="rv-community-confirmed" type="checkbox" required checked><span data-rv-i18n="profile.community">Ik begrijp de uitgangspunten van deze community</span></label>
              </div>
            </fieldset>

            <fieldset class="rv-fieldset">
              <legend data-rv-i18n="profile.identity">Wie ben je?</legend>
              <label><span data-rv-i18n="profile.nickname">Voornaam of schermnaam</span><input id="rv-nickname" maxlength="80" required value="Proof Noor"></label>
              <label><span data-rv-i18n="profile.sex">Sekse</span><select id="rv-sex" required><option value="woman" data-rv-i18n="profile.sexWoman">Vrouw</option><option value="man" data-rv-i18n="profile.sexMan">Man</option></select></label>
              <p id="rv-derived-partner" class="rv-derived"></p>
              <label><span data-rv-i18n="profile.city">Regio of stad</span><input id="rv-city" maxlength="120" required value="Utrecht"></label>
              <label><span data-rv-i18n="profile.intent">Wat zoek je?</span><input id="rv-relationship-intent" required value="Serieuze kennismaking met huwelijk als doel"></label>
              <label class="wide"><span data-rv-i18n="profile.bio">Korte bio</span><textarea id="rv-bio" maxlength="1200">Ik houd van rustige gesprekken, familie en nieuwe plekken ontdekken.</textarea></label>
            </fieldset>

            <fieldset class="rv-fieldset">
              <legend data-rv-i18n="profile.life">Studie en levensfase</legend>
              <label><span data-rv-i18n="profile.lifeStage">Levensfase</span><select id="rv-life-stage"><option value="student" data-rv-i18n="profile.student">Student</option><option value="recent_graduate" data-rv-i18n="profile.graduate">Recent afgestudeerd</option><option value="employed" data-rv-i18n="profile.employed">Werkend</option><option value="self_employed" data-rv-i18n="profile.selfEmployed">Zelfstandig</option></select></label>
              <label id="rv-education-wrap"><span data-rv-i18n="profile.education">Opleidingsniveau</span><select id="rv-education"><option value="mbo" data-rv-i18n="profile.educationMbo">MBO</option><option value="hbo" selected data-rv-i18n="profile.educationHbo">HBO</option><option value="wo" data-rv-i18n="profile.educationWo">WO</option></select></label>
              <label id="rv-study-wrap"><span data-rv-i18n="profile.studyField">Studie of vakgebied</span><input id="rv-study-field" value="Zorg en welzijn"></label>
              <label id="rv-occupation-wrap" hidden><span data-rv-i18n="profile.occupation">Werkgebied</span><input id="rv-occupation" value="Zorg"></label>
            </fieldset>

            <fieldset class="rv-fieldset">
              <legend data-rv-i18n="profile.family">Gezin en toekomst</legend>
              <label><span data-rv-i18n="profile.marital">Huwelijksverleden</span><select id="rv-marital-history"><option value="never_married" data-rv-i18n="profile.neverMarried">Nooit getrouwd</option><option value="divorced" data-rv-i18n="profile.divorced">Gescheiden</option><option value="widowed" data-rv-i18n="profile.widowed">Weduwe of weduwnaar</option></select></label>
              <label><span data-rv-i18n="profile.children">Heb je kinderen?</span><select id="rv-has-children"><option value="no" data-rv-i18n="profile.no">Nee</option><option value="yes" data-rv-i18n="profile.yes">Ja</option></select></label>
              <label><span data-rv-i18n="profile.wantsChildren">Wil je kinderen?</span><select id="rv-wants-children"><option value="yes">Ja / Yes</option><option value="maybe" selected>Misschien / Maybe</option><option value="no">Nee / No</option></select></label>
              <label><span data-rv-i18n="profile.acceptsChildren">Sta je open voor iemand met kinderen?</span><select id="rv-accepts-children"><option value="yes">Ja / Yes</option><option value="maybe" selected>Misschien / Maybe</option><option value="no">Nee / No</option></select></label>
            </fieldset>

            <fieldset class="rv-fieldset">
              <legend data-rv-i18n="profile.faith">Geloof en leefstijl</legend>
              <label class="wide"><span data-rv-i18n="profile.faithIdentity">Hoe omschrijf je je religieuze achtergrond?</span><input id="rv-faith-identity" value="Moslimachtergrond"></label>
              <label class="wide"><span data-rv-i18n="profile.practice">Wat betekent geloof of leefstijl in je dagelijks leven?</span><textarea id="rv-practice-description">Ik probeer bewust te leven en bespreek persoonlijke invulling liever rustig samen.</textarea></label>
              <label><span data-rv-i18n="profile.compatibility">Hoe belangrijk is overeenstemming hierover?</span><select id="rv-compatibility"><option value="important">Belangrijk / Important</option><option value="discuss_personally" selected>Persoonlijk bespreken / Discuss personally</option><option value="flexible">Flexibel / Flexible</option></select></label>
              <label><span data-rv-i18n="profile.visibility">Wanneer mag dit zichtbaar zijn?</span><select id="rv-practice-visibility"><option value="public" data-rv-i18n="profile.public">Op mijn profiel</option><option value="after_match" selected data-rv-i18n="profile.afterMatch">Na een match</option><option value="private" data-rv-i18n="profile.private">Privé houden</option></select></label>
              <label class="wide">Leefstijltags / Lifestyle tags<input id="rv-lifestyle-tags" value="halal-bewust, familiegericht"></label>
            </fieldset>

            <fieldset class="rv-fieldset">
              <legend data-rv-i18n="profile.personality">Persoonlijkheid</legend>
              <label class="wide"><span data-rv-i18n="profile.promptOne">Mijn ideale rustige dag…</span><input id="rv-prompt-one" required value="Koffie, een wandeling en een goed gesprek."></label>
              <label class="wide"><span data-rv-i18n="profile.promptTwo">Wat ik belangrijk vind in iemand…</span><input id="rv-prompt-two" required value="Eerlijkheid, humor en duidelijke intenties."></label>
              <label class="wide"><span data-rv-i18n="profile.interests">Interesses, gescheiden door komma’s</span><input id="rv-interests" required value="boeken, wandelen, koken, technologie"></label>
            </fieldset>

            <div class="rv-form-actions"><button type="submit" data-rv-i18n="profile.save">Profiel opslaan en doorgaan</button></div>
          </form>
          <div id="rv-profile-status" class="rv-status" role="status" hidden></div>
        </article>

        <article class="rv-card">
          <div class="rv-section-heading"><div><h2 data-rv-i18n="portrait.title">Kies je privacyportret</h2><p data-rv-i18n="portrait.intro">Gebruik uitsluitend een synthetische afbeelding in deze test.</p></div></div>
          <div class="rv-portrait-grid">
            <div id="rv-portrait-preview" class="rv-portrait-preview"><span data-rv-i18n="portrait.none">Nog geen portret gekozen</span></div>
            <div class="rv-portrait-copy">
              <form id="rv-portrait-form" class="rv-form">
                <label><span data-rv-i18n="portrait.file">JPEG, PNG of WebP</span><input id="rv-portrait-file" type="file" accept="image/jpeg,image/png,image/webp" required></label>
                <button type="submit" data-rv-i18n="portrait.upload">Uploaden en selecteren</button>
              </form>
              <div id="rv-portrait-status" class="rv-status" role="status" hidden></div>
            </div>
          </div>
        </article>

        <article class="rv-card">
          <div class="rv-section-heading"><div><h2 data-rv-i18n="preview.title">Zo ziet je profiel eruit</h2><p data-rv-i18n="preview.intro">Controleer je profiel voordat je het publiceert.</p></div></div>
          <div id="rv-profile-preview" class="rv-profile-preview"></div>
          <div class="rv-form-actions"><button id="rv-publish-profile" type="button" data-rv-i18n="preview.publish">Profiel publiceren</button></div>
          <div id="rv-publish-status" class="rv-status" role="status" hidden></div>
        </article>
      </section>

      <section class="rv-view" data-rv-view="discover">
        <article class="rv-card">
          <div class="rv-section-heading"><div><h2 data-rv-i18n="discover.title">Ontdekken</h2><p data-rv-i18n="discover.intro">Alle getoonde personen zijn synthetische proefprofielen.</p></div><button id="rv-refresh-discovery" class="secondary" type="button" data-rv-i18n="discover.refresh">Profielen vernieuwen</button></div>
          <div id="rv-discovery-status" class="rv-status" role="status" hidden></div>
          <div id="rv-discovery-list" class="rv-discovery-stack"></div>
        </article>
      </section>

      <section class="rv-view" data-rv-view="matches">
        <article class="rv-card">
          <div class="rv-section-heading"><div><h2 data-rv-i18n="matches.title">Matches en gesprek</h2><p data-rv-i18n="matches.intro">Een gesprek ontstaat pas na wederzijdse interesse.</p></div><button id="rv-refresh-match" class="secondary" type="button" data-rv-i18n="matches.refresh">Status vernieuwen</button></div>
          <div id="rv-match-status" class="rv-status" role="status" hidden></div>
          <div id="rv-match-content" class="rv-empty" data-rv-i18n="matches.none">Nog geen actieve match.</div>
        </article>

        <article class="rv-card">
          <h2 data-rv-i18n="chat.title">Gesprek</h2>
          <div id="rv-chat-list" class="rv-chat"><div class="rv-chat-empty" data-rv-i18n="chat.empty">Nog geen berichten.</div></div>
          <form id="rv-chat-form" class="rv-chat-form">
            <label class="rv-visually-hidden" for="rv-message-body" data-rv-i18n="chat.title">Gesprek</label>
            <input id="rv-message-body" maxlength="4000" required data-rv-i18n-placeholder="chat.placeholder" placeholder="Schrijf een bericht…">
            <button type="submit" data-rv-i18n="chat.send">Versturen</button>
          </form>
        </article>

        <article class="rv-card">
          <h2 data-rv-i18n="safety.title">Contact en veiligheid</h2>
          <div class="rv-safety-grid">
            <button id="rv-end-contact" class="secondary" type="button" data-rv-i18n="safety.end">Contact beëindigen</button>
            <button id="rv-block-user" class="danger" type="button" data-rv-i18n="safety.block">Blokkeren</button>
            <button id="rv-toggle-report" class="secondary" type="button" data-rv-i18n="safety.report">Melden</button>
          </div>
          <form id="rv-report-form" class="rv-report-form">
            <label><span data-rv-i18n="safety.reportCategory">Wat is er aan de hand?</span><select id="rv-report-category"><option value="hidden_relationship" data-rv-i18n="safety.hiddenRelationship">Mogelijk verborgen relatie</option><option value="scam_money" data-rv-i18n="safety.scam">Geldvraag of scam</option><option value="harassment" data-rv-i18n="safety.harassment">Druk of intimidatie</option><option value="other_proof" data-rv-i18n="safety.other">Iets anders</option></select></label>
            <label><span data-rv-i18n="safety.description">Korte toelichting</span><textarea id="rv-report-description" maxlength="4000"></textarea></label>
            <button type="submit" data-rv-i18n="safety.submit">Private melding versturen</button>
          </form>
          <div id="rv-safety-status" class="rv-status" role="status" hidden></div>
        </article>
      </section>

      <section class="rv-view" data-rv-view="account">
        <div id="rv-account-slot"></div>
      </section>
    </section>`;
}

if (authenticatedArea && signedInCard && !document.querySelector('#rendezvue-product-app')) {
  signedInCard.insertAdjacentHTML('afterend', productTemplate());
  const accountSlot = document.querySelector('#rv-account-slot');
  if (settingsCard && accountSlot) accountSlot.append(settingsCard);
}

const app = document.querySelector('#rendezvue-product-app');
const profileForm = document.querySelector('#rv-profile-form');
const profileStatus = document.querySelector('#rv-profile-status');
const portraitForm = document.querySelector('#rv-portrait-form');
const portraitStatus = document.querySelector('#rv-portrait-status');
const portraitPreview = document.querySelector('#rv-portrait-preview');
const previewContainer = document.querySelector('#rv-profile-preview');
const publishStatus = document.querySelector('#rv-publish-status');
const discoveryStatus = document.querySelector('#rv-discovery-status');
const discoveryList = document.querySelector('#rv-discovery-list');
const matchStatus = document.querySelector('#rv-match-status');
const matchContent = document.querySelector('#rv-match-content');
const chatList = document.querySelector('#rv-chat-list');
const chatForm = document.querySelector('#rv-chat-form');
const safetyStatus = document.querySelector('#rv-safety-status');

function t(key, replacements) {
  return productCopy(state.language, key, replacements);
}

function setStatus(element, message, kind = 'info') {
  if (!element) return;
  element.textContent = message;
  element.className = `rv-status ${kind}`;
  element.hidden = !message;
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error ?? 'Unknown error');
}

function unwrap(result, operation) {
  if (result?.error) throw new Error(`${operation}: ${result.error.message ?? 'unknown error'}`);
  return result?.data ?? null;
}

function value(id) {
  return document.querySelector(`#${id}`)?.value ?? '';
}

function checked(id) {
  return document.querySelector(`#${id}`)?.checked === true;
}

function setIfPresent(id, nextValue) {
  const element = document.querySelector(`#${id}`);
  if (!element || nextValue === undefined || nextValue === null || nextValue === '') return;
  if (element.type === 'checkbox') element.checked = Boolean(nextValue);
  else element.value = String(nextValue);
}

function initials(name) {
  return String(name ?? 'R')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'R';
}

function currentFormValues() {
  return {
    dateOfBirth: value('rv-date-of-birth'),
    adultConfirmed: checked('rv-adult-confirmed'),
    singleConfirmed: checked('rv-single-confirmed'),
    seriousConfirmed: checked('rv-serious-confirmed'),
    communityConfirmed: checked('rv-community-confirmed'),
    nickname: value('rv-nickname'),
    sex: value('rv-sex'),
    city: value('rv-city'),
    relationshipIntent: value('rv-relationship-intent'),
    bio: value('rv-bio'),
    primaryStatus: value('rv-life-stage'),
    educationLevel: value('rv-education'),
    studyField: value('rv-study-field'),
    occupation: value('rv-occupation'),
    maritalHistory: value('rv-marital-history'),
    hasChildren: value('rv-has-children') === 'yes',
    wantsChildren: value('rv-wants-children'),
    acceptsChildren: value('rv-accepts-children'),
    faithIdentity: value('rv-faith-identity'),
    practiceDescription: value('rv-practice-description'),
    compatibilityImportance: value('rv-compatibility'),
    practiceVisibility: value('rv-practice-visibility'),
    lifestyleTags: value('rv-lifestyle-tags'),
    promptOne: value('rv-prompt-one'),
    promptTwo: value('rv-prompt-two'),
    interests: value('rv-interests'),
    language: state.language
  };
}

function applyLanguage() {
  state.language = normaliseProductLanguage(document.documentElement.lang);
  for (const element of document.querySelectorAll('[data-rv-i18n]')) {
    element.textContent = t(element.dataset.rvI18n);
  }
  for (const element of document.querySelectorAll('[data-rv-i18n-placeholder]')) {
    element.placeholder = t(element.dataset.rvI18nPlaceholder);
  }
  renderDerivedPartner();
  renderProgress();
  renderPreview();
  renderDiscovery();
  renderMatch();
  renderMessages();
}

function switchTab(tabValue, updateHash = true) {
  const tab = resolveProductTab(tabValue);
  state.currentTab = tab;
  for (const button of document.querySelectorAll('[data-rv-tab]')) {
    const active = button.dataset.rvTab === tab;
    button.classList.toggle('active', active);
    button.setAttribute('aria-current', active ? 'page' : 'false');
  }
  for (const view of document.querySelectorAll('[data-rv-view]')) {
    view.classList.toggle('active', view.dataset.rvView === tab);
  }
  if (updateHash) history.replaceState(null, '', `${location.pathname}${location.search}#${tab}`);
  globalThis.scrollTo({ top: Math.max(0, app?.offsetTop - 14), behavior: 'smooth' });
  if (tab === 'discover') loadDiscovery().catch((error) => setStatus(discoveryStatus, errorMessage(error), 'error'));
  if (tab === 'matches') loadMatch().catch((error) => setStatus(matchStatus, errorMessage(error), 'error'));
}

function renderProgress() {
  const progress = onboardingProgress([...state.completedStages]);
  const label = document.querySelector('#rv-progress-label');
  const bar = document.querySelector('#rv-progress-bar');
  const pill = document.querySelector('#rv-stage-pill');
  const progressElement = bar?.parentElement;
  if (label) label.textContent = `${progress.count} / ${progress.total}`;
  if (bar) bar.style.width = `${progress.percent}%`;
  if (pill) pill.textContent = `${progress.percent}%`;
  if (progressElement) progressElement.setAttribute('aria-valuenow', String(progress.percent));
}

function renderDerivedPartner() {
  const target = document.querySelector('#rv-derived-partner');
  if (!target) return;
  try {
    const partner = derivePartnerSex(value('rv-sex'));
    target.textContent = t('profile.partnerDerived', {
      partner: t(partner === 'woman' ? 'profile.partnerWoman' : 'profile.partnerMan')
    });
  } catch {
    target.textContent = '';
  }
}

function renderLifeStage() {
  const student = value('rv-life-stage') === 'student';
  document.querySelector('#rv-education-wrap').hidden = !student;
  document.querySelector('#rv-study-wrap').hidden = !student;
  document.querySelector('#rv-occupation-wrap').hidden = student;
}

function renderPreview() {
  if (!previewContainer) return;
  let preview;
  try {
    preview = profilePreview(currentFormValues());
  } catch {
    preview = { nickname: value('rv-nickname') || 'Rendezvue', city: value('rv-city'), lifeStage: value('rv-life-stage'), relationshipIntent: value('rv-relationship-intent'), bio: value('rv-bio'), interests: [] };
  }
  previewContainer.replaceChildren();
  const media = document.createElement('div');
  media.className = 'rv-profile-preview-media';
  const portraitUrl = state.localPortraitUrl || state.ownPortraitUrl;
  if (portraitUrl) {
    const image = document.createElement('img');
    image.src = portraitUrl;
    image.alt = '';
    media.append(image);
  } else {
    media.textContent = initials(preview.nickname);
  }
  const copy = document.createElement('div');
  copy.className = 'rv-profile-preview-copy';
  const heading = document.createElement('h3');
  heading.textContent = preview.nickname;
  const meta = document.createElement('p');
  meta.textContent = [preview.city, preview.lifeStage].filter(Boolean).join(' · ');
  const intent = document.createElement('strong');
  intent.textContent = preview.relationshipIntent;
  const bio = document.createElement('p');
  bio.textContent = preview.bio;
  const chips = document.createElement('ul');
  chips.className = 'rv-chips';
  for (const interest of preview.interests ?? []) {
    const item = document.createElement('li');
    item.className = 'rv-chip';
    item.textContent = interest;
    chips.append(item);
  }
  copy.append(heading, meta, intent, bio, chips);
  previewContainer.append(media, copy);
}

function snapshotRoot(snapshot) {
  if (Array.isArray(snapshot)) return snapshot[0] ?? {};
  return snapshot && typeof snapshot === 'object' ? snapshot : {};
}

function snapshotSection(snapshot, names) {
  const root = snapshotRoot(snapshot);
  for (const name of names) {
    const found = root[name];
    if (Array.isArray(found)) return found[0] ?? {};
    if (found && typeof found === 'object') return found;
  }
  return {};
}

function hydrateFromSnapshot(snapshot) {
  const root = snapshotRoot(snapshot);
  const eligibility = snapshotSection(root, ['eligibility']);
  const identity = snapshotSection(root, ['profile', 'profiles', 'identity']);
  const life = snapshotSection(root, ['life_stage', 'lifeStage', 'life_stages']);
  const family = snapshotSection(root, ['family', 'family_context', 'family_contexts']);
  const faith = snapshotSection(root, ['faith', 'faith_profile', 'faith_profiles']);
  const progress = snapshotSection(root, ['progress', 'onboarding_progress']);
  const prompts = root.prompts ?? root.profile_prompts ?? [];
  const interests = root.interests ?? root.profile_interests ?? [];

  setIfPresent('rv-date-of-birth', eligibility.date_of_birth);
  setIfPresent('rv-adult-confirmed', eligibility.adult_confirmed);
  setIfPresent('rv-single-confirmed', eligibility.current_relationship_state === 'single');
  setIfPresent('rv-serious-confirmed', eligibility.serious_intent_confirmed);
  setIfPresent('rv-community-confirmed', eligibility.community_fit_confirmed);
  setIfPresent('rv-nickname', identity.nickname);
  setIfPresent('rv-sex', identity.sex);
  setIfPresent('rv-city', identity.city_region);
  setIfPresent('rv-relationship-intent', identity.relationship_intent);
  setIfPresent('rv-bio', identity.bio);
  setIfPresent('rv-life-stage', life.primary_status);
  setIfPresent('rv-education', life.education_level);
  setIfPresent('rv-study-field', life.study_field);
  setIfPresent('rv-occupation', life.occupation_category);
  setIfPresent('rv-marital-history', family.marital_history);
  setIfPresent('rv-has-children', family.has_children === true ? 'yes' : 'no');
  setIfPresent('rv-wants-children', family.wants_children);
  setIfPresent('rv-accepts-children', family.accepts_partner_with_children);
  setIfPresent('rv-faith-identity', faith.faith_identity);
  setIfPresent('rv-practice-description', faith.practice_description);
  setIfPresent('rv-compatibility', faith.compatibility_importance);
  setIfPresent('rv-practice-visibility', faith.practice_visibility);
  if (Array.isArray(faith.lifestyle_tags)) setIfPresent('rv-lifestyle-tags', faith.lifestyle_tags.join(', '));

  if (Array.isArray(prompts)) {
    const ideal = prompts.find((item) => item.prompt_key === 'ideal_day');
    const values = prompts.find((item) => item.prompt_key === 'important_values');
    setIfPresent('rv-prompt-one', ideal?.response);
    setIfPresent('rv-prompt-two', values?.response);
  }
  if (Array.isArray(interests)) {
    setIfPresent('rv-interests', interests.map((item) => item.interest ?? item.value ?? item).join(', '));
  }

  const completed = progress.completed_stages ?? root.completed_stages ?? [];
  state.completedStages = new Set(Array.isArray(completed) ? completed : []);
  if (Object.keys(eligibility).length) state.completedStages.add('eligibility');
  if (Object.keys(identity).length) state.completedStages.add('identity');
  if (Object.keys(life).length) state.completedStages.add('life_stage');
  if (Object.keys(family).length) state.completedStages.add('family');
  if (Object.keys(faith).length) state.completedStages.add('faith');
  if (Array.isArray(prompts) && prompts.length) state.completedStages.add('personality');
  renderLifeStage();
  renderDerivedPartner();
  renderProgress();
  renderPreview();
}

async function loadOwnPortrait() {
  if (!state.user) return null;
  const portrait = unwrap(await supabase
    .from('privacy_portraits')
    .select('object_path,status,is_public_profile_portrait')
    .eq('user_id', state.user.id)
    .eq('is_public_profile_portrait', true)
    .maybeSingle(), 'privacy portrait load');
  if (!portrait?.object_path) return null;
  const signed = unwrap(await supabase.storage.from('privacy-portraits').createSignedUrl(portrait.object_path, 300), 'privacy portrait URL');
  state.ownPortraitUrl = signed.signedUrl;
  state.completedStages.add('portrait');
  const image = document.createElement('img');
  image.src = signed.signedUrl;
  image.alt = '';
  portraitPreview.replaceChildren(image);
  renderProgress();
  renderPreview();
  return portrait;
}

async function loadProductState() {
  if (!state.user) return;
  setStatus(document.querySelector('#rv-global-status'), t('status.loading'), 'info');
  try {
    state.snapshot = await onboarding.loadSnapshot();
    hydrateFromSnapshot(state.snapshot);
  } catch {
    state.snapshot = null;
  }
  try {
    await loadOwnPortrait();
  } catch {
    // A missing portrait is an ordinary incomplete-profile state.
  }
  setStatus(document.querySelector('#rv-global-status'), '', 'info');
  await Promise.allSettled([loadDiscovery(), loadMatch()]);
}

async function saveProfile(event) {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  profileForm.classList.add('rv-loading');
  try {
    if (!profileForm.reportValidity()) throw new TypeError(t('profile.validation'));
    const payload = buildOnboardingPayload(currentFormValues());
    for (const stage of ['eligibility', 'identity', 'life_stage', 'family', 'faith']) {
      await onboarding.saveStage(stage, payload.stages[stage]);
    }
    await onboarding.savePersonality(payload.personality.prompts, payload.personality.interests);
    await onboarding.saveProgress('portrait', payload.completedStages, 1);
    state.completedStages = new Set(payload.completedStages.filter((stage) => stage !== 'account'));
    setStatus(profileStatus, t('profile.saved'), 'success');
    renderProgress();
    renderPreview();
    switchTab('profile');
  } catch (error) {
    setStatus(profileStatus, errorMessage(error), 'error');
  } finally {
    button.disabled = false;
    profileForm.classList.remove('rv-loading');
  }
}

async function uploadPortrait(event) {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  try {
    if (!state.user) throw new Error(t('status.signedOut'));
    const file = document.querySelector('#rv-portrait-file').files?.[0];
    if (!file) throw new Error(t('portrait.none'));
    const extension = new Map([['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp']]).get(file.type);
    if (!extension) throw new Error('Only JPEG, PNG and WebP are allowed');
    if (file.size > 10 * 1024 * 1024) throw new Error('The file may not exceed 10 MB');

    const objectPath = `${state.user.id}/${crypto.randomUUID()}.${extension}`;
    unwrap(await supabase.storage.from('privacy-portraits').upload(objectPath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false
    }), 'privacy portrait upload');

    try {
      unwrap(await supabase
        .from('privacy_portraits')
        .update({ is_public_profile_portrait: false })
        .eq('user_id', state.user.id)
        .eq('is_public_profile_portrait', true), 'previous portrait deselection');
      unwrap(await supabase
        .from('privacy_portraits')
        .insert({
          user_id: state.user.id,
          object_path: objectPath,
          treatment: 'browser-fuzzy-product-shell',
          status: 'pending',
          is_public_profile_portrait: true
        })
        .select('id')
        .single(), 'privacy portrait registration');
    } catch (error) {
      await supabase.storage.from('privacy-portraits').remove([objectPath]);
      throw error;
    }

    if (state.localPortraitUrl) URL.revokeObjectURL(state.localPortraitUrl);
    state.localPortraitUrl = URL.createObjectURL(file);
    const image = document.createElement('img');
    image.src = state.localPortraitUrl;
    image.alt = '';
    portraitPreview.replaceChildren(image);
    state.completedStages.add('portrait');
    await onboarding.saveProgress('preview', [...state.completedStages], 1);
    setStatus(portraitStatus, t('portrait.selected'), 'success');
    renderProgress();
    renderPreview();
  } catch (error) {
    setStatus(portraitStatus, errorMessage(error), 'error');
  } finally {
    button.disabled = false;
  }
}

async function publishProfile() {
  const button = document.querySelector('#rv-publish-profile');
  button.disabled = true;
  try {
    await onboarding.publishProfile();
    for (const stage of PRODUCT_STAGES) state.completedStages.add(stage);
    await onboarding.saveProgress('complete', [...state.completedStages], 1);
    setStatus(publishStatus, t('preview.published'), 'success');
    renderProgress();
    await loadDiscovery();
  } catch (error) {
    setStatus(publishStatus, errorMessage(error), 'error');
  } finally {
    button.disabled = false;
  }
}

function renderDiscovery() {
  if (!discoveryList) return;
  discoveryList.replaceChildren();
  if (!state.discovery.length) {
    const empty = document.createElement('div');
    empty.className = 'rv-empty';
    empty.textContent = t('discover.empty');
    discoveryList.append(empty);
    return;
  }

  for (const profile of state.discovery) {
    const card = document.createElement('article');
    card.className = 'rv-discovery-card';
    const media = document.createElement('div');
    media.className = 'rv-discovery-media';
    if (profile.display.portraitAsset) {
      const image = document.createElement('img');
      image.src = profile.display.portraitAsset;
      image.alt = '';
      media.append(image);
    } else {
      media.textContent = initials(profile.display.nickname);
    }
    const badge = document.createElement('span');
    badge.className = 'rv-discovery-badge';
    badge.textContent = 'SYNTHETIC';
    media.append(badge);

    const copy = document.createElement('div');
    copy.className = 'rv-discovery-copy';
    const heading = document.createElement('h3');
    heading.textContent = profile.display.nickname;
    const meta = document.createElement('p');
    meta.className = 'rv-discovery-meta';
    meta.textContent = [profile.display.city, profile.display.lifeStage].filter(Boolean).join(' · ');
    const intent = document.createElement('strong');
    intent.textContent = profile.display.relationshipIntent;
    const bio = document.createElement('p');
    bio.textContent = profile.display.bio;
    copy.append(heading, meta, intent, bio);

    const actions = document.createElement('div');
    actions.className = 'rv-discovery-actions';
    const pass = document.createElement('button');
    pass.type = 'button';
    pass.className = 'pass';
    pass.textContent = t('discover.pass');
    pass.addEventListener('click', () => recordSignal(profile, 'pass', null, pass));
    const like = document.createElement('button');
    like.type = 'button';
    like.textContent = t('discover.like');
    like.addEventListener('click', () => recordSignal(profile, 'like', null, like));
    const context = document.createElement('button');
    context.type = 'button';
    context.className = 'context';
    context.textContent = t('discover.context');
    actions.append(pass, like, context);

    const contextForm = document.createElement('form');
    contextForm.className = 'rv-context-form';
    const input = document.createElement('input');
    input.maxLength = 500;
    input.required = true;
    input.placeholder = t('discover.contextPrompt');
    const send = document.createElement('button');
    send.type = 'submit';
    send.textContent = t('chat.send');
    contextForm.append(input, send);
    context.addEventListener('click', () => {
      contextForm.classList.toggle('open');
      if (contextForm.classList.contains('open')) input.focus();
    });
    contextForm.addEventListener('submit', (event) => {
      event.preventDefault();
      recordSignal(profile, 'like', input.value.trim(), send);
    });

    card.append(media, copy, actions, contextForm);
    discoveryList.append(card);
  }
}

async function loadDiscovery() {
  if (!state.user) return [];
  setStatus(discoveryStatus, t('status.loading'), 'info');
  const rows = unwrap(await supabase
    .from('discovery_profiles')
    .select('user_id,nickname,sex,city_region,relationship_intent,bio,primary_status,published_at')
    .neq('user_id', state.user.id)
    .order('published_at', { ascending: false }), 'discovery load') ?? [];
  state.discovery = rows.map(projectDiscoveryProfile);
  renderDiscovery();
  setStatus(discoveryStatus, '', 'info');
  return state.discovery;
}

async function recordSignal(profile, signalType, openingMessage, button) {
  button.disabled = true;
  try {
    unwrap(await supabase.rpc('record_attraction_signal', {
      p_target_user_id: profile.targetUserId,
      p_signal_type: signalType,
      p_profile_component: openingMessage ? 'product-profile-context' : 'product-profile-card',
      p_opening_message: openingMessage || null
    }), 'attraction signal');
    setStatus(discoveryStatus, t(openingMessage ? 'discover.sentContext' : signalType === 'pass' ? 'discover.sentPass' : 'discover.sentLike'), 'success');
    state.discovery = state.discovery.filter((item) => item.key !== profile.key);
    renderDiscovery();
    if (signalType === 'like') await loadMatch();
  } catch (error) {
    setStatus(discoveryStatus, errorMessage(error), 'error');
  } finally {
    button.disabled = false;
  }
}

function otherParticipant(match) {
  if (!match || !state.user) return null;
  return match.user_a_id === state.user.id ? match.user_b_id : match.user_a_id;
}

async function loadMatchedPortrait() {
  state.matchedPortraitUrl = null;
  if (!state.otherUserId || !state.activeMatch || state.activeMatch.status !== 'active') return null;
  try {
    const objectPath = unwrap(await supabase.rpc('get_matched_portrait_path', {
      p_other_user_id: state.otherUserId
    }), 'matched portrait access');
    if (!objectPath) return null;
    const signed = unwrap(await supabase.storage.from('privacy-portraits').createSignedUrl(objectPath, 300), 'matched portrait URL');
    state.matchedPortraitUrl = signed.signedUrl;
    return signed.signedUrl;
  } catch {
    return null;
  }
}

async function loadOtherProfile() {
  state.otherProfile = null;
  if (!state.otherUserId) return null;
  const row = unwrap(await supabase
    .from('discovery_profiles')
    .select('user_id,nickname,sex,city_region,relationship_intent,bio,primary_status,published_at')
    .eq('user_id', state.otherUserId)
    .maybeSingle(), 'matched profile load');
  if (row) state.otherProfile = projectDiscoveryProfile(row);
  return state.otherProfile;
}

async function loadConversation() {
  state.activeConversation = null;
  if (!state.activeMatch) return null;
  state.activeConversation = unwrap(await supabase
    .from('conversations')
    .select('id,match_id,status,opened_at,ended_at')
    .eq('match_id', state.activeMatch.id)
    .maybeSingle(), 'conversation load');
  await subscribeMessages();
  await loadMessages();
  return state.activeConversation;
}

async function loadMatch() {
  if (!state.user) return null;
  setStatus(matchStatus, t('status.loading'), 'info');
  const rows = unwrap(await supabase
    .from('matches')
    .select('id,user_a_id,user_b_id,status,matched_at,ended_at')
    .order('matched_at', { ascending: false }), 'match load') ?? [];
  state.activeMatch = rows.find((row) => row.status === 'active') ?? rows[0] ?? null;
  state.otherUserId = otherParticipant(state.activeMatch);
  await Promise.all([loadOtherProfile(), loadMatchedPortrait()]);
  await loadConversation();
  renderMatch();
  setStatus(matchStatus, '', 'info');
  return state.activeMatch;
}

function renderMatch() {
  if (!matchContent) return;
  matchContent.replaceChildren();
  if (!state.activeMatch) {
    matchContent.className = 'rv-empty';
    matchContent.textContent = t('matches.none');
    chatForm?.querySelector('button')?.setAttribute('disabled', '');
    return;
  }

  matchContent.className = '';
  const profile = state.otherProfile?.display ?? { nickname: t('chat.other'), city: '', lifeStage: '', portraitAsset: null };
  const card = document.createElement('div');
  card.className = 'rv-match-card';
  const avatar = document.createElement('div');
  avatar.className = 'rv-match-avatar';
  const portrait = state.matchedPortraitUrl || profile.portraitAsset;
  if (portrait) {
    const image = document.createElement('img');
    image.src = portrait;
    image.alt = '';
    avatar.append(image);
  } else avatar.textContent = initials(profile.nickname);
  const copy = document.createElement('div');
  copy.className = 'rv-match-copy';
  const heading = document.createElement('h3');
  heading.textContent = profile.nickname;
  const status = document.createElement('p');
  status.textContent = state.activeMatch.status === 'active' ? t('matches.active') : t('safety.ended');
  const meta = document.createElement('p');
  meta.textContent = [profile.city, profile.lifeStage].filter(Boolean).join(' · ');
  copy.append(heading, status, meta);
  card.append(avatar, copy);
  matchContent.append(card);

  if (state.activeMatch.status === 'active' && !state.activeConversation) {
    const actions = document.createElement('div');
    actions.className = 'rv-match-actions';
    const open = document.createElement('button');
    open.type = 'button';
    open.textContent = t('matches.contact');
    open.addEventListener('click', () => openConversation(open));
    const note = document.createElement('p');
    note.className = 'rv-contact-note';
    note.textContent = t('matches.contactNote');
    actions.append(open, note);
    matchContent.append(actions);
  }
  const sendButton = chatForm?.querySelector('button');
  if (sendButton) sendButton.disabled = state.activeConversation?.status !== 'open';
}

async function openConversation(button) {
  if (!state.activeMatch) return;
  button.disabled = true;
  try {
    try {
      await supabase.rpc('claim_private_proof_entitlement');
    } catch {
      // A right may already exist or have been consumed; the authoritative
      // conversation-opening function decides whether the action is allowed.
    }
    unwrap(await supabase.rpc('open_match_conversation', {
      p_match_id: state.activeMatch.id,
      p_idempotency_key: `product-shell-${state.activeMatch.id}`
    }), 'conversation open');
    await loadConversation();
    renderMatch();
    setStatus(matchStatus, t('matches.open'), 'success');
  } catch (error) {
    setStatus(matchStatus, errorMessage(error), 'error');
  } finally {
    button.disabled = false;
  }
}

async function loadMessages() {
  if (!state.activeConversation) {
    renderMessages();
    return [];
  }
  const rows = unwrap(await supabase
    .from('messages')
    .select('id,conversation_id,sender_user_id,body,created_at')
    .eq('conversation_id', state.activeConversation.id)
    .order('created_at', { ascending: true }), 'message load') ?? [];
  state.messages = rows;
  renderMessages();
  return rows;
}

function renderMessages() {
  if (!chatList) return;
  chatList.replaceChildren();
  const rows = state.messages ?? [];
  if (!rows.length) {
    const empty = document.createElement('div');
    empty.className = 'rv-chat-empty';
    empty.textContent = t('chat.empty');
    chatList.append(empty);
    return;
  }
  for (const row of rows) {
    const bubble = document.createElement('article');
    const mine = row.sender_user_id === state.user?.id;
    bubble.className = `rv-bubble${mine ? ' mine' : ''}`;
    const body = document.createElement('p');
    body.textContent = row.body;
    const meta = document.createElement('small');
    meta.textContent = `${mine ? t('chat.you') : t('chat.other')} · ${new Date(row.created_at).toLocaleTimeString(state.language === 'nl' ? 'nl-NL' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    bubble.append(body, meta);
    chatList.append(bubble);
  }
  chatList.scrollTop = chatList.scrollHeight;
}

async function subscribeMessages() {
  if (state.realtimeChannel) {
    await supabase.removeChannel(state.realtimeChannel);
    state.realtimeChannel = null;
  }
  if (!state.activeConversation) return;
  state.realtimeChannel = supabase
    .channel(`product-conversation-${state.activeConversation.id}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${state.activeConversation.id}`
    }, () => loadMessages())
    .subscribe();
}

async function sendMessage(event) {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  try {
    if (!state.activeConversation || state.activeConversation.status !== 'open') throw new Error(t('safety.ended'));
    const input = document.querySelector('#rv-message-body');
    const body = input.value.trim();
    if (!body) return;
    unwrap(await supabase
      .from('messages')
      .insert({ conversation_id: state.activeConversation.id, sender_user_id: state.user.id, body })
      .select('id')
      .single(), 'message send');
    input.value = '';
    await loadMessages();
  } catch (error) {
    setStatus(matchStatus, errorMessage(error), 'error');
  } finally {
    button.disabled = state.activeConversation?.status !== 'open';
  }
}

async function endContact() {
  if (!state.activeMatch) return;
  const button = document.querySelector('#rv-end-contact');
  button.disabled = true;
  try {
    unwrap(await supabase.rpc('end_match_contact', { p_match_id: state.activeMatch.id }), 'contact end');
    await loadMatch();
    setStatus(safetyStatus, t('safety.ended'), 'success');
  } catch (error) {
    setStatus(safetyStatus, errorMessage(error), 'error');
  } finally {
    button.disabled = false;
  }
}

async function blockUser() {
  if (!state.otherUserId) return;
  const button = document.querySelector('#rv-block-user');
  button.disabled = true;
  try {
    unwrap(await supabase.rpc('block_user', {
      p_blocked_user_id: state.otherUserId,
      p_reason_code: 'synthetic_product_shell'
    }), 'user block');
    await loadMatch();
    setStatus(safetyStatus, t('safety.blocked'), 'success');
  } catch (error) {
    setStatus(safetyStatus, errorMessage(error), 'error');
  } finally {
    button.disabled = false;
  }
}

async function submitReport(event) {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  try {
    if (!state.activeMatch || !state.otherUserId) throw new Error(t('matches.none'));
    unwrap(await supabase.rpc('create_safety_report', {
      p_subject_user_id: state.otherUserId,
      p_match_id: state.activeMatch.id,
      p_category: value('rv-report-category'),
      p_description: value('rv-report-description').trim() || null
    }), 'safety report');
    setStatus(safetyStatus, t('safety.reported'), 'success');
    document.querySelector('#rv-report-form').classList.remove('open');
    document.querySelector('#rv-report-description').value = '';
  } catch (error) {
    setStatus(safetyStatus, errorMessage(error), 'error');
  } finally {
    button.disabled = false;
  }
}

function bindEvents() {
  for (const button of document.querySelectorAll('[data-rv-tab]')) {
    button.addEventListener('click', () => switchTab(button.dataset.rvTab));
  }
  for (const button of document.querySelectorAll('[data-rv-go]')) {
    button.addEventListener('click', () => switchTab(button.dataset.rvGo));
  }
  profileForm?.addEventListener('submit', saveProfile);
  portraitForm?.addEventListener('submit', uploadPortrait);
  document.querySelector('#rv-publish-profile')?.addEventListener('click', publishProfile);
  document.querySelector('#rv-refresh-discovery')?.addEventListener('click', () => loadDiscovery().catch((error) => setStatus(discoveryStatus, errorMessage(error), 'error')));
  document.querySelector('#rv-refresh-match')?.addEventListener('click', () => loadMatch().catch((error) => setStatus(matchStatus, errorMessage(error), 'error')));
  chatForm?.addEventListener('submit', sendMessage);
  document.querySelector('#rv-end-contact')?.addEventListener('click', endContact);
  document.querySelector('#rv-block-user')?.addEventListener('click', blockUser);
  document.querySelector('#rv-toggle-report')?.addEventListener('click', () => document.querySelector('#rv-report-form').classList.toggle('open'));
  document.querySelector('#rv-report-form')?.addEventListener('submit', submitReport);
  document.querySelector('#rv-sex')?.addEventListener('change', () => { renderDerivedPartner(); renderPreview(); });
  document.querySelector('#rv-life-stage')?.addEventListener('change', () => { renderLifeStage(); renderPreview(); });
  profileForm?.addEventListener('input', renderPreview);
  globalThis.addEventListener('rendezvue:language-change', (event) => {
    state.language = normaliseProductLanguage(event.detail?.language);
    applyLanguage();
  });
}

async function setUser(user) {
  state.user = user ?? null;
  if (!state.user) {
    app?.setAttribute('hidden', '');
    state.snapshot = null;
    state.completedStages.clear();
    state.discovery = [];
    state.activeMatch = null;
    state.activeConversation = null;
    state.otherUserId = null;
    state.messages = [];
    if (state.realtimeChannel) await supabase.removeChannel(state.realtimeChannel);
    state.realtimeChannel = null;
    return;
  }
  app?.removeAttribute('hidden');
  await loadProductState();
}

if (app) {
  bindEvents();
  applyLanguage();
  renderLifeStage();
  const initialTab = resolveProductTab(location.hash.slice(1));
  switchTab(initialTab, false);
  const initial = await supabase.auth.getUser();
  await setUser(initial.data?.user ?? null);
  const { data: authSubscription } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null).catch((error) => setStatus(document.querySelector('#rv-global-status'), errorMessage(error), 'error'));
  });
  globalThis.addEventListener('pagehide', () => {
    authSubscription.subscription?.unsubscribe?.();
    if (state.realtimeChannel) supabase.removeChannel(state.realtimeChannel);
    if (state.localPortraitUrl) URL.revokeObjectURL(state.localPortraitUrl);
  }, { once: true });
}

if (advancedTools) {
  advancedTools.dataset.productBoundary = 'operator-synthetic-only';
}