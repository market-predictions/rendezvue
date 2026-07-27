# Privacy and safety baseline

## Public promise

Rendezvue shall provide visual dating discovery without requiring users to publish the original face capture.

## Data classes

1. **Public profile data:** nickname, age, avatar, interests, prompts and user-selected institution visibility.
2. **Verification evidence:** institutional email verification, age result and live-selfie result.
3. **Highly sensitive source media:** short live-selfie video and extracted frame.
4. **Private communications:** matches, messages, blocks and reports.
5. **Operational evidence:** audit events, moderation decisions and security signals.

Each class requires a separate purpose, retention rule and access policy.

## Source-media principles

- ask camera permission only in context;
- explain the purpose before capture;
- do not publish raw media;
- minimize capture duration;
- process in memory where feasible;
- use short-lived encrypted temporary storage where server processing is necessary;
- automatically delete source media after processing;
- retain deletion evidence rather than source media;
- prohibit training use without separate optional consent.

## Safety principles

- 18+ only;
- mutual match before messaging;
- visible block/report controls;
- immediate block enforcement;
- no user media messaging in the MVP;
- no exact location;
- no public contact details;
- child-safety and illegal-content escalation procedures before live operation;
- moderator access is role-limited and audited;
- appeals are available for significant decisions.

## Prototype warning

The current repository is a UX and browser-capability prototype. It must use synthetic accounts and must not process real student documents or real dating conversations.
