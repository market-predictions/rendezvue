# WP-067 — Integrated product shell

**Status:** complete for controlled synthetic staging  
**Implementation PR:** #75  
**Implementation merge:** `21596e03ddf624f4eca5b272c77539985617e742`  
**Verifier repair PR:** #76  
**Accepted canonical commit:** `2bcd6f884ab6cc7a4ef68291b46e03e754be845b`  
**Environment:** canonical Cloudflare Pages staging, controlled synthetic adults only

## Objective

Replace the operator-oriented signed-in journey with one coherent mobile-first Rendezvue product experience for onboarding, privacy portrait selection, profile preview, discovery, matching, conversation and safety, while retaining the proven diagnostic harness behind an explicit advanced synthetic-test boundary.

## Accepted implementation scope

### Product navigation

The signed-in experience now has five product tabs:

1. Start;
2. Profile;
3. Discover;
4. Matches;
5. Account.

The account, recovery, global sign-out and account-deletion experience delivered by WP-066 remains the account surface. Technical proof logs, raw snapshots, UUIDs and operator-oriented controls remain behind the collapsed advanced synthetic-test section.

### Resumable onboarding

The product profile flow uses the existing authenticated onboarding repository and server contracts for:

- adult, current-single and serious-intent confirmation;
- community-principle confirmation;
- display name, city, relationship intention and biography;
- sex limited to `woman` or `man`;
- opposite-sex discovery derived automatically, with no separate partner selector;
- student, recent-graduate, employed or self-employed life stage;
- MBO, HBO or WO education where applicable;
- marital history, children and future-family preferences;
- descriptive faith and lifestyle fields without numeric piety scoring;
- personality prompts and interests;
- progress persistence and snapshot restoration.

The browser does not become authoritative. Owner identity, field allowlists, publication and visibility remain enforced by the existing Supabase/RLS/RPC layer.

### Privacy portrait and profile preview

The product shell supports:

- synthetic JPEG, PNG or WebP upload;
- private UUID-scoped Storage placement;
- one selected profile portrait record;
- rollback of the object if database registration fails;
- temporary signed access to the account's selected portrait;
- a user-facing profile preview before publication;
- server-authoritative publication through `publish_profile()`.

No raw private Storage path is rendered in the product interface.

### Discovery

The discovery experience:

- reads the existing `discovery_profiles` projection;
- excludes the signed-in account;
- uses a product-safe projection that keeps the target account ID outside visible display data;
- renders the ten existing synthetic WebP portraits from the generated Cloudflare artifact;
- labels profiles as synthetic;
- supports pass, direct like and contextual like;
- records signals through `record_attraction_signal`;
- does not connect pass actions to public reputation or general visibility.

### Match and conversation

The product shell uses the existing authoritative contracts for:

- participant-visible matches;
- one controlled synthetic contact entitlement;
- idempotent conversation opening;
- participant-only message reads and writes;
- Realtime message updates;
- temporary matched-portrait access while contact is active;
- normal contact ending;
- blocking;
- private safety reporting.

Visible match and conversation copy never includes match IDs, conversation IDs, account UUIDs or private object paths.

## Language and accessibility

- Dutch remains the default.
- English has complete product-copy key parity.
- WP-066 language changes are broadcast to the integrated shell.
- Navigation, forms and status regions use semantic controls and visible focus inherited from the account shell.
- Mobile layouts collapse forms, cards, chat and safety controls without requiring a separate application build.

Representative terminology and complete owner field review remain separate acceptance work.

## Synthetic product assets

The existing deterministic portrait generator remains the source for ten synthetic WebP profiles:

- Yasmin;
- Bilal;
- Amina;
- Idris;
- Maryam;
- Samir;
- Noura;
- Youssef;
- Hafsa;
- Omar.

The Cloudflare build copies these assets into `assets/profiles/` and writes a manifest asserting `syntheticOnly: true`. The WP-067 validator requires all ten files and rejects missing or unexpectedly small assets.

## Security boundaries

WP-067 preserves these boundaries:

- one shared Supabase browser client;
- no service-role or server secret in the artifact;
- no browser-side Auth administration;
- no browser access to the WP-065F e-mail replacement executor;
- no retention action;
- no account merge;
- no support password change;
- no payment activation;
- no real-user admission;
- RLS, RPCs, Storage policies and Edge Functions remain authoritative.

The dedicated source/artifact validator rejects:

- a second `createClient()` call;
- service-role or secret material;
- Auth-admin methods;
- support e-mail replacement functions;
- account-merge patterns;
- visible internal identifiers;
- missing partner derivation;
- Dutch/English key drift;
- missing synthetic portrait assets.

## Validation evidence before merge

Implementation head `80f0fa275ed4617f6827c7aa26744c504b5f8ec4` passed:

- ordinary CI run `30859823200`;
- full validation run `30859823366`;
- 51 Node application tests, zero failures;
- WP-067 source and generated-artifact safety validation;
- generation and artifact inclusion of ten synthetic portraits;
- application and static artifact checks;
- Cloudflare build and credential boundary;
- retained Docker build;
- clean Supabase start;
- empty-database migration replay;
- all pgTAP database contracts;
- parallel match and entitlement race tests;
- deterministic synthetic SQL seed;
- schema lint;
- all existing WP-057, WP-065, WP-065F and WP-066 gates.

The initial WP-067 validator run identified a false positive in its visible-identifier regular expression. The check was narrowed to actual `textContent` assignment lines without weakening the no-identifier requirement. The corrected full run passed.

## Canonical acceptance and verifier repair

After implementation PR #75 merged, protected backend run `30860142461` passed for commit `21596e03ddf624f4eca5b272c77539985617e742`, including migrations, remote health, cleanup deployment, anonymous rejection and the browser credential boundary.

The first post-merge production verifier run `30860142392` failed even though deployment metadata was commit-matched and remote Supabase configuration was correct. Root cause was a stale acceptance marker: the workflow still searched for the retired pre-WP-066 label `Magic link aanvragen`, while the accepted account experience deliberately uses `Aanmeldlink sturen`.

PR #76 repaired and strengthened the production verifier without changing application, Auth, database, RLS or user data. It now verifies:

- the WP-066 account-entry and recovery shell;
- the WP-067 product-shell module, model and styling;
- derived opposite-sex discovery policy;
- server-authoritative discovery and conversation markers;
- Realtime messaging markers;
- the ten-profile synthetic-only portrait manifest;
- actual WebP portrait delivery;
- absence of service-role, secret, Auth-admin and support-executor material;
- remote Supabase configuration, PKCE callbacks, disabled implicit fragments, no-store and security headers;
- absence of Hugging Face runtime references;
- real-user admission remains false.

PR #76 merged as `2bcd6f884ab6cc7a4ef68291b46e03e754be845b`. Canonical production verification run `30860701792` then passed and recorded:

- commit-matched deployment metadata;
- remote Supabase configuration from `previous-canonical-deployment`;
- account entry/recovery shell passed;
- integrated onboarding/discovery/conversation shell passed;
- synthetic portrait manifest and delivery passed;
- PKCE magic-link interface passed;
- implicit access/refresh token fragments disabled;
- no-store and security headers passed;
- privileged browser-capability scan passed;
- real-user admission not authorized.

## What is not yet claimed

- No signed-in canonical browser journey was manually executed during this package because no new disposable mailbox/account was available.
- Browser artifact, automated contract and deployment acceptance do not replace mobile owner review.
- No claim is made that every product action has been exercised manually on the canonical deployment after this merge.
- No real-user usability, accessibility or scale claim is made.
- No operational support, moderation or payment capability is introduced.

## Next acceptance work

1. Complete an owner-led desktop and mobile field review of the integrated journey.
2. Exercise onboarding, publication, discovery and conversation with controlled disposable synthetic accounts when mailboxes are available.
3. Refine portrait attractiveness, profile density and Dutch/English terminology based on the field review.
4. Keep WP-065F mailbox execution, WP-065C retention policy and pilot governance as separate gates.
5. Continue toward closed-pilot readiness only after legal, safety, support, accessibility and explicit admission approval.
