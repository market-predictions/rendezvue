# Synthetic discovery seed

**Status:** implementation complete; automated private proof seeding runs only after the protected private Supabase deployment succeeds.

## Purpose

The seed provides ten clearly marked synthetic adult profiles for discovery testing. Profile content, image files and application interface assets are separate concerns. The package contains no screenshots, logos, interface chrome or real personal data.

## Canonical package

```text
synthetic-seed/
├── portraits/
│   ├── yasmin.webp
│   ├── bilal.webp
│   ├── amina.webp
│   ├── idris.webp
│   ├── maryam.webp
│   ├── samir.webp
│   ├── noura.webp
│   ├── youssef.webp
│   ├── hafsa.webp
│   └── omar.webp
├── profiles.json
├── profiles.csv
├── seed.sql
├── seed-remote.mjs
└── README.md
```

`profiles.json` is the canonical content source. `profiles.csv` is a review/export representation. `seed.sql` is for a disposable local Supabase stack. `seed-remote.mjs` uses protected server credentials to create managed Auth users, relational rows and private Storage objects.

## Database integration

The seed uses the existing account-linked model:

- `profiles`;
- `eligibility`;
- `life_stages`;
- `family_contexts`;
- `faith_profiles`;
- `profile_interests`;
- `profile_prompts`;
- `privacy_portraits`;
- `onboarding_progress`.

The support migration adds `profiles.synthetic_id` and `profiles.is_synthetic`. The discovery projection carries both fields. A selected portrait of a discoverable synthetic profile may be read before a match through a dedicated, synthetic-only Storage policy. Real-user portrait policy remains unchanged and match-gated.

## Automated private proof route

After **Deploy private Supabase preview** succeeds on `main`, **Seed synthetic Rendezvue profiles**:

1. validates all ten records and WebP files;
2. confirms migrations are applied;
3. retrieves a server-only API key through the protected Supabase Management API token;
4. generates a run-scoped password that is never printed;
5. creates or updates ten confirmed `.test` Auth users;
6. upserts all relational profile domains;
7. uploads ten WebP files to the private `privacy-portraits` bucket;
8. selects and verifies each portrait record;
9. publishes all ten profiles;
10. verifies exact published-profile and selected-portrait counts.

The operation is idempotent by `synthetic_id` and account email. It refuses to overwrite an existing account that is not already marked synthetic.

## Boundary

The seed does not authorize real-user admission, production dating use, real religious-profile data or identifiable child information. The ten `.test` addresses are not mailboxes and do not replace controlled magic-link delivery tests.
