import Int "mo:core/Int";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

actor {
  type MeditationRecord = {
    date : Text;
    duration : Nat;
    moodBefore : Nat;
    moodAfter : Nat;
    memo : Text;
  };

  type MeditationRecordWithId = {
    id : Int;
    record : MeditationRecord;
  };

  type TreeState = {
    personality : Text;
    cycleIndex : Nat;
    stayHere : Bool;
    cycleCompleteShown : Bool;
  };

  type FeedbackEntry = {
    id : Int;
    name : Text;
    message : Text;
    timestamp : Int;
  };

  // Stable storage for records (persists across upgrades)
  stable var stableRecords : [(Int, MeditationRecord)] = [];
  stable var nextId : Int = 1;

  stable var treePersonality : Text = "";
  stable var treeCycleIndex : Nat = 0;
  stable var treeStayHere : Bool = false;
  stable var treeCycleCompleteShown : Bool = false;

  stable var visitCount : Nat = 0;

  // Stable storage for feedbacks
  stable var stableFeedbacks : [(Int, FeedbackEntry)] = [];
  stable var nextFeedbackId : Int = 1;

  // In-memory maps (rebuilt from stable storage on upgrade)
  let records = Map.empty<Int, MeditationRecord>();
  let feedbacks = Map.empty<Int, FeedbackEntry>();

  // Restore data from stable storage after upgrade
  system func postupgrade() {
    for ((id, record) in stableRecords.vals()) {
      records.add(id, record);
    };
    for ((id, entry) in stableFeedbacks.vals()) {
      feedbacks.add(id, entry);
    };
  };

  // Save data to stable storage before upgrade
  system func preupgrade() {
    stableRecords := records.toArray();
    stableFeedbacks := feedbacks.toArray();
  };

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
    stableRecords := records.toArray();
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
    stableRecords := records.toArray();
  };

  public query func getTreeState() : async TreeState {
    {
      personality = treePersonality;
      cycleIndex = treeCycleIndex;
      stayHere = treeStayHere;
      cycleCompleteShown = treeCycleCompleteShown;
    };
  };

  public shared func setTreeState(personality : Text, cycleIndex : Nat, stayHere : Bool, cycleCompleteShown : Bool) : async () {
    treePersonality := personality;
    treeCycleIndex := cycleIndex;
    treeStayHere := stayHere;
    treeCycleCompleteShown := cycleCompleteShown;
  };

  public shared func recordVisit() : async Nat {
    visitCount += 1;
    visitCount;
  };

  public query func getVisitCount() : async Nat {
    visitCount;
  };

  public shared func submitFeedback(name : Text, message : Text) : async () {
    let id = nextFeedbackId;
    nextFeedbackId += 1;
    let entry : FeedbackEntry = {
      id;
      name;
      message;
      timestamp = Time.now();
    };
    feedbacks.add(id, entry);
    stableFeedbacks := feedbacks.toArray();
  };

  public query func getAllFeedback() : async [FeedbackEntry] {
    feedbacks.toArray().map(func((_, entry)) { entry });
  };
};
