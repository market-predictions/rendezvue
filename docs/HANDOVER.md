# Project handover

**Updated:** 2026-07-28  
**Milestone:** Privacy ink-sketch avatar v2 in implementation; hosted review pending

## Current state

The Netherlands-first browser prototype is publicly hosted at:

`https://solidprivacy-rendezvue.static.hf.space/`

The current public build remains the Netherlands/MBO-HBO-WO milestone. Work on `agent/privacy-ink-avatar-v2` replaces the too-realistic avatar treatment with a stronger privacy abstraction.

## Avatar v2 objective

The public avatar should communicate broad appearance without behaving like a lightly filtered selfie.

Preserve:

- broad face and jaw silhouette;
- hairstyle or head-covering silhouette;
- glasses and facial-hair cues where visible;
- approximate expression and orientation.

Discard or abstract:

- photographic colour;
- skin texture and blemishes;
- fine wrinkles and pores;
- continuous photographic shading;
- high-frequency identifying detail;
- background detail.

## Implemented on the milestone branch

- monochrome ink-sketch conversion instead of a softened-photo overlay;
- adaptive local-contrast extraction;
- Sobel contour detection;
- flat shadow masses rather than realistic tonal shading;
- off-white paper treatment and restrained portrait frame;
- matching synthetic line-art fallback avatar;
- static validation that rejects the previous near-photo overlay markers;
- updated changelog and work-claims boundaries.

## Important limitations

- this is still a browser-side deterministic filter, not a trained generative illustration model;
- the result may retain enough distinctive silhouette information for acquaintances to recognise the person;
- privacy distance, attractiveness and resemblance have not yet been measured with users;
- output quality may vary with lighting, skin tone, hijab/headwear, glasses, facial hair and camera quality;
- no claim of anonymity is made;
- source capture remains browser-local in the prototype;
- the product must not admit real users.

## Current gate

1. pass application, deployment-artifact, JavaScript, Python and Docker checks;
2. merge the focused pull request;
3. deploy and marker-verify the new Hugging Face build;
4. owner reviews at least one real camera-generated sketch;
5. compare privacy distance and visual usefulness against the previous avatar.

## Review questions

1. Is the output clearly an avatar rather than a filtered photograph?
2. Is enough visual information retained for attraction and first-impression decisions?
3. Does the line work feel stylish and mature rather than childish or clinical?
4. Is the person still too directly identifiable?
5. Does the effect work for different hair, hijab/headwear, glasses and facial-hair patterns?
6. Should the next version offer two controlled abstraction strengths?

## Immediate next work after avatar review

- calibrate contour thresholds from representative test captures;
- consider a stronger and a softer controlled sketch variant;
- run moderated privacy/resemblance testing;
- evaluate a production identity-preserving generative avatar service only after the desired abstraction level is validated;
- continue WP-020 institution registry, WP-025 faith validation and production age-assurance selection.

## Architecture

GitHub remains authoritative. CI builds and validates the application, creates `.hf-deploy/`, uploads the finished artifact and verifies the public marker. Hugging Face serves generated static files only.

Production services must remain external and server-authoritative for authentication, age assurance, matching, messaging, moderation, retention and sensitive-data controls.
