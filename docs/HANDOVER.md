# Project handover

**Updated:** 2026-07-27  
**Milestone:** Hosted interaction prototype live; mobile field review pending

## Current state

Milestone 0.1 is approved and merged. The browser-native HTML5/PWA prototype is publicly available at:

`https://solidprivacy-rendezvue.static.hf.space/`

GitHub Actions built and validated the complete `.hf-deploy/` artifact, uploaded it directly to the free Hugging Face Static Space and verified the embedded Rendezvue marker.

Deployment evidence:

- source commit: `edec6c59bdc2b46acf6652d1c03671006e86f250`;
- workflow run: `30305071548`;
- deployment issue: #2.

## What works

- public HTTPS-hosted mobile interface;
- onboarding and prototype-status copy;
- institution selection and local email-domain validation;
- browser camera permission and four-second in-memory capture in the implementation;
- best-frame extraction and local stylization;
- profile/privacy setup;
- discovery, contextual likes and deterministic matching;
- local chat and safety controls;
- PWA manifest, service worker and icon;
- deterministic builds to `dist/` and `.hf-deploy/`;
- CI validation of application, deployment artifact, URL resolver and Docker fallback;
- authenticated Static Space creation and direct artifact upload;
- public-page marker verification;
- deployment result reporting to issue #2.

## What is intentionally mocked or absent

- real email and SMS delivery;
- production age assurance;
- automated/replay-resistant liveness;
- production avatar AI;
- persistent accounts, matching and messaging;
- moderator back office;
- web push;
- French and Arabic translations;
- approval for real-user admission.

## Architecture rationale

The prototype is browser-only, so a free Static Space is the correct pilot host. GitHub remains authoritative, performs the build and uploads the generated artifact. Hugging Face serves the files only. Docker remains CI-validated for later backend-capable or alternative-hosting phases.

## Current review gate

The hosted deployment itself is complete. WP-015 remains in review until the direct URL is tested on representative browsers, especially:

1. desktop browser basic flow;
2. Android Chrome camera permission and recording;
3. Samsung Internet where available;
4. iPhone Safari camera permission and recording;
5. PWA installation behavior where supported.

## Immediate next work

1. conduct the direct-URL field test;
2. log browser-specific defects;
3. close WP-015 and issue #2 after camera/PWA evidence is recorded;
4. begin WP-020, the sourced Moroccan institution registry;
5. create the moderated avatar/privacy user-test protocol.

## Significant decisions still needed

- closed-pilot city and first institutions;
- public visibility default for institution name;
- age-assurance approach;
- long-term frontend framework;
- production avatar-generation approach;
- external database and object-storage provider/location;
- legal basis and retention window for live facial capture.

## Known risks

- mobile camera APIs and MediaRecorder codecs differ by browser;
- embedded and direct Hugging Face pages can have different camera policies;
- the local posterization preview may not predict acceptance of a production avatar;
- an institutional domain is only a probability signal;
- the app cannot admit live users before safety, legal and security gates;
- a Static Space cannot host persistent backend services.
