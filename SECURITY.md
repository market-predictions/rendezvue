# Security policy

## Pilot status

Rendezvue is currently a prototype. It must not be used with real users or real personal data until the P0 privacy, security, age-assurance and moderation gates in `docs/REQUIREMENTS.md` are satisfied.

## Reporting a vulnerability

Do not disclose vulnerabilities in a public issue. Contact the repository owner privately through GitHub until a dedicated security mailbox is configured.

Include:

- affected component;
- reproduction steps;
- expected and actual behavior;
- potential impact;
- suggested mitigation, if known.

## Prohibited repository content

Never commit:

- production secrets or tokens;
- real identity or student-verification documents;
- real selfie images or videos;
- biometric templates;
- real user messages;
- unredacted moderation evidence;
- database exports containing personal data.

## Production security gates

Before a live pilot, the application requires at minimum:

- independent threat modeling;
- privacy and data-protection assessment;
- server-side authentication and authorization;
- encrypted persistent storage;
- rate limits and abuse controls;
- tested deletion and retention jobs;
- secure moderation tooling;
- dependency and container scanning;
- penetration testing;
- incident-response and child-safety procedures.
