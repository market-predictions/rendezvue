# WP-070D — Participant notice and independent appeal foundation

Status: `IMPLEMENTATION_IN_PROGRESS`  
Priority: P1 pilot-readiness dependency under WP-070  
Issue: #147  
Implementation role: `implementation_operations`  
Independent assurance: `governance_release_assurance`  
Real-user admission: unauthorized

## Objective

Add a privacy-preserving participant notice and independent appeal/correction foundation for an actually executed WP-070C reversible restriction. The package creates due-process evidence and participant-safe visibility; it does not activate enforcement policies and has no restriction-lift authority.

## Governing boundary

WP-070D may explain and review an existing reversible restriction. It may not create, lift, shorten, extend, replace or escalate punishment through direct product/Auth mutation. `recommend_early_release` is evidence for a later separately governed mechanism, not an execution command.

Protected staging must retain all WP-070C defaults:

- zero active enforcement policies;
- policy scope `synthetic_only`;
- no irreversible executor action;
- no real-user moderation operations;
- real-user admission unauthorized.

## Participant notice projection

A notice exists only because a `moderation_restrictions` row exists. It exposes only:

- restriction identifier;
- reversible action class;
- customer-facing notice key;
- customer-safe high-level reason key;
- start and expiry;
- whether the restriction is currently active;
- whether an appeal can be submitted;
- bounded appeal status/outcome key.

The participant projection must never expose reporter identity, report description/free text, internal severity/priority, moderation case/proposal identifiers, proposer/reviewer/executor references, service review codes, queue metadata or the participant's private appeal statement.

## Appeal submission

Only the affected authenticated participant may submit an appeal for the restriction. Input is limited to one structured reason code plus an optional statement of at most 2,000 characters. The operation is idempotent per restriction and cannot mutate the restriction or moderation case.

Allowed participant reason codes:

- `mistaken_identity`
- `context_missing`
- `incorrect_facts`
- `restriction_impact`
- `other`

## Independent review

The private service queue contains the minimum review context: appeal/restriction/subject identifiers, reversible action class, structured appeal reason, participant statement and restriction timing.

A terminal reviewer must be different from:

- the original WP-070B proposer;
- the original WP-070B independent reviewer;
- the WP-070C executor.

Allowed review outcomes:

- `upheld`
- `correction_recorded`
- `recommend_early_release`
- `specialist_escalation`

Exactly one terminal review may win. None of these outcomes changes restriction timing/state, the historical moderation case outcome, participant profile/publication, blocks, matches, conversations, messages or Auth state in WP-070D.

## Privacy and audit

Participant-facing projections omit internal identities and hidden evidence. Service audit may retain opaque internal actor references and bounded reason/decision codes for accountability, but must omit reporter identity, report free text and participant appeal free text.

## Evidence plan

Before merge the exact candidate must pass:

- clean migration application and empty-database replay;
- pgTAP database contracts;
- participant projection privacy checks;
- appeal ownership/idempotency checks;
- reviewer independence checks;
- genuine parallel two-reviewer race;
- no-effect assertions for restriction timing/case/Auth/product state;
- static capability-boundary validation;
- full repository validation and existing regression verifiers;
- independent `governance_release_assurance` on the exact head.

After merge, a protected verifier causally triggered by successful backend configuration must confirm the exact remote migration/schema/RPC/RLS/privilege contract, zero active enforcement policies, synthetic-only policy scope, exact canonical deployment and `realUserAdmissionAuthorized=false`.

## Definition of done

WP-070D is `OUTCOME_CONFIRMED` only after exact-candidate assurance PASS, merge, protected backend migration PASS and exact-SHA remote verification PASS. Repository code or local tests alone are not completion.
