# Meditation Log

## Current State
The app has a plant growth visualization (PlantGrowth.tsx) using a single straight trunk with leaves, buds, and flower. It has individuality branching with fruit traits (banana, pineapple, apple, orange). MeditationLog.tsx shows the plant in a card with stage/next indicators.

## Requested Changes (Diff)

### Add
- Level-up achievement celebration: when stage increases after saving a record, show a charming floating overlay (✦ Stage N 成長しました！) that bursts into view and fades out
- Sparkle effects in the SVG near the pot (animated, subtle)

### Modify
- Complete plant SVG redesign: branching tree style (2-3 levels of branches), dark navy trunk/branches, round teal/mint leaves, red apples, round navy pot — inspired by the flat illustration style in the reference images (no character copying, style only)

### Remove
- Old single-trunk plant design

## Implementation Plan
1. Rewrite PlantGrowth.tsx:
   - Navy branching tree (trunk → 2 main branches → 4 sub-branches)
   - Round teal leaves at branch endpoints and mid-branches
   - Round navy pot with rim
   - Red apple fruits (from stage 25+) 
   - Animated ✦ sparkles near pot
   - Progress-based interpolation for smooth growth
2. Update MeditationLog.tsx:
   - Track prevStage with useRef
   - When actualStage increases, set levelUpStage state
   - Show floating achievement celebration overlay (AnimatePresence)
   - Auto-dismiss after 2.5 seconds
