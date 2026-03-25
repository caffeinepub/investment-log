# Meditation Log

## Current State
- Records: add/delete/view working
- Total meditation time displayed
- Timer (wall-clock based, screen-off safe)
- Tree growth visualization: 50 stages, 3 personalities (Star/Flow/Empress), bud→flower→fruit cycle
- Personality selection screen on first launch
- CycleCompleteModal for post-stage-50 choice
- Streak (consecutive days) displayed
- Form fields: date, duration, mood before/after (1-5), memo

## Requested Changes (Diff)

### Add
- Timer auto-fills meditation duration field when timer stops/ends
- Cycle transition animation: show a brief message screen when user selects "次の旅へ"

### Modify
- Personality select screen: each sprout has a DISTINCT shape per personality:
  - Star: thin, straight upward, slight right lean, tiny sparkle at tip
  - Flow: visibly tilted/angled from the start (our way personality)
  - Empress: short but noticeably thick at the base
- Streak display: rename/repurpose from "連続日数" to "累計瞑想時間" or remove streak in favor of total time only (user said time accumulation matters more than consecutive days)
- Form layout: fix overlap of date and duration fields
- Mood fields (気分前後): hide from form (non-essential, not used anywhere)

### Remove
- Mood before/after input fields from the record form

## Implementation Plan
1. Update PersonalitySelectScreen: give each sprout a distinct SVG shape
2. Update MeditationLog form: remove mood fields, fix layout spacing
3. Wire timer to auto-fill duration field on stop/complete
4. Update CycleCompleteModal or add transition screen: show a message when "次の旅へ" is selected before switching personality
5. Update stats display: replace streak card with something that reflects time accumulation philosophy (keep total time, consider renaming/removing streak)
6. Validate and deploy
