# Rendezvue domain data model

**Version:** 1.1  
**Updated:** 2026-07-30

## 1. Modelling doctrine

Rendezvue separates authentication identity, eligibility, public profile, sensitive compatibility data, verification evidence, attraction, communication, entitlements and safety. One broad `user` record must not become the authorization model.

The public concept pilot represents these domains in browser state. The backend proof implements the first server-authoritative PostgreSQL version with Row Level Security. Implementation details are in `supabase/migrations/20260730203000_backend_proof_foundation.sql`.

## 2. Identity and profile aggregates

### Account

Supabase Auth `auth.users` is the proof account identity.

```text
Account
- id
- auth provider / credential identity
- email or phone
- account metadata
- created_at
- last_sign_in_at
```

Account identifiers are never public. Student email is not the permanent login identity.

### Profile — `profiles`

```text
Profile
- user_id
- nickname
- sex: woman | man
- city_region
- language
- relationship_intent
- bio
- publication_status
- profile_completed_at
- published_at
- created_at / updated_at
```

This community does not store a separate user-selectable seeking field. Discovery direction is derived: a man is shown women and a woman is shown men.

### Eligibility — `eligibility`

```text
Eligibility
- user_id
- date_of_birth
- current_relationship_state
- adult_confirmed
- serious_intent_confirmed
- community_fit_confirmed
- terms_version
- confirmed_at
- reconfirm_after
```

Only `single` is eligible for publication/discovery. Prior marital history is not stored here.

### LifeStage — `life_stages`

```text
LifeStage
- user_id
- primary_status
- education_level
- institution_id
- study_field
- graduation_year
- occupation_category
- institution_visible
```

`primary_status` supports student, recent graduate, employed, self-employed, job-seeking, other and private. It is not a quality rank.

### StudentVerification — `student_verifications`

```text
StudentVerification
- id
- user_id
- institution_id
- verification_method
- status
- verified_at
- expires_at
- evidence_reference
```

Student verification creates optional benefits and never admission eligibility.

### FamilyContext — `family_contexts`

```text
FamilyContext
- user_id
- marital_history
- has_children
- child_count_band
- wants_children
- accepts_partner_with_children
- marital_history_visibility
- children_visibility
```

No record about an identifiable child is created. `marital_history` supports never married, divorced and widowed. Current relationship state remains in Eligibility.

### FaithProfile — `faith_profiles`

```text
FaithProfile
- user_id
- faith_identity
- practice_description
- compatibility_importance
- lifestyle_tags
- practice_visibility
- consent_version
- consented_at
```

Faith fields are self-selected, deletable and never reduced to a piety score. The first backend migration keeps full faith records owner-only.

### PrivacyPortrait — `privacy_portraits`

```text
PrivacyPortrait
- id
- user_id
- object_path
- treatment
- status
- is_public_profile_portrait
- source_retained_until
```

Source capture and derived portrait are separate data classes. The proof uses a private object-storage bucket with a user-ID path prefix.

## 3. Discovery and attraction

### DiscoveryProfile — `discovery_profiles` view

The first security-invoker view exposes only:

- user ID;
- nickname;
- sex;
- broad city/region;
- language;
- relationship intent;
- bio;
- publication date;
- life stage;
- institution only when explicitly visible.

Full family and faith records remain fail-closed until field-level discovery projections are reviewed.

### AttractionSignal — `attraction_signals`

```text
AttractionSignal
- id
- actor_user_id
- target_user_id
- signal_type: pass | like | contextual_like
- profile_component
- opening_message
- created_at / updated_at
- revoked_at
```

A pass is personal preference, not negative reputation. Incoming likes are not directly readable by the target.

### Match — `matches`

```text
Match
- id
- ordered user_a_id / user_b_id
- status
- matched_at
- ended_at
```

The user IDs are normalized so one pair can have only one match row. `record_attraction_signal(...)` creates or reactivates the match only after reciprocal like/contextual-like signals.

## 4. Contact and messaging

### ContactEntitlement — `contact_entitlements`

Each row represents one contact-opening right.

```text
ContactEntitlement
- id
- owner_user_id
- source_type
- status
- valid_from
- expires_at
- consumed_match_id
- consumed_at
- idempotency_key
```

Sources may later include pilot, subscription, single purchase, promotion or support. No provider currently issues these records.

### Conversation — `conversations`

```text
Conversation
- id
- match_id (unique)
- opened_by_user_id
- status
- opened_at
- ended_at
```

`open_match_conversation(...)` consumes one valid entitlement once and creates or returns the unique conversation. Both match participants can reply.

### Message — `messages`

```text
Message
- id
- conversation_id
- sender_user_id
- body
- created_at
- edited_at
- deleted_at
```

The first live MVP supports text only. RLS permits insertion only by a participant in an open conversation.

### Block — `blocks`

```text
Block
- id
- blocker_user_id
- blocked_user_id
- reason_code
- created_at
```

A block is server-authoritative. It is checked before discovery reads, new attraction signals and conversation opening. The next migration must also end or freeze existing conversations atomically.

## 5. Feedback, reports and moderation

### InteractionFeedback — `interaction_feedback`

```text
InteractionFeedback
- id
- match_id
- reviewer_user_id
- subject_user_id
- interaction_depth
- positive_tags
- concern_tags
- optional_comment
- credibility_weight
- created_at
```

Feedback is private to the reviewer and operational roles. “No chemistry” is neutral and cannot lower visibility.

### SafetyReport — `safety_reports`

```text
SafetyReport
- id
- reporter_user_id
- subject_user_id
- match_id
- category
- description
- severity
- status
- created_at / updated_at
```

Serious reports enter moderation rather than a recommendation formula. The subject cannot read reports about themselves.

### ModerationCase — `moderation_cases`

```text
ModerationCase
- id
- subject_user_id
- source_report_id
- status
- priority
- assigned_to
- decision_code
- decision_reason
- appeal_deadline
```

No ordinary authenticated-user policy exists. Moderator roles and console are not implemented yet.

### AuditEvent — `audit_events`

```text
AuditEvent
- identity id
- actor_user_id
- actor_type
- event_type
- subject_user_id
- entity_type / entity_id
- payload
- occurred_at
```

Audit records are not readable by ordinary authenticated users.

## 6. Later aggregates not implemented in the first migration

### VerificationEvidence

Formal age, liveness, student document and identity evidence with purpose, provider, result, expiry, retention and appeal metadata.

### TrustSignal and ProfileStanding

Internal, expiring, evidence-backed patterns. No single feedback item can directly reduce distribution. Material restrictions must be explainable, reviewable and appealable.

### Subscription and PaymentEvent

Provider references, subscription period, verified webhook events, idempotency and refunds. Browser redirects never grant contact rights.

### Notification and DeviceRegistration

Email/push preferences, device subscriptions and delivery state.

## 7. Authorization matrix

| Domain | Owner | Match participant | Other authenticated user | Moderator/service |
|---|---|---|---|---|
| Profile basics | read/write | published read | published read | operational access later |
| Eligibility | read/write | none | none | controlled review later |
| Life/family/faith | read/write | fail-closed initially | none | controlled review later |
| Student verification | read | none | badge projection later | verification service later |
| Privacy portrait metadata/object | read/write own | signed public derivative later | signed public derivative later | controlled processing later |
| Outgoing attraction signals | read through own scope | none | none | fraud/audit later |
| Match/conversation/messages | participant only | participant only | none | moderation access later |
| Feedback | reviewer only | none | none | moderation access later |
| Safety report | reporter only | none | none | moderation access later |
| Moderation/audit | none | none | none | service-role only |

## 8. Visibility and ranking constraints

- account contact details are private;
- exact location is never public;
- institution is optional to display;
- faith practice starts private;
- child count is optional and coarse;
- likes and passes are not public;
- no public star, downvote or numeric trust score;
- divorce, widowhood and parenthood create no hidden penalty;
- student, MBO, HBO, WO and work status create no prestige ordering;
- safety exclusion precedes discovery ranking;
- exposure fairness must prevent unchecked popularity loops.

## 9. Migration status

Implemented as a versioned contract but not yet proven against a running database:

- table and enum creation;
- Auth profile trigger;
- private storage bucket;
- RLS policies;
- match and conversation functions;
- Realtime publication;
- indexes and audit writes.

The next gate is a clean local migration reset plus two-account RLS, concurrency, idempotency, blocking and deletion tests.


## WP-076 profile-media slots and camera-origin trust

`privacy_portraits` remains the authoritative prepared-media table. WP-076 adds bounded presentation metadata rather than a second media store:

- `profile_media_slot`: `live_selfie`, `profile_photo_1` or `profile_photo_2`;
- `capture_origin`: `live_camera`, `camera`, `gallery` or migration-only `legacy`;
- `is_profile_media_visible`: only prepared `card` rows may be visible;
- `live_capture_completed_at` and `capture_proof_version`: present for the Live-selfie slot.

One user can expose at most one visible card per slot, hence at most three visible prepared media items. `live_selfie` requires `capture_origin=live_camera`. Optional slots accept camera/gallery content. Source and avatar rows remain private and cannot become discovery media.

Server-authoritative operations:

- `assign_prepared_profile_media(...)` binds a prepared portrait transaction to one bounded slot and capture origin;
- `set_primary_profile_media(...)` selects exactly one visible prepared card as the discovery primary;
- `remove_optional_profile_media(...)` removes only optional slots from the visible profile;
- `get_own_profile_media()` returns the owner's bounded visible-card projection;
- `get_discovery_profile_media(other_user)` returns visible prepared cards only for a published, unblocked profile;
- `publish_profile()` requires a visible camera-origin Live selfie for authenticated product publication.

The short camera challenge is not stored as a public media role. The profile-visible Live selfie is a prepared still derivative that uses the same crop/privacy pipeline as other portraits. The data model therefore records **camera origin and preparation**, not a claim of automated liveness, biometric face match or legal identity verification.

Implementation PR #123 merged as `ddecb67dbbd3487daefac16045ff147a6649c1e2`; protected staging `31255042784` and canonical verifier `31255080791` confirmed the deployed contract. Real-user admission remains unauthorized.
