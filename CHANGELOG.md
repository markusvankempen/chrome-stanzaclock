# Changelog

All notable changes to **Stanza Clock** are listed here. Version numbers follow [Semantic Versioning](https://semver.org/).

## [1.0.0] — 2026-09-16

First stable release.

- **18 letter plates** — English 8×8/16×16 plus 8×8 and 16×16 for DE, FR, ES, IT, NL, PT
- **Speaking clock** — British Amy, German Deutsch-Zeitansage, or computer voice; schedule or speak now
- **Motion & display** — seconds indicator, matrix ambience, phrase transitions, alternate display modes
- **Settings UI** — Face, Clock, Look, New tab, About tabs with live preview and three-column layout
- **Chrome Web Store package** includes bundled speaking-clock audio

## [0.3.0] — 2026-09-16 (pre-release)

### Added

- **Speaking clock** on the Clock tab and toolbar popup: British Amy MP3s, German [Deutsch-Zeitansage](sounds/Speaking-Clock/Deutsch-Zeitansage) WAVs, or the browser computer voice that reads the lit phrase. Schedule: off, on open, hourly, quarter-hourly, or every minute. **Speak now** for an immediate reading.
- **Motion & display** on the Look tab — four independent groups (inspired by Multilayout):
  - *Seconds indicator* — frame dot, frame sector, 16×16 bar, hopping tick, or blinking star (one at a time)
  - *Matrix ambience* — pulse, trail, or sparkle on unused cells (combines with the indicator)
  - *Phrase transition* — split-flap or board wipe when the spoken phrase changes
  - *Display mode* — word clock, full-matrix digital, scrolling message, symbol, or large seconds readout
- Per-effect colour pickers and a motion-brightness slider.
- **Rainbow cycle** colour mode — hue spins over time.
- Seven language **8×8** plates (DE, FR, ES, IT, NL, PT) alongside the existing 16×16 plates — **18 faces** in total.
- Minute dots on five-minute plates (leftover 1–4 minutes light extra cells).
- Settings UI: consistent three-column layout on every tab, shared button styling, clearer section hints.

### Fixed

- Release zip now includes the speaking-clock audio folders (`British-Amy`, `Deutsch-Zeitansage`). Earlier packages omitted them, so store builds could not play Amy or Zeitansage clips.

### Changed

- Legacy single “seconds effect” setting migrates automatically into *seconds indicator* + *matrix ambience*.

## [0.2.0] — 2026-09-13

- Initial Chrome Web Store release: 12 letter plates, colour modes, new-tab layout, toolbar popup, options page with live preview, seven interface languages.

[1.0.0]: https://github.com/markusvankempen/chrome-stanzaclock/releases/tag/v1.0.0
[0.3.0]: https://github.com/markusvankempen/chrome-stanzaclock/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/markusvankempen/chrome-stanzaclock/releases/tag/v0.2.0
