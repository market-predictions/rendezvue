# ADR-0008 — Use Supabase as a reversible backend proof platform

**Status:** accepted for proof only  
**Date:** 2026-07-30

## Context

The public Hugging Face Static Space can demonstrate the complete interaction concept but cannot safely own persistent accounts, likes, matches, conversations, private media, moderation or payments. The next milestone requires a real relational authorization proof while retaining GitHub as the source of truth and keeping the public pilot synthetic.

The domain is strongly relational and requires:

- authentication-linked account identity;
- row-level authorization;
- private object storage;
- reciprocal matching under concurrency;
- contact-entitlement transactions;
- realtime text messaging;
- auditable moderation and safety records;
- reproducible migrations in GitHub.

## Decision

Use Supabase as the leading **non-production proof platform** and commit its local configuration and PostgreSQL migrations to the repository.

The decision is deliberately reversible:

- business semantics remain in PostgreSQL tables and functions;
- the browser uses a small backend contract rather than embedding provider logic throughout the UI;
- the public build stays in `local-demo` mode;
- no remote project, region or production contract is approved by this ADR;
- no service-role secret is exposed to the browser;
- real-user admission remains prohibited.

## Consequences

### Positive

- local Auth, PostgreSQL, Storage and Realtime can be tested together;
- RLS policies become versioned security controls;
- transactional match/contact logic can be enforced in the database;
- GitHub CI can validate migration and contract regressions;
- a controlled private preview can later reuse the existing PWA.

### Negative and risks

- the team must test provider-specific local configuration and migration behaviour;
- RLS errors can silently become data leaks if tests are weak;
- Auth and Storage schemas create some migration coupling;
- provider region, DPA, cost, backup and incident controls remain unresolved;
- a successful proof could create premature pressure to admit users before moderation/legal readiness.

## Guardrails

- sensitive domains are fail-closed by default;
- full faith and family records are not exposed through discovery in the first migration;
- all security-sensitive mutations are server-authoritative;
- moderation and audit tables are inaccessible to ordinary authenticated users;
- two-account RLS tests are mandatory before private integration;
- provider approval and real-user authorization require a separate ADR/gate.

## Alternatives considered

### Custom Node API plus managed PostgreSQL

Offers maximum control but adds authentication, storage, realtime and deployment work before the domain model is proven.

### Firebase

Provides mature authentication and realtime capabilities, but the current matching, entitlement, moderation and audit model maps more naturally to relational transactions and SQL authorization.

### Hugging Face persistent backend

Rejected. Hugging Face remains the generated frontend target and must not become the source of persistent or sensitive user state.

## Follow-up

1. apply migrations from an empty local stack;
2. add RLS and transaction tests;
3. review EU region, DPA and privacy implications;
4. provision a private non-production project only after approval;
5. revisit provider commitment after the controlled multi-user proof.
