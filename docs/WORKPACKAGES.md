# Work packages

Status values: `planned`, `active`, `blocked`, `review`, `complete`.

## WP-000 — Repository foundation

**Status:** complete  
GitHub authority, CI, generated Static Space deployment, retained Docker validation and governance.

## WP-010 — Core PWA interaction prototype

**Status:** complete  
Camera flow, profile cards, likes, deterministic match, local chat, safety controls and installable PWA.

## WP-015 — Hosted Hugging Face prototype

**Status:** review  
The product-baseline v1 pilot and man/woman onboarding policy are deployed. Desktop/mobile field evidence and mobile camera review remain in issue #2.

## WP-016 — Netherlands and faith foundation

**Status:** review  
Dutch/English, MBO/HBO/WO fixtures and descriptive faith model delivered. Representative terminology review remains.

## WP-017 — Browser-local privacy portraits

**Status:** review  
Four controlled fuzzy variants delivered. Mobile attractiveness/privacy review remains.

## WP-018 — Product baseline and onboarding v1

**Status:** complete  
Open membership, student-first positioning, eligibility, life stage, family context, resumable local onboarding, preview, community promise and opposite-sex community policy are merged and hosted.

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
Auth-linked account/profile domains, RLS, magic-link/session adapter, versioned onboarding progress, owner-derived stage writes, prompts/interests and server-side publication are implemented. Remote migrations through commit `9403330f` are applied to `RendezvueProject` in West EU (Ireland), and remote Auth/Data API checks pass. Provider-orchestrated private-object and Auth-account cleanup is implemented in PR #26. Remaining: execute real callback/session/deletion proof, recovery, duplicate-account controls and abandonment retention.

## WP-035 — Resumable onboarding persistence

**Status:** review  
Owner-only snapshot, stage allowlists, progress save, transactional personality save and publication gating are covered by the 151-assertion backend suite and client adapter tests. Remote two-account proof with controlled synthetic accounts remains.

## WP-037 — Protected private Supabase preview

**Status:** complete for implementation and deployment foundation  
The separate private proof harness, runtime-config builder, shared browser Auth client, browser/server secret scan, protected migration/function workflow and runbook are implemented. Workflow run #7 successfully linked and applied repository migrations, passed remote Auth and Data API metadata checks, validated the publishable-key-only browser artifact and generated one short-lived proof artifact. A fresh protected run after PR #26 is required for the expanded interaction and cleanup artifact. The public Hugging Face lane remains `local-demo`.

## WP-040 — Production liveness and privacy portrait

**Status:** planned  
Randomized challenge analysis, replay threat model, short retention, fair portrait output and device coverage. AI generation is optional, not required.

## WP-050 — Persistent application services

**Status:** active  
Server-authoritative attraction, match, one-time synthetic proof entitlement, conversation, message, end-contact, block, feedback and report contracts are implemented. Private storage, active-match portrait access, Realtime publication, moderation/audit, least-privilege grants and true parallel races pass local validation. The private proof harness exposes the complete interaction journey and provider account cleanup. Next: execute the controlled two-account remote slice.

## WP-055 — Backend proof validation

**Status:** active  
CI proves empty-database replay, 151 pgTAP assertions, schema lint, cross-account isolation, publication gating, one-time proof entitlement, active-match portrait access, contact ending, true parallel races, block enforcement, moderation escalation and relational deletion/anonymisation. Private artifact checks and Deno type checking cover the cleanup Edge Function, while a local runtime smoke test verifies CORS and unauthenticated HTTP 401. Remote migration deployment, Auth health, Data API metadata and browser/server credential separation are proven. Remaining: real Auth callback/session, signed object access, authenticated cleanup and full two-account evidence. Tracked in issues #18 and #21.

## WP-057 — Controlled two-account remote proof

**Status:** active; implementation complete after PR #26, execution pending  
Generate a fresh protected artifact after PR #26 and use two controlled synthetic adult accounts to prove magic-link delivery, session restore, persistent onboarding, publication, opposite-sex discovery, reciprocal likes, exactly one match, one-time contact entitlement, realtime chat, signed matched portrait, normal end-contact, block/report/private feedback and cross-account privacy isolation. Finish by invoking provider cleanup and proving object, Auth, relational and anonymised-audit outcomes.

## WP-058 — Provider account and object cleanup

**Status:** review  
Authenticated Edge Function accepts no user ID, requires exact confirmation, removes flat UUID-scoped private portrait objects first, then deletes the Supabase Auth user so existing cascades/anonymisation run. Browser UI, artifact assertions, Deno type checking, local CORS/auth-gate smoke testing and protected remote deployment are implemented. Remote authenticated cleanup remains the acceptance gate.

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
