# Private Supabase preview runbook

**Status:** remote Supabase foundation and cleanup are deployed; private Hugging Face hosting is being introduced; controlled two-account execution remains pending.  
**Scope:** synthetic adult proof accounts only. No real-user admission.

## Architecture boundary

Rendezvue has two separate hosted lanes:

1. `apps/web` → public Hugging Face concept pilot, always `local-demo`;
2. `apps/private-preview` → private Hugging Face Static Space connected to the non-production Supabase project.

GitHub is the sole source of truth. Nothing is built, served or tested on the owner's computer. GitHub Actions builds both lanes and deploys them independently.

## Private environment

- Supabase project: `RendezvueProject`;
- region: West EU (Ireland);
- compute: Nano;
- private Space ID: `solidprivacy/rendezvue-private-preview`;
- private browser URL: `https://solidprivacy-rendezvue-private-preview.static.hf.space/`;
- access: Hugging Face owner and explicitly authorized collaborators only;
- public Space: remains `solidprivacy/rendezvue` in `local-demo` mode.

The private Space contains only browser-safe configuration: the Supabase project URL and publishable key. Database passwords, personal access tokens, service-role keys and Hugging Face write tokens remain in protected GitHub secrets and are never uploaded to the browser artifact.

## Protected deployment workflow

Run **Deploy private Supabase preview** on `main` with `apply_migrations=true`.

The workflow:

1. validates the protected GitHub environment;
2. links and applies repository migrations;
3. deploys the authenticated account-cleanup Edge Function;
4. configures Supabase Auth Site URL and redirect allow-list for the private Hugging Face HTTPS callback;
5. checks Auth and Data API health;
6. validates unauthenticated cleanup rejection;
7. builds and scans the private browser artifact;
8. creates or confirms a private Static Space;
9. uploads the complete artifact;
10. verifies private visibility and deployed repository metadata;
11. leaves the public Hugging Face pilot unchanged.

No local Git, Node, Python, Docker, PowerShell server, downloaded workflow artifact or localhost callback is part of this route.

## Opening the proof

Sign into the authorized Hugging Face account and open the private Space from the Hugging Face Spaces dashboard. A visitor without repository access must receive no access to either the source or the running application.

Use two isolated browser profiles that are each signed into an authorized Hugging Face account. Within the application use two controlled email inboxes and synthetic profile data only.

## Two-account proof protocol

### Authentication and persistence

1. Request a magic link for controlled mailbox A in browser profile A.
2. Request a magic link for controlled mailbox B in browser profile B.
3. Complete each callback in its corresponding browser profile.
4. Reload both sessions and confirm session recovery.
5. Sign out and sign in once for each account.

### Profiles and privacy

6. Save a synthetic woman profile for one account and a synthetic man profile for the other.
7. Save eligibility, life stage, family context, faith/lifestyle, two prompts and at least three interests.
8. Upload distinct synthetic privacy portraits.
9. Resume each onboarding snapshot after reload.
10. Confirm drafts and private family/faith data are never visible cross-account.
11. Publish both profiles through the server-side publication action.
12. Confirm each account discovers only the derived opposite-sex eligible profile.

### Matching and contact

13. Like from account A; confirm account B cannot inspect an incoming-like record.
14. Like reciprocally from account B.
15. Confirm exactly one active match.
16. Claim the proof contact right twice before opening and confirm the same entitlement is returned.
17. Open the conversation and confirm the entitlement becomes consumed.
18. Retry opening and confirm the same conversation ID is returned.
19. Confirm no second entitlement can be created after consumption.

### Realtime and safety

20. Exchange messages and confirm realtime delivery in both directions.
21. Load the matched privacy portrait through a short-lived signed URL.
22. Confirm non-participants and ended/blocked matches cannot access messages or portraits.
23. Submit private feedback and a synthetic safety report; confirm no public rating or moderation detail appears.
24. End contact and confirm messages, signals and portrait access stop.
25. Repeat the block path with fresh synthetic accounts or reset proof data.

### Cleanup

26. Use the authenticated cleanup control for each proof account.
27. Enter `DELETE_SYNTHETIC_ACCOUNT` exactly.
28. Confirm private objects are removed before the Auth account.
29. Confirm relational rows cascade and retained audit identifiers are anonymized.
30. Confirm deleted accounts can no longer authenticate.

## Stop conditions

Stop immediately if:

- the private Space is public or protected instead of private;
- a server credential appears in browser source or network configuration;
- an unauthorized Hugging Face user can open the private application;
- a draft or private record is readable cross-account;
- a storage object is readable without ownership or an active match;
- ended or blocked contact retains message or portrait access;
- cleanup accepts a browser-supplied user ID or deletes Auth before failed object cleanup is resolved;
- migrations diverge from GitHub history;
- the public Space switches away from `local-demo`.

Never paste magic links, JWTs, access tokens, database passwords, publishable keys, signed portrait URLs or private object paths into issues, screenshots or chat.
