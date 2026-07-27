# Work claims register

This register prevents prototype behavior from being overstated.

| Claim ID | Claim | Status | Evidence | Limitation |
|---|---|---|---|---|
| WC-001 | GitHub is the sole source of truth. | Demonstrated | README, ADR-0001, workflows | Branch protection is not yet configured. |
| WC-002 | GitHub generates a complete free Static Space artifact. | Demonstrated | `build:static`, `build:hf`, CI validation | This proves deployability, not production safety. |
| WC-003 | The hosted PWA is publicly reachable. | Demonstrated | `https://solidprivacy-rendezvue.static.hf.space/`, deployment workflow | The currently public version remains a non-production prototype. |
| WC-004 | The pivot prototype covers MBO, HBO and WO. | Implemented, pending hosted verification | 39 typed fixtures and domain tests | The institutions and domains are synthetic pilot fixtures, not an authoritative registry. |
| WC-005 | Dutch is the default and English is available through a top-level switch. | Implemented, pending hosted verification | `lang=nl`, manifest language, i18n tests, UI switch | Full copy review by native target users remains pending. |
| WC-006 | The prototype checks whether an entered domain matches the selected fixture institution. | Demonstrated | Domain tests and onboarding | It sends no email and proves neither mailbox control nor current enrolment. |
| WC-007 | The product remains strictly 18+ across MBO, HBO and WO. | Implemented in prototype logic | Age tests and onboarding copy | Production age assurance is absent. |
| WC-008 | The prototype records a four-second live camera clip in compatible browsers. | Demonstrated in code | `camera.js` and hosted flow | It does not classify liveness or resist replay attacks. |
| WC-009 | Source video is not uploaded or persisted by the prototype. | Demonstrated by architecture | Browser-memory Blob handling and no API | Production processing and deletion evidence do not exist. |
| WC-010 | The local avatar renderer is more illustrated and less pixelized than the prior renderer. | Implemented, pending user review | Smoothing, edge extraction, warm grading and illustrated frame | It is not a production AI avatar and resemblance quality is unvalidated. |
| WC-011 | Faith is represented through self-selected descriptive categories rather than a piety score. | Implemented, pending hosted verification | Faith model, tests and UI | Legal basis and target-user validation remain incomplete. |
| WC-012 | Faith-practice visibility is private by default. | Demonstrated in unit test | `createInitialState()` and domain test | Other faith fields are still collected locally during the prototype flow. |
| WC-013 | The prototype does not infer religion from identity or behavior. | Implemented by design | No inference model or classification code | Production controls and audits remain to be designed. |
| WC-014 | The prototype demonstrates discovery, contextual likes, matching and chat with Dutch synthetic profiles. | Implemented, pending hosted verification | UI flow and demo data | No persistent or multi-user backend exists. |
| WC-015 | The PWA is installable on supporting browsers. | Implemented | Manifest, service worker and icons | Device-specific installation and push testing remain. |
| WC-016 | The retained Docker target builds. | Demonstrated in CI | Docker build | Docker is not used for the free Hugging Face pilot. |
| WC-017 | The product is safe or lawful for live users. | Not claimed | N/A | Age assurance, authoritative verification, moderation, security, DPIA and legal review are incomplete. |
| WC-018 | Belgium is supported. | Not claimed | N/A | Belgium is deferred until Dutch validation. |
