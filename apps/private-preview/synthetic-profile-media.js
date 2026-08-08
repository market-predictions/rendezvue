export const SYNTHETIC_PROFILE_MEDIA = Object.freeze({
  yasmin: Object.freeze({ displayName: 'Yasmin', asset: './assets/profiles/yasmin.webp' }),
  bilal: Object.freeze({ displayName: 'Bilal', asset: './assets/profiles/bilal.webp' }),
  amina: Object.freeze({ displayName: 'Amina', asset: './assets/profiles/amina.webp' }),
  idris: Object.freeze({ displayName: 'Idris', asset: './assets/profiles/idris.webp' }),
  maryam: Object.freeze({ displayName: 'Maryam', asset: './assets/profiles/maryam.webp' }),
  samir: Object.freeze({ displayName: 'Samir', asset: './assets/profiles/samir.webp' }),
  noura: Object.freeze({ displayName: 'Noura', asset: './assets/profiles/noura.webp' }),
  youssef: Object.freeze({ displayName: 'Youssef', asset: './assets/profiles/youssef.webp' }),
  hafsa: Object.freeze({ displayName: 'Hafsa', asset: './assets/profiles/hafsa.webp' }),
  omar: Object.freeze({ displayName: 'Omar', asset: './assets/profiles/omar.webp' })
});

export function normaliseSyntheticProfileName(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function syntheticProfileMediaForName(value) {
  const tokens = normaliseSyntheticProfileName(value).split(/\s+/).filter(Boolean);
  const key = tokens.find((token) => Object.hasOwn(SYNTHETIC_PROFILE_MEDIA, token));
  return key ? SYNTHETIC_PROFILE_MEDIA[key] : null;
}

export function syntheticProfileAssetForName(value) {
  return syntheticProfileMediaForName(value)?.asset ?? null;
}

export function syntheticFixturePresentationEnabled(config = globalThis.__RENDEZVUE_CONFIG__) {
  return config?.realUserAdmissionAuthorized === false;
}

export const SYNTHETIC_PROFILE_MEDIA_BOUNDARY = Object.freeze({
  fixtureOnly: true,
  liveSelfieEvidence: false,
  captureOrigin: null,
  legalIdentityVerified: false
});
