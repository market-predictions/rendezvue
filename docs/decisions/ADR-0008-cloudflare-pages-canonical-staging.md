# ADR-0008 — Cloudflare Pages is the canonical staging host

**Status:** accepted  
**Date:** 2026-08-01  
**Decision owner:** market-predictions  
**Tracking:** issue #35

## Context

Rendezvue had accumulated three web-delivery paths:

1. a historical public local-demo application on Hugging Face;
2. a private Supabase proof application on Hugging Face;
3. automatic Cloudflare Pages previews connected to the same GitHub repository.

The private Hugging Face access gateway runs before application JavaScript and interfered with Supabase callback testing. Maintaining multiple hosts also made it unclear which URL, build and authentication behaviour were authoritative.

## Decision

- GitHub remains the sole source of truth.
- `https://rendezvue-private-preview.pages.dev/` becomes the sole canonical web-facing staging URL.
- Supabase remains the backend for Auth, PostgreSQL/RLS, private Storage, Realtime and Edge Functions.
- Passwordless authentication uses a numeric e-mail OTP verified inside the already-open application. Access and refresh tokens are not transported in application URLs.
- Cloudflare Pages receives only the Supabase project URL and publishable browser key.
- Hugging Face is retired as an application host. Existing Spaces are historical non-canonical artifacts and are not used for acceptance testing.
- No real-user admission is authorized by this decision.

## Consequences

Positive:

- one web-facing staging URL and one browser runtime;
- no host-level access gateway between Supabase authentication and the application;
- Cloudflare branch previews and production deployments derive directly from GitHub;
- simpler callback, CSP, cache and security-header policy;
- lower risk of testing a platform-specific behaviour that will not ship.

Costs and risks:

- Cloudflare project environment variables remain an external operational setting;
- the Pages production branch and build command must remain configured correctly;
- existing Hugging Face URLs may remain reachable until manually deleted or access-restricted;
- the old local-demo concept UI and the Supabase proof UI are not yet a single polished application.

## Acceptance

The decision is operationally complete only when:

1. the protected Supabase staging workflow succeeds with the Cloudflare Site URL and allow-list;
2. the Cloudflare production deployment serves a `deployment.json` matching the merged `main` commit;
3. active Hugging Face deployment workflows and helpers are removed;
4. the controlled two-account synthetic browser proof succeeds on Cloudflare Pages.
