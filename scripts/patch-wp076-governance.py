from pathlib import Path


def read(path):
    return Path(path).read_text(encoding='utf-8')


def write(path, value):
    Path(path).write_text(value, encoding='utf-8')


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'missing governance anchor: {label}')
    return text.replace(old, new, 1)

# Normalize provisional internal identifiers after the WP-075 OTP work claimed that number on main.
for filename in [
    'apps/private-preview/profile-media-controller.js',
    'apps/private-preview/profile-media-gallery.js',
    'supabase/migrations/20260808100500_live_selfie_profile_media.sql',
]:
    value = read(filename)
    value = value.replace('WP-075', 'WP-076').replace('WP075', 'WP076').replace('wp075-', 'wp076-')
    write(filename, value)

# ROADMAP
path = 'docs/ROADMAP.md'
value = read(path)
value = replace_once(value, '**Version:** 2.17', '**Version:** 2.18', 'roadmap version')
value = replace_once(
    value,
    '- Participant-controlled, browser-prepared portrait presentations are the MVP baseline; the original source remains private and AI portraits are optional.\n',
    '- Participant-controlled, browser-prepared portrait presentations are the MVP baseline; the original source remains private and AI portraits are optional.\n- Authenticity media and profile presentation media are separate: a publishable profile requires one camera-origin Live selfie derivative, while up to two optional camera/gallery photos preserve freedom of presentation.\n',
    'roadmap doctrine media separation'
)
anchor = "### 1D. Product baseline v1 and onboarding redefinition\n"
section = """### 1C.1. Live selfie and multi-photo profile architecture

**Status:** WP-076 implementation candidate; issue #120.

Rendezvue separates authenticity from presentation without reducing the profile to one technical selfie. Publication requires one **Live selfie** produced from a same-session front-camera blink/head-turn flow. Only a freshly rendered, metadata-free prepared derivative may be visible; challenge/raw source media remains private. A participant may add up to two optional camera/gallery profile photos, select one prepared card as the discovery primary, and expose the remaining media only through a deliberate full-profile viewer. The Live selfie stays visibly labelled as a live-camera trust signal and is not described as legal identity verification. Discovery remains one-primary-image so photo navigation does not compete with pass/like/swipe interaction. Detailed contract: `docs/WP-076-LIVE-SELFIE-PROFILE-MEDIA.md` and ADR-0009.

"""
if section not in value:
    value = replace_once(value, anchor, section + anchor, 'roadmap WP076 section')
value = replace_once(
    value,
    "### 2F. Age and liveness proofs\n\n**Status:** planned.\n\n- privacy-preserving age assurance;\n- replay threat model;\n- randomized challenges;\n- error thresholds and appeal paths.\n",
    "### 2F. Age and liveness proofs\n\n**Status:** planned beyond the WP-076 camera-origin trust foundation.\n\nWP-076 provides an explicit same-session front-camera challenge and a visible prepared Live selfie derivative, but it deliberately does not claim automated liveness or identity verification. Production assurance still requires:\n\n- privacy-preserving age assurance;\n- automated or independently validated liveness design, if adopted;\n- replay/spoof threat model and randomized challenges;\n- any face-comparison/biometric processing decision only after DPIA/legal approval;\n- error thresholds, manual review and appeal paths;\n- retention/deletion rules for verification evidence separate from public prepared media.\n",
    'roadmap phase 2F'
)
write(path, value)

# REQUIREMENTS
path = 'docs/REQUIREMENTS.md'
value = read(path)
value = replace_once(
    value,
    'The public profile uses a controlled fuzzy privacy portrait derived from a live camera capture. The source selfie is never the public profile image.',
    'Rendezvue separates live-camera authenticity media from profile presentation media. A publishable profile requires one camera-origin Live selfie, represented publicly only by a freshly rendered metadata-free prepared derivative, plus up to two optional camera/gallery profile photos. Raw/challenge capture and normalized source media are never public profile objects.',
    'requirements product statement'
)
value = replace_once(
    value,
    '| LIVE-03 | P0 | The concept pilot shall state that capture is not automated liveness classification. |\n',
    '| LIVE-03 | P0 | The concept pilot shall state that capture is not automated liveness classification. |\n| LIVE-04 | P0 | Publication shall require one camera-origin Live selfie prepared from the same front-camera challenge session. |\n| LIVE-05 | P0 | The visible Live selfie shall be labelled as a live-camera trust signal and shall not be described as legal identity verification. |\n| LIVE-06 | P0 | Challenge/video bytes shall not be published as profile media; only a freshly rendered prepared still derivative may be visible. |\n',
    'requirements live rules'
)
value = replace_once(
    value,
    '| PORT-07 | P0 | Production portrait objects shall be stored privately and exposed only through an approved derivative/access policy. |\n',
    '| PORT-07 | P0 | Production portrait objects shall be stored privately and exposed only through an approved derivative/access policy. |\n| PORT-08 | P0 | Visible profile media shall be bounded to one required Live selfie slot and at most two optional profile-photo slots. |\n| PORT-09 | P0 | Optional profile photos may come from camera or photo library but shall use the same preparation/privacy pipeline as the Live selfie derivative. |\n| PORT-10 | P0 | Exactly one prepared card shall be the discovery primary; the full profile may reveal the remaining visible prepared media. |\n',
    'requirements profile-media rules'
)
value = replace_once(
    value,
    '| PROF-03 | P0 | Exact location, account email, phone number and source selfie shall never be public. |\n',
    '| PROF-03 | P0 | Exact location, account email, phone number and raw/normalized source selfie shall never be public. |\n| PROF-04 | P0 | A visible Live selfie derivative shall remain distinguishable from optional profile photos so another participant can understand the trust cue. |\n| PROF-05 | P0 | Discovery shall continue to present one primary image; additional profile media shall be available through an explicit full-profile interaction rather than overloading the discovery swipe gesture. |\n',
    'requirements profile rules'
)
write(path, value)

# ONBOARDING
path = 'docs/ONBOARDING.md'
value = read(path)
value = replace_once(
    value,
    '### 6. Live camera and privacy portrait\n\nExplain purpose, request camera permission in context, record a short blink/head-turn challenge, create controlled fuzzy variants locally and let the user choose. The pilot does not claim automated liveness classification.\n',
    '### 6. Live selfie and profile photos\n\nExplain the trust purpose before requesting camera permission. The first media item is mandatory and camera-only: record a short blink/head-turn challenge, capture one still frame from that same live session, then let the user frame it and choose the normal privacy presentation. The challenge bytes are not public profile media and the pilot does not claim automated liveness or legal identity verification.\n\nAfter the Live selfie is prepared, offer up to two optional photo slots. Each slot provides two clear actions: **Maak foto / Take photo** or **Kies uit foto’s / Choose from photos**. Optional photos use the same framing/privacy preparation path. The user then chooses which prepared card is the discovery primary. The full profile keeps the other visible media and marks the Live selfie explicitly.\n',
    'onboarding media stage'
)
value = replace_once(
    value,
    '- camera permission and successful capture;\n- privacy-variant selection;\n',
    '- camera permission and successful Live-selfie capture;\n- successful completion of the camera-origin trust step;\n- optional camera/gallery profile-photo adoption;\n- privacy-variant selection per prepared image;\n- primary-photo selection and full-profile media opens;\n',
    'onboarding measurement'
)
write(path, value)

# PRIVACY AND SAFETY
path = 'docs/PRIVACY-AND-SAFETY.md'
value = read(path)
value = replace_once(
    value,
    '- request camera access only in context;\n',
    '- request camera access only in context and only after an explicit user action;\n- treat the live-camera challenge/raw capture as authenticity evidence distinct from profile presentation media;\n- do not publish or expose challenge/video bytes as profile media;\n- allow the same-session Live selfie to remain visibly represented only as a freshly rendered metadata-free prepared derivative with an explicit Live selfie label;\n',
    'privacy camera separation'
)
value = replace_once(
    value,
    '- keep AI portrait generation optional rather than a prerequisite.\n',
    '- keep AI portrait generation optional rather than a prerequisite;\n- do not describe the Live selfie as legal identity verification, automated liveness proof or biometric match;\n- require a separate legal/DPIA decision before automated face comparison between the Live selfie and optional profile photos.\n',
    'privacy claims boundary'
)
write(path, value)

# ARCHITECTURE: append once.
path = 'docs/ARCHITECTURE.md'
value = read(path)
architecture = """

## WP-076 authenticity-media and profile-media boundary

Rendezvue uses one shared image-preparation pipeline but two distinct product purposes:

```text
front camera + short challenge
  -> private challenge bytes (not profile media)
  -> same-session still
  -> crop/privacy preparation
  -> visible Live selfie card

camera or photo library
  -> crop/privacy preparation
  -> optional profile photo card (max 2)

visible prepared cards (max 3)
  -> one explicit primary -> discovery
  -> complete set -> full-profile media viewer
```

Server metadata records the bounded media slot and capture origin. `live_selfie` accepts `live_camera` only. Source and avatar roles remain outside discovery profile-media access. Publication requires the Live selfie slot, but no automated liveness, face matching or legal identity claim is inferred from that requirement. Same-origin camera access is enabled in the Cloudflare `Permissions-Policy`; microphone stays disabled.
"""
if architecture.strip() not in value:
    value += architecture
write(path, value)

# WORKPACKAGES
path = 'docs/WORKPACKAGES.md'
value = read(path)
anchor = '## WP-080 — Closed city pilot readiness\n'
section = """## WP-076 — Live selfie and multi-photo profile architecture

**Status:** implementation candidate; independent assurance and canonical owner review pending; issue #120  
A publishable profile requires one camera-origin Live selfie prepared from a same-session blink/head-turn flow and may contain up to two optional camera/gallery photos. One prepared card remains the discovery primary; the full-profile viewer exposes the bounded media set and marks the Live selfie as a trust cue. Raw/challenge media remains private, the existing privacy ladder remains authoritative and no legal-identity or automated-liveness claim is made. Detailed evidence: `docs/WP-076-LIVE-SELFIE-PROFILE-MEDIA.md` and ADR-0009.

"""
if section not in value:
    value = replace_once(value, anchor, section + anchor, 'workpackage WP076')
write(path, value)

# WORK CLAIMS
path = 'docs/WORK-CLAIMS.md'
value = read(path)
row = '| WC-076 | A publishable profile can separate one required camera-origin Live selfie trust derivative from up to two optional camera/gallery profile photos while keeping one explicit discovery primary. | WP-076 implementation candidate | issue #120, PR #123, profile-media model/controller/gallery, migration 20260808100500, pgTAP 019 and dedicated verifier | The challenge is not automated liveness or legal identity verification; raw/challenge/source media remains private; real-user admission remains unauthorized. |\n'
if row not in value:
    value = value.rstrip() + '\n' + row
write(path, value)

# HANDOVER
path = 'docs/HANDOVER.md'
value = read(path)
value = replace_once(
    value,
    '**Milestone:** WP-074A privacy portrait recognisability recalibration technically complete; owner visual acceptance pending',
    '**Milestone:** WP-076 live-selfie/profile-media architecture in implementation and assurance; owner visual acceptance pending',
    'handover milestone'
)
anchor = '## Current WP-074A privacy portrait recalibration\n'
section = """## Current WP-076 live selfie and profile media architecture

Issue #120 records the owner decision to combine a mandatory camera-origin Live selfie with up to two freely chosen profile photos. The Live selfie is a visible prepared derivative from a same-session camera challenge; challenge/raw/source media stays private. Optional photos may come from camera or photo library. Exactly one prepared card is primary in discovery, while an explicit full-profile viewer exposes the remaining media and labels the Live selfie. User-facing copy treats this as a live-camera trust signal, not legal identity or automated liveness verification. PR #123 is the implementation candidate; independent exact-head assurance, protected staging migration, canonical camera/media verification and owner mobile UX review remain required. Real-user admission remains unauthorized.

"""
if section not in value:
    value = replace_once(value, anchor, section + anchor, 'handover WP076')
write(path, value)

# CHANGELOG
path = 'CHANGELOG.md'
value = read(path)
anchor = '## [Unreleased]\n'
section = """
### Live selfie and multi-photo profile architecture

- Added WP-076 / issue #120 to separate camera-origin authenticity media from profile presentation media.
- Added one required same-session front-camera Live selfie flow with a short blink/head-turn challenge; challenge bytes are not uploaded as visible profile media.
- Kept the visible Live selfie as a freshly prepared 4:5 privacy-controlled derivative and explicitly avoided legal-identity or automated-liveness claims.
- Added two optional profile-photo slots with camera and photo-library entry points.
- Added explicit primary-image selection while preserving the one-image discovery interaction.
- Added a full-profile media viewer so optional photos and the visibly labelled Live selfie have a clear role in the dating interaction.
- Added server-side media-slot/capture-origin constraints, publication gating, prepared-card access controls, pgTAP coverage and a commit-matched canonical verifier.
- Enabled same-origin camera access in the Cloudflare Permissions-Policy while keeping microphone, geolocation and payment disabled.
- Real-user admission remains unauthorized.
"""
if '### Live selfie and multi-photo profile architecture' not in value:
    value = replace_once(value, anchor, anchor + section, 'changelog WP076')
write(path, value)

print('WP-076 governance and architecture patch applied.')
