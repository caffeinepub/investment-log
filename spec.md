# Meditation Log

## Current State
- Meditation records are stored on-chain in the Motoko backend canister (addRecord, getAllRecordsWithIds, deleteRecord, getTotalMinutes)
- Tree state (personality, cycleIndex, stayHere, cycleCompleteShown) is stored in localStorage — at risk of data loss if browser data is cleared

## Requested Changes (Diff)

### Add
- Backend: `getTreeState` query returning the current tree state
- Backend: `setTreeState` update that persists personality, cycleIndex, stayHere, cycleCompleteShown to stable storage

### Modify
- Frontend MeditationLog.tsx: replace all localStorage reads/writes for tree state with backend calls
- On app load, fetch tree state from backend instead of localStorage
- On personality select / cycle advance / stay here, call setTreeState instead of localStorage

### Remove
- All localStorage.getItem/setItem calls related to tree state (meditation_tree_personality, meditation_cycle_index, meditation_stay_here, meditation_cycle_complete_shown)

## Implementation Plan
1. Add TreeState type and stable var to Motoko backend
2. Add getTreeState query and setTreeState update functions
3. Regenerate backend.d.ts bindings
4. Update MeditationLog.tsx to load tree state from backend on mount
5. Replace all localStorage tree state writes with setTreeState backend calls
6. Handle loading state while tree state is fetching (show loading spinner instead of personality select)
