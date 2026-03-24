# Meditation Log

## Current State

- Single SVG plant visualization (PlantGrowth.tsx), 50 stages, 4-phase structural transformation, left-leaning tree, flower at stage 45+
- Individuality branching (round/large leaves, thick stem) stored in localStorage
- Level-up popup on stage increase
- No personality selection, no bud/fruit lifecycle
- MeditationLog.tsx shows stats, plant, timer, form, record list

## Requested Changes (Diff)

### Add
- **Personality selection screen** (first-time only, stored in localStorage): shows 3 tiny sprouts (Star / Foolish / Empress) side by side, user picks one to start their journey
- **3 distinct tree personalities** with unique colors, shapes, and characteristics:
  - **Star**: thin silver-white trunk, mint green leaves, upward growth slightly off-center, glowing white/gold fruit
  - **Foolish**: warm reddish-brown trunk, olive green leaves, relaxed sideways branch (my own way), uniquely shaped amber fruit
  - **Empress**: deep navy trunk, deep emerald leaves, thick base, lush dense canopy, deep red/purple large fruit
- **Bud → Flower → Fruit lifecycle** within each personality's 50 stages:
  - Stage 5: tiny bud appears (very early, for fast feedback)
  - Stage 15: bud visibly swells
  - Stage 25: bud almost open, tension builds
  - Stage 31–40: flower blooms (personality-specific color/shape)
  - Stage 41–50: fruit appears and gradually grows more radiant
- **Early-stage density**: stages 1–15 have frequent structural changes so users see the tree is alive quickly
- **"Cycle complete" choice screen** when stage 50 is reached and fruit appears: two options — "もう少しここにいる" (Stay here) and "次の旅へ" (Next journey)
  - Stay here: tree stays at stage 50, each new record makes fruit glow/pulse slightly more radiant. No limit on duration.
  - Next journey: advance to next personality in fixed order (Star → Foolish → Empress → Star...)
- **Ordered cycle**: Star → Foolish → Empress repeating, starting from user's initial choice
- Personality and cycle state stored in localStorage

### Modify
- PlantGrowth.tsx: refactor to accept `personality` prop ("star" | "foolish" | "empress"), render personality-specific colors, shapes, bud/flower/fruit at correct stages
- MeditationLog.tsx: add personality selection flow on first load; show "cycle complete" modal at stage 50; pass personality to PlantGrowth
- Stage indicators below plant: keep "段階 X / 50" and "次の成長まで X 分" but in Japanese

### Remove
- Old individuality branching traits (round/large leaves, thick stem) — replaced by per-personality visual identity
- Old STORAGE_KEY `plant_personality_v4` logic

## Implementation Plan

1. Define personality config (colors, fruit, flower) as a TypeScript object
2. Rewrite PlantGrowth.tsx to accept personality prop and render bud/flower/fruit stages with early-stage density
3. Add localStorage keys: `meditation_personality` ("star"|"foolish"|"empress"), `meditation_cycle_index` (number), `meditation_stay_here` (boolean)
4. Add PersonalitySelectScreen component: shows 3 tiny sprouts with names, tap to choose
5. Add CycleCompleteModal component: shown when stage hits 50, offers Stay/Next options
6. Wire everything in MeditationLog.tsx
