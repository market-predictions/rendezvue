# WP-075 — Cross-browser passwordless sign-in with email OTP

**Status:** post-merge hosted-configuration repair in progress  
**Priority:** P1 — Rendezvue real-user readiness  
**Issue:** #121  
**Sequence:** after WP-077/078/079 closeout; before WP-080 closed-city pilot authorization  
**Implementation role:** `implementation_operations`  
**Independent assurance:** `governance_release_assurance`

## Observation

Rendezvue historically used Supabase PKCE magic-link authentication. The browser profile that requests the link owns the local PKCE verifier. When an e-mail client opens the received link in another default browser, the intended browser does not receive a session.

The previous product copy explained that a magic link should be opened in the same browser profile. That is technically correct, but it places browser/authentication mechanics on the participant and is not strong enough for an ordinary customer-facing login experience.

## Impact

A participant can create or access a Rendezvue account successfully and still appear logged out when they intentionally open Rendezvue in another browser or device. Because Rendezvue intentionally has no password, the user may reasonably conclude that there is no way to access the existing account in the desired browser.

This is a usability and access-continuity defect for real-user readiness, not a reason to weaken browser session isolation.

## Governing principle

Rendezvue remains passwordless and device/browser sessions remain isolated. Authentication in a new browser requires fresh proof of mailbox access, but that proof must not depend on the mail client opening a link in that same browser.

## Implemented design contract

WP-075 makes e-mail OTP/code entry the primary browser-independent sign-in path while retaining the existing direct sign-in link as a secondary convenience.

1. The participant opens Rendezvue in the browser or device they want to use.
2. They enter the e-mail address and request a sign-in code or explicitly choose new-account registration.
3. Supabase sends one passwordless e-mail containing a six-digit `{{ .Token }}` and a secondary `{{ .ConfirmationURL }}` direct sign-in link.
4. The participant enters the code in the browser they chose. `verifyOtp({ email, token, type: 'email' })` establishes that browser's own session without requiring the PKCE verifier from another browser.
5. The code and direct link represent alternate uses of the same one-time proof; once one is consumed, the participant must request a new proof before using the other route.
6. Session persistence, global sign-out, account deletion and support/recovery semantics continue to work as before.

## Implementation boundaries

- `requestExistingAccountEmailOtp` retains `shouldCreateUser: false`.
- Registration is a separate explicit request and is the only OTP request path that may set `shouldCreateUser: true`.
- `verifyEmailOtp` accepts a normalized six-digit code and uses Supabase e-mail OTP verification.
- The product request response remains generic whether an address is unknown, delivery fails or the provider rate-limits the request.
- Invalid/expired/used-code feedback is actionable only after the participant supplies a code and does not disclose account existence.
- No password sign-in or password-reset UX is introduced.
- No access token, refresh token, cookie or session material is copied between browsers.
- `persistSession: true` remains browser-local; each browser authenticates independently.
- Real-user admission remains unauthorized.

## Hosted Auth configuration

The protected staging pipeline holds a Supabase Management API access token. WP-075 therefore manages the hosted e-mail template and OTP policy in-repository instead of requiring a manual dashboard step.

Repository contract:

- `supabase/templates/magic-link.html` — bilingual code-first passwordless template containing both `{{ .Token }}` and `{{ .ConfirmationURL }}`;
- six-digit OTP;
- ten-minute expiry;
- `.github/workflows/configure-wp075-email-otp.yml` — applies and reads back the hosted Auth configuration on `main`;
- local `supabase/config.toml` mirrors the same OTP length, expiry and template for reproducible local validation.

The template states explicitly that the code and direct link are alternatives and that consuming one invalidates the other one-time proof.

### Post-merge configuration incident and repair

The original candidate `75f6a05d8d915f46b2b4fddaf98a628e61bbce50` passed exact-head CI/full validation and independent pre-action assurance, then merged through PR #132 as main `9d5cdd67229183a65db29ac12408a0c817f8f78c`.

The first protected hosted-configuration run `31263692183` reached the Supabase Management API with valid protected credentials but its combined four-field PATCH returned HTTP 400. The workflow therefore did **not** claim hosted configuration success.

A temporary read-only diagnostic run `31263802570` established the pre-repair hosted state without exposing secrets or the full Auth configuration:

- `mailer_otp_length = 8`;
- `mailer_otp_exp = 3600`;
- magic-link subject = `Your sign-in link`;
- current magic-link template contains `{{ .ConfirmationURL }}` but not `{{ .Token }}` or the WP-075 marker.

This confirms that the hosted project remains on its pre-WP-075 passwordless-email configuration and that the failure is in the platform configuration action rather than browser/client code. Local clean-stack validation already accepts the repository's six-digit / 600-second OTP configuration and template.

The repair changes the hosted mutation from one combined PATCH to a transaction-like sequence:

1. read the current four target values;
2. PATCH one field at a time;
3. read each field back immediately;
4. on any failure, restore already-applied fields to the observed pre-state in reverse order;
5. emit only sanitized Management API error keys (`code`, `error`, `message`, `msg`, `details`) and never dump the raw Auth configuration;
6. after all writes succeed, perform a separate final GET/read-back verification.

The temporary branch-only diagnostic workflow is not part of the durable repair candidate.

## Product UX

The Cloudflare artifact commit-pins `email-otp-controller.js`. The controller takes over the existing passwordless request form at capture phase, while the previous magic-link handler remains a fail-safe if the module does not load.

After a neutral request response, the UI exposes:

- a large numeric six-digit input;
- `autocomplete="one-time-code"`;
- mobile numeric keyboard via `inputmode="numeric"`;
- explicit verification;
- resend;
- Dutch/English parity;
- mobile/coarse-pointer sizing.

A branch-preview-only auth-free visual acceptance route is generated at `visual-acceptance/wp075-email-otp.html`.

## Non-goals

- Automatic propagation of an authenticated session between browsers or devices.
- Shared cookies, copied refresh tokens or weakened browser isolation.
- Password authentication or password-reset flows.
- Account merging.
- Changes to the mailbox-loss support replacement foundation except compatibility regression coverage.
- Real-user admission.

## Acceptance criteria

1. An existing participant can authenticate in browser B by proving mailbox access without first completing the PKCE exchange in browser A.
2. A participant can deliberately ignore the direct link and enter the one-time code in the intended browser/device.
3. Existing-account sign-in cannot silently create a new account.
4. Registration remains a separate explicit action.
5. Invalid, expired, reused and resend states are understandable and do not disclose whether an address belongs to a Rendezvue account.
6. Dutch and English customer-facing copy is complete and does not expose provider or PKCE terminology.
7. Existing session restoration, global sign-out, deletion and support/recovery regression tests remain green.
8. Controlled staging demonstrates separate authenticated sessions in two browser profiles/devices for the same synthetic account only after each browser performs its own authentication proof.
9. No browser receives another browser's session material automatically.
10. Canonical Cloudflare staging verification is commit-matched and green.
11. Hosted Supabase Auth configuration is read back and proves six-digit/ten-minute OTP plus the repository-controlled code/link template.
12. Independent `governance_release_assurance` issues `PASS` on every repaired candidate before its main-branch mutation is executed.

## Evidence plan

Implementation evidence includes:

- exact source commit and PR;
- unit/integration tests for auth adapter and account UX;
- generated/static artifact validation;
- Supabase/Auth configuration source and hosted read-back evidence;
- canonical Cloudflare delivery evidence;
- controlled synthetic cross-browser proof;
- regression evidence for existing account lifecycle and recovery contracts.

## Current gate

WP-075 is **not** `OUTCOME_CONFIRMED`. The browser/client implementation is merged, but the first hosted Auth configuration action failed safely. The immediate gate is a fresh exact-candidate validation and independent assurance of the transactional configuration repair. After that repair merges, completion still requires successful hosted field-by-field application/read-back, commit-matched canonical Cloudflare verification and a controlled two-browser mailbox proof. Real-user admission remains unauthorized throughout.
