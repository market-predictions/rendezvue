# Work claims register

This register prevents prototype and backend behaviour from being overstated.

| ID | Claim | Status | Evidence | Limitation |
|---|---|---|---|---|
| WC-001 | GitHub is the sole source of truth. | Demonstrated | repository, ADRs, CI | Branch protection remains an operational setting. |
| WC-002 | GitHub produces the static artifacts consumed by Cloudflare Pages. | Implemented; production verification pending | build scripts, Cloudflare PR previews and CI | A commit-matched production deployment from `main` must still pass after the migration merge. |
| WC-003 | The Supabase-connected staging application is reachable through Cloudflare Pages. | Partially demonstrated | successful Cloudflare branch previews | The fixed production URL and merged commit have not yet been verified. |
| WC-004 | Membership is adult, single and serious rather than student-only. | Implemented | domain validation and onboarding | Eligibility is self-declared in the proof. |
| WC-005 | Student status is an optional verified-benefit layer. | Implemented as concept | life-stage flow | Institution data and verification are fixtures. |
| WC-006 | Marital history, children and child preference are separate fields. | Implemented | domain model and tests | Values are self-declared. |
| WC-007 | The browser produces four fuzzy privacy portraits. | Implemented | renderer and UI | Blur is not anonymity or liveness. |
| WC-008 | The concept supports buttons and swipes for pass/like. | Implemented | handlers and tests | Public concept signals remain local-demo only. |
| WC-009 | Passes do not lower general visibility. | Demonstrated by model | no standing linkage | Production ranking does not exist. |
| WC-010 | Direct/contextual likes create a reciprocal pilot match. | Implemented | concept flow | The local concept is not multi-user. |
| WC-011 | A simulated contact right opens local-demo text chat. | Implemented | concept flow | No payment or second real participant. |
| WC-012 | Private feedback is separate from safety reports. | Implemented | model and flows | Concept feedback has no ranking effect. |
| WC-013 | Public stars, downvotes and popularity counts are absent. | Demonstrated | UI and requirements | Regression guards remain necessary. |
| WC-014 | Dutch is default and English is available. | Implemented and tested | i18n tests | Representative copy review remains. |
| WC-015 | Faith is self-described without piety scoring. | Implemented | model and tests | Article 9 production basis unresolved. |
| WC-016 | The concept resumes browser-local onboarding. | Implemented | schema-versioned browser state | Browser storage is not a secure account. |
| WC-017 | The product is safe/lawful for real users. | Not claimed | N/A | Legal, moderation, verification and operational gates remain. |
| WC-018 | Payments are operational. | Not claimed | mock-up only | No provider or money movement. |
| WC-019 | Realtime multi-user chat is operational for users. | Not claimed | private harness and database contracts | Controlled two-account Cloudflare execution remains before this can be claimed even for proof accounts. |
| WC-020 | The relational schema is versioned and replayable. | Demonstrated in CI and remotely | migration reset, CI and protected workflow evidence | The remote project is non-production and synthetic-only. |
| WC-021 | Parallel first likes create one normalized match. | Demonstrated in GitHub Actions | race proof | Browser evidence remains. |
| WC-022 | Parallel contact opens consume one right and create one conversation. | Demonstrated in GitHub Actions | race proof | Browser evidence remains. |
| WC-023 | Private domains isolate authenticated accounts with RLS. | Demonstrated in GitHub Actions | pgTAP suites | Controlled remote negative testing remains. |
| WC-024 | Portrait storage is private and owner-scoped by policy. | Demonstrated as schema/policy | bucket and policies | Actual signed delivery and authenticated cleanup remain to be executed remotely. |
| WC-025 | Moderation/audit records are unavailable to ordinary users. | Demonstrated in GitHub Actions | grants/RLS tests | No moderator console or SLA. |
| WC-026 | A production backend is operational. | Not claimed | N/A | `RendezvueProject` is a private non-production proof project and real-user admission is unauthorized. |
| WC-027 | Blocking freezes match/conversation and revokes signals. | Demonstrated in GitHub Actions | RPC and tests | Controlled Cloudflare browser proof remains. |
| WC-028 | Users cannot choose feedback credibility or report state. | Demonstrated in GitHub Actions | controlled RPCs | Credibility evolution and retaliation analysis remain. |
| WC-029 | High-severity reports create a hidden moderation case. | Demonstrated in GitHub Actions | report RPC tests | No operational review queue. |
| WC-030 | Account deletion cascades relational records and anonymises retained audit IDs. | Demonstrated in GitHub Actions | deletion tests | Authenticated remote cleanup and actual object deletion remain to be observed. |
| WC-031 | An e-mail OTP/session adapter is implemented and provider-injectable. | Implemented and unit-tested | auth-session tests | Real OTP delivery and browser session recovery remain to be proven on Cloudflare. |
| WC-032 | Onboarding progress, prompts and interests persist in owner-scoped backend records. | Demonstrated in GitHub Actions | backend suite | Controlled remote two-account persistence remains. |
| WC-033 | Another authenticated account cannot read or update draft onboarding content. | Demonstrated in GitHub Actions | cross-account onboarding tests | Controlled remote browser evidence remains. |
| WC-034 | Profile publication is a server operation with minimum content gates. | Demonstrated in GitHub Actions | publication RPC tests | Age/student/liveness evidence is not authoritative. |
| WC-035 | Onboarding snapshots omit student evidence references and portrait object paths. | Demonstrated in GitHub Actions | snapshot tests | Broader inference/privacy review remains. |
| WC-036 | A private Supabase proof project exists in an EU region. | Demonstrated | dashboard and workflow evidence: Healthy, West EU (Ireland), Nano | DPA/access review remains; this is not production readiness. |
| WC-037 | The Supabase-connected browser build is separate from the old local-demo concept build. | Demonstrated in CI | separate application paths and artifact validation | Cloudflare production deployment of the merged build remains to be verified. |
| WC-038 | The browser build excludes server credentials. | Demonstrated | build allowlist and recursive credential scan | A publishable browser key is intentionally embedded; RLS remains the security boundary. |
| WC-039 | The complete repository migration set is deployed to the private project. | Demonstrated | protected workflow evidence | The environment remains non-production and synthetic-only. |
| WC-040 | Remote Auth and Data API platform health pass for the private project. | Demonstrated | protected workflow evidence | End-user OTP sessions remain unproven. |
| WC-041 | One browser Auth client handles OTP, onboarding and interactions. | Implemented and artifact-validated | shared generated client and validator | Requires controlled Cloudflare execution to prove browser behaviour. |
| WC-042 | A published synthetic proof account can receive at most one proof contact right, including after consumption. | Demonstrated in GitHub Actions | controlled RPC and pgTAP tests | This is not production pricing or entitlement issuance. |
| WC-043 | Active matched accounts can open one conversation and exchange participant-only messages. | Demonstrated in GitHub Actions | RLS, RPC and pgTAP tests | Remote realtime execution remains. |
| WC-044 | Matched portrait access is active-match-only and stops when contact ends or is blocked. | Demonstrated in GitHub Actions as policy/RPC | storage policy and pgTAP tests | Actual signed URL delivery remains to be executed remotely. |
| WC-045 | Normal contact ending closes match/conversation and revokes both attraction signals. | Demonstrated in GitHub Actions | server RPC and tests | Remote browser execution remains. |
| WC-046 | The staging harness exposes OTP, onboarding, contact, realtime messaging, signed portrait, block, report, feedback and cleanup controls. | Implemented and artifact-validated | application and validator | Behavioural proof is pending on Cloudflare Pages. |
| WC-047 | An authenticated proof account can request provider-orchestrated deletion of its private portraits, Auth user and relational records. | Implemented, CI-validated and remotely deployed | Edge Function tests and protected deployment | Remote authenticated deletion remains unproven. |
| WC-048 | Anonymous callers cannot invoke private account cleanup. | Demonstrated in CI and remotely | Edge Runtime and remote HTTP 401 checks | An authenticated destructive run still requires acceptance evidence. |
| WC-049 | No owner-local runtime is required; GitHub and Cloudflare provide the web delivery path. | Implemented; final deployment proof pending | GitHub source, Cloudflare project previews and build contract | Production Pages verification must match the merged commit. |
| WC-050 | Supabase Auth Site URL and allow-list use the canonical Cloudflare Pages URL. | Claimed as active work | issue #35 and migration workflow changes | Not demonstrated until the protected post-merge configuration workflow succeeds. |
| WC-051 | Hugging Face is no longer an application deployment target. | Claimed as active work | issue #35 and retirement changes | Existing Spaces may remain reachable as stale historical artifacts until manually removed or made inaccessible. |
| WC-052 | The canonical staging URL is `https://rendezvue-private-preview.pages.dev/`. | Decision accepted; deployment pending | issue #35 and roadmap v2.0 | Must be confirmed after merge by fetching commit-matched deployment metadata. |
| WC-053 | Cloudflare Pages receives only browser-safe Supabase configuration. | Implemented in build contract; remote verification pending | build script and artifact validator | Cloudflare project environment settings are external operational configuration. |
| WC-054 | Ten Auth-linked synthetic profiles, ten published discovery profiles and ten selected private portraits exist. | Demonstrated remotely | successful synthetic seed summary | This does not authorize real-user admission. |
