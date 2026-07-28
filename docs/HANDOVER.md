# Project handover

**Updated:** 2026-07-28  
**Milestone:** Selectable browser privacy-filter grid in implementation; hosted review pending

## Current state

The Netherlands-first browser prototype is publicly hosted at:

`https://solidprivacy-rendezvue.static.hf.space/`

The current public build still uses the single ink-sketch treatment. Work on `agent/privacy-filter-grid-v1` replaces that failed treatment with four selectable privacy portraits generated from the same live-capture frame.

## Product decision

The pilot no longer tries to force one browser-generated avatar style on every registrant. After capture, the user sees a 2×2 grid and chooses among:

1. **Soft focus** — more recognisable;
2. **Warm veil** — more private;
3. **Monochrome mist** — more private;
4. **Extra private** — strongest blur and lowest detail.

There is no raw-selfie or lightly edited option. Every recipe enforces a minimum blur/privacy floor.

## Implemented on the milestone branch

- four fixed portrait recipes in `AVATAR_FILTERS`;
- consistent centered crop based on the capture guide;
- blurred base and a moderately blurred central portrait window;
- warm, monochrome and high-privacy tonal treatments;
- browser-local generation of all previews;
- 2×2 selection grid with radio semantics and visible selected state;
- Dutch and English filter names and privacy descriptions;
- downsampling blur fallback for browsers without dependable Canvas filter support;
- deployment metadata `browser-local-filter-grid`;
- CI guards preventing the rejected ink-sketch renderer from returning;
- ADR-0006, work claims and governance updates.

## Important limitations

- browser filters do not provide anonymity;
- acquaintances may recognise broad face shape, hair, hijab/headwear, glasses or facial hair;
- background removal is not yet semantic; the current pilot uses crop, blur and tonal neutralisation;
- output may vary by browser, lighting and camera quality;
- the four recipes have not yet been tested for attractiveness, privacy distance or fairness;
- source capture and previews remain browser-local in the prototype;
- the long-term target remains a controlled server-side generative privacy portrait;
- the product must not admit real users.

## Validation status

PR CI has passed:

- static build and generated Hugging Face artifact checks;
- presence of all four recipes and selection controls;
- Dutch/English generated copy checks;
- deployment metadata checks;
- JavaScript domain/i18n tests;
- Python deployment tests;
- retained Docker build.

## Current gate

1. update remaining roadmap/changelog records;
2. merge the focused pull request;
3. deploy and marker-verify the Hugging Face build;
4. owner completes one real-camera review of the 2×2 grid;
5. record which variants are useful, too revealing or too abstract.

## Review questions

1. Is it immediately clear that the four cards are alternatives from the same selfie?
2. Is the 2×2 grid large enough on a phone to judge the result?
3. Does at least one option give a useful balance between attraction and privacy?
4. Is **Soft focus** still too revealing?
5. Is **Extra private** still useful enough for dating discovery?
6. Do warm and monochrome treatments feel intentional rather than like technical effects?
7. Does selection remain clear after switching between Dutch and English?

## Immediate next work after owner review

- tune or remove weak variants based on actual captures;
- consider optional full-screen preview before confirmation;
- evaluate browser-side person/background segmentation for cleaner neutralisation;
- prepare the server-side generative privacy-portrait proof of concept;
- continue WP-020 institution registry, WP-025 faith validation and production age-assurance selection.

## Architecture

GitHub remains authoritative. CI copies the browser source into `dist/`, applies the governed privacy-filter-grid transform, validates the finished artifact, creates `.hf-deploy/`, uploads it and verifies the public marker. Hugging Face serves generated static files only.

Production services must remain external and server-authoritative for authentication, age assurance, matching, messaging, moderation, retention and sensitive-data controls.
