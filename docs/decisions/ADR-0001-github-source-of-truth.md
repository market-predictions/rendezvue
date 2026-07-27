# ADR-0001: GitHub is the sole source of truth

**Status:** accepted  
**Date:** 2026-07-27

## Context

The pilot interface will be exposed through a Hugging Face Space while development, governance and handover require a stable authoritative history.

## Decision

GitHub repository `market-predictions/rendezvue` is authoritative. Hugging Face is synchronized one-way from GitHub and is never the origin of an intended product change.

## Consequences

- direct Hugging Face edits may be overwritten;
- requirements, roadmap and operational records stay next to code;
- deployment must be reproducible from a GitHub commit;
- Hugging Face failures cannot corrupt the project history;
- a deployment credential and Space identifier must be configured in GitHub.
