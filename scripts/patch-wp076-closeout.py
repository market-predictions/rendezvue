from pathlib import Path

MERGE_SHA = 'ddecb67dbbd3487daefac16045ff147a6649c1e2'
PR_VALIDATE = '31254828422'
PR_CI = '31254828420'
PR_WP076 = '31254828411'
PR_WP074 = '31254828400'
STAGING = '31255042784'
CANONICAL = '31255080791'


def read(path):
    return Path(path).read_text(encoding='utf-8')


def write(path, text):
    Path(path).write_text(text, encoding='utf-8')


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'missing closeout anchor: {label}')
    return text.replace(old, new, 1)

# WP record
p = 'docs/WP-076-LIVE-SELFIE-PROFILE-MEDIA.md'
t = read(p)
t = replace_once(t, '**Status:** implementation candidate', '**Status:** technically complete and canonically verified; owner mobile/visual acceptance pending', 'WP076 status')
closeout = f"""

## Release evidence

WP-076 was independently assured and deployed on 2026-08-08.

- implementation PR #123 merged as `{MERGE_SHA}`;
- exact-candidate CI `{PR_CI}`: PASS;
- full exact-candidate validation `{PR_VALIDATE}`: PASS, including empty-database replay, all pgTAP contracts, parallel races, deterministic seed, schema lint, Docker and Cloudflare boundary;
- dedicated WP-076 verifier `{PR_WP076}`: PASS;
- retained WP-074B privacy contract `{PR_WP074}`: PASS;
- protected staging run `{STAGING}`: PASS; migration applied and remote/backend/artifact boundary green;
- commit-matched canonical WP-076 run `{CANONICAL}`: PASS for both generated contract and delivered camera/profile-media boundary.

Technical outcome is confirmed. Issue #120 remains open only for owner mobile/device and visual UX acceptance. Real-user admission remains unauthorized.
"""
if '## Release evidence' not in t:
    t += closeout
write(p, t)

# Work package
p = 'docs/WORKPACKAGES.md'
t = read(p)
t = replace_once(
    t,
    '**Status:** implementation candidate; independent assurance and canonical owner review pending; issue #120  \nA publishable profile requires one camera-origin Live selfie prepared from a same-session blink/head-turn flow and may contain up to two optional camera/gallery photos. One prepared card remains the discovery primary; the full-profile viewer exposes the bounded media set and marks the Live selfie as a trust cue. Raw/challenge media remains private, the existing privacy ladder remains authoritative and no legal-identity or automated-liveness claim is made. Detailed evidence: `docs/WP-076-LIVE-SELFIE-PROFILE-MEDIA.md` and ADR-0009.',
    f'**Status:** technically complete and canonically verified; owner mobile/visual acceptance pending; issue #120  \nA publishable profile requires one camera-origin Live selfie prepared from a same-session blink/head-turn flow and may contain up to two optional camera/gallery photos. One prepared card remains the discovery primary; the full-profile viewer exposes the bounded media set and marks the Live selfie as a trust cue. Raw/challenge media remains private, the existing privacy ladder remains authoritative and no legal-identity or automated-liveness claim is made. PR #123 merged as `{MERGE_SHA}`; full validation `{PR_VALIDATE}`, protected staging `{STAGING}` and canonical WP-076 `{CANONICAL}` passed. Detailed evidence: `docs/WP-076-LIVE-SELFIE-PROFILE-MEDIA.md` and ADR-0009.',
    'workpackage status'
)
write(p, t)

# Claim
p = 'docs/WORK-CLAIMS.md'
t = read(p)
old = '| WC-076 | A publishable profile can separate one required camera-origin Live selfie trust derivative from up to two optional camera/gallery profile photos while keeping one explicit discovery primary. | WP-076 implementation candidate | issue #120, PR #123, profile-media model/controller/gallery, migration 20260808100500, pgTAP 019 and dedicated verifier | The challenge is not automated liveness or legal identity verification; raw/challenge/source media remains private; real-user admission remains unauthorized. |'
new = f'| WC-076 | A publishable profile can separate one required camera-origin Live selfie trust derivative from up to two optional camera/gallery profile photos while keeping one explicit discovery primary. | Demonstrated in source, full validation, protected staging and commit-matched canonical delivery | issue #120, PR #123 / `{MERGE_SHA}`, migration 20260808100500, pgTAP 019, runs `{PR_VALIDATE}`, `{STAGING}` and `{CANONICAL}` | The challenge is a camera-origin trust foundation, not automated liveness or legal identity verification; raw/challenge/source media remains private; owner device/visual acceptance and real-user authorization remain pending. |'
t = replace_once(t, old, new, 'WC076')
write(p, t)

# Handover
p = 'docs/HANDOVER.md'
t = read(p)
t = replace_once(
    t,
    '**Milestone:** WP-076 live-selfie/profile-media architecture in implementation and assurance; owner visual acceptance pending',
    '**Milestone:** WP-076 live-selfie/profile-media architecture technically complete and canonically verified; owner device/visual acceptance pending',
    'handover milestone'
)
old = 'Issue #120 records the owner decision to combine a mandatory camera-origin Live selfie with up to two freely chosen profile photos. The Live selfie is a visible prepared derivative from a same-session camera challenge; challenge/raw/source media stays private. Optional photos may come from camera or photo library. Exactly one prepared card is primary in discovery, while an explicit full-profile viewer exposes the remaining media and labels the Live selfie. User-facing copy treats this as a live-camera trust signal, not legal identity or automated liveness verification. PR #123 is the implementation candidate; independent exact-head assurance, protected staging migration, canonical camera/media verification and owner mobile UX review remain required. Real-user admission remains unauthorized.'
new = f'Issue #120 records the owner decision to combine a mandatory camera-origin Live selfie with up to two freely chosen profile photos. The Live selfie is a visible prepared derivative from a same-session camera challenge; challenge/raw/source media stays private. Optional photos may come from camera or photo library. Exactly one prepared card is primary in discovery, while an explicit full-profile viewer exposes the remaining media and labels the Live selfie. User-facing copy treats this as a live-camera trust signal, not legal identity or automated liveness verification. PR #123 merged as `{MERGE_SHA}` after exact-candidate PASS; full validation `{PR_VALIDATE}`, protected staging `{STAGING}` and canonical delivery `{CANONICAL}` passed. Remaining: owner mobile/device review of camera permission/capture, optional camera/gallery photos, primary selection, discovery Live trust cue and full-profile viewer. Real-user admission remains unauthorized.'
t = replace_once(t, old, new, 'handover current WP076')
write(p, t)

# Roadmap
p = 'docs/ROADMAP.md'
t = read(p)
t = replace_once(t, '**Version:** 2.18', '**Version:** 2.19', 'roadmap version')
t = replace_once(
    t,
    '**Status:** WP-076 implementation candidate; issue #120.',
    '**Status:** WP-076 technically complete and canonically verified; owner mobile/device acceptance pending; issue #120.',
    'roadmap WP076 status'
)
needle = 'Rendezvue separates authenticity from presentation without reducing the profile to one technical selfie. Publication requires one **Live selfie** produced from a same-session front-camera blink/head-turn flow. Only a freshly rendered, metadata-free prepared derivative may be visible; challenge/raw source media remains private. A participant may add up to two optional camera/gallery profile photos, select one prepared card as the discovery primary, and expose the remaining media only through a deliberate full-profile viewer. The Live selfie stays visibly labelled as a live-camera trust signal and is not described as legal identity verification. Discovery remains one-primary-image so photo navigation does not compete with pass/like/swipe interaction. Detailed contract: `docs/WP-076-LIVE-SELFIE-PROFILE-MEDIA.md` and ADR-0009.'
replacement = needle + f' PR #123 merged as `{MERGE_SHA}`; exact-candidate validation `{PR_VALIDATE}`, protected staging `{STAGING}` and canonical WP-076 delivery `{CANONICAL}` passed.'
t = replace_once(t, needle, replacement, 'roadmap WP076 evidence')
write(p, t)

# Changelog evidence
p = 'CHANGELOG.md'
t = read(p)
needle = '- Real-user admission remains unauthorized.\n'
section_start = t.find('### Live selfie and multi-photo profile architecture')
if section_start < 0:
    raise SystemExit('missing WP076 changelog section')
needle_pos = t.find(needle, section_start)
if needle_pos < 0:
    raise SystemExit('missing WP076 changelog admission marker')
evidence = f'- PR #123 merged as `{MERGE_SHA}` after exact-candidate assurance; full validation `{PR_VALIDATE}`, protected staging `{STAGING}` and commit-matched canonical verifier `{CANONICAL}` passed.\n'
if evidence not in t:
    t = t[:needle_pos] + evidence + t[needle_pos:]
write(p, t)

# Data model durable profile-media record
p = 'docs/DATA-MODEL.md'
t = read(p)
section = f"""

## WP-076 profile-media slots and camera-origin trust

`privacy_portraits` remains the authoritative prepared-media table. WP-076 adds bounded presentation metadata rather than a second media store:

- `profile_media_slot`: `live_selfie`, `profile_photo_1` or `profile_photo_2`;
- `capture_origin`: `live_camera`, `camera`, `gallery` or migration-only `legacy`;
- `is_profile_media_visible`: only prepared `card` rows may be visible;
- `live_capture_completed_at` and `capture_proof_version`: present for the Live-selfie slot.

One user can expose at most one visible card per slot, hence at most three visible prepared media items. `live_selfie` requires `capture_origin=live_camera`. Optional slots accept camera/gallery content. Source and avatar rows remain private and cannot become discovery media.

Server-authoritative operations:

- `assign_prepared_profile_media(...)` binds a prepared portrait transaction to one bounded slot and capture origin;
- `set_primary_profile_media(...)` selects exactly one visible prepared card as the discovery primary;
- `remove_optional_profile_media(...)` removes only optional slots from the visible profile;
- `get_own_profile_media()` returns the owner's bounded visible-card projection;
- `get_discovery_profile_media(other_user)` returns visible prepared cards only for a published, unblocked profile;
- `publish_profile()` requires a visible camera-origin Live selfie for authenticated product publication.

The short camera challenge is not stored as a public media role. The profile-visible Live selfie is a prepared still derivative that uses the same crop/privacy pipeline as other portraits. The data model therefore records **camera origin and preparation**, not a claim of automated liveness, biometric face match or legal identity verification.

Implementation PR #123 merged as `{MERGE_SHA}`; protected staging `{STAGING}` and canonical verifier `{CANONICAL}` confirmed the deployed contract. Real-user admission remains unauthorized.
"""
if '## WP-076 profile-media slots and camera-origin trust' not in t:
    t += section
write(p, t)

print('WP-076 closeout records updated.')
