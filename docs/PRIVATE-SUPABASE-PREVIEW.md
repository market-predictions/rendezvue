# Private Supabase preview runbook

**Status:** complete private harness deployed and packaged by workflow run #8; controlled two-account execution pending.  
**Scope:** synthetic adult proof accounts only. No real-user admission.

## 1. Environment boundary

Rendezvue has two deliberately separate web lanes:

1. `apps/web` → public Hugging Face concept pilot, always `local-demo`;
2. `apps/private-preview` → controlled Supabase proof harness, built only by the protected workflow.

The public build does not receive the Supabase URL or publishable key. The private artifact is not uploaded to Hugging Face and is retained by GitHub Actions for only three days.

## 2. Supabase project state

Private non-production project:

- project name: `RendezvueProject`;
- status: Healthy;
- region: West EU (Ireland);
- compute: Nano;
- complete repository migration set through commit `8400ebc70d02dc6393e00d48a7b02c9f808559cf`: applied by protected workflow run #8;
- remote Auth health: passed;
- remote Data API metadata: passed;
- authenticated cleanup Edge Function: deployed;
- unauthenticated cleanup rejection: passed;
- public Hugging Face connection: none.

## 3. Protected environment

GitHub environment:

`rendezvue-private-preview`

Configured environment secrets:

- `SUPABASE_PROJECT_REF`;
- `SUPABASE_ACCESS_TOKEN`;
- `SUPABASE_DB_PASSWORD`;
- `SUPABASE_URL`;
- `SUPABASE_PUBLISHABLE_KEY` using `sb_publishable_...`.

Configured environment variable:

- `RENDEZVUE_AUTH_REDIRECT_URL` = `http://127.0.0.1:4174/` for the first local proof.

The exact callback URL must also exist in Supabase Authentication → URL Configuration. Never place protected values in source, issues, screenshots or chat.

## 4. Successful protected deployment evidence

Workflow run **#8** on `main` commit `8400ebc70d02dc6393e00d48a7b02c9f808559cf` proved:

1. protected configuration validation passed;
2. repository migrations linked successfully;
3. pending migrations were applied;
4. remote migration state matched GitHub history;
5. Auth health passed;
6. Data API metadata passed;
7. `delete-private-proof-account` deployed;
8. unauthenticated cleanup requests were rejected;
9. the complete private proof artifact built successfully;
10. the artifact scan found no server credential material;
11. one short-lived GitHub Actions artifact was uploaded;
12. the public Hugging Face pilot remained unchanged;
13. real-user admission remained unauthorized.

The Node.js 20 annotation from `actions/upload-artifact@v4` is an upstream runner warning and did not affect the successful proof.

## 5. Download the current artifact

Open protected workflow run #8 and download its single artifact before the three-day retention expires. Do not use the older run #7 artifact.

The generated artifact must report:

- backend mode `supabase-proof`;
- `sharedBrowserAuthClient: true`;
- public pilot changed: false;
- contains server secrets: false.

## 6. Run the private proof interface

Extract the downloaded artifact locally. From the directory containing `dist-private-preview` run:

```bash
python3 -m http.server 4174 --directory dist-private-preview
```

Open:

`http://127.0.0.1:4174/`

The harness supports:

- requesting a magic link;
- restoring and ending a session;
- writing synthetic eligibility, identity, life-stage, family and faith records;
- transactionally saving two prompts and three or more interests;
- resuming an owner-only onboarding snapshot;
- uploading a synthetic private privacy portrait under the account UUID prefix;
- publishing through the server-side publication gate;
- loading opposite-sex eligible discovery;
- recording a server-authoritative like;
- loading participant-visible matches;
- claiming one synthetic proof contact right;
- idempotently opening one conversation;
- participant-only realtime text messages;
- loading the other active match participant's selected portrait through a five-minute signed URL;
- ending contact normally;
- blocking the other proof participant;
- submitting a private safety report;
- submitting private structured feedback without a public rating;
- authenticated account cleanup after exact confirmation.

The generated `app.js` owns the single Supabase Auth client. Onboarding, interaction and cleanup modules reuse that client so the PKCE callback is processed exactly once.

## 7. Two-account proof protocol

Use two controlled mailboxes and two isolated browser profiles. Do not use real dating-profile data.

### A. Authentication and persistence

1. Open the private preview in browser profile A and request a magic link for controlled mailbox A.
2. Open the private preview in browser profile B and request a magic link for controlled mailbox B.
3. Complete each callback in its corresponding browser profile.
4. Confirm no duplicate Auth-client or callback warning appears.
5. Reload both sessions and confirm session recovery.
6. Sign out and sign back in once for each account.

### B. Profiles and privacy

7. Save a synthetic woman profile for one account and a synthetic man profile for the other.
8. Save eligibility, life stage, family context, faith/lifestyle, two prompts and at least three interests.
9. Upload distinct synthetic privacy portraits.
10. Resume each onboarding snapshot after a reload.
11. Before publication, confirm neither account can discover the other draft.
12. Stop immediately if private family, faith, onboarding or object-path data becomes visible cross-account.
13. Publish both profiles through the server-side publication action.
14. Confirm each account sees only the derived opposite-sex eligible discovery candidate.

### C. Matching and contact entitlement

15. Like from account A only; confirm account B does not see an incoming-like record.
16. Like reciprocally from account B.
17. Confirm exactly one active match exists for both accounts.
18. Claim the proof contact right from one account.
19. Claim it again before opening; confirm the same entitlement is returned.
20. Open the conversation and confirm the entitlement becomes consumed.
21. Claim again after consumption; confirm no second entitlement is created.
22. Retry opening the same match; confirm the same conversation is returned.

### D. Realtime messages and matched portrait

23. Send a synthetic message from A and confirm it appears in B without a manual reload.
24. Reply from B and confirm it appears in A.
25. Confirm neither account can query a conversation in which it is not a participant.
26. Load the matched portrait through the signed URL control.
27. Confirm the URL is short-lived and the underlying bucket remains private.
28. Confirm a third non-matched controlled account receives no matched portrait path.

### E. Contact ending and safety

29. Submit private structured feedback and confirm no public star/count is created.
30. Submit a synthetic safety report and confirm moderation details remain hidden from ordinary accounts.
31. End contact normally and confirm match/conversation end, both signals are revoked, new messages fail and matched portrait access stops.
32. Repeat with a fresh pair or reset data, then block one participant and confirm match/conversation are frozen and portrait access stops.

## 8. Account and object cleanup proof

Perform cleanup only after all other evidence is retained.

For each authenticated proof account:

1. use the cleanup control in its own browser profile;
2. enter exact confirmation `DELETE_SYNTHETIC_ACCOUNT`;
3. confirm the request is made through the current authenticated session without a client-supplied user ID;
4. confirm the function reports success and an object count only, never paths or credentials;
5. confirm the local session is cleared;
6. confirm the account can no longer authenticate;
7. confirm UUID-scoped portrait objects are gone;
8. confirm profile, onboarding, match, conversation and message rows have cascaded;
9. confirm retained audit identifiers are anonymised.

If object deletion fails, the Auth account must remain intact and retryable. Do not manually delete the Auth account first, because that would undermine provider-cleanup evidence.

## 9. Evidence to retain

Record in issue #21 and governance documents:

- workflow run number and commit SHA;
- migration, function deploy and platform-health result;
- shared-client and private artifact credential-scan result;
- magic-link delivery, callback and session recovery result;
- two-account publication and RLS negative checks;
- match count of exactly one;
- entitlement count of exactly one before and after consumption;
- conversation ID stability on retry;
- realtime message and signed private object result;
- end-contact/block/report/feedback result;
- authenticated object/Auth/relational/audit cleanup result.

Do not paste email magic links, JWTs, access tokens, database passwords, publishable keys, signed portrait URLs, private object paths or API secret keys into issues, screenshots or chat.

## 10. Rollback and stop conditions

Stop the proof immediately if:

- a service/secret key appears in browser source or network configuration;
- more than one browser Auth client handles the callback;
- a draft profile or private family/faith record is readable cross-account;
- an unapproved account can sign in;
- storage objects are accessible without ownership or an active match;
- ended or blocked matches retain portrait or message access;
- a proof account can mint more than one proof contact entitlement;
- cleanup can target a user ID supplied by the browser;
- cleanup deletes the Auth account before failed object deletion is resolved;
- migrations diverge from GitHub history;
- the public Hugging Face pilot switches away from `local-demo`.

Database rollback must be performed through a new reviewed migration. Do not edit remote schema manually except for emergency containment, and document any emergency change before reconciling it back into GitHub.
