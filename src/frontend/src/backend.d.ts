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
export interface FeedbackEntry {
    id: bigint;
    name: string;
    message: string;
    timestamp: bigint;
}
export interface TreeState {
    personality: string;
    stayHere: boolean;
    cycleCompleteShown: boolean;
    cycleIndex: bigint;
}
export interface backendInterface {
    addRecord(date: string, duration: bigint, moodBefore: bigint, moodAfter: bigint, memo: string): Promise<bigint>;
    deleteRecord(id: bigint): Promise<void>;
    getAllFeedback(): Promise<Array<FeedbackEntry>>;
    getAllRecordsWithIds(): Promise<Array<MeditationRecordWithId>>;
    getTotalMinutes(): Promise<bigint>;
    getTreeState(): Promise<TreeState>;
    getVisitCount(): Promise<bigint>;
    recordVisit(): Promise<bigint>;
    setTreeState(personality: string, cycleIndex: bigint, stayHere: boolean, cycleCompleteShown: boolean): Promise<void>;
    submitFeedback(name: string, message: string): Promise<void>;
    updateRecord(id: bigint, duration: bigint, memo: string): Promise<void>;
}
