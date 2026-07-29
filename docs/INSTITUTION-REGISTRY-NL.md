# Dutch institution registry and student-benefit plan

## Purpose

Create an authoritative, maintainable verification registry for users who voluntarily claim current student status in Dutch MBO, HBO or WO.

The registry no longer determines general Rendezvue membership. It supports:

- verified-student badges;
- student contact-price benefits;
- Campus Mode for verified students;
- verified student events;
- expiry and graduation transition.

It does not prove legal identity, age, single status or serious intent.

## Source hierarchy

### Institution identity

The production source of truth shall be Dutch DUO/RIO institution data. Records include stable ID, official name, sector, status, campuses, provenance, source date and review date.

### Student mailbox domains

Student mailbox domains require separate evidence; a public website domain is insufficient. Evidence may include official student ICT documentation, support pages, direct institution confirmation or controlled verified onboarding evidence with administrative approval.

Every domain record includes institution, exact rule, source, date, confidence, student-only/mixed classification, expiry and exceptions.

## Statuses

- `candidate`;
- `verified`;
- `mixed`;
- `manual-review`;
- `deprecated`;
- `pilot-fixture`.

## Verification flow

1. user identifies as a student;
2. chooses MBO/HBO/WO and institution;
3. submits student mailbox;
4. system checks an approved domain rule;
5. system verifies mailbox possession;
6. success creates a dated expiring verification record;
7. mixed/unknown domains route to review;
8. a minimized current-enrolment fallback may be offered;
9. expiry removes benefits, not the user account;
10. graduation may receive a short transparent transition period.

## Privacy and safety

- age assurance remains independent;
- exact institution visibility is optional;
- non-students do not receive unrestricted student-only targeting in the first live pilot;
- a verified student may hide their own institution;
- evidence is minimized and deleted after the review/appeal period;
- administrators can disable a compromised domain without redeployment.

## Prototype warning

The browser pilot contains 39 illustrative records and plausible domains. They are synthetic fixtures and must not admit real users or activate financial benefits.

## Acceptance criteria for WP-020

- active MBO/HBO/WO institutions have authoritative provenance;
- student domains have independent dated evidence;
- aliases, mergers, campuses and mixed domains are supported;
- verification expires and benefits are reversible;
- account continuity survives graduation or verification expiry;
- tests distinguish fixtures, candidates and verified records;
- unknown-domain and document-fallback review is operational;
- Campus Mode and pricing entitlements use verification records, not editable profile claims.
