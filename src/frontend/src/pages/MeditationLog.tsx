import type { MeditationRecordWithId } from "@/backend";
import CycleCompleteModal from "@/components/CycleCompleteModal";
import PersonalitySelectScreen from "@/components/PersonalitySelectScreen";
import PlantGrowth, { type TreePersonality } from "@/components/PlantGrowth";
import { WhisperBubble } from "@/components/WhisperBubble";
import ZenLoadingScreen from "@/components/ZenLoadingScreen";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useUpdateRecord,
} from "@/hooks/useQueries";
import { useLanguage } from "@/i18n";
import {
  empressPhrases,
  flowPhrases,
  rollWhisper,
  starPhrases,
} from "@/lib/whisperPhrases";
import ReviewPage from "@/pages/ReviewPage";
import {
  CalendarDays,
  Clock,
  Droplets,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  birthToUTC,
  getMoonAspect,
  getMoonEclipticLongitude,
  getZodiacInfo,
} from "../utils/moonAstrology";

const PERSONALITY_ORDER: TreePersonality[] = ["star", "flow", "empress"];
const TIMER_STORAGE_KEY = "meditationTimerState";
const TREE_STATE_STORAGE_KEY = "meditationTreeState";
const RECORDS_STORAGE_KEY = "meditationRecords";
const NATAL_DATA_KEY = "meditationNatalData";

// Serialize records to localStorage (convert BigInt to number)
function saveRecordsToLocalStorage(recs: MeditationRecordWithId[]) {
  try {
    const serializable = recs.map((r) => ({
      id: Number(r.id),
      record: {
        date: r.record.date,
        duration: Number(r.record.duration),
        memo: r.record.memo,
        moodBefore: Number(r.record.moodBefore),
        moodAfter: Number(r.record.moodAfter),
      },
    }));
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    /* ignore */
  }
}

// Deserialize records from localStorage
function loadRecordsFromLocalStorage(): MeditationRecordWithId[] {
  try {
    const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((r: any) => ({
      id: BigInt(r.id),
      record: {
        date: r.record.date,
        duration: BigInt(r.record.duration),
        memo: r.record.memo,
        moodBefore: BigInt(r.record.moodBefore),
        moodAfter: BigInt(r.record.moodAfter),
      },
    }));
  } catch {
    return [];
  }
}

type PersistedTimerState = {
  status: "running" | "paused";
  startTime: number;
  remainingAtStart: number;
  targetMinutes: number;
};

interface NatalData {
  birthDate: string; // "YYYY-MM-DD"
  birthTime: string; // "HH:MM"
  timezoneOffset: number; // hours, e.g. 9 for JST
}

function vibrate(pattern: number | number[]) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
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

// ソルフェジオ周波数：パーソナリティごとに異なる音
// Star  852Hz — 直感・霊的な明晰さ
// Flow  528Hz — 愛・奇跡
// Empress 396Hz — 不安感情からの解放
const PERSONALITY_FREQ: Record<string, number> = {
  star: 852,
  flow: 528,
  empress: 396,
};

function playOneBell(ctx: AudioContext, freq: number, startTime: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startTime);
  // シンギングボウルのように：静かに立ち上がり、ゆっくりと消えていく（7秒の余韻）
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.25, startTime + 0.1);
  gain.gain.setValueAtTime(0.25, startTime + 0.6);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 7.0);
  osc.start(startTime);
  osc.stop(startTime + 7.1);
}

function playAlarm(
  audioCtxRef: React.MutableRefObject<AudioContext | null>,
  personality: string,
) {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new AudioContext();
  }
  const ctx = audioCtxRef.current;
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  const freq = PERSONALITY_FREQ[personality] ?? 528;
  // 3回鳴らす：それぞれ8秒間隔、7秒の余韻
  playOneBell(ctx, freq, ctx.currentTime);
  playOneBell(ctx, freq, ctx.currentTime + 8);
  playOneBell(ctx, freq, ctx.currentTime + 16);
}

type TimerStatus = "idle" | "running" | "paused" | "finished";

function MeditationTimer({
  onElapsedMinutes,
  onTimerFinished,
  onWhisper,
  personality,
}: {
  onElapsedMinutes?: (minutes: number) => void;
  onTimerFinished?: () => void;
  onWhisper?: () => void;
  personality?: string;
}) {
  const { t, lang } = useLanguage();
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
  const onTimerFinishedRef = useRef(onTimerFinished);
  const onWhisperRef = useRef(onWhisper);
  const personalityRef = useRef(personality);
  // Wake lock
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wakeLockRef = useRef<any>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [wakeLockUnsupported, setWakeLockUnsupported] = useState(false);

  useEffect(() => {
    personalityRef.current = personality;
  }, [personality]);

  useEffect(() => {
    onTimerFinishedRef.current = onTimerFinished;
  }, [onTimerFinished]);

  useEffect(() => {
    onWhisperRef.current = onWhisper;
  }, [onWhisper]);

  const totalSeconds = targetMinutes * 60;
  const progress =
    status === "idle" ? 0 : ((totalSeconds - remaining) / totalSeconds) * 100;

  const requestWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;
    try {
      wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
      setWakeLockActive(true);
      wakeLockRef.current.addEventListener("release", () => {
        setWakeLockActive(false);
        wakeLockRef.current = null;
      });
    } catch {
      setWakeLockActive(false);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
    setWakeLockActive(false);
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleTimerZero = useCallback(
    (elapsedMinutes: number) => {
      clearTimer();
      releaseWakeLock();
      localStorage.removeItem(TIMER_STORAGE_KEY);
      setStatus("finished");
      playAlarm(audioCtxRef, personalityRef.current ?? "flow");
      vibrate([100, 50, 100, 50, 100]);
      elapsedMinutesRef.current = elapsedMinutes;
      onElapsedMinutes?.(elapsedMinutes);
      onTimerFinishedRef.current?.();
      onWhisperRef.current?.();
    },
    [clearTimer, releaseWakeLock, onElapsedMinutes],
  );

  const startInterval = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current === null) return;
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const newRemaining = Math.max(0, remainingAtStartRef.current - elapsed);
      setRemaining(newRemaining);
      if (newRemaining === 0) {
        handleTimerZero(targetMinutesRef.current);
      }
    }, 500);
  }, [clearTimer, handleTimerZero]);

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
          handleTimerZero(saved.targetMinutes);
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
        // Re-acquire wake lock after page becomes visible (auto-released when hidden)
        if (!wakeLockRef.current && "wakeLock" in navigator) {
          requestWakeLock();
        }
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const newRemaining = Math.max(0, remainingAtStartRef.current - elapsed);
        setRemaining(newRemaining);
        if (newRemaining === 0) {
          handleTimerZero(targetMinutesRef.current);
        }
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: requestWakeLock is stable
  }, [handleTimerZero, requestWakeLock]);

  function handleStart() {
    // Silently request notification permission when timer starts
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    // Request screen wake lock
    if (!("wakeLock" in navigator)) {
      setWakeLockUnsupported(true);
    } else {
      setWakeLockUnsupported(false);
      requestWakeLock();
    }

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
    releaseWakeLock();
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
    releaseWakeLock();
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
                <span className="text-4xl">☀️</span>
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

          {wakeLockActive && (
            <p
              className="text-xs text-center"
              style={{ color: "rgba(255,255,255,0.4)", marginTop: "0.25rem" }}
            >
              🌙 {lang === "ja" ? "画面オンを維持中" : "Screen kept awake"}
            </p>
          )}
          {wakeLockUnsupported && status === "running" && (
            <p
              className="text-xs text-center"
              style={{ color: "rgba(255,255,255,0.3)", marginTop: "0.25rem" }}
            >
              {lang === "ja"
                ? "iOSの場合は画面が消えないようにご設定ください"
                : "For best experience on iOS, keep the screen on manually"}
            </p>
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
  value: React.ReactNode;
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
        <p className="text-2xl font-bold text-primary leading-none">
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

async function showTimerNotification(lang: "ja" | "en") {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
  if (Notification.permission === "granted") {
    try {
      const reg = await navigator.serviceWorker.ready;
      const title =
        lang === "en" ? "Meditation complete ☀️" : "瞑想が終わりました ☀️";
      const body =
        lang === "en"
          ? "Gently, open your eyes."
          : "静かに、目を開けてください。";
      reg.showNotification(title, {
        body,
        icon: "/assets/generated/icon-512.dim_512x512.png",
        badge: "/assets/generated/icon-512.dim_512x512.png",
        silent: false,
      });
    } catch {
      // Service worker not available or notification failed — silent fail
    }
  }
}

export default function MeditationLog() {
  const { t, lang, setLang } = useLanguage();
  const today = getTodayStr();
  const [date, setDate] = useState(today);
  const [showZenLoader, setShowZenLoader] = useState(true);
  const [duration, setDuration] = useState("");
  const [memo, setMemo] = useState("");

  // Personality / cycle state — synced from backend
  const [personality, setPersonality] = useState<TreePersonality | null>(null);
  const [stayHere, setStayHere] = useState<boolean>(false);
  const [cycleCompleteOpen, setCycleCompleteOpen] = useState(false);
  const [cycleTransition, setCycleTransition] = useState(false);
  const [whisperPhrase, setWhisperPhrase] = useState<string | null>(null);
  const [moodSelection, setMoodSelection] = useState(3);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editDuration, setEditDuration] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [timerJustFinished, setTimerJustFinished] = useState(false);
  const hasShownFirstWhisperRef = useRef<boolean>(false);

  // Natal moon astrology state
  const [natalData, setNatalData] = useState<NatalData | null>(() => {
    try {
      const stored = localStorage.getItem(NATAL_DATA_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [showNatalModal, setShowNatalModal] = useState(false);
  const [natalFormDate, setNatalFormDate] = useState("");
  const [natalFormTime, setNatalFormTime] = useState("12:00");
  const [natalFormTz, setNatalFormTz] = useState(9);

  // Time-of-day sky gradient
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const id = setInterval(() => setCurrentHour(new Date().getHours()), 60000);
    return () => clearInterval(id);
  }, []);

  const skyGradient = useMemo(() => {
    const h = currentHour;
    if (h >= 0 && h < 4) return "linear-gradient(to bottom, #0a0f1e, #0d1530)";
    if (h < 6) return "linear-gradient(to bottom, #1a1035, #2d1f4a)";
    if (h < 7) return "linear-gradient(to bottom, #2a1a3e, #4a2d3a, #6b3d2e)";
    if (h < 10) return "linear-gradient(to bottom, #1a2a4a, #1e3558, #243d6a)";
    if (h < 14) return "linear-gradient(to bottom, #1b2d52, #1e3460, #22396b)";
    if (h < 17) return "linear-gradient(to bottom, #1e2a4a, #2a2040, #3a2535)";
    if (h < 19) return "linear-gradient(to bottom, #2d1a2e, #3d1f2a, #4a2820)";
    if (h < 21) return "linear-gradient(to bottom, #1a1535, #221845, #1e1640)";
    return "linear-gradient(to bottom, #1a1a3e, #0d1b2a)";
  }, [currentHour]);

  // Moon phase calculation (astronomical approximation)
  const moonPhase = useMemo(() => {
    const now = new Date();
    // Known new moon: Jan 6, 2000 18:14 UTC (J2000 epoch)
    const knownNewMoon = new Date("2000-01-06T18:14:00Z");
    const lunarCycle = 29.53058867; // days
    const elapsed =
      (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const age = ((elapsed % lunarCycle) + lunarCycle) % lunarCycle;
    let emoji: string;
    let key: string;
    if (age < 1.85) {
      emoji = "🌑";
      key = "moonPhaseNew";
    } else if (age < 7.38) {
      emoji = "🌒";
      key = "moonPhaseWaxingCrescent";
    } else if (age < 9.22) {
      emoji = "🌓";
      key = "moonPhaseFirstQuarter";
    } else if (age < 14.77) {
      emoji = "🌔";
      key = "moonPhaseWaxingGibbous";
    } else if (age < 16.61) {
      emoji = "🌕";
      key = "moonPhaseFull";
    } else if (age < 22.15) {
      emoji = "🌖";
      key = "moonPhaseWaningGibbous";
    } else if (age < 23.99) {
      emoji = "🌗";
      key = "moonPhaseLastQuarter";
    } else {
      emoji = "🌘";
      key = "moonPhaseWaningCrescent";
    }
    return { emoji, key, age: Math.floor(age) };
  }, []);

  const transitMoonLon = useMemo(
    () => getMoonEclipticLongitude(new Date()),
    [],
  );

  const natalMoonInfo = useMemo(() => {
    if (!natalData?.birthDate || !natalData?.birthTime) return null;
    try {
      const birthUTC = birthToUTC(
        natalData.birthDate,
        natalData.birthTime,
        natalData.timezoneOffset,
      );
      const natalLon = getMoonEclipticLongitude(birthUTC);
      const zodiac = getZodiacInfo(natalLon);
      const aspect = getMoonAspect(natalLon, transitMoonLon);
      return { zodiac, aspect, natalLon };
    } catch {
      return null;
    }
  }, [natalData, transitMoonLon]);

  const { data: backendRecords = [], isLoading: recordsLoading } =
    useGetAllRecords();
  const { data: totalMinutes = BigInt(0) } = useGetTotalMinutes();

  // localStorage backup: use backend data if available, otherwise fallback to localStorage
  const [localRecordsCache, setLocalRecordsCache] = useState<
    MeditationRecordWithId[]
  >(() => loadRecordsFromLocalStorage());

  // Sync backend records to localStorage and local cache
  useEffect(() => {
    if (!recordsLoading) {
      if (backendRecords.length > 0) {
        // Backend has data — save to localStorage as backup
        saveRecordsToLocalStorage(backendRecords);
        setLocalRecordsCache(backendRecords);
      }
      // If backend returned empty but localStorage has data, keep showing cached records
    }
  }, [backendRecords, recordsLoading]);

  // Use backend data if available, otherwise fall back to localStorage cache
  const records =
    backendRecords.length > 0 ? backendRecords : localRecordsCache;
  const { data: treeState } = useGetTreeState();
  const addRecord = useAddRecord();
  const deleteRecord = useDeleteRecord();
  const updateRecord = useUpdateRecord();
  const setTreeState = useSetTreeState();
  // Stable ref to avoid including setTreeState (mutation object) in effect deps
  const setTreeStateMutateRef = useRef<typeof setTreeState.mutate | null>(null);
  setTreeStateMutateRef.current = setTreeState.mutate;

  // Register service worker on mount
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

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
      const p = treeState.personality;
      const isValidPersonality =
        p === "star" || p === "flow" || p === "empress";

      if (isValidPersonality) {
        // Backend has a valid personality — write to localStorage and sync state
        localStorage.setItem(
          TREE_STATE_STORAGE_KEY,
          JSON.stringify({
            personality: p,
            stayHere: treeState.stayHere,
            cycleIndex: String(treeState.cycleIndex),
          }),
        );
        setPersonality(p);
      } else {
        // Backend returned empty — keep localStorage value, re-save personality to backend if we have one
        setPersonality((current) => {
          if (current) {
            // Re-sync the local value back to backend
            setTreeStateMutateRef.current?.({
              personality: current,
              cycleIndex: BigInt(treeState ? Number(treeState.cycleIndex) : 0),
              stayHere: treeState.stayHere,
              cycleCompleteShown: false,
            });
          }
          return current;
        });
      }
      setStayHere(treeState.stayHere);
    }
  }, [treeState]);

  const totalDays = computeTotalDays(records);
  const totalMin = Number(totalMinutes);
  const stage = Math.min(Math.floor(totalMin / 20), 50);

  // Level-up: only open cycle modal, no visual overlay
  const prevStageRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevStageRef.current !== null && stage > prevStageRef.current) {
      if (stage === 50) {
        if (!treeState?.cycleCompleteShown) {
          setCycleCompleteOpen(true);
          // Mark cycleCompleteShown in backend
          if (personality) {
            setTreeStateMutateRef.current?.({
              personality,
              cycleIndex: BigInt(treeState ? Number(treeState.cycleIndex) : 0),
              stayHere,
              cycleCompleteShown: true,
            });
          }
        }
      } else {
        // Subtle haptic only — no visual announcement
        vibrate([80, 40, 80]);
      }
    }
    prevStageRef.current = stage;
  }, [stage, treeState, personality, stayHere]);

  // Show whisper phrase once personality is loaded from backend
  useEffect(() => {
    if (personality && !hasShownFirstWhisperRef.current) {
      hasShownFirstWhisperRef.current = true;
      const phrase = rollWhisper(stage, personality);
      if (phrase) setWhisperPhrase(phrase);
    }
  }, [personality, stage]);

  // Show whisper phrase when returning to the app
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible" && personality) {
        const phrase = rollWhisper(stage, personality);
        if (phrase) setWhisperPhrase(phrase);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [personality, stage]);

  async function handleSelectPersonality(p: TreePersonality) {
    setPersonality(p);
    // Write to localStorage immediately so next load can restore without waiting for backend
    localStorage.setItem(
      TREE_STATE_STORAGE_KEY,
      JSON.stringify({
        personality: p,
        stayHere: false,
        cycleIndex: "0",
      }),
    );
    await setTreeState.mutateAsync({
      personality: p,
      cycleIndex: BigInt(0),
      stayHere: false,
      cycleCompleteShown: false,
    });
  }

  const saveNatalData = () => {
    if (!natalFormDate) return;
    const data: NatalData = {
      birthDate: natalFormDate,
      birthTime: natalFormTime,
      timezoneOffset: natalFormTz,
    };
    setNatalData(data);
    localStorage.setItem(NATAL_DATA_KEY, JSON.stringify(data));
    setShowNatalModal(false);
  };

  const openNatalModal = () => {
    if (natalData) {
      setNatalFormDate(natalData.birthDate);
      setNatalFormTime(natalData.birthTime);
      setNatalFormTz(natalData.timezoneOffset);
    }
    setShowNatalModal(true);
  };

  async function handleStayHere() {
    setStayHere(true);
    setCycleCompleteOpen(false);
    if (personality) {
      // Write to localStorage immediately
      localStorage.setItem(
        TREE_STATE_STORAGE_KEY,
        JSON.stringify({
          personality,
          stayHere: true,
          cycleIndex: String(treeState ? Number(treeState.cycleIndex) : 0),
        }),
      );
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
    // Write to localStorage immediately
    localStorage.setItem(
      TREE_STATE_STORAGE_KEY,
      JSON.stringify({
        personality: nextPersonality,
        stayHere: false,
        cycleIndex: String(nextIndex),
      }),
    );
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

  function handleTimerWhisper() {
    if (personality) {
      const phrases =
        personality === "star"
          ? starPhrases
          : personality === "flow"
            ? flowPhrases
            : empressPhrases;
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      setWhisperPhrase(phrase);
    }
  }

  function handleTimerFinished() {
    setTimerJustFinished(true);
    showTimerNotification(lang);
    setTimeout(() => setTimerJustFinished(false), 2000);
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
        moodBefore: BigInt(moodSelection),
        moodAfter: BigInt(3),
        memo,
      });
      toast.success(t("formSuccess"));
      vibrate(50);
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

  async function handleEditSave() {
    if (editingId === null) return;
    try {
      await updateRecord.mutateAsync({
        id: editingId,
        duration: BigInt(Number(editDuration) || 0),
        memo: editMemo,
      });
      setEditingId(null);
    } catch {
      toast.error(t("deleteError"));
    }
  }

  // Show personality select only after zen loader is done AND backend has responded
  if (!showZenLoader && !personality && treeState !== undefined) {
    return <PersonalitySelectScreen onSelect={handleSelectPersonality} />;
  }

  return (
    <>
      {showZenLoader && (
        <ZenLoadingScreen
          isReady={treeState !== undefined}
          onDone={() => setShowZenLoader(false)}
        />
      )}
      <motion.div
        className="min-h-screen bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
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
                  value={(() => {
                    const m = Number(totalMinutes);
                    if (m >= 60) {
                      const h = Math.floor(m / 60);
                      const rem = m % 60;
                      if (lang === "en") {
                        return (
                          <span className="flex flex-col leading-tight">
                            <span>{h}h</span>
                            {rem > 0 && <span className="text-xl">{rem}m</span>}
                          </span>
                        );
                      }
                      return (
                        <span className="flex flex-col leading-tight">
                          <span>{h}時間</span>
                          {rem > 0 && <span className="text-xl">{rem}分</span>}
                        </span>
                      );
                    }
                    return lang === "en" ? `${m} min` : `${m} 分`;
                  })()}
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
                <div
                  className="rounded-2xl shadow-card p-6 flex flex-col items-center gap-2"
                  style={{
                    background: skyGradient,
                    minHeight: "320px",
                    transition: "background 2s ease",
                  }}
                >
                  <div className="w-full mb-2 flex items-center justify-between">
                    <h2
                      className="text-base font-semibold"
                      style={{
                        color: "rgba(255,255,255,0.9)",
                        textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                      }}
                    >
                      {t("yourTree")}
                    </h2>
                    <div className="flex flex-col items-end gap-0.5">
                      {/* Row 1: moon phase + settings gear */}
                      <div
                        className="flex items-center gap-1.5"
                        style={{
                          color: "rgba(255,255,255,0.75)",
                          textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                        }}
                      >
                        <span style={{ fontSize: "1.1rem" }}>
                          {moonPhase.emoji}
                        </span>
                        <span className="text-xs">
                          {t(moonPhase.key as Parameters<typeof t>[0])}
                        </span>
                        <button
                          type="button"
                          onClick={openNatalModal}
                          className="text-xs opacity-50 hover:opacity-80 transition-opacity ml-1"
                          style={{ lineHeight: 1 }}
                          aria-label={t("natalMoonSettings")}
                          data-ocid="natal.open_modal_button"
                        >
                          ⚙
                        </button>
                      </div>
                      {/* Row 2: natal moon aspect (only when natal data is configured) */}
                      {natalMoonInfo && (
                        <div
                          className="text-xs"
                          style={{
                            color: "rgba(255,255,255,0.55)",
                            textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                          }}
                        >
                          {(() => {
                            const transitZodiac = getZodiacInfo(transitMoonLon);
                            const rawDiff = Math.abs(
                              transitMoonLon - natalMoonInfo.natalLon,
                            );
                            const normalizedDiff =
                              rawDiff > 180 ? 360 - rawDiff : rawDiff;
                            return (
                              <>
                                🌙 {transitZodiac.symbol}{" "}
                                {lang === "ja"
                                  ? transitZodiac.signJa
                                  : transitZodiac.signEn}{" "}
                                {natalMoonInfo.aspect
                                  ? `${natalMoonInfo.aspect.symbol} ${natalMoonInfo.aspect.orb > 0 ? "+" : ""}${natalMoonInfo.aspect.orb}°`
                                  : `${normalizedDiff.toFixed(1)}°`}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                  <PlantGrowth
                    totalMinutes={totalMin}
                    personality={personality ?? "star"}
                    stayHere={stayHere}
                    lang={lang}
                  />
                  <WhisperBubble
                    phrase={whisperPhrase}
                    onDone={() => setWhisperPhrase(null)}
                  />
                </div>
              </section>

              {/* Timer */}
              <MeditationTimer
                onElapsedMinutes={handleTimerElapsed}
                onTimerFinished={handleTimerFinished}
                onWhisper={handleTimerWhisper}
                personality={personality ?? "flow"}
              />

              {/* Form */}
              <section>
                <div
                  className="bg-card rounded-2xl shadow-card p-6 transition-opacity duration-500"
                  style={{
                    opacity: timerJustFinished ? 0.6 : 1,
                    pointerEvents: timerJustFinished ? "none" : "auto",
                  }}
                >
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
                        <Label
                          htmlFor="duration"
                          className="text-sm font-medium"
                        >
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

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {lang === "ja" ? "気分" : "Mood"}
                      </Label>
                      <div className="flex gap-2" data-ocid="form.mood_select">
                        {([1, 2, 3, 4, 5] as const).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setMoodSelection(v)}
                            className={`flex-1 text-xl py-1.5 rounded-lg transition-all ${moodSelection === v ? "bg-primary/20 ring-1 ring-primary/50" : "opacity-40 hover:opacity-70"}`}
                            data-ocid={`form.mood.${v}`}
                          >
                            {["😔", "😐", "🙂", "😊", "✨"][v - 1]}
                          </button>
                        ))}
                      </div>
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-foreground">
                    {t("pastRecords")}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode((v) => !v);
                      setEditingId(null);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary"
                    data-ocid="records.edit_button"
                  >
                    {editMode ? t("editDone") : t("editToggle")}
                  </button>
                </div>

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
                          className="bg-card rounded-2xl shadow-card p-5"
                        >
                          {editingId === item.id ? (
                            /* Inline edit form */
                            <div className="flex flex-col gap-3">
                              <div className="flex gap-3 items-center">
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {t("formDuration")}
                                </span>
                                <input
                                  type="number"
                                  value={editDuration}
                                  onChange={(e) =>
                                    setEditDuration(e.target.value)
                                  }
                                  className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground"
                                  data-ocid={`records.input.${idx + 1}`}
                                  min="1"
                                />
                                <span className="text-xs text-muted-foreground">
                                  {t("durationUnit")}
                                </span>
                              </div>
                              <textarea
                                value={editMemo}
                                onChange={(e) => setEditMemo(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground resize-none"
                                placeholder={t("formMemoPlaceholder")}
                                data-ocid={`records.textarea.${idx + 1}`}
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                                  data-ocid={`records.cancel_button.${idx + 1}`}
                                >
                                  キャンセル
                                </button>
                                <button
                                  type="button"
                                  onClick={handleEditSave}
                                  disabled={updateRecord.isPending}
                                  className="text-xs px-3 py-1.5 rounded-lg text-white transition-colors disabled:opacity-40"
                                  style={{
                                    backgroundColor: "oklch(0.55 0.12 160)",
                                  }}
                                  data-ocid={`records.save_button.${idx + 1}`}
                                >
                                  保存
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Normal record display */
                            <div className="flex gap-4 items-start">
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
                                {(() => {
                                  const d = new Date(
                                    `${item.record.date}T12:00:00`,
                                  );
                                  const lon = getMoonEclipticLongitude(d);
                                  const z = getZodiacInfo(lon);
                                  const moodEmojis = [
                                    "😔",
                                    "😐",
                                    "🙂",
                                    "😊",
                                    "✨",
                                  ];
                                  const mood = Number(item.record.moodBefore);
                                  return (
                                    <p className="text-[10px] text-muted-foreground/60 mt-1.5 flex gap-2 items-center">
                                      <span>
                                        🌙 {z.symbol}
                                        {lang === "ja" ? z.signJa : z.signEn}{" "}
                                        {Math.floor(z.degree)}°
                                      </span>
                                      {mood >= 1 && mood <= 5 && (
                                        <span>{moodEmojis[mood - 1]}</span>
                                      )}
                                    </p>
                                  );
                                })()}
                              </div>

                              {editMode && (
                                <div className="shrink-0 flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateRecord.reset();
                                      setEditingId(item.id);
                                      setEditDuration(
                                        String(Number(item.record.duration)),
                                      );
                                      setEditMemo(item.record.memo);
                                    }}
                                    data-ocid={`records.edit_button.${idx + 1}`}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-opacity hover:opacity-80"
                                    style={{
                                      backgroundColor: "oklch(0.88 0.04 220)",
                                    }}
                                    aria-label={t("editToggle")}
                                  >
                                    <Pencil
                                      className="w-3.5 h-3.5"
                                      style={{ color: "oklch(0.45 0.08 220)" }}
                                    />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deleteRecord.isPending}
                                    data-ocid={`records.delete_button.${idx + 1}`}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-40"
                                    style={{
                                      backgroundColor: "oklch(0.86 0.04 15)",
                                    }}
                                    aria-label={t("deleteAriaLabel")}
                                  >
                                    <Trash2
                                      className="w-3.5 h-3.5"
                                      style={{ color: "oklch(0.45 0.08 15)" }}
                                    />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
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

        {/* Natal Moon Settings Modal */}
        <Dialog open={showNatalModal} onOpenChange={setShowNatalModal}>
          <DialogContent
            className="max-w-sm rounded-2xl border-0"
            style={{
              background: "linear-gradient(to bottom, #1a1a3e, #0d1b2a)",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            <DialogHeader>
              <DialogTitle
                className="text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                {t("natalMoonSettings")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              {/* Current natal moon info */}
              {natalMoonInfo && (
                <div
                  className="text-xs rounded-xl px-3 py-2"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {t("natalMoonLabel")}:{" "}
                  <span style={{ color: "rgba(255,255,255,0.85)" }}>
                    {natalMoonInfo.zodiac.symbol}{" "}
                    {lang === "ja"
                      ? natalMoonInfo.zodiac.signJa
                      : natalMoonInfo.zodiac.signEn}{" "}
                    {natalMoonInfo.zodiac.degree.toFixed(1)}°
                  </span>
                  {natalMoonInfo.aspect && (
                    <>
                      {" · "}
                      {t("natalAspectLabel")}:{" "}
                      <span style={{ color: "rgba(255,255,255,0.85)" }}>
                        {natalMoonInfo.aspect.symbol}{" "}
                        {lang === "ja"
                          ? natalMoonInfo.aspect.nameJa
                          : natalMoonInfo.aspect.nameEn}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Birth date */}
              <div className="space-y-1.5">
                <label
                  htmlFor="natal-date"
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  {t("natalBirthDate")}
                </label>
                <input
                  id="natal-date"
                  type="date"
                  value={natalFormDate}
                  onChange={(e) => setNatalFormDate(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.85)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    colorScheme: "dark",
                  }}
                  data-ocid="natal.input"
                />
              </div>

              {/* Birth time */}
              <div className="space-y-1.5">
                <label
                  htmlFor="natal-time"
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  {t("natalBirthTime")}
                </label>
                <input
                  id="natal-time"
                  type="time"
                  value={natalFormTime}
                  onChange={(e) => setNatalFormTime(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.85)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    colorScheme: "dark",
                  }}
                  data-ocid="natal.input"
                />
              </div>

              {/* Timezone */}
              <div className="space-y-1.5">
                <span
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  {t("natalTimezone")}
                </span>
                <Select
                  value={String(natalFormTz)}
                  onValueChange={(v) => setNatalFormTz(Number(v))}
                >
                  <SelectTrigger
                    className="w-full rounded-xl text-sm"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.85)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                    data-ocid="natal.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      background: "#1a1a3e",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    {[
                      { offset: -12, city: "Baker Island" },
                      { offset: -11, city: "Samoa" },
                      { offset: -10, city: "Honolulu" },
                      { offset: -9, city: "Anchorage" },
                      { offset: -8, city: "Los Angeles" },
                      { offset: -7, city: "Denver" },
                      { offset: -6, city: "Chicago" },
                      { offset: -5, city: "New York" },
                      { offset: -4, city: "Santiago" },
                      { offset: -3, city: "São Paulo" },
                      { offset: -2, city: "Fernando de Noronha" },
                      { offset: -1, city: "Azores" },
                      { offset: 0, city: "London" },
                      { offset: 1, city: "Paris / Berlin" },
                      { offset: 2, city: "Cairo / Athens" },
                      { offset: 3, city: "Moscow / Dubai" },
                      { offset: 4, city: "Dubai" },
                      { offset: 5, city: "Karachi" },
                      { offset: 5.5, city: "Mumbai / Delhi" },
                      { offset: 6, city: "Dhaka" },
                      { offset: 7, city: "Bangkok / Jakarta" },
                      { offset: 8, city: "Beijing / Singapore" },
                      { offset: 9, city: "Tokyo / Seoul" },
                      { offset: 10, city: "Sydney" },
                      { offset: 11, city: "Noumea" },
                      { offset: 12, city: "Auckland" },
                      { offset: 13, city: "Samoa (DST)" },
                    ].map(({ offset, city }) => (
                      <SelectItem
                        key={offset}
                        value={String(offset)}
                        style={{ color: "rgba(255,255,255,0.85)" }}
                      >
                        {offset >= 0 ? `UTC+${offset}` : `UTC${offset}`} —{" "}
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={saveNatalData}
                  disabled={!natalFormDate}
                  className="flex-1 rounded-xl py-2 text-sm font-medium transition-opacity disabled:opacity-40"
                  style={{
                    background: "rgba(180,150,80,0.25)",
                    color: "rgba(255,220,120,0.9)",
                    border: "1px solid rgba(180,150,80,0.3)",
                  }}
                  data-ocid="natal.save_button"
                >
                  {t("natalSave")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNatalModal(false)}
                  className="flex-1 rounded-xl py-2 text-sm transition-opacity"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  data-ocid="natal.cancel_button"
                >
                  {t("natalCancel")}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </>
  );
}
