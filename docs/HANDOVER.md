# Project handover

**Updated:** 2026-07-28  
**Milestone:** Netherlands Muslim-student pivot implementation; CI and hosted verification pending

## Current state

The approved browser-native HTML5/PWA prototype is publicly hosted at:

`https://solidprivacy-rendezvue.static.hf.space/`

Work is active on `agent/netherlands-muslim-student-pivot`. The milestone converts the product from Morocco to the Netherlands and expands eligibility to adults aged 18+ in MBO, HBO and WO.

## Implemented on the milestone branch

- Dutch default document, manifest and interface;
- persistent NL/EN language switch at the top;
- 15 MBO, 12 HBO and 12 WO pilot fixtures;
- explicit MBO/HBO/WO selection before institution selection;
- separate 18+ gate, including an MBO-specific reminder;
- Dutch synthetic profiles across all three education sectors;
- faith background, daily practice and faith-compatibility preference;
- optional lifestyle tags;
- no numeric piety score;
- faith-practice visibility off by default;
- illustrated local avatar rendering using smoothing, edge extraction and warm grading;
- updated unit tests, static validation and PWA cache;
- revised requirements, roadmap, work packages and work claims.

## Important limitations

- institution and email-domain data are pilot fixtures, not DUO/RIO-backed production records;
- domain matching does not send email or prove student status;
- age assurance is only a prototype date gate;
- camera capture does not verify liveness;
- avatar output is a local visual approximation, not a production generative model;
- faith data is local synthetic prototype state; production legal basis and DPIA are unresolved;
- there are no persistent accounts, messages or moderator operations;
- the product must not admit real users.

## Architecture

GitHub remains authoritative. CI builds and validates the application, creates `.hf-deploy/`, and uploads the finished artifact to the free Hugging Face Static Space. Hugging Face serves files only.

Production services must remain external and server-authoritative for authentication, matching, messaging, moderation, retention and sensitive-data controls.

## Current work gate

1. complete remaining governance documents;
2. open a focused pull request;
3. pass JavaScript tests, localization tests, static artifact validation, Python URL tests and Docker build;
4. merge after CI success;
5. verify the automatic Hugging Face deployment;
6. record the new hosted commit and workflow evidence;
7. request owner review of Dutch copy, faith profile and avatar treatment.

## Immediate next work after approval

- WP-020: authoritative Dutch institution registry using DUO/RIO plus separately verified student mailbox domains;
- WP-025: target-user validation and legal basis for faith data;
- production age-assurance selection with explicit under-18 MBO handling;
- moderated avatar/privacy user testing;
- production avatar technical proof.

## Significant decisions still needed

- first Dutch launch city or institution cluster;
- exact faith-field optionality and production consent design;
- public institution visibility default;
- age-assurance provider or method;
- production avatar service/architecture;
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
