# Project handover

**Updated:** 2026-07-29  
**Milestone:** Product baseline v1 and full synthetic concept-pilot realization

## Branch

`agent/product-baseline-v1-pilot`

## Strategic decisions implemented

- student-only replaced by student-first open membership;
- eligibility is adult, currently single and serious-intent based;
- student status is an optional verified benefit layer;
- life stage covers student, recent graduate, employed, self-employed, job-seeking and other;
- marital history, existing children, child wish and openness to a partner with children are separate;
- browser-local fuzzy privacy portraits are the MVP baseline;
- AI avatars are optional later experiments;
- registration, discovery and likes are free in the target model;
- a contact entitlement opens a reciprocal match and both parties then reply freely;
- likes, private feedback, safety reports and internal trust signals are separate;
- public stars, downvotes and popularity counts are prohibited.

## Implemented in the concept pilot

- ten-stage resumable Dutch/English onboarding;
- simulated private account and optional student verification;
- profile preview and field visibility controls;
- live selfie flow and four privacy portrait variants;
- five diverse synthetic profiles across life stages and family situations;
- pass, direct like, contextual like and left/right swipe;
- deterministic reciprocal match;
- simulated regular/student contact pricing and one pilot contact right;
- text chat, end-contact, structured private feedback, report and block;
- local persistence with a versioned demo-state schema;
- updated tests, build metadata, documentation and validation contract.

## Validation performed locally

- Node test suite: 10 tests passed;
- JavaScript syntax checks passed for application, domain, localization, media and build modules;
- static build and generated Hugging Face artifact validation passed for 44 required artifacts.

## Explicit limitations

- no real authentication or account recovery;
- no authoritative age, single-status, student or liveness verification;
- local deterministic matching, not multi-user discovery;
- local chat, reports and feedback only;
- no payment provider or money movement;
- no moderation console or operational response coverage;
- no production Article 9 basis or DPIA;
- current branch is unsuitable for real-user admission.

## Review journey after deployment

1. complete onboarding as a non-student;
2. restart and test optional student verification with code `246810`;
3. inspect family-context wording;
4. test camera and all four portrait variants on mobile;
5. use buttons and swipe gestures;
6. send a direct or contextual like;
7. open the match using the simulated contact right;
8. exchange messages, end contact and leave feedback;
9. test report, block, language switch, resume and local deletion.

## Next production work

1. choose and provision the external backend proof;
2. implement schema, row-level policies and authentication;
3. replace deterministic matching/chat with persistent multi-user services;
4. implement manual moderation operations;
5. complete age, sensitive-data and legal readiness;
6. integrate hosted checkout only after free-funnel value is demonstrated.
