# Changelog

All notable project changes are recorded here. The project uses pre-release semantic versions during the pilot.

## [Unreleased]

### Identity evidence and dual-control decisions completed

- Completed WP-065E through PR #66, merged as `98af90a56954db689c50bd6ebbb201e056328d53`.
- Added controlled identity-evidence categories, subject scopes, server-derived strengths and support/conflict/inconclusive assessments.
- Restricted evidence, operator and decision references to opaque token-shaped values; raw mailbox-address-shaped evidence is rejected.
- Added controlled outcomes for insufficient evidence, rejection, approval for action and escalation.
- Required at least two distinct supportive categories, one strong category and zero conflicts before `approved_for_action` can be proposed.
- Required duplicate-account proposals to cover both accounts and mailbox-loss proposals to contain two qualifying primary-account assertions.
- Prevented conflicting evidence from being approved or classified as merely insufficient.
- Snapshotted case state, case-state timestamp and an evidence fingerprint so case or evidence changes invalidate stale review.
- Enforced four-eyes control by prohibiting a proposing operator from reviewing the same decision.
- Added append-only proposal/review events and sanitized audits.
- Denied anonymous/authenticated access and denied service-role direct writes; only controlled evidence, proposal and review functions are executable by `service_role`.
- Added 62 pgTAP assertions covering privileges, evidence thresholds, conflict handling, both-account coverage, separation of duties, stale proposals, terminal review, Auth non-mutation and deletion-safe history.
- Added a protected read-only staging verifier with shell and non-destructive contract checks.
- Protected staging migration run `30850758553` passed.
- Protected verifier run `30850822452` confirmed: schema present, evidence/decisions/events `0 / 0 / 0`, ordinary-user access denied, direct service writes denied, controlled functions allowed and mutation/action functions absent.
- `approved_for_action` remains classification-only and does not execute any account action.

### Support-safe account investigation foundation completed

- Completed WP-065D through PR #63, merged as `a514443aad5ea4469e4632bc16ce8bc4dd72a148`.
- Added service-only support cases for duplicate-account and mailbox-access-loss investigations.
- Added a controlled state machine with optimistic expected-state transitions, append-only case events and sanitized audit events.
- Restricted case data to opaque ticket, operator and evidence references; raw mailbox addresses are rejected.
- Added deletion-safe Auth references using `ON DELETE SET NULL`, retaining support history without retaining deleted Auth identifiers.
- Denied anonymous/authenticated access and denied service-role direct table inserts or updates; only controlled case-opening and transition functions are executable by `service_role`.
- Added 38 pgTAP assertions covering privileges, validation, transition safety, terminal states, Auth non-mutation, sanitized audits and deletion-safe references.
- Added a protected read-only post-deploy verifier.
- Protected staging migration run `30843752237` passed.
- Protected verifier run `30843828895` confirmed: support schema present, cases/events `0 / 0`, ordinary-user access denied, direct service writes denied, controlled functions allowed and account-merge/Auth-restoration/e-mail-change/support-deletion functions absent.
- No account merge, Auth identity change, mailbox-access restoration, deletion or real-user admission was introduced.

### Account recovery and lifecycle controls advanced

- Completed WP-065A through PR #55: existing-account sign-in/recovery now uses `shouldCreateUser: false`; explicit registration is the only passwordless action allowed to create a new Auth user.
- Added separate recovery/sign-in and registration actions to the Cloudflare proof interface while keeping the user response generic to prevent account enumeration.
- Added unit and artifact regression gates that fail if existing-account recovery can create users or the UI intent separation disappears.
- Completed non-destructive WP-065B through PR #56.
- Added server-authoritative account lifecycle/activity state for new and existing Auth users.
- Added versioned retention policies with no active default and explicit time-bounded or open-ended retention holds.
- Added service-role-only candidate enumeration for inactive draft accounts with exclusions for recent activity, publication, active matches, unresolved safety/moderation work and active holds.
- Added pgTAP coverage for policy-off behaviour, privileges, exclusions, hold release and activity-based removal from candidacy.
- Added a protected read-only Supabase staging verifier in PR #58.
- Repaired its YAML heredoc runtime failure in PR #59 without changing remote account data or lifecycle permissions.
- Retained the service-role-only function boundary in PR #60 and calculated protected aggregate candidates through the same read-only CTE and exclusions because the Management API query role correctly could not execute the protected function.
- Protected run `30841983060` verified remotely: lifecycle schema present, active retention policies `0`, cleanup candidates `0`, anonymous/authenticated enumeration denied and service-role enumeration allowed.
- No retention policy, delete function, scheduler or real-user admission was activated.

### Controlled two-account Cloudflare proof completed

- Completed WP-057 in issue #41 using two isolated browser profiles and two controlled synthetic adult accounts.
- Proved same-browser-profile Supabase PKCE magic-link exchange, callback consumption, session restoration, explicit global sign-out and re-authentication for both roles.
- Persisted and server-published one synthetic woman and one synthetic man profile.
- Proved opposite-sex discovery, reciprocal likes and exactly one shared match.
- Claimed one synthetic proof contact entitlement, opened one conversation and exchanged Realtime messages in both directions without refresh.
- Proved active-match private portrait access, private structured feedback and private safety reporting without public ratings or moderation disclosure.
- Proved normal contact ending and a separate block path.
- Added and used a participant-scoped server-authoritative revocation RPC proving the conversation closed, no new portrait access could be issued and new message writes were rejected.
- Removed the displayed matched portrait and disabled message controls after revocation confirmation.
- Completed authenticated provider cleanup for both proof accounts, including private portrait objects, Supabase Auth users and relational records while retaining anonymised audit evidence.
- Verified neither isolated browser profile restored a session after final cleanup and refresh.
- Added `docs/WP-057-COMPLETION.md` as the consolidated non-secret completion record.

### Account-cleanup defect repaired

- Observed the first account-A cleanup fail with a non-2xx Edge Function response while the account remained authenticated and retryable.
- Identified `conversations.opened_by_user_id -> auth.users(id) ON DELETE RESTRICT` as the blocker for deleting the account that opened the conversation.
- PR #52 changed the foreign key to `ON DELETE CASCADE`.
- Added a regression test covering an ended match, ended conversation and message while preserving the other participant.
- CI passed application/artifact checks, Docker, empty-database migration replay, pgTAP, concurrency, deterministic seed and schema lint.
- Protected staging run `30805876163` applied the migration, redeployed the cleanup function and passed remote health, anonymous rejection and browser-artifact validation.
- Retried cleanup successfully for account A and then account B.

### Governance advancement

- Marked WP-035 complete for controlled proof.
- Marked WP-050 complete for the controlled persistent-service slice.
- Marked WP-055 complete for the current backend proof scope.
- Marked WP-057 complete.
- Marked WP-058 complete for controlled provider cleanup.
- Marked WP-065A, WP-065B, WP-065D and WP-065E complete and remotely verified.
- Kept WP-065C blocked pending retention-policy, DPIA and operational approval.
- Advanced the roadmap from evidence/decision infrastructure to the explicit decision whether any account mutation/restoration action should exist, plus integrated mobile review and closed-pilot readiness.
- Real-user admission remains unauthorized.

### Cloudflare Pages canonical staging

- Selected `https://rendezvue-private-preview.pages.dev/` as the sole canonical web-facing staging URL.
- Kept GitHub as the source of truth and Supabase as the Auth, PostgreSQL/RLS, private Storage, Realtime and Edge Function backend.
- Retired Hugging Face as an application host.
- Added Cloudflare-specific build metadata, security/no-store headers and protected Supabase configuration workflows.
- Added post-merge commit-matched production verification.
- Added fail-closed placeholder handling and a controlled production bootstrap from previously public validated browser configuration when native Pages variables are absent.

### Passwordless authentication provider correction

- Proved that Supabase free-tier projects using the default mail provider cannot customize the passwordless e-mail template for numeric `{{ .Token }}` delivery.
- Standardized on the default Supabase magic link with PKCE and the fixed Cloudflare redirect URL.
- Required each link to be requested and opened in the same isolated browser profile.
- Accepted only a one-time `?code=` callback and removed the consumed code from browser history.
- Disabled implicit access and refresh token URL fragments.

### Synthetic profile seed

- Added ten varied synthetic WebP portraits and ten canonical structured profile records.
- Added JSON, CSV, deterministic SQL and protected remote seed routes.
- Added explicit `is_synthetic` and `synthetic_id` markers.
- Created ten confirmed Auth-linked test users, ten published discovery profiles and ten selected private Storage portraits.

### Backend proof foundation

- Added versioned Supabase/PostgreSQL migrations, Row Level Security, least-privilege grants and private portrait-storage contracts.
- Added server-authoritative attraction signals, reciprocal matches, contact entitlements, conversations, messages, blocking, private feedback, safety reports, moderation cases and audit events.
- Added account-deletion cascades and retained audit-identifier anonymisation.
- Added fail-closed publication and opposite-sex discovery rules.
- Added true parallel race protection for simultaneous first likes and contact-opening requests.
- Added empty-database replay, pgTAP, race tests and schema lint.

### Auth and resumable onboarding contracts

- Added a provider-injectable passwordless/session adapter with normalization, redirect configuration, session restore, current-user lookup, auth-state subscription and sign-out.
- Added owner-derived stage persistence with strict field allowlists.
- Added versioned onboarding progress, prompts/interests and transactional personality save.
- Added owner-only sanitized onboarding snapshots.
- Added `publish_profile()` as the only server-side publication action.
- Added cross-account draft-isolation and publication-lifecycle tests.

### Private interaction and cleanup harness

- Added exactly one synthetic proof contact right per eligible published proof account.
- Prevented a second proof right after consumption.
- Added idempotent conversation opening and participant-only Realtime messages.
- Added participant-controlled contact ending and active-match-only private portrait access.
- Added private safety-report and structured-feedback controls without public ratings.
- Added authenticated Edge Function `delete-private-proof-account` with exact destructive confirmation and JWT-derived account identity.
- Deleted UUID-scoped object bytes before Auth deletion and returned only sanitized deletion status and object count.
- Added Deno type checking, CORS tests and unauthenticated HTTP 401 verification.

### Remaining gates

- Approve an operational identity-evidence policy and operator playbook; WP-065E is a technical contract only.
- Decide whether account merge, Auth e-mail change or mailbox-loss restoration should exist at all.
- Design any approved action as a separate dual-control, reauthenticated, audited, notified, idempotent and reversible package.
- Keep `approved_for_action` disconnected from all account mutation until that package passes.
- Define operational retention-hold procedures.
- Approve retention periods, grace period, user notifications, DPIA alignment and operational ownership before WP-065C activation.
- Keep scheduled or automatic deletion disabled until synthetic dry-run, rollback and support procedures pass.
- Replace the transition Cloudflare bootstrap with direct Pages environment variables when operationally available.
- Integrate proof contracts into the polished Cloudflare product interface.
- Complete desktop/mobile camera and privacy-portrait review.
- Complete legal, DPIA, sensitive-data, age/liveness, accessibility, moderation, support and security readiness.
- Authorize a constrained real-user city pilot explicitly before admitting any real users.

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
