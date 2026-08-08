# WP-070C — Policy-bound reversible moderation restrictions

**Status:** `IMPLEMENTATION_IN_PROGRESS`  
**Priority:** P1 pilot-readiness dependency  
**Issue:** #143  
**Parent:** WP-070 Trust & Safety Operations  
**Real-user admission:** unauthorized

## Objective

WP-070C is the first WP-070 package allowed to create a bounded moderation effect. It consumes only an independently approved WP-070B proposal and can execute only two reversible action classes:

- `restrict_discovery`;
- `restrict_contact`.

The effect is implemented as a separate, time-bounded authorization overlay. WP-070C does not rewrite participant-owned publication state, block records, match state, conversation state or Supabase Auth.

## Dependency chain

```text
WP-070A report/case/claim
  → WP-070B immutable proposal + independent review
    → WP-070C policy-bound reversible restriction
```

An approved WP-070B proposal is still non-effectful until the WP-070C executor independently re-validates the proposal, review, case, report and policy contract.

## Default-off safety model

`moderation_enforcement_policies` is private operational state. WP-070C ships two repository-defined policy templates for the reversible action classes, but both are **inactive**.

The only scope supported by the WP-070C schema is:

```text
synthetic_only
```

There is no service RPC for policy activation and no real-user scope in this package. Protected staging must therefore contain zero active enforcement policies after deployment.

CI/database tests may activate a policy directly as the database owner inside a transaction that is rolled back. That is test fixture setup, not an operational activation route.

## Restriction ledger

`moderation_restrictions` records one effect per approved proposal:

- proposal and independent review identifiers;
- case and subject identifiers;
- exact policy identifier/version;
- reversible action code;
- opaque executor reference;
- start timestamp;
- expiry timestamp.

The active state is derived rather than manually toggled:

```text
starts_at <= now() < expires_at
```

Expiry therefore removes the authorization effect automatically. No compensating destructive mutation is required.

The historical moderation case may remain `actioned` after expiry. `actioned` records that a governed moderation effect occurred; it is not the source of truth for whether the restriction is still currently active.

## Executor contract

`execute_approved_moderation_restriction(...)` is service-only and `SECURITY DEFINER`.

Before creating a restriction it requires:

1. a WP-070B proposal that is terminal `approved`;
2. exactly one independent review with decision `approved`;
3. reviewer reference different from proposer reference;
4. non-critical proposal;
5. action exactly `restrict_discovery` or `restrict_contact`;
6. case version/status/assignment/subject/report binding still equal to the approved snapshot;
7. report subject/category/severity still equal to the approved snapshot;
8. exact active policy key/version for that action;
9. policy scope `synthetic_only`;
10. target profile explicitly marked `is_synthetic=true`;
11. opaque validated executor reference.

The policy supplies the duration. Callers cannot choose an arbitrary expiry.

A proposal may create at most one restriction. A retry with the same policy/version returns the existing restriction. A different policy/version cannot silently replace a previously executed proposal.

## `restrict_discovery`

While active for either side of a discovery interaction:

- the restricted subject is not discoverable by others;
- a discovery-restricted actor cannot browse other profiles;
- attraction signals involving a discovery-restricted participant fail closed through the normal discovery contract;
- discovery profile media and discovery portrait-path/read guards fail closed;
- profile `publication_status` remains unchanged;
- existing matches and conversations remain untouched.

The restriction is therefore an authorization overlay, not a hidden mutation of the participant's own publication choice.

## `restrict_contact`

While active for either participant in an interaction:

- new attraction/contact progression fails closed;
- opening or retrying a conversation fails closed;
- `is_conversation_available` becomes false for message-write authorization;
- new message writes fail through the existing message RLS contract;
- matched portrait path/read guards fail closed;
- existing match rows remain unchanged;
- existing conversation rows remain unchanged;
- historical messages remain readable to participants under the existing participant-read policy;
- no moderator-created participant block is inserted.

After expiry, the normal authorization paths become available again if no independent product/safety boundary blocks them.

## Historical moderation state

Successful execution advances the associated moderation case and source report to `actioned` and appends a normal moderation `status_transition` event.

This transition records that a real bounded effect was executed. It does **not** make the effect permanent. Current restriction state is always derived from the restriction ledger timestamps.

Idempotent executor retries return before reapplying the case transition, so one proposal produces one restriction and one action transition.

## Audit model

Successful execution appends a sanitized `moderation_restriction_executed` service audit event containing bounded evidence such as:

- case/proposal identifiers;
- policy key/version/scope;
- reversible action code;
- opaque proposer reference;
- opaque independent reviewer reference;
- opaque executor reference;
- start/expiry timestamps.

Reporter identity and report free text are excluded.

## Privilege model

- anonymous/authenticated participants cannot read enforcement policies or restrictions;
- participants cannot execute the restriction executor;
- service role may read bounded policy/restriction state;
- service role cannot directly INSERT/UPDATE/DELETE policies or restriction rows;
- the active-restriction helper is private implementation detail;
- normal participant-facing discovery/contact/media functions retain only the execution privileges they already require;
- the profile RLS dependency on `can_discover_profile` remains intact.

## Irreversible-action boundary

WP-070C cannot execute:

- `suspend_account`;
- `terminate_account`;
- account deletion;
- Supabase Auth mutation;
- permanent restrictions;
- moderator-created participant blocks.

Those actions are not implied by WP-070B approval and require separate policy, notice/appeal, legal and operational safeguards before they can even be considered for real users.

## Critical-safety boundary

Critical proposals cannot pass through the reversible executor, even if a malformed or privileged test setup attempts to fabricate an approved critical proposal. Critical safety handling remains a separate specialist/policy workstream.

## Required evidence

Before merge:

- clean empty-database migration replay;
- pgTAP proof of default-off policy, privileges, executor gates, product authorization effects, expiry and privacy-safe audit;
- genuine parallel execution race proving one durable restriction/action transition;
- static source validator proving synthetic-only/default-off/irreversible-action boundaries;
- normal CI/full repository validation;
- independent `governance_release_assurance` on exact candidate.

After merge:

- protected backend migration/configuration must complete first;
- a causally ordered read-only WP-070C verifier must bind to the upstream exact `head_sha`;
- remote schema/RPC/privilege/default-off policy state must pass;
- canonical Cloudflare deployment must match the same exact commit;
- real-user admission must remain false.

## Explicit non-goals

WP-070C does not add:

- active real-user enforcement policy;
- early manual release/appeal decision flow;
- participant notice workflow;
- moderator browser UI;
- specialist critical-safety operating procedure;
- permanent or irreversible sanctions;
- real-user moderation operations;
- real-user admission.

## Definition of done

WP-070C may become `OUTCOME_CONFIRMED` only when the exact implementation candidate is independently assured, merged, protected migrations have applied, the exact-main remote verifier passes with zero active policies, and canonical deployment evidence is commit-matched.
