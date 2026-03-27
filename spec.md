# Meditation Log

## Current State
On app load, `treeState` (personality data) is fetched from the backend. While loading, `personality` is null, causing the personality selection screen to flash briefly before data arrives. This makes users see the selection screen every time they open the app, even though they've already chosen.

## Requested Changes (Diff)

### Add
- ZenLoadingScreen component: displays a randomly selected zen phrase (from 21 curated phrases) while the backend loads
- Minimum display time of 3 seconds, regardless of how fast the backend responds
- Phrase displayed with: kanji, reading (furigana), and short description
- Smooth fade-in/fade-out transition into main app

### Modify
- MeditationLog.tsx: when `treeState` is undefined (loading), show ZenLoadingScreen instead of the personality select screen or main app
- Only show personality select screen after treeState has loaded AND personality is confirmed empty

### Remove
- Nothing removed

## Implementation Plan
1. Create a `zenPhrases` data array (21 phrases, each with: kanji, reading, description)
2. Create `ZenLoadingScreen` component that:
   - Picks a random phrase on mount
   - Waits for both: (a) minimum 3 seconds elapsed, (b) `isReady` prop to be true
   - Shows phrase centered on screen with gentle fade animation
   - Calls `onDone` callback when both conditions met
3. In MeditationLog: track loading state, render ZenLoadingScreen when `treeState` is undefined, pass `isReady={treeState !== undefined}` and `onDone` to transition out
