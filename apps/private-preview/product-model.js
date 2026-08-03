const LANGUAGES = new Set(['nl', 'en']);
const PRODUCT_STAGES = Object.freeze([
  'eligibility',
  'identity',
  'life_stage',
  'family',
  'faith',
  'personality',
  'portrait',
  'preview'
]);

const SEEDED_PORTRAITS = new Set([
  'yasmin', 'bilal', 'amina', 'idris', 'maryam',
  'samir', 'noura', 'youssef', 'hafsa', 'omar'
]);

const COPY = Object.freeze({
  nl: Object.freeze({
    'nav.home': 'Start',
    'nav.profile': 'Profiel',
    'nav.discover': 'Ontdekken',
    'nav.matches': 'Matches',
    'nav.account': 'Account',
    'home.eyebrow': 'JOUW RENDEZVUE',
    'home.title': 'Rustig kennismaken, met duidelijke intenties.',
    'home.intro': 'Maak je profiel af, kies een privacyportret en ontdek andere synthetische proefprofielen.',
    'home.progress': 'Profielvoortgang',
    'home.continue': 'Ga verder met je profiel',
    'home.discover': 'Bekijk profielen',
    'home.staging': 'Dit blijft een gecontroleerde synthetische testomgeving. Er worden geen echte gebruikers toegelaten.',
    'profile.title': 'Bouw je profiel',
    'profile.intro': 'Je antwoorden helpen om relevante profielen te tonen. Je kiest zelf wat direct zichtbaar is en wat pas na een match wordt gedeeld.',
    'profile.eligibility': 'Basis en intentie',
    'profile.identity': 'Wie ben je?',
    'profile.life': 'Studie en levensfase',
    'profile.family': 'Gezin en toekomst',
    'profile.faith': 'Geloof en leefstijl',
    'profile.personality': 'Persoonlijkheid',
    'profile.birthDate': 'Geboortedatum',
    'profile.adult': 'Ik ben 18 jaar of ouder',
    'profile.single': 'Ik ben op dit moment single',
    'profile.serious': 'Ik zoek een serieuze kennismaking',
    'profile.community': 'Ik begrijp de uitgangspunten van deze community',
    'profile.nickname': 'Voornaam of schermnaam',
    'profile.sex': 'Sekse',
    'profile.sexWoman': 'Vrouw',
    'profile.sexMan': 'Man',
    'profile.partnerDerived': 'Rendezvue toont automatisch profielen van {partner}. Deze keuze volgt uit je sekse en is niet apart instelbaar.',
    'profile.partnerWoman': 'vrouwen',
    'profile.partnerMan': 'mannen',
    'profile.city': 'Regio of stad',
    'profile.intent': 'Wat zoek je?',
    'profile.bio': 'Korte bio',
    'profile.lifeStage': 'Levensfase',
    'profile.student': 'Student',
    'profile.graduate': 'Recent afgestudeerd',
    'profile.employed': 'Werkend',
    'profile.selfEmployed': 'Zelfstandig',
    'profile.education': 'Opleidingsniveau',
    'profile.educationMbo': 'MBO',
    'profile.educationHbo': 'HBO',
    'profile.educationWo': 'WO',
    'profile.studyField': 'Studie of vakgebied',
    'profile.occupation': 'Werkgebied',
    'profile.marital': 'Huwelijksverleden',
    'profile.neverMarried': 'Nooit getrouwd',
    'profile.divorced': 'Gescheiden',
    'profile.widowed': 'Weduwe of weduwnaar',
    'profile.children': 'Heb je kinderen?',
    'profile.yes': 'Ja',
    'profile.no': 'Nee',
    'profile.wantsChildren': 'Wil je kinderen?',
    'profile.acceptsChildren': 'Sta je open voor iemand met kinderen?',
    'profile.yesMaybeNo': 'Ja / Misschien / Nee',
    'profile.faithIdentity': 'Hoe omschrijf je je religieuze achtergrond?',
    'profile.practice': 'Wat betekent geloof of leefstijl in je dagelijks leven?',
    'profile.compatibility': 'Hoe belangrijk is overeenstemming hierover?',
    'profile.visibility': 'Wanneer mag dit zichtbaar zijn?',
    'profile.afterMatch': 'Na een match',
    'profile.public': 'Op mijn profiel',
    'profile.private': 'Privé houden',
    'profile.promptOne': 'Mijn ideale rustige dag…',
    'profile.promptTwo': 'Wat ik belangrijk vind in iemand…',
    'profile.interests': 'Interesses, gescheiden door komma’s',
    'profile.save': 'Profiel opslaan en doorgaan',
    'profile.saved': 'Je profiel is veilig opgeslagen.',
    'profile.validation': 'Controleer de gemarkeerde velden voordat je doorgaat.',
    'portrait.title': 'Kies je privacyportret',
    'portrait.intro': 'Gebruik uitsluitend een synthetische afbeelding in deze test. Het bestand blijft privé opgeslagen; alleen het gekozen privacyportret wordt gebruikt.',
    'portrait.file': 'JPEG, PNG of WebP',
    'portrait.upload': 'Uploaden en selecteren',
    'portrait.selected': 'Privacyportret geselecteerd.',
    'portrait.none': 'Nog geen portret gekozen',
    'preview.title': 'Zo ziet je profiel eruit',
    'preview.intro': 'Controleer je profiel voordat je het publiceert in de synthetische ontdekfeed.',
    'preview.publish': 'Profiel publiceren',
    'preview.published': 'Je profiel is gepubliceerd en kan in de synthetische ontdekfeed verschijnen.',
    'discover.title': 'Ontdekken',
    'discover.intro': 'Alle getoonde personen zijn synthetische proefprofielen. Een pass verlaagt niemands algemene zichtbaarheid.',
    'discover.refresh': 'Profielen vernieuwen',
    'discover.empty': 'Er zijn nu geen passende profielen zichtbaar.',
    'discover.pass': 'Overslaan',
    'discover.like': 'Leuk',
    'discover.context': 'Reageer op profiel',
    'discover.contextPrompt': 'Schrijf een korte, respectvolle openingszin',
    'discover.sentPass': 'Profiel overgeslagen.',
    'discover.sentLike': 'Je interesse is opgeslagen.',
    'discover.sentContext': 'Je persoonlijke reactie is opgeslagen.',
    'matches.title': 'Matches en gesprek',
    'matches.intro': 'Een gesprek ontstaat pas na wederzijdse interesse en een geldig contactrecht.',
    'matches.refresh': 'Status vernieuwen',
    'matches.none': 'Nog geen actieve match.',
    'matches.active': 'Jullie hebben een match.',
    'matches.contact': 'Gesprek openen',
    'matches.contactNote': 'In deze synthetische omgeving wordt één test-contactrecht gebruikt. Er vindt geen betaling plaats.',
    'matches.open': 'Gesprek geopend.',
    'chat.title': 'Gesprek',
    'chat.empty': 'Nog geen berichten. Begin rustig en respectvol.',
    'chat.placeholder': 'Schrijf een bericht…',
    'chat.send': 'Versturen',
    'chat.you': 'Jij',
    'chat.other': 'Match',
    'safety.title': 'Contact en veiligheid',
    'safety.end': 'Contact beëindigen',
    'safety.block': 'Blokkeren',
    'safety.report': 'Melden',
    'safety.reportCategory': 'Wat is er aan de hand?',
    'safety.hiddenRelationship': 'Mogelijk verborgen relatie',
    'safety.scam': 'Geldvraag of scam',
    'safety.harassment': 'Druk of intimidatie',
    'safety.other': 'Iets anders',
    'safety.description': 'Korte toelichting',
    'safety.submit': 'Private melding versturen',
    'safety.ended': 'Het contact is beëindigd. Nieuwe berichten en nieuwe portrettoegang zijn geblokkeerd.',
    'safety.blocked': 'Deze persoon is geblokkeerd en het contact is bevroren.',
    'safety.reported': 'Je melding is privé opgeslagen voor beoordeling.',
    'status.loading': 'Laden…',
    'status.saved': 'Opgeslagen',
    'status.error': 'Dat ging niet goed. Probeer het opnieuw of open de geavanceerde testinformatie.',
    'status.signedOut': 'Log in om deze onderdelen te gebruiken.'
  }),
  en: Object.freeze({
    'nav.home': 'Home',
    'nav.profile': 'Profile',
    'nav.discover': 'Discover',
    'nav.matches': 'Matches',
    'nav.account': 'Account',
    'home.eyebrow': 'YOUR RENDEZVUE',
    'home.title': 'Meet calmly, with clear intentions.',
    'home.intro': 'Complete your profile, select a privacy portrait and discover other synthetic proof profiles.',
    'home.progress': 'Profile progress',
    'home.continue': 'Continue your profile',
    'home.discover': 'Browse profiles',
    'home.staging': 'This remains a controlled synthetic test environment. No real users are admitted.',
    'profile.title': 'Build your profile',
    'profile.intro': 'Your answers help surface relevant profiles. You decide what is visible immediately and what is shared after a match.',
    'profile.eligibility': 'Basics and intention',
    'profile.identity': 'Who are you?',
    'profile.life': 'Study and life stage',
    'profile.family': 'Family and future',
    'profile.faith': 'Faith and lifestyle',
    'profile.personality': 'Personality',
    'profile.birthDate': 'Date of birth',
    'profile.adult': 'I am 18 or older',
    'profile.single': 'I am currently single',
    'profile.serious': 'I am looking for a serious introduction',
    'profile.community': 'I understand the principles of this community',
    'profile.nickname': 'First name or display name',
    'profile.sex': 'Sex',
    'profile.sexWoman': 'Woman',
    'profile.sexMan': 'Man',
    'profile.partnerDerived': 'Rendezvue automatically shows profiles of {partner}. This follows from your sex and is not configured separately.',
    'profile.partnerWoman': 'women',
    'profile.partnerMan': 'men',
    'profile.city': 'Region or city',
    'profile.intent': 'What are you looking for?',
    'profile.bio': 'Short bio',
    'profile.lifeStage': 'Life stage',
    'profile.student': 'Student',
    'profile.graduate': 'Recent graduate',
    'profile.employed': 'Employed',
    'profile.selfEmployed': 'Self-employed',
    'profile.education': 'Education level',
    'profile.educationMbo': 'MBO',
    'profile.educationHbo': 'HBO',
    'profile.educationWo': 'WO',
    'profile.studyField': 'Study or field',
    'profile.occupation': 'Work field',
    'profile.marital': 'Marital history',
    'profile.neverMarried': 'Never married',
    'profile.divorced': 'Divorced',
    'profile.widowed': 'Widowed',
    'profile.children': 'Do you have children?',
    'profile.yes': 'Yes',
    'profile.no': 'No',
    'profile.wantsChildren': 'Do you want children?',
    'profile.acceptsChildren': 'Are you open to someone with children?',
    'profile.yesMaybeNo': 'Yes / Maybe / No',
    'profile.faithIdentity': 'How do you describe your religious background?',
    'profile.practice': 'What does faith or lifestyle mean in daily life?',
    'profile.compatibility': 'How important is compatibility here?',
    'profile.visibility': 'When may this be visible?',
    'profile.afterMatch': 'After a match',
    'profile.public': 'On my profile',
    'profile.private': 'Keep private',
    'profile.promptOne': 'My ideal quiet day…',
    'profile.promptTwo': 'What I value in someone…',
    'profile.interests': 'Interests, separated by commas',
    'profile.save': 'Save profile and continue',
    'profile.saved': 'Your profile has been saved securely.',
    'profile.validation': 'Check the highlighted fields before continuing.',
    'portrait.title': 'Choose your privacy portrait',
    'portrait.intro': 'Use only a synthetic image in this test. The file remains privately stored; only the selected privacy portrait is used.',
    'portrait.file': 'JPEG, PNG or WebP',
    'portrait.upload': 'Upload and select',
    'portrait.selected': 'Privacy portrait selected.',
    'portrait.none': 'No portrait selected yet',
    'preview.title': 'This is how your profile looks',
    'preview.intro': 'Review your profile before publishing it to the synthetic discovery feed.',
    'preview.publish': 'Publish profile',
    'preview.published': 'Your profile is published and may appear in the synthetic discovery feed.',
    'discover.title': 'Discover',
    'discover.intro': 'Every person shown is a synthetic proof profile. A pass does not reduce anyone’s general visibility.',
    'discover.refresh': 'Refresh profiles',
    'discover.empty': 'No suitable profiles are visible right now.',
    'discover.pass': 'Pass',
    'discover.like': 'Like',
    'discover.context': 'Respond to profile',
    'discover.contextPrompt': 'Write a short, respectful opener',
    'discover.sentPass': 'Profile passed.',
    'discover.sentLike': 'Your interest has been saved.',
    'discover.sentContext': 'Your personal response has been saved.',
    'matches.title': 'Matches and conversation',
    'matches.intro': 'A conversation starts only after mutual interest and a valid contact right.',
    'matches.refresh': 'Refresh status',
    'matches.none': 'No active match yet.',
    'matches.active': 'You have a match.',
    'matches.contact': 'Open conversation',
    'matches.contactNote': 'This synthetic environment uses one test contact right. No payment takes place.',
    'matches.open': 'Conversation opened.',
    'chat.title': 'Conversation',
    'chat.empty': 'No messages yet. Start calmly and respectfully.',
    'chat.placeholder': 'Write a message…',
    'chat.send': 'Send',
    'chat.you': 'You',
    'chat.other': 'Match',
    'safety.title': 'Contact and safety',
    'safety.end': 'End contact',
    'safety.block': 'Block',
    'safety.report': 'Report',
    'safety.reportCategory': 'What happened?',
    'safety.hiddenRelationship': 'Possible hidden relationship',
    'safety.scam': 'Money request or scam',
    'safety.harassment': 'Pressure or harassment',
    'safety.other': 'Something else',
    'safety.description': 'Short explanation',
    'safety.submit': 'Send private report',
    'safety.ended': 'Contact has ended. New messages and new portrait access are blocked.',
    'safety.blocked': 'This person is blocked and the contact is frozen.',
    'safety.reported': 'Your report was stored privately for review.',
    'status.loading': 'Loading…',
    'status.saved': 'Saved',
    'status.error': 'Something went wrong. Try again or open the advanced test information.',
    'status.signedOut': 'Sign in to use these sections.'
  })
});

export function normaliseProductLanguage(value) {
  const language = String(value ?? '').trim().toLowerCase().split('-')[0];
  return LANGUAGES.has(language) ? language : 'nl';
}

export function productCopy(language, key, replacements = {}) {
  const lang = normaliseProductLanguage(language);
  let value = COPY[lang][key] ?? COPY.nl[key] ?? key;
  for (const [name, replacement] of Object.entries(replacements)) {
    value = value.replaceAll(`{${name}}`, String(replacement));
  }
  return value;
}

export function productCopyKeys(language) {
  return Object.keys(COPY[normaliseProductLanguage(language)]).sort();
}

export function derivePartnerSex(sex) {
  if (sex === 'woman') return 'man';
  if (sex === 'man') return 'woman';
  throw new TypeError('Sex must be woman or man');
}

export function isAdultDate(value, now = new Date()) {
  const date = new Date(`${String(value ?? '').trim()}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;
  const threshold = new Date(Date.UTC(
    now.getUTCFullYear() - 18,
    now.getUTCMonth(),
    now.getUTCDate()
  ));
  return date <= threshold;
}

export function normaliseInterests(value) {
  const source = Array.isArray(value) ? value : String(value ?? '').split(',');
  return [...new Set(source
    .map((item) => String(item ?? '').trim().toLowerCase())
    .filter(Boolean))]
    .slice(0, 12);
}

export function buildOnboardingPayload(values, now = new Date()) {
  const source = values && typeof values === 'object' ? values : {};
  const sex = String(source.sex ?? '');
  const partnerSex = derivePartnerSex(sex);
  const dateOfBirth = String(source.dateOfBirth ?? '').trim();
  const requiredConfirmations = ['adultConfirmed', 'singleConfirmed', 'seriousConfirmed', 'communityConfirmed'];
  if (!isAdultDate(dateOfBirth, now) || requiredConfirmations.some((key) => source[key] !== true)) {
    throw new TypeError('Eligibility confirmations are incomplete');
  }

  const nickname = String(source.nickname ?? '').trim();
  const city = String(source.city ?? '').trim();
  const relationshipIntent = String(source.relationshipIntent ?? '').trim();
  if (!nickname || !city || !relationshipIntent) throw new TypeError('Identity fields are incomplete');

  const primaryStatus = String(source.primaryStatus ?? 'student');
  const educationLevel = primaryStatus === 'student' ? String(source.educationLevel ?? 'hbo') : null;
  const hasChildren = source.hasChildren === true;
  const timestamp = now.toISOString();
  const interests = normaliseInterests(source.interests);

  return Object.freeze({
    partnerSex,
    completedStages: Object.freeze(['eligibility', 'account', 'identity', 'life_stage', 'family', 'faith', 'personality']),
    stages: Object.freeze({
      eligibility: Object.freeze({
        date_of_birth: dateOfBirth,
        current_relationship_state: 'single',
        adult_confirmed: true,
        serious_intent_confirmed: true,
        community_fit_confirmed: true,
        terms_version: 'synthetic-product-2026-08',
        confirmed_at: timestamp
      }),
      identity: Object.freeze({
        nickname,
        sex,
        city_region: city,
        language: normaliseProductLanguage(source.language),
        relationship_intent: relationshipIntent,
        bio: String(source.bio ?? '').trim()
      }),
      life_stage: Object.freeze({
        primary_status: primaryStatus,
        education_level: educationLevel,
        study_field: primaryStatus === 'student' ? String(source.studyField ?? '').trim() || null : null,
        occupation_category: primaryStatus === 'student' ? null : String(source.occupation ?? '').trim() || null,
        institution_visible: false
      }),
      family: Object.freeze({
        marital_history: String(source.maritalHistory ?? 'never_married'),
        has_children: hasChildren,
        child_count_band: hasChildren ? String(source.childCountBand ?? 'one_two') : null,
        wants_children: String(source.wantsChildren ?? 'maybe'),
        accepts_partner_with_children: String(source.acceptsChildren ?? 'maybe'),
        marital_history_visibility: 'public',
        children_visibility: 'after_match'
      }),
      faith: Object.freeze({
        faith_identity: String(source.faithIdentity ?? '').trim(),
        practice_description: String(source.practiceDescription ?? '').trim(),
        compatibility_importance: String(source.compatibilityImportance ?? 'discuss_personally'),
        lifestyle_tags: normaliseInterests(source.lifestyleTags),
        practice_visibility: String(source.practiceVisibility ?? 'after_match'),
        consent_version: 'synthetic-product-1',
        consented_at: timestamp
      })
    }),
    personality: Object.freeze({
      prompts: Object.freeze([
        Object.freeze({ prompt_key: 'ideal_day', response: String(source.promptOne ?? '').trim() }),
        Object.freeze({ prompt_key: 'important_values', response: String(source.promptTwo ?? '').trim() })
      ]),
      interests: Object.freeze(interests)
    })
  });
}

export function profilePreview(values) {
  const source = values && typeof values === 'object' ? values : {};
  return Object.freeze({
    nickname: String(source.nickname ?? '').trim() || 'Rendezvue',
    city: String(source.city ?? '').trim(),
    lifeStage: String(source.primaryStatus ?? ''),
    relationshipIntent: String(source.relationshipIntent ?? '').trim(),
    bio: String(source.bio ?? '').trim(),
    interests: Object.freeze(normaliseInterests(source.interests)),
    partnerSex: derivePartnerSex(String(source.sex ?? 'woman'))
  });
}

export function projectDiscoveryProfile(row) {
  const source = row && typeof row === 'object' ? row : {};
  const nickname = String(source.nickname ?? '').trim() || 'Rendezvue-profiel';
  return Object.freeze({
    key: String(source.user_id ?? ''),
    targetUserId: String(source.user_id ?? ''),
    display: Object.freeze({
      nickname,
      sex: String(source.sex ?? ''),
      city: String(source.city_region ?? '').trim(),
      relationshipIntent: String(source.relationship_intent ?? '').trim(),
      bio: String(source.bio ?? '').trim(),
      lifeStage: String(source.primary_status ?? '').trim(),
      portraitAsset: portraitAssetForNickname(nickname)
    })
  });
}

export function portraitAssetForNickname(nickname) {
  const slug = String(nickname ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return SEEDED_PORTRAITS.has(slug) ? `./assets/profiles/${slug}.webp` : null;
}

export function onboardingProgress(completedStages) {
  const completed = new Set((completedStages ?? []).map((stage) => String(stage)));
  const count = PRODUCT_STAGES.filter((stage) => completed.has(stage)).length;
  return Object.freeze({
    count,
    total: PRODUCT_STAGES.length,
    percent: Math.round((count / PRODUCT_STAGES.length) * 100),
    complete: count === PRODUCT_STAGES.length
  });
}

export function resolveProductTab(value) {
  const allowed = new Set(['home', 'profile', 'discover', 'matches', 'account']);
  const tab = String(value ?? '').trim().toLowerCase();
  return allowed.has(tab) ? tab : 'home';
}

export { PRODUCT_STAGES };