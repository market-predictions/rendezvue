# Project handover

**Updated:** 2026-07-28  
**Milestone:** Netherlands Muslim-student pilot deployed; owner review required

## Current state

The Netherlands-first browser prototype is publicly hosted at:

`https://solidprivacy-rendezvue.static.hf.space/`

The deployed build was verified from GitHub commit `30192de007e2de85bd95ef6a3a4ff57155dd4d82` by workflow run `30311060515`.

The product now targets Muslim students and students with a Muslim background aged 18 or older in Dutch MBO, HBO and WO. Dutch is the default language and English is available from the persistent NL/EN switch.

## Implemented and hosted

- Dutch-first onboarding and interface;
- persistent NL/EN language switch;
- MBO, HBO and WO as peer education categories;
- 15 MBO, 12 HBO and 12 WO pilot fixtures;
- independent strict 18+ gate, including an MBO-specific reminder;
- Dutch synthetic discovery profiles across all three education sectors;
- faith background, daily practice and faith-compatibility preference;
- optional lifestyle tags;
- no numeric piety score or inferred religious identity;
- faith-practice visibility off by default;
- illustrated local avatar rendering using smoothing, edge extraction, warm grading and portrait framing;
- complete profile, discovery, contextual-like, match, chat and safety demonstration;
- validated static artifacts, Python deployment checks and retained Docker build;
- automatic verified deployment to the free Hugging Face Static Space.

## Important limitations

- institution and email-domain data are pilot fixtures, not DUO/RIO-backed production records;
- domain matching does not send email or prove student status;
- age assurance is only a prototype date gate;
- camera capture does not verify liveness;
- avatar output is a local illustration approximation, not a production generative model;
- faith data is sensitive personal data; production legal basis, DPIA, consent/withdrawal and anti-discrimination controls remain unresolved;
- there are no persistent accounts, messages or moderator operations;
- the product must not admit real users.

## Architecture

GitHub remains authoritative. CI builds and validates the application, creates `.hf-deploy/`, uploads the finished artifact and verifies the public marker. Hugging Face serves generated static files only.

Production services must remain external and server-authoritative for authentication, age assurance, matching, messaging, moderation, retention and sensitive-data controls.

## Current review gate

The implementation and hosted deployment gates are complete. Owner review is required for:

1. Dutch positioning and tone;
2. MBO/HBO/WO representation;
3. faith-profile terminology and optionality;
4. visibility defaults for institution and faith practice;
5. illustrated avatar usefulness, privacy and resemblance;
6. complete mobile-browser camera flow.

## Immediate next work after approval

- WP-020: authoritative Dutch institution registry using DUO/RIO plus separately verified student mailbox domains;
- WP-025: target-user validation and legal basis for faith data;
- production age-assurance selection with explicit under-18 MBO handling;
- moderated avatar/privacy user testing;
- production avatar technical proof;
- selection of the first Dutch launch city or institution cluster.

## Significant decisions still needed

- first Dutch launch city or institution cluster;
- exact faith-field optionality and production consent design;
- public institution visibility default;
- age-assurance provider or method;
- production avatar service and architecture;
- database, object storage and data location;
- moderation staffing and service levels;
- whether Belgium follows after Dutch evidence.

## Known risks

- pilot domains may be inaccurate and must not be used for real verification;
- religious beliefs are sensitive personal data;
- faith filters can cause exclusion, harassment or over-segmentation if poorly designed;
- MBO increases the importance of robust age assurance;
- mobile MediaRecorder support differs by browser;
- illustrated local processing may perform unevenly across skin tones, hijab/headwear, glasses and lighting;
- a focused community product still requires sufficient local profile density;
- Static Space hosting cannot provide persistent application services.
