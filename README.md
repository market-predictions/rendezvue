# Rendezvue

Rendezvue is a Dutch-first, privacy-first platform concept for serious introductions between adult single Muslims and people from a Muslim background in the Netherlands.

Membership is **student-first, not student-only**. Students can eventually verify their status for a badge, Campus Mode, events and reduced contact pricing, while recent graduates, professionals, entrepreneurs and other eligible adults can participate in the same marketplace.

## Canonical staging

**Cloudflare Pages:** `https://rendezvue-private-preview.pages.dev/`

This is the sole web-facing staging environment. It connects to the non-production Supabase proof project and is restricted to controlled synthetic adult accounts. Real-user admission is not authorized.

GitHub `main` is the source of truth. Cloudflare Pages builds `dist-private-preview` with:

- `npm run build:cloudflare`;
- browser-safe `SUPABASE_URL`;
- browser-safe `SUPABASE_PUBLISHABLE_KEY`;
- commit-matched deployment metadata;
- Cloudflare security and no-store headers.

Supabase provides Auth, PostgreSQL/RLS, private Storage, Realtime and Edge Functions. Passwordless authentication uses the default Supabase magic link with PKCE. The link must be requested and opened in the same browser profile. The callback transports only a one-time authorization code; implicit access- and refresh-token URL fragments are disabled.

The free-tier Supabase default mail provider does not permit custom e-mail templates. Numeric `{{ .Token }}` delivery would therefore require custom SMTP or a plan change and is not part of this proof.

## Historical concept artifact

`apps/web` remains the dependency-light local-demo concept source for product and interaction comparison. Its generated `dist` artifact is explicitly non-canonical and is not automatically deployed.

The former public and private Hugging Face Spaces are retired application hosts. Existing Spaces may remain reachable as stale historical artifacts, but no workflow updates them and no acceptance testing is performed there.

## Backend proof

The repository contains:

- versioned Supabase migrations;
- Auth-linked account/profile boundaries;
- Row Level Security;
- private portrait storage;
- server-authoritative likes, reciprocal matches and contact entitlements;
- conversations, messages, blocks, feedback, reports, moderation and audit contracts;
- resumable onboarding and server-side profile publication;
- one-time synthetic contact proof;
- active-match signed portrait access;
- provider-orchestrated object and account cleanup;
- ten seeded Auth-linked synthetic profiles and ten private portraits.

## Architecture

```text
GitHub source and governance
        |
        +--> Cloudflare Pages previews and canonical staging
        |           |
        |           v
        |      browser-safe Supabase client
        |           |
        +--> protected GitHub Actions configuration
                    |
                    v
              Supabase Auth
              PostgreSQL + RLS
              private Storage
              Realtime
              Edge Functions
```

Persistent state never depends on Cloudflare Pages. RLS and server operations remain the authorization boundary.

## Validation

```bash
npm ci
npm run check
```

Cloudflare artifact validation uses browser-safe placeholders:

```bash
SUPABASE_URL=https://example.supabase.co \
SUPABASE_PUBLISHABLE_KEY=sb_publishable_ci_only_placeholder_00000000000000000000 \
npm run check:cloudflare
```

After installing the Supabase CLI, backend validation is:

```bash
supabase start
supabase db reset
supabase test db
```

## Governance and design

- [Requirements](docs/REQUIREMENTS.md)
- [Roadmap](docs/ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Backend proof](docs/BACKEND-PROOF.md)
- [Data model](docs/DATA-MODEL.md)
- [Onboarding](docs/ONBOARDING.md)
- [Interaction and trust](docs/INTERACTION-AND-TRUST-MODEL.md)
- [Privacy and safety](docs/PRIVACY-AND-SAFETY.md)
- [Cloudflare staging proof](docs/PRIVATE-SUPABASE-PREVIEW.md)
- [Work packages](docs/WORKPACKAGES.md)
- [Work claims](docs/WORK-CLAIMS.md)
- [Handover](docs/HANDOVER.md)
- [Changelog](CHANGELOG.md)
- [ADR-0008: Cloudflare Pages canonical staging](docs/decisions/ADR-0008-cloudflare-pages-canonical-staging.md)

## Security boundary

Do not commit or enter real student documents, identity evidence, production credentials, source selfies, religious profiles or real conversations. Use synthetic data only until legal, privacy, security, moderation and explicit real-user admission gates are complete.
