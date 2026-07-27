export const INSTITUTIONS = Object.freeze([
  { id: 'um5', name: 'Mohammed V University in Rabat', city: 'Rabat', domains: ['um5.ac.ma', 'etu.um5.ac.ma'], status: 'pilot-fixture' },
  { id: 'uit', name: 'Ibn Tofail University', city: 'Kenitra', domains: ['uit.ac.ma', 'etu.uit.ac.ma'], status: 'pilot-fixture' },
  { id: 'uiz', name: 'Ibn Zohr University', city: 'Agadir', domains: ['uiz.ac.ma', 'edu.uiz.ac.ma'], status: 'pilot-fixture' },
  { id: 'usmba', name: 'Sidi Mohamed Ben Abdellah University', city: 'Fes', domains: ['usmba.ac.ma', 'etu.usmba.ac.ma'], status: 'pilot-fixture' },
  { id: 'uh2c', name: 'Hassan II University of Casablanca', city: 'Casablanca', domains: ['univh2c.ma', 'etu.univh2c.ma'], status: 'pilot-fixture' },
  { id: 'uca', name: 'Cadi Ayyad University', city: 'Marrakesh', domains: ['uca.ma', 'edu.uca.ma'], status: 'pilot-fixture' }
]);

export const INTERESTS = Object.freeze(['Coffee walks', 'Football', 'Music', 'Cinema', 'Books', 'Travel', 'Gaming', 'Fitness', 'Food', 'Art', 'Technology', 'Languages']);
export const RELATIONSHIP_INTENTS = Object.freeze(['A serious relationship', 'Dating and seeing where it goes', 'New connections', 'Not sure yet']);

export function getInstitutionById(id) {
  return INSTITUTIONS.find((institution) => institution.id === id) ?? null;
}

export function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

export function extractEmailDomain(email) {
  const normalized = normalizeEmail(email);
  const separator = normalized.lastIndexOf('@');
  if (separator <= 0 || separator === normalized.length - 1) return null;
  const domain = normalized.slice(separator + 1);
  if (!domain.includes('.') || /\s/.test(domain)) return null;
  return domain;
}

export function institutionAcceptsEmail(institutionId, email) {
  const institution = getInstitutionById(institutionId);
  const domain = extractEmailDomain(email);
  if (!institution || !domain) return false;
  return institution.domains.some((accepted) => domain === accepted || domain.endsWith(`.${accepted}`));
}

export function ageOnDate(dateOfBirth, referenceDate = new Date()) {
  if (!dateOfBirth) return null;
  const birth = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birth.getTime()) || birth > referenceDate) return null;
  let age = referenceDate.getFullYear() - birth.getFullYear();
  const monthDelta = referenceDate.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && referenceDate.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function isAdult(dateOfBirth, referenceDate = new Date()) {
  const age = ageOnDate(dateOfBirth, referenceDate);
  return Number.isInteger(age) && age >= 18;
}

export function validateProfile(profile) {
  const errors = [];
  if (!String(profile.nickname ?? '').trim()) errors.push('Choose a first name or nickname.');
  if (!RELATIONSHIP_INTENTS.includes(profile.intent)) errors.push('Choose what you are looking for.');
  if (!Array.isArray(profile.interests) || profile.interests.length < 3) errors.push('Choose at least three interests.');
  if (!String(profile.promptOne ?? '').trim()) errors.push('Answer the first profile prompt.');
  if (!String(profile.promptTwo ?? '').trim()) errors.push('Answer the second profile prompt.');
  return errors;
}

export function createInitialState() {
  return {
    screen: 'welcome', onboardingStep: 1, dateOfBirth: '', acceptedTerms: false,
    institutionId: '', institutionalEmail: '', emailDomainAccepted: false, demoCodeSent: false, demoCode: '', emailVerified: false,
    captureComplete: false, capturedFrame: null, avatarDataUrl: null, avatarAccepted: false,
    profile: { nickname: '', intent: '', interests: [], promptOne: '', promptTwo: '', showInstitution: false },
    discoveryIndex: 0, matches: [], likedProfileIds: [], passedProfileIds: [], activeChatId: null, chats: {}, paused: false, blockedProfileIds: []
  };
}
