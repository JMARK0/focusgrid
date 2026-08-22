# Project prompt: "FocusGrid" — 5x5 Number Sequence Focus Game

Paste this into Claude Code as your project brief. It's split into two parts:
Part A (technical spec) and Part B (behavioral/gameplay design). Both matter —
Part A gets it built and approved; Part B gets people to come back.

---

## PART A — TECHNICAL SPECIFICATION

### 1. App overview
Build a native Android app called **FocusGrid**: a Schulte-table style
attention/reaction-speed trainer. A 5x5 grid (25 cells) displays numbers
1-25 in randomized positions, colored in an alternating checkerboard
pattern (black/white). The player taps cells in ascending numeric order
(1, 2, 3...25) as fast as possible while a stopwatch runs. Track best times
locally and show progress over sessions.

### 2. Tech stack
- **Language**: Kotlin (100%, no Java)
- **UI**: Jetpack Compose (Material 3), no XML layouts
- **Architecture**: MVVM with unidirectional data flow (StateFlow /
  Compose State), single-activity app
- **Persistence**: Room database for session history, best times, streaks
- **DI**: Hilt
- **Min SDK**: 26 (Android 8.0) — covers ~99% of active devices
- **Target/Compile SDK**: latest stable (35 or current at build time) —
  Play Store requires targeting within one year of the latest Android
  release at all times
- **Build**: Gradle with version catalogs (`libs.versions.toml`)
- **Testing**: JUnit + Compose UI testing for the grid/tap logic and timer

### 3. Core screens
1. **Home** — big "Play" CTA, best time, current streak, difficulty selector
2. **Game** — the 5x5 grid, live timer, "next number" indicator, pause button
3. **Result** — time achieved, accuracy (mistaps), personal best comparison,
   replay/share buttons
4. **Stats/History** — simple line chart of times over sessions, streak
   calendar
5. **Settings** — sound on/off, haptics on/off, color theme (must include a
   color-blind-safe palette), difficulty/grid size, reset data

### 4. Gameplay logic requirements
- Grid sizes: 3x3 (easy), 4x4 (medium), 5x5 (default), 6x6 (hard), 7x7
  (expert) — same mechanic, scaled cell count
- Fisher-Yates shuffle for number placement each round
- Checkerboard coloring must remain WCAG-contrast-compliant in both light
  and dark mode (don't rely on pure black/white only — support a
  colorblind-safe alt palette in Settings)
- Tap validation: correct tap advances the sequence; wrong tap should be
  configurable in Settings (Settings > Difficulty: "Forgiving" = ignore
  wrong taps, "Strict" = time penalty, "Hard" = board reshuffles)
- Stopwatch precision to 0.1s, using `System.nanoTime()` or
  `System.currentTimeMillis()`, not `Thread.sleep` polling
- Haptic feedback on tap (correct = light tick, wrong = double buzz),
  respecting system haptics setting
- Persist every completed run (time, grid size, mistakes, date) to Room

### 5. Google Play Store compliance checklist
Build these in from day one — retrofitting compliance is what gets apps
rejected or delayed:
- **Target API level**: must meet Play's current target API requirement
  at submission time (check Play Console for the current minimum)
- **App signing**: enroll in Play App Signing; generate an upload keystore
  and document the process (don't hardcode keys in the repo)
- **Data safety form**: since this app only stores data locally (Room, no
  network calls, no analytics SDK by default), the Data Safety section
  should declare "no data collected/shared." If you add analytics or ads
  later, this form must be updated to match — mismatches cause rejections
- **Privacy policy**: required even for apps with no data collection.
  Generate a simple privacy policy page (can be a hosted static HTML page
  or GitHub Pages link) and link it in the Play Console listing and in
  Settings
- **Permissions**: this app needs zero dangerous permissions. Do not
  request INTERNET unless you add online leaderboards — every permission
  you declare must be justified or Play will flag it
- **Content rating**: complete the IARC questionnaire — this is a puzzle/
  trainer app with no violence, ads, or user content, should rate
  "Everyone"
- **Accessibility**: support TalkBack (content descriptions on all grid
  cells, buttons), scalable text (no fixed sp caps that break with system
  font scaling), minimum 48dp touch targets on all interactive elements
- **App bundle format**: ship as an `.aab` (Android App Bundle), not a
  raw APK, since Play Store requires AAB for new apps
- **Screenshots and store listing**: prepare phone screenshots (min 2,
  16:9 or 9:16), a feature graphic (1024x500), and an app icon following
  Play's adaptive icon spec (foreground/background layers)
- **No deceptive claims**: don't market this with unverified claims like
  "boosts IQ" or "clinically proven" — Play and app-store review both
  flag unsubstantiated health/cognitive claims. Frame it as "a focus and
  reaction-speed exercise," not a medical or cognitive-therapy product
- **Ads/IAP (if added later)**: must use Play Billing Library for any
  in-app purchases; ad SDKs must be declared in Data Safety and comply
  with Play's ad policy (no ads that mimic system UI, no forced
  interstitials on every single tap)

### 6. Non-functional requirements
- App must remain responsive/tappable at 60fps during shuffle animations
- Cold start under 2 seconds on a mid-range device
- No crash on rapid multi-tap (debounce or disable-on-tap for already-
  cleared cells)
- Dark mode support using Material 3 dynamic color / system theme
- Works fully offline (this should never require network access for
  core gameplay)

---

## PART B — GAMER BEHAVIORAL / RETENTION DESIGN

The mechanic itself (tap-in-sequence) is simple, so what makes people come
back is the feedback loop and progression system around it, not the grid.
Design for these principles:

### 1. Fast feedback loop
- Every tap needs an immediate, satisfying response: color drain/fade on
  the tapped cell, a subtle tick sound, light haptic. This is what makes
  a 20-second game feel good to repeat — the tap itself should feel
  rewarding independent of winning.
- Wrong taps should communicate clearly but not feel punishing or
  shameful — a quick red flash and reset of the visual state, not a
  jarring buzzer or guilt-inducing message copy ("Try again" not "You
  failed").

### 2. Session length matched to the "just one more" instinct
- A full round (5x5) should take roughly 15-40 seconds for an average
  player. Keep the loop tight: Result screen → one-tap "Play again"
  should take under 2 seconds of friction. Long load times or forced
  animations between rounds kill the "one more round" impulse.

### 3. Personal-best framing over social comparison
- Anchor progress against the player's own history first (best time,
  average of last 5, streak), not leaderboards. This keeps the game
  approachable for its stated purpose — focus training — rather than
  turning it into competitive anxiety. If you add leaderboards later,
  keep them opt-in and separate from the core stats screen.

### 4. Visible, honest progress — no dark patterns
- Since this positions itself as a focus/mindfulness-adjacent tool,
  avoid manipulative retention mechanics: no fake urgency ("only 1
  attempt left today!"), no pay-to-skip-wait timers, no push
  notifications guilt-tripping about broken streaks. Google Play
  increasingly flags manipulative engagement patterns, and they erode
  trust in a "focus" app specifically.
- Do use: gentle streak tracking (a calendar view, not a punishing
  reset-to-zero shame mechanic — consider "streak freeze" grace), a
  simple weekly summary ("Your average time improved by 1.2s this
  week"), and difficulty auto-suggestion (offer to step up grid size
  once a player consistently beats a threshold time).

### 5. Difficulty curve and mastery
- New players should feel early, easy wins (3x3 grid completes in
  ~5 seconds) before being nudged toward 5x5. A visible, tappable
  difficulty ladder (not hidden in settings) supports the "I'm getting
  better" feeling that drives return visits.
- Consider a light "flow state" indicator — if a player's times are
  consistently improving, surface it ("Your reaction time is trending
  down — nice"). If times are volatile or the player seems frustrated
  (many wrong taps in a row), don't auto-escalate difficulty.

### 6. Respect the "focus tool" framing
- Since the product pitch is attention/focus training, avoid anything
  that undermines that promise: no autoplay video ads between rounds,
  no notification spam, no dopamine-farm mechanics like loot boxes or
  random rewards unrelated to actual performance. The retention
  strategy here should be "this genuinely helps me and I notice it," not
  "I'm compelled to open it." That's also the safer long-term position
  for Play Store policy compliance and user trust/reviews.

---

## How to hand this to Claude Code

Suggested first message to Claude Code:

> Set up a new Android Studio project for "FocusGrid" per the attached
> spec. Start with: Gradle setup with Compose + Hilt + Room, the Home and
> Game screens, and core tap-sequence game logic for the 5x5 grid with
> Fisher-Yates shuffle and a 0.1s-precision stopwatch. Hold off on
> Settings/Stats screens until the core loop works end to end.

Build incrementally — get the tap loop feeling good first (Part B,
section 1) before layering in stats, difficulty levels, or store
compliance polish.
