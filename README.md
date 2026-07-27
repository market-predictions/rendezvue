---
title: Rendezvue Pilot
emoji: 💞
colorFrom: pink
colorTo: purple
sdk: docker
app_port: 7860
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
- PWA installation assets and a Docker deployment target.

The prototype is **not production verification**. Email delivery, age assurance, automated liveness detection, persistent accounts, moderation operations and generative avatar infrastructure remain mocked or explicitly marked as pending.

## Run locally

```bash
npm run check
npm run dev
```

Open `http://localhost:4173`.

## Run with Docker

```bash
docker build -t rendezvue-pilot .
docker run --rm -p 7860:7860 rendezvue-pilot
```

Open `http://localhost:7860`.

## Project governance

- [Requirements](docs/REQUIREMENTS.md)
- [Roadmap](docs/ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Work packages](docs/WORKPACKAGES.md)
- [Work claims](docs/WORK-CLAIMS.md)
- [Handover](docs/HANDOVER.md)
- [Changelog](CHANGELOG.md)
- [UX principles](docs/UX-PRINCIPLES.md)
- [Architecture decisions](docs/decisions/)

## Hugging Face synchronization

Configure these GitHub repository settings before enabling pilot deployment:

- repository variable `HF_SPACE_ID`, for example `owner/rendezvue`;
- repository secret `HF_TOKEN`, scoped to write only to that Space.

After configuration, pushes to `main` synchronize the repository to the Docker Space through `.github/workflows/deploy-huggingface.yml`.

## Security and privacy

Do not submit real student cards, identity documents, live-selfie recordings, production credentials or real user conversations to this public repository. Use synthetic fixtures only.

See [SECURITY.md](SECURITY.md) and [Privacy and safety](docs/PRIVACY-AND-SAFETY.md).
