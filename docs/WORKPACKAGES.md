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
The historical public Hugging Face concept pilot is no longer canonical and receives no further deployments. The source remains available for comparison and future integration into the Cloudflare application.

## WP-016 — Netherlands and faith foundation

**Status:** review  
Dutch/English, MBO/HBO/WO fixtures and descriptive faith model delivered. Representative terminology review remains.

## WP-017 — Browser-local privacy portraits

**Status:** review  
Four controlled fuzzy variants delivered. Mobile attractiveness/privacy review remains.

## WP-018 — Product baseline and onboarding v1

**Status:** complete  
Open membership, student-first positioning, eligibility, life stage, family context, resumable onboarding, preview, community promise and opposite-sex community policy are merged.

## WP-019 — Interaction and contact concept

**Status:** complete  
Pass, direct/contextual like, swipe controls, reciprocal match, simulated contact entitlement, text chat and end-contact flow are merged.

## WP-020 — Institution registry and student benefits

**Status:** planned  
DUO/RIO institution identity, independently evidenced student mailbox domains, expiry, graduation transition, badge, discount and Campus Mode.

## WP-021 — Feedback and behavioural standing

**Status:** review for UX; production proof active  
Structured private feedback is prototyped without ranking effect. Retaliation, fairness, correction and appeal logic remain.

## WP-025 — Faith profile validation and legal basis

**Status:** planned  
Target-user research, Article 9 basis, withdrawal/deletion and anti-discrimination safeguards.

## WP-030 — Production account and eligibility stack

**Status:** active  
Auth-linked account/profile domains, RLS, email OTP/session adapter, versioned onboarding progress, owner-derived stage writes, prompts/interests and server-side publication are implemented. Remaining: controlled Cloudflare session/deletion proof, recovery, duplicate-account controls and abandonment retention.

## WP-035 — Resumable onboarding persistence

**Status:** review  
Owner-only snapshot, stage allowlists, progress save, transactional personality save and publication gating are covered by automated tests. Remote two-account browser evidence remains.

## WP-037 — Legacy private Hugging Face proof

**Status:** retired  
The private Static Space proved remote migrations, browser-safe configuration and deployment mechanics, but its access gateway interfered with Supabase callback testing. It is no longer an application host or acceptance environment.

## WP-038 — Cloudflare Pages canonical staging

**Status:** active; claimed in issue #35  
Make `https://rendezvue-private-preview.pages.dev/` the sole canonical web-facing staging environment. Acceptance requires a production deployment from `main`, a commit-matched `deployment.json`, Cloudflare security headers and no runtime dependency on Hugging Face.

## WP-039 — Cloudflare/Supabase runtime contract

**Status:** active; claimed in issue #35  
Provide the Cloudflare build with only `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`, keep email OTP verification inside the application, set the Supabase Auth Site URL and allow-list to the fixed Pages URL, deploy the cleanup function and preserve RLS as the authorization boundary.

## WP-040 — Production liveness and privacy portrait

**Status:** planned  
Randomized challenge analysis, replay threat model, short retention, fair portrait output and device coverage. AI generation is optional.

## WP-050 — Persistent application services

**Status:** active  
Server-authoritative attraction, match, one-time synthetic proof entitlement, conversation, message, end-contact, block, feedback and report contracts are implemented. Next: execute the Cloudflare-hosted two-account browser slice.

## WP-055 — Backend proof validation

**Status:** active  
CI proves empty-database replay, pgTAP assertions, schema lint, cross-account isolation, publication gating, one-time proof entitlement, active-match portrait access, contact ending, true parallel races, block enforcement, moderation escalation and relational deletion/anonymisation. Remaining acceptance moves from Hugging Face to Cloudflare Pages.

## WP-057 — Controlled two-account remote proof

**Status:** active; Cloudflare browser execution pending  
Use two controlled synthetic adult accounts on the canonical Cloudflare staging URL to prove email OTP, session restore, persistent onboarding, publication, opposite-sex discovery, reciprocal likes, exactly one match, one-time contact entitlement, realtime chat, signed matched portrait, normal end-contact, block/report/private feedback and cross-account privacy isolation. Finish by invoking provider cleanup and proving object, Auth, relational and anonymised-audit outcomes.

## WP-058 — Provider account and object cleanup

**Status:** review; remote function deployed  
The authenticated Edge Function removes UUID-scoped private portrait objects before deleting the Supabase Auth user. Authenticated cleanup with actual proof objects remains the acceptance gate on Cloudflare staging.

## WP-059 — Hugging Face hosting retirement

**Status:** active; claimed in issue #35  
Disable public and private Hugging Face deployment workflows, remove active deployment helpers and evidence automation, stop referencing Hugging Face URLs as current application endpoints and preserve historical evidence only as non-canonical project history.

## WP-060 — Payments and entitlements

**Status:** planned  
No payment provider or money movement is configured. The synthetic proof issuer must never be enabled for real users.

## WP-070 — Trust and safety operations

**Status:** planned  
Operational queue, child safety, hidden relationship review, enforcement, support coverage and appeals remain.

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
