const COPY = Object.freeze({
  nl: Object.freeze({
    unfiltered: Object.freeze({
      title: 'Zonder filter',
      description: 'Geen vervaging. Je gekadreerde profielkaart en avatar blijven herkenbaar; de originele upload blijft privé.'
    }),
    softFocus: Object.freeze({
      title: 'Natural',
      description: 'Lichte privacyfilter met een natuurlijke uitstraling; je blijft duidelijk herkenbaar.'
    }),
    warmVeil: Object.freeze({
      title: 'Zacht privé',
      description: 'Meer afscherming dan Natural, met behoud van een bruikbaar en herkenbaar profielbeeld.'
    }),
    morePrivate: Object.freeze({
      title: 'Meer privé',
      description: 'Sterkere afscherming, maar bewust nog herkenbaar en minder vaag dan de voormalige zwaarste opties.'
    })
  }),
  en: Object.freeze({
    unfiltered: Object.freeze({
      title: 'Unfiltered',
      description: 'No obscuring filter. Your framed profile card and avatar stay recognisable; the original upload stays private.'
    }),
    softFocus: Object.freeze({
      title: 'Natural',
      description: 'A light privacy treatment with a natural look while remaining clearly recognisable.'
    }),
    warmVeil: Object.freeze({
      title: 'Soft private',
      description: 'More privacy than Natural while keeping the profile image usable and recognisable.'
    }),
    morePrivate: Object.freeze({
      title: 'More private',
      description: 'Stronger privacy while deliberately staying recognisable and less vague than the former heaviest options.'
    })
  })
});

export const PRIVACY_PORTRAIT_LADDER_UI = Object.freeze({
  version: 3,
  activeIds: Object.freeze(['unfiltered', 'softFocus', 'warmVeil', 'morePrivate']),
  recommendedId: 'softFocus',
  defaultSelection: null
});

function language() {
  return document.documentElement.lang === 'en' ? 'en' : 'nl';
}

function applyCopy() {
  const copy = COPY[language()];
  for (const [id, value] of Object.entries(copy)) {
    const button = document.querySelector(`.rv-privacy-filter-option[data-filter-id="${id}"]`);
    if (!button) continue;
    const title = button.querySelector('strong');
    const description = [...button.querySelectorAll('span')]
      .find((element) => element.dataset.privacyCopy === `${id}Description`);
    if (title) title.textContent = value.title;
    if (description) description.textContent = value.description;
  }
}

applyCopy();
globalThis.addEventListener('rendezvue:language-change', () => queueMicrotask(applyCopy));
