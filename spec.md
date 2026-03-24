# Meditation Log

## Current State
Meditation Log is a working app with record add/delete, total time, streak, and timer. The MeditationLog.tsx page has stats cards, timer, form, and records list.

## Requested Changes (Diff)

### Add
- PlantGrowth SVG component: displays a growing plant based on cumulative meditation minutes
  - stage = min(floor(totalMinutes / 20), 50)
  - Trunk: height scales from short to ~2x as stage increases; slightly thicker in latter half
  - Leaves: up to 10 leaves added alternately left/right as stage increases; leaves higher on trunk are slightly smaller
  - Color: green deepens (higher saturation, slightly lower lightness) as stage increases
  - Decorations: small buds appear at stage 30+; small flower appears near stage 50
  - No decrease/reset behavior
  - Smooth, subtle transitions (fade-level animation only)
- Place the PlantGrowth component between the stats section and the timer section in MeditationLog.tsx

### Modify
- MeditationLog.tsx: import and render PlantGrowth with totalMinutes prop

### Remove
- Nothing

## Implementation Plan
1. Create src/frontend/src/components/PlantGrowth.tsx with the SVG plant logic
2. Accept `totalMinutes: number` prop, compute stage internally
3. Render trunk as a rect/path with height and width varying by stage
4. Render leaves as ellipses placed at intervals along the trunk, alternating left/right, upper leaves smaller
5. Compute green color using oklch or hsl with saturation/lightness varying by stage
6. Render buds (small circles) at stage >= 30, flower at stage >= 45
7. Wrap SVG elements in CSS transition for opacity fade
8. Add PlantGrowth to MeditationLog.tsx between stats and timer
