# Changelog

All notable project changes are recorded here. The project uses pre-release semantic versions during the pilot.

## [Unreleased]

### Human-readable customer-facing profile labels

- Added WP-069C after owner field review exposed `serious_relationship` in visible profile copy.
- Added one shared Dutch/English presentation mapper for relationship-intent and life-stage values.
- `serious_relationship` now renders as `Serieuze relatie` in Dutch and `Serious relationship` in English.
- Added explicit labels for `student`, `recent_graduate`, `employed` and `self_employed`.
- Preserved genuine custom text and humanised unknown snake-case values without underscores.
- Applied the display boundary to both profile preview and discovery.
- Added regression tests for Dutch/English mapping, custom-copy preservation and unknown-value fallback.
- No backend values, profile data, Auth, RLS, Storage or real-user authorization were changed.


### Participant profile image preparation foundation completed

- Implemented WP-069B through issue #91 and PR #92, merged as `a06f2ae7b7c4b5779e80143d62960856e63d9ac7`.
- Added a mobile-first 4:5 framing editor with pan, zoom, reset, safe-area guidance and square avatar preview.
- Added warnings for low-resolution, landscape and unusually narrow sources without introducing biometric analysis.
- Normalized orientation where supported and re-encoded the source to metadata-free private WebP rather than using the original upload directly.
- Added explicit 960×1200 card and 384×384 avatar derivatives linked to one preparation ID.
- Restricted selected portraits to the card role and enforced one selected card per account, exact private paths, idempotency and serialized replacement.
- Redacted source and selected Storage paths from onboarding snapshots and kept object paths out of audit payloads and browser events.
- Added resilient `contain` plus blurred same-image rendering so the app does not crop through face, chin or forehead merely to fill a slot.
- Added pure framing tests, 37 pgTAP assertions, generated-artifact checks and a protected read-only staging verifier.
- Protected run `30994962258` applied the migrations to the existing synthetic Supabase project.
- Canonical run `30995029165` passed delivered browser behavior and the protected schema/RPC contract for merge `a06f2ae7b7c4b5779e80143d62960856e63d9ac7`.
- Owner field review with difficult controlled uploads remains pending; real-user admission remains unauthorized.

### Realistic synthetic discovery portraits completed

- Completed WP-069A through issue #89 and PR #88, merged as `14eeaf60018e0cd507d570854b91e4f8418f380f`.
- Replaced the ten childlike illustrated fixtures with unique photorealistic AI-generated adult synthetic portraits.
- Retained deterministic profile-name mapping and the synthetic-only manifest.
- Converted mislabeled PNG uploads to genuine optimized WebP assets before merge.
- Added durable portrait-only canonical verification through PR #90, merged as `dd64d7d5eb202e03934f819694fa6060999f237e`.
- Canonical run `30960048211` verified all ten images, dimensions, uniqueness, content types, bounded sizes and synthetic-only status.
- No real-user photographs or biometric reference images were introduced.

### Integrated onboarding, discovery and conversation product shell completed

- Completed WP-067 through issue #74 and implementation PR #75, merged as `21596e03ddf624f4eca5b272c77539985617e742`.
- Added a signed-in mobile product shell with Start, Profile, Discover, Matches and Account navigation.
- Integrated resumable eligibility, identity, life-stage, family, faith, personality and portrait onboarding with the existing authenticated persistence contracts.
- Kept sex limited to Woman/Man and derived opposite-sex discovery automatically without a separate partner selector.
- Added exact adult-date validation and server-compatible onboarding payload tests.
- Added private synthetic portrait upload, failed-registration object rollback, selected-portrait preview and server-authoritative profile publication.
- Added a product-safe discovery projection that retains target IDs only for authorized actions and excludes them from visible profile data.
- Bundled the ten existing deterministic synthetic WebP portraits into the Cloudflare artifact with a `syntheticOnly` manifest.
- Added synthetic portrait-backed profile cards with pass, direct like and contextual like actions through `record_attraction_signal`.
- Added product match status, one controlled synthetic contact-right flow and idempotent conversation opening.
- Added participant-only message reads/writes and Realtime conversation updates.
- Added temporary matched-portrait access while contact is active.
- Added plain-language normal contact ending, blocking and private safety reporting.
- Kept Dutch as the default and added complete English product-copy key parity linked to the WP-066 language switch.
- Kept raw snapshots, UUIDs, private paths, proof terminology and diagnostic controls behind the advanced synthetic-test boundary.
- Added a dedicated WP-067 source/generated-artifact validator rejecting second Supabase clients, visible internal IDs, Auth-admin/support-executor exposure, account-merge patterns, language drift and missing synthetic assets.
- Added product-model tests; the complete application suite passed 51 Node tests with zero failures.
- Implementation CI run `30859823200` and full validation run `30859823366` passed application, artifact, Cloudflare, Docker, empty-database replay, pgTAP, race, seed and schema-lint checks.
- Protected backend run `30860142461` passed remote health, cleanup deployment, anonymous rejection and browser credential boundaries for the implementation merge.
- Initial production verifier run `30860142392` exposed a stale pre-WP-066 marker (`Magic link aanvragen`) rather than an application defect.
- Repaired and strengthened canonical production verification in PR #76, merged as `2bcd6f884ab6cc7a4ef68291b46e03e754be845b`.
- Canonical product run `30860701792` verified commit-matched remote Supabase configuration, the WP-066 account shell, the WP-067 integrated product shell, synthetic portrait manifest/delivery, PKCE, disabled implicit fragments, no-store/security headers and absence of privileged browser capabilities.
- No disposable-account field execution, owner mobile acceptance or real-user admission is claimed.

### Product-facing account and recovery experience completed

- Completed WP-066 through issue #71 and PR #72, merged as `45461d51a4cc6ad09b019e0b9165a9bb54ed4cb1`.
- Replaced the operator-first Cloudflare landing view with a mobile-first product account experience.
- Kept Dutch as the default and added explicit English copy parity and language switching.
- Presented separate sign-in and account-creation actions while retaining `shouldCreateUser: false` for existing-account entry.
- Added generic request confirmations that do not reveal account existence, provider state or delivery success.
- Added language-aware guidance for expired, used and wrong-browser magic links and removed provider error parameters from the address bar.
- Added plain-language `Geen toegang meer tot je e-mailadres?` guidance explaining identity review, independent approval and the prohibition on asking for passwords or complete mailbox codes.
- Warned users not to create a duplicate account because matches and conversations are not merged automatically.
- Added a masked signed-in e-mail summary, global sign-out and understandable account-deletion consequences.
- Added responsive mobile styling and visible keyboard focus.
- Retained the full WP-057 profile, portrait, discovery, matching, entitlement, chat, reporting, blocking, cleanup and proof harness under an advanced synthetic-test disclosure.
- Added a shared bilingual account-experience module and unit tests for copy parity, generic messages, masking and callback classification.
- Added a dedicated WP-066 validator that enforces Dutch default, language parity, shared-client reuse, non-enumerating copy and absence of browser-callable Auth admin or WP-065F execution.
- Full application, artifact, Cloudflare, Docker, migration replay, pgTAP, concurrency, seed and schema-lint checks passed.
- Canonical production run `30857567262` verified a commit-matched deployment with remote Supabase configuration, PKCE magic links, disabled implicit token fragments and security/no-store headers.
- Protected backend run `30857567127` passed canonical Auth URL/allow-list, remote health, cleanup deployment, anonymous cleanup rejection and browser credential boundaries.
- No operational support console or real-user admission was introduced.

### Dual-controlled registered-email replacement foundation completed

- Implemented the user-approved mailbox-loss recovery option through WP-065F and PR #69, merged as `2a5579101a04d801ef4383c9b2e8237766474b0e`.
- Limited the action to `mailbox_access_loss` cases with an approved WP-065E `approved_for_action` decision.
- Required the action requester to be the original decision proposer and the approver to be the independent decision reviewer.
- Required target-mailbox possession and manual identity-review evidence.
- Derived the Auth user from the approved case instead of accepting a caller-selected user ID.
- Stored only normalized SHA-256 current/target e-mail fingerprints in public records; added no plaintext e-mail columns.
- Added one-active-action protection, target-address collision checks, a two-hour approval window, three-attempt limit and thirty-day cooldown.
- Added idempotent claim, completion, failure containment and reconciliation when the Auth change succeeds before database finalization.
- Added internal Edge Function `execute-account-email-replacement`, which performs one server-side Auth e-mail update and requests a non-creating PKCE magic link for the new address.
- Added append-only action events and sanitized audit payloads.
- Denied ordinary-user read/invocation and denied direct service-role action/event writes.
- Added 58 pgTAP assertions covering privileges, two-person control, stale evidence, hashing, idempotency, collision protection, cooldown, completion and deletion-safe history.
- Added Deno type checking and a static privacy/security validator that rejects caller-selected account IDs, plaintext e-mail columns, raw-email logging, wildcard CORS, account creation/deletion and merge/password patterns.
- Protected staging migration run `30854571921` passed.
- Protected deployment/verifier run `30854641803` confirmed: action/event schema present, actions/events `0 / 0`, plaintext e-mail columns `0`, ordinary invocation denied, direct service writes denied, controlled functions and internal executor deployed, and merge/password/deletion functions absent.
- No remote e-mail replacement was executed because no disposable target mailbox is available; real-user support operation remains unauthorized.

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
- `approved_for_action` remains classification-only unless a separate action package such as WP-065F has also passed.

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

- Marked WP-035 complete for controlled proof and integrated product consumption.
- Marked WP-050 complete for the controlled persistent-service and integrated product slice.
- Marked WP-055 complete for the current backend proof scope.
- Marked WP-057 complete.
- Marked WP-058 complete for controlled provider cleanup.
- Marked WP-065A, WP-065B, WP-065D and WP-065E complete and remotely verified.
- Marked the WP-065F technical foundation complete and remotely verified while leaving controlled mailbox execution proof and operational activation pending.
- Marked WP-066 complete for controlled synthetic staging and promoted the product-facing account/recovery shell to canonical Cloudflare staging.
- Marked WP-067 complete for controlled synthetic staging after implementation PR #75, verifier repair PR #76 and canonical product run `30860701792`.
- Kept WP-065C blocked pending retention-policy, DPIA and operational approval.
- Advanced the roadmap to owner desktop/mobile field review, disposable-account product execution, mailbox-replacement proof, operational governance and closed-pilot readiness.
- Real-user admission remains unauthorized.

### Cloudflare Pages canonical staging

- Selected `https://rendezvue-private-preview.pages.dev/` as the sole canonical web-facing staging URL.
- Kept GitHub as the source of truth and Supabase as the Auth, PostgreSQL/RLS, private Storage, Realtime and Edge Function backend.
- Retired Hugging Face as an application host.
- Added Cloudflare-specific build metadata, security/no-store headers and protected Supabase configuration workflows.
- Added post-merge commit-matched production verification.
- Added fail-closed placeholder handling and a controlled production bootstrap from previously public validated browser configuration when native variables are absent.
- Strengthened production verification to assert the account shell, integrated product modules, synthetic portrait manifest/delivery and absence of privileged browser capabilities.

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

- Complete owner-led desktop/mobile field review of the integrated WP-067 journey and representative Dutch/English/faith terminology review.
- Execute onboarding, publication, discovery, matching, conversation, safety and cleanup through WP-067 with controlled disposable accounts when suitable mailboxes are available.
- Provide a disposable synthetic account and mailbox for the controlled WP-065F remote execution proof.
- Approve an operational identity-evidence policy and operator playbook; WP-065E/F remain technical contracts only.
- Build secure support tooling, old/new-address notification, objection, fraud, rollback and incident procedures before operational use.
- Keep duplicate-account merging and support password changes out of scope unless separately approved.
- Define operational retention-hold procedures.
- Approve retention periods, grace period, user notifications, DPIA alignment and operational ownership before WP-065C activation.
- Keep scheduled or automatic deletion disabled until synthetic dry-run, rollback and support procedures pass.
- Replace the transition Cloudflare bootstrap with direct Pages environment variables when operationally available.
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
