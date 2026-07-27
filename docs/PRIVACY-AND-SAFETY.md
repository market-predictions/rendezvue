# Privacy and safety baseline

## Public promise

Rendezvue provides visual dating discovery without requiring users to publish the original face capture.

The Dutch pilot is strictly for adults aged 18 or older in MBO, HBO and WO. MBO enrolment is never evidence of adulthood.

## Data classes

1. **Public profile:** nickname, age, avatar, education level, selected interests, prompts and user-controlled institution/faith visibility.
2. **Student evidence:** institution, mailbox verification, document fallback and reverification status.
3. **Age evidence:** age-assurance result and review evidence.
4. **Religious-belief data:** faith background, practice, compatibility preference and lifestyle tags.
5. **Highly sensitive source media:** short live-selfie video and extracted frame.
6. **Private communications:** matches, messages, blocks and reports.
7. **Operational evidence:** audit events, moderation decisions and security signals.

Each class requires a separate purpose, retention rule, access policy and deletion path.

## Faith-data principles

Religious beliefs require heightened protection.

- collect only self-selected information;
- never infer faith from name, appearance, location, institution or behavior;
- never calculate a piety or religiosity score;
- keep faith-practice visibility off by default;
- distinguish self-description from match preference;
- provide explicit, separable production choice and withdrawal;
- permit field-level editing and deletion;
- prohibit sale, advertising segmentation and unrelated reuse;
- prevent moderators from accessing faith data unless relevant to a report;
- log sensitive-data access;
- assess anti-Muslim, sectarian and coercive abuse risks;
- complete a DPIA/legal review before live use.

The prototype stores faith fields only in browser memory and uses synthetic profiles.

## Source-media principles

- request camera permission only in context;
- explain purpose before capture;
- never publish raw media;
- minimize capture duration;
- process locally where feasible;
- use short-lived encrypted storage only where server processing is necessary;
- automatically delete source media after processing;
- retain deletion evidence instead of source media;
- prohibit training use without separate optional consent.

## Age and student-status principles

- age assurance and student verification are independent controls;
- an institutional email is a probability signal, not legal identity proof;
- MBO creates a higher underage-screening risk;
- document fallback collects the minimum necessary fields;
- verified status expires and must be re-established;
- suspected minors are suspended before discovery or messaging.

## Safety principles

- mutual match before messaging;
- visible report, block and unmatch controls;
- immediate block enforcement;
- no user photo/video messaging in the first live MVP;
- no exact location or public contact details;
- moderation standards covering harassment, anti-Muslim abuse, sectarian abuse, coercion, scams and minors;
- child-safety and illegal-content escalation before live operation;
- role-limited, audited moderator access;
- appeals for significant decisions.

## Prototype warning

The current repository is a UX and browser-capability prototype. It must use synthetic accounts and must not process real student documents, real religious profiles, real identity evidence or real dating conversations.
