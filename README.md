# FocusGrid

Schulte-table attention/reaction-speed trainer for Android. Spec: `focus-grid-app-prompt.md`.

## Status

Core loop is scaffolded per the spec's suggested first milestone: Gradle
(Compose + Hilt + Room via version catalog), Home screen, Game screen, and
a minimal Result screen, wired together with Navigation Compose.

Implemented:
- 5x5 default grid, selectable 3x3 → 7x7 (`GridSize`)
- Fisher-Yates board shuffle (`GridGenerator`)
- 0.1s-precision stopwatch driven by `System.nanoTime()` deltas (`Stopwatch`)
- Tap-sequence validation, wrong-tap flash + haptics, pause/resume
- Wrong-tap mode plumbing (Forgiving/Strict/Hard) — defaults to Forgiving
  until the Settings screen exists to expose the other two
- Every completed run persisted to Room (`RunEntity`/`RunDao`)
- Home shows best time and a simple day-streak computed from run history
- Result screen: time, mistakes, personal-best callout, one-tap replay

Not yet built (intentionally deferred, per the spec's own sequencing):
Settings screen, Stats/History screen, sound effects, colorblind-safe
palette toggle, streak-freeze grace, weekly summary copy.

## Building

This environment has no JDK or Android Studio installed, so the project
has **not** been compiled or run here. To build it:

1. Open the project root in Android Studio (Ladybug or newer).
2. Let it generate the Gradle wrapper (`gradlew`/`gradle-wrapper.jar` are
   intentionally not checked in — Android Studio creates them on first
   sync) and download the Compose/Hilt/Room dependencies.
3. Run on an emulator or device (minSdk 26).

## Testing

`app/src/test/.../domain/` has unit tests for the shuffle and stopwatch
formatting. Run with `./gradlew test` once the wrapper exists.
