# Cloudflare Pages staging proof runbook

**Status:** Cloudflare migration implementation active; controlled two-account browser execution pending.  
**Scope:** synthetic adult proof accounts only. No real-user admission.

## Canonical architecture

- source of truth: `market-predictions/rendezvue` on GitHub;
- web-facing staging: `https://rendezvue-private-preview.pages.dev/`;
- backend: Supabase project `RendezvueProject`;
- region: West EU (Ireland);
- persistence: PostgreSQL/RLS, private Storage, Realtime and Edge Functions;
- local runtime: none;
- Hugging Face: retired, non-canonical and not used for acceptance.

## Cloudflare Pages project settings

The connected Pages project must use:

- project: `rendezvue-private-preview`;
- production branch: `main`;
- build command: `npm run build:cloudflare`;
- build output directory: `dist-private-preview`;
- environment variable `SUPABASE_URL`;
- environment variable `SUPABASE_PUBLISHABLE_KEY` using `sb_publishable_...`.

Never configure a Supabase secret/service-role key, database password or personal access token in the browser build.

## Supabase Auth configuration

The protected GitHub workflow sets:

- Site URL: `https://rendezvue-private-preview.pages.dev/`;
- redirect allow-list: exactly the same fixed URL;
- passwordless e-mail content: numeric `{{ .Token }}`;
- no `{{ .ConfirmationURL }}` magic-link callback.

The browser verifies the code with `verifyOtp({ type: 'email' })`. Automatic session detection in URL parameters/fragments is disabled. Old `?code=` and `#access_token=` URLs are ignored and removed from history.

## Deployment acceptance

Before browser testing, both must be green:

1. **Configure Cloudflare staging backend**
   - migrations linked and applied;
   - remote Auth/Data API health passed;
   - cleanup Edge Function deployed;
   - unauthenticated cleanup rejected;
   - Supabase Site URL, allow-list and OTP template verified;
   - browser/server credential boundary passed.

2. **Verify Cloudflare Pages staging**
   - production `deployment.json` matches the merged commit;
   - canonical Cloudflare URL and hosting marker are correct;
   - e-mail OTP interface is present;
   - runtime configuration is `no-store`;
   - security headers are present;
   - no Hugging Face runtime reference remains.

## Opening the proof

Use two isolated browser profiles. Open the fixed Cloudflare URL directly in each profile. Use two controlled mailboxes and synthetic profile data only.

Do not send or paste:

- e-mail OTP codes;
- access or refresh tokens;
- JWTs;
- publishable or secret keys;
- signed portrait URLs;
- private object paths;
- database credentials.

## Two-account proof protocol

### Authentication and persistence

1. Request an e-mail code for controlled mailbox A in browser profile A.
2. Request an e-mail code for controlled mailbox B in browser profile B.
3. Enter each newest numeric code in its corresponding open Cloudflare tab.
4. Reload both sessions and confirm session recovery.
5. Sign out and sign in once for each account.
6. Confirm no access or refresh token appears in the address bar.

### Profiles and privacy

7. Save a synthetic woman profile for one account and a synthetic man profile for the other.
8. Save eligibility, life stage, family context, faith/lifestyle, two prompts and at least three interests.
9. Upload distinct synthetic privacy portraits.
10. Resume each onboarding snapshot after reload.
11. Confirm drafts and private family/faith data are never visible cross-account.
12. Publish both profiles through the server-side publication action.
13. Confirm each account discovers only the derived opposite-sex eligible profile plus appropriate seeded synthetic profiles.

### Matching and contact

14. Like from account A; confirm account B cannot inspect an incoming-like record.
15. Like reciprocally from account B.
16. Confirm exactly one active match.
17. Claim the proof contact right twice before opening and confirm the same entitlement is returned.
18. Open the conversation and confirm the entitlement becomes consumed.
19. Retry opening and confirm the same conversation ID is returned.
20. Confirm no second entitlement can be created after consumption.

### Realtime and safety

21. Exchange messages and confirm realtime delivery in both directions.
22. Load the matched privacy portrait through a short-lived signed URL.
23. Confirm non-participants and ended/blocked matches cannot access messages or portraits.
24. Submit private feedback and a synthetic safety report; confirm no public rating or moderation detail appears.
25. End contact and confirm messages, signals and portrait access stop.
26. Repeat the block path with fresh synthetic accounts or reset proof data.

### Cleanup

27. Use the authenticated cleanup control for each proof account.
28. Enter `DELETE_SYNTHETIC_ACCOUNT` exactly.
29. Confirm private objects are removed before the Auth account.
30. Confirm relational rows cascade and retained audit identifiers are anonymized.
31. Confirm deleted accounts can no longer authenticate.

## Stop conditions

Stop immediately if:

- production `deployment.json` does not match the accepted GitHub commit;
- the Pages artifact contains a server credential;
- the Supabase Site URL or allow-list points somewhere other than the canonical Pages URL;
- an access or refresh token appears in an application URL;
- a draft or private record is readable cross-account;
- a storage object is readable without ownership or an active match;
- ended or blocked contact retains message or portrait access;
- cleanup accepts a browser-supplied user ID or deletes Auth before failed object cleanup is resolved;
- migrations diverge from GitHub history;
- real-user admission becomes enabled.
