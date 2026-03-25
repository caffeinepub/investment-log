# Meditation Log

## Current State
Full meditation log app with Japanese-only UI, plant growth visualization, timer, records, review page, personality selection, cycle system, and optimistic UI. All text is hardcoded in Japanese.

## Requested Changes (Diff)

### Add
- Language context (`i18n.tsx`) with Japanese and English translation strings
- Auto-detection of language from `navigator.language` on first visit
- Language toggle in settings (accessible from header)
- `LanguageProvider` wrapping the app in `App.tsx`

### Modify
- `MeditationLog.tsx`: replace all hardcoded Japanese strings with `t()` calls; add language toggle button in header
- `PersonalitySelectScreen.tsx`: replace all hardcoded strings with `t()` calls
- `CycleCompleteModal.tsx`: replace all hardcoded strings with `t()` calls
- `ReviewPage.tsx`: replace all hardcoded strings with `t()` calls

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/i18n.tsx` with LanguageContext, useLanguage hook, and full ja/en translation map
2. Wrap app in `LanguageProvider` in `App.tsx`
3. Update all 4 components to use `useLanguage()` for all user-visible text
4. Add a small language toggle (🌐 日本語 / English) in the header of MeditationLog
5. Persist language choice to localStorage
