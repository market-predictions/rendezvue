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

The protected GitHub workflow sets and verifies:

- Site URL: `https://rendezvue-private-preview.pages.dev/`;
- redirect allow-list: exactly the same fixed URL.

The current free-tier project uses Supabase's default mail provider. Remote execution proved that this combination does not permit passwordless e-mail template modification. Numeric `{{ .Token }}` delivery is therefore unavailable without custom SMTP or a qualifying plan.

The proof uses the default magic link with PKCE:

1. request the link in the intended isolated browser profile;
2. open the newest link in that same browser profile;
3. Supabase redirects to Cloudflare with a one-time `?code=`;
4. the shared browser client exchanges the code for a session;
5. Rendezvue removes the consumed code from browser history.

The implicit flow is disabled. An application callback must never contain `#access_token=` or `#refresh_token=`.

## Deployment acceptance

Before browser testing, both must be green:

1. **Configure Cloudflare staging backend**
   - migrations linked and applied;
   - remote Auth/Data API health passed;
   - cleanup Edge Function deployed;
   - unauthenticated cleanup rejected;
   - Supabase Site URL and allow-list verified;
   - PKCE browser artifact and server-credential boundary passed.

2. **Verify Cloudflare Pages staging**
   - production `deployment.json` matches the merged commit;
   - canonical Cloudflare URL and hosting marker are correct;
   - PKCE magic-link interface is present;
   - implicit token fragments are disabled;
   - runtime configuration is `no-store`;
   - security headers are present;
   - no Hugging Face runtime reference remains.

## Opening the proof

Use two isolated browser profiles. Open the fixed Cloudflare URL directly in each profile. Use two controlled mailboxes and synthetic profile data only.

Do not send or paste:

- magic links or one-time authorization codes;
- access or refresh tokens;
- JWTs;
- publishable or secret keys;
- signed portrait URLs;
- private object paths;
- database credentials.

## Two-account proof protocol

### Authentication and persistence

1. Request a magic link for controlled mailbox A in browser profile A.
2. Request a magic link for controlled mailbox B in browser profile B.
3. Open each newest magic link in the same browser profile that requested it.
4. Confirm the one-time `?code=` is exchanged and removed from the address bar.
5. Confirm no access or refresh token appears in the URL fragment.
6. Reload both sessions and confirm session recovery.
7. Sign out globally and sign in once for each account.

### Profiles and privacy

8. Save a synthetic woman profile for one account and a synthetic man profile for the other.
9. Save eligibility, life stage, family context, faith/lifestyle, two prompts and at least three interests.
10. Upload distinct synthetic privacy portraits.
11. Resume each onboarding snapshot after reload.
12. Confirm drafts and private family/faith data are never visible cross-account.
13. Publish both profiles through the server-side publication action.
14. Confirm each account discovers only the derived opposite-sex eligible profile plus appropriate seeded synthetic profiles.

### Matching and contact

15. Like from account A; confirm account B cannot inspect an incoming-like record.
16. Like reciprocally from account B.
17. Confirm exactly one active match.
18. Claim the proof contact right twice before opening and confirm the same entitlement is returned.
19. Open the conversation and confirm the entitlement becomes consumed.
20. Retry opening and confirm the same conversation ID is returned.
21. Confirm no second entitlement can be created after consumption.

### Realtime and safety

22. Exchange messages and confirm realtime delivery in both directions.
23. Load the matched privacy portrait through a short-lived signed URL.
24. Confirm non-participants and ended/blocked matches cannot access messages or portraits.
25. Submit private feedback and a synthetic safety report; confirm no public rating or moderation detail appears.
26. End contact and confirm messages, signals and portrait access stop.
27. Repeat the block path with fresh synthetic accounts or reset proof data.

### Cleanup

28. Use the authenticated cleanup control for each proof account.
29. Enter `DELETE_SYNTHETIC_ACCOUNT` exactly.
30. Confirm private objects are removed before the Auth account.
31. Confirm relational rows cascade and retained audit identifiers are anonymized.
32. Confirm deleted accounts can no longer authenticate.

## Stop conditions

Stop immediately if:

- production `deployment.json` does not match the accepted GitHub commit;
- the Pages artifact contains a server credential;
- the Supabase Site URL or allow-list points somewhere other than the canonical Pages URL;
- a magic link opens in a different browser profile and the PKCE verifier is unavailable;
- an access or refresh token appears in an application URL;
- a consumed PKCE code remains in browser history after successful exchange;
- a draft or private record is readable cross-account;
- a storage object is readable without ownership or an active match;
- ended or blocked contact retains message or portrait access;
- cleanup accepts a browser-supplied user ID or deletes Auth before failed object cleanup is resolved;
- migrations diverge from GitHub history;
- real-user admission becomes enabled.
