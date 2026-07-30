# Private Supabase preview runbook

**Status:** project provisioned; protected configuration and first remote migration run pending.  
**Scope:** synthetic adult proof accounts only. No real-user admission.

## 1. Environment boundary

Rendezvue has two deliberately separate web lanes:

1. `apps/web` → public Hugging Face concept pilot, always `local-demo`;
2. `apps/private-preview` → controlled Supabase proof harness, built only by the protected workflow.

The public build does not receive the Supabase URL or publishable key. The private artifact is not uploaded to Hugging Face and is retained by GitHub Actions for only three days.

## 2. Supabase project state

Owner evidence received on 2026-07-31:

- project name: `RendezvueProject`;
- status: Healthy;
- region: West EU (Ireland);
- compute: Nano;
- no migrations applied yet;
- no repository connected in the Supabase dashboard.

The repository uses its own protected GitHub Actions deployment workflow. A direct Supabase GitHub production integration is therefore not required for this proof and should not be enabled casually.

## 3. GitHub protected environment

Create a repository environment named exactly:

`rendezvue-private-preview`

Recommended protection:

- required reviewer: repository owner;
- deployment branches: `main` only;
- prevent self-approval where available;
- no broad organization access.

Add these **environment secrets**:

| Name | Value | Browser-safe? |
|---|---|---:|
| `SUPABASE_PROJECT_REF` | project reference from the project URL or Connect dialog | no need to publish |
| `SUPABASE_ACCESS_TOKEN` | personal/organization access token for Supabase CLI deployment | no |
| `SUPABASE_DB_PASSWORD` | project database password | no |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` | yes, but kept private to this lane |
| `SUPABASE_PUBLISHABLE_KEY` | new `sb_publishable_...` key | yes |

Add this **environment variable**:

| Name | Initial controlled-proof value |
|---|---|
| `RENDEZVUE_AUTH_REDIRECT_URL` | `http://127.0.0.1:4174/` |

Never configure `SUPABASE_PUBLISHABLE_KEY` with `sb_secret_...`, a service-role key, database URL or access token. The workflow and build both reject server-secret material.

## 4. Supabase dashboard configuration

### API key

Use Settings → API Keys and create/copy a new publishable key with the `sb_publishable_` prefix. Do not use a secret key in the browser.

### Auth URL configuration

In Authentication → URL Configuration:

- Site URL for the first local proof: `http://127.0.0.1:4174/`;
- Redirect URLs: add the exact same URL;
- do not use a broad production wildcard for this proof.

The redirect must exactly match `RENDEZVUE_AUTH_REDIRECT_URL` used by the workflow artifact.

### Email delivery

Default Supabase email delivery may be used only for the first two controlled proof accounts. Before a wider pilot, configure a verified domain/custom SMTP, rate-limit expectations, abuse controls and operational monitoring.

## 5. First protected deployment

After PR merge, open GitHub → Actions → **Deploy private Supabase preview** → Run workflow.

Choose:

- branch: `main`;
- `apply_migrations`: true.

The workflow:

1. validates all protected values without printing them;
2. rejects secret keys in the browser-key slot;
3. confirms the project URL matches the project reference;
4. links the repository to the private project;
5. lists migration state;
6. applies pending migrations with `supabase db push`;
7. re-lists migration state;
8. checks remote Auth and Data API health;
9. builds the separate private proof interface;
10. scans the artifact for server credentials;
11. uploads a three-day GitHub Actions artifact.

## 6. Run the private proof interface

Download the workflow artifact and extract it locally. From the directory containing `dist-private-preview` run:

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

## 7. Two-account proof protocol

Use two controlled mailboxes and two isolated browser profiles.

1. Create account A and B through magic links.
2. Save a synthetic woman profile for one account and a synthetic man profile for the other.
3. Upload synthetic privacy portraits.
4. Publish both profiles.
5. Confirm each account sees only the derived opposite-sex discovery candidate.
6. Like reciprocally.
7. Confirm one match exists for both accounts.
8. Confirm neither account can read the other account's draft/private domains.
9. Continue with entitlement, realtime messaging, block/report and deletion proofs only after the required administrative seed/orchestration path is added.

## 8. Evidence to retain

Record in issue #18 or #21:

- workflow run ID and commit SHA;
- migration list before and after;
- Auth/Data API health result;
- two-account session and publication result;
- RLS negative checks;
- match ID count (exactly one);
- private object upload and access result;
- deletion cleanup result;
- confirmation that no secret key appeared in the browser artifact.

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
