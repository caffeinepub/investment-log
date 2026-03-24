import type { MeditationRecordWithId } from "@/backend";
import PlantGrowth from "@/components/PlantGrowth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddRecord,
  useDeleteRecord,
  useGetAllRecords,
  useGetTotalMinutes,
} from "@/hooks/useQueries";
import { Clock, Droplets, Flame, Loader2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const MOOD_EMOJI: Record<number, string> = {
  1: "😔",
  2: "😐",
  3: "🙂",
  4: "😊",
  5: "😌",
};

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

function computeStreak(records: MeditationRecordWithId[]): number {
  if (records.length === 0) return 0;
  const uniqueDates = [...new Set(records.map((r) => r.record.date))].sort(
    (a, b) => b.localeCompare(a),
  );
  const today = getTodayStr();
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  let startDate = today;
  if (!uniqueDates.includes(today)) {
    if (uniqueDates.includes(yesterday)) {
      startDate = yesterday;
    } else {
      return 0;
    }
  }

  let streak = 0;
  const current = new Date(startDate);
  for (const date of uniqueDates) {
    const curr = current.toISOString().slice(0, 10);
    if (date === curr) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else if (date < curr) {
      break;
    }
  }
  return streak;
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

function MeditationTimer() {
  const [targetMinutes, setTargetMinutes] = useState(10);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [remaining, setRemaining] = useState(10 * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

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

  function handleStart() {
    if (status === "idle") {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      setRemaining(targetMinutes * 60);
    }
    setStatus("running");
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setStatus("finished");
          playAlarm(audioCtxRef);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handlePause() {
    clearTimer();
    setStatus("paused");
  }

  function handleReset() {
    clearTimer();
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

        {/* Circular progress ring + time display */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-44 h-44">
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <title>タイマー進捗</title>
              {/* Track */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-secondary"
              />
              {/* Progress */}
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
                {/* Duration input (only when idle) */}
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

                {/* Buttons */}
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

function MoodSelector({
  value,
  onChange,
  label,
  ocidPrefix,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  ocidPrefix: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            data-ocid={`${ocidPrefix}.toggle`}
            onClick={() => onChange(n)}
            className={`flex-1 py-2 rounded-lg text-lg transition-all duration-150 border ${
              value === n
                ? "bg-primary border-primary shadow-sm scale-105"
                : "bg-card border-border hover:border-primary/50 hover:bg-secondary/50"
            }`}
          >
            <span className="text-base">{MOOD_EMOJI[n]}</span>
          </button>
        ))}
      </div>
    </div>
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
  const [moodBefore, setMoodBefore] = useState(3);
  const [moodAfter, setMoodAfter] = useState(3);
  const [memo, setMemo] = useState("");

  const { data: records = [], isLoading: recordsLoading } = useGetAllRecords();
  const { data: totalMinutes = BigInt(0) } = useGetTotalMinutes();
  const addRecord = useAddRecord();
  const deleteRecord = useDeleteRecord();

  const streak = computeStreak(records);

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
        moodBefore: BigInt(moodBefore),
        moodAfter: BigInt(moodAfter),
        memo,
      });
      toast.success("記録を保存しました ✨");
      setDuration("");
      setMoodBefore(3);
      setMoodAfter(3);
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
            ocid="stats.streak.card"
            icon={<Flame className="w-5 h-5 text-primary" />}
            label="連続記録日数"
            value={String(streak)}
            unit="日"
          />
        </section>

        {/* Plant Growth */}
        <section data-ocid="plant.section">
          <div className="bg-card rounded-2xl shadow-card p-6 flex flex-col items-center gap-2">
            <h2 className="text-base font-semibold text-foreground mb-2">
              あなたの植物
            </h2>
            <PlantGrowth totalMinutes={Number(totalMinutes)} />
          </div>
        </section>

        {/* Timer */}
        <MeditationTimer />

        {/* Form */}
        <section>
          <div className="bg-card rounded-2xl shadow-card p-6">
            <h2 className="text-base font-semibold text-foreground mb-6">
              瞑想記録を追加
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
                <MoodSelector
                  value={moodBefore}
                  onChange={setMoodBefore}
                  label="瞑想前の気分"
                  ocidPrefix="form.mood_before"
                />
                <MoodSelector
                  value={moodAfter}
                  onChange={setMoodAfter}
                  label="瞑想後の気分"
                  ocidPrefix="form.mood_after"
                />
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
                    {/* Date + duration */}
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

                    {/* Divider */}
                    <div className="w-px self-stretch bg-border" />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <span className="text-base">
                          {MOOD_EMOJI[Number(item.record.moodBefore)]}
                        </span>
                        <span className="text-muted-foreground text-xs">→</span>
                        <span className="text-base">
                          {MOOD_EMOJI[Number(item.record.moodAfter)]}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          気分 {Number(item.record.moodBefore)} →{" "}
                          {Number(item.record.moodAfter)}
                        </span>
                      </div>
                      {item.record.memo && (
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {item.record.memo}
                        </p>
                      )}
                    </div>

                    {/* Delete */}
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
    </div>
  );
}
