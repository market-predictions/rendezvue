# WP-075 — Cross-browser passwordless sign-in with email OTP

**Status:** `BLOCKED_EXTERNAL_SMTP_OR_PLAN`; browser/client implementation merged and independently assured; hosted activation not complete  
**Priority:** P1 — Rendezvue real-user readiness  
**Issue:** #121  
**Release-truthfulness repair:** issue #136 / PR #137  
**Sequence:** before WP-080 closed-city pilot authorization  
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

## Intended design contract

WP-075 is designed to make e-mail OTP/code entry the primary browser-independent sign-in path while retaining the existing direct sign-in link as a secondary convenience.

1. The participant opens Rendezvue in the browser or device they want to use.
2. They enter the e-mail address and request a sign-in code or explicitly choose new-account registration.
3. Supabase sends one passwordless e-mail containing a six-digit `{{ .Token }}` and a secondary `{{ .ConfirmationURL }}` direct sign-in link.
4. The participant enters the code in the browser they chose. `verifyOtp({ email, token, type: 'email' })` establishes that browser's own session without requiring the PKCE verifier from another browser.
5. The code and direct link represent alternate uses of the same one-time proof; once one is consumed, the participant must request a new proof before using the other route.
6. Session persistence, global sign-out, account deletion and support/recovery semantics continue to work as before.

## Implemented browser/client foundation

The repository contains and tests:

- `requestExistingAccountEmailOtp` with `shouldCreateUser: false`;
- explicit registration as the only request path that may create a user;
- `verifyEmailOtp` using Supabase e-mail OTP verification;
- Dutch/English six-digit OTP UX;
- resend, invalid/expired/used-code handling;
- mobile numeric input and `autocomplete="one-time-code"`;
- no password path;
- no copied access token, refresh token, cookie or session material between browsers;
- browser-local `persistSession` semantics.

The browser/client candidate passed exact-head validation and independent assurance before merge. This proves implementation readiness, not hosted e-mail delivery.

## Hosted Auth configuration blocker

The protected staging pipeline can reach the Supabase Management API and the repository contains the desired bilingual template plus six-digit / ten-minute local policy.

Post-merge evidence isolated the remaining external dependency:

- browser/client implementation merged through PR #132;
- transactional hosted-configuration repair merged through PR #133 as main `dd7b981e24fb567e55fdc5750b0dc4af16d727ce` after fresh independent PASS;
- protected run `31264468858` attempted the repository-controlled passwordless template and Supabase rejected the template field with HTTP 400:
  `Email template modification is not available for free tier projects using the default email provider. Please upgrade your plan or configure a custom SMTP provider.`
- no existing SMTP/Resend/Postmark/SendGrid/SES integration is present in the Rendezvue repository;
- hosted Auth therefore still uses the legacy default-provider magic-link template, which does not expose `{{ .Token }}`.

The required external dependency is one of:

1. configure a suitable custom SMTP provider for the Supabase project; or
2. explicitly authorize a Supabase provider/plan change that permits template customization.

Neither expenditure nor third-party provider commitment is implicitly authorized.

## Canonical activation rule

A merged implementation must not be presented as an active hosted feature before the provider can actually deliver it.

Issue #136 / PR #137 therefore introduces a repository-controlled activation contract:

- `config/wp075-email-otp-activation.json` is authoritative for whether hosted OTP delivery is proven;
- while `hostedDeliveryReady=false`, canonical staging keeps **PKCE magic link** as the active passwordless path;
- the OTP controller remains in source but is **not loaded** by the canonical artifact;
- deployment metadata separately records implementation presence, desired OTP parameters and actual hosted readiness;
- only a future independently assured repository change after successful hosted template/read-back evidence may set OTP active;
- branch-preview auth-free visual acceptance may remain available without implying hosted availability.

This is a fail-safe activation boundary, not a rollback of the WP-075 design.

## Product UX when hosted OTP is eventually active

The activated UI will expose:

- a large numeric six-digit input;
- `autocomplete="one-time-code"`;
- mobile numeric keyboard via `inputmode="numeric"`;
- explicit verification;
- resend;
- Dutch/English parity;
- mobile/coarse-pointer sizing;
- the direct magic link as convenience rather than as the only usable path.

Until hosted activation is proven, canonical staging must not present this code path as available.

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
12. Independent `governance_release_assurance` issues `PASS` on every repaired/activation candidate before its main-branch mutation is executed.
13. While acceptance criterion 11 is not met, canonical staging must truthfully remain on the working PKCE magic-link path and must not load the OTP controller.

## Evidence plan

Completion evidence must include:

- exact source commit and PR;
- unit/integration tests for auth adapter and account UX;
- generated/static artifact validation;
- Supabase/Auth configuration source and hosted read-back evidence;
- canonical Cloudflare delivery evidence;
- controlled synthetic cross-browser proof;
- regression evidence for existing account lifecycle and recovery contracts;
- independent assurance on the activation candidate;
- post-action confirmation that the hosted e-mail actually contains and accepts the six-digit token.

## Current gate

WP-075 is **not** `OUTCOME_CONFIRMED`.

The browser/client implementation exists and has been independently assured, but hosted code delivery is blocked by the current Supabase Free/default-provider restriction. Canonical staging therefore remains on PKCE magic-link authentication until custom SMTP or an explicitly authorized provider/plan change makes template customization executable and the complete hosted/read-back/two-browser proof passes.

Real-user admission remains unauthorized throughout.
