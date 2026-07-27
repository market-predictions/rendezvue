# ADR-0003 — Use a free Hugging Face Static Space for the browser pilot

**Status:** accepted  
**Date:** 2026-07-27

## Context

The first authenticated hosted deployment reached Hugging Face successfully but failed with HTTP 402 while creating a Docker Space. Hugging Face permits Static Spaces on free accounts but requires a paid plan for newly created Docker and Gradio Spaces.

The current Rendezvue prototype is entirely client-side HTML, CSS and JavaScript. It does not need a long-running server process, persistent local disk or container-specific behavior.

## Decision

The pilot shall be deployed as a Hugging Face Static Space.

- `README.md` declares `sdk: static`;
- Hugging Face runs `npm run build:static`;
- the generated entry point is `dist/index.html`;
- GitHub Actions creates/synchronizes the Static Space;
- deployment verification opens the direct public page and checks an embedded Rendezvue marker;
- the Docker target remains tested but is not used for the free hosted pilot.

## Consequences

### Positive

- no Hugging Face Pro subscription is required;
- hosting matches the prototype’s actual browser-only architecture;
- camera and PWA testing can occur over a public HTTPS URL;
- no unnecessary server process or runtime storage is introduced;
- GitHub remains the source of truth.

### Negative

- the Static Space cannot host production authentication, databases, messaging services, moderation APIs or avatar-generation workers;
- later phases require external backend infrastructure or a different hosting tier;
- camera behavior must be tested at the direct `hf.space` URL because embedding policies may differ.

## Revisit trigger

Reconsider the hosting target when Rendezvue introduces persistent authenticated services, server-side liveness, avatar jobs, real-time messaging or moderation operations.
