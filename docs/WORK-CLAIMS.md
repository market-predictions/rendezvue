# Work claims register

This register prevents prototype behavior from being overstated.

| Claim ID | Claim | Status | Evidence | Limitation |
|---|---|---|---|---|
| WC-001 | GitHub is documented as the sole source of truth. | Demonstrated | README, ADR-0001, deployment workflow | Repository branch protection is not yet configured. |
| WC-002 | GitHub can generate a complete free Hugging Face Static Space artifact. | Demonstrated in CI after merge | `build:static`, `build:hf`, artifact validation and deployment metadata template | Hosted serving still requires a successful authenticated upload. |
| WC-003 | The prototype validates whether an entered institutional email domain matches a selected fixture institution. | Demonstrated | Domain unit tests and onboarding UI | This does not send email or prove mailbox control. Fixture list is incomplete and not authoritative. |
| WC-004 | The prototype records a four-second live camera clip in compatible browsers. | Demonstrated in code | `camera.js`, browser smoke test | It does not yet automatically verify blink/head turn or resist replay attacks. |
| WC-005 | Source video is not uploaded or persisted by the prototype. | Demonstrated by architecture | In-memory Blob handling, no network API | Browser/runtime behavior still requires privacy review; production architecture does not yet exist. |
| WC-006 | The prototype generates a stylized visual from a selected camera frame. | Demonstrated | Local canvas posterization | This is not the production AI avatar model and is not a validated look-alike transformation. |
| WC-007 | The prototype demonstrates privacy controls, discovery, contextual likes, matching and chat. | Demonstrated | Browser interaction flow | State is local and synthetic; no persistent or multi-user backend exists. |
| WC-008 | The prototype is installable as a PWA on supporting browsers. | Implemented | Manifest, icons and service worker | Installation and web push require device-specific field testing; push is not implemented. |
| WC-009 | The Docker target builds and serves the prototype on port 7860. | Demonstrated in CI | Successful Docker build, Dockerfile, Nginx configuration and health endpoint | New Docker Spaces require a paid Hugging Face plan and are not used for this free pilot. |
| WC-010 | The product is safe for live users. | Not claimed | N/A | Age assurance, real verification, moderation operations, security review and legal assessment are incomplete. |
| WC-011 | The deployment workflow can create a Static Space, upload the prebuilt artifact and verify the served page. | Implemented, pending hosted execution | Deployment workflow, `hf upload`, URL verifier, deployment guide | Must be confirmed by a successful run after merge. |
| WC-012 | A public Rendezvue Hugging Face pilot is currently live. | Not claimed | N/A | No successful public-page verification has been recorded yet. |
| WC-013 | The original Docker Space path is unavailable on the configured free Hugging Face account. | Demonstrated | Workflow run #3 returned HTTP 402 at Space creation | This is a hosting-plan constraint, not an application or token failure. |
| WC-014 | Source synchronization reached the free Static Space but did not produce a reachable page within 20 minutes. | Demonstrated | Workflow run #5 created and synchronized the Space, then received HTTP 404 during verification | The result motivated direct upload of the prebuilt artifact; it does not indicate invalid credentials. |
