# ADR-0005 — Netherlands Muslim-student pivot

**Status:** accepted for prototype implementation  
**Date:** 2026-07-28

## Context

The original pilot targeted Moroccan higher-education students. Institution verification was complex, the founder had limited direct community distribution access, and the product lacked a credible initial go-to-market channel.

The Netherlands offers stronger founder familiarity, easier product-language ownership and a more reachable target community. Limiting eligibility to universities would unnecessarily exclude students at universities of applied sciences and vocational education.

The product also needs more meaningful compatibility than generic dating-app fields. Muslim identity and practice vary from actively practising to culturally connected, so a binary religious field is inadequate.

## Decision

1. The first market is the Netherlands.
2. Eligible education categories are MBO, HBO and WO.
3. Eligibility remains strictly 18+, independent from enrolment.
4. Dutch is the default language and English is available at the top of the interface.
5. The primary audience is Muslim students and students from a Muslim background.
6. Faith is modeled through separate self-selected fields for background, daily practice, compatibility importance and optional lifestyle tags.
7. The product shall not calculate piety scores or infer religion.
8. Faith-practice visibility is private by default.
9. The local avatar renderer shall move from coarse pixelization toward a softer illustrated treatment while remaining explicitly non-production.
10. Belgium is deferred until the Dutch proposition and distribution model are validated.

## Consequences

Positive:

- clearer product positioning;
- stronger founder/community fit;
- larger addressable student population through MBO/HBO/WO inclusion;
- Dutch copy can be developed natively;
- faith compatibility becomes explicit and user controlled;
- a credible staged path to Belgium remains available.

Costs and risks:

- MBO increases underage-screening requirements;
- religious-belief data triggers heightened legal and privacy obligations;
- Dutch institution and student-domain coverage still requires authoritative research;
- focused faith positioning can create harassment, exclusion and moderation risks;
- the product must avoid moralizing, sectarian ranking and coercive disclosure;
- Dutch/English localization doubles critical copy review.

## Alternatives considered

### Continue Morocco first

Rejected for the first pilot because institution verification and community distribution would remain high-friction and founder-market familiarity is weaker.

### Netherlands universities only

Rejected because it excludes HBO and MBO students without a product or safety justification.

### Religion as a single slider

Rejected because it reduces a multidimensional personal identity to a score and encourages judgement.

### No faith fields

Rejected because faith and lifestyle compatibility are central to the chosen audience, but the fields remain subject to legal and user validation.

## Review trigger

Revisit this decision if user research shows that:

- the audience rejects faith-specific positioning;
- the fields create unacceptable disclosure pressure;
- age assurance makes MBO inclusion unworkable;
- sufficient local density cannot be achieved;
- legal review finds the faith-data model disproportionate;
- Belgium or a broader audience offers materially stronger evidence.
