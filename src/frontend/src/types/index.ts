export interface MeditationRecord {
  date: string;
  duration: bigint;
  memo: string;
  moodBefore: bigint;
  moodAfter: bigint;
}

export interface MeditationRecordWithId {
  id: bigint;
  record: MeditationRecord;
}
