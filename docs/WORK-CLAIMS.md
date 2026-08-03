# Work claims register

This register prevents prototype and backend behaviour from being overstated.

| ID | Claim | Status | Evidence | Limitation |
|---|---|---|---|---|
| WC-001 | GitHub is the sole source of truth. | Demonstrated | repository, ADRs, CI | Branch protection remains an operational setting. |
| WC-002 | GitHub produces the static artifacts consumed by Cloudflare Pages. | Demonstrated | build scripts, CI and production verification | Cloudflare project settings remain external operational configuration. |
| WC-003 | The Supabase-connected staging application is reachable through Cloudflare Pages. | Demonstrated | canonical Pages URL and commit-matched metadata | Synthetic-only proof environment; not a real-user production service. |
| WC-004 | Membership is adult, single and serious rather than student-only. | Implemented | domain validation and onboarding | Eligibility is self-declared in the proof. |
| WC-005 | Student status is an optional verified-benefit layer. | Implemented as concept | life-stage flow | Institution data and verification remain fixtures. |
| WC-006 | Marital history, children and child preference are separate fields. | Implemented | domain model and tests | Values are self-declared. |
| WC-007 | The browser produces four fuzzy privacy portraits. | Implemented | renderer and UI | Blur is not anonymity or liveness. |
| WC-008 | The concept supports buttons and swipes for pass/like. | Implemented | handlers and tests | Public concept signals remain local-demo only. |
| WC-009 | Passes do not lower general visibility. | Demonstrated by model | no standing linkage | Production ranking does not exist. |
| WC-010 | Direct/contextual likes create a reciprocal pilot match. | Demonstrated in controlled browser proof | issue #41 | The proof used synthetic accounts only. |
| WC-011 | A contact right opens text chat. | Demonstrated for controlled proof | issue #41 | No production payment entitlement exists. |
| WC-012 | Private feedback is separate from safety reports. | Demonstrated | model, RPCs and controlled proof | Feedback has no production ranking effect. |
| WC-013 | Public stars, downvotes and popularity counts are absent. | Demonstrated | UI and requirements | Regression guards remain necessary. |
| WC-014 | Dutch is default and English is available. | Implemented and tested | i18n tests and WP-066 | Representative copy review remains. |
| WC-015 | Faith is self-described without piety scoring. | Implemented | model and tests | Article 9 production basis unresolved. |
| WC-016 | The concept resumes browser-local onboarding. | Implemented | schema-versioned browser state | Browser storage alone is not a secure account. |
| WC-017 | The product is safe/lawful for real users. | Not claimed | N/A | Legal, moderation, verification and operational gates remain. |
| WC-018 | Payments are operational. | Not claimed | mock-up only | No provider or money movement. |
| WC-019 | Realtime multi-user chat works for controlled proof accounts. | Demonstrated | two-way no-refresh messages in issue #41 | Not claimed for real users or production scale. |
| WC-020 | The relational schema is versioned and replayable. | Demonstrated in CI and remotely | migration reset, CI and protected workflows | Remote project is non-production and synthetic-only. |
| WC-021 | Parallel first likes create one normalized match. | Demonstrated in CI and browser proof | race tests and issue #41 | Scale beyond the proof is not measured. |
| WC-022 | Parallel contact opens consume one right and create one conversation. | Demonstrated in CI; one browser conversation accepted | race tests and issue #41 | Production entitlements are absent. |
| WC-023 | Private domains isolate authenticated accounts with RLS. | Demonstrated in CI and controlled remote proof | pgTAP and issue #41 | Broader adversarial testing remains. |
| WC-024 | Portrait storage is private and access is policy-scoped. | Demonstrated in CI and controlled remote proof | storage policies, signed delivery and cleanup evidence | A previously issued signed URL remains valid until expiry. |
| WC-025 | Moderation/audit records are unavailable to ordinary users. | Demonstrated in CI and controlled browser proof | grants/RLS tests and sanitized UI evidence | No moderator console or SLA. |
| WC-026 | A production backend is operational. | Not claimed | N/A | `RendezvueProject` is a non-production proof project. |
| WC-027 | Blocking freezes match/conversation and revokes signals. | Demonstrated in CI and browser proof | RPC tests and issue #41 | Operational moderation response remains absent. |
| WC-028 | Users cannot choose feedback credibility or report state. | Demonstrated | controlled RPCs | Credibility evolution and retaliation analysis remain. |
| WC-029 | High-severity reports create a hidden moderation case. | Demonstrated in CI | report RPC tests | No operational review queue. |
| WC-030 | Account deletion cascades relational records and anonymises retained audit IDs. | Demonstrated in CI and remote cleanup | deletion tests, PR #52 and issue #41 | Regulatory retention policy remains to be approved. |
| WC-031 | PKCE magic-link exchange, session restore, sign-out and re-authentication work in isolated browser profiles. | Demonstrated | issue #41 | Recovery execution and operational duplicate handling remain constrained. |
| WC-032 | Onboarding progress, prompts and interests persist in owner-scoped backend records. | Demonstrated in CI and remote two-account proof | backend suite and issue #41 | Product UX refinement remains. |
| WC-033 | Another account cannot read or update private draft onboarding content. | Demonstrated in CI and controlled proof | cross-account tests and issue #41 | Broader penetration testing remains. |
| WC-034 | Profile publication is a server operation with minimum content gates. | Demonstrated in CI and browser proof | publication RPC tests and issue #41 | Age/student/liveness evidence is not authoritative. |
| WC-035 | Onboarding snapshots omit evidence references and portrait paths. | Demonstrated in CI | snapshot tests | Broader inference/privacy review remains. |
| WC-036 | A private Supabase proof project exists in an EU region. | Demonstrated | dashboard and workflow evidence | DPA/access review remains; not production readiness. |
| WC-037 | The Supabase-connected browser build is separate from the old local-demo concept build. | Demonstrated | separate paths and artifact validation | Broader onboarding/discovery/chat visual integration still needs product review. |
| WC-038 | The browser build excludes server credentials. | Demonstrated | recursive credential scan and production verifier | Publishable key is intentionally embedded; RLS is authoritative. |
| WC-039 | The repository migration set is deployed to the proof project. | Demonstrated | protected workflow evidence including run `30854571921` | Environment remains synthetic-only. |
| WC-040 | Remote Auth and Data API health and controlled PKCE sessions pass. | Demonstrated | protected workflows and issue #41 | Provider SLA and operational account-restoration procedures remain unproven. |
| WC-041 | One browser Auth client handles callback exchange, onboarding, interactions and cleanup. | Demonstrated | artifact validation and completed proof | No scale or multi-device claim. |
| WC-042 | A published proof account can receive at most one proof contact right. | Demonstrated | controlled RPC, pgTAP and browser proof | Not production pricing or issuance. |
| WC-043 | Matched accounts can open one conversation and exchange participant-only messages. | Demonstrated | RLS/RPC tests and issue #41 | Production load and abuse controls remain. |
| WC-044 | Matched portrait access stops when contact ends or is blocked. | Demonstrated | storage tests and server-authoritative revocation evidence | Already-issued signed URLs expire rather than being remotely revoked. |
| WC-045 | Normal contact ending closes match/conversation and revokes both signals. | Demonstrated | server RPC, tests and issue #41 | User-facing recovery/appeal policy remains. |
| WC-046 | The staging harness supports the full proof journey. | Demonstrated | completed issue #41 | The advanced harness remains operator-oriented even though account entry is now product-facing. |
| WC-047 | An authenticated proof account can delete private objects, Auth user and relational records. | Demonstrated for both proof accounts | issue #41 and `docs/WP-057-COMPLETION.md` | Real-user deletion operations and retention notices remain. |
| WC-048 | Anonymous callers cannot invoke private account cleanup. | Demonstrated | local and remote HTTP 401 checks | Authenticated destructive action still requires exact confirmation. |
| WC-049 | No owner-local runtime is required. | Demonstrated | GitHub, Cloudflare and browser proof | Controlled mailbox/browser actions remain manual. |
| WC-050 | Supabase Auth Site URL and allow-list use the canonical Cloudflare URL. | Demonstrated remotely | protected workflows and successful PKCE exchanges | Direct Pages variables remain preferred over bootstrap. |
| WC-051 | Hugging Face is no longer an application deployment target. | Implemented | removed workflows/helpers and ADR | Historical Spaces may remain reachable. |
| WC-052 | Canonical staging is `https://rendezvue-private-preview.pages.dev/`. | Demonstrated | production verification and issue #35 | Real-user admission remains unauthorized. |
| WC-053 | Cloudflare receives only browser-safe Supabase configuration. | Demonstrated | build contract and production metadata | Transition bootstrap should be replaced by direct variables. |
| WC-054 | Ten Auth-linked synthetic discovery profiles and portraits were seeded. | Demonstrated remotely | synthetic seed summary | Does not authorize real users. |
| WC-055 | Numeric passwordless e-mail OTP is available on the current proof project. | Not claimed; disproven for current plan/provider | protected provider error | Custom SMTP or qualifying plan required. |
| WC-056 | Cloudflare accepts one-time PKCE codes and rejects implicit token fragments. | Demonstrated | artifact validation and controlled callbacks | Magic-link delivery remains provider-dependent. |
| WC-057 | Cloudflare can bootstrap from previously public validated browser configuration when native variables are absent. | Demonstrated | PR #40 and production verification | Transitional mechanism only. |
| WC-058 | The complete two-account interaction and cleanup sequence succeeds end to end. | Demonstrated | issue #41 and `docs/WP-057-COMPLETION.md` | Controlled synthetic accounts only. |
| WC-059 | Cleanup prevents later session restoration in both isolated browser profiles. | Demonstrated | post-cleanup refresh observation in issue #41 | Multi-device global revocation beyond the controlled profiles is not separately measured. |
| WC-060 | Deleting the account that opened a conversation succeeds after terminal interaction state. | Demonstrated | PR #52, regression test and protected run `30805876163` | Retention policy for future production data remains unresolved. |
| WC-061 | Existing-account sign-in/recovery cannot silently create a new Auth account. | Demonstrated in source and artifact validation | PR #55, adapter tests and WP-065 artifact gate | Does not resolve genuine duplicate accounts or complete mailbox-loss execution proof. |
| WC-062 | Account lifecycle and retention candidates are non-destructive and ordinary users cannot enumerate them. | Demonstrated locally and remotely | PR #56, pgTAP, issue #54 and protected run `30841983060` | No policy is active, no scheduler exists and production retention approval remains outstanding. |
| WC-063 | Duplicate-account and mailbox-loss requests can be recorded as service-only audited investigation cases without granting account mutation powers. | Demonstrated locally and remotely | PR #63, 38 pgTAP assertions, issue #62 and protected run `30843828895` | No account merge or operational account restoration is approved. |
| WC-064 | Identity evidence can be classified and independently reviewed under case-kind thresholds without executing an account action. | Demonstrated locally and remotely | PR #66, 62 pgTAP assertions, issue #65 and protected run `30850822452` | This is a technical classification/four-eyes contract, not an approved real-world identity policy. |
| WC-065 | A mailbox-loss-only registered-email replacement can be gated by evidence, two-person approval, hashed addresses and an internal idempotent executor. | Foundation demonstrated locally and remotely | PR #69, 58 pgTAP assertions, issue #68, protected runs `30854571921` and `30854641803` | No remote address was changed because no disposable target mailbox is available; no real-user operation, account merge or support password change is authorized. |
| WC-066 | Canonical staging presents a bilingual, mobile-first account and recovery experience without exposing account existence or browser-accessible support mutation. | Demonstrated in source, CI and canonical deployment | issue #71, PR #72, WP-066 validator, runs `30857567262` and `30857567127` | Synthetic staging only; no operational support console, disposable-mailbox execution proof or real-user authorization. |
