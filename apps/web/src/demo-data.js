function avatarSvg({ skin, hair, shirt, background, accent, glasses = false, hijab = false, beard = false }) {
  const eyewear = glasses ? '<g fill="none" stroke="#2f2932" stroke-width="5"><rect x="80" y="107" width="49" height="32" rx="13"/><rect x="151" y="107" width="49" height="32" rx="13"/><path d="M129 120h22"/></g>' : '';
  const beardShape = beard ? '<path d="M96 150c9 39 77 40 88 0-7 50-79 58-88 0Z" fill="#33241f" opacity=".9"/>' : '';
  const headCovering = hijab
    ? `<path d="M67 116c0-58 32-91 74-91 45 0 79 37 79 92v89H59v-84c0-2 2-4 8-6Z" fill="${hair}"/><path d="M84 91c7-33 27-50 58-50 31 0 52 20 60 53-17-16-38-24-62-24-22 0-41 7-56 21Z" fill="${accent}" opacity=".75"/>`
    : `<path d="M67 111c0-55 32-86 73-86 45 0 77 31 81 85-25-18-50-28-77-28-27 0-52 10-77 29Z" fill="${hair}"/>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 340"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${background}"/><stop offset="1" stop-color="${accent}"/></linearGradient><filter id="soft"><feGaussianBlur stdDeviation=".35"/></filter></defs><rect width="280" height="340" rx="40" fill="url(#bg)"/><circle cx="230" cy="55" r="42" fill="#fff" opacity=".18"/><circle cx="45" cy="280" r="62" fill="#fff" opacity=".14"/><path d="M42 340c7-80 47-116 99-116 55 0 96 35 101 116Z" fill="${shirt}"/>${headCovering}<ellipse cx="141" cy="133" rx="68" ry="78" fill="${skin}" filter="url(#soft)"/><path d="M99 105c12-10 28-11 39-2" fill="none" stroke="#503b35" stroke-width="5" stroke-linecap="round"/><path d="M151 103c13-9 29-7 39 3" fill="none" stroke="#503b35" stroke-width="5" stroke-linecap="round"/><ellipse cx="118" cy="123" rx="6" ry="7" fill="#2d2525"/><ellipse cx="169" cy="123" rx="6" ry="7" fill="#2d2525"/><path d="M141 128c-4 13-6 22 2 28" fill="none" stroke="#9e655e" stroke-width="4" stroke-linecap="round"/><path d="M116 171c16 17 38 18 55 1" fill="none" stroke="#9e3e5a" stroke-width="6" stroke-linecap="round"/>${beardShape}${eyewear}<circle cx="108" cy="150" r="9" fill="#e98788" opacity=".25"/><circle cx="177" cy="150" r="9" fill="#e98788" opacity=".25"/><rect x="8" y="8" width="264" height="324" rx="34" fill="none" stroke="#fff" stroke-width="5" opacity=".48"/></svg>`)}`;
}

export const DEMO_PROFILES = Object.freeze([
  {
    id: 'samira', name: 'Samira', gender: 'woman', age: 22, city: 'Rotterdam', lifeStage: 'student', educationLevel: 'hbo', institution: 'Hogeschool Rotterdam', studentVerified: true,
    maritalHistory: 'neverMarried', childStatus: 'none', childWish: 'yes', intent: 'marriage', faithPractice: 'moderate', faithTags: ['family', 'noAlcohol', 'halal'],
    prompt: { nl: 'De snelste manier om mij te laten lachen is… vertel je meest chaotische introductieweek-verhaal.', en: 'The fastest way to make me laugh is… tell me your most chaotic orientation-week story.' },
    openingMessage: { nl: 'Je reactie op mijn introductieverhaal maakte me nieuwsgierig 😄', en: 'Your comment on my orientation story made me curious 😄' },
    interests: ['cinema', 'coffee', 'languages'], avatar: avatarSvg({ skin: '#c98568', hair: '#4b2738', shirt: '#5c2d58', background: '#f4c4c9', accent: '#6a817b', hijab: true })
  },
  {
    id: 'youssef', name: 'Youssef', gender: 'man', age: 26, city: 'Utrecht', lifeStage: 'employed', occupation: 'Data-analist', studentVerified: false,
    maritalHistory: 'neverMarried', childStatus: 'none', childWish: 'yes', intent: 'serious', faithPractice: 'practicing', faithTags: ['prayer', 'noAlcohol', 'community'],
    prompt: { nl: 'Wij passen waarschijnlijk goed als… je houdt van lange gesprekken en spontane foodstops.', en: 'We will probably get along if… you enjoy long conversations and spontaneous food stops.' },
    openingMessage: { nl: 'Lange gesprekken en foodstops: goede combinatie. Wat is jouw vaste plek?', en: 'Long conversations and food stops: good combination. What is your go-to place?' },
    interests: ['football', 'food', 'technology'], avatar: avatarSvg({ skin: '#a9644d', hair: '#282021', shirt: '#203c58', background: '#d6c0ab', accent: '#6d8981', beard: true })
  },
  {
    id: 'lina', name: 'Lina', gender: 'woman', age: 24, city: 'Amsterdam', lifeStage: 'recentGraduate', educationLevel: 'mbo', studentVerified: false,
    maritalHistory: 'divorced', childStatus: 'none', childWish: 'maybe', intent: 'getToKnow', faithPractice: 'cultural', faithTags: ['family', 'ramadan', 'noSmoking'],
    prompt: { nl: 'Mijn ideale vrije middag… een boekwinkel, chai en nergens dringend naartoe hoeven.', en: 'My ideal free afternoon… a bookshop, chai and nowhere urgent to be.' },
    openingMessage: { nl: 'Een boekwinkel en chai klinkt goed. Welk boek raad je nu aan?', en: 'A bookshop and chai sounds good. Which book do you recommend right now?' },
    interests: ['books', 'art', 'travel'], avatar: avatarSvg({ skin: '#d79a78', hair: '#342026', shirt: '#853f50', background: '#f1d4b7', accent: '#718c85', glasses: true })
  },
  {
    id: 'omar', name: 'Omar', gender: 'man', age: 30, city: 'Den Haag', lifeStage: 'selfEmployed', occupation: 'Ondernemer', studentVerified: false,
    maritalHistory: 'divorced', childStatus: 'hasChildren', childCountBand: 'one', childWish: 'openToMore', intent: 'marriage', faithPractice: 'practicing', faithTags: ['family', 'halal', 'noSmoking'],
    prompt: { nl: 'Een gezonde relatie betekent voor mij… eerlijk plannen, ruimte voor familie en ook kunnen lachen.', en: 'A healthy relationship means… honest planning, room for family and being able to laugh.' },
    openingMessage: { nl: 'Je antwoord over familie sprak me aan. Wat betekent balans voor jou?', en: 'Your answer about family resonated. What does balance mean to you?' },
    interests: ['fitness', 'travel', 'food'], avatar: avatarSvg({ skin: '#9f654f', hair: '#2d2326', shirt: '#31514b', background: '#d8c5ae', accent: '#7c5874', beard: true })
  },
  {
    id: 'meryem', name: 'Meryem', gender: 'woman', age: 28, city: 'Eindhoven', lifeStage: 'employed', occupation: 'Verpleegkundige', studentVerified: false,
    maritalHistory: 'widowed', childStatus: 'hasChildren', childCountBand: 'one', childWish: 'unsure', intent: 'serious', faithPractice: 'activelyPracticing', faithTags: ['prayer', 'family', 'community'],
    prompt: { nl: 'Ik waardeer iemand die… zacht communiceert, afspraken nakomt en niet bang is voor diepgang.', en: 'I value someone who… communicates gently, keeps promises and is not afraid of depth.' },
    openingMessage: { nl: 'Zacht communiceren is ook voor mij belangrijk. Hoe merk jij dat in de praktijk?', en: 'Gentle communication matters to me too. What does that look like in practice?' },
    interests: ['volunteering', 'nature', 'coffee'], avatar: avatarSvg({ skin: '#b8755f', hair: '#51405a', shirt: '#764a68', background: '#efd0c4', accent: '#69887f', hijab: true })
  }
]);
