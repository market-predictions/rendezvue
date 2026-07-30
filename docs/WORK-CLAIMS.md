# Work claims register

This register prevents prototype and backend-foundation behaviour from being overstated.

| ID | Claim | Status | Evidence | Limitation |
|---|---|---|---|---|
| WC-001 | GitHub is the sole source of truth. | Demonstrated | repository, ADRs, CI | Branch protection remains an operational setting. |
| WC-002 | GitHub generates the Hugging Face Static Space artifact. | Demonstrated | build scripts and CI | Deployability is not live-user readiness. |
| WC-003 | The public synthetic PWA is reachable. | Demonstrated | hosted URL and workflow evidence | Mobile field review remains open. |
| WC-004 | Membership is modelled as adult, single and serious rather than student-only. | Implemented and hosted | domain validation and onboarding | Eligibility is self-declared in the concept pilot. |
| WC-005 | Student status is an optional verified-benefit layer. | Implemented as concept | life-stage flow and demo verification | Institution data and mailbox verification are fixtures. |
| WC-006 | Marital history, children and child preference are separate fields. | Implemented | domain model, tests and onboarding | Values are self-declared and not legally verified. |
| WC-007 | The browser produces four fuzzy privacy portraits from one capture. | Implemented | portrait renderer and selection UI | Blur is not anonymity or production liveness. |
| WC-008 | The pilot supports button and swipe pass/like actions. | Implemented | app interaction handlers and tests | Public signals are local and deterministic. |
| WC-009 | Passes do not lower a profile’s general visibility. | Demonstrated by model | no reputation linkage; tests | Production ranking does not yet exist. |
| WC-010 | Direct and contextual likes can create a reciprocal pilot match. | Implemented | app flow and synthetic data | Public pilot is not multi-user. |
| WC-011 | A simulated contact entitlement can open text chat. | Implemented | contact modal, entitlement and chat | No payment or second real participant exists. |
| WC-012 | Private structured feedback is separate from reports. | Implemented for UX | feedback flow and model docs | Feedback has no ranking or enforcement effect. |
| WC-013 | Public stars, downvotes and popularity counts are absent. | Demonstrated | UI and requirements | Future implementations require regression guards. |
| WC-014 | Dutch is default and English is available throughout. | Implemented and tested | i18n tests | Representative copy review remains. |
| WC-015 | Faith is self-described without piety scoring. | Implemented | domain model and tests | Article 9 production basis remains unresolved. |
| WC-016 | The prototype can resume local onboarding. | Implemented | schema-versioned local storage | Browser storage is not a secure persistent account. |
| WC-017 | The product is safe or lawful for real users. | Not claimed | N/A | Authentication, age assurance, moderation, DPIA, security and retention remain incomplete. |
| WC-018 | Payments or subscriptions are operational. | Not claimed | indicative mock-up only | No provider integration or money movement. |
| WC-019 | Real-time multi-user chat is operational. | Not claimed | local synthetic chat only | Requires a provisioned private backend and client integration. |
| WC-020 | A server-authoritative relational schema is versioned and replayable. | Demonstrated locally | empty-database reset, run `30579113891` | No remote project is provisioned. |
| WC-021 | Backend likes create one normalized reciprocal match under retries. | Demonstrated locally | two-account pgTAP suite | True parallel race testing remains. |
| WC-022 | One contact entitlement creates one conversation idempotently under retries. | Demonstrated locally | two-account pgTAP suite | True parallel entitlement-race testing remains. |
| WC-023 | Private domains use RLS and isolate two authenticated accounts. | Demonstrated locally | eligibility/family/faith pgTAP assertions | Private preview and provider-hosted evidence remain. |
| WC-024 | Privacy portrait storage is private and owner-scoped. | Demonstrated as schema/policy | private bucket and storage policies | Actual upload, signed delivery and provider-API deletion are not field-tested. |
| WC-025 | Moderation and audit records are inaccessible to normal authenticated users. | Demonstrated locally | grants, RLS and privilege pgTAP tests | Operational moderator roles and console do not exist. |
| WC-026 | A remote production backend is operational. | Not claimed | N/A | No project, region, DPA, secrets or real-user environment is provisioned. |
| WC-027 | Blocking is server-authoritative and freezes active interaction. | Demonstrated locally | block RPC, two-account pgTAP suite | Unblock/rematch policy is not implemented. |
| WC-028 | Users cannot choose feedback credibility or report moderation state. | Demonstrated locally | controlled RPCs and privilege tests | Credibility evolution and retaliation analysis remain. |
| WC-029 | High-severity reports create a hidden moderation case. | Demonstrated locally | report RPC and two-account pgTAP suite | No operational review queue or response SLA exists. |
| WC-030 | Account deletion cascades owned relational records and removes direct IDs from retained audit events. | Demonstrated locally | deletion pgTAP suite | Private object bytes still require provider-API cleanup orchestration. |
