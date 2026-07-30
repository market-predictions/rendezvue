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
| WC-019 | Real-time multi-user chat is operational. | Not claimed | local synthetic chat only | Requires provisioned backend and authorization proof. |
| WC-020 | A server-authoritative relational schema is versioned in GitHub. | Implemented on backend branch | Supabase migration and backend tests | Migration still requires clean database execution proof. |
| WC-021 | Backend likes can create exactly one reciprocal match. | Implemented as SQL contract | `record_attraction_signal` function | Concurrency behaviour is not yet database-tested. |
| WC-022 | A contact entitlement can create one conversation idempotently. | Implemented as SQL contract | `open_match_conversation` function | Transaction requires local and remote integration tests. |
| WC-023 | Private domains use Row Level Security. | Implemented as migration contract | table RLS and policies | Cross-account isolation is not yet executed against a running database. |
| WC-024 | Privacy portrait storage is private and owner-scoped. | Implemented as migration contract | private bucket and storage policies | Upload/download behaviour is not yet field-tested. |
| WC-025 | Moderation and audit records are inaccessible to normal authenticated users. | Implemented as migration contract | revoked grants and absence of user policies | Operational moderator roles and console do not exist. |
| WC-026 | A remote production backend is operational. | Not claimed | N/A | No project, region, DPA, secrets or real-user environment is provisioned. |
