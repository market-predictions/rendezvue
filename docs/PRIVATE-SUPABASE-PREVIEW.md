# Private Supabase preview runbook

**Status:** remote migrations and platform health proven; controlled two-account proof pending.  
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
- repository migrations: applied through protected workflow run #7;
- remote Auth health: passed;
- remote Data API metadata: passed;
- public Hugging Face connection: none.

The repository uses its own protected GitHub Actions deployment workflow. A direct Supabase GitHub production integration is not required for this proof.

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

## 5. Download and run the private proof interface

Open successful workflow run #7 and download its single artifact before the three-day retention expires. Extract it locally.

From the directory containing `dist-private-preview` run:

```bash
python3 -m http.server 4174 --directory dist-private-preview
```

Open:

`http://127.0.0.1:4174/`

The proof harness supports:

- requesting a magic link;
- restoring and ending a session;
- writing synthetic eligibility, identity, life-stage, family and faith records;
- transactionally saving two prompts and three or more interests;
- resuming an owner-only onboarding snapshot;
- uploading a synthetic private privacy portrait under the account UUID prefix;
- publishing through the server-side publication gate;
- loading opposite-sex eligible discovery;
- recording a server-authoritative like;
- loading participant-visible matches.

## 6. Two-account proof protocol

Use two controlled mailboxes and two isolated browser profiles. Do not use real dating-profile data.

1. Open the private preview in browser profile A and request a magic link for controlled mailbox A.
2. Open the private preview in browser profile B and request a magic link for controlled mailbox B.
3. Complete each callback in its corresponding browser profile.
4. Reload both sessions and confirm session recovery.
5. Save a synthetic woman profile for one account and a synthetic man profile for the other.
6. Save eligibility, life stage, family context, faith/lifestyle, two prompts and at least three interests.
7. Upload synthetic privacy portraits.
8. Resume each onboarding snapshot after a reload.
9. Publish both profiles through the server-side publication action.
10. Confirm each account sees only the derived opposite-sex eligible discovery candidate.
11. Confirm neither account can read the other account's draft eligibility, family, faith or object path data.
12. Like reciprocally.
13. Confirm exactly one match exists for both accounts.
14. Sign out and sign back in to confirm the match remains persistent.

Stop immediately if any private draft data or storage object is visible cross-account.

## 7. Follow-on interaction proof

The current harness proves through match inspection. The next repository slice must add or expose:

- administrative creation of synthetic pilot contact entitlements;
- participant-only conversation opening;
- realtime text messaging between the two controlled accounts;
- block and report actions;
- end-contact private feedback;
- signed portrait delivery;
- provider-side portrait deletion;
- account deletion and relational/object cleanup evidence.

No payment provider is involved in this proof.

## 8. Evidence to retain

Record in issue #21 and the governance documents:

- workflow run number and commit SHA;
- migration result;
- Auth/Data API health result;
- private artifact credential-scan result;
- magic-link delivery and callback result;
- session recovery result;
- two-account publication result;
- RLS negative checks;
- match count of exactly one;
- private object upload/access result;
- deletion cleanup result.

Do not paste email magic links, JWTs, access tokens, database passwords or API secret keys into issues, screenshots or chat.

## 9. Rollback and stop conditions

Stop the proof immediately if:

- a service/secret key appears in browser source or network configuration;
- a draft profile or private family/faith record is readable cross-account;
- an unapproved account can sign in;
- storage objects are accessible outside their owner UUID prefix;
- migrations diverge from GitHub history;
- the public Hugging Face pilot switches away from `local-demo`.

Database rollback must be performed through a new reviewed migration. Do not edit remote schema manually except for emergency containment, and document any emergency change before reconciling it back into GitHub.
