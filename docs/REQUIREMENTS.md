# Rendezvue product requirements baseline

**Version:** 1.1  
**Date:** 2026-07-30  
**Status:** hosted concept pilot plus active backend proof  
**Authority:** `market-predictions/rendezvue`

## 1. Product statement

Rendezvue is an adult-only, privacy-first platform for serious introductions between Muslims and people from a Muslim background in the Netherlands. Membership is open to eligible adults; it is **student-first, not student-only**. Students, recent graduates and young professionals are priority launch communities.

Rendezvue separates live-camera authenticity media from profile presentation media. A publishable profile requires one camera-origin Live selfie, represented publicly only by a freshly rendered metadata-free prepared derivative, plus up to two optional camera/gallery profile photos. Raw/challenge capture and normalized source media are never public profile objects. The public pilot is a Dutch-first, English-capable mobile PWA hosted as a generated Hugging Face Static Space artifact.

The community is designed for introductions between men and women. A user selects sex as man or woman; the partner sex is derived automatically and is not asked as a separate seeking preference.

## 2. Operating principles

| ID | Priority | Requirement |
|---|---:|---|
| GOV-01 | P0 | GitHub shall be the sole source of truth for code, product decisions, schema, roadmap, changelog and evidence. |
| GOV-02 | P0 | Hugging Face shall serve a one-way generated static frontend and shall not be an editing or persistent-data environment. |
| GOV-03 | P0 | Demonstrated prototype behaviour shall be separated from production verification, safety and legal claims. |
| GOV-04 | P0 | The public repository and public pilot shall contain synthetic users and synthetic conversations only. |
| GOV-05 | P0 | Secrets, service-role credentials, source selfies and real-user records shall never be committed to GitHub or embedded in the public artifact. |
| LOC-01 | P0 | Dutch shall be the default language and English shall remain available throughout the flow. |
| A11Y-01 | P0 | WCAG 2.2 AA is the target and every gesture shall have a visible control alternative. |

## 3. Audience and eligibility

| ID | Priority | Requirement |
|---|---:|---|
| ELIG-01 | P0 | Discovery and messaging shall be limited to users aged 18 or older. |
| ELIG-02 | P0 | A user must declare that they are currently single. |
| ELIG-03 | P0 | Married, partnered, engaged or not-yet-legally-divorced users shall not enter discovery. |
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
| ONB-09 | P0 | Sex selection shall contain exactly man and woman for this community flow. |
| ONB-10 | P0 | The app shall derive opposite-sex discovery and shall not present a separate “who do you want to meet?” question. |

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
| LIVE-04 | P0 | Publication shall require one camera-origin Live selfie prepared from the same front-camera challenge session. |
| LIVE-05 | P0 | The visible Live selfie shall be labelled as a live-camera trust signal and shall not be described as legal identity verification. |
| LIVE-06 | P0 | Challenge/video bytes shall not be published as profile media; only a freshly rendered prepared still derivative may be visible. |
| PORT-01 | P0 | The source selfie shall never be public. |
| PORT-02 | P0 | The primary MVP solution shall be a browser-local fuzzy privacy portrait, not a required AI avatar bridge. |
| PORT-03 | P0 | Users shall choose from controlled privacy variants with a minimum privacy floor. |
| PORT-04 | P0 | The interface shall not claim anonymity. |
| PORT-05 | P0 | Apparent age, skin tone, hair/head covering, glasses and broad appearance shall not be materially falsified. |
| PORT-06 | P1 | AI-generated illustrated portraits may be evaluated later as an optional implementation, not a product dependency. |
| PORT-07 | P0 | Production portrait objects shall be stored privately and exposed only through an approved derivative/access policy. |
| PORT-08 | P0 | Visible profile media shall be bounded to one required Live selfie slot and at most two optional profile-photo slots. |
| PORT-09 | P0 | Optional profile photos may come from camera or photo library but shall use the same preparation/privacy pipeline as the Live selfie derivative. |
| PORT-10 | P0 | Exactly one prepared card shall be the discovery primary; the full profile may reveal the remaining visible prepared media. |

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
| PROF-03 | P0 | Exact location, account email, phone number and raw/normalized source selfie shall never be public. |
| PROF-04 | P0 | A visible Live selfie derivative shall remain distinguishable from optional profile photos so another participant can understand the trust cue. |
| PROF-05 | P0 | Discovery shall continue to present one primary image; additional profile media shall be available through an explicit full-profile interaction rather than overloading the discovery swipe gesture. |
| DISC-01 | P0 | Discovery shall present one profile at a time. |
| DISC-02 | P0 | Users shall be able to pass, directly like or send a contextual like. |
| DISC-03 | P0 | Swipe left/right shall be supported, with visible button alternatives. |
| DISC-04 | P0 | A pass shall not reduce the target profile’s general visibility. |
| DISC-05 | P0 | Like and pass counts shall not be public. |
| DISC-06 | P0 | General popularity shall not become a trust or moral score. |
| DISC-07 | P1 | Campus Mode may prioritize verified students for verified students. |
| DISC-08 | P0 | Discovery shall exclude blocked pairs server-side. |
| DISC-09 | P0 | Sensitive family and faith fields shall remain fail-closed until explicit field-visibility projections are approved. |

## 10. Matching, contact and monetisation

| ID | Priority | Requirement |
|---|---:|---|
| MATCH-01 | P0 | A match shall require reciprocal interest. |
| MATCH-02 | P0 | Server-side matching shall create at most one active match row per user pair under concurrency. |
| CONTACT-01 | P0 | Contact opening and message exchange shall be separate entitlements. |
| CONTACT-02 | P0 | One party may use a contact right to open a matched conversation. |
| CONTACT-03 | P0 | After opening, both parties shall be able to reply without per-message charges. |
| CONTACT-04 | P0 | Safety, blocking, reporting and account deletion shall never be premium features. |
| CONTACT-05 | P0 | Contact opening shall be idempotent and consume at most one valid entitlement. |
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
| MSG-05 | P0 | Only participants in an open conversation may insert or read messages. |
| SAFE-01 | P0 | Serious reports shall enter a moderation workflow, not an ordinary ranking adjustment. |
| SAFE-02 | P0 | Appeals and child-safety procedures shall exist before real-user admission. |
| SAFE-03 | P0 | Report subjects shall not be able to read reports or reporter identity through ordinary user access. |
| SAFE-04 | P0 | Moderation cases and audit records shall not be readable by ordinary authenticated users. |

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

## 13. Hosting and backend boundary

| ID | Priority | Requirement |
|---|---:|---|
| HOST-01 | P0 | The concept pilot shall remain deployable as a Static Space. |
| HOST-02 | P0 | Persistent accounts, profiles, likes, matches, messages and moderation shall live outside Hugging Face. |
| HOST-03 | P0 | Production authorization, retention and enforcement shall be server-authoritative. |
| HOST-04 | P0 | The first backend proof shall use relational storage, private object storage, realtime messaging and row-level authorization. |
| HOST-05 | P0 | The public PWA shall default to local synthetic mode and shall not silently connect to a remote backend. |
| HOST-06 | P0 | A remote backend preview shall be private and limited to controlled test accounts until real-user authorization. |

## 14. Backend proof and authorization

| ID | Priority | Requirement |
|---|---:|---|
| BACK-01 | P0 | Database changes shall be versioned as migrations in GitHub. |
| BACK-02 | P0 | A clean CI/local database shall apply all migrations from an empty state. |
| BACK-03 | P0 | Authentication identity, public profile, eligibility, student evidence, family context and faith data shall be separate records. |
| BACK-04 | P0 | Row Level Security shall be enabled on every client-accessible private table. |
| BACK-05 | P0 | Two-account tests shall demonstrate that one user cannot read or mutate another user’s private domains. |
| BACK-06 | P0 | Incoming likes shall not be directly queryable by their target before the matching rule permits disclosure. |
| BACK-07 | P0 | Blocks shall prevent discovery interaction, matching/contact opening and messaging. |
| BACK-08 | P0 | Private media shall use owner-scoped storage paths and non-public buckets. |
| BACK-09 | P0 | Service-role keys and moderator privileges shall never be present in browser code. |
| BACK-10 | P0 | Account deletion shall remove or anonymise dependent records according to the approved retention model. |
| BACK-11 | P0 | Realtime transport shall not bypass table authorization. |
| BACK-12 | P1 | Database functions and policies shall have automated regression tests before private multi-user integration. |

## 15. Concept-pilot acceptance criteria

The concept rebaseline milestone is complete when:

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

## 16. Backend-foundation acceptance criteria

The first backend-foundation milestone is complete when:

1. local configuration and migrations are versioned;
2. application, Docker and backend migration CI are green;
3. migrations replay from an empty database;
4. required domain tables, private storage and RLS exist;
5. reciprocal likes and contact-opening functions are present;
6. work claims state that runtime authorization and concurrency still require tests;
7. no remote project or real-user environment is implied.

## 17. Explicit exclusions from the current milestone

- real-user admission;
- public multi-user accounts and chat;
- real email or SMS delivery;
- authoritative student registry and document verification;
- automated age assurance or liveness classification;
- real payments or subscriptions;
- automatic reputation-based ranking penalties;
- production moderation operations;
- audio/video calling, voice notes or media messages;
- native applications;
- Belgium launch.
