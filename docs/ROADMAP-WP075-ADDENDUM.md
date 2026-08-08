# Rendezvue roadmap addendum — WP-075

**Date:** 2026-08-08  
**Roadmap scope:** Phase 2 authentication / real-user readiness  
**Work package:** WP-075 — Cross-browser passwordless sign-in with email OTP  
**Priority:** P1 within Rendezvue real-user-readiness work  
**Issue:** #121

## Roadmap decision

WP-075 is added to the Phase 2 production-readiness sequence because the current same-browser PKCE magic-link journey is technically sound for controlled proof but too fragile for ordinary participants whose mail client may open links in a different default browser.

Rendezvue will remain passwordless. The product must support fresh authentication in any intended browser or device through a short e-mail OTP/code, while retaining a magic-link action only as a convenience. Sessions remain isolated per browser/device and are never propagated automatically.

## Sequence

The immediate sequence is:

1. close the already-active WP-074B privacy portrait ladder and selected-card delivery package;
2. implement and independently assure WP-075 cross-browser passwordless OTP sign-in;
3. continue the consolidated owner account-to-conversation acceptance and controlled disposable-account field proof;
4. complete the remaining operational, legal, privacy, moderation, accessibility and security gates;
5. consider WP-080 closed-city pilot authorization only after all entry gates pass.

WP-075 therefore outranks ordinary product polish that assumes reliable account access, but it does not interrupt the current WP-074B closeout.

## Phase 2C extension — Authentication and Cloudflare deployment

Add to the Phase 2C required capabilities:

- browser-independent passwordless access via e-mail OTP/code;
- a participant can request authentication in browser B and complete it in browser B even when the e-mail link would otherwise open browser A;
- existing-account sign-in remains non-creating;
- registration remains separate and explicit;
- invalid, expired, reused and resend states remain privacy-safe and understandable;
- Dutch and English product copy avoids PKCE/provider terminology;
- each browser/device performs its own authentication proof and receives only its own session.

## Phase 3 entry-gate extension

Before real-user pilot authorization, WP-075 must be implementation-complete, canonically verified and independently assured. The pilot must not depend on participants understanding browser profiles or manually forcing an e-mail client to use a particular browser.

## Source of implementation detail

The authoritative package definition and acceptance criteria are in `docs/WP-075-CROSS-BROWSER-OTP-AUTH.md` and GitHub issue #121.
