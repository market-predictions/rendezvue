# Architecture

## 1. Pilot topology

```text
GitHub branch / pull request
        |
        v
CI validation and Docker build
        |
        v
GitHub main (authoritative)
        |
        v
Hugging Face hub-sync
        |
        v
Hugging Face Docker Space (web-facing, disposable)
```

The current repository is a static browser prototype served by Nginx. Production services will be introduced behind explicit interfaces rather than storing data in the Space filesystem.

## 2. Current modules

```text
apps/web/
  index.html             application shell
  styles.css             design system and responsive layout
  app.js                 screen composition and event orchestration
  src/domain.js          institution and profile rules
  src/camera.js          camera capture and frame extraction
  src/avatar.js          local non-production stylization
  src/demo-data.js       synthetic profiles and messages
  manifest.webmanifest   PWA metadata
  service-worker.js      application-shell cache
```

## 3. Production target boundaries

```text
PWA / later native shell
        |
        v
API gateway / backend-for-frontend
  |       |        |         |          |
 auth  profile  discovery  messaging  moderation
  |       |        |         |          |
PostgreSQL      event/queue layer      audit store
        |
Object storage for avatars and temporary source media
        |
External email, SMS, age assurance and avatar services
```

### Invariants

- persistent data never depends on Hugging Face local disk;
- source capture and public avatar are separate data classes;
- background jobs are durable server jobs;
- clients receive only the minimum data needed for the current screen;
- verification labels are derived from evidence records, not editable profile fields;
- block and moderation enforcement is server authoritative;
- native shells remain thin clients.

## 4. Prototype state model

The prototype uses browser memory plus limited non-sensitive session state. It does not create persistent identities. Captured video Blob URLs and source canvas data are revoked or discarded when the flow ends or the page reloads.

## 5. Deferred framework decision

A component framework is likely appropriate for production, but choosing it now would optimize an implementation before the interaction model has been validated. The current modules are kept small and pure where possible so they can be ported to React, Preact, Vue, Svelte or a WebView shell.

Framework selection criteria for Phase 2:

- accessibility tooling;
- RTL and localization maturity;
- state-machine support;
- camera/WebRTC integration;
- code sharing with a native shell strategy;
- bundle size on mid-range Android;
- team familiarity and maintainability;
- test ecosystem;
- Hugging Face and later cloud deployment simplicity.

## 6. Security boundary

The browser is untrusted. Production verification, matching, messaging authorization, rate limiting, abuse enforcement and retention evidence must be server-side. The prototype deliberately contains no production security claims.
