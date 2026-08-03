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

**Status:** active; controlled Auth, lifecycle, support-decision, e-mail-replacement and product-UX foundations complete  
Auth-linked account/profile domains, RLS, PKCE magic-link sessions, resumable onboarding, publication, sign-out/re-authentication, provider cleanup, fail-closed existing-account recovery, non-destructive lifecycle state, support cases, four-eyes evidence decisions, a dual-controlled registered-email replacement foundation and the integrated bilingual product shell are proven for controlled synthetic infrastructure. Remaining: remote disposable-mailbox execution proof, operational identity/support policy, secure support tooling and abandonment-retention approval.

## WP-035 — Resumable onboarding persistence

**Status:** complete for controlled proof and product-shell integration  
Owner-only snapshot, stage allowlists, progress save, transactional personality save, publication gating and two-account remote persistence are demonstrated and consumed by WP-067. Owner field review remains.

## WP-037 — Legacy private Hugging Face proof

**Status:** retired  
The private Static Space is no longer an application host or acceptance environment.

## WP-038 — Cloudflare Pages canonical staging

**Status:** complete; evidence in issue #35  
`https://rendezvue-private-preview.pages.dev/` is the sole canonical web-facing staging environment with commit-matched metadata, security/no-store headers and no Hugging Face runtime dependency.

## WP-039 — Cloudflare/Supabase runtime contract

**Status:** complete; evidence in issue #35  
The production artifact uses browser-safe Supabase configuration, fixed Cloudflare Auth URLs, PKCE magic links, disabled implicit token fragments, authenticated internal Edge Functions and RLS as the authorization boundary.

## WP-040 — Production liveness and privacy portrait

**Status:** planned  
Randomized challenge analysis, replay threat model, short retention, fair portrait output and device coverage. AI generation is optional.

## WP-050 — Persistent application services

**Status:** complete for controlled proof and integrated synthetic product shell  
Server-authoritative attraction, match, one-time proof entitlement, conversation, Realtime messages, end-contact, block, feedback, report and portrait-access contracts completed the two-account browser slice and now power the WP-067 product experience.

## WP-055 — Backend proof validation

**Status:** complete for current backend scope  
CI proves empty-database replay, pgTAP, schema lint, cross-account isolation, publication gating, one-time proof entitlement, portrait access/revocation, true parallel races, moderation escalation, account cleanup, lifecycle candidate safety, support-case state, evidence/dual-control decisions and WP-065F e-mail-replacement action invariants.

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

**Status:** active — WP-065A/B/D/E complete; WP-065F foundation complete; WP-065C blocked  
WP-065A separates registration from existing-account recovery. WP-065B adds non-destructive lifecycle candidates and holds. WP-065D adds audited duplicate-account/mailbox-loss cases. WP-065E adds controlled evidence and independent decisions. WP-065F adds a mailbox-loss-only, dual-controlled registered-email replacement foundation with hashed addresses, idempotency, expiry, cooldown, collision protection and an internal executor. Protected runs `30841983060`, `30843828895`, `30850822452`, `30854571921` and `30854641803` prove the remote boundaries. Remaining: a disposable-mailbox end-to-end execution proof, operational support authorization and WP-065C policy/DPIA approval.

## WP-066 — Product-facing account and recovery UX

**Status:** complete for controlled synthetic staging; accepted in issue #71  
Canonical Cloudflare staging opens with a Dutch-first, English-capable, mobile-first account experience. It clearly separates sign-in from registration, uses non-enumerating request messages, explains expired/wrong-browser links and mailbox-loss support in plain language, masks the signed-in address, exposes global sign-out and understandable deletion, and retains the complete proof harness only under an advanced synthetic-test disclosure. Detailed evidence: `docs/WP-066-ACCOUNT-RECOVERY-UX.md`.

## WP-067 — Integrated onboarding, discovery and conversation product shell

**Status:** implementation complete; canonical automated acceptance pending final post-merge evidence  
The signed-in Cloudflare experience now provides mobile product navigation, resumable onboarding, derived opposite-sex discovery, private portrait upload, profile preview/publication, synthetic portrait-backed discovery, pass/direct/contextual likes, match/contact flow, Realtime conversation and plain-language safety actions. Internal IDs and proof terminology remain outside visible product projections, while the diagnostic harness stays behind the advanced synthetic-test boundary. PR #75 merged as `21596e03ddf624f4eca5b272c77539985617e742`; implementation head passed CI run `30859823200` and full validation run `30859823366`. Manual disposable-account field proof remains pending. Detailed evidence: `docs/WP-067-INTEGRATED-PRODUCT-SHELL.md`.

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
