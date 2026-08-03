# Work packages

Status values: `planned`, `active`, `blocked`, `review`, `complete`, `retired`.

## WP-000 — Repository foundation

**Status:** complete  
GitHub authority, CI, generated static artifacts, retained Docker validation and governance.

## WP-010 — Core PWA interaction prototype

**Status:** complete  
Camera flow, profile cards, likes, deterministic match, local-demo chat, safety controls and installable PWA.

## WP-015 — Hosted concept prototype

**Status:** retired as a hosted lane; source retained  
The historical public Hugging Face concept pilot is non-canonical and receives no further deployments.

## WP-016 — Netherlands and faith foundation

**Status:** review  
Dutch/English, MBO/HBO/WO fixtures and descriptive faith model delivered. Representative terminology review remains.

## WP-017 — Browser-local privacy portraits

**Status:** review  
Four controlled fuzzy variants delivered. Integrated mobile attractiveness/privacy review remains.

## WP-018 — Product baseline and onboarding v1

**Status:** complete  
Open membership, student-first positioning, eligibility, life stage, family context, resumable onboarding, preview, community promise and opposite-sex community policy are merged.

## WP-019 — Interaction and contact concept

**Status:** complete  
Pass, direct/contextual like, swipe controls, reciprocal match, contact entitlement, text chat and end-contact flow are merged.

## WP-020 — Institution registry and student benefits

**Status:** planned  
DUO/RIO institution identity, independently evidenced student mailbox domains, expiry, graduation transition, badge, discount and Campus Mode.

## WP-021 — Feedback and behavioural standing

**Status:** review for UX; production proof planned  
Structured private feedback is proven in the synthetic browser slice without public ranking effect. Retaliation, fairness, correction and appeal logic remain.

## WP-025 — Faith profile validation and legal basis

**Status:** planned  
Target-user research, Article 9 basis, withdrawal/deletion and anti-discrimination safeguards.

## WP-030 — Production account and eligibility stack

**Status:** active; controlled Auth, lifecycle and support-case foundations complete  
Auth-linked account/profile domains, RLS, PKCE magic-link sessions, resumable onboarding, publication, sign-out/re-authentication, provider cleanup, fail-closed existing-account recovery intent, non-destructive lifecycle state and service-only account-support cases are proven for controlled synthetic infrastructure. Remaining: approved identity-proof standards and any separate dual-control account resolution/restoration action, abandonment-retention approval and operational policy activation.

## WP-035 — Resumable onboarding persistence

**Status:** complete for controlled proof  
Owner-only snapshot, stage allowlists, progress save, transactional personality save, publication gating and two-account remote persistence are demonstrated. Product UX refinement remains outside this package.

## WP-037 — Legacy private Hugging Face proof

**Status:** retired  
The private Static Space is no longer an application host or acceptance environment.

## WP-038 — Cloudflare Pages canonical staging

**Status:** complete; evidence in issue #35  
`https://rendezvue-private-preview.pages.dev/` is the sole canonical web-facing staging environment with commit-matched metadata, security/no-store headers and no Hugging Face runtime dependency.

## WP-039 — Cloudflare/Supabase runtime contract

**Status:** complete; evidence in issue #35  
The production artifact uses browser-safe Supabase configuration, fixed Cloudflare Auth URLs, PKCE magic links, disabled implicit token fragments, the authenticated cleanup function and RLS as the authorization boundary.

## WP-040 — Production liveness and privacy portrait

**Status:** planned  
Randomized challenge analysis, replay threat model, short retention, fair portrait output and device coverage. AI generation is optional.

## WP-050 — Persistent application services

**Status:** complete for controlled proof; product integration active elsewhere  
Server-authoritative attraction, match, one-time proof entitlement, conversation, Realtime messages, end-contact, block, feedback, report and portrait-access contracts completed the two-account browser slice.

## WP-055 — Backend proof validation

**Status:** complete for current backend scope  
CI proves empty-database replay, pgTAP, schema lint, cross-account isolation, publication gating, one-time proof entitlement, portrait access/revocation, true parallel races, moderation escalation, account cleanup, lifecycle candidate safety and support-case access/state contracts.

## WP-057 — Controlled two-account remote proof

**Status:** complete; accepted in issue #41 on 2026-08-03  
Two isolated controlled synthetic accounts completed PKCE authentication, session restore, persistent onboarding, publication, discovery, reciprocal matching, one entitlement, one conversation, two-way Realtime messages, private portrait access, feedback/reporting, end-contact, blocking, server-authoritative revocation, global sign-out/re-authentication and provider cleanup. Both browser profiles remained signed out after deletion. Detailed evidence: `docs/WP-057-COMPLETION.md`.

## WP-058 — Provider account and object cleanup

**Status:** complete for controlled proof  
The authenticated Edge Function removed UUID-scoped private portrait objects, Supabase Auth users and relational records for both proof accounts while retaining anonymised audit evidence. The conversation-opener cleanup defect was repaired in PR #52 and deployed by protected run `30805876163`.

## WP-059 — Hugging Face hosting retirement

**Status:** complete; remote artifact removal optional  
Public and private Hugging Face deployment workflows, active helpers and evidence automation are removed.

## WP-060 — Payments and entitlements

**Status:** planned  
No payment provider or money movement is configured. The synthetic proof entitlement issuer must never be enabled for real users.

## WP-065 — Account recovery and lifecycle controls

**Status:** active — WP-065A/B/D complete; WP-065C blocked  
WP-065A separates registration from existing-account recovery so recovery cannot create an accidental Auth account. WP-065B adds server-authoritative lifecycle/activity state, inactive-by-default retention policies, explicit holds and service-only non-destructive candidates. WP-065D adds service-only audited investigation cases for duplicate-account and mailbox-access-loss requests, without any merge, Auth restoration, e-mail change or deletion capability. Protected runs `30841983060` and `30843828895` proved the remote lifecycle and support-case privilege boundaries. Remaining: identity-proof and dual-control action design plus policy/DPIA/operational approval before any restoration, resolution or scheduled deletion.

## WP-070 — Trust and safety operations

**Status:** planned  
Operational queue, child safety, hidden relationship review, enforcement, support coverage and appeals.

## WP-080 — Closed city pilot readiness

**Status:** planned  
Legal, privacy, security, accessibility, support, moderation, deletion and explicit authorization gates for an invite-only Dutch city cohort.

## WP-085 — Local density and events

**Status:** planned  
City launch analytics, campus/community partnerships and later small verified events.

## WP-090 — Belgium assessment

**Status:** deferred.

## WP-100 — Native shells

**Status:** deferred until PWA evidence justifies app-store and native complexity.
