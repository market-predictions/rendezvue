# WP-057 completion evidence

**Completed:** 2026-08-03  
**Environment:** canonical Cloudflare Pages staging  
**Issue:** #41

## Outcome

The controlled two-account synthetic browser proof completed successfully for two isolated browser profiles and two controlled adult proof accounts.

Demonstrated end to end:

- same-browser-profile Supabase PKCE magic-link exchange for both accounts;
- callback consumption and authenticated session restoration;
- persistent onboarding and server-side publication of one synthetic woman and one synthetic man profile;
- opposite-sex discovery and exactly one reciprocal match;
- one proof contact entitlement and one conversation;
- Realtime messages in both directions without page refresh;
- active-match private portrait access;
- private structured feedback and safety-report submission;
- normal contact ending and a separate block path;
- server-authoritative revocation of new portrait access and message writes after the terminal transition;
- explicit global sign-out and re-authentication for both roles;
- authenticated provider cleanup of both proof accounts;
- removal of private portrait objects, Auth accounts and relational data;
- retained audit identifiers anonymised;
- no session restoration after cleanup in either browser profile.

## Cleanup defect and repair

The first cleanup attempt for account A returned a non-2xx Edge Function response. The account remained authenticated and retryable.

Root cause: `public.conversations.opened_by_user_id` referenced `auth.users(id)` with `ON DELETE RESTRICT`, which could block deletion of the account that opened the conversation before the match cascade removed that conversation.

PR #52 changed the foreign key to `ON DELETE CASCADE` and added a regression test covering an ended match, ended conversation, message and deletion of the conversation opener while preserving the other participant.

Accepted validation:

- CI and application/artifact validation passed;
- empty-database migration replay passed;
- pgTAP, concurrency, deterministic seed and schema lint passed;
- protected staging run `30805876163` applied the migration and redeployed the cleanup function;
- account A cleanup then succeeded;
- account B cleanup succeeded;
- both isolated browser profiles remained signed out after refresh.

## Security boundary

- only controlled synthetic adult accounts and mailboxes were used;
- no access token, refresh token, JWT, magic-link code, signed URL, private object path or server credential was recorded;
- the proof environment remains non-production;
- real-user admission remains unauthorized.

## Remaining work outside WP-057

- account recovery and duplicate-account controls;
- abandonment retention and scheduled cleanup;
- direct Cloudflare Pages environment-variable configuration instead of the transition bootstrap;
- mobile field review of the integrated Cloudflare UI and privacy portraits;
- production legal, privacy, moderation, age/liveness, payment and operational readiness.
