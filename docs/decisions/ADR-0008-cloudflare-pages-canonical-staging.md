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

The first Cloudflare migration attempt proposed a numeric e-mail OTP. Remote execution proved that Supabase free-tier projects using the default mail provider cannot modify the passwordless e-mail template. A custom SMTP provider or paid plan would be required for `{{ .Token }}` delivery.

## Decision

- GitHub remains the sole source of truth.
- `https://rendezvue-private-preview.pages.dev/` becomes the sole canonical web-facing staging URL.
- Supabase remains the backend for Auth, PostgreSQL/RLS, private Storage, Realtime and Edge Functions.
- Passwordless authentication uses the default-provider magic link with Supabase PKCE.
- A magic link must be requested and opened in the same isolated browser profile so the local PKCE verifier is available.
- The Cloudflare callback may briefly contain a one-time `?code=`. After successful exchange, the application removes that consumed code from browser history.
- Implicit access- and refresh-token URL fragments are disabled.
- Cloudflare Pages receives only the Supabase project URL and publishable browser key.
- Hugging Face is retired as an application host. Existing Spaces are historical non-canonical artifacts and are not used for acceptance testing.
- No real-user admission is authorized by this decision.

## Consequences

Positive:

- one web-facing staging URL and one browser runtime;
- no host-level access gateway between Supabase authentication and the application;
- Cloudflare branch previews and production deployments derive directly from GitHub;
- no custom SMTP or paid Supabase plan is required for the proof;
- PKCE avoids transporting access and refresh tokens in the callback URL;
- lower risk of testing a platform-specific behaviour that will not ship.

Costs and risks:

- Cloudflare project environment variables remain an external operational setting;
- the Pages production branch and build command must remain configured correctly;
- the magic link must be opened in the same browser profile that requested it;
- existing Hugging Face URLs may remain reachable until manually deleted or access-restricted;
- the old local-demo concept UI and the Supabase proof UI are not yet a single polished application.

## Acceptance

The decision is operationally complete only when:

1. the protected Supabase staging workflow succeeds with the Cloudflare Site URL and allow-list;
2. the Cloudflare production deployment serves a `deployment.json` matching the merged `main` commit;
3. active Hugging Face deployment workflows and helpers are removed;
4. the controlled two-account synthetic browser proof succeeds on Cloudflare Pages using same-profile PKCE magic links.
