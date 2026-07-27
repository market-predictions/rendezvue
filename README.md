---
title: Rendezvue Pilot
emoji: 💞
colorFrom: pink
colorTo: purple
sdk: static
app_build_command: npm run build:static
app_file: dist/index.html
fullWidth: true
header: mini
pinned: false
license: other
---

# Rendezvue

Rendezvue is a privacy-first, student-only dating product for higher-education students in Morocco. The public profile uses a stylized animated avatar generated from a short live-selfie challenge instead of publishing the source face video.

## Repository authority

**GitHub is the sole source of truth.** The Hugging Face Space is a one-way synchronized pilot deployment target. Changes made directly in Hugging Face are unsupported and will be overwritten by the next synchronization.

## Current milestone

The repository contains an installable, mobile-first HTML5 prototype demonstrating:

- adult-only onboarding language;
- institution and institutional-email domain validation;
- a browser camera capture flow;
- in-memory selection and stylization of a source frame;
- an animated privacy-avatar preview;
- profile configuration and institution-visibility controls;
- discovery, contextual likes, matching and a local chat demonstration;
- reporting, blocking and profile pausing UX;
- PWA installation assets;
- a free Hugging Face Static Space deployment target;
- automated Space creation, synchronization and public-page verification after one-time credentials are configured.

The prototype is **not production verification**. Email delivery, age assurance, automated liveness detection, persistent accounts, moderation operations and generative avatar infrastructure remain mocked or explicitly marked as pending.

## Run locally

```bash
npm run check
npm run dev
```

Open `http://localhost:4173`.

## Build the hosted static application

```bash
npm run build:static
```

The deployable output is written to `dist/`. The Docker configuration remains in the repository for later backend-capable phases, but the browser-only pilot no longer requires paid Hugging Face compute.

## Project governance

- [Requirements](docs/REQUIREMENTS.md)
- [Roadmap](docs/ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Work packages](docs/WORKPACKAGES.md)
- [Work claims](docs/WORK-CLAIMS.md)
- [Handover](docs/HANDOVER.md)
- [Changelog](CHANGELOG.md)
- [UX principles](docs/UX-PRINCIPLES.md)
- [Hugging Face pilot guide](docs/HUGGINGFACE-PILOT.md)
- [Architecture decisions](docs/decisions/)

## Hugging Face hosted pilot

One-time GitHub Actions configuration is required:

- repository variable `HF_SPACE_ID` in `owner/space-name` format;
- repository secret `HF_TOKEN` containing a fine-grained Hugging Face write token.

The workflow creates or confirms a public **Static Space**, mirrors GitHub `main`, waits for the public page, verifies the Rendezvue deployment marker and publishes the pilot URL in the GitHub Actions summary.

The Space does not need to be created manually. See [Hugging Face pilot deployment](docs/HUGGINGFACE-PILOT.md).

## Security and privacy

Do not submit real student cards, identity documents, live-selfie recordings, production credentials or real user conversations to this public repository. Use synthetic fixtures only.

See [SECURITY.md](SECURITY.md) and [Privacy and safety](docs/PRIVACY-AND-SAFETY.md).
