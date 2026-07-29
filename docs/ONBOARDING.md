# Rendezvue onboarding design

**Version:** 1.0  
**Updated:** 2026-07-29

## Goal

The onboarding must feel like building a promising serious-introduction profile, not applying for an administrative permit. It checks eligibility early, creates recoverable progress, groups sensitive questions coherently and delays the camera until the user understands the value and privacy promise.

## Sequence

### 0. Value proposition

Explain adult-only serious introductions, fuzzy privacy portraits, student-first community benefits, free discovery and the pilot boundary.

### 1. Eligibility

- date of birth;
- current relationship state;
- Netherlands pilot region;
- serious intent and community fit.

Ineligible users stop before extended data collection.

### 2. Private account

Production target: phone, email OTP/magic link or approved identity provider plus a recovery channel. The concept pilot simulates account creation and saves progress locally.

### 3. Basic identity

- first name or nickname;
- gender identity;
- who the user seeks;
- city or broad region.

### 4. Life stage and optional student layer

- student, recent graduate, employed, self-employed, job-seeking or other;
- students may select MBO/HBO/WO, institution and student email;
- verification is optional for general membership but required for a verified-student badge, student discount, Campus Mode and student events.

### 5. Relationship and family context

- never married, divorced or widowed;
- children yes/no;
- optional coarse child count;
- open to a partner with children;
- future child preference;
- serious relationship intent and time horizon.

No identifying data about children is collected.

### 6. Live camera and privacy portrait

Explain purpose, request camera permission in context, record a short blink/head-turn challenge, create controlled fuzzy variants locally and let the user choose. The pilot does not claim automated liveness classification.

### 7. Faith and lifestyle

Self-description, daily practice, compatibility importance and optional lifestyle tags. Faith practice starts private and no piety score exists.

### 8. Personality and conversation context

At least three interests and two substantive prompts. This creates enough material for contextual likes and reduces empty profiles.

### 9. Public-profile preview

Show exactly what discovery users see. Visibility controls cover institution, faith practice and optional child-count detail.

### 10. Community promise and publish

Confirm truthful information, current single status, serious intent, respect for privacy and acceptance of moderation rules. Only then publish.

## Interaction rules

- one primary decision or coherent topic per screen;
- progress saved after every stage;
- Dutch/English switching preserves state;
- back navigation never destroys prior answers;
- payment is absent from onboarding;
- every sensitive question explains why it is needed;
- account deletion and correction remain available;
- funnel analytics use stage events, not raw faith or family values.

## Concept-pilot implementation

The static pilot implements the full sequence in browser state and local storage. It uses synthetic verification and a displayed demo code. It must not be used with real identity documents or production-sensitive data.

## Measurement

- start-to-eligibility completion;
- account-stage completion;
- drop-off by stage;
- camera permission and successful capture;
- privacy-variant selection;
- profile publication;
- time to first profile view;
- comprehension of student verification and contact pricing;
- qualitative trust and attractiveness feedback.
