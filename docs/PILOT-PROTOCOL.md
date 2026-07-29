# Rendezvue pilot protocol

**Version:** 1.0  
**Updated:** 2026-07-29

## 1. Pilot levels

### Level 1 — Functional concept pilot

Synthetic profiles and local state only. Validate onboarding, camera, privacy portrait, swipe/like, deterministic match, contact opening, chat, feedback and safety controls.

### Level 2 — Invite-only usability study

10–30 consenting adults, explicit research notice, no public sign-up, no payments, manual support and minimised source-media handling. Requires separate privacy and research preparation; it is not authorized by the current repository baseline.

### Level 3 — Closed city community pilot

Persistent real accounts, external backend, production authentication, formal privacy/legal readiness, moderation coverage, deletion and incident procedures. Real-user admission requires an explicit gate decision.

## 2. Current authorized scope

The repository currently authorizes Level 1 only:

- GitHub-controlled source and documentation;
- generated Hugging Face static frontend;
- synthetic profiles and conversations;
- browser-local capture and portrait generation;
- local resumable concept state;
- no production verification claims;
- no payment processing;
- no real dating conversations.

## 3. Test journeys

1. eligible non-student completes onboarding;
2. student completes optional verification and sees benefit explanation;
3. divorced user and parent complete family context without stigma;
4. user selects each privacy portrait on mobile;
5. user passes and directly likes by button and swipe;
6. user sends a contextual like and receives the pilot match;
7. user opens a conversation using the simulated contact right;
8. both chat and end contact;
9. user leaves neutral, positive or concern feedback;
10. user reports or blocks a profile;
11. user switches Dutch/English and resumes progress;
12. user deletes local pilot state.

## 4. Success measures

- onboarding completion and drop-off per stage;
- understanding of student-first/open membership;
- comprehension of marital/family fields;
- privacy portrait attractiveness and perceived safety;
- direct versus contextual-like usage;
- swipe discoverability and accessibility;
- match-to-contact-opening conversion;
- willingness to reply when the opener pays;
- comprehension of simulated pricing;
- report/feedback category comprehension;
- material defects by browser/device.

## 5. Safety stop conditions

Stop or redesign the next pilot level when:

- users think liveness or marital status is formally verified when it is not;
- the privacy portrait is too revealing or unusably abstract;
- family fields feel stigmatizing;
- student targeting creates safety concerns;
- feedback is understood as public rating;
- contact pricing causes users to bypass the platform immediately;
- moderation or deletion cannot be operated safely.

## 6. Evidence and handover

Each milestone records branch/PR, checks, hosted marker, device review, defects, limitations and next gate in the changelog, work claims and handover. No live-readiness claim follows from a passing static build.
