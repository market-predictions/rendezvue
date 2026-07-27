# Work claims register

This register prevents prototype behavior from being overstated.

| Claim ID | Claim | Status | Evidence | Limitation |
|---|---|---|---|---|
| WC-001 | GitHub is documented as the sole source of truth. | Demonstrated | README, ADR-0001, deployment workflow | Repository branch protection is not yet configured. |
| WC-002 | The repository can be mirrored to a Hugging Face Docker Space. | Implemented, externally blocked | Official `hub-sync` workflow and deployment helper | Requires an authenticated Hugging Face token and target Space identifier in GitHub Actions settings. |
| WC-003 | The prototype validates whether an entered institutional email domain matches a selected fixture institution. | Demonstrated | Domain unit tests and onboarding UI | This does not send email or prove mailbox control. Fixture list is incomplete and not authoritative. |
| WC-004 | The prototype records a four-second live camera clip in compatible browsers. | Demonstrated in code | `camera.js`, browser smoke test | It does not yet automatically verify blink/head turn or resist replay attacks. |
| WC-005 | Source video is not uploaded or persisted by the prototype. | Demonstrated by architecture | In-memory Blob handling, no network API | Browser/runtime behavior still requires privacy review; production architecture does not yet exist. |
| WC-006 | The prototype generates a stylized visual from a selected camera frame. | Demonstrated | Local canvas posterization | This is not the production AI avatar model and is not a validated look-alike transformation. |
| WC-007 | The prototype demonstrates privacy controls, discovery, contextual likes, matching and chat. | Demonstrated | Browser interaction flow | State is local and synthetic; no persistent or multi-user backend exists. |
| WC-008 | The prototype is installable as a PWA on supporting browsers. | Implemented | Manifest, icons and service worker | Installation and web push require device-specific field testing; push is not implemented. |
| WC-009 | The Docker target builds and serves the prototype on port 7860. | Demonstrated in CI | Successful milestone 0.1 CI Docker build, Dockerfile, Nginx configuration and health endpoint | The Docker image has not yet been observed running in Hugging Face. |
| WC-010 | The product is safe for live users. | Not claimed | N/A | Age assurance, real verification, moderation operations, security review and legal assessment are incomplete. |
| WC-011 | The deployment workflow can create the Space, synchronize source, wait for runtime and verify `/healthz`. | Implemented, unexecuted | `deploy-huggingface.yml`, `scripts/huggingface_space.py`, deployment guide and CI syntax check | A real deployment cannot execute until `HF_TOKEN` and `HF_SPACE_ID` are configured. |
| WC-012 | A public Rendezvue Hugging Face pilot is currently live. | Not claimed | N/A | No authenticated Hugging Face deployment has completed yet. |
