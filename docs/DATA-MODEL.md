# Rendezvue domain data model

**Version:** 1.0  
**Updated:** 2026-07-29

## 1. Modelling doctrine

Rendezvue separates account identity, eligibility, public profile, sensitive compatibility data, verification evidence, attraction, communication, payments and safety. One broad `user` record must not become the authorization model.

The concept pilot represents these domains in browser state. A live pilot must implement them as server-authoritative records with row-level authorization, retention and audit rules.

## 2. Core aggregates

### Account

Private authentication identity.

```text
Account
- id
- auth_provider
- personal_email_or_phone
- status
- created_at
- last_login_at
- deletion_requested_at
```

Account identifiers are never public. Student email is not the permanent login identity.

### Eligibility

```text
Eligibility
- account_id
- date_of_birth
- age_assurance_status
- current_relationship_state
- serious_intent_confirmed_at
- community_fit_confirmed_at
- country
- reconfirm_due_at
```

Only `single` can enter discovery. Prior marital history is not stored here.

### Profile

```text
Profile
- account_id
- nickname
- gender_identity
- seeking
- city_region
- relationship_intent
- bio
- prompt_one
- prompt_two
- publication_status
```

### LifeStage

```text
LifeStage
- account_id
- primary_status
- education_level
- institution_id
- study_field
- occupation_category
- visibility
```

`primary_status` supports student, recent graduate, employed, self-employed, job-seeking and other. No value is a quality rank.

### StudentVerification

```text
StudentVerification
- id
- account_id
- institution_id
- method
- status
- verified_at
- expires_at
- evidence_reference
```

Student verification creates optional benefits; it is not an admission gate.

### FamilyContext

```text
FamilyContext
- account_id
- marital_history
- has_children
- child_count_band
- wants_children
- accepts_partner_with_children
- visibility
- confirmed_at
```

No record about an identifiable child is created. `marital_history` supports never married, divorced and widowed.

### FaithProfile

```text
FaithProfile
- account_id
- identity_description
- practice_description
- compatibility_importance
- lifestyle_tags
- field_visibility
- consent_or_legal_basis_reference
```

Faith fields are self-selected, deletable and never reduced to a piety score.

### PrivacyPortrait

```text
PrivacyPortrait
- id
- account_id
- variant_id
- derived_asset_reference
- source_capture_reference
- processing_method
- accepted_at
- source_delete_due_at
```

Source capture and public derived portrait are different data classes. The concept pilot keeps both local; production should retain source media only as briefly as demonstrably necessary.

## 3. Discovery and communication

### AttractionSignal

```text
AttractionSignal
- id
- actor_user_id
- target_user_id
- signal_type
- profile_component_id
- optional_comment
- created_at
- revoked_at
```

`signal_type` is pass, like or contextual like. A pass is personal preference, not a negative reputation vote.

### Match

```text
Match
- id
- user_a_id
- user_b_id
- matched_at
- status
- ended_at
```

A unique active match exists per user pair.

### ContactEntitlement

```text
ContactEntitlement
- id
- owner_user_id
- source
- quantity_remaining
- valid_from
- valid_until
- status
```

### Conversation and Message

```text
Conversation
- id
- match_id
- opened_by_user_id
- opened_at
- status

Message
- id
- conversation_id
- sender_user_id
- message_type
- body
- created_at
- deleted_at
```

One valid contact entitlement opens the conversation. Both participants can then reply without per-message charges.

## 4. Feedback, trust and safety

### InteractionFeedback

```text
InteractionFeedback
- id
- reviewer_user_id
- subject_user_id
- match_id
- interaction_depth
- positive_tags
- concern_tags
- optional_comment
- created_at
- credibility_weight
```

Feedback is private. “No chemistry” is neutral and cannot lower visibility.

### SafetyReport

```text
SafetyReport
- id
- reporter_user_id
- subject_user_id
- match_id
- category
- description
- evidence_references
- severity
- status
- created_at
```

Serious reports enter moderation, not a recommendation formula.

### TrustSignal and ProfileStanding

```text
TrustSignal
- id
- user_id
- source_type
- signal_code
- polarity
- severity
- confidence
- observed_at
- expires_at

ProfileStanding
- user_id
- discovery_eligibility
- quality_state
- safety_state
- messaging_state
- review_required
- evaluated_at
```

A robust pattern may create an internal signal. No single feedback item can directly reduce distribution. Material restrictions must be explainable, reviewable and appealable.

## 5. Payments

```text
Subscription
- id
- account_id
- plan_id
- provider
- provider_reference
- status
- current_period_end

PaymentEvent
- id
- account_id
- provider_event_id
- event_type
- amount
- currency
- received_at
- processed_at
- idempotency_status
```

A verified webhook or server-side provider lookup is the source of truth. Browser redirects never grant contact rights.

## 6. Visibility and ranking constraints

- account contact details are private;
- exact location is never public;
- institution is optional to display;
- practice visibility starts private;
- child count is optional and coarse;
- likes and passes are not public;
- no public star, downvote or numeric trust score;
- divorce, widowhood and parenthood create no hidden penalty;
- student, MBO, HBO, WO and work status create no prestige ordering;
- safety exclusion precedes discovery ranking;
- exposure fairness prevents unchecked popularity loops.
