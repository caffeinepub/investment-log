# Meditation Log

## Current State
v62 is live. The app has tree visualization, meditation timer, record logging with moon/mood, natal moon aspect display, and multilingual support (ja/en).

## Requested Changes (Diff)

### Add
- Moon age number displayed next to phase name (e.g. `🌕 満月 · 14`)
- Translation keys: `editCancel`, `editSave`, `wakeLockActive`, `wakeLockUnsupported`, `moodLabel` in both ja/en
- Fade-in animation on timer reset button when timer finishes

### Modify
- Record moon display: when natal data is set, show aspect+orb instead of raw degree
- WhisperBubble font: remove old mincho override, inherit app-wide font stack; scale timeout by phrase length
- Moon header Row 2 opacity: 0.55 → 0.75 (unified with Row 1); gear button opacity-50 → opacity-65
- Inline edit form: replace raw `<input>`/`<textarea>` with `<Input>`/`<Textarea>` UI components
- Empty state: add visual hierarchy (title brighter/medium, subtitle smaller/dimmer)
- WakeLock/mood label: replace inline lang ternaries with `t()` calls
- `timerDone` translation: updated to use ☀️ instead of 🙏 in both languages

### Remove
- Nothing removed

## Implementation Plan
1. Update i18n.tsx with new translation keys
2. Fix WhisperBubble font
3. Apply all MeditationLog.tsx changes in one pass
4. Validate build
