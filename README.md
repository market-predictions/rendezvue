# Rendezvue

Rendezvue is a Dutch-first, privacy-first platform concept for serious introductions between adult single Muslims and people from a Muslim background in the Netherlands.

Membership is **student-first, not student-only**. Students can eventually verify their status for a badge, Campus Mode, events and reduced contact pricing, while recent graduates, professionals, entrepreneurs and other eligible adults can participate in the same marketplace.

## Hosted concept pilot

**Public review URL:** `https://solidprivacy-rendezvue.static.hf.space/`

The currently published URL remains the last accepted `main` build. The product-baseline v1 implementation is developed through GitHub and reaches Hugging Face only after accepted merge and deployment verification.

The concept pilot demonstrates:

- progressive Dutch/English onboarding;
- adult, single and serious-intent eligibility;
- open membership with optional student verification;
- life stage, marital history, children and child preferences;
- live camera capture with browser-local fuzzy privacy portraits;
- profile preview and visibility controls;
- pass, direct like, contextual like and swipe gestures;
- reciprocal pilot match and simulated contact entitlement;
- local text chat, block, report and end-contact feedback;
- no public ratings or automatic feedback-based visibility penalty.

It does **not** provide production authentication, age assurance, marital-status verification, liveness classification, persistent multi-user data, real payments, moderation operations or legal readiness for real religious-profile data.

## Repository authority

**GitHub is the sole source of truth.** Hugging Face is a one-way generated Static Space deployment target. Direct Space edits are unsupported and overwritten.

## Architecture direction

```text
GitHub source and governance
        |
        v
Generated Hugging Face PWA
        |
        v (next production proof)
External authentication + PostgreSQL + realtime chat + private storage
```

Persistent state must never depend on Hugging Face. Real-user admission requires an external server-authoritative backend, row-level authorization, moderation and formal privacy/legal gates.

## Local validation

```bash
npm run check
npm run dev
```

Open `http://localhost:4173`.

## Governance and design

- [Requirements](docs/REQUIREMENTS.md)
- [Roadmap](docs/ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data model](docs/DATA-MODEL.md)
- [Onboarding](docs/ONBOARDING.md)
- [Interaction and trust](docs/INTERACTION-AND-TRUST-MODEL.md)
- [Privacy and safety](docs/PRIVACY-AND-SAFETY.md)
- [Pilot protocol](docs/PILOT-PROTOCOL.md)
- [UX principles](docs/UX-PRINCIPLES.md)
- [Work packages](docs/WORKPACKAGES.md)
- [Work claims](docs/WORK-CLAIMS.md)
- [Handover](docs/HANDOVER.md)
- [Changelog](CHANGELOG.md)

## Security boundary

Do not commit or enter real student documents, identity evidence, production credentials, source selfies, religious profiles or real conversations in this public prototype. Use synthetic data only.
