# Architecture

## 1. Pilot topology

```text
GitHub branch / pull request
        |
        v
CI: tests + browser build + deployment artifact + Docker build
        |
        v
GitHub main (authoritative)
        |
        v
GitHub Actions uploads .hf-deploy/
        |
        v
Hugging Face Static Space (web-facing, disposable, free)
```

The browser prototype is built and validated in GitHub Actions. Hugging Face serves prebuilt files and performs no application build or server execution.

Docker/Nginx remain CI-validated for later backend-capable or alternative hosting, but are not the free pilot path.

## 2. Current modules

```text
apps/web/
  index.html             Dutch-default application shell
  styles.css             responsive visual system
  app.js                 screen composition and event orchestration
  src/domain.js          MBO/HBO/WO and profile rules
  src/i18n.js            Dutch and English copy
  src/camera.js          camera capture and frame extraction
  src/avatar.js          local illustrated non-production renderer
  src/demo-data.js       Dutch synthetic profiles and messages
  manifest.webmanifest   Dutch-default PWA metadata
  service-worker.js      application-shell cache

scripts/
  build-static.mjs       apps/web -> dist
  build-hf-deploy.mjs    dist + Space metadata -> .hf-deploy
  validate-static.mjs    source and artifact contract checks
  huggingface_space.py   Space creation and hosted verification
```

## 3. Prototype state model

The current prototype uses browser memory plus a persisted language preference. It does not create persistent identities.

- source capture and canvas data are browser-local;
- Blob URLs are revoked when the flow ends or the page closes;
- matches and messages are synthetic session state;
- no student, faith or camera data is uploaded;
- faith-practice visibility starts disabled;
- language switching preserves current form state where implemented.

## 4. Dutch institution boundary

The typed institution fixture contains MBO, HBO and WO records. Production data must be separated into:

1. authoritative institution identity from DUO/RIO;
2. independently verified student mailbox domains;
3. aliases, campuses and exceptions;
4. dated verification evidence.

Public web domains must not automatically become accepted student domains.

## 5. Faith-data boundary

Faith background, practice, compatibility preference and lifestyle tags are separate fields. They must never be reduced to a single score.

Production architecture must provide:

- separable user choice and legal-basis evidence;
- field-level visibility controls;
- deletion and withdrawal;
- purpose limitation to profile and matching;
- no advertising segmentation;
- no inferred religion;
- access and audit controls for sensitive data;
- moderation safeguards against sectarian or anti-Muslim harassment.

The current prototype stores these fields only in local memory.

## 6. Production target

```text
PWA / later native shell
        |
        v
Backend-for-frontend / API gateway
  |        |         |          |            |
 auth   profile   discovery   messaging   moderation
  |        |         |          |            |
PostgreSQL       durable queues       audit/evidence store
        |
Object storage for avatars and temporary source media
        |
Email, SMS, age assurance, liveness and avatar services
```

### Invariants

- persistent state never depends on Hugging Face;
- source capture and public avatar are separate data classes;
- verification labels derive from evidence, not editable profile fields;
- age assurance remains independent of student verification;
- block and moderation enforcement is server-authoritative;
- faith data is never used for ads or inferred classification;
- deployed files are generated from accepted GitHub source;
- native shells remain thin clients.

## 7. Deferred framework decision

A component framework is likely appropriate for production, but the interaction model should be validated first. Selection criteria include:

- accessibility and localization tooling;
- state-machine support;
- camera/WebRTC integration;
- code sharing with native shells;
- bundle size on mid-range Android;
- test ecosystem;
- maintainability;
- static frontend and cloud-backend compatibility.

## 8. Security boundary

The browser is untrusted. Production authentication, age assurance, student verification, authorization, matching, moderation, rate limiting, retention and audit evidence must be server-side.

The prototype deliberately makes no production-security or legal-readiness claim.
