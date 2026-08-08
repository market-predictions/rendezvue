from pathlib import Path

path = Path('apps/private-preview/product-shell.js')
text = path.read_text(encoding='utf-8')
old = """  state.ownPortraitUrl = signed.signedUrl;
  state.completedStages.add('portrait');
  const image = document.createElement('img');
"""
new = """  state.ownPortraitUrl = signed.signedUrl;
  const liveSelfie = unwrap(await supabase
    .from('privacy_portraits')
    .select('id')
    .eq('user_id', state.user.id)
    .eq('asset_role', 'card')
    .eq('profile_media_slot', 'live_selfie')
    .eq('capture_origin', 'live_camera')
    .eq('is_profile_media_visible', true)
    .maybeSingle(), 'live selfie progress check');
  if (liveSelfie?.id) state.completedStages.add('portrait');
  else state.completedStages.delete('portrait');
  const image = document.createElement('img');
"""
if old not in text:
    raise SystemExit('loadOwnPortrait progress anchor not found')
path.write_text(text.replace(old, new, 1), encoding='utf-8')

test_path = Path('apps/web/tests/profile-media-architecture.test.mjs')
test = test_path.read_text(encoding='utf-8')
needle = "test('database contract separates visible prepared cards from raw and challenge media', async () => {\n"
section = """test('portrait progress after refresh depends on the Live-selfie slot rather than any primary photo', async () => {
  const shell = await read('apps/private-preview/product-shell.js');
  assert.match(shell, /profile_media_slot', 'live_selfie'/);
  assert.match(shell, /capture_origin', 'live_camera'/);
  assert.match(shell, /is_profile_media_visible', true/);
  assert.match(shell, /if \(liveSelfie\?\.id\) state\.completedStages\.add\('portrait'\)/);
  assert.match(shell, /else state\.completedStages\.delete\('portrait'\)/);
});

"""
if needle not in test:
    raise SystemExit('profile-media test insertion anchor not found')
test_path.write_text(test.replace(needle, section + needle, 1), encoding='utf-8')
print('WP-076 portrait-progress repair applied.')
