# Rendezvue architecture

**Version:** 1.1  
**Updated:** 2026-07-30

## 1. Current public concept-pilot topology

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

The Static Space performs no application build and owns no persistent state. The public deployment remains a synthetic concept pilot and uses local browser state only.

## 2. Current browser modules

```text
apps/web/
  app.js                    onboarding state machine and interaction orchestration
  community-policy.js       man/woman community policy and derived discovery direction
  styles.css                retained visual system
  pilot-v1.css              product-baseline additions
  src/domain.js             eligibility, life stage, family, faith and profile rules
  src/i18n.js               Dutch/English copy
  src/camera.js             live capture and frame extraction
  src/avatar.js             browser-local privacy portrait variants
  src/demo-data.js          synthetic cross-life-stage profiles
  src/backend-contract.js    safe local/remote backend boundary
```

The former build-time patching of the privacy-filter grid is removed. Source equals the behaviour that is built and deployed.

## 3. Public concept-pilot state

The browser state models the complete flow but is not a security boundary. It may persist non-production progress in local storage. Camera source data remains browser-local. The selected derived portrait may be stored locally so the concept flow can resume.

Prototype interactions are deterministic and local:

- likes and passes are not shared between users;
- the first like creates a pilot match;
- one local contact entitlement opens a conversation;
- chat, reports and feedback exist only in local demo state;
- feedback has no ranking effect.

The runtime backend mode defaults to `local-demo`. A public artifact must not silently switch to a remote backend.

## 4. Backend proof topology

```text
Public Hugging Face PWA                 Private proof preview
(local-demo only)                       (controlled accounts only)
          |                                      |
          | no persistent calls                  v
          |                             Supabase Auth / API
          |                                      |
          |                                      v
          |                             PostgreSQL + RLS
          |                             private Storage
          |                             Realtime publication
          |                                      |
          +---------------- GitHub migrations ---+
```

`supabase/config.toml` and versioned migrations are committed to GitHub. Provider secrets, service-role keys and real user data are never committed or included in the public static artifact.

## 5. Server-authoritative domain boundaries

```text
Account (auth.users)
Profile
Eligibility
LifeStage
StudentVerification
FamilyContext
FaithProfile
PrivacyPortrait
AttractionSignal
Match
ContactEntitlement
Conversation / Message
Block
InteractionFeedback
SafetyReport
ModerationCase
AuditEvent
```

These boundaries are implemented as separate tables in the backend proof migration and described in `docs/DATA-MODEL.md` and `docs/BACKEND-PROOF.md`.

## 6. Backend proof operations

### Like to match

`record_attraction_signal(...)` derives the actor from the authenticated session, rejects self-interaction and blocked or unpublished targets, stores the signal and creates one normalized match only after a reciprocal like.

### Contact right to conversation

`open_match_conversation(...)` locks the match and entitlement, verifies participant and block state, consumes one valid entitlement idempotently and creates or returns the unique conversation. Both match participants may then reply.

### Messaging

Messages are insertable only by a participant in an open conversation. Realtime delivery never grants access by itself; table RLS remains authoritative.

### Safety

Blocks are server records. Feedback, safety reports, moderation cases and audit events are separate. Moderation and audit tables have no authenticated-user policies.

## 7. Data exposure architecture

- private profile domains are readable only by their owner in the first migration;
- `discovery_profiles` exposes only approved basic profile and life-stage fields;
- full family and faith data remain fail-closed until visibility projections are reviewed;
- incoming likes are not directly queryable by the recipient;
- a participant can read only their matches, conversations and messages;
- report subjects cannot read reports about themselves;
- privacy portrait objects are stored in a private bucket under the owner UUID prefix;
- service-role operations are reserved for controlled backend and moderation processes.

## 8. Security and privacy invariants

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
- all deployed files derive from accepted GitHub source;
- the public concept pilot never receives a service-role credential.

## 9. Deployment lanes

### Public concept lane

GitHub `main` builds and deploys to the existing Hugging Face Static Space. This lane remains synthetic and suitable for UX review only.

### Private proof lane

A later non-public preview build will receive browser-safe Supabase URL and publishable-key configuration. It is limited to controlled test accounts until privacy, legal and moderation approval.

### Production lane

No production lane exists yet. A production environment requires provider/region approval, DPA/DPIA review, backup and incident controls, operational moderation, monitored migrations and explicit real-user authorization.

## 10. Framework decision

The dependency-light PWA remains appropriate for concept validation. A production component framework is selected only after the interaction model stabilizes, using accessibility, localization, state-machine, WebRTC, testing, bundle-size and maintainability criteria.
