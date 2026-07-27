# Changelog

All notable project changes are recorded here. The project follows a lightweight form of Keep a Changelog and uses pre-release semantic versions during the pilot.

## [Unreleased]

### Planned

- Connect a real institutional-email delivery service.
- Select and integrate an age-assurance method.
- Add automated blink and head-turn liveness analysis.
- Replace the local avatar stylization preview with an approved generation service.
- Add persistent backend services for accounts, matches, messages and moderation.

## [0.1.0-alpha.4] - 2026-07-27

### Fixed

- Corrected hosted verification for Hugging Face Static Spaces by preferring the `.static.hf.space` hostname.
- Added fallback verification for `/index.html` and the ordinary `.hf.space` hostname.

### Added

- Added regression tests for Hugging Face Static Space URL derivation and normalization.
- Added CI execution of the Python deployment-helper tests.

## [0.1.0-alpha.3] - 2026-07-27

### Fixed

- Replaced the paid Docker Space creation path after Hugging Face returned HTTP 402 for a free account.
- Changed hosted verification from a Docker `/healthz` endpoint to the direct static page and an embedded Rendezvue deployment marker.

### Added

- Added a deterministic `npm run build:static` output in `dist/`.
- Added Static Space metadata using `app_build_command` and `app_file`.
- Added validation of the generated static artifact and hosted deployment marker.

### Changed

- The pilot deployment now creates and synchronizes a free Hugging Face Static Space.
- Docker remains a future backend-capable option but is no longer required for the browser-only prototype.

## [0.1.0-alpha.2] - 2026-07-27

### Added

- Added automatic creation or confirmation of the public Hugging Face Docker Space.
- Added runtime polling, `/healthz` verification and publication of the verified pilot URL in the GitHub Actions summary.
- Added a web-interface-only activation guide requiring no local Git, Node.js or Docker installation.
- Added CI syntax validation for the Hugging Face deployment helper.

### Changed

- Upgraded the deployment workflow from a silent gated mirror to an explicit configuration, deployment and verification pipeline.
- Marked the foundation and interaction prototype milestone as approved and merged.

## [0.1.0-alpha.1] - 2026-07-27

### Added

- Established GitHub as the sole source of truth and Hugging Face as a one-way pilot deployment target.
- Added requirements, roadmap, work packages, work claims, handover and architecture-decision records.
- Added a dependency-light mobile HTML5/PWA prototype.
- Added institutional-domain validation fixtures for selected Moroccan institutions.
- Added browser camera capture with four-second in-memory recording and best-frame extraction.
- Added a local posterization effect as an explicitly non-production avatar pipeline substitute.
- Added profile onboarding, privacy controls, discovery, contextual likes, matching, chat demonstration, blocking and reporting UX.
- Added PWA manifest, service worker, icons, Docker image and Nginx configuration.
- Added static validation, domain tests and GitHub Actions continuous integration.
- Added an official Hugging Face Hub synchronization workflow, gated by repository configuration.
