# Rendezvue

Rendezvue is a privacy-first dating and introduction product for Muslim students and students from a Muslim background in the Netherlands. The Dutch pilot covers adults aged 18 or older enrolled in:

- MBO — middelbaar beroepsonderwijs;
- HBO — hoger beroepsonderwijs;
- WO — wetenschappelijk onderwijs.

Public profiles use stylized privacy avatars rather than publishing the source live-selfie video.

## Hosted prototype

**Public review URL:** `https://solidprivacy-rendezvue.static.hf.space/`

Dutch is the default language. English is available through the NL/EN switch at the top of the interface.

The hosted prototype is for product, interface and browser review only. It must not be used to register real students, process real identity documents or operate real dating conversations.

## Repository authority

**GitHub is the sole source of truth.** The Hugging Face Space is a one-way generated pilot deployment target. Changes made directly in Hugging Face are unsupported and will be overwritten by the next deployment.

## Current Netherlands milestone

The prototype demonstrates:

- strict 18+ onboarding independent of student status;
- MBO, HBO and WO selection;
- synthetic Dutch institution and email-domain fixtures;
- Dutch-first copy with an English language switch;
- browser camera capture with in-memory frame extraction;
- a softer illustrated avatar renderer instead of coarse pixelization;
- faith background, daily practice, compatibility preference and optional lifestyle tags;
- private-by-default visibility for faith practice;
- relationship intent, interests and profile prompts;
- Dutch synthetic MBO, HBO and WO discovery profiles;
- contextual likes, deterministic matching and local chat;
- report, block and profile-pause UX;
- PWA installation assets;
- automatic deployment to a free Hugging Face Static Space.

The prototype does **not** provide production student verification, age assurance, liveness detection, persistent accounts, moderation operations or a production generative avatar model.

## Institution-data status

The current Dutch institutions and student email domains are clearly marked pilot fixtures. They are not an authoritative production registry.

The production registry is planned around Dutch DUO/RIO institution data, with email domains verified separately because an institution's public website domain does not necessarily equal its student mailbox domain.

See [Dutch institution registry](docs/INSTITUTION-REGISTRY-NL.md).

## Faith-data status

Faith and religious practice are sensitive profile information. The prototype uses descriptive self-selected categories, never a numeric piety score, and keeps faith-practice visibility off by default.

Production use requires a documented legal basis, explicit and separable user choice, data minimisation and withdrawal controls.

See [Faith profile model](docs/FAITH-PROFILE-MODEL.md) and [Privacy and safety](docs/PRIVACY-AND-SAFETY.md).

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

GitHub Actions validates and uploads `.hf-deploy/` directly. Hugging Face does not build the application.

## Project governance

- [Requirements](docs/REQUIREMENTS.md)
- [Roadmap](docs/ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Work packages](docs/WORKPACKAGES.md)
- [Work claims](docs/WORK-CLAIMS.md)
- [Handover](docs/HANDOVER.md)
- [Changelog](CHANGELOG.md)
- [UX principles](docs/UX-PRINCIPLES.md)
- [Dutch institution registry](docs/INSTITUTION-REGISTRY-NL.md)
- [Faith profile model](docs/FAITH-PROFILE-MODEL.md)
- [Hugging Face pilot guide](docs/HUGGINGFACE-PILOT.md)
- [Architecture decisions](docs/decisions/)

## Security and privacy

Do not submit real student cards, identity documents, live-selfie recordings, production credentials or real user conversations to this public repository. Use synthetic fixtures only.

See [SECURITY.md](SECURITY.md) and [Privacy and safety](docs/PRIVACY-AND-SAFETY.md).
