# Work claims register

This register prevents prototype and backend behaviour from being overstated.

| ID | Claim | Status | Evidence | Limitation |
|---|---|---|---|---|
| WC-001 | GitHub is the sole source of truth. | Demonstrated | repository, ADRs, CI | Branch protection remains an operational setting. |
| WC-002 | GitHub generates the Hugging Face Static Space artifact. | Demonstrated | build scripts and CI | Deployability is not live-user readiness. |
| WC-003 | The public synthetic PWA is reachable. | Demonstrated | hosted URL and workflow evidence | Mobile field review remains open. |
| WC-004 | Membership is adult, single and serious rather than student-only. | Implemented and hosted | domain validation and onboarding | Eligibility is self-declared in the concept pilot. |
| WC-005 | Student status is an optional verified-benefit layer. | Implemented as concept | life-stage flow | Institution data and verification are fixtures. |
| WC-006 | Marital history, children and child preference are separate fields. | Implemented | domain model and tests | Values are self-declared. |
| WC-007 | The browser produces four fuzzy privacy portraits. | Implemented | renderer and UI | Blur is not anonymity or liveness. |
| WC-008 | The pilot supports buttons and swipes for pass/like. | Implemented | handlers and tests | Public signals remain local. |
| WC-009 | Passes do not lower general visibility. | Demonstrated by model | no standing linkage | Production ranking does not exist. |
| WC-010 | Direct/contextual likes create a reciprocal pilot match. | Implemented | public pilot flow | Public pilot is not multi-user. |
| WC-011 | A simulated contact right opens local text chat. | Implemented | pilot flow | No payment or second real participant. |
| WC-012 | Private feedback is separate from safety reports. | Implemented | model and flows | Public pilot feedback has no ranking effect. |
| WC-013 | Public stars, downvotes and popularity counts are absent. | Demonstrated | UI and requirements | Regression guards remain necessary. |
| WC-014 | Dutch is default and English is available. | Implemented and tested | i18n tests | Representative copy review remains. |
| WC-015 | Faith is self-described without piety scoring. | Implemented | model and tests | Article 9 production basis unresolved. |
| WC-016 | The public prototype resumes local onboarding. | Implemented | local schema-versioned state | Browser storage is not a secure account. |
| WC-017 | The product is safe/lawful for real users. | Not claimed | N/A | Legal, moderation, verification and operational gates remain. |
| WC-018 | Payments are operational. | Not claimed | mock-up only | No provider or money movement. |
| WC-019 | Real-time multi-user chat is operational. | Not claimed | local chat only | Needs private provisioned backend/client integration. |
| WC-020 | The relational schema is versioned and replayable. | Demonstrated locally | migration reset and CI | No remote project. |
| WC-021 | Parallel first likes create one normalized match. | Demonstrated locally | PR #19 race proof | Provider-hosted evidence remains. |
| WC-022 | Parallel contact opens consume one right and create one conversation. | Demonstrated locally | PR #19 race proof | Provider-hosted evidence remains. |
| WC-023 | Private domains isolate authenticated accounts with RLS. | Demonstrated locally | pgTAP suites | Private preview evidence remains. |
| WC-024 | Portrait storage is private and owner-scoped by policy. | Demonstrated as schema/policy | bucket and policies | Upload, signed delivery and object cleanup untested. |
| WC-025 | Moderation/audit records are unavailable to ordinary users. | Demonstrated locally | grants/RLS tests | No moderator console or SLA. |
| WC-026 | A remote production backend is operational. | Not claimed | N/A | No project, region, DPA, credentials or real-user environment. |
| WC-027 | Blocking freezes match/conversation and revokes signals. | Demonstrated locally | RPC and tests | Unblock/rematch policy absent. |
| WC-028 | Users cannot choose feedback credibility or report state. | Demonstrated locally | controlled RPCs | Credibility evolution/retaliation analysis remain. |
| WC-029 | High-severity reports create a hidden moderation case. | Demonstrated locally | report RPC tests | No operational review queue. |
| WC-030 | Account deletion cascades relational records and anonymises retained audit IDs. | Demonstrated locally | deletion tests | Object bytes need provider cleanup. |
| WC-031 | A magic-link/session adapter is implemented and provider-injectable. | Implemented and unit-tested | auth-session tests | No real email delivery or remote Auth project. |
| WC-032 | Onboarding progress, prompts and interests persist in owner-scoped backend records. | Demonstrated locally | 118 pgTAP assertions | Not connected to the public PWA. |
| WC-033 | Another authenticated account cannot read or update draft onboarding content. | Demonstrated locally | cross-account onboarding tests | Remote/private preview evidence remains. |
| WC-034 | Profile publication is a server operation with minimum content gates. | Demonstrated locally | publication RPC tests | Age/student/liveness evidence is not authoritative. |
| WC-035 | Onboarding snapshots omit student evidence references and portrait object paths. | Demonstrated locally | snapshot tests | Broader inference/privacy review remains. |
