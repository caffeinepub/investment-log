# Meditation Log

## Current State

The app displays the current moon phase (emoji + phase name) near the tree header using a simple J2000-based synodic cycle calculation. It shows the emoji and translated phase name only (e.g., "🌔 上弦の月").

The app supports Japanese and English via i18n.tsx (flat key structure). User preferences (language, tree state, records, timer state) are persisted to localStorage.

No natal astrology data is currently stored or displayed.

## Requested Changes (Diff)

### Add
- `src/frontend/src/utils/moonAstrology.ts`: Astronomical utilities
  - `getJulianDay(date: Date): number`
  - `getMoonEclipticLongitude(date: Date): number` — Jean Meeus simplified algorithm, ~0.3° accuracy
  - `getZodiacSign(longitude: number): { signJa: string, signEn: string, degree: number }`
  - `getMoonAspect(natalLon: number, transitLon: number): AspectInfo | null` — returns major aspect (Conjunction 0°, Sextile 60°, Square 90°, Trine 120°, Opposition 180°) with symbol, Japanese/English names, and signed orb value
- Natal birth data settings UI: a small gear/settings icon near the moon display opens a modal for inputting birth date, birth time (local), and timezone offset (select, −12 to +14, default +9 for JST)
- Natal data stored in localStorage under key `"meditationNatalData"` as `{ birthDate: string, birthTime: string, timezoneOffset: number }`
- Aspect display near the moon phase: when natal data is set, show natal moon sign + current aspect symbol + orb (e.g., "♏ 蠍座 △ +2.3°" in Japanese, "♏ Scorpio △ +2.3°" in English)
- New i18n keys: aspect names in Japanese/English, settings labels, zodiac sign names

### Modify
- `MeditationLog.tsx`: Add natal settings modal, compute natal moon longitude from stored birth data, compute aspect between natal and transit moon, display below or alongside existing moon phase display
- `i18n.tsx`: Add translation keys for aspect names, zodiac signs, settings UI labels

### Remove
- Nothing removed

## Implementation Plan

1. Create `moonAstrology.ts` with Julian Day, moon ecliptic longitude (Meeus), zodiac sign lookup, and aspect calculation (5 major aspects with standard orbs: Conjunction/Square/Trine/Opposition ±8°, Sextile ±6°)
2. Add `"meditationNatalData"` localStorage read/write logic in MeditationLog.tsx
3. Add natal settings modal (date + time + timezone offset select) that saves to localStorage
4. Add a small settings icon (⚙) near moon display to open the modal
5. Compute transit moon longitude using `getMoonEclipticLongitude(new Date())`
6. Compute natal moon longitude using birth UTC time
7. Display natal sign + aspect (symbol + name abbreviated + signed orb) in a second line under the moon phase, only when natal data is configured
8. Add i18n keys for all new text (aspect names in JA/EN, zodiac signs in JA/EN, settings modal labels)
