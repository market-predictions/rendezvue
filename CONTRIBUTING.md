# Contributing

## Working model

1. Start from an up-to-date `main` branch.
2. Create a focused branch using `feature/`, `fix/`, `docs/` or `chore/`.
3. Update the relevant work package and changelog.
4. State implementation claims in `docs/WORK-CLAIMS.md` when a milestone changes.
5. Run `npm run check` and a Docker build.
6. Open a pull request with explicit scope, evidence, risks and handover notes.

## Definition of done

A change is done only when:

- behavior and acceptance criteria are implemented;
- tests or validation evidence exist;
- documentation is synchronized;
- privacy and safety effects are considered;
- no claim overstates what the prototype actually verifies;
- the handover identifies remaining risks and next actions.

## Product-language rule

Use precise verification language. The prototype may state that an email or live capture was verified, but it must not claim legal identity or conclusive student status without supporting evidence.
