import type { MeditationRecordWithId } from "@/backend";
import CycleCompleteModal from "@/components/CycleCompleteModal";
import PersonalitySelectScreen from "@/components/PersonalitySelectScreen";
import PlantGrowth, { type TreePersonality } from "@/components/PlantGrowth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddRecord,
  useDeleteRecord,
  useGetAllRecords,
  useGetTotalMinutes,
  useGetTreeState,
  useSetTreeState,
} from "@/hooks/useQueries";
import { CalendarDays, Clock, Droplets, Loader2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const PERSONALITY_ORDER: TreePersonality[] = ["star", "foolish", "empress"];

function formatDuration(minutes: bigint): string {
  const m = Number(minutes);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem > 0 ? `${h} 時間 ${rem} 分` : `${h} 時間`;
  }
  return `${m} 分`;
}

function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function computeTotalDays(records: MeditationRecordWithId[]): number {
  if (records.length === 0) return 0;
  return new Set(records.map((r) => r.record.date)).size;
}

function playAlarm(audioCtxRef: React.MutableRefObject<AudioContext | null>) {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new AudioContext();
  }
  const ctx = audioCtxRef.current;
  const tones = [
    { freq: 528, start: 0, duration: 0.5 },
    { freq: 660, start: 0.55, duration: 0.5 },
    { freq: 880, start: 1.1, duration: 0.6 },
  ];
  for (const tone of tones) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(tone.freq, ctx.currentTime + tone.start);
    gain.gain.setValueAtTime(0, ctx.currentTime + tone.start);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + tone.start + 0.02);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + tone.start + tone.duration,
    );
    osc.start(ctx.currentTime + tone.start);
    osc.stop(ctx.currentTime + tone.start + tone.duration + 0.01);
  }
}

type TimerStatus = "idle" | "running" | "paused" | "finished";

function MeditationTimer({
  onElapsedMinutes,
}: {
  onElapsedMinutes?: (minutes: number) => void;
}) {
  const [targetMinutes, setTargetMinutes] = useState(10);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [remaining, setRemaining] = useState(10 * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const remainingAtStartRef = useRef<number>(0);
  const statusRef = useRef<TimerStatus>("idle");
  const elapsedMinutesRef = useRef<number>(0);

  const totalSeconds = targetMinutes * 60;
  const progress =
    status === "idle" ? 0 : ((totalSeconds - remaining) / totalSeconds) * 100;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (
        document.visibilityState === "visible" &&
        statusRef.current === "running" &&
        startTimeRef.current !== null
      ) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const newRemaining = Math.max(0, remainingAtStartRef.current - elapsed);
        setRemaining(newRemaining);
        if (newRemaining === 0) {
          clearTimer();
          setStatus("finished");
          playAlarm(audioCtxRef);
          elapsedMinutesRef.current = targetMinutes;
          onElapsedMinutes?.(targetMinutes);
        }
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearTimer, onElapsedMinutes, targetMinutes]);

  function handleStart() {
    if (status === "idle") {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const initialRemaining = targetMinutes * 60;
      setRemaining(initialRemaining);
      remainingAtStartRef.current = initialRemaining;
    } else {
      remainingAtStartRef.current = remaining;
    }
    startTimeRef.current = Date.now();
    setStatus("running");

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current === null) return;
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const newRemaining = Math.max(0, remainingAtStartRef.current - elapsed);
      setRemaining(newRemaining);
      if (newRemaining <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setStatus("finished");
        playAlarm(audioCtxRef);
        elapsedMinutesRef.current = targetMinutes;
        onElapsedMinutes?.(targetMinutes);
      }
    }, 1000);
  }

  function handlePause() {
    clearTimer();
    startTimeRef.current = null;
    setStatus("paused");
    // Auto-fill with elapsed time so far
    const elapsed = Math.floor((totalSeconds - remaining) / 60);
    if (elapsed > 0) {
      onElapsedMinutes?.(elapsed);
    }
  }

  function handleReset() {
    clearTimer();
    startTimeRef.current = null;
    setStatus("idle");
    setRemaining(targetMinutes * 60);
  }

  function handleTargetChange(v: number) {
    const clamped = Math.max(1, v);
    setTargetMinutes(clamped);
    if (status === "idle") {
      setRemaining(clamped * 60);
    }
  }

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <section>
      <div className="bg-card rounded-2xl shadow-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-6">
          瞑想タイマー
        </h2>
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-44 h-44">
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <title>タイマー進捗</title>
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-secondary"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                className="text-primary transition-all duration-500"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              {status === "finished" ? (
                <span className="text-4xl">🙏</span>
              ) : (
                <>
                  <span
                    className="text-5xl font-bold text-primary leading-none tracking-tight"
                    data-ocid="timer.display"
                  >
                    {mm}:{ss}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {status === "idle"
                      ? "準備中"
                      : status === "running"
                        ? "瞑想中"
                        : "一時停止中"}
                  </span>
                </>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {status === "finished" ? (
              <motion.p
                key="done"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-base font-medium text-primary text-center"
              >
                お疲れさまでした 🙏
              </motion.p>
            ) : (
              <motion.div
                key="controls"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full space-y-4"
              >
                {status === "idle" && (
                  <div className="flex items-center justify-center gap-3">
                    <Label
                      htmlFor="timer-minutes"
                      className="text-sm text-muted-foreground whitespace-nowrap"
                    >
                      時間（分）
                    </Label>
                    <Input
                      id="timer-minutes"
                      type="number"
                      min={1}
                      max={120}
                      value={targetMinutes}
                      onChange={(e) =>
                        handleTargetChange(Number(e.target.value))
                      }
                      className="w-20 text-center rounded-lg border-border"
                      data-ocid="timer.duration.input"
                    />
                  </div>
                )}
                <div className="flex gap-3 justify-center">
                  {status !== "running" ? (
                    <Button
                      onClick={handleStart}
                      className="rounded-xl px-6 bg-primary text-primary-foreground hover:bg-primary/90"
                      data-ocid="timer.primary_button"
                    >
                      {status === "paused" ? "再開" : "開始"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePause}
                      variant="outline"
                      className="rounded-xl px-6"
                      data-ocid="timer.secondary_button"
                    >
                      一時停止
                    </Button>
                  )}
                  {status !== "idle" && (
                    <Button
                      onClick={handleReset}
                      variant="ghost"
                      className="rounded-xl px-6 text-muted-foreground"
                      data-ocid="timer.cancel_button"
                    >
                      リセット
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {status === "finished" && (
            <Button
              onClick={handleReset}
              variant="outline"
              className="rounded-xl px-6"
              data-ocid="timer.cancel_button"
            >
              リセット
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
  ocid,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  ocid: string;
}) {
  return (
    <div
      data-ocid={ocid}
      className="bg-card rounded-2xl shadow-card p-6 flex items-start gap-4"
    >
      <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium mb-1">
          {label}
        </p>
        <p className="text-3xl font-bold text-primary leading-none">
          {value}
          {unit && (
            <span className="text-base font-medium text-muted-foreground ml-1">
              {unit}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export default function MeditationLog() {
  const today = getTodayStr();
  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState("");
  const [memo, setMemo] = useState("");

  // Personality / cycle state — synced from backend
  const [personality, setPersonality] = useState<TreePersonality | null>(null);
  const [stayHere, setStayHere] = useState<boolean>(false);
  const [cycleCompleteOpen, setCycleCompleteOpen] = useState(false);
  const [cycleTransition, setCycleTransition] = useState(false);

  const { data: records = [], isLoading: recordsLoading } = useGetAllRecords();
  const { data: totalMinutes = BigInt(0) } = useGetTotalMinutes();
  const { data: treeState, isLoading: treeStateLoading } = useGetTreeState();
  const addRecord = useAddRecord();
  const deleteRecord = useDeleteRecord();
  const setTreeState = useSetTreeState();

  // Sync personality and stayHere from backend on load
  useEffect(() => {
    if (treeState) {
      const p = treeState.personality;
      if (p === "star" || p === "foolish" || p === "empress") {
        setPersonality(p);
      } else {
        setPersonality(null);
      }
      setStayHere(treeState.stayHere);
    }
  }, [treeState]);

  const totalDays = computeTotalDays(records);
  const totalMin = Number(totalMinutes);
  const stage = Math.min(Math.floor(totalMin / 20), 50);

  // Level-up celebration
  const prevStageRef = useRef<number | null>(null);
  const [levelUpStage, setLevelUpStage] = useState<number | null>(null);

  useEffect(() => {
    if (prevStageRef.current !== null && stage > prevStageRef.current) {
      if (stage === 50) {
        if (!treeState?.cycleCompleteShown) {
          setCycleCompleteOpen(true);
          // Mark cycleCompleteShown in backend
          if (personality) {
            setTreeState.mutate({
              personality,
              cycleIndex: BigInt(treeState ? Number(treeState.cycleIndex) : 0),
              stayHere,
              cycleCompleteShown: true,
            });
          }
        }
      } else {
        setLevelUpStage(stage);
        const t = setTimeout(() => setLevelUpStage(null), 3000);
        return () => clearTimeout(t);
      }
    }
    prevStageRef.current = stage;
  }, [stage, treeState, personality, stayHere, setTreeState]);

  async function handleSelectPersonality(p: TreePersonality) {
    setPersonality(p);
    await setTreeState.mutateAsync({
      personality: p,
      cycleIndex: BigInt(0),
      stayHere: false,
      cycleCompleteShown: false,
    });
  }

  async function handleStayHere() {
    setStayHere(true);
    setCycleCompleteOpen(false);
    if (personality) {
      await setTreeState.mutateAsync({
        personality,
        cycleIndex: BigInt(treeState ? Number(treeState.cycleIndex) : 0),
        stayHere: true,
        cycleCompleteShown: true,
      });
    }
  }

  async function handleNextCycle() {
    setCycleCompleteOpen(false);
    setCycleTransition(true);
    const currentCycleIndex = treeState ? Number(treeState.cycleIndex) : 0;
    const nextIndex = currentCycleIndex + 1;
    const nextPersonality =
      PERSONALITY_ORDER[nextIndex % PERSONALITY_ORDER.length];
    await setTreeState.mutateAsync({
      personality: nextPersonality,
      cycleIndex: BigInt(nextIndex),
      stayHere: false,
      cycleCompleteShown: false,
    });
    setTimeout(() => {
      setPersonality(nextPersonality);
      setStayHere(false);
      setCycleTransition(false);
    }, 2800);
  }

  function handleTimerElapsed(minutes: number) {
    setDuration(String(minutes));
  }

  const sortedRecords = [...records].sort((a, b) => {
    const dateCmp = b.record.date.localeCompare(a.record.date);
    if (dateCmp !== 0) return dateCmp;
    return Number(b.id - a.id);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dur = Number.parseInt(duration);
    if (!date || Number.isNaN(dur) || dur < 1) {
      toast.error("日付と瞑想時間を入力してください");
      return;
    }
    try {
      await addRecord.mutateAsync({
        date,
        duration: BigInt(dur),
        moodBefore: BigInt(3),
        moodAfter: BigInt(3),
        memo,
      });
      toast.success("記録を保存しました ✨");
      setDuration("");
      setMemo("");
      setDate(today);
    } catch {
      toast.error("保存に失敗しました。もう一度お試しください。");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteRecord.mutateAsync(id);
      toast.success("記録を削除しました");
    } catch {
      toast.error("削除に失敗しました。");
    }
  }

  // Show loading while tree state is being fetched
  if (treeStateLoading) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="app.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show personality select if not chosen yet
  if (!personality || treeState?.personality === "") {
    return <PersonalitySelectScreen onSelect={handleSelectPersonality} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <Droplets className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">
            Meditation Log
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-4" data-ocid="stats.section">
          <StatCard
            ocid="stats.total_time.card"
            icon={<Clock className="w-5 h-5 text-primary" />}
            label="合計瞑想時間"
            value={formatDuration(totalMinutes)}
          />
          <StatCard
            ocid="stats.days.card"
            icon={<CalendarDays className="w-5 h-5 text-primary" />}
            label="記録した日数"
            value={String(totalDays)}
            unit="日"
          />
        </section>

        {/* Plant Growth */}
        <section data-ocid="plant.section">
          <div className="bg-card rounded-2xl shadow-card p-6 flex flex-col items-center gap-2">
            <div className="w-full mb-2">
              <h2 className="text-base font-semibold text-foreground">
                あなたの木
              </h2>
            </div>
            <PlantGrowth
              totalMinutes={totalMin}
              personality={personality}
              stayHere={stayHere}
            />
          </div>
        </section>

        {/* Timer */}
        <MeditationTimer onElapsedMinutes={handleTimerElapsed} />

        {/* Form */}
        <section>
          <div className="bg-card rounded-2xl shadow-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-6">
              瞑想記録を追加
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium">
                    日付
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="rounded-lg border-border"
                    data-ocid="form.date.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium">
                    瞑想時間（分）
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    placeholder="例: 10"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="rounded-lg border-border"
                    data-ocid="form.duration.input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo" className="text-sm font-medium">
                  メモ（任意）
                </Label>
                <Textarea
                  id="memo"
                  placeholder="今日の瞑想について、気づいたことなど…"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows={3}
                  className="rounded-lg border-border resize-none"
                  data-ocid="form.memo.textarea"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium"
                disabled={addRecord.isPending}
                data-ocid="form.submit_button"
              >
                {addRecord.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中…
                  </>
                ) : (
                  "記録を保存する"
                )}
              </Button>
            </form>
          </div>
        </section>

        {/* Records list */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-4">
            過去の記録
          </h2>

          {recordsLoading ? (
            <div
              className="flex justify-center py-12"
              data-ocid="records.loading_state"
            >
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : sortedRecords.length === 0 ? (
            <div
              className="bg-card rounded-2xl shadow-card p-10 text-center"
              data-ocid="records.empty_state"
            >
              <p className="text-4xl mb-3">🌿</p>
              <p className="text-muted-foreground text-sm">
                まだ記録がありません。
              </p>
              <p className="text-muted-foreground text-sm">
                最初の瞑想を記録しましょう。
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {sortedRecords.map((item, idx) => (
                  <motion.div
                    key={String(item.id)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2, delay: idx * 0.04 }}
                    data-ocid={`records.item.${idx + 1}`}
                    className="bg-card rounded-2xl shadow-card p-5 flex gap-4 items-start"
                  >
                    <div className="shrink-0 min-w-[80px] text-center">
                      <p className="text-xs font-semibold text-primary">
                        {item.record.date.slice(5).replace("-", "/")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.record.date.slice(0, 4)}
                      </p>
                      <div className="mt-2 bg-secondary rounded-lg px-2 py-1">
                        <p className="text-sm font-bold text-primary">
                          {Number(item.record.duration)}
                          <span className="text-xs font-normal">分</span>
                        </p>
                      </div>
                    </div>

                    <div className="w-px self-stretch bg-border" />

                    <div className="flex-1 min-w-0">
                      {item.record.memo ? (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {item.record.memo}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground/50 italic">
                          メモなし
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteRecord.isPending}
                      data-ocid={`records.delete_button.${idx + 1}`}
                      className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-40"
                      style={{ backgroundColor: "oklch(0.86 0.04 15)" }}
                      aria-label="削除"
                    >
                      <Trash2
                        className="w-4 h-4"
                        style={{ color: "oklch(0.45 0.08 15)" }}
                      />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>

      {/* Level-up celebration overlay */}
      <AnimatePresence>
        {levelUpStage !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-card border-2 border-primary rounded-3xl px-8 py-6 shadow-2xl text-center max-w-xs mx-4">
              <p className="text-3xl mb-2">✦</p>
              <p className="text-xl font-bold text-primary mb-1">
                成長しました！
              </p>
              <p className="text-base text-foreground">
                段階 {levelUpStage} / 50
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                木が育っています 🌿
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cycle Complete Modal */}
      <CycleCompleteModal
        open={cycleCompleteOpen}
        onStayHere={handleStayHere}
        onNextCycle={handleNextCycle}
      />

      {/* Cycle Transition Screen */}
      <AnimatePresence>
        {cycleTransition && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            data-ocid="cycle_transition.modal"
          >
            <motion.div
              className="text-center px-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.p
                className="text-5xl mb-8"
                animate={{ rotate: [0, 5, -5, 3, -3, 0], scale: [1, 1.1, 1] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 1,
                }}
              >
                🌱
              </motion.p>
              <p className="text-2xl font-semibold text-foreground mb-3 tracking-tight">
                新しい旅が始まります
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                これまでの歩みは、次の木の礎となります。
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
