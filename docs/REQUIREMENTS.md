# Rendezvue requirements baseline

**Version:** 0.3  
**Date:** 2026-07-28  
**Status:** Netherlands pivot pilot baseline  
**Authority:** GitHub repository `market-predictions/rendezvue`

## 1. Product statement

Rendezvue is an adult-only, privacy-first dating and introduction platform for Muslim students and students from a Muslim background in the Netherlands.

The eligible education sectors are:

- MBO — middelbaar beroepsonderwijs;
- HBO — hoger beroepsonderwijs;
- WO — wetenschappelijk onderwijs.

Rendezvue remains strictly 18+. Enrolment in MBO does not imply adulthood and must never bypass age assurance.

The public profile uses a stylized, recognisable privacy avatar generated from a short live-selfie challenge instead of publishing the source face video. The pilot is delivered as a mobile-first HTML5 Progressive Web App. Belgium may be considered after the Netherlands model is validated.

## 2. Product language and audience

| ID | Priority | Requirement |
|---|---:|---|
| LOC-01 | P0 | Dutch shall be the default product language. |
| LOC-02 | P0 | English shall be available through a persistent language switch at the top of the interface. |
| LOC-03 | P0 | Switching language shall preserve the current onboarding or profile state. |
| LOC-04 | P0 | All safety, privacy, verification and consent copy shall exist in Dutch and English before live users are admitted. |
| AUD-01 | P0 | The product shall be positioned for Muslim students and students from a Muslim background without requiring a single uniform level of religious practice. |
| AUD-02 | P0 | The interface shall avoid sectarian ranking, piety scoring and moral judgement. |
| AUD-03 | P1 | Belgium expansion shall remain outside the first Dutch pilot and require a separate institution and legal review. |

## 3. Source-of-truth and deployment requirements

| ID | Priority | Requirement |
|---|---:|---|
| GOV-01 | P0 | GitHub shall be the sole authoritative source for code, requirements, roadmap, work packages, decisions, changelog and handover. |
| GOV-02 | P0 | Hugging Face shall be treated as a one-way generated pilot deployment target, not an editing environment. |
| GOV-03 | P0 | Direct changes in the Hugging Face Space are unsupported and may be overwritten. |
| GOV-04 | P0 | Changes shall be integrated through focused branches, CI and reviewed pull requests. |
| GOV-05 | P0 | Every milestone shall update the changelog, work-package state, work claims and handover. |
| GOV-06 | P0 | Continuous integration shall validate the static application, generated deployment artifact, automated tests and retained Docker image. |
| GOV-07 | P0 | Deployment credentials shall be stored only in GitHub secrets or a future short-lived OIDC mechanism. |
| GOV-08 | P0 | The public repository shall contain only synthetic user data and synthetic media. |

## 4. Verification semantics

The platform creates probability and friction, not formal proof of identity or enrolment.

Approved public labels:

- Student email verified;
- Student document verified;
- Live selfie verified.

Disallowed unless independently justified:

- Identity verified;
- Institution-confirmed student;
- Officially authenticated student.

## 5. Eligibility and student verification

### 5.1 Adult-only access

| ID | Priority | Requirement |
|---|---:|---|
| AGE-01 | P0 | Only users aged 18 or older may access discovery or messaging. |
| AGE-02 | P0 | Production access shall require an age-assurance control stronger than self-declaration alone. |
| AGE-03 | P0 | MBO enrolment shall never be treated as evidence that a person is 18 or older. |
| AGE-04 | P0 | Suspected underage accounts shall be suspended pending review. |
| AGE-05 | P1 | Users shall have an appeal route for incorrect age decisions. |

### 5.2 Dutch institution registry

The production registry shall use DUO/RIO as the principal authority for recognised Dutch education providers. The prototype may use clearly marked pilot fixtures.

| ID | Priority | Requirement |
|---|---:|---|
| EDU-01 | P0 | Users shall first choose MBO, HBO or WO and then select an institution from the matching controlled registry. |
| EDU-02 | P0 | The production registry shall include recognised MBO institutions, universities of applied sciences and research universities. |
| EDU-03 | P0 | Each institution record shall include sector, name, city, source, source date, status and accepted email domains. |
| EDU-04 | P0 | Institutional domains shall be separately validated; a public website domain shall not automatically be assumed to be a student mailbox domain. |
| EDU-05 | P0 | Successful mailbox possession verification shall create a dated verification record. |
| EDU-06 | P0 | A current-student-document fallback shall exist for students without a usable institutional mailbox. |
| EDU-07 | P0 | Documents shall be minimized and deleted after the review and appeal window. |
| EDU-08 | P1 | Student status shall be reverified at least annually. |
| EDU-09 | P1 | Institution and domain data shall support scheduled refresh from DUO/RIO and manual exceptions. |

## 6. Live-selfie and avatar requirements

### 6.1 Live-selfie challenge

| ID | Priority | Requirement |
|---|---:|---|
| LIVE-01 | P0 | Capture shall use the live front camera and shall not accept a gallery file as the verification source. |
| LIVE-02 | P0 | Capture shall last approximately three to five seconds. |
| LIVE-03 | P0 | The user shall look at the camera, blink and perform a requested slow head turn. |
| LIVE-04 | P0 | Production liveness analysis shall verify face presence and requested motion. |
| LIVE-05 | P0 | A high-quality source frame shall be selected automatically. |
| LIVE-06 | P0 | Raw video shall never be public and shall be deleted after processing within a documented short retention window. |
| LIVE-07 | P0 | The prototype shall clearly distinguish camera-flow demonstration from production liveness verification. |

### 6.2 Avatar style

| ID | Priority | Requirement |
|---|---:|---|
| AV-01 | P0 | The avatar shall be recognisable and linkable to the source person while being visibly illustrated rather than pixelated. |
| AV-02 | P0 | The intended style shall be warm, romantic, polished and adult rather than childish, anime-like or caricatured. |
| AV-03 | P0 | Face shape, skin tone, hairstyle or head covering, facial hair and glasses shall be preserved where visible. |
| AV-04 | P0 | The transformation shall not materially change apparent age, skin tone or facial proportions. |
| AV-05 | P0 | The public avatar shall use a controlled three-to-five-second animation. |
| AV-06 | P0 | Users shall preview and accept the avatar before publishing. |
| AV-07 | P0 | Failed, offensive or materially misleading outputs shall not be published. |
| AV-08 | P0 | Model training on user captures shall be prohibited without separate optional consent. |
| AV-09 | P0 | The local illustrated prototype renderer shall not be represented as the production avatar model. |

## 7. Faith, identity and lifestyle profile

Information revealing religious beliefs is a special category of personal data. Production processing therefore requires a documented Article 9 condition, explicit and separable user choice, data minimisation and an easy withdrawal path.

### 7.1 Self-description model

The model shall use descriptive categories rather than a numeric religiosity score.

| ID | Priority | Requirement |
|---|---:|---|
| FAITH-01 | P0 | Users shall be able to describe their background as Muslim, Muslim background, convert, exploring/spiritual or prefer not to say. |
| FAITH-02 | P0 | Users shall be able to describe daily practice as actively practising, practising, moderately practising, culturally connected or private. |
| FAITH-03 | P0 | Users shall be able to indicate how important faith compatibility is: essential, important, important but open, or no strict preference. |
| FAITH-04 | P0 | Optional lifestyle tags may include prayer, Ramadan, halal lifestyle, no alcohol, no smoking, family orientation, modesty, community involvement and marriage intention. |
| FAITH-05 | P0 | The product shall not infer faith, sect, ethnicity or practice from name, appearance, institution, location or behaviour. |
| FAITH-06 | P0 | The product shall not calculate or expose a piety score. |
| FAITH-07 | P0 | Users shall control whether their practice description is visible on their public profile. |
| FAITH-08 | P0 | Faith fields shall be editable and deletable without deleting the entire account. |
| FAITH-09 | P0 | Faith data shall not be sold, used for advertising segmentation or disclosed outside the matching purpose. |
| FAITH-10 | P1 | Advanced denominational or school-of-thought fields shall not be introduced without demonstrated user need and a separate safety/privacy review. |

### 7.2 Compatibility use

| ID | Priority | Requirement |
|---|---:|---|
| MATCH-FAITH-01 | P0 | Faith compatibility shall be one matching dimension, not the sole ranking criterion. |
| MATCH-FAITH-02 | P0 | Users shall be able to distinguish self-description from what they prefer in a match. |
| MATCH-FAITH-03 | P0 | Dealbreakers shall be explicit user choices rather than inferred exclusions. |
| MATCH-FAITH-04 | P1 | Recommendation explanations shall avoid moral language such as “better Muslim” or “more suitable religiously.” |

## 8. Profile, discovery and communication

### 8.1 Profile and privacy

| ID | Priority | Requirement |
|---|---:|---|
| PROF-01 | P0 | Public profiles shall use a first name or nickname, not a surname. |
| PROF-02 | P0 | Institution visibility shall be user controlled. |
| PROF-03 | P0 | Exact location, private email, phone number and source selfie shall never be public. |
| PROF-04 | P0 | A profile shall contain relationship intent, at least two prompts and at least three interests. |
| PROF-05 | P0 | Education level may be shown as MBO, HBO or WO without ranking language. |
| PROF-06 | P0 | Users shall be able to pause discovery without deleting conversations. |
| PROF-07 | P1 | Invisible mode shall limit visibility to people already liked. |

### 8.2 Discovery and matching

| ID | Priority | Requirement |
|---|---:|---|
| DISC-01 | P0 | The primary experience shall present one profile at a time. |
| DISC-02 | P0 | Users shall be able to pass, like or comment on a specific profile component. |
| DISC-03 | P0 | Messaging shall require a mutual match. |
| DISC-04 | P0 | Location shall be city-level or broadly banded, never exact distance. |
| DISC-05 | P0 | Reduced-motion and data-saving modes shall replace animation with poster images. |
| DISC-06 | P1 | A static grid may be added after local profile density is sufficient. |

### 8.3 Messaging and safety

| ID | Priority | Requirement |
|---|---:|---|
| MSG-01 | P0 | Matched users shall be able to exchange text messages. |
| MSG-02 | P0 | Every profile and conversation shall expose report, block and unmatch controls. |
| MSG-03 | P0 | Blocking shall take effect immediately. |
| MSG-04 | P0 | The first live MVP shall exclude user-uploaded chat images and videos. |
| MSG-05 | P0 | Abuse, spam and scam controls shall be enforced server-side. |
| SAFE-01 | P0 | Moderators shall have a severity-prioritised review queue and auditable enforcement actions. |
| SAFE-02 | P0 | Community standards shall cover anti-Muslim abuse, sectarian harassment, coercion, sexual harassment, scams and suspected minors. |
| SAFE-03 | P0 | Appeals and child-safety procedures shall exist before live users are admitted. |

## 9. PWA, accessibility and hosting

| ID | Priority | Requirement |
|---|---:|---|
| PWA-01 | P0 | The application shall work in a mobile browser without installation. |
| PWA-02 | P0 | The application shall provide a Web App Manifest and service worker. |
| PWA-03 | P0 | Essential workflows shall not depend on background browser execution. |
| PWA-04 | P0 | Persistent production services shall run outside the Static Space. |
| PWA-05 | P0 | Hugging Face shall serve only the generated pilot frontend artifact. |
| PWA-06 | P0 | The retained Docker image shall remain a validated future deployment option, not the free pilot host. |
| PWA-07 | P0 | Camera capture shall require HTTPS outside local development. |
| A11Y-01 | P0 | WCAG 2.2 AA is the target. |
| A11Y-02 | P0 | Every gesture shall have a visible control alternative. |
| A11Y-03 | P0 | Reduced motion and textual camera guidance are mandatory. |

## 10. Prototype acceptance criteria

The Netherlands pivot prototype milestone is complete when:

1. Dutch is the default and the top-level English switch works throughout the flow;
2. MBO, HBO and WO fixtures are present and separated by education level;
3. the 18+ requirement is shown independently of student status;
4. institution/domain matching works against synthetic Dutch fixtures;
5. the browser can record a four-second camera clip where supported;
6. the local avatar preview is visibly illustrated rather than coarsely pixelated;
7. a user can complete the faith, practice, preference and lifestyle profile flow;
8. users can control institution and faith-practice visibility;
9. Dutch synthetic MBO, HBO and WO profiles appear in discovery;
10. discovery, contextual like, matching, chat, report and block remain functional;
11. PWA artifacts, unit tests, static validation and Docker validation pass;
12. the generated Hugging Face deployment is verified against the live marker;
13. documentation, work claims, roadmap, changelog and handover reflect the pivot and its limitations.

## 11. Explicit exclusions from this pilot

- real student-email delivery;
- authoritative production domain coverage;
- automated age assurance;
- automated liveness classification;
- production generative avatar infrastructure;
- persistent user accounts, matching or messaging;
- real moderation operations;
- advertising or sale of religious profile data;
- Belgium institutions;
- exact location;
- photo/video messaging;
- payments or subscriptions;
- native shells.
