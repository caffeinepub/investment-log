import { type ReactNode, createContext, useContext, useState } from "react";

type Lang = "ja" | "en";

const translations = {
  ja: {
    appTitle: "Meditation Log",

    tabRecord: "記録",
    tabReview: "振り返り",

    statsTotalTime: "合計瞑想時間",
    statsDays: "記録した日数",
    statsDaysUnit: "日",

    yourTree: "あなたの木",
    moonPhaseNew: "新月",
    moonPhaseWaxingCrescent: "三日月",
    moonPhaseFirstQuarter: "上弦の月",
    moonPhaseWaxingGibbous: "十三夜月",
    moonPhaseFull: "満月",
    moonPhaseWaningGibbous: "十六夜月",
    moonPhaseLastQuarter: "下弦の月",
    moonPhaseWaningCrescent: "有明月",

    timerTitle: "瞑想タイマー",
    timerDurationLabel: "時間（分）",
    timerStart: "開始",
    timerResume: "再開",
    timerPause: "一時停止",
    timerReset: "リセット",
    timerReady: "準備中",
    timerRunning: "瞑想中",
    timerPaused: "一時停止中",
    timerDone: "お疲れさまでした 🙏",

    formTitle: "瞑想記録を追加",
    formDate: "日付",
    formDuration: "瞑想時間（分）",
    formDurationPlaceholder: "例: 10",
    formMemo: "メモ（任意）",
    formMemoPlaceholder: "今日の瞑想について、気づいたことなど…",
    formSubmit: "記録を保存する",
    formSaving: "保存中…",
    formErrorRequired: "日付と瞑想時間を入力してください",
    formErrorSave: "保存に失敗しました。もう一度お試しください。",
    formSuccess: "記録を保存しました ✨",

    pastRecords: "過去の記録",
    noMemo: "メモなし",
    deleteSuccess: "記録を削除しました",
    deleteError: "削除に失敗しました。",
    emptyStateTitle: "まだ記録がありません。",
    emptyStateSubtitle: "最初の瞑想を記録しましょう。",
    durationUnit: "分",

    levelUpTitle: "成長しました！",
    levelUpSubtitle: "木が育っています 🌿",
    levelUpOf: "/ 50",

    cycleFruitTitle: "実がなりました",
    cycleFruitBody: "この木との旅が、ひとつの実を結びました。",
    cycleStayButton: "もう少しここにいる",
    cycleNextButton: "次の旅へ",

    cycleTransitionTitle: "新しい旅が始まります",
    cycleTransitionBody: "これまでの歩みは、次の木の礎となります。",

    onboardingWelcome: "ようこそ",
    onboardingDesc1: "瞑想を続けると、あなただけの木が育ちます。",
    onboardingDesc2: "最初の一本を選んでください。",
    onboardingNext: "次へ",
    onboardingSelectTitle: "あなたの木を選んでください",
    onboardingSelectSubtitle: "最初の一本。これがあなたの旅の始まりです。",
    onboardingConfirmBody: "大切に育てましょう。",

    starName: "スター",
    starDesc: "上へ、ひたすらに",
    flowName: "フロウ",
    flowDesc: "我が道を、のびのびと",
    empressName: "エンプレス",
    empressDesc: "豊かに、満ちあふれて",
    journeyStart: "との旅が始まります",

    reviewMonthSummary: (year: number, month: number) =>
      `${year}年${month}月のまとめ`,
    reviewMeditationTime: "瞑想時間",
    reviewSessionCount: "記録回数",
    reviewSessionUnit: "回",
    reviewTotalAccum: "累計",
    reviewTotalUnit: "分",
    reviewCalendar: "カレンダー",
    reviewMemos: "最近のメモ",
    reviewMemosEmpty: "まだメモがありません。",
    reviewMemosEmptyHint: "記録にメモを添えると、ここに表示されます。",
    dayLabels: ["日", "月", "火", "水", "木", "金", "土"],

    langToggle: "言語",

    feedbackButton: "感想を送る",
    feedbackName: "お名前（任意）",
    feedbackMessage: "ひとことどうぞ",
    feedbackSend: "送る",
    feedbackSuccess: "届きました 🌿",
    feedbackSending: "送信中…",

    adminVisitors: "届いた人",
    adminFeedback: "フィードバック",
    adminAnonymous: "匿名",
    adminNoFeedback: "まだ届いていません",
    editToggle: "編集",
    editDone: "完了",
    stayHereLabel: "この木とともに… ✦",
    notifTitle: "瞑想が終わりました ☀️",
    notifBody: "静かに、目を開けてください。",
    deleteAriaLabel: "削除",
    natalMoonSettings: "出生データ設定",
    natalBirthDate: "生年月日",
    natalBirthTime: "出生時刻",
    natalTimezone: "タイムゾーン",
    natalSave: "保存",
    natalCancel: "閉じる",
    natalNotSet: "出生データ未設定",
    natalMoonLabel: "ネイティブ月",
    natalAspectLabel: "月のアスペクト",
    natalAspectNone: "アスペクトなし",
  },
  en: {
    appTitle: "Meditation Log",

    tabRecord: "Record",
    tabReview: "Review",

    statsTotalTime: "Total Meditation",
    statsDays: "Days Logged",
    statsDaysUnit: " days",

    yourTree: "Your Tree",
    moonPhaseNew: "New Moon",
    moonPhaseWaxingCrescent: "Waxing Crescent",
    moonPhaseFirstQuarter: "First Quarter",
    moonPhaseWaxingGibbous: "Waxing Gibbous",
    moonPhaseFull: "Full Moon",
    moonPhaseWaningGibbous: "Waning Gibbous",
    moonPhaseLastQuarter: "Last Quarter",
    moonPhaseWaningCrescent: "Waning Crescent",

    timerTitle: "Meditation Timer",
    timerDurationLabel: "Minutes",
    timerStart: "Start",
    timerResume: "Resume",
    timerPause: "Pause",
    timerReset: "Reset",
    timerReady: "Ready",
    timerRunning: "Meditating",
    timerPaused: "Paused",
    timerDone: "Well done 🙏",

    formTitle: "Add a Record",
    formDate: "Date",
    formDuration: "Duration (min)",
    formDurationPlaceholder: "e.g. 10",
    formMemo: "Note (optional)",
    formMemoPlaceholder: "How was your session today?",
    formSubmit: "Save",
    formSaving: "Saving…",
    formErrorRequired: "Please enter a date and duration.",
    formErrorSave: "Could not save. Please try again.",
    formSuccess: "Saved ✨",

    pastRecords: "Past Records",
    noMemo: "No note",
    deleteSuccess: "Record deleted",
    deleteError: "Could not delete.",
    emptyStateTitle: "No records yet.",
    emptyStateSubtitle: "Log your first meditation session.",
    durationUnit: " min",

    levelUpTitle: "Your tree grew!",
    levelUpSubtitle: "Keep going 🌿",
    levelUpOf: "/ 50",

    cycleFruitTitle: "Fruit has appeared",
    cycleFruitBody: "Your journey with this tree has borne fruit.",
    cycleStayButton: "Stay a little longer",
    cycleNextButton: "Begin the next journey",

    cycleTransitionTitle: "A new journey begins",
    cycleTransitionBody: "Everything you've grown carries forward.",

    onboardingWelcome: "Welcome",
    onboardingDesc1: "Your tree grows as you meditate.",
    onboardingDesc2: "Choose your first tree.",
    onboardingNext: "Next",
    onboardingSelectTitle: "Choose your tree",
    onboardingSelectSubtitle: "Your first tree. The start of your journey.",
    onboardingConfirmBody: "Take good care of it.",

    starName: "Star",
    starDesc: "Reaching upward, always",
    flowName: "Flow",
    flowDesc: "Going its own way, freely",
    empressName: "Empress",
    empressDesc: "Rich, full, and overflowing",
    journeyStart: " — your journey begins",

    reviewMonthSummary: (year: number, month: number) =>
      `${year} / ${month} Summary`,
    reviewMeditationTime: "Time Meditated",
    reviewSessionCount: "Sessions",
    reviewSessionUnit: "",
    reviewTotalAccum: "Total",
    reviewTotalUnit: " min",
    reviewCalendar: "Calendar",
    reviewMemos: "Recent Notes",
    reviewMemosEmpty: "No notes yet.",
    reviewMemosEmptyHint: "Add a note to a record and it will appear here.",
    dayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

    langToggle: "Language",

    feedbackButton: "Send feedback",
    feedbackName: "Name (optional)",
    feedbackMessage: "Your thoughts",
    feedbackSend: "Send",
    feedbackSuccess: "Received 🌿",
    feedbackSending: "Sending…",

    adminVisitors: "Visitors",
    adminFeedback: "Feedback",
    adminAnonymous: "Anonymous",
    adminNoFeedback: "None yet",
    editToggle: "Edit",
    editDone: "Done",
    stayHereLabel: "Staying with this tree… ✦",
    notifTitle: "Meditation complete ☀️",
    notifBody: "Gently, open your eyes.",
    deleteAriaLabel: "Delete",
    natalMoonSettings: "Birth Data",
    natalBirthDate: "Birth Date",
    natalBirthTime: "Birth Time",
    natalTimezone: "Timezone",
    natalSave: "Save",
    natalCancel: "Close",
    natalNotSet: "Birth data not set",
    natalMoonLabel: "Natal Moon",
    natalAspectLabel: "Moon Aspect",
    natalAspectNone: "No major aspect",
  },
} as const;

type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

type TranslationKey = StringKeys<(typeof translations)["ja"]>;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  translations: typeof translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectInitialLang(): Lang {
  const stored = localStorage.getItem("meditationLang");
  if (stored === "ja" || stored === "en") return stored;
  return navigator.language.startsWith("ja") ? "ja" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("meditationLang", l);
  }

  function t(key: TranslationKey): string {
    return translations[lang][key] as string;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
