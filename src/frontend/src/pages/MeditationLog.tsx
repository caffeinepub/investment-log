import type { MeditationRecordWithId } from "@/backend";
import CycleCompleteModal from "@/components/CycleCompleteModal";
import PersonalitySelectScreen from "@/components/PersonalitySelectScreen";
import PlantGrowth, { type TreePersonality } from "@/components/PlantGrowth";
import { WhisperBubble } from "@/components/WhisperBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddRecord,
  useDeleteRecord,
  useGetAllRecords,
  useGetTotalMinutes,
  useGetTreeState,
  useSetTreeState,
  useSubmitFeedback,
} from "@/hooks/useQueries";
import { useLanguage } from "@/i18n";
import { rollWhisper } from "@/lib/whisperPhrases";
import ReviewPage from "@/pages/ReviewPage";
import { CalendarDays, Clock, Droplets, Loader2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const PERSONALITY_ORDER: TreePersonality[] = ["star", "flow", "empress"];
const TIMER_STORAGE_KEY = "meditationTimerState";
const TREE_STATE_STORAGE_KEY = "meditationTreeState";

type PersistedTimerState = {
  status: "running" | "paused";
  startTime: number;
  remainingAtStart: number;
  targetMinutes: number;
};

function vibrate(pattern: number | number[]) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

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
  const { t } = useLanguage();
  const [targetMinutes, setTargetMinutes] = useState(10);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [remaining, setRemaining] = useState(10 * 60);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const remainingAtStartRef = useRef<number>(0);
  const statusRef = useRef<TimerStatus>("idle");
  const elapsedMinutesRef = useRef<number>(0);
  const targetMinutesRef = useRef<number>(10);

  const totalSeconds = targetMinutes * 60;
  const progress =
    status === "idle" ? 0 : ((totalSeconds - remaining) / totalSeconds) * 100;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current === null) return;
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const newRemaining = Math.max(0, remainingAtStartRef.current - elapsed);
      setRemaining(newRemaining);
      if (newRemaining === 0) {
        clearTimer();
        localStorage.removeItem(TIMER_STORAGE_KEY);
        setStatus("finished");
        playAlarm(audioCtxRef);
        vibrate([100, 50, 100, 50, 100]);
        elapsedMinutesRef.current = targetMinutesRef.current;
        onElapsedMinutes?.(targetMinutesRef.current);
      }
    }, 500);
  }, [clearTimer, onElapsedMinutes]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only
  useEffect(() => {
    const raw = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return;
    try {
      const saved: PersistedTimerState = JSON.parse(raw);
      if (saved.status === "running") {
        const elapsed = Math.floor((Date.now() - saved.startTime) / 1000);
        const restoredRemaining = Math.max(0, saved.remainingAtStart - elapsed);
        targetMinutesRef.current = saved.targetMinutes;
        setTargetMinutes(saved.targetMinutes);
        if (restoredRemaining > 0) {
          remainingAtStartRef.current = saved.remainingAtStart;
          startTimeRef.current = saved.startTime;
          setRemaining(restoredRemaining);
          setStatus("running");
          startInterval();
        } else {
          // Finished while page was away
          localStorage.removeItem(TIMER_STORAGE_KEY);
          setStatus("finished");
          setRemaining(0);
          playAlarm(audioCtxRef);
          vibrate([100, 50, 100, 50, 100]);
          onElapsedMinutes?.(saved.targetMinutes);
        }
      } else if (saved.status === "paused") {
        targetMinutesRef.current = saved.targetMinutes;
        setTargetMinutes(saved.targetMinutes);
        setRemaining(saved.remainingAtStart);
        setStatus("paused");
      }
    } catch {
      localStorage.removeItem(TIMER_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    targetMinutesRef.current = targetMinutes;
  }, [targetMinutes]);

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
          localStorage.removeItem(TIMER_STORAGE_KEY);
          setStatus("finished");
          playAlarm(audioCtxRef);
          vibrate([100, 50, 100, 50, 100]);
          elapsedMinutesRef.current = targetMinutesRef.current;
          onElapsedMinutes?.(targetMinutesRef.current);
        }
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearTimer, onElapsedMinutes]);

  function handleStart() {
    let initialRemaining: number;
    if (status === "idle") {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      initialRemaining = targetMinutes * 60;
      setRemaining(initialRemaining);
      remainingAtStartRef.current = initialRemaining;
    } else {
      initialRemaining = remaining;
      remainingAtStartRef.current = remaining;
    }
    const now = Date.now();
    startTimeRef.current = now;
    targetMinutesRef.current = targetMinutes;
    setStatus("running");

    const persisted: PersistedTimerState = {
      status: "running",
      startTime: now,
      remainingAtStart: remainingAtStartRef.current,
      targetMinutes,
    };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(persisted));

    startInterval();
  }

  function handlePause() {
    clearTimer();
    startTimeRef.current = null;
    setStatus("paused");

    const persisted: PersistedTimerState = {
      status: "paused",
      startTime: 0,
      remainingAtStart: remaining,
      targetMinutes,
    };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(persisted));

    // Auto-fill with elapsed time so far
    const elapsed = Math.floor((totalSeconds - remaining) / 60);
    if (elapsed > 0) {
      onElapsedMinutes?.(elapsed);
    }
  }

  function handleReset() {
    clearTimer();
    startTimeRef.current = null;
    localStorage.removeItem(TIMER_STORAGE_KEY);
    setStatus("idle");
    setRemaining(targetMinutes * 60);
  }

  function handleTargetChange(v: number) {
    const clamped = Math.max(1, v);
    setTargetMinutes(clamped);
    targetMinutesRef.current = clamped;
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
          {t("timerTitle")}
        </h2>
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-44 h-44">
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <title>{t("timerTitle")}</title>
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
                      ? t("timerReady")
                      : status === "running"
                        ? t("timerRunning")
                        : t("timerPaused")}
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
                {t("timerDone")}
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
                      {t("timerDurationLabel")}
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
                      {status === "paused" ? t("timerResume") : t("timerStart")}
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePause}
                      variant="outline"
                      className="rounded-xl px-6"
                      data-ocid="timer.secondary_button"
                    >
                      {t("timerPause")}
                    </Button>
                  )}
                  {status !== "idle" && (
                    <Button
                      onClick={handleReset}
                      variant="ghost"
                      className="rounded-xl px-6 text-muted-foreground"
                      data-ocid="timer.cancel_button"
                    >
                      {t("timerReset")}
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
              {t("timerReset")}
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

function FeedbackSheet() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const submitFeedback = useSubmitFeedback();

  async function handleSubmit() {
    if (!message.trim()) return;
    try {
      await submitFeedback.mutateAsync({
        name: name.trim(),
        message: message.trim(),
      });
      toast.success(t("feedbackSuccess"));
      setOpen(false);
      setName("");
      setMessage("");
    } catch {
      toast.error("Error");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          data-ocid="feedback.open_modal_button"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          {t("feedbackButton")}
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-sm font-medium text-left">
            {t("feedbackButton")}
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-3">
          <Input
            data-ocid="feedback.input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("feedbackName")}
            className="text-sm"
          />
          <Textarea
            data-ocid="feedback.textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("feedbackMessage")}
            rows={4}
            className="text-sm resize-none"
          />
          <Button
            data-ocid="feedback.submit_button"
            onClick={handleSubmit}
            disabled={!message.trim() || submitFeedback.isPending}
            size="sm"
            className="w-full"
          >
            {submitFeedback.isPending ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                {t("feedbackSending")}
              </>
            ) : (
              t("feedbackSend")
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function MeditationLog() {
  const { t, lang, setLang } = useLanguage();
  const today = getTodayStr();
  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState("");
  const [memo, setMemo] = useState("");

  // Personality / cycle state — synced from backend
  const [personality, setPersonality] = useState<TreePersonality | null>(null);
  const [stayHere, setStayHere] = useState<boolean>(false);
  const [cycleCompleteOpen, setCycleCompleteOpen] = useState(false);
  const [cycleTransition, setCycleTransition] = useState(false);
  const [whisperPhrase, setWhisperPhrase] = useState<string | null>(null);

  const { data: records = [], isLoading: recordsLoading } = useGetAllRecords();
  const { data: totalMinutes = BigInt(0) } = useGetTotalMinutes();
  const { data: treeState } = useGetTreeState();
  const addRecord = useAddRecord();
  const deleteRecord = useDeleteRecord();
  const setTreeState = useSetTreeState();

  // On mount: restore personality from localStorage before backend arrives
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only effect
  useEffect(() => {
    const raw = localStorage.getItem(TREE_STATE_STORAGE_KEY);
    if (!raw) return;
    try {
      const cached = JSON.parse(raw);
      if (cached.personality && personality === null) {
        setPersonality(cached.personality);
        setStayHere(cached.stayHere ?? false);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Sync personality and stayHere from backend on load
  useEffect(() => {
    if (treeState) {
      // Write to localStorage cache
      localStorage.setItem(
        TREE_STATE_STORAGE_KEY,
        JSON.stringify({
          personality: treeState.personality,
          stayHere: treeState.stayHere,
          cycleIndex: String(treeState.cycleIndex),
        }),
      );
      const p = treeState.personality;
      if (p === "star" || p === "flow" || p === "empress") {
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
  const levelUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup level-up timer on unmount
  useEffect(() => {
    return () => {
      if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current);
    };
  }, []);

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
        vibrate([80, 40, 80]);
        if (levelUpTimerRef.current) clearTimeout(levelUpTimerRef.current);
        levelUpTimerRef.current = setTimeout(() => setLevelUpStage(null), 3500);
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
      toast.error(t("formErrorRequired"));
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
      toast.success(t("formSuccess"));
      vibrate(50);
      if (personality) {
        const phrase = rollWhisper(stage, personality);
        if (phrase) setWhisperPhrase(phrase);
      }
      setDuration("");
      setMemo("");
      setDate(today);
    } catch {
      toast.error(t("formErrorSave"));
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteRecord.mutateAsync(id);
      toast.success(t("deleteSuccess"));
    } catch {
      toast.error(t("deleteError"));
    }
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
            {t("appTitle")}
          </h1>
          <button
            type="button"
            onClick={() => setLang(lang === "ja" ? "en" : "ja")}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary"
            data-ocid="header.lang.toggle"
          >
            <span className="text-muted-foreground">{t("langToggle")}:</span>
            <span className="font-medium text-foreground ml-1">
              {lang === "ja" ? "日本語" : "English"}
            </span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="record" className="w-full">
          <TabsList className="w-full mb-6 rounded-xl" data-ocid="main.tab">
            <TabsTrigger
              value="record"
              className="flex-1 rounded-lg"
              data-ocid="main.record.tab"
            >
              {t("tabRecord")}
            </TabsTrigger>
            <TabsTrigger
              value="review"
              className="flex-1 rounded-lg"
              data-ocid="main.review.tab"
            >
              {t("tabReview")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="space-y-8 mt-0">
            {/* Stats */}
            <section
              className="grid grid-cols-2 gap-4"
              data-ocid="stats.section"
            >
              <StatCard
                ocid="stats.total_time.card"
                icon={<Clock className="w-5 h-5 text-primary" />}
                label={t("statsTotalTime")}
                value={formatDuration(totalMinutes)}
              />
              <StatCard
                ocid="stats.days.card"
                icon={<CalendarDays className="w-5 h-5 text-primary" />}
                label={t("statsDays")}
                value={String(totalDays)}
                unit={t("statsDaysUnit")}
              />
            </section>

            {/* Plant Growth */}
            <section data-ocid="plant.section">
              <div className="bg-card rounded-2xl shadow-card p-6 flex flex-col items-center gap-2">
                <div className="w-full mb-2">
                  <h2 className="text-base font-semibold text-foreground">
                    {t("yourTree")}
                  </h2>
                </div>
                <PlantGrowth
                  totalMinutes={totalMin}
                  personality={personality}
                  stayHere={stayHere}
                />
                <WhisperBubble
                  phrase={whisperPhrase}
                  onDone={() => setWhisperPhrase(null)}
                />
              </div>
            </section>

            {/* Timer */}
            <MeditationTimer onElapsedMinutes={handleTimerElapsed} />

            {/* Form */}
            <section>
              <div className="bg-card rounded-2xl shadow-card p-6">
                <h2 className="text-base font-semibold text-foreground mb-6">
                  {t("formTitle")}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm font-medium">
                        {t("formDate")}
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
                        {t("formDuration")}
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        min={1}
                        placeholder={t("formDurationPlaceholder")}
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="rounded-lg border-border"
                        data-ocid="form.duration.input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="memo" className="text-sm font-medium">
                      {t("formMemo")}
                    </Label>
                    <Textarea
                      id="memo"
                      placeholder={t("formMemoPlaceholder")}
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
                        {t("formSaving")}
                      </>
                    ) : (
                      t("formSubmit")
                    )}
                  </Button>
                </form>
              </div>
            </section>

            {/* Records list */}
            <section>
              <h2 className="text-base font-semibold text-foreground mb-4">
                {t("pastRecords")}
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
                    {t("emptyStateTitle")}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {t("emptyStateSubtitle")}
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
                              <span className="text-xs font-normal">
                                {t("durationUnit")}
                              </span>
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
                              {t("noMemo")}
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
          </TabsContent>

          <TabsContent value="review" className="mt-0">
            <ReviewPage records={records} totalMinutes={totalMinutes} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-muted-foreground space-y-3">
        <FeedbackSheet />
        <div>
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </div>
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
                {t("levelUpTitle")}
              </p>
              <p className="text-base text-foreground">
                段階 {levelUpStage} {t("levelUpOf")}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t("levelUpSubtitle")}
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
                {t("cycleTransitionTitle")}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("cycleTransitionBody")}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
