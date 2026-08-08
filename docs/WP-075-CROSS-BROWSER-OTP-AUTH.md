# WP-075 — Cross-browser passwordless sign-in with email OTP

**Status:** planned  
**Priority:** P1 — Rendezvue real-user readiness  
**Issue:** #121  
**Sequence:** after WP-074B closeout; before WP-080 closed-city pilot authorization  
**Implementation role:** `implementation_operations`  
**Independent assurance:** `governance_release_assurance`

## Observation

Rendezvue currently uses Supabase PKCE magic-link authentication. The browser profile that requests the link owns the local PKCE verifier. When an e-mail client opens the received link in another default browser, the intended browser does not receive a session.

The current product copy explains that a magic link should be opened in the same browser profile. That is technically correct, but it places browser/authentication mechanics on the participant and is not strong enough for an ordinary customer-facing login experience.

## Impact

A participant can create or access a Rendezvue account successfully and still appear logged out when they intentionally open Rendezvue in another browser or device. Because Rendezvue intentionally has no password, the user may reasonably conclude that there is no way to access the existing account in the desired browser.

This is a usability and access-continuity defect for real-user readiness, not a reason to weaken browser session isolation.

## Governing principle

Rendezvue remains passwordless and device/browser sessions remain isolated. Authentication in a new browser must require fresh proof of mailbox access, but that proof must not depend on the mail client opening a link in that same browser.

## Required outcome

Make e-mail OTP/code entry the primary browser-independent sign-in path while retaining magic-link opening as a convenience where safe.

Target product flow:

1. The participant opens Rendezvue in the browser or device they want to use.
2. They enter the registered e-mail address and request sign-in.
3. Rendezvue sends a passwordless e-mail containing a short one-time code and, where appropriate, a direct magic-link action.
4. If the direct link opens the wrong/default browser, the participant returns to the intended browser and enters the code.
5. Successful OTP verification establishes a session in that browser for the existing Rendezvue account.
6. Session persistence, global sign-out, account deletion and support/recovery semantics continue to work as before.

## Scope

- Supabase passwordless e-mail OTP request and verification compatible with the existing Auth architecture.
- Product-facing OTP/code entry state in Dutch and English.
- Separate explicit flows for existing-account sign-in and new-account registration.
- Existing-account access remains fail-closed and must not create a user implicitly.
- Preserve generic, non-enumerating request responses.
- Preserve privacy-safe error handling for invalid, expired, consumed and rate-limited codes.
- Preserve persistent per-browser sessions and existing global sign-out semantics.
- Retain magic links as a convenience/fallback where they do not undermine the OTP path.
- Regression coverage for request, verification, expiry, reuse, invalid code, resend and session restoration.
- Controlled cross-browser staging verification with synthetic adult accounts.
- Documentation and user-facing recovery guidance updated so users no longer need to understand PKCE or browser profiles.

## Non-goals

- Automatic propagation of an authenticated session between browsers or devices.
- Shared cookies, copied refresh tokens or weakened browser isolation.
- Password authentication or password-reset flows.
- Account merging.
- Changes to the mailbox-loss support replacement foundation except where compatibility requires explicit regression coverage.
- Real-user admission.

## Acceptance criteria

1. An existing participant can authenticate in browser B by proving mailbox access without first completing the PKCE exchange in browser A.
2. A direct e-mail link opening in the wrong/default browser does not block access to the intended browser because the participant can enter the one-time code there.
3. Existing-account sign-in cannot silently create a new account.
4. Registration remains a separate explicit action.
5. Invalid, expired, reused and resend states are understandable and do not disclose whether an address belongs to a Rendezvue account.
6. Dutch and English customer-facing copy is complete and does not expose provider or PKCE terminology.
7. Existing session restoration, global sign-out, deletion and support/recovery regression tests remain green.
8. Controlled staging demonstrates separate authenticated sessions in two browser profiles/devices for the same synthetic account only after each browser performs its own authentication proof.
9. No browser receives another browser's session material automatically.
10. Canonical Cloudflare staging verification is commit-matched and green.
11. Independent `governance_release_assurance` issues `PASS` before the implementation is declared complete.

## Evidence plan

Implementation evidence should include:

- exact source commit and PR;
- unit/integration tests for auth adapter and account UX;
- generated/static artifact validation;
- Supabase/Auth configuration evidence relevant to OTP templates and expiry;
- canonical Cloudflare delivery evidence;
- controlled synthetic cross-browser proof;
- regression evidence for existing account lifecycle and recovery contracts.

## Priority rationale

`P1` is project-local, not a change to Rendezvue's cross-project Control ranking. WP-075 directly affects successful account access for normal users and therefore belongs before WP-080 pilot authorization. It should not interrupt the already-active WP-074B closeout, but it should precede lower-priority pilot polish that assumes reliable sign-in.

## Definition of done

WP-075 is done only when the browser-independent OTP path is implemented, verified on canonical staging, regression-safe, documented and independently assured. Creating this planning package or configuring an e-mail template alone is not completion.
