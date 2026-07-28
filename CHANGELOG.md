# Changelog

All notable project changes are recorded here. The project follows a lightweight form of Keep a Changelog and uses pre-release semantic versions during the pilot.

## [Unreleased]

### Planned

- Replace Dutch institution/domain fixtures with a DUO/RIO-backed registry and separately verified student mailbox domains.
- Validate the faith profile with target users and establish the production Article 9 condition.
- Select a privacy-preserving age-assurance method.
- Add automated blink and head-turn liveness analysis.
- Evaluate a controlled server-side generative privacy portrait after the browser filter-grid trade-off is reviewed.
- Add persistent backend services and moderation operations.

## [0.2.0-alpha.4] - 2026-07-28

### Changed

- Replaced the single imposed ink-sketch avatar with four selectable browser-local privacy portraits.
- Introduced a 2×2 selection grid before profile creation.
- Enforced a minimum blur/privacy floor across every option; no raw or lightly edited selfie is available.
- Added a centered portrait crop, blurred surroundings and consistent neutral framing.

### Added

- Added Soft focus, Warm veil, Monochrome mist and Extra private recipes.
- Added Dutch and English filter names and recognisability/privacy labels.
- Added visible selection state, radio semantics and an explicit confirmation action.
- Added a downsampling blur fallback for browsers without dependable Canvas filter support.
- Added ADR-0006 and generated-artifact regression checks for the selection grid.

### Privacy

- All four previews are generated from the same selected frame in browser memory.
- The source capture and unselected previews are not uploaded by the prototype.
- Blur and tonal abstraction are not claimed to provide anonymity.

## [0.2.0-alpha.3] - 2026-07-28

### Changed

- Replaced the softened near-photo avatar treatment with a stronger monochrome ink-sketch abstraction.
- Removed photographic color, skin texture and continuous selfie shading from the public avatar output.
- Preserved broad visual cues through face/hair silhouette, contour lines, flat shadow masses and expression-level detail.
- Replaced the synthetic fallback with a matching line-art portrait.

### Added

- Added adaptive local contrast and Sobel contour extraction for browser-side sketch rendering.
- Added CI guards that prevent the previous near-photo overlay treatment from returning unnoticed.

### Privacy

- Increased intentional visual distance between the live selfie and public avatar while retaining a useful first impression.
- Continued to keep source capture browser-local in the prototype.
- The sketch remains recognisable and is not claimed to provide anonymity against determined recognition.

## [0.2.0-alpha.2] - 2026-07-28

### Added

- Published and marker-verified the Netherlands-first MBO/HBO/WO pilot at `https://solidprivacy-rendezvue.static.hf.space/`.
- Recorded deployment commit `30192de007e2de85bd95ef6a3a4ff57155dd4d82` and workflow run `30311060515`.

### Changed

- Moved WP-016 from implementation to owner-review status.
- Updated roadmap, work claims, work packages and handover to reflect successful hosted deployment.

## [0.2.0-alpha.1] - 2026-07-28

### Changed

- Pivoted the target market from Morocco to the Netherlands.
- Expanded eligible education from higher education to MBO, HBO and WO while retaining a strict independent 18+ requirement.
- Made Dutch the default product language and added an English switch at the top of the interface.
- Replaced Moroccan synthetic institutions and profiles with Dutch MBO, HBO and WO fixtures.
- Replaced coarse color quantization with a smoother illustrated avatar treatment using edge extraction, warm lighting and portrait framing.

### Added

- Added 39 Dutch pilot institution fixtures: 15 MBO, 12 HBO and 12 WO.
- Added faith-background, daily-practice and compatibility-preference fields.
- Added optional prayer, Ramadan, halal, alcohol, smoking, family, modesty, community and marriage-intention tags.
- Added private-by-default faith-practice visibility.
- Added Dutch/English localization tests and education/faith domain tests.
- Added Netherlands institution-registry and faith-profile governance documents.
- Added ADR-0005 recording the strategic pivot.

### Security and privacy

- Explicitly classified religious beliefs as sensitive production data requiring a separate lawful basis and controls.
- Prohibited piety scoring, inferred religion and advertising use of faith data in the requirements.
- Continued to prohibit real-user admission to the prototype.

## [0.1.0-alpha.7] - 2026-07-27

### Added

- Published the verified hosted prototype at `https://solidprivacy-rendezvue.static.hf.space/`.
- Recorded deployment commit `edec6c59bdc2b46acf6652d1c03671006e86f250` and workflow run `30305071548`.

### Changed

- Moved WP-015 from implementation to hosted browser field review.

## [0.1.0-alpha.6] - 2026-07-27

### Changed

- Replaced source mirroring plus Hugging Face-side building with direct upload of a GitHub-built static artifact.
- The Static Space receives an `index.html`-rooted application with no remote build command.

### Added

- Added `.hf-deploy/` generation with Static Space metadata and source provenance.
- Added validation of the complete prebuilt deployment artifact.

## [0.1.0-alpha.5] - 2026-07-27

### Added

- Added automatic deployment status comments to issue #2.
- Added verified URL, commit and workflow evidence to successful deployment reports.

## [0.1.0-alpha.4] - 2026-07-27

### Fixed

- Corrected Static Space URL verification and fallback paths.

### Added

- Added regression tests for URL derivation and Python deployment helpers.

## [0.1.0-alpha.3] - 2026-07-27

### Fixed

- Replaced the paid Docker Space path with a free Static Space.

### Added

- Added deterministic static build and deployment-marker validation.

## [0.1.0-alpha.2] - 2026-07-27

### Added

- Added automatic Space creation, deployment polling and hosted URL publication.

## [0.1.0-alpha.1] - 2026-07-27

### Added

- Established GitHub as the sole source of truth.
- Added governance documents and a dependency-light mobile PWA prototype.
- Added browser camera capture, frame extraction and initial posterized preview.
- Added profile, discovery, matching, chat and safety UX.
- Added PWA, Docker, CI and Hugging Face synchronization foundations.
