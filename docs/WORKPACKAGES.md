# Work packages

Status values: `planned`, `active`, `blocked`, `review`, `complete`.

## WP-000 — Repository foundation

**Status:** complete  
GitHub authority, CI, generated Static Space deployment, retained Docker validation and governance.

## WP-010 — Core PWA interaction prototype

**Status:** complete  
Camera flow, profile cards, likes, deterministic match, local-demo chat, safety controls and installable PWA.

## WP-015 — Hosted Hugging Face prototype

**Status:** review  
The product-baseline v1 public pilot and man/woman onboarding policy are deployed. Desktop/mobile field evidence and mobile camera review remain in issue #2.

## WP-016 — Netherlands and faith foundation

**Status:** review  
Dutch/English, MBO/HBO/WO fixtures and descriptive faith model delivered. Representative terminology review remains.

## WP-017 — Browser-local privacy portraits

**Status:** review  
Four controlled fuzzy variants delivered. Mobile attractiveness/privacy review remains.

## WP-018 — Product baseline and onboarding v1

**Status:** complete  
Open membership, student-first positioning, eligibility, life stage, family context, resumable onboarding, preview, community promise and opposite-sex community policy are merged and hosted.

## WP-019 — Interaction and contact concept

**Status:** complete  
Pass, direct/contextual like, swipe controls, reciprocal match, simulated contact entitlement, text chat and end-contact flow are merged and hosted.

## WP-020 — Institution registry and student benefits

**Status:** planned  
DUO/RIO institution identity, independently evidenced student mailbox domains, expiry, graduation transition, badge, discount and Campus Mode.

## WP-021 — Feedback and behavioural standing

**Status:** review for UX; production proof active  
Structured private feedback is prototyped without ranking effect. The backend fixes initial credibility weight and separates report escalation; the private proof exposes feedback/report controls. Retaliation, fairness, correction and appeal logic remain.

## WP-025 — Faith profile validation and legal basis

**Status:** planned  
Target-user research, Article 9 basis, withdrawal/deletion and anti-discrimination safeguards.

## WP-030 — Production account and eligibility stack

**Status:** active  
Auth-linked account/profile domains, RLS, magic-link/session adapter, versioned onboarding progress, owner-derived stage writes, prompts/interests and server-side publication are implemented. Workflow run #8 applied the complete migration set on `8400ebc`, passed remote Auth/Data API checks and deployed authenticated provider cleanup. Automatic private deployment run `30657471168` configured the hosted HTTPS callback. Remaining: controlled hosted callback/session/deletion proof, recovery, duplicate-account controls and abandonment retention.

## WP-035 — Resumable onboarding persistence

**Status:** review  
Owner-only snapshot, stage allowlists, progress save, transactional personality save and publication gating are covered by the 151-assertion backend suite and client adapter tests. Remote two-account browser evidence remains.

## WP-037 — Private hosted Supabase preview

**Status:** review; deployment complete, browser acceptance pending  
The separate private proof harness, runtime-config builder, shared browser Auth client, browser/server secret scan, protected migration/function workflow and runbook are implemented. The corrected architecture deploys directly from GitHub Actions to `solidprivacy/rendezvue-private-preview`, automatically configures the Supabase HTTPS callback, reasserts private visibility, verifies the deployed repository artifact and records non-secret deployment evidence in issue #21. Automatic run `30657471168` on `3dc37be1` succeeded. The public Hugging Face lane remains `local-demo`, and no localhost or downloaded artifact is used.

## WP-040 — Production liveness and privacy portrait

**Status:** planned  
Randomized challenge analysis, replay threat model, short retention, fair portrait output and device coverage. AI generation is optional, not required.

## WP-050 — Persistent application services

**Status:** active  
Server-authoritative attraction, match, one-time synthetic proof entitlement, conversation, message, end-contact, block, feedback and report contracts are implemented. Private storage, active-match portrait access, Realtime publication, moderation/audit, least-privilege grants and true parallel races pass GitHub Actions validation. Next: execute the hosted private two-account browser slice.

## WP-055 — Backend proof validation

**Status:** active  
CI proves empty-database replay, 151 pgTAP assertions, schema lint, cross-account isolation, publication gating, one-time proof entitlement, active-match portrait access, contact ending, true parallel races, block enforcement, moderation escalation and relational deletion/anonymisation. Private artifact checks and Deno/Edge Runtime tests cover cleanup. Workflow run #8 proves remote migration/function/platform health and credential separation. Run `30657471168` proves private Hugging Face deployment, private visibility, hosted callback configuration, commit-matched repository artifact and no change to the public pilot. Remaining acceptance: unauthorized-access browser denial, real magic-link/session, signed object access, authenticated cleanup and full two-account evidence. Tracked in issues #18 and #21.

## WP-057 — Controlled two-account remote proof

**Status:** active; implementation and hosted deployment complete, browser execution pending  
Use the dedicated private Hugging Face Space with two controlled synthetic adult accounts to prove access denial for a non-authorized Hugging Face session, magic-link delivery, session restore, persistent onboarding, publication, opposite-sex discovery, reciprocal likes, exactly one match, one-time contact entitlement, realtime chat, signed matched portrait, normal end-contact, block/report/private feedback and cross-account privacy isolation. Finish by invoking provider cleanup and proving object, Auth, relational and anonymised-audit outcomes. No local runtime or downloaded artifact is permitted.

## WP-058 — Provider account and object cleanup

**Status:** review; remote function and hosted client deployed  
The authenticated Edge Function accepts no user ID, requires exact confirmation, removes UUID-scoped private portrait objects first, then deletes the Supabase Auth user so existing cascades/anonymisation run. Browser UI, artifact assertions, Deno type checking, CORS/auth-gate smoke testing and protected remote deployment are proven. Workflow run #8 proves unauthenticated requests are rejected; run `30657471168` deploys the hosted client using the dedicated HTTPS callback. Authenticated cleanup with actual proof objects remains the acceptance gate.

## WP-060 — Payments and entitlements

**Status:** planned  
The contact-entitlement ledger and a synthetic proof issuer exist, but no provider or money movement is configured. Later: Mollie/Stripe decision, hosted checkout, verified webhooks, cancellation, refunds, regular pricing and verified-student discount. The proof issuer must never be enabled for a real-user environment.

## WP-070 — Trust and safety operations

**Status:** planned  
Controlled safety reports, automatic high-severity case creation, audit events and private proof controls exist. Operational queue, child safety, hidden relationship review, enforcement, support coverage and appeals remain.

## WP-080 — Closed city pilot readiness

**Status:** planned  
Legal, privacy, security, accessibility, support, moderation and deletion gates for an invite-only Dutch city cohort.

## WP-085 — Local density and events

**Status:** planned  
City launch analytics, campus/community partnerships and later small verified events.

## WP-090 — Belgium assessment

**Status:** deferred.

## WP-100 — Native shells

**Status:** deferred until PWA evidence justifies app-store and native complexity.
