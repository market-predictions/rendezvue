# Project handover

**Updated:** 2026-07-27  
**Milestone:** Approved foundation prototype; hosted Hugging Face deployment prepared

## Current state

Milestone 0.1 was approved and squash-merged to `main`. The repository contains the dependency-light HTML5/PWA prototype, Docker serving target, CI, project-governance baseline and an automated Hugging Face deployment pipeline.

The deployment pipeline can create a public Docker Space, synchronize GitHub `main`, wait for the Space to build, verify `/healthz` and publish the working URL. It has not yet executed because the external Hugging Face credential and target namespace are not available in GitHub Actions settings.

## What works

- responsive mobile interface;
- onboarding progress and explicit prototype status;
- institution selection and local email-domain validation;
- camera permission and four-second in-memory video capture;
- best-frame extraction to canvas;
- local stylized avatar preview;
- avatar acceptance and profile creation;
- institution visibility control;
- single-card discovery;
- pass and contextual-like actions;
- deterministic match demonstration;
- local text chat;
- report, block, unmatch and pause-profile UX;
- PWA manifest, service worker and icon;
- Docker serving target on port 7860;
- CI including Docker image validation;
- automatic Hugging Face Space creation and synchronization logic;
- runtime and health verification logic;
- web-only activation documentation.

## What is intentionally mocked or absent

- email and SMS delivery;
- age assurance beyond prototype declaration;
- automated blink and head-turn detection;
- replay-resistant liveness;
- production avatar AI;
- persistent accounts and databases;
- real multi-user matching and chat;
- moderator back office;
- web push;
- French and Arabic translations;
- a successfully executed public Hugging Face deployment.

## Architecture rationale

A browser-native, dependency-light prototype was selected to minimize setup and framework risk while the core value proposition remains unproven. Modules isolate domain rules, camera capture and interface state so the production client can later migrate to a component framework without changing product requirements or server contracts.

GitHub remains authoritative. Hugging Face is a disposable public pilot target and must never become the place where source changes are made.

## Current blocker

The deployment workflow requires two values that only the repository owner can configure through authenticated web interfaces:

- GitHub Actions secret `HF_TOKEN`, containing a Hugging Face write token;
- GitHub Actions variable `HF_SPACE_ID`, containing `owner/space-name`.

The token must not be shared in chat, issues or source files.

## Immediate next work

1. configure `HF_TOKEN` and `HF_SPACE_ID` in GitHub Actions settings;
2. run `Deploy pilot to Hugging Face` manually once;
3. capture the verified public URL and workflow evidence;
4. update work claims and close the deployment issue;
5. conduct mobile field testing on Android Chrome, Samsung Internet and iPhone Safari;
6. create a moderated user-test protocol focused on avatar usefulness and privacy comprehension;
7. begin WP-020, the sourced Moroccan institution registry.

## Significant decisions still needed

- Hugging Face owner/organization namespace;
- closed-pilot city and first institutions;
- public visibility default for institution name;
- age-assurance approach;
- long-term frontend framework after interaction validation;
- production avatar-generation approach;
- external database and object-storage provider/location;
- legal basis and retention window for live facial capture.

## Known risks

- mobile camera APIs and MediaRecorder codecs differ by browser;
- the local posterization preview may not predict user acceptance of a true generated avatar;
- an institutional domain is only a probability signal;
- the app cannot admit live users safely until age, moderation and security gates are satisfied;
- a public repository increases the need for strict synthetic-data discipline;
- Hugging Face runtime storage is not suitable for persistent personal data;
- the first hosted deployment remains unverified until external credentials are configured.
