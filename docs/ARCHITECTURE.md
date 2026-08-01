# Rendezvue architecture

**Version:** 2.0  
**Updated:** 2026-08-01

## 1. Canonical staging topology

```text
GitHub branch / PR
      |
      +--> CI and database validation
      |
      +--> Cloudflare Pages preview deployment
      |
      v
GitHub main (authority)
      |
      +--> Cloudflare Pages production staging
      |        https://rendezvue-private-preview.pages.dev/
      |
      +--> protected Supabase configuration workflow
               |
               v
         Supabase Auth / Data API
               |
               v
         PostgreSQL + RLS
         private Storage
         Realtime
         Edge Functions
```

GitHub is the sole source of truth. Cloudflare Pages is the only canonical web-facing staging host. Supabase owns persistent state. No owner-local runtime is required.

The historical Hugging Face Spaces are retired, non-canonical artifacts. They receive no deployments and are not used for functional acceptance.

## 2. Browser applications

```text
apps/web/
  historical local-demo concept application
  browser-local camera and privacy portrait renderer

apps/private-preview/
  canonical Supabase-connected staging harness
  e-mail OTP, onboarding, discovery, matching, chat and cleanup controls
```

The local-demo artifact remains useful as product-design source but is not a hosted authority. The Supabase-connected application is built into `dist-private-preview` for Cloudflare Pages.

## 3. Cloudflare Pages build contract

Cloudflare Pages uses:

- build command: `npm run build:cloudflare`;
- output directory: `dist-private-preview`;
- production branch: `main`;
- browser variables: `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`;
- canonical URL: `https://rendezvue-private-preview.pages.dev/`.

The build embeds:

- Supabase project URL;
- publishable browser key;
- hosting platform and canonical URL;
- the Cloudflare/GitHub commit SHA;
- explicit `realUserAdmissionAuthorized: false`.

The build rejects secret/service-role keys, database URLs, access tokens, passwords and private keys. Cloudflare `_headers` prevents framing, limits browser capabilities and disables caching for runtime configuration and deployment metadata.

## 4. Passwordless authentication

Rendezvue staging uses a numeric e-mail OTP:

1. the browser requests an OTP with `signInWithOtp`;
2. Supabase sends `{{ .Token }}` rather than a confirmation URL;
3. the code is entered in the already-open Cloudflare application;
4. the browser verifies it with `verifyOtp({ type: 'email' })`;
5. one shared Supabase client owns the session and all subsequent operations.

Automatic session extraction from URL query parameters or fragments is disabled. Legacy `?code=` and `#access_token=` callbacks are removed from browser history and ignored.

The protected workflow configures the Supabase Auth Site URL and redirect allow-list to the fixed Cloudflare URL. The OTP flow itself does not depend on redirect transport.

## 5. Server-authoritative domain boundaries

```text
Account (auth.users)
Profile
Eligibility
LifeStage
StudentVerification
FamilyContext
FaithProfile
PrivacyPortrait
AttractionSignal
Match
ContactEntitlement
Conversation / Message
Block
InteractionFeedback
SafetyReport
ModerationCase
AuditEvent
```

These boundaries are implemented as separate tables and described in `docs/DATA-MODEL.md` and `docs/BACKEND-PROOF.md`.

## 6. Backend operations

### Like to match

`record_attraction_signal(...)` derives the actor from the authenticated session, rejects self-interaction and blocked or unpublished targets, stores the signal and creates one normalized match only after a reciprocal like.

### Contact right to conversation

`open_match_conversation(...)` locks the match and entitlement, verifies participant and block state, consumes one valid entitlement idempotently and creates or returns the unique conversation.

### Messaging

Messages are insertable only by a participant in an open conversation. Realtime delivery never grants access by itself; table RLS remains authoritative.

### Portrait access

Portrait objects are private and owner-scoped. An active matched participant may receive a short-lived signed URL through the controlled server path. Access stops after contact ending or blocking.

### Account cleanup

`delete-private-proof-account` derives identity from the authenticated JWT, requires exact confirmation, deletes UUID-scoped private objects first and deletes the Auth user only after object cleanup succeeds. Relational cascades and audit anonymisation then apply.

## 7. Data exposure rules

- private profile domains are owner-only;
- `discovery_profiles` exposes only approved discovery fields;
- full family and faith data remain fail-closed;
- incoming likes are not directly queryable by the recipient;
- participants can read only their matches, conversations and messages;
- report subjects cannot read reports about themselves;
- moderation and audit tables have no ordinary authenticated-user policies;
- private objects are stored below the owner UUID prefix;
- a publishable browser key never bypasses RLS.

## 8. Security and privacy invariants

- the browser is untrusted;
- persistent state never depends on Cloudflare Pages;
- GitHub source and migrations are authoritative;
- only browser-safe configuration enters the Pages artifact;
- URL access and refresh tokens are not accepted as an authentication transport;
- account identity and student evidence are separate;
- age assurance and student verification are independent;
- source media and public portrait are separate data classes;
- blocks, contact entitlements and moderation are server-authoritative;
- faith and family data are not advertising segments;
- data about individual children is not collected;
- likes are attraction signals, not reputation votes;
- serious reports never become a simple ranking penalty;
- real-user admission requires an explicit later authorization gate.

## 9. Deployment and validation lanes

### Pull requests

GitHub Actions validates application code, the Cloudflare artifact, credential boundaries, Docker, migrations, pgTAP, races and Edge Function behaviour. Cloudflare Pages supplies a branch preview.

### Main

Relevant accepted changes trigger:

1. Cloudflare Pages production deployment through the existing GitHub integration;
2. protected Supabase configuration, migration, health and Edge Function checks;
3. polling verification that production `deployment.json` matches the merged commit.

### Production

No real-user production lane exists. A production environment requires legal/privacy approval, operational moderation, incident response, backup controls, monitored migrations and explicit real-user authorization.

## 10. Framework decision

The dependency-light PWA remains appropriate for proof and interaction validation. A production component framework is selected only after the interaction model stabilizes, using accessibility, localization, state-machine, WebRTC, testing, bundle-size and maintainability criteria.
