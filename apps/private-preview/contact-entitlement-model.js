const CONTACT_COPY = Object.freeze({
  nl: Object.freeze({
    profile_required: 'Publiceer je profiel opnieuw voordat je een gesprek opent.',
    entitlement_unavailable: 'Het eenmalige test-contactrecht is al gebruikt of niet meer geldig.',
    match_inactive: 'Deze match is niet meer actief.',
    interaction_unavailable: 'Dit gesprek kan niet worden geopend.',
    unknown: 'Het gesprek kon niet worden geopend. Vernieuw de status en probeer opnieuw.'
  }),
  en: Object.freeze({
    profile_required: 'Publish your profile again before opening a conversation.',
    entitlement_unavailable: 'The one-time test contact right has already been used or is no longer valid.',
    match_inactive: 'This match is no longer active.',
    interaction_unavailable: 'This conversation cannot be opened.',
    unknown: 'The conversation could not be opened. Refresh the status and try again.'
  })
});

function errorText(error) {
  return String(error instanceof Error ? error.message : error ?? '').toLowerCase();
}

export function contactOpenErrorCode(error) {
  const message = errorText(error);
  if (message.includes('published synthetic proof profile required')) return 'profile_required';
  if (message.includes('no contact entitlement available')) return 'entitlement_unavailable';
  if (message.includes('active match required')) return 'match_inactive';
  if (message.includes('interaction unavailable') || message.includes('not a match participant')) {
    return 'interaction_unavailable';
  }
  return 'unknown';
}

export function contactOpenErrorMessage(error, language = 'nl') {
  const selected = language === 'en' ? 'en' : 'nl';
  return CONTACT_COPY[selected][contactOpenErrorCode(error)];
}
