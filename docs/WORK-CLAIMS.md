# Work claims register

This register prevents prototype behavior from being overstated.

| Claim ID | Claim | Status | Evidence | Limitation |
|---|---|---|---|---|
| WC-001 | GitHub is documented as the sole source of truth. | Demonstrated | README, ADR-0001, deployment workflow | Repository branch protection is not yet configured. |
| WC-002 | The repository can be mirrored to a Hugging Face Docker Space. | Implemented, unexecuted | `deploy-huggingface.yml` using the official sync action | Requires `HF_SPACE_ID` and `HF_TOKEN`; no Space identifier was provided. |
| WC-003 | The prototype validates whether an entered institutional email domain matches a selected fixture institution. | Demonstrated | Domain unit tests and onboarding UI | This does not send email or prove mailbox control. Fixture list is incomplete and not authoritative. |
| WC-004 | The prototype records a four-second live camera clip in compatible browsers. | Demonstrated in code | `camera.js`, local smoke test | It does not yet automatically verify blink/head turn or resist replay attacks. |
| WC-005 | Source video is not uploaded or persisted by the prototype. | Demonstrated by architecture | In-memory Blob handling, no network API | Browser/runtime behavior still requires privacy review; production architecture does not yet exist. |
| WC-006 | The prototype generates a stylized visual from a selected camera frame. | Demonstrated | Local canvas posterization | This is not the production AI avatar model and is not a validated look-alike transformation. |
| WC-007 | The prototype demonstrates privacy controls, discovery, contextual likes, matching and chat. | Demonstrated | Browser interaction flow | State is local and synthetic; no persistent or multi-user backend exists. |
| WC-008 | The prototype is installable as a PWA on supporting browsers. | Implemented | Manifest, icons and service worker | Installation and web push require device-specific field testing; push is not implemented. |
| WC-009 | The Docker target serves the prototype on port 7860. | Implemented, CI pending | Dockerfile, Nginx configuration and health check | Docker was unavailable in the local tool environment; GitHub CI must validate the image. |
| WC-010 | The product is safe for live users. | Not claimed | N/A | Age assurance, real verification, moderation operations, security review and legal assessment are incomplete. |
