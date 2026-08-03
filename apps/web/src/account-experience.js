const COPY = Object.freeze({
  nl: Object.freeze({
    'language.nl': 'Nederlands',
    'language.en': 'English',
    'account.eyebrow': 'PRIVÉ PREVIEW · ALLEEN SYNTHETISCHE TESTACCOUNTS',
    'account.title': 'Welkom bij Rendezvue',
    'account.intro': 'Log in om je profiel te bekijken, of maak bewust een nieuw account aan.',
    'account.signinTitle': 'Inloggen',
    'account.signinIntro': 'Je ontvangt een eenmalige link per e-mail. Er wordt nooit stilzwijgend een nieuw account aangemaakt.',
    'account.emailLabel': 'E-mailadres',
    'account.emailPlaceholder': 'jij@voorbeeld.nl',
    'account.existingAction': 'Aanmeldlink sturen',
    'account.registrationAction': 'Nieuw account aanmaken',
    'account.privacyHint': 'Om je privacy te beschermen vertellen we niet of een adres al bij Rendezvue bekend is.',
    'account.recoverySummary': 'Geen toegang meer tot je e-mailadres?',
    'account.recoveryIntro': 'Support kan in uitzonderlijke gevallen je loginadres vervangen nadat is gecontroleerd dat het account van jou is.',
    'account.recoveryStepOne': 'Neem contact op met support en noem alleen het adres waarmee je je hebt geregistreerd.',
    'account.recoveryStepTwo': 'We vragen passend bewijs van eigendom. We vragen nooit om je wachtwoord of een volledige mailboxcode.',
    'account.recoveryStepThree': 'Een tweede medewerker controleert de beslissing voordat het loginadres kan worden gewijzigd.',
    'account.recoveryWarning': 'Maak niet direct een tweede account aan: daarmee ontstaan losse matches en gesprekken die niet automatisch kunnen worden samengevoegd.',
    'account.callbackUnusable': 'Deze aanmeldlink is verlopen, al gebruikt of niet geldig. Vraag hieronder een nieuwe link aan.',
    'account.callbackPending': 'Open de link in hetzelfde browserprofiel waarin je hem hebt aangevraagd. Werkt dat niet, vraag dan een nieuwe link aan.',
    'account.requestExisting': 'Controleer je inbox. Als deze aanvraag kan worden uitgevoerd, ontvang je een aanmeldlink. Controleer ook je spammap.',
    'account.requestRegistration': 'Controleer je inbox. Als registratie mogelijk is, ontvang je een link om het nieuwe account te openen.',
    'account.signedIn': 'Je bent ingelogd',
    'account.signedInIntro': 'Dit is het account dat in dit browserprofiel actief is.',
    'account.maskedEmail': 'Ingelogd als',
    'account.signOut': 'Uitloggen op alle apparaten',
    'account.settingsTitle': 'Account en toegang',
    'account.settingsIntro': 'Beheer hier je toegang en verwijder je account wanneer dat nodig is.',
    'account.deleteSummary': 'Account verwijderen',
    'account.deleteIntro': 'Je account, profiel en private portretten worden verwijderd. Bewijs- en veiligheidsregistraties kunnen alleen geanonimiseerd bewaard blijven wanneer dat noodzakelijk is.',
    'account.deleteLabel': 'Typ exact DELETE_SYNTHETIC_ACCOUNT',
    'account.deleteAction': 'Testaccount definitief verwijderen',
    'account.advancedSummary': 'Geavanceerde synthetische testtools',
    'account.advancedIntro': 'Deze onderdelen zijn uitsluitend bedoeld voor gecontroleerde backendtests en horen niet bij de normale gebruikerservaring.',
    'account.stagingNotice': 'Deze omgeving is nog niet geopend voor echte gebruikers. Gebruik uitsluitend gecontroleerde synthetische volwassen testaccounts.',
    'account.backendReady': 'Testbackend verbonden',
    'account.backendError': 'Testbackend niet beschikbaar'
  }),
  en: Object.freeze({
    'language.nl': 'Nederlands',
    'language.en': 'English',
    'account.eyebrow': 'PRIVATE PREVIEW · SYNTHETIC TEST ACCOUNTS ONLY',
    'account.title': 'Welcome to Rendezvue',
    'account.intro': 'Sign in to view your profile, or deliberately create a new account.',
    'account.signinTitle': 'Sign in',
    'account.signinIntro': 'You receive a one-time link by email. A new account is never created silently.',
    'account.emailLabel': 'Email address',
    'account.emailPlaceholder': 'you@example.com',
    'account.existingAction': 'Send sign-in link',
    'account.registrationAction': 'Create new account',
    'account.privacyHint': 'To protect your privacy, we do not reveal whether an address is already known to Rendezvue.',
    'account.recoverySummary': 'No longer have access to your email?',
    'account.recoveryIntro': 'In exceptional cases, support can replace your login address after confirming that the account belongs to you.',
    'account.recoveryStepOne': 'Contact support and provide only the address you originally registered with.',
    'account.recoveryStepTwo': 'We request appropriate proof of ownership. We never ask for your password or a complete mailbox code.',
    'account.recoveryStepThree': 'A second staff member reviews the decision before the login address can be changed.',
    'account.recoveryWarning': 'Do not immediately create a second account: this creates separate matches and conversations that cannot be merged automatically.',
    'account.callbackUnusable': 'This sign-in link has expired, was already used or is invalid. Request a new link below.',
    'account.callbackPending': 'Open the link in the same browser profile where you requested it. If that fails, request a new link.',
    'account.requestExisting': 'Check your inbox. If this request can be completed, you will receive a sign-in link. Also check spam.',
    'account.requestRegistration': 'Check your inbox. If registration is possible, you will receive a link to open the new account.',
    'account.signedIn': 'You are signed in',
    'account.signedInIntro': 'This is the account currently active in this browser profile.',
    'account.maskedEmail': 'Signed in as',
    'account.signOut': 'Sign out on all devices',
    'account.settingsTitle': 'Account and access',
    'account.settingsIntro': 'Manage access and remove your account here when needed.',
    'account.deleteSummary': 'Delete account',
    'account.deleteIntro': 'Your account, profile and private portraits are removed. Evidence and safety records may only be retained in anonymised form where necessary.',
    'account.deleteLabel': 'Type exactly DELETE_SYNTHETIC_ACCOUNT',
    'account.deleteAction': 'Permanently delete test account',
    'account.advancedSummary': 'Advanced synthetic test tools',
    'account.advancedIntro': 'These controls are only for managed backend testing and are not part of the normal user experience.',
    'account.stagingNotice': 'This environment is not open to real users. Use controlled synthetic adult test accounts only.',
    'account.backendReady': 'Test backend connected',
    'account.backendError': 'Test backend unavailable'
  })
});

export function normaliseInterfaceLanguage(value) {
  return String(value ?? '').trim().toLowerCase().startsWith('en') ? 'en' : 'nl';
}

export function accountCopy(language, key) {
  const resolved = normaliseInterfaceLanguage(language);
  return COPY[resolved][key] ?? COPY.nl[key] ?? key;
}

export function genericAccountRequestMessage(language, mode) {
  return accountCopy(
    language,
    mode === 'registration' ? 'account.requestRegistration' : 'account.requestExisting'
  );
}

export function maskAccountEmail(value) {
  const email = String(value ?? '').trim();
  const separator = email.lastIndexOf('@');
  if (separator <= 0 || separator === email.length - 1) return '••••••';
  const local = email.slice(0, separator);
  const domain = email.slice(separator + 1);
  const visible = local.slice(0, Math.min(2, local.length));
  const hiddenLength = Math.max(3, Math.min(8, local.length - visible.length));
  return `${visible}${'•'.repeat(hiddenLength)}@${domain}`;
}

export function classifyAuthCallback(urlValue) {
  const url = urlValue instanceof URL ? urlValue : new URL(String(urlValue), 'https://rendezvue.invalid/');
  const hasProviderError = ['error', 'error_code', 'error_description'].some((key) => url.searchParams.has(key));
  if (hasProviderError) return 'unusable';
  if (url.searchParams.has('code')) return 'pending';
  return 'none';
}

export function removeAuthErrorParameters(urlValue) {
  const url = urlValue instanceof URL ? new URL(urlValue.href) : new URL(String(urlValue), 'https://rendezvue.invalid/');
  for (const key of ['error', 'error_code', 'error_description']) url.searchParams.delete(key);
  return url;
}

export const supportedInterfaceLanguages = Object.freeze(['nl', 'en']);
