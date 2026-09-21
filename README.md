# Stanza Clock

<p align="center">
  <img src="icons/icon128.png" alt="Stanza Clock" width="96" height="96">
</p>

<p align="center">
  <strong>A word clock for your new tab.</strong><br>
  Letter plates light the words for the current time — on screen, the same way the hardware clock does on LEDs.
</p>

<p align="center">
  <a href="https://github.com/markusvankempen/ESP-WordClock8x8"><img src="https://img.shields.io/badge/companion-ESP--WordClock8x8-0ea5e9" alt="ESP-WordClock8x8"></a>
  <img src="https://img.shields.io/badge/chrome-Manifest%20V3-4285F4" alt="Manifest V3">
  <img src="https://img.shields.io/badge/faces-18%20plates-16c060" alt="18 plates">
  <img src="https://img.shields.io/badge/languages-EN%20DE%20FR%20ES%20IT%20NL%20PT-lightgrey" alt="Languages">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT"></a>
</p>

Stanza Clock replaces Chrome’s new tab with an 8×8 or 16×16 letter matrix. The same face is in the toolbar popup. Settings live on a full-window options page with a live preview.

The three English 8×8 plates are cell-for-cell matches of the firmware in **[ESP-WordClock8x8](https://github.com/markusvankempen/ESP-WordClock8x8)** — Markus Van Kempen’s English 8×8 WS2812 word clock for ESP32-S3, ESP32, and ESP8266. Build the desk clock, then keep the same face on every new tab.

| | Hardware | This extension |
| --- | --- | --- |
| Project | [ESP-WordClock8x8](https://github.com/markusvankempen/ESP-WordClock8x8) | Stanza Clock |
| Surface | 8×8 WS2812 behind a stencil | New tab + popup |
| 8×8 faces | Home, ATWENTYD, TWFIFTHA | Same three, same pixels |
| Extra faces | Custom 8×8 editor on the device | 18 plates — English 8×8/16×16 plus 8×8 and 16×16 for DE, FR, ES, IT, NL, PT |
| Seconds | Pulse, trail, tick, sparkle, star | Indicator + ambience (combinable), phrase transitions, display modes |
| Voice | — | Speaking clock: British Amy, German Zeitansage, or computer voice |
| Config | `http://wordclock8x8.local` | Options page + toolbar |

---

## Factory defaults

A clean, simple first look (also restored by **Reset to factory defaults**):

| Setting | Default |
| --- | --- |
| Letter plate | **EN 8×8 TWFIFTHA** |
| Colour | **Solid** `#ffa028` |
| Letter boxes / dim unlit | On |
| Letter font | Monospace |
| Letter size | 88% of cell |
| Box gap | 2px |
| Clock position | Center |
| Spoken phrase | On |
| Digital time | On, under the plate, **matched to letter size** |
| Seconds effect | Off |
| Speaking clock | Off (British / German / computer voice, on demand) |
| Night dimming | Off |

Reset lives on the **Look** tab and again on **About → Factory reset**. It asks for confirmation, then clears every setting.

---

## Faces

| Plate | Size | Resolution | Reads like |
| --- | --- | --- | --- |
| Home | 8×8 | 5 minutes | `TWENTY HALF PAST ONE` |
| ATWENTYD | 8×8 | 5 minutes | `QUARTER PAST NINE` |
| EN08 TWFIFTHA | 8×8 | 5 minutes | `FIFTEEN PAST ONE` |
| DE / FR / ES / IT / NL / PT 8×8 | 8×8 | 5 minutes | Same wording as the 16×16 plate of that language |
| EN16 exact | 16×16 | every minute | `THE TIME IS TWENTY THREE MINUTES TO TEN IN THE MORNING` |
| EN16 reading order | 16×16 | every minute | Same wording; minutes, TO/PAST, hours, then O’CLOCK and the day part, top to bottom |
| EN16 five minute | 16×16 | 5 minutes | `IT IS QUARTER PAST NINE IN THE MORNING` |
| DE16 | 16×16 | 5 minutes | `ES IST HALB ZEHN` |
| FR16 | 16×16 | 5 minutes | `IL EST DIX HEURES MOINS LE QUART` |
| ES16 | 16×16 | 5 minutes | `SON LAS NUEVE Y MEDIA` |
| IT16 | 16×16 | 5 minutes | `SONO LE NOVE E UN QUARTO` |
| NL16 | 16×16 | 5 minutes | `HET IS HALF TIEN` |
| PT16 | 16×16 | 5 minutes | `SÃO NOVE HORAS E MEIA` |

The English 8×8 plates match [ESP-WordClock8x8](https://github.com/markusvankempen/ESP-WordClock8x8). The language 8×8 plates and all 16×16 plates are original layouts for this extension.

Non-English faces are not translations of the English one. Each language counts time differently:

- **German** and **Dutch** count against the half hour: `HALB ZEHN` / `HALF TIEN` is half past *nine*.
- **French** puts the hour first. `HEURE` loses its `S` at one o’clock; noon and midnight are `MIDI` and `MINUIT`.
- **Spanish**, **Italian**, and **Portuguese** agree the article with the hour: `ES LA UNA` but `SON LAS DOS`, `È L’UNA` but `SONO LE DUE`, `É UMA HORA` but `SÃO DUAS HORAS`.

---

## Look & layout

Colour modes match the firmware: hour hue, solid, rainbow, **rainbow cycle** (hue spins over time), warm white, and black & white (with optional invert).

**Reading colours** tint minutes, TO/PAST, the hour, and time of day so packed 16×16 plates stay readable top to bottom.

**New tab layout** (New tab tab)

- Clock left / center / right
- Spoken phrase on or off; stack words top to bottom
- Digital time: under / above the plate, left / center / right of the phrase, or a screen corner
- Digital font size: match the matrix letters, or set pixels by hand
- Letter font, letter size (% of cell), and box gap
- Fit-to-window or fixed cell size

**Motion & display** (Look tab) — four groups, like Multilayout. Seconds indicator and matrix ambience can run together; phrase transitions and display modes are separate.

| Group | Options |
| --- | --- |
| **Seconds indicator** (one at a time) | Off · frame dot · frame sector · 16×16 bar · hopping tick · blinking star |
| **Matrix ambience** (combines with indicator) | Off · pulse · trail · sparkle |
| **Phrase transition** | Off · split-flap · board wipe (flap speed 1–10) |
| **Display mode** | Word clock · full-matrix digital · scrolling message · symbol · large seconds |

Each animated group has its own colour; motion brightness controls indicator and ambience strength. **Minute dots** on five-minute plates light leftover 1–4 minutes as extra cells.

**Speaking clock** (Clock tab, or the toolbar popup)

| Voice | Source |
| --- | --- |
| **British** | Amy MP3s bundled in the extension (“the time is … three … thirty five … PM”) |
| **German** | [Deutsch-Zeitansage](sounds/Speaking-Clock/Deutsch-Zeitansage) WAVs (“Beim nächsten Ton ist es … 9 Uhr … 30 Minuten”) |
| **Computer** | Browser speech of the lit phrase (`FIFTEEN PAST ONE`, `HALB ZEHN`) |

The reading follows the **face**, not the raw clock. A five-minute plate at 1:13 lights QUARTER PAST ONE, so the clips say “one fifteen”. An exact-minute 16×16 spells every minute, so they say “one thirteen”. With minute dots on, the plate floors instead: 1:13 shows TEN PAST ONE plus three dots, and the clips say “one ten”.

Schedule: off, when the page opens, on the hour (with the third-stroke chime), every quarter hour, or every minute. **Speak now** plays the current reading immediately.

---

## Privacy

**Policy (use this URL in the Chrome Web Store):**  
https://github.com/markusvankempen/chrome-stanzaclock/blob/main/PRIVACY.md

- **Permission:** `storage` only — plate, colour, size, and effect settings
- **No network** — the system clock is the only time source
- **No accounts, no analytics**
- The developer does not collect or receive user data. Settings stay in Chrome (`chrome.storage.sync`) on your devices.

Full text: [PRIVACY.md](PRIVACY.md) · [privacy.html](privacy.html)

Store listing copy lives in the Chrome Web Store listing.

---

## Get the extension

Current version: **1.1.0** — see [CHANGELOG.md](CHANGELOG.md) and the [v1.1.0 release](https://github.com/markusvankempen/chrome-stanzaclock/releases/tag/v1.1.0).

Install from the [Chrome Web Store](https://chrome.google.com/webstore) when the listing is live. This public repository is the homepage, privacy policy, and store assets — not the extension source.

**Homepage / developer page:** [github.com/markusvankempen/chrome-stanzaclock](https://github.com/markusvankempen/chrome-stanzaclock)  
**Hardware companion:** [github.com/markusvankempen/ESP-WordClock8x8](https://github.com/markusvankempen/ESP-WordClock8x8)  
**Author:** [github.com/markusvankempen](https://github.com/markusvankempen) · [markusvankempen.github.io](https://markusvankempen.github.io/)

Store listing copy is in [`store/LISTING.txt`](store/LISTING.txt); screenshots and promo tiles live in [`store/`](store/).

---

## Author

**Markus Van Kempen** — Full Stack Developer · Agentic AI Bridge Builder · System Architect (Toronto).

- [This repo](https://github.com/markusvankempen/chrome-stanzaclock)
- [Portfolio](https://markusvankempen.github.io/)
- [GitHub](https://github.com/markusvankempen)
- [ESP-WordClock8x8](https://github.com/markusvankempen/ESP-WordClock8x8)

---

## Licence

[MIT](LICENSE) — Copyright (c) 2026 Markus Van Kempen.

Letter plates, including the common 8×8 `TWFIFTHA` stencil, are functional grids encoded here in our own mapping code, type, and artwork. There is no third-party plate licence attached.
