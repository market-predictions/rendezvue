# Rendezvue requirements baseline

**Version:** 0.2  
**Date:** 2026-07-27  
**Status:** Active pilot baseline  
**Authority:** GitHub repository `market-predictions/rendezvue`

## 1. Product statement

Rendezvue is an 18+ dating platform for students at recognised Moroccan higher-education institutions. It uses probabilistic student verification, a short live-selfie challenge and privacy-preserving animated avatars to provide visual attraction without publishing the source face video.

The pilot shall be delivered as a mobile-first HTML5 Progressive Web App. A native Android/iOS shell may later add capabilities that materially benefit from operating-system integration, while reusing the same backend services and product logic.

## 2. Source-of-truth and deployment requirements

| ID | Priority | Requirement |
|---|---:|---|
| GOV-01 | P0 | GitHub shall be the sole authoritative source for code, requirements, roadmap, work packages, decisions, changelog and handover state. |
| GOV-02 | P0 | Hugging Face shall be treated as a one-way synchronized pilot deployment target, not an editing environment. |
| GOV-03 | P0 | Direct changes in the Hugging Face Space are unsupported and may be overwritten. |
| GOV-04 | P0 | Changes shall be made on focused branches and integrated through reviewed pull requests except during repository bootstrap. |
| GOV-05 | P0 | Every milestone shall update the changelog, work-package state, work claims and handover. |
| GOV-06 | P0 | Continuous integration shall validate the static application, automated tests and Docker image before deployment. |
| GOV-07 | P0 | Deployment credentials shall be stored in GitHub secrets or a future short-lived OIDC mechanism, never in source. |
| GOV-08 | P0 | The public repository shall contain only synthetic user data and synthetic media. |

## 3. Verification semantics

The platform establishes probability and friction, not formal legal proof.

Approved public labels:

- Student email verified
- Student document verified
- Live selfie verified

Disallowed unless independently justified:

- Identity verified
- University-confirmed student
- Officially authenticated student

## 4. MVP functional requirements

### 4.1 Eligibility and authentication

| ID | Priority | Requirement |
|---|---:|---|
| AUTH-01 | P0 | Only users declaring an age of at least 18 may continue. |
| AUTH-02 | P0 | Production access shall require an age-assurance control stronger than declaration alone. |
| AUTH-03 | P0 | Production access shall require verified control of a phone number. |
| AUTH-04 | P0 | Sessions shall be revocable and protected against brute-force and code-replay attacks. |
| AUTH-05 | P0 | Duplicate registration signals shall be evaluated server-side. |

### 4.2 Student probability verification

| ID | Priority | Requirement |
|---|---:|---|
| EDU-01 | P0 | Users shall select an institution from a controlled registry. |
| EDU-02 | P0 | Institutional email domains shall be allowlisted per institution. |
| EDU-03 | P0 | Successful possession verification shall create a dated verification record. |
| EDU-04 | P0 | A manual current-student-document fallback shall exist for legitimate students without usable institutional email. |
| EDU-05 | P0 | Verification documents shall be minimized and deleted after the review and appeal window. |
| EDU-06 | P1 | Student status shall be reverified at least annually. |

### 4.3 Live-selfie challenge

| ID | Priority | Requirement |
|---|---:|---|
| LIVE-01 | P0 | Capture shall use the live front camera and shall not accept a gallery file as the verification source. |
| LIVE-02 | P0 | Capture shall last approximately three to five seconds. |
| LIVE-03 | P0 | The user shall look at the camera, blink and perform a requested slow head turn. |
| LIVE-04 | P0 | Production liveness analysis shall verify face presence and requested motion. |
| LIVE-05 | P0 | A high-quality source frame shall be selected automatically. |
| LIVE-06 | P0 | Raw video shall never be public and shall be deleted after processing within a documented short retention window. |
| LIVE-07 | P0 | The prototype shall clearly distinguish camera-flow demonstration from production liveness verification. |

### 4.4 Avatar generation

| ID | Priority | Requirement |
|---|---:|---|
| AV-01 | P0 | A stylized look-alike avatar shall be generated from the selected frame. |
| AV-02 | P0 | Recognisable traits shall be preserved without materially changing apparent age, skin tone or facial proportions. |
| AV-03 | P0 | The public avatar shall use a controlled three-to-five-second animation. |
| AV-04 | P0 | Users shall preview and accept the avatar before publishing. |
| AV-05 | P0 | Failed, offensive or materially misleading outputs shall not be published. |
| AV-06 | P0 | Model training on user captures shall be prohibited without separate optional consent. |
| AV-07 | P0 | The prototype local stylization effect shall not be represented as the production avatar model. |

### 4.5 Profile and privacy

| ID | Priority | Requirement |
|---|---:|---|
| PROF-01 | P0 | Public profiles shall use a first name or nickname, not a surname. |
| PROF-02 | P0 | The institution shall be hideable while retaining a generic verified-student badge. |
| PROF-03 | P0 | Exact location, private email, phone number and source selfie shall never be public. |
| PROF-04 | P0 | A profile shall contain relationship intent, at least two prompts and at least three interests. |
| PROF-05 | P0 | Users shall be able to pause discovery without deleting conversations. |
| PROF-06 | P1 | Invisible mode shall limit visibility to people already liked. |

### 4.6 Discovery and matching

| ID | Priority | Requirement |
|---|---:|---|
| DISC-01 | P0 | The primary experience shall present one profile at a time. |
| DISC-02 | P0 | Users shall be able to pass, like or comment on a specific profile component. |
| DISC-03 | P0 | Messaging shall require a mutual match. |
| DISC-04 | P0 | Location shall be city-level or broadly banded, never exact distance. |
| DISC-05 | P0 | Reduced-motion and data-saving modes shall replace animation with poster images. |
| DISC-06 | P1 | A static grid may be added after local profile density is sufficient. |

### 4.7 Messaging and safety

| ID | Priority | Requirement |
|---|---:|---|
| MSG-01 | P0 | Matched users shall be able to exchange text messages. |
| MSG-02 | P0 | Every profile and conversation shall expose report, block and unmatch controls. |
| MSG-03 | P0 | Blocking shall take effect immediately. |
| MSG-04 | P0 | The MVP shall exclude user-uploaded chat images and videos. |
| MSG-05 | P0 | Abuse, spam and scam controls shall be enforced server-side. |
| MSG-06 | P1 | Voice notes may be added after moderation and retention controls are validated. |
| SAFE-01 | P0 | Moderators shall have a severity-prioritized review queue and auditable enforcement actions. |
| SAFE-02 | P0 | Suspected underage accounts shall be suspended pending review. |
| SAFE-03 | P0 | Community standards, appeal processes and child-safety procedures shall exist before live users are admitted. |

### 4.8 Notifications

| ID | Priority | Requirement |
|---|---:|---|
| NOTIF-01 | P0 | In-app notifications shall cover verification, matches, messages and moderation decisions. |
| NOTIF-02 | P0 | Installed PWA web push shall be supported where available. |
| NOTIF-03 | P0 | Lock-screen text shall be privacy-conscious by default. |
| NOTIF-04 | P1 | A native shell shall improve notification reliability where PWA behavior is insufficient. |

## 5. PWA and hosting requirements

| ID | Priority | Requirement |
|---|---:|---|
| PWA-01 | P0 | The application shall work in a mobile browser without installation. |
| PWA-02 | P0 | The application shall provide a Web App Manifest and service worker. |
| PWA-03 | P0 | Essential workflows shall not depend on background browser execution. |
| PWA-04 | P0 | Avatar generation, matching, messaging and moderation shall ultimately be server-side services. |
| PWA-05 | P0 | Hugging Face local disk shall be treated as disposable. |
| PWA-06 | P0 | Persistent production data shall use external managed storage and database services. |
| PWA-07 | P0 | The Docker image shall listen on port 7860 for the pilot Space. |
| PWA-08 | P0 | Camera capture shall require HTTPS outside local development. |

## 6. Non-functional requirements

### Performance

- Initial usable screen within three seconds on a normal 4G connection.
- Static avatar poster preferably below 200 KB.
- Animated avatar asset preferably below 2 MB.
- No simultaneous autoplay of multiple animated profiles.
- All long-running jobs shall be resumable and server-owned.

### Accessibility and internationalization

- WCAG 2.2 AA target.
- French and Arabic/RTL are P0 production languages.
- Every gesture shall have a visible control alternative.
- Reduced-motion support is mandatory.
- Camera guidance shall have textual instructions.

### Security and privacy

- HTTPS, encryption at rest, strict access control and audit logging.
- No raw biometric media in analytics.
- No production secrets or personal data in GitHub or Hugging Face repositories.
- Signed short-lived media access.
- Automated retention/deletion jobs with evidence.
- Pre-pilot threat model, privacy assessment and penetration test.

## 7. Prototype acceptance criteria

The first prototype milestone is complete when:

1. the responsive PWA runs locally and in Docker;
2. institution/email-domain matching works against synthetic fixtures;
3. the browser can record a four-second camera clip where supported;
4. the recording remains in memory and a frame can be selected locally;
5. a clearly labeled non-production stylized avatar preview is produced;
6. a user can complete a profile and control institution visibility;
7. discovery supports pass, contextual like and mutual-match simulation;
8. a local chat demonstration supports send, report, block and unmatch UX;
9. PWA manifest, service worker and install assets validate;
10. documentation, work claims and handover reflect actual limitations;
11. CI and Docker validation pass;
12. Hugging Face synchronization is defined but remains gated until the Space variable and token are configured.

## 8. Explicit exclusions from the first prototype

- production authentication or persistent accounts;
- real institutional email delivery;
- automated age assurance;
- automated liveness classification;
- production AI avatar generation;
- persistent matching or messaging;
- real moderation operations;
- exact location;
- user photo/video messaging;
- payments, subscriptions or advertising;
- native shells.
