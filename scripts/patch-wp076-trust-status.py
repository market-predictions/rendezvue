from pathlib import Path

path = Path('apps/private-preview/profile-media-controller.js')
text = path.read_text(encoding='utf-8')
text = text.replace(
    "    noLegalIdentity: 'Live selfie aanwezig · geen wettelijke identiteitscontrole'\n",
    "    livePending: 'Live selfie vereist',\n    noLegalIdentity: 'Live selfie aanwezig · geen wettelijke identiteitscontrole'\n",
    1,
)
text = text.replace(
    "    noLegalIdentity: 'Live selfie present · not legal identity verification'\n",
    "    livePending: 'Live selfie required',\n    noLegalIdentity: 'Live selfie present · not legal identity verification'\n",
    1,
)
text = text.replace(
    '<span class="rv-live-trust-badge" data-media-copy="noLegalIdentity"></span>',
    '<span class="rv-live-trust-badge" data-live-trust-badge></span>',
    1,
)
needle = "  const hasLive = mediaRows.some((row) => row.profile_media_slot === 'live_selfie');\n  const publish = document.querySelector('#rv-publish-profile');\n"
replacement = "  const hasLive = mediaRows.some((row) => row.profile_media_slot === 'live_selfie');\n  const trustBadge = root.querySelector('[data-live-trust-badge]');\n  if (trustBadge) {\n    trustBadge.textContent = text(hasLive ? 'noLegalIdentity' : 'livePending');\n    trustBadge.classList.toggle('is-pending', !hasLive);\n  }\n  const publish = document.querySelector('#rv-publish-profile');\n"
if needle not in text:
    raise SystemExit('renderTray trust-status anchor not found')
text = text.replace(needle, replacement, 1)
path.write_text(text, encoding='utf-8')

css_path = Path('apps/private-preview/profile-media.css')
css = css_path.read_text(encoding='utf-8')
needle = '.rv-live-trust-badge{flex:0 0 auto;padding:.4rem .65rem;border-radius:999px;background:#e4f1ed;color:#175746;font-weight:800;font-size:.74rem}'
replacement = needle + '.rv-live-trust-badge.is-pending{background:#f2ece6;color:#796b61}'
if needle not in css:
    raise SystemExit('trust badge CSS anchor not found')
css = css.replace(needle, replacement, 1)
css_path.write_text(css, encoding='utf-8')

test_path = Path('apps/web/tests/profile-media-architecture.test.mjs')
test = test_path.read_text(encoding='utf-8')
needle = "  assert.match(controller, /data-slot-label=\"profile_photo_2\"/);\n"
replacement = needle + "  assert.match(controller, /data-live-trust-badge/);\n  assert.match(controller, /hasLive \? 'noLegalIdentity' : 'livePending'/);\n"
if needle not in test:
    raise SystemExit('profile-media trust test anchor not found')
test = test.replace(needle, replacement, 1)
test_path.write_text(test, encoding='utf-8')

print('WP-076 trust status refinement applied.')
