# Project handover

**Updated:** 2026-07-27  
**Milestone:** Foundation plus first functional browser prototype

## Current state

The repository now contains a complete dependency-light HTML5/PWA prototype and the project-governance baseline. The prototype is designed to validate interface structure and the end-to-end product concept before selecting production providers and heavier framework infrastructure.

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
- CI and gated Hugging Face sync workflow.

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
- a configured Hugging Face Space.

## Architecture rationale

A browser-native, dependency-light prototype was selected to minimize setup and framework risk while the core value proposition remains unproven. Modules isolate domain rules, camera capture and interface state so the production client can later migrate to a component framework without changing product requirements or server contracts.

This is not a permanent rejection of React or another framework. The framework decision is deferred until the prototype establishes which interaction model and reuse strategy are actually required.

## Immediate next work

1. review and merge the foundation/prototype pull request;
2. create or identify the Hugging Face Docker Space;
3. set GitHub variable `HF_SPACE_ID` and secret `HF_TOKEN`;
4. run the first synchronized deployment;
5. conduct mobile field testing on Android Chrome, Samsung Internet and iPhone Safari;
6. create a small moderated user-test protocol focused on avatar usefulness and privacy comprehension;
7. begin WP-020, the sourced Moroccan institution registry.

## Significant decisions needed

- Hugging Face owner and Space identifier;
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
- the Docker image awaits CI validation because Docker was unavailable in the local execution environment.
