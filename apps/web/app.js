import {
  EDUCATION_LEVELS,
  FAITH_IDENTITIES,
  FAITH_IMPORTANCE,
  FAITH_PRACTICES,
  INTERESTS,
  LIFESTYLE_TAGS,
  RELATIONSHIP_INTENTS,
  ageOnDate,
  createInitialState,
  getInstitutionById,
  getInstitutionsByType,
  institutionAcceptsEmail,
  isAdult,
  validateFaithProfile,
  validateProfile
} from './src/domain.js';
import { DEMO_PROFILES, INITIAL_CHAT_MESSAGES } from './src/demo-data.js';
import { cameraSupported, captureFrame, recordChallenge, startCamera, stopCamera } from './src/camera.js';
import { createFallbackAvatar, stylizeFrame } from './src/avatar.js';
import { label, supportedLanguage, t } from './src/i18n.js';

const root = document.querySelector('#app');
const toasts = document.querySelector('#toast-region');
const state = createInitialState();
state.language = supportedLanguage(localStorage.getItem('rendezvue-language'));
let installPrompt = null;
let videoUrl = null;

const esc = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const tr = (key, variables) => t(state.language, key, variables);
const optionLabel = (group, key) => label(state.language, group, key);
const badge = (text, kind = 'neutral') => `<span class="badge ${kind}">${text}</span>`;
const note = (text, kind = '') => `<div class="notice ${kind}">${text}</div>`;
const avatar = () => state.avatarDataUrl || createFallbackAvatar();

function languageSwitch() {
  return `<div class="language-switch" role="group" aria-label="Language"><button type="button" data-do="language" data-value="nl" class="${state.language === 'nl' ? 'on' : ''}" lang="nl">NL</button><button type="button" data-do="language" data-value="en" class="${state.language === 'en' ? 'on' : ''}" lang="en">EN</button></div>`;
}
function brand() { return '<div class="brand"><span class="brand-mark">R</span><span>Rendezvue</span></div>'; }
function topRow(pilotLabel = 'prototype') { return `<div class="brand-row">${brand()}<div class="top-actions"><span class="pilot-badge">${tr(pilotLabel)}</span>${languageSwitch()}</div></div>`; }
function step(number, labelKey) { return `${topRow('privatePilot')}<div class="progress"><span>${tr(labelKey)}</span><span>${number}/6</span><i><b style="width:${number * (100 / 6)}%"></b></i></div>`; }
function notify(message) { const element = document.createElement('div'); element.className = 'toast'; element.textContent = message; toasts.append(element); setTimeout(() => element.remove(), 3200); }
function go(screen) { state.screen = screen; render(); scrollTo({ top: 0, behavior: 'smooth' }); }
function translatedPrompt(profile) { return profile.prompt?.[state.language] ?? profile.prompt?.nl ?? ''; }
function translatedMessage(message) { if (typeof message.text === 'string') return message.text; return message.text?.[state.language] ?? message.text?.nl ?? ''; }
function translatedTime(time) { return time === 'now' ? (state.language === 'nl' ? 'Nu' : 'Now') : time; }
function options(items, group, selected) { return items.map((key) => `<option value="${esc(key)}" ${selected === key ? 'selected' : ''}>${esc(optionLabel(group, key))}</option>`).join(''); }
function chipButtons(items, group, selected, action) { return items.map((key) => `<button type="button" class="chip ${selected.includes(key) ? 'on' : ''}" data-do="${action}" data-value="${esc(key)}">${esc(optionLabel(group, key))}</button>`).join(''); }
function institutionOptions() { if (!state.educationLevel) return ''; return getInstitutionsByType(state.educationLevel).map((institution) => `<option value="${institution.id}" ${state.institutionId === institution.id ? 'selected' : ''}>${esc(institution.name)} — ${esc(institution.city)}</option>`).join(''); }

function welcome() {
  const title = tr('welcomeTitle').split('\n').map(esc).join('<br>');
  return `<main class="shell">${topRow()}<section class="hero"><div class="hero-art"><div class="hero-card"></div><span>✓</span><span>♡</span></div><h1>${title}</h1><p>${esc(tr('welcomeBody'))}</p><div class="pills"><b>${esc(tr('welcomePillStudent'))}</b><b>${esc(tr('welcomePillFaith'))}</b><b>${esc(tr('welcomePillAvatar'))}</b></div></section><section class="card"><h2>${esc(tr('startPilot'))}</h2>${note(tr('prototypeWarning'), 'warning')}<label>${esc(tr('dateOfBirth'))}<input id="dob" type="date" value="${esc(state.dateOfBirth)}"></label><label class="check"><input id="terms" type="checkbox" ${state.acceptedTerms ? 'checked' : ''}><span>${esc(tr('adultTerms'))}</span></label><button class="primary" data-do="start">${esc(tr('createPrivateProfile'))}</button></section></main>`;
}

function student() {
  const institution = getInstitutionById(state.institutionId);
  return `<main class="shell">${step(1, 'stepStudent')}<section class="card">${badge(tr('probabilitySignal'))}<h1>${esc(tr('chooseEducation'))}</h1><p>${esc(tr('studentBody'))}</p><div class="form-grid"><label>${esc(tr('educationLevel'))}<select id="education-level"><option value="">${esc(tr('chooseLevel'))}</option>${options(EDUCATION_LEVELS, 'educationLabels', state.educationLevel)}</select></label><label>${esc(tr('institution'))}<select id="institution" ${state.educationLevel ? '' : 'disabled'}><option value="">${esc(tr('selectInstitution'))}</option>${institutionOptions()}</select></label></div><label>${esc(tr('institutionalEmail'))}<input id="email" type="email" value="${esc(state.institutionalEmail)}" placeholder="${esc(tr('emailPlaceholder'))}"></label>${institution ? note(`${esc(tr('pilotDomains'))}: <strong>${institution.domains.map(esc).join(', ')}</strong>`) : ''}${institution ? note(esc(tr('fixtureWarning')), 'warning') : ''}${state.educationLevel === 'mbo' ? note(esc(tr('mboAdultNote'))) : ''}${state.emailDomainAccepted ? note(esc(tr('domainAccepted')), 'success') : ''}${state.demoCodeSent ? `<div class="code"><span>${esc(tr('prototypeCode'))}</span><strong>246810</strong></div><label>${esc(tr('enterCode'))}<input id="code" inputmode="numeric" maxlength="6" value="${esc(state.demoCode)}"></label>` : ''}<div class="actions"><button class="quiet" data-do="welcome">${esc(tr('back'))}</button><button class="primary" data-do="${state.demoCodeSent ? 'code' : 'domain'}">${esc(state.demoCodeSent ? tr('verifyEmail') : tr('continue'))}</button></div><small>${esc(tr('noEmailSent'))}</small></section></main>`;
}

function capture() {
  const supported = cameraSupported();
  return `<main class="shell">${step(2, 'stepCapture')}<section class="card">${badge(tr('livenessNotAutomated'), 'warning')}<h1>${esc(tr('showLivePerson'))}</h1><p>${esc(tr('captureBody'))}</p><div class="camera"><video id="video" playsinline muted></video><div id="placeholder"><strong>${esc(supported ? tr('cameraOff') : tr('cameraUnavailable'))}</strong><span>${esc(supported ? tr('startWhenReady') : tr('useFallback'))}</span></div><i></i><div class="challenge"><span id="challenge">${esc(tr('challenge'))}</span><b><em id="rec-progress"></em></b></div></div>${note(tr('privacyCapture'))}<div class="actions"><button class="secondary" data-do="camera" ${supported ? '' : 'disabled'}>${esc(tr('startCamera'))}</button><button class="primary" data-do="record" ${supported ? '' : 'disabled'}>${esc(tr('recordFour'))}</button></div><button class="quiet wide" data-do="fallback">${esc(tr('syntheticAvatar'))}</button></section></main>`;
}

function avatarView() { return `<main class="shell">${step(3, 'stepAvatar')}<section class="card">${badge(tr('illustratedPreview'), 'warning')}<h1>${esc(tr('yourAvatar'))}</h1><p>${esc(tr('avatarBody'))}</p><div class="avatar-preview illustrated"><img src="${avatar()}" alt="${esc(tr('yourAvatar'))}"></div>${note(tr('avatarRule'))}<div class="actions"><button class="quiet" data-do="retake">${esc(tr('retake'))}</button><button class="primary" data-do="accept-avatar">${esc(tr('useAvatar'))}</button></div></section></main>`; }

function profile() {
  const interests = chipButtons(INTERESTS, 'interests', state.profile.interests, 'interest');
  return `<main class="shell">${step(4, 'stepProfile')}<section class="card"><h1>${esc(tr('profileTitle'))}</h1><label>${esc(tr('nickname'))}<input id="nickname" maxlength="30" value="${esc(state.profile.nickname)}"></label><label>${esc(tr('lookingFor'))}<select id="intent"><option value="">${esc(tr('chooseIntent'))}</option>${options(RELATIONSHIP_INTENTS, 'intents', state.profile.intent)}</select></label><fieldset><legend>${esc(tr('chooseInterests'))}</legend><div class="chips">${interests}</div></fieldset><label>${esc(tr('promptOne'))}<textarea id="p1" maxlength="180">${esc(state.profile.promptOne)}</textarea></label><label>${esc(tr('promptTwo'))}<textarea id="p2" maxlength="180">${esc(state.profile.promptTwo)}</textarea></label><div class="actions"><button class="quiet" data-do="avatar">${esc(tr('back'))}</button><button class="primary" data-do="save-profile">${esc(tr('faithChoices'))}</button></div></section></main>`;
}

function faith() {
  const tags = chipButtons(LIFESTYLE_TAGS, 'lifestyle', state.profile.faithTags, 'faith-tag');
  return `<main class="shell">${step(5, 'stepFaith')}<section class="card">${badge(tr('faithChoices'), 'faith')}<h1>${esc(tr('faithTitle'))}</h1><p>${esc(tr('faithIntro'))}</p><label>${esc(tr('faithIdentity'))}<select id="faith-identity"><option value="">${esc(tr('chooseFaithIdentity'))}</option>${options(FAITH_IDENTITIES, 'faithIdentities', state.profile.faithIdentity)}</select></label><label>${esc(tr('faithPractice'))}<select id="faith-practice"><option value="">${esc(tr('chooseFaithPractice'))}</option>${options(FAITH_PRACTICES, 'faithPractices', state.profile.faithPractice)}</select></label><label>${esc(tr('faithImportance'))}<select id="faith-importance"><option value="">${esc(tr('chooseFaithImportance'))}</option>${options(FAITH_IMPORTANCE, 'faithImportanceOptions', state.profile.faithImportance)}</select></label><fieldset><legend>${esc(tr('lifestyleTags'))}</legend><div class="chips faith-chips">${tags}</div></fieldset>${note(tr('specialDataNotice'), 'privacy')}<div class="actions"><button class="quiet" data-do="profile">${esc(tr('back'))}</button><button class="primary" data-do="save-faith">${esc(tr('continue'))}</button></div></section></main>`;
}

function privacy() {
  const institution = getInstitutionById(state.institutionId);
  return `<main class="shell">${step(6, 'stepPrivacy')}<section class="card">${badge(tr('privacyDefault'), 'verified')}<h1>${esc(tr('chooseVisibility'))}</h1><div class="summary"><img src="${avatar()}" alt="${esc(tr('yourAvatar'))}"><div><h2>${esc(state.profile.nickname)}</h2>${badge(`✓ ${tr('studentEmail')}`, 'verified')} ${badge(`✓ ${tr('liveSelfie')}`, 'verified')}</div></div><label class="toggle"><span><strong>${esc(tr('showInstitution'))}</strong><small>${esc(institution?.name || tr('institution'))}</small></span><input id="show-inst" type="checkbox" ${state.profile.showInstitution ? 'checked' : ''}></label><label class="toggle"><span><strong>${esc(tr('showFaithPractice'))}</strong><small>${esc(optionLabel('faithPractices', state.profile.faithPractice))}</small></span><input id="show-faith" type="checkbox" ${state.profile.showFaithPractice ? 'checked' : ''}></label>${note(esc(tr('neverPublic')))}<div class="actions"><button class="quiet" data-do="faith">${esc(tr('back'))}</button><button class="primary" data-do="finish">${esc(tr('enterRendezvue'))}</button></div></section></main>`;
}

function nav() { return `<nav><button data-go="discover" class="${state.screen === 'discover' ? 'on' : ''}">✦<span>${esc(tr('discover'))}</span></button><button data-go="likes" class="${state.screen === 'likes' ? 'on' : ''}">♡<span>${esc(tr('matches'))}</span></button><button data-go="chats" class="${state.screen === 'chats' ? 'on' : ''}">◌<span>${esc(tr('chats'))}</span></button><button data-go="settings" class="${state.screen === 'settings' ? 'on' : ''}">◉<span>${esc(tr('profile'))}</span></button></nav>`; }
function appHead(title, action = '') { return `<header>${brand()}<div class="top-actions">${action}${languageSwitch()}</div></header>${title ? `<h1 class="page-title">${esc(title)}</h1>` : ''}`; }
const available = () => DEMO_PROFILES.filter((profileItem) => !state.blockedProfileIds.includes(profileItem.id));
function profileBadges(profileItem) { return [badge(optionLabel('educationLabels', profileItem.educationLevel), 'education'), badge(optionLabel('intents', profileItem.intent), 'neutral'), badge(optionLabel('faithPractices', profileItem.faithPractice), 'faith')].join(' '); }

function discover() {
  const list = available(); const profileItem = list[state.discoveryIndex];
  if (!profileItem) return `<main class="app">${appHead(tr('discover'))}<section class="empty"><b>✦</b><h2>${esc(tr('endDeck'))}</h2><button class="primary" data-do="reset">${esc(tr('resetProfiles'))}</button></section>${nav()}</main>`;
  const compose = state.commentingOn === profileItem.id;
  return `<main class="app">${appHead('', '<button class="round" data-do="safety">⋯</button>')}<section class="content">${state.paused ? note(tr('profilePaused'), 'warning') : ''}<article class="profile-card"><div class="visual"><img src="${profileItem.avatar}" alt="Avatar ${esc(profileItem.name)}"><div><h2>${esc(profileItem.name)}, ${profileItem.age}</h2><p>⌖ ${esc(profileItem.city)} · ✓ ${esc(optionLabel('educationLabels', profileItem.educationLevel))} · ✓ ${esc(tr('liveSelfie'))}</p></div></div><section><div class="profile-badges">${profileBadges(profileItem)}</div><blockquote><small>${esc(tr('conversationPrompt'))}</small>${esc(translatedPrompt(profileItem))}</blockquote><div class="tags">${profileItem.interests.map((interest) => `<span>${esc(optionLabel('interests', interest))}</span>`).join('')}</div><div class="tags faith-tags">${profileItem.faithTags.slice(0, 3).map((tag) => `<span>${esc(optionLabel('lifestyle', tag))}</span>`).join('')}</div></section></article><div class="profile-actions"><button class="round" data-do="report" data-id="${profileItem.id}">!</button><button class="round" data-do="pass" data-id="${profileItem.id}">×</button><button class="round like" data-do="comment" data-id="${profileItem.id}">♡</button></div>${compose ? `<form id="like-form" class="composer"><strong>${esc(tr('likePrompt'))}</strong><textarea id="like-comment" maxlength="180" placeholder="${esc(tr('likePlaceholder'))}"></textarea><div class="actions"><button type="button" class="quiet" data-do="cancel-comment">${esc(tr('cancel'))}</button><button class="primary">${esc(tr('sendLike'))}</button></div></form>` : ''}</section>${nav()}</main>`;
}

function row(profileItem, text) { return `<button class="row" data-do="open-chat" data-id="${profileItem.id}"><img src="${profileItem.avatar}" alt=""><span><strong>${esc(profileItem.name)}</strong><small>${esc(text)}</small></span>›</button>`; }
function matches() { const list = DEMO_PROFILES.filter((profileItem) => state.matches.includes(profileItem.id) && !state.blockedProfileIds.includes(profileItem.id)); return `<main class="app">${appHead(tr('matches'))}<section class="content">${list.length ? list.map((profileItem) => row(profileItem, tr('matchedContext'))).join('') : `<section class="empty"><b>♡</b><h2>${esc(tr('noMatches'))}</h2><p>${esc(tr('deterministicMatch'))}</p></section>`}</section>${nav()}</main>`; }
function chats() { if (state.activeChatId) return chat(); const list = DEMO_PROFILES.filter((profileItem) => state.matches.includes(profileItem.id) && !state.blockedProfileIds.includes(profileItem.id)); return `<main class="app">${appHead(tr('chats'))}<section class="content">${list.length ? list.map((profileItem) => row(profileItem, translatedMessage((state.chats[profileItem.id] || []).at(-1) || { text: tr('startConversation') }))).join('') : `<section class="empty"><b>◌</b><h2>${esc(tr('messagesHere'))}</h2><p>${esc(tr('mutualRequired'))}</p></section>`}</section>${nav()}</main>`; }

function chat() {
  const profileItem = DEMO_PROFILES.find((item) => item.id === state.activeChatId); if (!profileItem) { state.activeChatId = null; return chats(); }
  const messages = state.chats[profileItem.id] || [];
  return `<main class="app"><header><button class="round" data-do="close-chat">‹</button><div><strong>${esc(profileItem.name)}</strong><small>${esc(tr('studentLive'))}</small></div><div class="top-actions"><button class="round" data-do="report" data-id="${profileItem.id}">⋯</button>${languageSwitch()}</div></header><section class="content chat">${note(esc(tr('chatPrivacy')))}<div class="messages">${messages.map((message) => `<div class="message ${message.from === 'me' ? 'mine' : ''}"><span>${esc(translatedMessage(message))}<small>${esc(translatedTime(message.time))}</small></span></div>`).join('')}</div><form id="chat-form"><input id="message" maxlength="500" placeholder="${esc(tr('writeMessage'))}"><button class="primary">↑</button></form></section>${nav()}</main>`;
}

function settings() {
  const institution = getInstitutionById(state.institutionId);
  return `<main class="app">${appHead(tr('yourProfile'), installPrompt ? `<button class="secondary" data-do="install">${esc(tr('install'))}</button>` : '')}<section class="content"><div class="settings summary"><img src="${avatar()}" alt="${esc(tr('yourAvatar'))}"><div><h2>${esc(state.profile.nickname)}, ${ageOnDate(state.dateOfBirth) || 18}</h2>${badge(`✓ ${tr('studentEmail')}`, 'verified')} ${badge(`✓ ${tr('liveSelfie')}`, 'verified')}</div></div><div class="settings faith-summary"><h3>${esc(tr('faithChoices'))}</h3><div class="profile-badges">${badge(optionLabel('faithIdentities', state.profile.faithIdentity), 'faith')} ${badge(optionLabel('faithPractices', state.profile.faithPractice), 'faith')} ${badge(optionLabel('faithImportanceOptions', state.profile.faithImportance), 'neutral')}</div></div><div class="settings"><h3>${esc(tr('privacy'))}</h3><label class="toggle"><span><strong>${esc(tr('showInstitution'))}</strong><small>${esc(institution?.name || '')}</small></span><input id="settings-inst" type="checkbox" ${state.profile.showInstitution ? 'checked' : ''}></label><label class="toggle"><span><strong>${esc(tr('showFaithPractice'))}</strong><small>${esc(optionLabel('faithPractices', state.profile.faithPractice))}</small></span><input id="settings-faith" type="checkbox" ${state.profile.showFaithPractice ? 'checked' : ''}></label><label class="toggle"><span><strong>${esc(tr('pauseDiscovery'))}</strong><small>${esc(tr('matchesRemain'))}</small></span><input id="pause" type="checkbox" ${state.paused ? 'checked' : ''}></label></div><div class="settings"><h3>${esc(tr('pilotControls'))}</h3><button class="quiet wide" data-do="restart">${esc(tr('restartOnboarding'))}</button><button class="danger wide" data-do="delete">${esc(tr('deleteLocalState'))}</button></div></section>${nav()}</main>`;
}

function modal() {
  if (!state.modal) return '';
  if (state.modal.type === 'match') { const profileItem = DEMO_PROFILES.find((item) => item.id === state.modal.id); return `<div class="backdrop"><section class="modal match">${badge(tr('mutualInterest'), 'verified')}<h2>${esc(tr('itIsMatch'))}</h2><p>${esc(tr('matchBody', { name: profileItem.name }))}</p><div><img src="${avatar()}"><b>♡</b><img src="${profileItem.avatar}"></div><button class="primary wide" data-do="match-chat" data-id="${profileItem.id}">${esc(tr('startWithComment'))}</button><button class="quiet wide" data-do="close-modal">${esc(tr('keepDiscovering'))}</button></section></div>`; }
  const profileItem = DEMO_PROFILES.find((item) => item.id === state.modal.id); const suffix = profileItem ? tr('safetyFor', { name: profileItem.name }) : '';
  return `<div class="backdrop"><section class="modal"><h2>${esc(tr('safetyOptions'))}${esc(suffix)}</h2><p>${esc(tr('safetyBody'))}</p>${profileItem ? `<button class="danger wide" data-do="block" data-id="${profileItem.id}">${esc(tr('blockProfile'))}</button><button class="quiet wide" data-do="submit-report" data-id="${profileItem.id}">${esc(tr('reportProfile'))}</button>` : note(esc(tr('safetyGeneral')))}<button class="quiet wide" data-do="close-modal">${esc(tr('cancel'))}</button></section></div>`;
}

function render() { stopCamera(); document.documentElement.lang = state.language; const views = { welcome, student, capture, avatar: avatarView, profile, faith, privacy, discover, likes: matches, chats, settings }; root.innerHTML = (views[state.screen] || welcome)() + modal(); }
function saveProfile() { for (const [id, key] of [['nickname', 'nickname'], ['intent', 'intent'], ['p1', 'promptOne'], ['p2', 'promptTwo']]) { const element = document.querySelector(`#${id}`); if (element) state.profile[key] = element.value; } }
function saveFaith() { for (const [id, key] of [['faith-identity', 'faithIdentity'], ['faith-practice', 'faithPractice'], ['faith-importance', 'faithImportance']]) { const element = document.querySelector(`#${id}`); if (element) state.profile[key] = element.value; } }
function snapshotCurrentForm() { if (state.screen === 'welcome') { state.dateOfBirth = document.querySelector('#dob')?.value || state.dateOfBirth; state.acceptedTerms = Boolean(document.querySelector('#terms')?.checked); } if (state.screen === 'student') { state.educationLevel = document.querySelector('#education-level')?.value || state.educationLevel; state.institutionId = document.querySelector('#institution')?.value || state.institutionId; state.institutionalEmail = document.querySelector('#email')?.value || state.institutionalEmail; state.demoCode = document.querySelector('#code')?.value || state.demoCode; } if (state.screen === 'profile') saveProfile(); if (state.screen === 'faith') saveFaith(); }
function reset() { const language = state.language; const fresh = createInitialState(); fresh.language = language; for (const key of Object.keys(state)) delete state[key]; Object.assign(state, fresh); if (videoUrl) URL.revokeObjectURL(videoUrl); videoUrl = null; render(); }

root.addEventListener('change', (event) => {
  if (event.target.id === 'education-level') { state.educationLevel = event.target.value; state.institutionId = ''; state.emailDomainAccepted = false; state.demoCodeSent = false; render(); }
  if (event.target.id === 'institution') { state.institutionId = event.target.value; state.emailDomainAccepted = false; state.demoCodeSent = false; render(); }
  if (['show-inst', 'settings-inst'].includes(event.target.id)) state.profile.showInstitution = event.target.checked;
  if (['show-faith', 'settings-faith'].includes(event.target.id)) state.profile.showFaithPractice = event.target.checked;
  if (event.target.id === 'pause') { state.paused = event.target.checked; notify(state.paused ? tr('profilePausedToast') : tr('profileVisibleToast')); }
});

root.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-do],[data-go]'); if (!target) return; event.preventDefault();
  if (target.dataset.go) { state.activeChatId = null; go(target.dataset.go); return; }
  const action = target.dataset.do;
  if (action === 'language') { snapshotCurrentForm(); state.language = supportedLanguage(target.dataset.value); localStorage.setItem('rendezvue-language', state.language); render(); return; }
  if (action === 'start') { state.dateOfBirth = document.querySelector('#dob')?.value || ''; state.acceptedTerms = Boolean(document.querySelector('#terms')?.checked); if (!state.acceptedTerms) return notify(tr('confirmTerms')); if (!isAdult(state.dateOfBirth)) return notify(tr('adultsOnly')); return go('student'); }
  if (['welcome', 'avatar', 'profile', 'faith'].includes(action)) return go(action);
  if (action === 'domain') { state.educationLevel = document.querySelector('#education-level')?.value || ''; state.institutionId = document.querySelector('#institution')?.value || ''; state.institutionalEmail = document.querySelector('#email')?.value || ''; state.emailDomainAccepted = institutionAcceptsEmail(state.institutionId, state.institutionalEmail); if (!state.emailDomainAccepted) return notify(tr('domainMismatch')); state.demoCodeSent = true; return render(); }
  if (action === 'code') { state.demoCode = document.querySelector('#code')?.value || ''; if (state.demoCode !== '246810') return notify(tr('useShownCode')); state.emailVerified = true; return go('capture'); }
  if (action === 'camera') { try { await startCamera(document.querySelector('#video')); document.querySelector('#placeholder').hidden = true; notify(tr('cameraReady')); } catch (error) { notify(error.message || tr('cameraFailed')); } return; }
  if (action === 'record') { const video = document.querySelector('#video'); const placeholder = document.querySelector('#placeholder'); const progress = document.querySelector('#rec-progress'); const challenge = document.querySelector('#challenge'); try { if (!video.srcObject) { await startCamera(video); placeholder.hidden = true; } target.disabled = true; challenge.textContent = tr('recordingChallenge'); const blob = await recordChallenge(video, { onTick: (ratio) => { progress.style.width = `${Math.round(ratio * 100)}%`; } }); if (videoUrl) URL.revokeObjectURL(videoUrl); videoUrl = URL.createObjectURL(blob); state.capturedFrame = captureFrame(video); state.avatarDataUrl = stylizeFrame(state.capturedFrame); state.captureComplete = true; stopCamera(); return go('avatar'); } catch (error) { target.disabled = false; notify(error.message || tr('recordingFailed')); return; } }
  if (action === 'fallback') { state.avatarDataUrl = createFallbackAvatar(); state.captureComplete = true; return go('avatar'); }
  if (action === 'retake') { state.avatarDataUrl = null; state.capturedFrame = null; return go('capture'); }
  if (action === 'accept-avatar') { if (videoUrl) URL.revokeObjectURL(videoUrl); videoUrl = null; state.avatarAccepted = true; return go('profile'); }
  if (action === 'interest') { saveProfile(); const value = target.dataset.value; state.profile.interests = state.profile.interests.includes(value) ? state.profile.interests.filter((item) => item !== value) : [...state.profile.interests, value]; return render(); }
  if (action === 'faith-tag') { saveFaith(); const value = target.dataset.value; state.profile.faithTags = state.profile.faithTags.includes(value) ? state.profile.faithTags.filter((item) => item !== value) : [...state.profile.faithTags, value]; return render(); }
  if (action === 'save-profile') { saveProfile(); const errors = validateProfile(state.profile); if (errors.length) return notify(tr(`profileErrors.${errors[0]}`)); return go('faith'); }
  if (action === 'save-faith') { saveFaith(); const errors = validateFaithProfile(state.profile); if (errors.length) return notify(tr(`faithErrors.${errors[0]}`)); return go('privacy'); }
  if (action === 'finish') { state.profile.showInstitution = Boolean(document.querySelector('#show-inst')?.checked); state.profile.showFaithPractice = Boolean(document.querySelector('#show-faith')?.checked); go('discover'); return notify(tr('profileReady')); }
  if (action === 'pass') { state.passedProfileIds.push(target.dataset.id); state.discoveryIndex += 1; state.commentingOn = null; return render(); }
  if (action === 'comment') { state.commentingOn = target.dataset.id; render(); document.querySelector('#like-comment')?.focus(); return; }
  if (action === 'cancel-comment') { state.commentingOn = null; return render(); }
  if (action === 'reset') { state.discoveryIndex = 0; state.passedProfileIds = []; return render(); }
  if (action === 'report') { state.modal = { type: 'safety', id: target.dataset.id }; return render(); }
  if (action === 'safety') { state.modal = { type: 'safety' }; return render(); }
  if (action === 'close-modal') { state.modal = null; return render(); }
  if (action === 'submit-report') { state.modal = null; render(); return notify(tr('localReport')); }
  if (action === 'block') { const id = target.dataset.id; state.blockedProfileIds = [...new Set([...state.blockedProfileIds, id])]; state.matches = state.matches.filter((item) => item !== id); delete state.chats[id]; state.activeChatId = null; state.modal = null; render(); return notify(tr('localBlock')); }
  if (action === 'open-chat') { state.activeChatId = target.dataset.id; return go('chats'); }
  if (action === 'close-chat') { state.activeChatId = null; return render(); }
  if (action === 'match-chat') { state.modal = null; state.activeChatId = target.dataset.id; return go('chats'); }
  if (action === 'install' && installPrompt) { installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; return render(); }
  if (action === 'restart' || action === 'delete') return reset();
});

root.addEventListener('submit', (event) => {
  event.preventDefault();
  if (event.target.id === 'like-form') { const profileItem = available()[state.discoveryIndex]; const comment = document.querySelector('#like-comment')?.value.trim() || tr('likePrompt'); state.likedProfileIds.push(profileItem.id); state.commentingOn = null; if (profileItem.id === 'samira') { state.matches.push(profileItem.id); state.chats[profileItem.id] = [{ id: `me-${Date.now()}`, from: 'me', text: comment, time: 'now' }, ...INITIAL_CHAT_MESSAGES]; state.modal = { type: 'match', id: profileItem.id }; } else { state.discoveryIndex += 1; notify(tr('likeSent', { name: profileItem.name })); } render(); return; }
  if (event.target.id === 'chat-form') { const input = document.querySelector('#message'); const text = input?.value.trim(); if (!text || !state.activeChatId) return; (state.chats[state.activeChatId] ??= []).push({ id: `me-${Date.now()}`, from: 'me', text, time: 'now' }); render(); }
});

addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); installPrompt = event; if (state.screen === 'settings') render(); });
addEventListener('pagehide', () => { stopCamera(); if (videoUrl) URL.revokeObjectURL(videoUrl); });
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js').catch(() => {}));
render();
