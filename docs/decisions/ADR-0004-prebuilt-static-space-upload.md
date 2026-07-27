# ADR-0004 — Upload a prebuilt Static Space artifact

**Status:** accepted  
**Date:** 2026-07-27

## Context

The browser prototype does not need server compute. A Docker Space was rejected with HTTP 402 on the free Hugging Face account. A source-synchronized Static Space was then created successfully, but the expected public page remained unavailable for 20 minutes.

Relying on Hugging Face to install Node and build the repository adds an unnecessary second build environment and weakens reproducibility.

## Decision

GitHub Actions shall:

1. build the application into `dist/`;
2. create a complete `.hf-deploy/` artifact;
3. validate the artifact and Space metadata;
4. upload it directly to the Static Space root with the Hugging Face CLI;
5. delete files no longer present in the generated artifact;
6. verify the served deployment marker.

The deployed Space metadata shall use `sdk: static` and `app_file: index.html` without `app_build_command`.

## Consequences

### Positive

- one authoritative build environment;
- no paid compute requirement;
- no Hugging Face Node build dependency;
- exact deployable artifact is testable before upload;
- remote contents are deterministic and disposable;
- GitHub remains the operational source of truth.

### Negative

- the Space repository contains generated files rather than the complete source tree;
- deployment depends on the Hugging Face CLI upload operation;
- source browsing remains in GitHub rather than the Space.

## Rejected alternatives

- paid Docker Space: unnecessary for the browser-only pilot;
- source mirroring plus remote build: failed to yield a reachable page and duplicates build responsibility;
- direct manual uploads: violates source-of-truth and reproducibility rules.
