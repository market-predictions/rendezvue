from pathlib import Path

controller_path = Path('apps/private-preview/profile-media-controller.js')
controller = controller_path.read_text(encoding='utf-8')
controller = controller.replace("section.dataset.wp075Boundary = BOUNDARY", "section.dataset.wp076Boundary = BOUNDARY")
old = '''      <section class="rv-profile-media-step"><h3 data-media-copy="optionalTitle"></h3><p data-media-copy="optionalBody"></p><div class="rv-profile-media-actions">
        <button type="button" class="secondary" data-camera-slot="profile_photo_1" data-media-copy="takePhoto"></button><button type="button" class="secondary" data-gallery-button="profile_photo_1" data-media-copy="choosePhoto"></button>
        <button type="button" class="secondary" data-camera-slot="profile_photo_2" data-media-copy="takePhoto"></button><button type="button" class="secondary" data-gallery-button="profile_photo_2" data-media-copy="choosePhoto"></button>
      </div></section>'''
new = '''      <section class="rv-profile-media-step"><h3 data-media-copy="optionalTitle"></h3><p data-media-copy="optionalBody"></p><div class="rv-profile-media-add-list">
        <div class="rv-profile-media-add-row"><div><strong data-slot-label="profile_photo_1"></strong><small data-media-copy="optionalSlotOne"></small></div><div class="rv-profile-media-actions"><button type="button" class="secondary" data-camera-slot="profile_photo_1" data-media-copy="takePhoto"></button><button type="button" class="secondary" data-gallery-button="profile_photo_1" data-media-copy="choosePhoto"></button></div></div>
        <div class="rv-profile-media-add-row"><div><strong data-slot-label="profile_photo_2"></strong><small data-media-copy="optionalSlotTwo"></small></div><div class="rv-profile-media-actions"><button type="button" class="secondary" data-camera-slot="profile_photo_2" data-media-copy="takePhoto"></button><button type="button" class="secondary" data-gallery-button="profile_photo_2" data-media-copy="choosePhoto"></button></div></div>
      </div></section>'''
if old not in controller:
    raise SystemExit('optional media markup anchor not found')
controller = controller.replace(old, new, 1)
controller = controller.replace(
    "    optionalBody: 'Deze foto’s zijn voor uitstraling en persoonlijkheid. Je kunt ze direct maken of uit je fotobibliotheek kiezen.',\n",
    "    optionalBody: 'Deze foto’s zijn voor uitstraling en persoonlijkheid. Je kunt ze direct maken of uit je fotobibliotheek kiezen.',\n    optionalSlotOne: 'Een tweede beeld van jou, bijvoorbeeld andere kleding of setting.',\n    optionalSlotTwo: 'Nog een aanvullend beeld als dat echt iets toevoegt aan je profiel.',\n",
    1
)
controller = controller.replace(
    "    optionalBody: 'These photos are for personality and presentation. Take them now or choose them from your photo library.',\n",
    "    optionalBody: 'These photos are for personality and presentation. Take them now or choose them from your photo library.',\n    optionalSlotOne: 'A second view of you, for example different clothing or setting.',\n    optionalSlotTwo: 'One more image only if it genuinely adds something to your profile.',\n",
    1
)
anchor = "  root.querySelectorAll('[data-media-copy]').forEach((node) => { node.textContent = text(node.dataset.mediaCopy); });\n"
replacement = anchor + "  root.querySelectorAll('[data-slot-label]').forEach((node) => { node.textContent = profileMediaLabel(language, node.dataset.slotLabel); });\n"
if anchor not in controller:
    raise SystemExit('copy anchor not found')
controller = controller.replace(anchor, replacement, 1)
controller_path.write_text(controller, encoding='utf-8')

gallery_path = Path('apps/private-preview/profile-media-gallery.js')
gallery = gallery_path.read_text(encoding='utf-8').replace('dialog.dataset.wp075Boundary = BOUNDARY', 'dialog.dataset.wp076Boundary = BOUNDARY')
gallery_path.write_text(gallery, encoding='utf-8')

camera_path = Path('apps/private-preview/src/camera.js')
camera = camera_path.read_text(encoding='utf-8').replace('// WP-075 staging camera adapter.', '// WP-076 staging camera adapter.')
camera_path.write_text(camera, encoding='utf-8')

css_path = Path('apps/private-preview/profile-media.css')
css = css_path.read_text(encoding='utf-8')
needle = '.rv-profile-media-actions{display:flex;flex-wrap:wrap;gap:.55rem}'
addition = '.rv-profile-media-add-list{display:grid;gap:.7rem}.rv-profile-media-add-row{display:grid;gap:.5rem;padding:.7rem;border:1px solid #e6ddd5;border-radius:.85rem;background:#fcfaf7}.rv-profile-media-add-row strong{display:block;color:#2a221e;font-size:.8rem}.rv-profile-media-add-row small{display:block;margin-top:.12rem;color:#81736a;font-size:.68rem;line-height:1.4}' + needle
if needle not in css:
    raise SystemExit('CSS action anchor not found')
css = css.replace(needle, addition, 1)
css_path.write_text(css, encoding='utf-8')

test_path = Path('apps/web/tests/profile-media-architecture.test.mjs')
test = test_path.read_text(encoding='utf-8')
needle = "  assert.match(controller, /data-gallery-button=\"profile_photo_2\"/);\n"
replacement = needle + "  assert.match(controller, /data-slot-label=\"profile_photo_1\"/);\n  assert.match(controller, /data-slot-label=\"profile_photo_2\"/);\n"
if needle not in test:
    raise SystemExit('UX test anchor not found')
test = test.replace(needle, replacement, 1)
test_path.write_text(test, encoding='utf-8')

print('WP-076 UX refinement applied.')
