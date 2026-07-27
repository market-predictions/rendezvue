const COPY = Object.freeze({
  nl: {
    languageName: 'Nederlands', otherLanguage: 'English', prototype: 'Prototype', privatePilot: 'Privépilot',
    discover: 'Ontdekken', matches: 'Matches', chats: 'Chats', profile: 'Profiel', back: 'Terug', continue: 'Doorgaan', cancel: 'Annuleren', install: 'Installeren',
    welcomeTitle: 'Ontmoet studenten.\nHoud je gezicht privé.',
    welcomeBody: 'Een dating- en kennismakingsconcept voor moslimstudenten en studenten met een moslimachtergrond in Nederland.',
    welcomePillStudent: 'MBO · HBO · WO', welcomePillFaith: 'Geloof & leefstijl', welcomePillAvatar: 'Privacy-avatar', startPilot: 'Start de pilotflow',
    prototypeWarning: '<strong>Alleen een prototype.</strong> Leeftijd, inschrijving en liveness worden nog niet productieklaar geverifieerd.',
    dateOfBirth: 'Geboortedatum', adultTerms: 'Ik ben 18 jaar of ouder en begrijp dat dit een niet-productierijpe demonstratie is.', createPrivateProfile: 'Maak mijn privéprofiel',
    confirmTerms: 'Bevestig de pilotvoorwaarden.', adultsOnly: 'Rendezvue is uitsluitend voor volwassenen van 18 jaar en ouder.',
    stepStudent: 'Studentcheck', probabilitySignal: 'Waarschijnlijkheidssignaal', chooseEducation: 'Kies je onderwijsinstelling',
    studentBody: 'We controleren eerst of het e-maildomein past bij de gekozen instelling. In productie verifiëren we ook dat jij de mailbox beheert.',
    educationLevel: 'Onderwijsniveau', chooseLevel: 'Kies MBO, HBO of WO', institution: 'Instelling', selectInstitution: 'Kies een instelling',
    institutionalEmail: 'E-mailadres van je instelling', emailPlaceholder: 'naam@studentdomein.nl', pilotDomains: 'Pilotdomeinen',
    fixtureWarning: 'Deze domeinen zijn pilotfixtures en worden vóór livegang gevalideerd tegen instellinginformatie.', domainAccepted: 'Het domein past bij deze pilotfixture.',
    mboAdultNote: 'MBO-studenten zijn welkom, maar toegang blijft strikt 18+.', prototypeCode: 'Prototypecode', enterCode: 'Vul de code in', verifyEmail: 'Controleer e-mail',
    noEmailSent: 'In dit prototype wordt geen echte e-mail verzonden.', domainMismatch: 'Het domein past niet bij deze pilotfixture.', useShownCode: 'Gebruik de getoonde prototypecode.',
    stepCapture: 'Live selfie', livenessNotAutomated: 'Liveness nog niet geautomatiseerd', showLivePerson: 'Laat zien dat je een echt persoon bent',
    captureBody: 'Kijk in de camera, knipper één keer en draai je hoofd langzaam naar links. De opname blijft in het geheugen van je browser.',
    cameraOff: 'Camera staat uit', cameraUnavailable: 'Camera niet beschikbaar', startWhenReady: 'Start wanneer je klaar bent.', useFallback: 'Gebruik de synthetische fallback.',
    challenge: 'Kijk vooruit · knipper · draai links', recordingChallenge: 'Opname… knipper en draai links',
    privacyCapture: '<strong>Privacy:</strong> dit prototype heeft geen uploadendpoint. Vernieuwen verwijdert de opname.', startCamera: 'Start camera', recordFour: 'Neem 4 seconden op',
    syntheticAvatar: 'Gebruik synthetische demo-avatar', cameraReady: 'Camera gereed.', cameraFailed: 'Camera kon niet worden gestart.', recordingFailed: 'Opname is mislukt.',
    stepAvatar: 'Avatarvoorbeeld', illustratedPreview: 'Geïllustreerd prototype', yourAvatar: 'Jouw privacy-avatar',
    avatarBody: 'Deze lokale illustratiestijl test een zachtere, romantischere avatar. Het is nog niet het uiteindelijke generatieve model.',
    avatarRule: '<strong>Productieregel:</strong> flatterend en stijlvol mag; leeftijd, huidskleur en gezichtsstructuur wezenlijk veranderen niet.', retake: 'Opnieuw opnemen', useAvatar: 'Gebruik avatar',
    stepProfile: 'Over jou', profileTitle: 'Geef genoeg persoonlijkheid voor een goed gesprek', nickname: 'Voornaam of bijnaam', lookingFor: 'Waar ben je naar op zoek?',
    chooseIntent: 'Kies je intentie', chooseInterests: 'Kies minimaal drie interesses', promptOne: 'Een perfecte pauze tussen colleges is…', promptTwo: 'Wij passen waarschijnlijk goed als…',
    faithChoices: 'Geloof & leefstijl',
    profileErrors: { nickname: 'Kies een voornaam of bijnaam.', intent: 'Kies waar je naar op zoek bent.', interests: 'Kies minimaal drie interesses.', promptOne: 'Beantwoord de eerste profielvraag.', promptTwo: 'Beantwoord de tweede profielvraag.' },
    stepFaith: 'Geloof & leefstijl', faithTitle: 'Vertel wat geloof voor jou betekent',
    faithIntro: 'Dit is geen vroomheidsscore. Het helpt mensen zichzelf en hun voorkeuren eerlijk te beschrijven.',
    faithIdentity: 'Geloofsachtergrond', chooseFaithIdentity: 'Kies wat het beste past', faithPractice: 'Geloofsbeleving in het dagelijks leven', chooseFaithPractice: 'Kies je eigen omschrijving',
    faithImportance: 'Hoe belangrijk is geloof in een match?', chooseFaithImportance: 'Kies een voorkeur', lifestyleTags: 'Optionele leefstijlkenmerken',
    specialDataNotice: '<strong>Let op:</strong> geloof is gevoelige informatie. Jij bepaalt wat zichtbaar is en kunt dit later wijzigen.',
    faithErrors: { faithIdentity: 'Kies je geloofsachtergrond.', faithPractice: 'Kies een omschrijving van je geloofsbeleving.', faithImportance: 'Kies hoe belangrijk geloof is in een match.', faithTags: 'Controleer je leefstijlkeuzes.' },
    stepPrivacy: 'Privacy', privacyDefault: 'Privacy als standaard', chooseVisibility: 'Kies wat anderen zien', showInstitution: 'Toon mijn instelling', showFaithPractice: 'Toon mijn geloofsbeleving',
    neverPublic: 'Nooit openbaar: achternaam, e-mail, telefoonnummer, exacte locatie en bronvideo.', enterRendezvue: 'Ga naar Rendezvue', studentEmail: 'Studentmail', liveSelfie: 'Live selfie',
    profileReady: 'Profiel gereed. Alle getoonde personen zijn synthetisch.', endDeck: 'Einde van de pilotprofielen', resetProfiles: 'Profielen opnieuw tonen',
    profilePaused: '<strong>Je profiel staat gepauzeerd.</strong> Je kunt de ontdekfunctie nog testen.', conversationPrompt: 'Gespreksstarter', likePrompt: 'Like dit antwoord',
    likePlaceholder: 'Dat klinkt als mijn soort middag…', sendLike: 'Stuur like', likeSent: 'Like verstuurd naar {name}.', matchedContext: 'Match na een inhoudelijke like',
    noMatches: 'Nog geen matches', deterministicMatch: 'Samira is de vaste pilotmatch.', messagesHere: 'Berichten verschijnen hier', mutualRequired: 'Berichten sturen kan alleen na een wederzijdse match.',
    startConversation: 'Begin een gesprek', studentLive: 'Student · live selfie', chatPrivacy: 'Deel persoonlijke contactgegevens pas als jij je daar prettig bij voelt.', writeMessage: 'Schrijf een bericht',
    yourProfile: 'Jouw profiel', privacy: 'Privacy', pauseDiscovery: 'Pauzeer ontdekking', matchesRemain: 'Matches blijven beschikbaar', pilotControls: 'Pilotbediening',
    restartOnboarding: 'Start onboarding opnieuw', deleteLocalState: 'Verwijder lokale demostatus', profilePausedToast: 'Profiel gepauzeerd.', profileVisibleToast: 'Profiel weer zichtbaar.',
    mutualInterest: 'Wederzijdse interesse', itIsMatch: 'Het is een match', matchBody: 'Jij en {name} kozen allebei voor contact.', startWithComment: 'Begin met je reactie', keepDiscovering: 'Verder ontdekken',
    safetyOptions: 'Veiligheidsopties', safetyFor: ' voor {name}', safetyBody: 'Dit prototype bewaart acties alleen lokaal tijdens deze sessie.', blockProfile: 'Blokkeer profiel', reportProfile: 'Rapporteer profiel',
    safetyGeneral: 'Stuur nooit geld naar een match. Houd exacte locatie en contactgegevens privé.', localReport: 'Lokaal prototyperapport vastgelegd.', localBlock: 'Profiel lokaal geblokkeerd.',
    educationLabels: { mbo: 'MBO', hbo: 'HBO', wo: 'WO' },
    interests: { coffee: 'Koffie & wandelen', football: 'Voetbal', music: 'Muziek', cinema: 'Film', books: 'Boeken', travel: 'Reizen', gaming: 'Gaming', fitness: 'Fitness', food: 'Eten', art: 'Kunst', technology: 'Technologie', languages: 'Talen', volunteering: 'Vrijwilligerswerk', nature: 'Natuur' },
    intents: { marriage: 'Gericht op huwelijk', serious: 'Serieuze relatie', getToKnow: 'Rustig kennismaken', unsure: 'Nog niet zeker' },
    faithIdentities: { muslim: 'Moslim', muslimBackground: 'Moslimachtergrond', convert: 'Bekeerd', exploring: 'Zoekend / spiritueel', preferNotSay: 'Zeg ik liever niet' },
    faithPractices: { activelyPracticing: 'Actief praktiserend', practicing: 'Praktiserend', moderate: 'Gematigd praktiserend', cultural: 'Cultureel verbonden', private: 'Houd ik liever privé' },
    faithImportanceOptions: { essential: 'Essentieel', important: 'Belangrijk', open: 'Belangrijk, maar ik sta open', flexible: 'Geen harde voorkeur' },
    lifestyle: { prayer: 'Gebed belangrijk', ramadan: 'Ramadan belangrijk', halal: 'Halal leefstijl', noAlcohol: 'Geen alcohol', noSmoking: 'Rookt niet', family: 'Familiegericht', modesty: 'Bescheidenheid belangrijk', community: 'Betrokken bij gemeenschap', marriageMinded: 'Huwelijksgericht' }
  },
  en: {
    languageName: 'English', otherLanguage: 'Nederlands', prototype: 'Prototype', privatePilot: 'Private pilot',
    discover: 'Discover', matches: 'Matches', chats: 'Chats', profile: 'Profile', back: 'Back', continue: 'Continue', cancel: 'Cancel', install: 'Install',
    welcomeTitle: 'Meet students.\nKeep your face private.',
    welcomeBody: 'A dating and introduction concept for Muslim students and students from a Muslim background in the Netherlands.',
    welcomePillStudent: 'MBO · HBO · WO', welcomePillFaith: 'Faith & lifestyle', welcomePillAvatar: 'Privacy avatar', startPilot: 'Start the pilot flow',
    prototypeWarning: '<strong>Prototype only.</strong> Age, enrolment and liveness are not yet verified at production level.', dateOfBirth: 'Date of birth',
    adultTerms: 'I am 18 or older and understand that this is a non-production demonstration.', createPrivateProfile: 'Create my private profile', confirmTerms: 'Confirm the pilot conditions.',
    adultsOnly: 'Rendezvue is restricted to adults aged 18 or older.', stepStudent: 'Student check', probabilitySignal: 'Probability signal', chooseEducation: 'Choose your educational institution',
    studentBody: 'We first check whether the email domain fits the selected institution. Production will also verify mailbox control.', educationLevel: 'Education level', chooseLevel: 'Choose MBO, HBO or WO',
    institution: 'Institution', selectInstitution: 'Select an institution', institutionalEmail: 'Institutional email', emailPlaceholder: 'name@student-domain.nl', pilotDomains: 'Pilot domains',
    fixtureWarning: 'These domains are pilot fixtures and will be validated against institution information before launch.', domainAccepted: 'The domain matches this pilot fixture.',
    mboAdultNote: 'MBO students are welcome, but access remains strictly 18+.', prototypeCode: 'Prototype code', enterCode: 'Enter the code', verifyEmail: 'Verify email',
    noEmailSent: 'No real email is sent in this prototype.', domainMismatch: 'The domain does not match this pilot fixture.', useShownCode: 'Use the displayed prototype code.',
    stepCapture: 'Live selfie', livenessNotAutomated: 'Liveness not automated', showLivePerson: 'Show that you are a live person', captureBody: 'Look into the camera, blink once and slowly turn your head left. The clip stays in browser memory.',
    cameraOff: 'Camera is off', cameraUnavailable: 'Camera unavailable', startWhenReady: 'Start when ready.', useFallback: 'Use the synthetic fallback.', challenge: 'Look forward · blink · turn left', recordingChallenge: 'Recording… blink and turn left',
    privacyCapture: '<strong>Privacy:</strong> this prototype has no upload endpoint. Reloading discards the capture.', startCamera: 'Start camera', recordFour: 'Record 4 seconds', syntheticAvatar: 'Use synthetic demo avatar',
    cameraReady: 'Camera ready.', cameraFailed: 'Camera could not start.', recordingFailed: 'Recording failed.', stepAvatar: 'Avatar preview', illustratedPreview: 'Illustrated prototype', yourAvatar: 'Your privacy avatar',
    avatarBody: 'This local illustration treatment tests a softer, more romantic avatar. It is not the final generative model.', avatarRule: '<strong>Production rule:</strong> flattering and stylish is acceptable; materially changing age, skin tone or facial structure is not.',
    retake: 'Retake', useAvatar: 'Use avatar', stepProfile: 'About you', profileTitle: 'Add enough personality to start a good conversation', nickname: 'First name or nickname', lookingFor: 'What are you looking for?',
    chooseIntent: 'Choose an intention', chooseInterests: 'Choose at least three interests', promptOne: 'A perfect break between classes is…', promptTwo: 'We will probably get along if…', faithChoices: 'Faith & lifestyle',
    profileErrors: { nickname: 'Choose a first name or nickname.', intent: 'Choose what you are looking for.', interests: 'Choose at least three interests.', promptOne: 'Answer the first profile prompt.', promptTwo: 'Answer the second profile prompt.' },
    stepFaith: 'Faith & lifestyle', faithTitle: 'Describe what faith means to you', faithIntro: 'This is not a piety score. It helps people describe themselves and their preferences honestly.',
    faithIdentity: 'Faith background', chooseFaithIdentity: 'Choose what fits best', faithPractice: 'Faith in daily life', chooseFaithPractice: 'Choose your own description', faithImportance: 'How important is faith in a match?',
    chooseFaithImportance: 'Choose a preference', lifestyleTags: 'Optional lifestyle traits', specialDataNotice: '<strong>Note:</strong> faith is sensitive information. You choose what is visible and can change it later.',
    faithErrors: { faithIdentity: 'Choose your faith background.', faithPractice: 'Choose a description of your faith practice.', faithImportance: 'Choose how important faith is in a match.', faithTags: 'Review your lifestyle choices.' },
    stepPrivacy: 'Privacy', privacyDefault: 'Privacy by default', chooseVisibility: 'Choose what people can see', showInstitution: 'Show my institution', showFaithPractice: 'Show my faith practice',
    neverPublic: 'Never public: surname, email, phone, exact location and source video.', enterRendezvue: 'Enter Rendezvue', studentEmail: 'Student email', liveSelfie: 'Live selfie',
    profileReady: 'Profile ready. Everyone shown is synthetic.', endDeck: 'End of the pilot profiles', resetProfiles: 'Reset profiles', profilePaused: '<strong>Your profile is paused.</strong> You can still test discovery.',
    conversationPrompt: 'Conversation prompt', likePrompt: 'Like this answer', likePlaceholder: 'That sounds like my kind of afternoon…', sendLike: 'Send like', likeSent: 'Like sent to {name}.', matchedContext: 'Matched after a contextual like',
    noMatches: 'No matches yet', deterministicMatch: 'Samira is the deterministic pilot match.', messagesHere: 'Messages appear here', mutualRequired: 'Messaging requires a mutual match.', startConversation: 'Start a conversation',
    studentLive: 'Student · live selfie', chatPrivacy: 'Keep personal contact details private until you feel comfortable.', writeMessage: 'Write a message', yourProfile: 'Your profile', privacy: 'Privacy',
    pauseDiscovery: 'Pause discovery', matchesRemain: 'Matches remain available', pilotControls: 'Pilot controls', restartOnboarding: 'Restart onboarding', deleteLocalState: 'Delete local demo state',
    profilePausedToast: 'Profile paused.', profileVisibleToast: 'Profile visible again.', mutualInterest: 'Mutual interest', itIsMatch: 'It is a match', matchBody: 'You and {name} both chose to connect.',
    startWithComment: 'Start with your comment', keepDiscovering: 'Keep discovering', safetyOptions: 'Safety options', safetyFor: ' for {name}', safetyBody: 'This prototype records actions only in local session state.',
    blockProfile: 'Block profile', reportProfile: 'Report profile', safetyGeneral: 'Never send money to a match. Keep precise location and contact details private.', localReport: 'Local prototype report recorded.', localBlock: 'Profile blocked locally.',
    educationLabels: { mbo: 'MBO – vocational', hbo: 'HBO – applied sciences', wo: 'WO – research university' },
    interests: { coffee: 'Coffee walks', football: 'Football', music: 'Music', cinema: 'Cinema', books: 'Books', travel: 'Travel', gaming: 'Gaming', fitness: 'Fitness', food: 'Food', art: 'Art', technology: 'Technology', languages: 'Languages', volunteering: 'Volunteering', nature: 'Nature' },
    intents: { marriage: 'Marriage-oriented', serious: 'A serious relationship', getToKnow: 'Getting to know each other', unsure: 'Not sure yet' },
    faithIdentities: { muslim: 'Muslim', muslimBackground: 'Muslim background', convert: 'Convert', exploring: 'Exploring / spiritual', preferNotSay: 'Prefer not to say' },
    faithPractices: { activelyPracticing: 'Actively practising', practicing: 'Practising', moderate: 'Moderately practising', cultural: 'Culturally connected', private: 'Prefer to keep private' },
    faithImportanceOptions: { essential: 'Essential', important: 'Important', open: 'Important, but open', flexible: 'No strict preference' },
    lifestyle: { prayer: 'Prayer matters', ramadan: 'Ramadan matters', halal: 'Halal lifestyle', noAlcohol: 'No alcohol', noSmoking: 'Does not smoke', family: 'Family-oriented', modesty: 'Modesty matters', community: 'Community-minded', marriageMinded: 'Marriage-minded' }
  }
});

function readPath(object, path) {
  return path.split('.').reduce((value, key) => value?.[key], object);
}

export function t(language, key, variables = {}) {
  const locale = COPY[language] ?? COPY.nl;
  const fallback = COPY.nl;
  let value = readPath(locale, key) ?? readPath(fallback, key) ?? key;
  if (typeof value !== 'string') return value;
  for (const [name, replacement] of Object.entries(variables)) value = value.replaceAll(`{${name}}`, String(replacement));
  return value;
}

export function label(language, group, key) {
  return t(language, `${group}.${key}`);
}

export function supportedLanguage(value) {
  return value === 'en' ? 'en' : 'nl';
}
