# WP-070B — Dual-control moderation action authorization foundation

**Status:** implementation in progress  
**Priority:** P1 pilot-readiness dependency  
**Issue:** #139  
**Parent:** WP-070 Trust & Safety Operations  
**Real-user admission:** unauthorized

## Objective

WP-070B adds an authorization boundary between moderation investigation and any future material enforcement action. An investigating operator may propose a bounded action class, but that proposal cannot be authorized by the same operator and cannot execute anything by itself.

This package deliberately implements **authorization evidence, not enforcement**.

## Dependency

WP-070A is `OUTCOME_CONFIRMED` and supplies:

- server-authoritative report severity;
- a service-only moderation queue;
- controlled case claiming;
- optimistic case versions and expected-state checks;
- append-only case/audit history;
- no participant visibility into moderation operations.

WP-070B builds directly on those contracts. It does not reopen WP-070A.

WP-075 cross-browser e-mail OTP remains independently blocked by the current hosted mail-provider capability. Canonical staging truthfully remains on PKCE magic-link authentication; that external dependency does not block this Trust & Safety foundation.

## Governing principle

A material moderation action must never be self-authorized by the person who investigated and proposed it.

The minimum server-side sequence is therefore:

```text
report → case → claim → investigate → propose → independent review
```

A later separately governed package may add:

```text
independently authorized proposal → controlled enforcement execution
```

WP-070B stops before that second line.

## Proposal snapshot

`moderation_action_proposals` records a bounded, immutable snapshot containing:

- exact moderation case;
- exact case version and investigating state;
- subject user;
- source report identifier;
- server-assigned category and severity;
- server-derived review lane;
- bounded technical action class;
- bounded rationale code;
- opaque proposing-operator reference;
- whether specialist escalation is required;
- proposal status and decision timestamp.

It intentionally does **not** contain reporter identity, report description, free-text moderator notes, e-mail addresses or credentials.

Only the operator currently assigned to an `investigating` case may create a proposal. The caller cannot supply category, severity, subject or review lane; those values are read from the server-authoritative case/report state.

One pending proposal per case is permitted.

## Bounded action classes

WP-070B recognizes these technical proposal classes:

- `restrict_discovery`;
- `restrict_contact`;
- `suspend_account`;
- `terminate_account`;
- `specialist_safety_review`.

These names describe possible future effect classes. **No enforcement execution** is attached to them in WP-070B.

An approved proposal does not:

- pause or suspend profile publication;
- alter discovery access;
- block or end a match;
- close a conversation;
- delete an account;
- mutate Auth;
- move the moderation case to `actioned`.

## Review lanes

The review lane is derived server-side from the existing report category/severity:

- `minor_suspected` → `child_safety`;
- threat, stalking, sexual coercion or other critical severity → `urgent_safety`;
- scam/money or impersonation → `fraud_identity`;
- hidden relationship → `relationship_integrity`;
- otherwise → `general`.

This is internal routing metadata, not a public classification or SLA.

## Independent reviewer

`review_moderation_action_proposal` requires:

- a still-pending proposal;
- an opaque reviewer reference different from the proposer;
- the underlying case to remain at the exact snapshotted version;
- the case to remain `investigating`;
- the case assignment still to belong to the proposer;
- source report category/severity/subject still to match the proposal snapshot.

A review can produce:

- `approved`;
- `rejected`;
- `escalated`.

The append-only `moderation_action_reviews` table permits exactly one review row per proposal. The proposal row is locked during review so concurrent reviewers cannot create conflicting terminal decisions.

## Stale proposal recovery

A proposal that no longer matches the current case version/state/assignment must remain impossible to approve. Pure fail-closed behavior, however, would leave that stale row `pending` and permanently occupy the one-pending-per-case index.

WP-070B therefore adds the terminal administrative state `superseded` and the controlled service-only RPC `supersede_stale_moderation_action_proposal`.

It may succeed only when the proposal is demonstrably stale. A still-current proposal cannot be superseded. Supersede:

- creates no independent review row;
- authorizes no action;
- executes no action;
- records a bounded reason plus opaque operator reference in the durable audit;
- releases the pending slot so a fresh proposal can bind the then-current investigating case state.

Detailed contract: `docs/WP-070B-STALE-RECOVERY-ADDENDUM.md`.

## Critical safety boundary

A proposal derived from a `critical` report is marked `critical_escalation_required=true`.

WP-070B prohibits an ordinary `approved` decision for such a proposal. An independent reviewer may reject it or mark it `escalated` for a later specialist/policy workflow. This package does not define or execute external child-safety, emergency-service or law-enforcement reporting procedures.

The existing server-assigned severity cannot be downgraded by the proposer or reviewer.

## Privilege model

The proposal and review tables are private operational data:

- anonymous/authenticated participants cannot read them;
- participants cannot execute proposal/review RPCs;
- `service_role` may read bounded operational state;
- direct service-role INSERT/UPDATE/DELETE is revoked;
- service mutations must use controlled `SECURITY DEFINER` functions;
- proposal snapshot fields are immutable;
- review records are append-only in normal service operation.

The bounded pending-proposal projection omits reporter identity and report free text.

## Audit model

Proposal, review and stale-supersede functions append sanitized service audit events.

Permitted audit metadata includes:

- case identifier/version;
- server severity;
- review lane;
- technical action code;
- critical-escalation flag;
- review decision/code;
- opaque proposing-operator reference;
- opaque independent-reviewer reference;
- opaque stale-supersede operator reference.

The proposer and reviewer references are deliberately retained in the durable audit so the four-eyes evidence survives later governed cleanup of operational proposal/review rows. They are technical opaque references, not e-mail addresses or a claim of production staff SSO identity.

Reporter identity and report description are excluded.

## Concurrency evidence

WP-070B requires a genuine two-process race test:

1. create one pending proposal;
2. start two independent service reviewers concurrently;
3. one attempts approval and the other rejection;
4. exactly one transaction succeeds;
5. the loser fails because the proposal is already terminal;
6. exactly one review row and one review audit event exist;
7. the moderation case remains `investigating` and unchanged by authorization.

Sequential tests alone are insufficient for this invariant.

## Explicit non-goals

WP-070B does **not**:

- execute publication, discovery, contact, suspension, termination or deletion actions;
- automatically sanction a participant based on reports or feedback;
- create a moderator browser UI;
- establish staff SSO/identity beyond opaque service-side operator references;
- implement an appeal submission or appeal decision flow;
- define external child-safety or legal reporting procedures;
- authorize real-user moderation operations;
- authorize real-user admission.

## Acceptance criteria

1. Participants cannot inspect or operate the proposal/review layer.
2. Direct service-role mutation is denied; controlled functions are required.
3. Only the currently assigned investigating operator can create a proposal.
4. Proposal state is bound to exact case version/status and server-derived report severity/category.
5. One pending proposal per case is enforced.
6. The proposer cannot review their own proposal.
7. Stale case version/state or changed assignment fails closed; a proven-stale proposal has a controlled, audited `superseded` recovery route that cannot be used on a current proposal.
8. Exactly one review can decide a proposal, including under a real parallel race.
9. Critical proposals cannot receive ordinary approval and require specialist escalation for further action.
10. Authorization and stale recovery do not mutate participant/product/Auth state or set a case to `actioned`.
11. Proposal/review/supersede audit evidence excludes reporter identity and report free text while durably retaining the involved opaque operator references.
12. Clean migration replay, pgTAP/database contracts, concurrency tests, schema lint and full repository validation pass on the exact candidate.
13. Independent `governance_release_assurance` issues `PASS` on the exact candidate before merge.
14. Protected staging verification confirms the remote schema/RPC/privilege/stale-recovery/durable-audit contract on exact main after merge.
15. Real-user admission remains unauthorized.

## Definition of done

WP-070B is complete only after:

- implementation is merged from an exact independently assured candidate;
- all WP-070B migrations are applied to protected staging;
- a protected read-only verifier confirms the remote contract;
- post-action evidence confirms no enforcement capability or real-user admission was introduced.

A green PR alone is not completion.
