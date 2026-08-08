# WP-076 — Live selfie and profile media architecture

**Issue:** #120  
**Status:** technically complete and canonically verified; owner mobile/visual acceptance pending  
**Decision date:** 2026-08-08

## Product outcome

Rendezvue separates **authenticity media** from **profile presentation media** without forcing one technical selfie to carry the complete visual profile.

A publishable profile contains:

1. one required **Live selfie** prepared from a same-session front-camera capture;
2. zero to two optional profile photos captured with the camera or chosen from the photo library;
3. exactly one explicit primary prepared card used in discovery.

The Live selfie remains visibly represented in the full profile as a trust cue. It may also be selected as the primary discovery image, but it does not have to be.

## Trust boundary

The camera flow records a short blink/head-turn challenge and then creates one still frame. The current controlled staging implementation uses that interaction as a camera-origin proof only. It does **not** claim automated liveness classification, facial matching, legal identity verification, age proof or government-ID verification.

The challenge bytes are not uploaded as profile media. The visible Live selfie is a freshly rendered metadata-free prepared derivative that enters the existing crop and privacy-filter pipeline. The original/raw capture and normalized private source remain outside the public profile.

User-facing wording therefore says **Live selfie** or **live-camera trust signal**, never **identity verified**.

## Media contract

Visible slots are fixed and bounded:

- `live_selfie` — required for publication, `capture_origin=live_camera` only;
- `profile_photo_1` — optional, camera or gallery;
- `profile_photo_2` — optional, camera or gallery.

Each preparation continues to use the WP-069B/WP-074 pipeline:

- private normalized source;
- 4:5 prepared card;
- square avatar;
- explicit privacy presentation ID;
- only prepared card derivatives may become visible profile media.

One visible card is explicitly primary. Replacing an optional slot or changing the primary image does not alter the required Live selfie slot.

## Interaction architecture

### Profile editing

The media surface is deliberately staged as three coherent decisions:

1. **Make your Live selfie** — front camera only, contextual permission request, short challenge and still-frame capture;
2. **Optionally add two other photos** — each offers `Take photo` and `Choose from photos`;
3. **Choose what people see first** — three-slot media tray, primary indicator and optional removal.

Every captured/selected image then passes through the existing framing and privacy matrix. No raw upload bypass is introduced.

### Discovery

Discovery continues to show **one primary image**. Horizontal discovery gestures remain reserved for the dating interaction and are not overloaded with photo navigation.

A compact media/profile affordance communicates that more media is available. Opening it reveals the full profile media viewer.

### Full profile

The full-profile viewer provides:

- primary image first;
- prepared 4:5 images without geometric distortion;
- thumbnail/arrow navigation;
- explicit `Live selfie` labelling;
- plain-language explanation that the Live selfie came from the in-app camera but is not legal identity verification;
- existing profile text and context.

## Backend and access rules

- publication requires a visible `live_selfie` prepared from `live_camera`;
- gallery content cannot be relabelled as Live selfie;
- maximum visible media is three slots;
- only prepared card objects are readable through profile/discovery media access;
- source and avatar objects remain denied through this access path;
- unpublished or blocked profiles remain inaccessible;
- raw/challenge media is never marked public;
- changing/removing optional media remains server-authoritative;
- user-facing projections do not expose private object paths or internal account identifiers.

## Cloudflare camera boundary

The canonical artifact changes `Permissions-Policy` from `camera=()` to `camera=(self)` so the first-party PWA can request the camera. Microphone, geolocation and payment remain disabled at this boundary.

## Explicit non-goals

WP-076 does not claim or deliver:

- automated liveness classification;
- biometric face matching between Live selfie and other profile photos;
- legal identity verification;
- authoritative age verification;
- government-ID processing;
- real-user admission.

These require the planned age/liveness/privacy/legal work in Phase 2F before production use.

## Acceptance criteria

### Functional

- front-camera capture is available on supported mobile browsers;
- Live selfie cannot originate from gallery upload;
- challenge bytes are not uploaded as visible profile media;
- Live selfie still frame enters crop/privacy selection;
- two optional slots support camera and photo library;
- exactly one primary image drives discovery;
- full profile can display all visible prepared media;
- Live selfie is visibly and consistently labelled;
- publication without Live selfie fails server-side.

### UX

- media setup reads as one coherent profile-building flow rather than a technical upload form;
- camera permission is requested only after an explicit user action;
- discovery stays visually simple and swipe-safe;
- optional photos have a clear reason to exist because they are accessible in full profile;
- trust language is understandable and does not overclaim identity;
- mobile controls have obvious camera/gallery choices and touch targets;
- prepared 4:5 geometry remains stable.

### Privacy and security

- source/challenge media never becomes a public profile object;
- only bounded prepared card slots are externally readable;
- block/unpublish continues to revoke profile media access;
- microphone remains disabled in the PWA policy;
- no new real-user authorization is implied.

### Evidence

Release requires:

- application/source tests;
- Cloudflare generated-artifact validation;
- empty-database migration replay;
- pgTAP access/origin/slot/publication tests;
- existing race, seed, schema and Docker checks;
- independent exact-candidate assurance;
- protected staging migration;
- commit-matched canonical camera/media delivery verification;
- owner visual/device review before the issue is closed.


## Release evidence

WP-076 was independently assured and deployed on 2026-08-08.

- implementation PR #123 merged as `ddecb67dbbd3487daefac16045ff147a6649c1e2`;
- exact-candidate CI `31254828420`: PASS;
- full exact-candidate validation `31254828422`: PASS, including empty-database replay, all pgTAP contracts, parallel races, deterministic seed, schema lint, Docker and Cloudflare boundary;
- dedicated WP-076 verifier `31254828411`: PASS;
- retained WP-074B privacy contract `31254828400`: PASS;
- protected staging run `31255042784`: PASS; migration applied and remote/backend/artifact boundary green;
- commit-matched canonical WP-076 run `31255080791`: PASS for both generated contract and delivered camera/profile-media boundary.

Technical outcome is confirmed. Issue #120 remains open only for owner mobile/device and visual UX acceptance. Real-user admission remains unauthorized.
