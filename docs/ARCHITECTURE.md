# Rendezvue architecture

**Version:** 1.0  
**Updated:** 2026-07-29

## 1. Current concept-pilot topology

```text
GitHub branch / PR
      |
      v
CI: tests -> static build -> deployment artifact -> Docker validation
      |
      v
GitHub main (authority)
      |
      v
Hugging Face Static Space (generated web-facing PWA)
```

The Static Space performs no application build and owns no persistent state. The current milestone stores only local concept-pilot state in the browser.

## 2. Current browser modules

```text
apps/web/
  app.js                 onboarding state machine and interaction orchestration
  styles.css             retained visual system
  pilot-v1.css           product-baseline additions
  src/domain.js          eligibility, life stage, family, faith and profile rules
  src/i18n.js            Dutch/English copy
  src/camera.js          live capture and frame extraction
  src/avatar.js          browser-local privacy portrait variants
  src/demo-data.js       synthetic cross-life-stage profiles
```

The former build-time patching of the privacy-filter grid is removed. Source now equals the behaviour that is built and deployed.

## 3. Concept-pilot state

The browser state models the complete flow but is not a security boundary. It may persist non-production progress in local storage. Camera source data remains browser-local. The selected derived portrait may be stored locally so the concept flow can resume.

Prototype interactions are deterministic and local:

- likes and passes are not shared between users;
- the first like creates a pilot match;
- one local contact entitlement opens a conversation;
- chat, reports and feedback exist only in local demo state;
- feedback has no ranking effect.

## 4. Production domain boundaries

```text
Account
Eligibility
Profile
LifeStage
StudentVerification
FamilyContext
FaithProfile
PrivacyPortrait
VerificationEvidence
DiscoveryPreferences
AttractionSignal
Match
ContactEntitlement
Conversation / Message
InteractionFeedback
SafetyReport
TrustSignal / ProfileStanding
Subscription / PaymentEvent
ModerationCase / AuditEvent
```

These boundaries are described in `docs/DATA-MODEL.md`.

## 5. Target pilot architecture

```text
Hugging Face PWA / later native shell
             |
             v
Backend-for-frontend / API gateway
 | auth | profile | discovery | messaging | payments | moderation |
             |
             v
PostgreSQL + row-level authorization
Private object storage + signed access
Realtime channels + durable job queue
Audit/evidence store
             |
             v
Email/SMS, age assurance, liveness and payment providers
```

A managed PostgreSQL platform such as Supabase is the leading backend proof candidate because it combines authentication, relational storage, realtime messaging, private storage and row-level policies. Provider selection remains an ADR gate rather than a hard dependency.

## 6. Security and privacy invariants

- the browser is untrusted;
- persistent state never depends on Hugging Face;
- account identity and student evidence are separate;
- age assurance and student verification are independent;
- source media and public portrait are separate data classes;
- verification labels derive from evidence, not editable fields;
- blocks, contact entitlements and moderation are server-authoritative;
- faith and family data are not advertising segments;
- data about individual children is not collected;
- likes are attraction signals, not reputation votes;
- serious reports never become a simple ranking penalty;
- all deployed files derive from accepted GitHub source.

## 7. Contact-entitlement architecture

A match does not itself create an open conversation. A server transaction will:

1. lock the match and entitlement ledger;
2. consume one valid contact entitlement once;
3. create or return the unique conversation;
4. permit both participants to reply;
5. record an auditable idempotency key.

Redirect success from a payment provider shall never activate entitlement without a verified server-side event.

## 8. Feedback architecture

AttractionSignal, InteractionFeedback and SafetyReport remain separate. Aggregation may create internal TrustSignals, but no single review can directly reduce distribution. Serious categories create moderation cases. Positive public badges require sufficient independent evidence.

## 9. Framework decision

The dependency-light PWA remains appropriate for concept validation. A production component framework is selected only after the interaction model stabilizes, using accessibility, localization, state-machine, WebRTC, testing, bundle-size and maintainability criteria.
