# Private Supabase preview runbook

**Status:** remote foundation proven; complete interaction artifact implemented; controlled two-account execution pending.  
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
- repository migrations through commit `9403330f`: applied by protected workflow run #7;
- remote Auth health: passed;
- remote Data API metadata: passed;
- public Hugging Face connection: none.

PR #25 adds a later synthetic-interaction migration. Generate a fresh protected artifact and apply migrations again after that PR is merged. Do not use the older run #7 artifact for the full interaction protocol.

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

Workflow run #7 on commit `9403330f` proved:

1. protected configuration validation passed;
2. repository migrations linked successfully;
3. pending migrations were applied;
4. remote migration state matched GitHub history;
5. Auth health passed;
6. Data API metadata passed;
7. the private proof artifact built successfully;
8. the artifact scan found no server credential material;
9. one short-lived GitHub Actions artifact was uploaded;
10. the public Hugging Face pilot remained unchanged;
11. real-user admission remained unauthorized.

The Node.js deprecation annotation from `actions/upload-artifact@v4` is an upstream runner warning and did not affect the successful proof.

## 5. Generate the current artifact

After PR #25 is merged:

1. open GitHub Actions;
2. select `Deploy private Supabase preview`;
3. choose `Run workflow` on `main`;
4. keep `apply_migrations` set to `true`;
5. wait until configuration, link, migration, Auth/Data API health, build, credential scan and artifact upload are green;
6. download the single artifact before its three-day retention expires.

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

The current proof harness supports:

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
- submitting private structured feedback without a public rating.

The generated `app.js` owns the single Supabase Auth client. The interaction module imports that same client so the PKCE callback is processed exactly once.

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
12. Attempt no direct access to the other account's private family, faith or portrait object path; any accidental visibility is a stop condition.
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
31. End contact normally and confirm:
    - match status becomes `ended`;
    - conversation status becomes `ended`;
    - both attraction signals are revoked in underlying state;
    - each user sees only its own attraction signal through RLS;
    - new messages are rejected;
    - matched portrait access stops.
32. Repeat the proof with a fresh pair or reset data, then block one participant and confirm match/conversation are frozen and portrait access stops.

Stop immediately if any private draft data, moderation data or unauthorized storage object is visible cross-account.

## 8. Account and object cleanup proof

The relational deletion trigger is locally validated, but provider object deletion still requires an orchestrated cleanup path. Until that code exists:

- do not treat deleting the Auth user alone as complete erasure evidence;
- manually record the private object paths used by the two synthetic accounts without exposing signed URLs;
- verify relational rows disappear after controlled account deletion;
- verify retained audit identifiers are anonymised;
- verify private storage objects are deleted through the approved provider cleanup operation;
- record the result in issue #21.

A later reviewed slice should automate object cleanup before the closed city pilot.

## 9. Evidence to retain

Record in issue #21 and governance documents:

- workflow run number and commit SHA;
- migration result;
- Auth/Data API health result;
- shared-client and private artifact credential-scan result;
- magic-link delivery and callback result;
- session recovery result;
- two-account publication result;
- RLS negative checks;
- match count of exactly one;
- entitlement count of exactly one before and after consumption;
- conversation ID stability on retry;
- realtime message result;
- signed private object access result;
- end-contact/block/report/feedback result;
- deletion cleanup result.

Do not paste email magic links, JWTs, access tokens, database passwords, publishable keys, signed portrait URLs or API secret keys into issues, screenshots or chat.

## 10. Rollback and stop conditions

Stop the proof immediately if:

- a service/secret key appears in browser source or network configuration;
- more than one browser Auth client handles the callback;
- a draft profile or private family/faith record is readable cross-account;
- an unapproved account can sign in;
- storage objects are accessible without ownership or an active match;
- ended or blocked matches retain portrait or message access;
- a proof account can mint more than one proof contact entitlement;
- migrations diverge from GitHub history;
- the public Hugging Face pilot switches away from `local-demo`.

Database rollback must be performed through a new reviewed migration. Do not edit remote schema manually except for emergency containment, and document any emergency change before reconciling it back into GitHub.
