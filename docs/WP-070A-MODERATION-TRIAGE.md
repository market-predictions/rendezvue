# WP-070A — Moderation intake and triage foundation

**Status:** implementation in progress  
**Priority:** P1 pilot-readiness dependency  
**Issue:** #134  
**Parent:** WP-070 Trust & Safety Operations  
**Real-user admission:** unauthorized

## Objective

Turn the existing server-authoritative `safety_reports` and `moderation_cases` foundation into a controlled, service-only moderation intake and triage queue without building an operator UI or executing enforcement.

This package is deliberately narrower than a complete moderation system. Its purpose is to make report intake operationally tractable and auditable before later packages add enforcement, appeals, staffing and incident procedures.

## Existing foundation reused

Rendezvue already has:

- participant-created safety reports through `create_safety_report`;
- server-assigned severity;
- critical categories for suspected minors, threats, stalking and sexual coercion;
- high categories for scams/money, hidden relationships and impersonation;
- automatic `moderation_cases` creation for high/critical reports;
- participant RLS that keeps moderation cases private;
- service/internal audit infrastructure.

WP-070A does not replace those contracts.

## New operational contract

### Queue

`list_moderation_queue(limit)` gives the service role a bounded unresolved queue across **all** severities. Low/medium reports are visible before a case is created; high/critical reports reuse their already-created case.

The projection intentionally omits reporter identity. It exposes the report/case identifiers, subject, category, server-assigned severity, statuses, priority, current opaque operator assignment, case version, internal triage target, overdue state and a maximum 500-character description preview.

Ordering is deterministic:

1. critical / priority 1;
2. high / priority 2;
3. medium / priority 3;
4. low / priority 4;
5. oldest internal triage target first.

Internal triage targets are **not public SLAs** and do not imply current staffing:

- critical: 15 minutes;
- high: 2 hours;
- medium: 24 hours;
- low: 72 hours.

They are reversible operational defaults used to make an unattended queue visible and testable before real-user admission.

### Case creation and claim

`claim_moderation_report`:

- locks the source report;
- reuses an existing report-linked case when present;
- creates exactly one case on first triage of an unbound low/medium report;
- rejects a stale expected version;
- prevents another operator reference from stealing an active claim;
- accepts only bounded opaque operator references, not e-mail addresses;
- moves an open report into triage;
- records append-only case and audit events.

A unique partial index on `source_report_id` makes report-to-case binding one-to-one.

### Optimistic transitions

`transition_moderation_case` requires both expected version and expected status. WP-070A permits only non-enforcement review transitions:

```text
open → triage
triage → investigating
triage → dismissed
investigating → dismissed
dismissed → closed
```

`actioned` and `appealed` are intentionally unreachable through this package. Dismissal requires a controlled decision code. Closed cases are terminal in WP-070A.

`unclaim_moderation_case` returns a triage/investigating case to the operational queue while preserving its current review state and incrementing the case version.

## Event and privilege model

`moderation_case_events` is append-only from the perspective of the service role. Direct service-role mutation of `moderation_cases` and case events is revoked; the service role receives select access and execute access only to the controlled queue/claim/unclaim/transition functions.

Anonymous and authenticated participant roles cannot read the moderation case/event layer or execute operator functions.

Every controlled claim, unclaim and status transition also creates a service audit event. Audit payloads contain workflow state/version metadata, not reporter identity or free-text report content.

## Explicit non-goals

WP-070A does **not**:

- suspend, ban, delete or otherwise enforce against a participant;
- automatically act on reports or feedback scores;
- create an operator-facing browser console;
- claim that the opaque operator reference is production-grade staff SSO identity;
- define external child-safety reporting procedures;
- implement appeals;
- make public response-time promises;
- authorize real-user moderation operations or real-user admission.

Those belong to later WP-070 / WP-080 work after policy, legal and operational ownership are approved.

## Acceptance evidence

The candidate must prove:

1. ordinary users cannot inspect or mutate moderation operations;
2. the service queue contains unresolved reports across severities;
3. critical signals remain priority 1 and server severity cannot be downgraded by the operator workflow;
4. low/medium reports create one case only when triaged;
5. claims cannot be stolen;
6. stale versions/statuses fail closed;
7. case event history is append-only;
8. no enforcement mutation exists in this package;
9. clean migration replay and pgTAP/database contracts pass;
10. complete Rendezvue validation passes on the exact candidate;
11. independent `governance_release_assurance` issues PASS before merge.

## Dependency note — WP-075

WP-075 browser-independent OTP is independently blocked on an external Supabase mail-provider dependency. Supabase rejected hosted template customization on the current new Free/default-SMTP project. Custom SMTP or an explicitly authorized paid-plan change is required before the hosted OTP e-mail can expose `{{ .Token }}`. This does not authorize weakening WP-075 and does not block this service-only WP-070A foundation.
