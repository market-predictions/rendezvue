from pathlib import Path


def replace_once(path: str, before: str, after: str) -> None:
    file = Path(path)
    source = file.read_text(encoding='utf-8')
    count = source.count(before)
    if count != 1:
        raise RuntimeError(f'{path}: expected one marker, found {count}')
    file.write_text(source.replace(before, after, 1), encoding='utf-8')


replace_once(
    'apps/private-preview/product-shell.js',
    "} from './product-model.js';\n\nconst STYLE_ID",
    "} from './product-model.js';\nimport { contactOpenErrorMessage } from './contact-entitlement-model.js';\n\nconst STYLE_ID"
)

old_open = """async function openConversation(button) {
  if (!state.activeMatch) return;
  button.disabled = true;
  try {
    try {
      await supabase.rpc('claim_private_proof_entitlement');
    } catch {
      // A right may already exist or have been consumed; the authoritative
      // conversation-opening function decides whether the action is allowed.
    }
    unwrap(await supabase.rpc('open_match_conversation', {
      p_match_id: state.activeMatch.id,
      p_idempotency_key: `product-shell-${state.activeMatch.id}`
    }), 'conversation open');
    await loadConversation();
    renderMatch();
    setStatus(matchStatus, t('matches.open'), 'success');
  } catch (error) {
    setStatus(matchStatus, errorMessage(error), 'error');
  } finally {
    button.disabled = false;
  }
}
"""
new_open = """async function openConversation(button) {
  if (!state.activeMatch) return;
  button.disabled = true;
  try {
    unwrap(
      await supabase.rpc('claim_private_proof_entitlement'),
      'contact entitlement activation'
    );
    unwrap(await supabase.rpc('open_match_conversation', {
      p_match_id: state.activeMatch.id,
      p_idempotency_key: `product-shell-${state.activeMatch.id}`
    }), 'conversation open');
    await loadConversation();
    renderMatch();
    setStatus(matchStatus, t('matches.open'), 'success');
  } catch (error) {
    setStatus(matchStatus, contactOpenErrorMessage(error, state.language), 'error');
  } finally {
    button.disabled = false;
  }
}
"""
replace_once('apps/private-preview/product-shell.js', old_open, new_open)

replace_once(
    'supabase/tests/database/006_private_proof_interaction.test.sql',
    'select plan(33);',
    'select plan(35);'
)
replace_once(
    'supabase/tests/database/006_private_proof_interaction.test.sql',
    "  ('00000000-0000-0000-0000-00000000a101', 'single', true, true, true, 'synthetic-proof-2026-07', now()),\n  ('00000000-0000-0000-0000-00000000b202', 'single', true, true, true, 'synthetic-proof-2026-07', now()),",
    "  ('00000000-0000-0000-0000-00000000a101', 'single', true, true, true, 'synthetic-product-2026-08', now()),\n  ('00000000-0000-0000-0000-00000000b202', 'single', true, true, true, 'synthetic-proof-2026-07', now()),"
)
legacy_block = """select is((select count(*) from public.contact_entitlements), 1::bigint, 'repeated claim does not create another entitlement');
reset role;

set local \"request.jwt.claims\" = '{\"sub\":\"00000000-0000-0000-0000-00000000c303\",\"role\":\"authenticated\"}';
"""
legacy_replacement = """select is((select count(*) from public.contact_entitlements), 1::bigint, 'repeated claim does not create another entitlement');
reset role;

set local \"request.jwt.claims\" = '{\"sub\":\"00000000-0000-0000-0000-00000000b202\",\"role\":\"authenticated\"}';
set local role authenticated;
select ok(public.claim_private_proof_entitlement() is not null, 'legacy proof terms can still claim entitlement');
select is((select status::text from public.contact_entitlements limit 1), 'available', 'legacy entitlement is available to its owner');
reset role;

set local \"request.jwt.claims\" = '{\"sub\":\"00000000-0000-0000-0000-00000000c303\",\"role\":\"authenticated\"}';
"""
replace_once('supabase/tests/database/006_private_proof_interaction.test.sql', legacy_block, legacy_replacement)

changelog = """### Synthetic contact-entitlement activation

- Added WP-072 after canonical owner testing exposed `conversation open: no contact entitlement available` for a valid active synthetic match.
- Aligned the private proof entitlement allowlist with the current `synthetic-product-2026-08` onboarding contract while retaining `synthetic-proof-2026-07` compatibility.
- Kept ordinary and unknown terms fail-closed and preserved the immutable one-time entitlement audit invariant.
- Made the product shell unwrap entitlement activation before opening a conversation instead of silently ignoring Supabase RPC errors.
- Replaced raw database errors with bilingual participant-facing contact messages.
- Added application, pgTAP, generated-artifact and commit-matched canonical regression controls.
- Real-user admission remains unauthorized.

"""
replace_once('CHANGELOG.md', '## [Unreleased]\n\n', '## [Unreleased]\n\n' + changelog)

replace_once('docs/ROADMAP.md', '**Version:** 2.13', '**Version:** 2.14')
roadmap = """### 2P. Synthetic contact-entitlement activation

**Status:** WP-072 implementation in review; canonical owner verification pending.

The current product onboarding terms and the private synthetic entitlement helper are now aligned. Entitlement activation is validated before conversation opening, older controlled proof fixtures remain supported, unknown terms remain rejected, and raw backend errors are translated into bilingual product copy. Database and browser regressions guard the one-time entitlement and canonical delivery boundaries. Detailed evidence: `docs/WP-072-CONTACT-ENTITLEMENT-ACTIVATION.md`.

"""
replace_once('docs/ROADMAP.md', '## Phase 3 — Closed city-based PWA pilot', roadmap + '## Phase 3 — Closed city-based PWA pilot')

workpackage = """## WP-072 — Synthetic contact-entitlement activation

**Status:** implementation in review; canonical owner verification pending; issue #100  
The active synthetic match flow now aligns current product terms with the one-time private proof entitlement, validates the claim RPC before opening a conversation, retains legacy proof compatibility, rejects unknown terms and replaces raw database errors with bilingual participant-facing copy. Application, pgTAP, artifact and canonical verifiers cover the repair. Detailed evidence: `docs/WP-072-CONTACT-ENTITLEMENT-ACTIVATION.md`.

"""
replace_once('docs/WORKPACKAGES.md', '## WP-080 — Closed city pilot readiness', workpackage + '## WP-080 — Closed city pilot readiness')

wc71 = '| WC-071 | The profile form presents section headings, supporting labels and entered values with a stable, accessible visual hierarchy on desktop and mobile. | Implemented in source and regression-tested | issue #98, `apps/web/tests/profile-form-ux.test.mjs`, WP-071 source/artifact/canonical verifier | Canonical delivery and owner visual acceptance remain pending; this is not a full independent accessibility audit. |'
wc72 = '| WC-072 | A published current synthetic product profile can activate exactly one controlled contact entitlement and open an active matched conversation without exposing backend errors. | Implemented in source, migration and regression tests | issue #100, WP-072 migration, `contact-entitlement-flow.test.mjs`, private-proof pgTAP and canonical verifier | Canonical owner confirmation with the existing Proof Noor match remains pending; no production payment entitlement or real-user authorization is claimed. |'
replace_once('docs/WORK-CLAIMS.md', wc71, wc71 + '\n' + wc72)

replace_once(
    'docs/HANDOVER.md',
    '**Milestone:** WP-071 profile-form hierarchy implemented; canonical owner verification pending',
    '**Milestone:** WP-072 contact-entitlement activation repaired; canonical owner verification pending'
)
replace_once(
    'docs/HANDOVER.md',
    '- Profile-form visual hierarchy: issue #98 / WP-071 / `docs/WP-071-PROFILE-FORM-UX.md`.\n',
    '- Profile-form visual hierarchy: issue #98 / WP-071 / `docs/WP-071-PROFILE-FORM-UX.md`.\n- Synthetic contact-entitlement activation: issue #100 / WP-072 / `docs/WP-072-CONTACT-ENTITLEMENT-ACTIVATION.md`.\n'
)
handover = """## Current WP-072 contact-entitlement repair

Canonical owner testing exposed `conversation open: no contact entitlement available` despite an active match. The current product stored `synthetic-product-2026-08`, while the private entitlement helper accepted only `synthetic-proof-2026-07`; the browser also ignored the first RPC error because it did not unwrap the Supabase response. WP-072 allowlists both controlled synthetic versions, keeps unknown terms fail-closed, validates entitlement activation before conversation opening and maps failures to bilingual product copy. Issue #100 remains open until the existing Proof Noor conversation opens successfully after canonical deployment and hard refresh. Real-user admission remains unauthorized.

"""
replace_once('docs/HANDOVER.md', '## Current WP-071 profile-form UX correction', handover + '## Current WP-071 profile-form UX correction')
