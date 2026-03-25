# Meditation Log

## Current State
- MeditationLog.tsx: main page with stats, plant, timer, add form, records list
- PersonalitySelectScreen.tsx: initial personality selection with unique sprout SVGs
- CycleCompleteModal.tsx: modal shown when stage 50 reached
- PlantGrowth.tsx: SVG tree visualization (50 stages, 3 personalities)
- Backend: addRecord, deleteRecord, getAllRecordsWithIds, getTotalMinutes, getTreeState, setTreeState
- Data stored on-chain via Motoko backend
- Timer persists across page reloads via localStorage

## Requested Changes (Diff)

### Add
- **振り返り画面 (Review Tab)**: A new tab/section showing:
  - Monthly summary: total minutes this month, number of sessions
  - Simple calendar grid showing which days had meditation (current month, dots on days with records)
  - Past memos: scrollable list of records that have memos, showing date + memo text
- **ハプティクス (Haptics)**: Call `navigator.vibrate()` on:
  - Record saved successfully (short pulse: 50ms)
  - Stage level-up (pattern: [80, 40, 80])
  - Timer finished (pattern: [100, 50, 100, 50, 100])
- **オンボーディング改善**: On PersonalitySelectScreen, add a brief intro sequence:
  - Before showing the 3 sprouts, show a short welcome message (2-3 lines) with a gentle fade-in
  - Add a subtle pulsing animation to the selected card on hover
  - After user taps a sprout, show a brief confirmation message ("〇〇の旅が始まります") before transitioning

### Modify
- MeditationLog.tsx: Add tab navigation (「記録」and「振り返り」tabs) to switch between main view and review view
- PersonalitySelectScreen.tsx: Add intro message and post-selection confirmation animation

### Remove
- Nothing

## Implementation Plan
1. Create `src/frontend/src/pages/ReviewPage.tsx` - the review/retrospective view component
2. Modify `MeditationLog.tsx` to add tab navigation between main view and review view
3. Modify `PersonalitySelectScreen.tsx` to add onboarding intro + post-selection confirmation
4. Add haptic feedback utility function and integrate into: record save, level-up, timer finish
