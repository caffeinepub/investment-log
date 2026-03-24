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
export interface backendInterface {
    addRecord(date: string, duration: bigint, moodBefore: bigint, moodAfter: bigint, memo: string): Promise<bigint>;
    deleteRecord(id: bigint): Promise<void>;
    getAllRecordsWithIds(): Promise<Array<MeditationRecordWithId>>;
    getTotalMinutes(): Promise<bigint>;
}
