# Rendezvue synthetic profile seed

This package contains ten **fully synthetic**, adult profile records and ten separate illustrated WebP portraits. The portraits contain no name, age, logo, interface, button, icon or profile text.

## Package contents

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

## Separation rule

The WebP files are standalone portraits. `profiles.json` is the canonical content source. `profiles.csv` is a review/export view. `seed.sql` is a deterministic local SQL seed. `seed-remote.mjs` creates or updates managed Supabase Auth users, relational records and private Storage objects through provider APIs.

The twenty earlier application mock-ups are not inputs to this package and should remain in a separate design-concepts area.

## Local disposable Supabase seed

Apply all migrations first, then run the SQL file with a local database connection. The SQL creates ten deterministic Auth rows and relational profile rows. Its fixed password is intentionally local-only:

```text
Rendezvue-Synthetic-Only-2026!
```

The SQL registers portrait metadata but cannot write Storage object bytes. Upload the ten WebP files through the Storage API or use the remote seed script against an isolated proof project.

## Managed private proof seed

Use only a private, non-production Supabase project. The script requires a server credential and never embeds it in browser code:

```bash
SUPABASE_URL=https://<project-ref>.supabase.co \
SUPABASE_SECRET_KEY=<sb_secret_or_service_role_key> \
RENDEZVUE_SYNTHETIC_PASSWORD='<strong-test-only-password>' \
node synthetic-seed/seed-remote.mjs
```

The script is idempotent by `synthetic_id` and account email. It:

1. creates missing confirmed Auth users or updates existing synthetic users;
2. uploads each WebP to the private `privacy-portraits` bucket under `<user-id>/synthetic/<name>.webp`;
3. fills `profiles`, `eligibility`, `life_stages`, `family_contexts`, `faith_profiles`, `profile_interests`, `profile_prompts`, `privacy_portraits` and `onboarding_progress`;
4. marks every profile with `is_synthetic=true` and a unique `synthetic_id`;
5. publishes only after all required records exist;
6. writes a non-secret audit event.

The `.test` email addresses do not receive mail. They are suitable for password-based or administrator-driven proof flows, not magic-link delivery tests.

## Safety boundary

Do not replace these files with real portraits, real biographies, real email addresses, real religious data or identifiable child information. This seed is test data and must never be presented as real members.
