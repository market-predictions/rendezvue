# Dutch institution registry plan

## Purpose

Create an authoritative, maintainable eligibility registry for adult students in Dutch:

- MBO;
- HBO;
- WO.

The registry determines whether an institution is recognised and which student email domains may be used as a probability signal. It does not prove legal identity or current enrolment by itself.

## Source hierarchy

### Institution identity

The production source of truth shall be Dutch DUO/RIO institution data.

Required fields:

- stable internal institution ID;
- DUO/RIO identifiers where available;
- official institution name;
- sector: MBO, HBO or WO;
- active/inactive status;
- locations/campuses;
- source URL/dataset;
- source publication date;
- ingestion date;
- last review date.

### Student mailbox domains

Email domains require separate evidence. A public website domain is not sufficient.

Accepted evidence may include:

- official student-ICT or account documentation;
- official institution support pages;
- direct confirmation from the institution;
- successful controlled verification during onboarding review;
- repeated verified student evidence with administrator approval.

Every domain record shall include:

- exact domain or approved subdomain rule;
- institution ID;
- evidence source;
- evidence date;
- confidence/status;
- student-only, mixed-affiliation or unknown classification;
- expiry/review date;
- notes and exceptions.

## Data statuses

- `candidate`: found but not approved;
- `verified`: evidence supports student mailbox use;
- `mixed`: also issued to staff, alumni or applicants;
- `manual-review`: usable only with additional evidence;
- `deprecated`: no longer accepted;
- `pilot-fixture`: synthetic prototype data only.

## Eligibility flow

1. user chooses MBO, HBO or WO;
2. user selects institution;
3. application checks the submitted domain against approved records;
4. application sends a possession code/link;
5. successful possession creates a dated verification record;
6. mixed or unknown domains route to review;
7. users without institutional email may use a minimized current-enrolment document fallback;
8. student status expires and requires reverification.

## MBO-specific requirements

- keep the 18+ gate independent from enrolment;
- expect more underage applicants than HBO/WO;
- account for regional colleges, multiple campuses and possible shared ICT domains;
- do not assume all MBO students receive individual institutional email;
- provide a realistic document fallback.

## Update process

- ingest institution data on a scheduled cadence;
- compare additions, closures, mergers and renamed institutions;
- never auto-approve newly discovered email domains;
- retain review history and evidence;
- support emergency domain disablement;
- expose unknown-domain submissions to administrators;
- test fixtures must remain separate from production records.

## Prototype fixture warning

The current browser prototype includes 39 illustrative records and plausible domains. These records are designed to test the interface only and must not be used to admit real users.

## Acceptance criteria for WP-020

- every active MBO, HBO and WO institution is represented from an authoritative source;
- institution records have dated provenance;
- accepted student domains have independent evidence;
- aliases, mergers and campus structures are supported;
- unknown and mixed domains have a documented workflow;
- annual reverification rules are implemented;
- automated tests distinguish fixture, candidate and verified records;
- administrators can disable a domain without redeploying code.
