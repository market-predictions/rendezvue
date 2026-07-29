export const EDUCATION_LEVELS = Object.freeze(['mbo', 'hbo', 'wo']);

export const INSTITUTIONS = Object.freeze([
  { id: 'rocva', type: 'mbo', name: 'ROC van Amsterdam - Flevoland', city: 'Amsterdam', domains: ['rocva.nl', 'student.rocva.nl'], status: 'pilot-fixture' },
  { id: 'albeda', type: 'mbo', name: 'Albeda', city: 'Rotterdam', domains: ['albeda.nl', 'student.albeda.nl'], status: 'pilot-fixture' },
  { id: 'zadkine', type: 'mbo', name: 'Zadkine', city: 'Rotterdam', domains: ['zadkine.nl', 'student.zadkine.nl'], status: 'pilot-fixture' },
  { id: 'rocmondriaan', type: 'mbo', name: 'ROC Mondriaan', city: 'Den Haag', domains: ['rocmondriaan.nl', 'student.rocmondriaan.nl'], status: 'pilot-fixture' },
  { id: 'mboutrecht', type: 'mbo', name: 'MBO Utrecht', city: 'Utrecht', domains: ['mboutrecht.nl', 'student.mboutrecht.nl'], status: 'pilot-fixture' },
  { id: 'rocmn', type: 'mbo', name: 'ROC Midden Nederland', city: 'Utrecht', domains: ['rocmn.nl', 'student.rocmn.nl'], status: 'pilot-fixture' },
  { id: 'deltion', type: 'mbo', name: 'Deltion College', city: 'Zwolle', domains: ['deltion.nl', 'student.deltion.nl'], status: 'pilot-fixture' },
  { id: 'noorderpoort', type: 'mbo', name: 'Noorderpoort', city: 'Groningen', domains: ['noorderpoort.nl', 'st.noorderpoort.nl'], status: 'pilot-fixture' },
  { id: 'alfacollege', type: 'mbo', name: 'Alfa-college', city: 'Groningen', domains: ['alfa-college.nl', 'student.alfa-college.nl'], status: 'pilot-fixture' },
  { id: 'curio', type: 'mbo', name: 'Curio', city: 'Breda', domains: ['curio.nl', 'student.curio.nl'], status: 'pilot-fixture' },
  { id: 'summa', type: 'mbo', name: 'Summa College', city: 'Eindhoven', domains: ['summacollege.nl', 'student.summacollege.nl'], status: 'pilot-fixture' },
  { id: 'vista', type: 'mbo', name: 'VISTA college', city: 'Sittard', domains: ['vistacollege.nl', 'student.vistacollege.nl'], status: 'pilot-fixture' },
  { id: 'firda', type: 'mbo', name: 'Firda', city: 'Leeuwarden', domains: ['firda.nl', 'student.firda.nl'], status: 'pilot-fixture' },
  { id: 'kw1c', type: 'mbo', name: 'Koning Willem I College', city: "'s-Hertogenbosch", domains: ['kw1c.nl', 'student.kw1c.nl'], status: 'pilot-fixture' },
  { id: 'gilde', type: 'mbo', name: 'Gilde Opleidingen', city: 'Roermond', domains: ['gildeopleidingen.nl', 'student.gildeopleidingen.nl'], status: 'pilot-fixture' },
  { id: 'hva', type: 'hbo', name: 'Hogeschool van Amsterdam', city: 'Amsterdam', domains: ['hva.nl', 'student.hva.nl'], status: 'pilot-fixture' },
  { id: 'hr', type: 'hbo', name: 'Hogeschool Rotterdam', city: 'Rotterdam', domains: ['hr.nl', 'student.hr.nl'], status: 'pilot-fixture' },
  { id: 'hu', type: 'hbo', name: 'Hogeschool Utrecht', city: 'Utrecht', domains: ['hu.nl', 'student.hu.nl'], status: 'pilot-fixture' },
  { id: 'hhs', type: 'hbo', name: 'De Haagse Hogeschool', city: 'Den Haag', domains: ['hhs.nl', 'student.hhs.nl'], status: 'pilot-fixture' },
  { id: 'inholland', type: 'hbo', name: 'Hogeschool Inholland', city: 'Den Haag', domains: ['inholland.nl', 'student.inholland.nl'], status: 'pilot-fixture' },
  { id: 'fontys', type: 'hbo', name: 'Fontys Hogeschool', city: 'Eindhoven', domains: ['fontys.nl', 'student.fontys.nl'], status: 'pilot-fixture' },
  { id: 'avans', type: 'hbo', name: 'Avans Hogeschool', city: 'Breda', domains: ['avans.nl', 'student.avans.nl'], status: 'pilot-fixture' },
  { id: 'han', type: 'hbo', name: 'HAN University of Applied Sciences', city: 'Arnhem', domains: ['han.nl', 'student.han.nl'], status: 'pilot-fixture' },
  { id: 'saxion', type: 'hbo', name: 'Saxion', city: 'Enschede', domains: ['saxion.nl', 'student.saxion.nl'], status: 'pilot-fixture' },
  { id: 'windesheim', type: 'hbo', name: 'Hogeschool Windesheim', city: 'Zwolle', domains: ['windesheim.nl', 'student.windesheim.nl'], status: 'pilot-fixture' },
  { id: 'nhlstenden', type: 'hbo', name: 'NHL Stenden Hogeschool', city: 'Leeuwarden', domains: ['nhlstenden.com', 'student.nhlstenden.com'], status: 'pilot-fixture' },
  { id: 'zuyd', type: 'hbo', name: 'Zuyd Hogeschool', city: 'Heerlen', domains: ['zuyd.nl', 'student.zuyd.nl'], status: 'pilot-fixture' },
  { id: 'uva', type: 'wo', name: 'Universiteit van Amsterdam', city: 'Amsterdam', domains: ['uva.nl', 'student.uva.nl'], status: 'pilot-fixture' },
  { id: 'vu', type: 'wo', name: 'Vrije Universiteit Amsterdam', city: 'Amsterdam', domains: ['vu.nl', 'student.vu.nl'], status: 'pilot-fixture' },
  { id: 'eur', type: 'wo', name: 'Erasmus Universiteit Rotterdam', city: 'Rotterdam', domains: ['eur.nl', 'student.eur.nl'], status: 'pilot-fixture' },
  { id: 'uu', type: 'wo', name: 'Universiteit Utrecht', city: 'Utrecht', domains: ['uu.nl', 'students.uu.nl'], status: 'pilot-fixture' },
  { id: 'leiden', type: 'wo', name: 'Universiteit Leiden', city: 'Leiden', domains: ['leidenuniv.nl', 'umail.leidenuniv.nl'], status: 'pilot-fixture' },
  { id: 'tudelft', type: 'wo', name: 'Technische Universiteit Delft', city: 'Delft', domains: ['tudelft.nl', 'student.tudelft.nl'], status: 'pilot-fixture' },
  { id: 'radboud', type: 'wo', name: 'Radboud Universiteit', city: 'Nijmegen', domains: ['ru.nl', 'student.ru.nl'], status: 'pilot-fixture' },
  { id: 'rug', type: 'wo', name: 'Rijksuniversiteit Groningen', city: 'Groningen', domains: ['rug.nl', 'student.rug.nl'], status: 'pilot-fixture' },
  { id: 'maastricht', type: 'wo', name: 'Maastricht University', city: 'Maastricht', domains: ['maastrichtuniversity.nl', 'student.maastrichtuniversity.nl'], status: 'pilot-fixture' },
  { id: 'utwente', type: 'wo', name: 'Universiteit Twente', city: 'Enschede', domains: ['utwente.nl', 'student.utwente.nl'], status: 'pilot-fixture' },
  { id: 'tilburg', type: 'wo', name: 'Tilburg University', city: 'Tilburg', domains: ['tilburguniversity.edu'], status: 'pilot-fixture' },
  { id: 'wur', type: 'wo', name: 'Wageningen University & Research', city: 'Wageningen', domains: ['wur.nl'], status: 'pilot-fixture' }
]);

export const LIFE_STAGES = Object.freeze(['student', 'recentGraduate', 'employed', 'selfEmployed', 'jobSeeking', 'other']);
export const CURRENT_RELATIONSHIP_STATES = Object.freeze(['single', 'relationship', 'engaged', 'married', 'separated']);
export const MARITAL_HISTORIES = Object.freeze(['neverMarried', 'divorced', 'widowed']);
export const CHILD_STATUSES = Object.freeze(['none', 'hasChildren']);
export const CHILD_COUNT_BANDS = Object.freeze(['one', 'two', 'threePlus', 'private']);
export const CHILD_WISHES = Object.freeze(['yes', 'no', 'maybe', 'unsure', 'openToMore']);
export const PARTNER_CHILD_PREFERENCES = Object.freeze(['yes', 'maybe', 'no']);
export const GENDER_IDENTITIES = Object.freeze(['woman', 'man', 'nonBinary', 'private']);
export const SEEKING_OPTIONS = Object.freeze(['women', 'men', 'everyone']);
export const RELATIONSHIP_INTENTS = Object.freeze(['getToKnow', 'serious', 'marriage']);
export const FAITH_IDENTITIES = Object.freeze(['muslim', 'muslimBackground', 'convert', 'exploring', 'preferNotSay']);
export const FAITH_PRACTICES = Object.freeze(['activelyPracticing', 'practicing', 'moderate', 'cultural', 'private']);
export const FAITH_IMPORTANCE = Object.freeze(['essential', 'important', 'open', 'flexible']);
export const INTERESTS = Object.freeze(['coffee', 'football', 'music', 'cinema', 'books', 'travel', 'gaming', 'fitness', 'food', 'art', 'technology', 'languages', 'volunteering', 'nature']);
export const LIFESTYLE_TAGS = Object.freeze(['prayer', 'ramadan', 'halal', 'noAlcohol', 'noSmoking', 'family', 'modesty', 'community', 'marriageMinded']);
export const FEEDBACK_POSITIVE_TAGS = Object.freeze(['respectful', 'thoughtful', 'honestProfile', 'seriousIntent', 'respectedBoundaries']);
export const FEEDBACK_CONCERN_TAGS = Object.freeze(['noChemistry', 'barelyReplied', 'pressure', 'offPlatformFast', 'moneyRequest', 'notSingle', 'offensive', 'noShow']);

export function getInstitutionById(id) { return INSTITUTIONS.find((institution) => institution.id === id) ?? null; }
export function getInstitutionsByType(type) { return INSTITUTIONS.filter((institution) => !type || institution.type === type).slice().sort((a, b) => a.name.localeCompare(b.name, 'nl')); }
export function normalizeEmail(email) { return String(email ?? '').trim().toLowerCase(); }
export function extractEmailDomain(email) { const normalized = normalizeEmail(email); const separator = normalized.lastIndexOf('@'); if (separator <= 0 || separator === normalized.length - 1) return null; const domain = normalized.slice(separator + 1); if (!domain.includes('.') || /\s/.test(domain)) return null; return domain; }
export function institutionAcceptsEmail(institutionId, email) { const institution = getInstitutionById(institutionId); const domain = extractEmailDomain(email); if (!institution || !domain) return false; return institution.domains.some((accepted) => domain === accepted || domain.endsWith(`.${accepted}`)); }
export function validPersonalEmail(email) { const normalized = normalizeEmail(email); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized); }

export function ageOnDate(dateOfBirth, referenceDate = new Date()) {
  if (!dateOfBirth) return null;
  const birth = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birth.getTime()) || birth > referenceDate) return null;
  let age = referenceDate.getFullYear() - birth.getFullYear();
  const monthDelta = referenceDate.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && referenceDate.getDate() < birth.getDate())) age -= 1;
  return age;
}
export function isAdult(dateOfBirth, referenceDate = new Date()) { const age = ageOnDate(dateOfBirth, referenceDate); return Number.isInteger(age) && age >= 18; }
export function isEligible({ dateOfBirth, currentRelationshipState, communityFit, seriousIntent }, referenceDate = new Date()) { return isAdult(dateOfBirth, referenceDate) && currentRelationshipState === 'single' && communityFit === true && seriousIntent === true; }

export function validateIdentity(profile) {
  const errors = [];
  if (!String(profile.nickname ?? '').trim()) errors.push('nickname');
  if (!GENDER_IDENTITIES.includes(profile.genderIdentity)) errors.push('genderIdentity');
  if (!SEEKING_OPTIONS.includes(profile.seeking)) errors.push('seeking');
  if (!String(profile.city ?? '').trim()) errors.push('city');
  return errors;
}
export function validateLifeStage(profile) { return LIFE_STAGES.includes(profile.lifeStage) ? [] : ['lifeStage']; }
export function validateFamilyContext(profile) {
  const errors = [];
  if (!MARITAL_HISTORIES.includes(profile.maritalHistory)) errors.push('maritalHistory');
  if (!CHILD_STATUSES.includes(profile.childStatus)) errors.push('childStatus');
  if (profile.childStatus === 'hasChildren' && profile.childCountBand && !CHILD_COUNT_BANDS.includes(profile.childCountBand)) errors.push('childCountBand');
  if (!CHILD_WISHES.includes(profile.childWish)) errors.push('childWish');
  if (!PARTNER_CHILD_PREFERENCES.includes(profile.acceptsPartnerChildren)) errors.push('acceptsPartnerChildren');
  if (!RELATIONSHIP_INTENTS.includes(profile.intent)) errors.push('intent');
  return errors;
}
export function validateProfile(profile) {
  const errors = [];
  if (!Array.isArray(profile.interests) || profile.interests.length < 3) errors.push('interests');
  if (!String(profile.promptOne ?? '').trim()) errors.push('promptOne');
  if (!String(profile.promptTwo ?? '').trim()) errors.push('promptTwo');
  return errors;
}
export function validateFaithProfile(profile) {
  const errors = [];
  if (!FAITH_IDENTITIES.includes(profile.faithIdentity)) errors.push('faithIdentity');
  if (!FAITH_PRACTICES.includes(profile.faithPractice)) errors.push('faithPractice');
  if (!FAITH_IMPORTANCE.includes(profile.faithImportance)) errors.push('faithImportance');
  if (!Array.isArray(profile.faithTags)) errors.push('faithTags');
  return errors;
}

export function createInitialState() {
  return {
    schemaVersion: 2,
    language: 'nl', screen: 'welcome', dateOfBirth: '', currentRelationshipState: '', communityFit: false, seriousIntent: false, acceptedTerms: false,
    accountEmail: '', accountCodeSent: false, accountCode: '', accountVerified: false, studentCodeSent: false, studentCode: '',
    capturedFrame: null, avatarVariants: [], selectedAvatarStyle: '', avatarDataUrl: null, avatarAccepted: false,
    profile: {
      nickname: '', genderIdentity: '', seeking: '', city: '', lifeStage: '', educationLevel: '', institutionId: '', studentEmail: '', studentVerified: false,
      maritalHistory: '', childStatus: '', childCountBand: '', childWish: '', acceptsPartnerChildren: '', intent: '',
      interests: [], promptOne: '', promptTwo: '', faithIdentity: '', faithPractice: '', faithImportance: '', faithTags: [],
      showInstitution: false, showFaithPractice: false, showChildCount: false
    },
    discoveryIndex: 0, matches: [], likedProfileIds: [], passedProfileIds: [], activeChatId: null, chats: {}, paused: false, blockedProfileIds: [], endedMatchIds: [],
    commentingOn: null, modal: null, feedback: [], reports: [], contactEntitlements: 1, profilePublished: false, hasPilotMatch: false, likeComments: {}
  };
}
