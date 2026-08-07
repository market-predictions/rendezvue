from pathlib import Path

path = Path('docs/ROADMAP.md')
text = path.read_text(encoding='utf-8')
before = '- Fuzzy browser-generated privacy portraits are the MVP baseline; AI portraits are optional.'
after = '- Participant-controlled, browser-prepared portrait presentations are the MVP baseline; the original source remains private and AI portraits are optional.'
if text.count(before) != 1:
    raise SystemExit(f'expected exactly one roadmap doctrine marker, found {text.count(before)}')
path.write_text(text.replace(before, after, 1), encoding='utf-8')
print('WP-074A roadmap doctrine corrected.')
