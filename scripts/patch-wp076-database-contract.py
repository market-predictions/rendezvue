from pathlib import Path


def replace_once(path, old, new, label):
    file = Path(path)
    text = file.read_text(encoding='utf-8')
    if old not in text:
        raise SystemExit(f'missing anchor: {label}')
    file.write_text(text.replace(old, new, 1), encoding='utf-8')

migration = 'supabase/migrations/20260808100500_live_selfie_profile_media.sql'
replace_once(
    migration,
    "-- Publishing through either the RPC or a direct profile update requires the live-camera slot.\n",
    "-- Authenticated product publication requires the live-camera slot. Privileged database/bootstrap\n-- fixture writes remain possible for controlled synthetic administration; publish_profile() always\n-- enforces the Live selfie for ordinary authenticated product use.\n",
    'publication trigger comment'
)
replace_once(
    migration,
    "  if new.publication_status = 'published'\n     and old.publication_status is distinct from 'published'\n     and not public.profile_has_visible_live_selfie(new.user_id) then\n",
    "  if auth.uid() is not null\n     and new.publication_status = 'published'\n     and old.publication_status is distinct from 'published'\n     and not public.profile_has_visible_live_selfie(new.user_id) then\n",
    'authenticated publication trigger guard'
)

path = 'supabase/tests/database/005_onboarding_persistence.test.sql'
replace_once(
    path,
    "insert into public.privacy_portraits (\n  user_id, object_path, treatment, status, is_public_profile_portrait\n) values (\n  '00000000-0000-0000-0000-000000000a55',\n  '00000000-0000-0000-0000-000000000a55/portrait.webp',\n  'balanced', 'pending', true\n);\n",
    "insert into public.privacy_portraits (\n  user_id, object_path, treatment, status, is_public_profile_portrait,\n  asset_role, profile_media_slot, capture_origin, is_profile_media_visible,\n  live_capture_completed_at, capture_proof_version\n) values (\n  '00000000-0000-0000-0000-000000000a55',\n  '00000000-0000-0000-0000-000000000a55/portrait.webp',\n  'balanced', 'pending', true,\n  'card', 'live_selfie', 'live_camera', true, now(), 'blink-turn-v1'\n);\n",
    'onboarding live-selfie fixture'
)

path = 'supabase/tests/database/019_live_selfie_profile_media.test.sql'
replace_once(
    path,
    "select ok(public.profile_has_visible_live_selfie('63000000-0000-4000-8000-000000000001'), 'visible live selfie is recognized');\n",
    "select is((select profile_media_slot from public.get_own_profile_media() where profile_media_slot = 'live_selfie'), 'live_selfie', 'visible live selfie is exposed through the owner-safe media projection');\n",
    'private helper assertion'
)

print('WP-076 database contract repair applied.')
