# Rendezvue

Rendezvue is a privacy-first, student-only dating product for higher-education students in Morocco. The public profile uses a stylized animated avatar generated from a short live-selfie challenge instead of publishing the source face video.

## Hosted prototype

**Public review URL:** `https://solidprivacy-rendezvue.static.hf.space/`

The hosted prototype is for interface and technical review only. It must not be used to register real students or process real identity documents.

## Repository authority

**GitHub is the sole source of truth.** The Hugging Face Space is a one-way generated pilot deployment target. Changes made directly in Hugging Face are unsupported and will be overwritten by the next deployment.

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
- a free Hugging Face Static Space deployment;
- a GitHub-built, prevalidated deployment artifact uploaded directly to the Space.

The prototype is **not production verification**. Email delivery, age assurance, automated liveness detection, persistent accounts, moderation operations and generative avatar infrastructure remain mocked or explicitly marked as pending.

## Run locally

```bash
npm run check
npm run dev
```

Open `http://localhost:4173`.

## Build the hosted static application

```bash
npm run build:hf
```

This produces:

- `dist/`: the generic browser build;
- `.hf-deploy/`: the complete prebuilt Hugging Face Static Space artifact.

Hugging Face does not need to run Node or build the prototype. GitHub Actions uploads `.hf-deploy/` directly. The Docker configuration remains available for later backend-capable phases.

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

## Deployment evidence

The initial verified hosted deployment used:

- commit `edec6c59bdc2b46acf6652d1c03671006e86f250`;
- workflow run `30305071548`;
- deployment issue #2.

Future accepted changes to `main` redeploy automatically.

## Security and privacy

Do not submit real student cards, identity documents, live-selfie recordings, production credentials or real user conversations to this public repository. Use synthetic fixtures only.

See [SECURITY.md](SECURITY.md) and [Privacy and safety](docs/PRIVACY-AND-SAFETY.md).
