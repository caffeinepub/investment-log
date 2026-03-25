/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

export const MeditationRecord = IDL.Record({
  'duration' : IDL.Nat,
  'moodBefore' : IDL.Nat,
  'date' : IDL.Text,
  'memo' : IDL.Text,
  'moodAfter' : IDL.Nat,
});
export const MeditationRecordWithId = IDL.Record({
  'id' : IDL.Int,
  'record' : MeditationRecord,
});
export const TreeState = IDL.Record({
  'personality' : IDL.Text,
  'cycleIndex' : IDL.Nat,
  'stayHere' : IDL.Bool,
  'cycleCompleteShown' : IDL.Bool,
});

export const idlService = IDL.Service({
  'addRecord' : IDL.Func(
      [IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text],
      [IDL.Int],
      [],
    ),
  'deleteRecord' : IDL.Func([IDL.Int], [], []),
  'getAllRecordsWithIds' : IDL.Func(
      [],
      [IDL.Vec(MeditationRecordWithId)],
      ['query'],
    ),
  'getTotalMinutes' : IDL.Func([], [IDL.Nat], ['query']),
  'getTreeState' : IDL.Func([], [TreeState], ['query']),
  'setTreeState' : IDL.Func([IDL.Text, IDL.Nat, IDL.Bool, IDL.Bool], [], []),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const MeditationRecord = IDL.Record({
    'duration' : IDL.Nat,
    'moodBefore' : IDL.Nat,
    'date' : IDL.Text,
    'memo' : IDL.Text,
    'moodAfter' : IDL.Nat,
  });
  const MeditationRecordWithId = IDL.Record({
    'id' : IDL.Int,
    'record' : MeditationRecord,
  });
  const TreeState = IDL.Record({
    'personality' : IDL.Text,
    'cycleIndex' : IDL.Nat,
    'stayHere' : IDL.Bool,
    'cycleCompleteShown' : IDL.Bool,
  });
  
  return IDL.Service({
    'addRecord' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text],
        [IDL.Int],
        [],
      ),
    'deleteRecord' : IDL.Func([IDL.Int], [], []),
    'getAllRecordsWithIds' : IDL.Func(
        [],
        [IDL.Vec(MeditationRecordWithId)],
        ['query'],
      ),
    'getTotalMinutes' : IDL.Func([], [IDL.Nat], ['query']),
    'getTreeState' : IDL.Func([], [TreeState], ['query']),
    'setTreeState' : IDL.Func([IDL.Text, IDL.Nat, IDL.Bool, IDL.Bool], [], []),
  });
};

export const init = ({ IDL }) => { return []; };
