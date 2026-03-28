import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MeditationRecordWithId {
    id: bigint;
    record: MeditationRecord;
}
export interface MeditationRecord {
    duration: bigint;
    moodBefore: bigint;
    date: string;
    memo: string;
    moodAfter: bigint;
}
export interface TreeState {
    personality: string;
    cycleIndex: bigint;
    stayHere: boolean;
    cycleCompleteShown: boolean;
}
export interface FeedbackEntry {
    id: bigint;
    name: string;
    message: string;
    timestamp: bigint;
}
export interface backendInterface {
    addRecord(date: string, duration: bigint, moodBefore: bigint, moodAfter: bigint, memo: string): Promise<bigint>;
    updateRecord(id: bigint, duration: bigint, memo: string): Promise<void>;
    deleteRecord(id: bigint): Promise<void>;
    getAllRecordsWithIds(): Promise<Array<MeditationRecordWithId>>;
    getTotalMinutes(): Promise<bigint>;
    getTreeState(): Promise<TreeState>;
    setTreeState(personality: string, cycleIndex: bigint, stayHere: boolean, cycleCompleteShown: boolean): Promise<void>;
    recordVisit(): Promise<bigint>;
    getVisitCount(): Promise<bigint>;
    submitFeedback(name: string, message: string): Promise<void>;
    getAllFeedback(): Promise<Array<FeedbackEntry>>;
}
