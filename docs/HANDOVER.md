# Project handover

**Updated:** 2026-07-27  
**Milestone:** Approved foundation prototype; free hosted Static Space correction in progress

## Current state

Milestone 0.1 was approved and squash-merged to `main`. The repository contains the dependency-light HTML5/PWA prototype, CI, project-governance baseline, a future Docker serving target and an automated Hugging Face deployment pipeline.

GitHub Actions configuration is working: the deployment resolved `HF_TOKEN` and `HF_SPACE_ID`, validated the source and installed the Hugging Face client. The first hosted run failed only when Hugging Face returned HTTP 402 while attempting to create a Docker Space. Hugging Face now requires a paid plan for new Docker and Gradio Spaces, while Static Spaces remain free.

The corrective branch changes the browser-only pilot to a free Static Space. This matches the actual prototype architecture and removes unnecessary server compute.

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
- deterministic static build to `dist/`;
- Docker image validation for future backend-capable phases;
- automatic Hugging Face Static Space creation and synchronization logic;
- public-page and deployment-marker verification logic;
- web-only activation and troubleshooting documentation.

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
- a successfully verified public Hugging Face URL.

## Architecture rationale

A browser-native, dependency-light prototype was selected to minimize setup and framework risk while the core value proposition remains unproven. Modules isolate domain rules, camera capture and interface state so the production client can later migrate to a component framework without changing product requirements or server contracts.

The hosted pilot is now a Static Space because every current feature executes in the browser. Docker remains in the repository for future server-backed work but is not justified for the present pilot and cannot be newly hosted on the configured free Hugging Face plan.

GitHub remains authoritative. Hugging Face is a disposable public pilot target and must never become the place where source changes are made.

## Current blocker

There is no remaining credential blocker. The authenticated configuration step succeeded.

The current blocker is source correction and hosted confirmation:

- merge the Static Space correction;
- allow the automatic `main` deployment to create/synchronize the free Space;
- verify the direct public page and camera behavior.

## Immediate next work

1. validate and merge the Static Space correction;
2. inspect the automatic deployment triggered by the merge;
3. capture the verified public URL and workflow evidence;
4. test the direct HTTPS URL on desktop and mobile camera flows;
5. update work claims and close the deployment issue;
6. conduct mobile field testing on Android Chrome, Samsung Internet and iPhone Safari;
7. create a moderated user-test protocol focused on avatar usefulness and privacy comprehension;
8. begin WP-020, the sourced Moroccan institution registry.

## Significant decisions still needed

- closed-pilot city and first institutions;
- public visibility default for institution name;
- age-assurance approach;
- long-term frontend framework after interaction validation;
- production avatar-generation approach;
- external database and object-storage provider/location;
- legal basis and retention window for live facial capture.

## Known risks

- mobile camera APIs and MediaRecorder codecs differ by browser;
- camera permission may behave differently inside the Hugging Face repository iframe than at the direct `hf.space` URL;
- the local posterization preview may not predict user acceptance of a true generated avatar;
- an institutional domain is only a probability signal;
- the app cannot admit live users safely until age, moderation and security gates are satisfied;
- a public repository increases the need for strict synthetic-data discipline;
- a Static Space cannot host future persistent application services; these must remain external;
- the public deployment remains unverified until the corrected workflow completes.
