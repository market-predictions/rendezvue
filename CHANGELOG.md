# Changelog

All notable project changes are recorded here. The project uses pre-release semantic versions during the pilot.

## [Unreleased]

### Backend proof foundation

- Added versioned Supabase/PostgreSQL migrations, Row Level Security, least-privilege grants and private portrait-storage contracts.
- Added server-authoritative attraction signals, reciprocal matches, contact entitlements, conversations, messages, blocking, private feedback, safety reports, moderation cases and audit events.
- Added account-deletion cascades and retained audit-identifier anonymisation.
- Added fail-closed publication and eligibility/opposite-sex discovery rules.
- Added true parallel race protection for simultaneous first likes and contact-opening requests.
- Added empty-database replay, pgTAP, race tests and schema lint.

### Auth and resumable onboarding contracts

- Added an injectable magic-link/session adapter with email normalization, session restore, current-user lookup, auth-state subscription and sign-out.
- Added owner-derived stage persistence with strict per-domain field allowlists.
- Added versioned `onboarding_progress`, first-class prompts/interests and transactional personality save.
- Added owner-only sanitized onboarding snapshots.
- Added `publish_profile()` as the only server-side publication action.
- Publication requires eligible single/adult/serious/community state, family context, a selected privacy portrait, at least two prompts and at least three interests.
- Added cross-account draft-isolation and publication-lifecycle tests.

### Private Supabase proof lane

- Provisioned non-production `RendezvueProject` in West EU (Ireland) on Nano compute.
- Added a separate `apps/private-preview` interface that is never copied into the public Hugging Face artifact.
- Added protected GitHub Actions deployment through environment `rendezvue-private-preview`.
- Added a private artifact builder that embeds only the project URL, an `sb_publishable_...` key and the exact Auth redirect URL.
- Added recursive credential scanning for secret/service-role material, database URLs, access tokens, passwords and private keys.
- Added project Auth health and supported Data API metadata validation.
- Added one shared browser Supabase Auth client for callback, onboarding, interaction and cleanup.

### Private interaction harness

- Added `claim_private_proof_entitlement()` for exactly one synthetic proof contact right per eligible published proof account.
- Prevented a second proof right after consumption.
- Added idempotent conversation opening and participant-only Realtime messages.
- Added `end_match_contact(...)` to close match/conversation state and revoke both attraction signals.
- Added active-match-only portrait-path access and five-minute signed matched-portrait delivery.
- Stopped portrait and message access after contact ending or blocking.
- Added private safety-report and structured-feedback controls without public ratings.
- Added artifact assertions rejecting a second `createClient`, missing controls or server credentials.

### Provider-orchestrated account cleanup

- Added authenticated Edge Function `delete-private-proof-account`.
- Requires exact confirmation `DELETE_SYNTHETIC_ACCOUNT` and derives the account ID only from the authenticated JWT.
- Lists only private portrait objects below the caller's UUID prefix.
- Deletes object bytes before deleting the Auth account so storage failure leaves the account intact and retryable.
- Uses existing foreign-key cascades and audit anonymisation after Auth deletion.
- Returns only deletion status and object count; paths and credentials are never returned.
- Added private-preview cleanup controls using the one shared browser client.
- Added Deno type checking and local Edge Runtime tests for CORS and unauthenticated HTTP 401.
- Extended the protected workflow to deploy the cleanup function and verify unauthenticated rejection remotely.

### Validation and remote evidence

- Backend foundation PR #17 merged as `8bbf1398`.
- Concurrency proof PR #19 merged as `5976ddea`.
- Auth/onboarding PR #20 merged as `1de81465`.
- Protected private proof lane PR #22 merged as `5a532629`.
- Supported health-check PR #24 merged as `9403330f`.
- Contact/chat/safety harness PR #25 merged as `11964e91`.
- Provider cleanup PR #26 merged as `8400ebc7`.
- Local validation passes application/artifact checks, private shared-client and credential-boundary validation, Deno type checking, local Edge Runtime/CORS/auth-gate tests, Docker, clean migration replay, **151 pgTAP assertions**, true parallel match/contact races and schema lint.
- Protected workflow run **#8** on `main` commit `8400ebc70d02dc6393e00d48a7b02c9f808559cf` succeeded.
- Run #8 linked migrations, applied pending migrations, passed remote Auth and Data API metadata checks, deployed authenticated account cleanup, proved unauthenticated cleanup rejection, validated the publishable-key-only browser artifact and generated one short-lived complete private proof artifact.
- Run #8 confirmed that the public Hugging Face pilot remained unchanged in `local-demo` and that real-user admission remained unauthorized.

### Pending review and proof

- Desktop/mobile field review of the public pilot and camera/privacy portraits.
- Download and locally serve the workflow run #8 artifact before expiry.
- Real magic-link delivery, callback and session recovery using two controlled synthetic accounts.
- Persistent two-account onboarding, publication, reciprocal discovery/likes and exactly one match.
- Remote one-time entitlement, realtime chat, signed portrait, end-contact, block/report and private feedback execution.
- Remote authenticated deletion of private objects and both proof accounts, including relational cascades and retained audit anonymisation.
- Legal, privacy, security and moderation gates before any real-user pilot.

## [0.3.0-alpha.1] - 2026-07-29

### Product rebaseline

- Replaced student-only eligibility with adult, single, serious-intent open membership.
- Retained students as a priority community with optional verification, Campus Mode, events and reduced contact pricing.
- Added life stage, marital history, children, child preference and openness to a partner with children.
- Made fuzzy browser-local privacy portraits the MVP baseline; AI portraits are no longer a dependency.
- Defined free discovery/likes plus paid conversation opening with free replies after contact is opened.
- Separated attraction signals, private experience feedback, safety reports and internal trust signals.
- Prohibited public stars, downvotes, popularity counts and one-review visibility penalties.

### Pilot implementation

- Rebuilt onboarding as a progressive Dutch/English flow with versioned local resume.
- Added simulated private account creation and optional student verification.
- Added profile preview, community promise, diverse synthetic profiles, direct/contextual likes, swipes, deterministic match, simulated contact entitlement and local text chat.
- Added end-contact and private feedback without ranking effect.

## [0.2.0-alpha.4] - 2026-07-28

- Replaced the single imposed avatar with four selectable browser-local privacy portraits.
- Added a 2×2 selection grid and minimum privacy floor.

## [0.2.0-alpha.3] - 2026-07-28

- Tested a stronger monochrome ink-sketch abstraction.

## [0.2.0-alpha.2] - 2026-07-28

- Published and marker-verified the Netherlands-first MBO/HBO/WO pilot.

## [0.2.0-alpha.1] - 2026-07-28

- Pivoted from Morocco to the Netherlands.
- Added Dutch default/English switch, MBO/HBO/WO fixtures and descriptive faith/lifestyle fields.
- Prohibited piety scoring, inferred religion and advertising use of faith data.

## [0.1.0-alpha.7] - 2026-07-27

- Published the first verified hosted prototype.

## [0.1.0-alpha.1] - 2026-07-27

- Established GitHub authority, governance, mobile PWA prototype, camera capture, discovery, matching, chat, safety controls and CI foundations.
