# Meditation Log v62

## Current State
- Whisper phrases (木の言葉) never appear because the mount useEffect fires before `personality` is loaded from the backend
- ZenLoadingScreen shows Japanese phrases only; English translations are missing in `zenPhrases.ts`
- Records store `moodBefore`/`moodAfter` (hardcoded to 3) and `memo`; no mood selection UI exists
- Transit moon longitude can be computed for any past date using `getMoonEclipticLongitude(date)` in `moonAstrology.ts`

## Requested Changes (Diff)

### Add
- English translations for all 21 zen phrases in `zenPhrases.ts` (new fields `quoteEn`, `authorEn`)
- Mood/expression selector in the record form: 5 emoji options (😔😐🙂😄✨ mapped to 1-5), stored in existing `moodBefore` field; optional, defaults to 3
- Moon sign + degree display in each record list item, computed from record date using `getMoonEclipticLongitude`

### Modify
- `ZenLoadingScreen`: use current language (from i18n context) to show `quoteEn`/`authorEn` when language is English
- Whisper phrases: trigger after personality is first loaded (not on mount). Use a `useRef` flag `hasShownFirstWhisper` and fire whisper in a `useEffect` that depends on `personality`, running once when personality first becomes non-empty
- Record display: show moon emoji + sign + degree small below date/duration
- `handleSubmit`: pass selected mood value instead of hardcoded 3

### Remove
- Nothing

## Implementation Plan
1. Update `zenPhrases.ts`: add `quoteEn` and `authorEn` fields for all 21 phrases
2. Update `ZenLoadingScreen`: import language from i18n context, show English fields when `lang === 'en'`
3. Fix whisper trigger in `MeditationLog.tsx`: replace mount-only useEffect with one that fires when personality first loads
4. Add mood emoji selector to record form in `MeditationLog.tsx`; wire to `moodBefore` in `addRecord`
5. In record list, compute and display moon sign+degree from record date
