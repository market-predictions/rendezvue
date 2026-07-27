# Project handover

**Updated:** 2026-07-27  
**Milestone:** Approved interaction prototype; prebuilt hosted deployment under validation

## Current state

Milestone 0.1 is approved and merged. The repository contains the browser-native HTML5/PWA prototype, CI, governance baseline, retained Docker target and a free Hugging Face Static Space deployment pipeline.

Authenticated Hugging Face configuration is proven. Docker creation failed with HTTP 402 because the account is free. Static Space creation and source synchronization then succeeded, but the ordinary public URL remained HTTP 404 for 20 minutes. URL discovery was corrected to prefer `.static.hf.space`, but no successful hosted result was recorded.

The current corrective strategy removes Hugging Face-side building entirely. GitHub builds and validates `.hf-deploy/`, then uploads those finished files directly to the Space root.

## What works

- responsive mobile interface;
- onboarding and prototype-status copy;
- institution selection and local email-domain validation;
- camera permission and four-second in-memory capture;
- best-frame extraction and local stylization;
- profile/privacy setup;
- discovery, contextual likes and deterministic matching;
- local chat and safety controls;
- PWA manifest, service worker and icon;
- deterministic builds to `dist/` and `.hf-deploy/`;
- CI validation of application, deployment artifact, URL resolver and Docker fallback;
- authenticated Static Space creation;
- deployment result reporting to issue #2.

## What is intentionally mocked or absent

- email and SMS delivery;
- production age assurance;
- automated/replay-resistant liveness;
- production avatar AI;
- persistent accounts, matching and messaging;
- moderator back office;
- web push;
- French and Arabic translations;
- a verified public pilot URL at the time of this handover.

## Architecture rationale

The prototype is browser-only, so a free Static Space is the correct pilot host. GitHub remains authoritative and performs the build. Hugging Face serves the generated artifact only. This reduces cost, removes remote-build uncertainty and preserves a clean migration path to external backend services.

Docker remains CI-validated for later backend-capable or alternative-hosting phases.

## Current blocker

No credential blocker remains. The remaining gate is empirical hosted confirmation:

1. merge the prebuilt-artifact deployment;
2. let the automatic `main` deployment upload `.hf-deploy/`;
3. verify the direct Static Space page and deployment marker;
4. test camera behavior on the direct HTTPS URL.

## Immediate next work

1. validate and merge the prebuilt deployment correction;
2. inspect the automatic result written to issue #2;
3. record the verified public URL and workflow evidence;
4. test desktop and mobile camera flows;
5. complete WP-015 documentation and close issue #2 when field checks pass;
6. begin WP-020, the sourced Moroccan institution registry;
7. create the moderated avatar/privacy user-test protocol.

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
- a Static Space cannot host persistent backend services;
- direct artifact upload must be verified against the actual Hugging Face serving behavior.
