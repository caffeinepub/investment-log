import Int "mo:core/Int";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";



actor {
  type MeditationRecord = {
    date : Text;
    duration : Nat;
    moodBefore : Nat; // 1-5 scale
    moodAfter : Nat; // 1-5 scale
    memo : Text;
  };

  type MeditationRecordWithId = {
    id : Int;
    record : MeditationRecord;
  };

  let records = Map.empty<Int, MeditationRecord>();
  var nextId = 1;

  public shared ({ caller }) func addRecord(date : Text, duration : Nat, moodBefore : Nat, moodAfter : Nat, memo : Text) : async Int {
    assert (moodBefore >= 1 and moodBefore <= 5);
    assert (moodAfter >= 1 and moodAfter <= 5);

    let id = nextId;
    nextId += 1;
    let record : MeditationRecord = {
      date;
      duration;
      moodBefore;
      moodAfter;
      memo;
    };
    records.add(id, record);
    id;
  };

  public query ({ caller }) func getAllRecordsWithIds() : async [MeditationRecordWithId] {
    records.toArray().map(func((id, record)) { { id; record } });
  };

  public query ({ caller }) func getTotalMinutes() : async Nat {
    var total = 0;
    for ((_, record) in records.entries()) {
      total += record.duration;
    };
    total;
  };

  public shared ({ caller }) func deleteRecord(id : Int) : async () {
    if (not records.containsKey(id)) {
      Runtime.trap("Record with id " # id.toText() # " does not exist. ");
    };
    records.remove(id);
  };
};
