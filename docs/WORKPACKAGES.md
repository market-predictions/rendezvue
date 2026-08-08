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

**Status:** complete for controlled synthetic staging; accepted in issue #74  
The signed-in Cloudflare experience provides mobile product navigation, resumable onboarding, derived opposite-sex discovery, private portrait upload, profile preview/publication, synthetic portrait-backed discovery, pass/direct/contextual likes, match/contact flow, Realtime conversation and plain-language safety actions. Internal IDs and proof terminology remain outside visible product projections, while the diagnostic harness stays behind the advanced synthetic-test boundary. PR #75 merged as `21596e03ddf624f4eca5b272c77539985617e742`; verifier repair PR #76 merged as `2bcd6f884ab6cc7a4ef68291b46e03e754be845b`; canonical product verification run `30860701792` passed. Manual disposable-account field proof and owner mobile review remain pending.

## WP-068 — Discovery field-review hardening

**Status:** complete for the owner-observed discovery defects; accepted in issues #78, #82 and #85  
WP-068A replaced the portrait wall with one active profile, visible profile information, explicit Pass/Like/Respond controls, keyboard-safe inactive cards and cache-coherent versioned delivery. WP-068B replaced the viewport-driven split with a card-container query, stacked narrow/intermediate fallback, minimum split-column widths and separate non-overlapping portrait/copy/actions/context regions. WP-068C resolves the ten approved bundled synthetic portraits from normalized extended display-name tokens while unknown names retain initials and no external or private portrait source is used. Canonical verification runs `30935664310`, `30948012861` and `30949504738` passed.

## WP-069A — Realistic synthetic profile portrait fixtures

**Status:** complete for controlled synthetic staging; accepted in issue #89  
The ten childlike illustrated discovery fixtures were replaced with unique photorealistic AI-generated adult synthetic portraits while retaining the deterministic Yasmin/Bilal/Amina/Idris/Maryam/Samir/Noura/Youssef/Hafsa/Omar mapping. Genuine optimized WebP delivery, synthetic-only manifest, uniqueness, dimensions and canonical Cloudflare availability were verified in run `30960048211`. Implementation PR #88 merged as `14eeaf60018e0cd507d570854b91e4f8418f380f`; durable verifier PR #90 merged as `dd64d7d5eb202e03934f819694fa6060999f237e`.

## WP-069B — Participant profile image preparation

**Status:** technical foundation complete and canonically verified; owner field review pending; issue #91  
Arbitrary JPEG/PNG/WebP uploads now enter a user-controlled 4:5 framing flow with pan, zoom, reset, safe-area guidance, square avatar preview and quality warnings. Rendezvue privately stores a normalized metadata-free WebP source plus explicit 960×1200 card and 384×384 avatar derivatives linked by one preparation ID. Only the card can be selected; exact account-scoped paths, one selected card, idempotency, concurrency serialization, path redaction and cross-account isolation are enforced. PR #92 merged as `a06f2ae7b7c4b5779e80143d62960856e63d9ac7`; protected run `30994962258` and canonical run `30995029165` passed.

## WP-069C — Human-readable customer-facing profile labels

**Status:** implementation complete; canonical owner verification pending; issue #94  
Stored backend values such as `serious_relationship`, `marriage_oriented`, `recent_graduate` and `self_employed` are translated at one shared profile-display boundary before reaching preview or discovery. The regression suite reads `synthetic-seed/profiles.json` and requires every seeded relationship-intent value to have explicit Dutch and English copy. Genuine custom text remains unchanged, unknown snake-case values are humanised without underscores, and direct rendering of stored enum values remains prohibited.

## WP-070 — Trust and safety operations

**Status:** active — WP-070A complete; WP-070B implementation in progress; issue #139  
WP-070A is `OUTCOME_CONFIRMED`: protected staging has a service-only moderation queue, deterministic priority, controlled claim/unclaim, optimistic state/version handling, append-only case events and no participant moderation access. WP-070B adds a non-effectful proposal + independent-review authorization layer so future material actions cannot be self-authorized; it deliberately performs no suspension, restriction, ban, deletion or other enforcement. Later WP-070 packages must define policy-bound enforcement execution, specialist escalation, appeals, support ownership and incident response. Detailed contracts: `docs/WP-070A-MODERATION-TRIAGE.md`, `docs/WP-070B-DUAL-CONTROL-AUTHORIZATION.md` and roadmap addenda.

## WP-071 — Profile-form visual hierarchy and premium UX

**Status:** implementation in review; canonical owner verification pending; issue #98  
The long profile form now gives section grouping, field labels and entered values deliberately different visual roles. Direct labels are compact supporting copy, values are the primary scan target, controls retain accessible touch targets and focus treatment, the relationship-intent column receives more desktop width, and all sections collapse to one column below 680 px. A dedicated regression and canonical stylesheet verifier prevent the hierarchy from silently collapsing again.

## WP-072 — Synthetic contact-entitlement activation

**Status:** implementation in review; canonical owner verification pending; issue #100  
The active synthetic match flow now aligns current product terms with the one-time private proof entitlement, validates the claim RPC before opening a conversation, retains legacy proof compatibility, rejects unknown terms and replaces raw database errors with bilingual participant-facing copy. Application, pgTAP, artifact and canonical verifiers cover the repair.

## WP-073 — Scalable conversation inbox

**Status:** implementation in review; canonical owner verification pending; issue #104  
The former single-match surface is replaced by a scalable inbox that separates conversations, new matches and previous contacts. Rows show portrait, name, latest message, activity time and unread state; a persistent header identifies the selected participant. Switching threads reloads the correct messages, portrait, Realtime subscription and safety target. Desktop uses two columns, while mobile moves clearly between list and conversation.

## WP-074A — Privacy portrait recognisability recalibration

**Status:** technically complete historical baseline; visual ladder superseded by WP-074B; issue #109  
WP-074A proved the prepared-derivative privacy architecture and replaced the original over-blurred ladder with Unfiltered, Natural, Soft private and Balanced. That visual ladder is no longer awaiting acceptance: the owner explicitly superseded it with WP-074B. Unfiltered remains a prepared metadata-free derivative, never the original upload. Historical IDs remain database-compatible. PR #110 merged the baseline; run `31194940950`, protected staging run `31197276822` and canonical run `31197343371` passed.

## WP-074B — Privacy portrait ladder remap and selected-card delivery

**Status:** implementation in review; technical PR validation green; canonical owner acceptance pending; issue #115  
Owner direction remaps the active ladder to **Zonder filter / Unfiltered → Natural → Zacht privé / Soft private → Meer privé / More private**. Natural uses the former `softFocus` recipe, Soft private uses the former `warmVeil`/Balanced recipe, and More private adds a bounded stronger recipe that stays lighter than the rejected legacy heavy tiers. Natural is Recommended and no option is preselected. Historical `natural`, `monoMist` and `privacyMax` identifiers remain readable but are rejected for new writes. Card and avatar are generated from and persist the exact selected presentation. Discovery resolves only the selected prepared card of a published, unblocked profile through a narrow private-Storage policy; source and non-selected derivatives remain private.

## WP-075 — Cross-browser passwordless sign-in with email OTP

**Status:** blocked — browser/client foundation merged and independently assured; hosted activation blocked externally; issue #121  
The code-first passwordless flow, 6-digit/10-minute contract, explicit existing-account versus registration semantics and cross-browser verification adapter are implemented. The current Supabase Free/default mail provider rejects the required repository-controlled template containing `{{ .Token }}`. Canonical staging therefore truthfully keeps PKCE magic link as the active passwordless path and does not load the OTP controller. Activation requires custom SMTP or an explicitly authorized provider/plan change followed by hosted read-back, two-browser proof and fresh assurance. No password or cross-browser session propagation fallback is authorized. Detailed state: `docs/WP-075-CROSS-BROWSER-OTP-AUTH.md`.

## WP-076 — Live selfie and multi-photo profile architecture

**Status:** complete for controlled synthetic product flow; real-user liveness remains separately gated by WP-040; issue #120  
The profile architecture requires a camera-origin Live selfie and supports up to two optional profile photos, one primary discovery image and a bounded full-profile media viewer. Raw/challenge media remains private, the privacy ladder remains authoritative and no legal-identity or automated-liveness claim is made. Owner follow-up corrected the trust-panel composition and compact status label before the integrated UX line continued.

## WP-077 — Cohesive selfie creation, framing, privacy and result flow

**Status:** complete; owner accepted in the integrated UX review  
Selfie capture, framing/zoom, privacy selection and result assessment now form one local composer task instead of separated page regions. Extra profile photos follow after the core selfie task. Mobile keeps result and controls close; desktop can use a balanced side-by-side workspace.

## WP-078 — Mobile-first touch interaction hardening

**Status:** complete; owner accepted in the integrated UX review  
Form controls, checkbox/radio rows, date/select affordances, zoom controls, media controls, discovery actions, messaging and bottom navigation use touch-first targets and mobile-specific interaction patterns without unnecessarily inflating desktop density.

## WP-079 — Synthetic profile photo stand-ins for Live-selfie-era discovery

**Status:** complete for controlled synthetic staging  
The approved photorealistic synthetic profile portraits are projected consistently across discovery, profile, match/inbox and conversation surfaces as synthetic-fixture stand-ins. The production invariant remains unchanged: real `live_selfie` media requires camera-origin capture and the synthetic compatibility path cannot fabricate liveness evidence.

## WP-080 — Closed city pilot readiness

**Status:** planned  
Legal, privacy, security, accessibility, support, moderation, deletion and explicit authorization gates for an invite-only Dutch city cohort. WP-075 hosted authentication activation and the remaining WP-070 Trust & Safety layers are mandatory unresolved dependencies; real-user admission remains unauthorized.

## WP-085 — Local density and events

**Status:** planned  
City launch analytics, campus/community partnerships and later small verified events.

## WP-090 — Belgium assessment

**Status:** deferred.

## WP-100 — Native shells

**Status:** deferred until PWA evidence justifies app-store and native complexity.
