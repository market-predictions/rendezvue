# Roadmap addendum — WP-070C reversible restriction execution

**Date:** 2026-08-08  
**Parent:** WP-070 Trust & Safety Operations  
**Issue:** #143  
**Priority:** P1 pilot-readiness dependency  
**Status:** `IMPLEMENTATION_IN_PROGRESS`

## Sequencing

WP-070A and WP-070B are `OUTCOME_CONFIRMED`. WP-070C is the next P1 Trust & Safety package because it tests the first actual moderation effect against the already-proven intake and independent-authorization boundaries.

Sequence:

1. WP-070A — intake, queue, claim and optimistic case state: complete;
2. WP-070B — immutable proposal + independent review: complete;
3. WP-070C — default-off synthetic-only reversible restriction execution: active;
4. later package — participant notice, early release/correction/appeal and policy ownership;
5. later package — specialist critical-safety escalation and operating procedure;
6. only after those controls: reassess whether any stronger/irreversible action class is justified;
7. WP-080 real-user pilot decision only after all independent readiness gates pass.

## Why the first executor is reversible

WP-070B can represent future action classes such as account suspension or termination, but representation is not execution authority. The first executor therefore deliberately supports only:

- time-bounded discovery restriction;
- time-bounded contact restriction.

This proves the effect architecture, audit chain, concurrency behaviour and automatic expiry without introducing irreversible account action.

## Default-off staging rule

The repository may define bounded synthetic policy templates, but they remain inactive. Protected staging must verify:

- exactly the expected reversible policy templates;
- scope `synthetic_only`;
- zero active enforcement policies;
- no real-user scope;
- no service-callable policy activation function.

CI may temporarily activate the synthetic policy only inside rolled-back database test transactions.

## Product-state boundary

The restriction ledger is an authorization overlay. WP-070C must not create its effect by rewriting:

- profile publication status;
- participant block rows;
- match state;
- conversation state;
- Supabase Auth/account state.

An executed moderation case can become historically `actioned`, while the current effect remains determined solely by restriction timestamps. Expiry therefore restores the ordinary authorization paths automatically without falsifying the moderation history.

## Pilot boundary

WP-070C does not authorize real-user moderation. Before real-user execution can be considered, the project still requires at minimum:

- an approved operational policy and authorized operator identity model;
- participant notice and meaningful correction/appeal path appropriate to the action;
- early release/override procedure;
- specialist critical-safety workflow;
- incident response and legal/privacy review;
- separate assurance that any real-user policy activation cannot bypass four-eyes authorization;
- WP-075 hosted authentication activation and all other WP-080 gates.

Real-user admission remains unauthorized.
