# Work claims register

This register prevents prototype behavior from being overstated.

| Claim ID | Claim | Status | Evidence | Limitation |
|---|---|---|---|---|
| WC-001 | GitHub is documented as the sole source of truth. | Demonstrated | README, ADR-0001, deployment workflow | Repository branch protection is not yet configured. |
| WC-002 | The repository can be mirrored to a free Hugging Face Static Space. | Implemented, pending execution | Official `hub-sync` workflow, Static Space metadata and deployment helper | Requires the correction to reach `main` and a successful authenticated deployment. |
| WC-003 | The prototype validates whether an entered institutional email domain matches a selected fixture institution. | Demonstrated | Domain unit tests and onboarding UI | This does not send email or prove mailbox control. Fixture list is incomplete and not authoritative. |
| WC-004 | The prototype records a four-second live camera clip in compatible browsers. | Demonstrated in code | `camera.js`, browser smoke test | It does not yet automatically verify blink/head turn or resist replay attacks. |
| WC-005 | Source video is not uploaded or persisted by the prototype. | Demonstrated by architecture | In-memory Blob handling, no network API | Browser/runtime behavior still requires privacy review; production architecture does not yet exist. |
| WC-006 | The prototype generates a stylized visual from a selected camera frame. | Demonstrated | Local canvas posterization | This is not the production AI avatar model and is not a validated look-alike transformation. |
| WC-007 | The prototype demonstrates privacy controls, discovery, contextual likes, matching and chat. | Demonstrated | Browser interaction flow | State is local and synthetic; no persistent or multi-user backend exists. |
| WC-008 | The prototype is installable as a PWA on supporting browsers. | Implemented | Manifest, icons and service worker | Installation and web push require device-specific field testing; push is not implemented. |
| WC-009 | The Docker target builds and serves the prototype on port 7860. | Demonstrated in CI | Successful Docker build, Dockerfile, Nginx configuration and health endpoint | New Docker Spaces require a paid Hugging Face plan and are not used for this free pilot. |
| WC-010 | The product is safe for live users. | Not claimed | N/A | Age assurance, real verification, moderation operations, security review and legal assessment are incomplete. |
| WC-011 | The deployment workflow can create a Static Space, synchronize source and verify the served Rendezvue page. | Implemented, pending execution | `deploy-huggingface.yml`, `scripts/huggingface_space.py`, static build and deployment guide | Must be confirmed by a successful hosted run after merge. |
| WC-012 | A public Rendezvue Hugging Face pilot is currently live. | Not claimed | N/A | The corrected Static Space deployment has not completed yet. |
| WC-013 | The original Docker Space path is unavailable on the configured free Hugging Face account. | Demonstrated | Workflow run #3 returned HTTP 402 at Space creation | This is a hosting-plan constraint, not an application or token failure. |
