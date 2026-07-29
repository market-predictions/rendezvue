# Rendezvue product requirements baseline

**Version:** 1.0  
**Date:** 2026-07-29  
**Status:** product rebaseline and concept-pilot implementation  
**Authority:** `market-predictions/rendezvue`

## 1. Product statement

Rendezvue is an adult-only, privacy-first platform for serious introductions between Muslims and people from a Muslim background in the Netherlands. Membership is open to eligible adults; it is **student-first, not student-only**. Students, recent graduates and young professionals are priority launch communities.

The public profile uses a controlled fuzzy privacy portrait derived from a live camera capture. The source selfie is never the public profile image. The pilot is a Dutch-first, English-capable mobile PWA hosted as a generated Hugging Face Static Space artifact.

## 2. Operating principles

| ID | Priority | Requirement |
|---|---:|---|
| GOV-01 | P0 | GitHub shall be the sole source of truth for code, product decisions, schema, roadmap, changelog and evidence. |
| GOV-02 | P0 | Hugging Face shall serve a one-way generated static frontend and shall not be an editing or persistent-data environment. |
| GOV-03 | P0 | Demonstrated prototype behaviour shall be separated from production verification, safety and legal claims. |
| GOV-04 | P0 | The public repository shall contain synthetic users and synthetic conversations only. |
| LOC-01 | P0 | Dutch shall be the default language and English shall remain available throughout the flow. |
| A11Y-01 | P0 | WCAG 2.2 AA is the target and every gesture shall have a visible control alternative. |

## 3. Audience and eligibility

| ID | Priority | Requirement |
|---|---:|---|
| ELIG-01 | P0 | Discovery and messaging shall be limited to users aged 18 or older. |
| ELIG-02 | P0 | A user must declare that they are currently single. |
| ELIG-03 | P0 | Married, partnered, engaged or not-yet-legally-separated users shall not enter discovery. |
| ELIG-04 | P0 | Users shall affirm serious relationship intent and community fit before account creation. |
| ELIG-05 | P0 | Student status shall not be an admission requirement. |
| ELIG-06 | P1 | Current single status shall be periodically reconfirmed in production. |
| ELIG-07 | P1 | Suspected hidden relationships shall have a dedicated report and review workflow. |

## 4. Account and onboarding

| ID | Priority | Requirement |
|---|---:|---|
| ONB-01 | P0 | Eligibility shall be checked before extended profile data is collected. |
| ONB-02 | P0 | A recoverable private account shall be created before extensive profile building. |
| ONB-03 | P0 | Personal account identity and student-verification identity shall be separate. |
| ONB-04 | P0 | Onboarding progress shall be saved after each coherent stage. |
| ONB-05 | P0 | The camera step shall occur after account, identity, life-stage and family-context setup but before publication. |
| ONB-06 | P0 | Users shall preview the complete public profile before publication. |
| ONB-07 | P0 | Payment details shall not be requested during onboarding. |
| ONB-08 | P1 | Abandoned production onboarding data shall expire after a documented retention period. |

The required sequence is documented in `docs/ONBOARDING.md`.

## 5. Life stage and student layer

| ID | Priority | Requirement |
|---|---:|---|
| LIFE-01 | P0 | Users shall select a current life stage: student, recent graduate, employed, self-employed, job-seeking or other. |
| LIFE-02 | P0 | Life stage shall be a compatibility dimension and shall not create a social-quality hierarchy. |
| STUD-01 | P0 | Students may voluntarily verify MBO, HBO or WO status through a controlled institution registry. |
| STUD-02 | P0 | A verified-student badge shall prove only the stated verification event and date. |
| STUD-03 | P0 | Exact institution visibility shall remain user-controlled. |
| STUD-04 | P1 | Verified students may receive Campus Mode, student events and a reduced paid-contact price. |
| STUD-05 | P1 | Student verification shall expire and support annual reverification and a short graduation transition. |
| STUD-06 | P1 | Non-students shall not receive an unrestricted “only students” targeting filter in the first live pilot. |

## 6. Relationship and family context

| ID | Priority | Requirement |
|---|---:|---|
| FAM-01 | P0 | Current relationship eligibility and prior marital history shall be separate fields. |
| FAM-02 | P0 | Prior marital history shall support never married, divorced and widowed. |
| FAM-03 | P0 | Users shall state whether they have children. |
| FAM-04 | P0 | Existing children, openness to a partner with children and future child preference shall remain separate. |
| FAM-05 | P0 | Names, photos, birth dates, schools and locations of children shall not be collected. |
| FAM-06 | P0 | Optional child count shall use coarse categories only. |
| FAM-07 | P0 | Divorce, widowhood and parenthood shall not create hidden ranking penalties. |
| FAM-08 | P0 | Exclusions based on family context shall derive only from explicit user choices. |

## 7. Live selfie and privacy portrait

| ID | Priority | Requirement |
|---|---:|---|
| LIVE-01 | P0 | The verification source shall use the live front camera rather than a gallery upload. |
| LIVE-02 | P0 | The capture shall request a short blink/head-turn challenge. |
| LIVE-03 | P0 | The concept pilot shall state that capture is not automated liveness classification. |
| PORT-01 | P0 | The source selfie shall never be public. |
| PORT-02 | P0 | The primary MVP solution shall be a browser-local fuzzy privacy portrait, not a required AI avatar bridge. |
| PORT-03 | P0 | Users shall choose from controlled privacy variants with a minimum privacy floor. |
| PORT-04 | P0 | The interface shall not claim anonymity. |
| PORT-05 | P0 | Apparent age, skin tone, hair/head covering, glasses and broad appearance shall not be materially falsified. |
| PORT-06 | P1 | AI-generated illustrated portraits may be evaluated later as an optional implementation, not a product dependency. |

## 8. Faith and lifestyle

| ID | Priority | Requirement |
|---|---:|---|
| FAITH-01 | P0 | Faith fields shall be self-selected and descriptive. |
| FAITH-02 | P0 | The product shall not infer religion, sect or practice. |
| FAITH-03 | P0 | No piety or religiosity score shall be calculated or shown. |
| FAITH-04 | P0 | Self-description and match preference shall remain separate. |
| FAITH-05 | P0 | Faith-practice visibility shall start private. |
| FAITH-06 | P0 | Faith data shall not be sold or used for advertising segmentation. |
| FAITH-07 | P1 | Production processing requires a documented Article 9 condition, withdrawal and deletion controls. |

## 9. Profile and discovery

| ID | Priority | Requirement |
|---|---:|---|
| PROF-01 | P0 | Public profiles shall use a first name or nickname, never a surname. |
| PROF-02 | P0 | Profiles shall include intent, family context, at least two prompts and at least three interests. |
| PROF-03 | P0 | Exact location, account email, phone number and source selfie shall never be public. |
| DISC-01 | P0 | Discovery shall present one profile at a time. |
| DISC-02 | P0 | Users shall be able to pass, directly like or send a contextual like. |
| DISC-03 | P0 | Swipe left/right shall be supported, with visible button alternatives. |
| DISC-04 | P0 | A pass shall not reduce the target profile’s general visibility. |
| DISC-05 | P0 | Like and pass counts shall not be public. |
| DISC-06 | P0 | General popularity shall not become a trust or moral score. |
| DISC-07 | P1 | Campus Mode may prioritize verified students for verified students. |

## 10. Matching, contact and monetisation

| ID | Priority | Requirement |
|---|---:|---|
| MATCH-01 | P0 | A match shall require reciprocal interest. |
| CONTACT-01 | P0 | Contact opening and message exchange shall be separate entitlements. |
| CONTACT-02 | P0 | One party may use a contact right to open a matched conversation. |
| CONTACT-03 | P0 | After opening, both parties shall be able to reply without per-message charges. |
| CONTACT-04 | P0 | Safety, blocking, reporting and account deletion shall never be premium features. |
| PAY-01 | P0 | Registration, discovery, likes and receiving matches shall remain free. |
| PAY-02 | P1 | The pilot shall test the comprehension of paid conversation opening before taking payment. |
| PAY-03 | P1 | Indicative pricing experiments may compare a regular plan and a verified-student discount. |
| PAY-04 | P1 | Web payments shall use hosted checkout and server-authoritative webhook confirmation. |
| PAY-05 | P1 | Native apps shall comply with then-current Apple and Google billing rules. |

## 11. Messaging and safety

| ID | Priority | Requirement |
|---|---:|---|
| MSG-01 | P0 | The first pilot shall support text chat only. |
| MSG-02 | P0 | Report, block, end-contact and unmatch controls shall be reachable from profiles and conversations. |
| MSG-03 | P0 | Blocking shall take effect immediately and server-side in production. |
| MSG-04 | P0 | User photo/video attachments shall be excluded from the first live MVP. |
| SAFE-01 | P0 | Serious reports shall enter a moderation workflow, not an ordinary ranking adjustment. |
| SAFE-02 | P0 | Appeals and child-safety procedures shall exist before real-user admission. |

## 12. Feedback and behavioural standing

| ID | Priority | Requirement |
|---|---:|---|
| FDBK-01 | P0 | Attraction signals, private experience feedback, safety reports and internal trust signals shall be separate models. |
| FDBK-02 | P0 | Public star ratings, downvotes and numerical user reputation scores are prohibited. |
| FDBK-03 | P0 | “No chemistry” shall never lower general visibility. |
| FDBK-04 | P1 | Structured private feedback may be requested after meaningful contact. |
| FDBK-05 | P1 | A single negative review shall not reduce visibility or trigger enforcement. |
| FDBK-06 | P1 | Robust non-safety patterns may first trigger a private correction prompt, then proportionate limits. |
| FDBK-07 | P1 | Material distribution limits shall be explainable and appealable. |
| FDBK-08 | P1 | Only sufficiently supported positive badges may be public. |

See `docs/INTERACTION-AND-TRUST-MODEL.md`.

## 13. Hosting and production boundary

| ID | Priority | Requirement |
|---|---:|---|
| HOST-01 | P0 | The concept pilot shall remain deployable as a Static Space. |
| HOST-02 | P0 | Persistent accounts, profiles, likes, matches, messages and moderation shall live outside Hugging Face. |
| HOST-03 | P0 | Production authorization, retention and enforcement shall be server-authoritative. |
| HOST-04 | P1 | The first backend proof shall use relational storage, private object storage, realtime messaging and row-level authorization. |

## 14. Concept-pilot acceptance criteria

The rebaseline milestone is complete when:

1. membership is no longer student-only;
2. eligibility, private-account simulation and progress persistence work;
3. life stage and optional student verification work;
4. marital history, children and child preference fields are represented separately;
5. live capture and selectable fuzzy privacy portraits work;
6. faith, interests and profile preview remain functional;
7. direct likes, contextual likes, pass buttons and swipe gestures work;
8. the first like creates a deterministic pilot match;
9. a simulated contact entitlement opens a text conversation;
10. contact can be ended with structured private feedback;
11. feedback does not automatically change profile visibility;
12. report and block remain available;
13. Dutch/English tests, domain tests, static build and deployment artifact validation pass;
14. roadmap, work packages, claims, changelog and handover match the implementation.

## 15. Explicit exclusions from this milestone

- real-user admission;
- persistent multi-user accounts and chat;
- real email or SMS delivery;
- authoritative student registry and document verification;
- automated age assurance or liveness classification;
- real payments or subscriptions;
- automatic reputation-based ranking penalties;
- production moderation operations;
- audio/video calling, voice notes or media messages;
- native applications;
- Belgium launch.
