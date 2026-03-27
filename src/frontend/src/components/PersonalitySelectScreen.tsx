import { useLanguage } from "@/i18n";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { TreePersonality } from "./PlantGrowth";

// Star: thin stem, grows straight up with slight rightward lean at tip, sparkle at top
function StarSprout() {
  return (
    <svg viewBox="0 0 80 100" width={80} height={100} aria-hidden="true">
      {/* Pot */}
      <path
        d="M 26 82 Q 22 95 40 97 Q 58 95 54 82 Z"
        fill="hsl(220,10%,72%)"
        opacity={0.5}
      />
      <ellipse
        cx={40}
        cy={82}
        rx={14}
        ry={3}
        fill="hsl(220,10%,72%)"
        opacity={0.35}
      />
      {/* Stem - straight, thin, slight rightward lean near top */}
      <path
        d="M 38.5 82 L 38.5 56 L 39.5 46 L 42 36"
        stroke="hsl(220,12%,75%)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Small mint leaves near top, delicate */}
      <ellipse
        cx={46}
        cy={50}
        rx={6}
        ry={3.5}
        fill="hsl(162,35%,68%)"
        transform="rotate(30,46,50)"
      />
      <ellipse
        cx={35}
        cy={54}
        rx={5}
        ry={3}
        fill="hsl(162,35%,68%)"
        transform="rotate(-20,35,54)"
      />
      {/* Sparkle / star at tip */}
      <g transform="translate(42, 32)" opacity={0.9}>
        <line
          x1="0"
          y1="-5"
          x2="0"
          y2="5"
          stroke="hsl(52,90%,65%)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="-5"
          y1="0"
          x2="5"
          y2="0"
          stroke="hsl(52,90%,65%)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="-3.5"
          y1="-3.5"
          x2="3.5"
          y2="3.5"
          stroke="hsl(52,90%,65%)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="3.5"
          y1="-3.5"
          x2="-3.5"
          y2="3.5"
          stroke="hsl(52,90%,65%)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <circle cx={0} cy={0} r={1.5} fill="hsl(52,90%,75%)" />
      </g>
    </svg>
  );
}

// Flow: stem tilted diagonally from base, going its own way
function FlowSprout() {
  return (
    <svg viewBox="0 0 80 100" width={80} height={100} aria-hidden="true">
      {/* Pot */}
      <path
        d="M 26 82 Q 22 95 40 97 Q 58 95 54 82 Z"
        fill="hsl(18,38%,40%)"
        opacity={0.5}
      />
      <ellipse
        cx={40}
        cy={82}
        rx={14}
        ry={3}
        fill="hsl(18,38%,40%)"
        opacity={0.35}
      />
      {/* Stem tilted to the left from base, going diagonal */}
      <path
        d="M 40 82 C 39 72 34 60 28 46"
        stroke="hsl(18,38%,40%)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Leaves growing sideways from the diagonal stem */}
      <ellipse
        cx={23}
        cy={52}
        rx={9}
        ry={4.5}
        fill="hsl(78,25%,46%)"
        transform="rotate(-30,23,52)"
      />
      <ellipse
        cx={34}
        cy={60}
        rx={7}
        ry={3.5}
        fill="hsl(78,25%,46%)"
        transform="rotate(15,34,60)"
      />
      <ellipse
        cx={26}
        cy={44}
        rx={6}
        ry={3}
        fill="hsl(78,25%,58%)"
        transform="rotate(-10,26,44)"
        opacity={0.8}
      />
      {/* Tip, slightly rounded bud going sideways */}
      <circle cx={26} cy={40} r={3.5} fill="hsl(78,25%,38%)" opacity={0.9} />
    </svg>
  );
}

// Empress: short, squat, noticeably thick base/trunk
function EmpressSprout() {
  return (
    <svg viewBox="0 0 80 100" width={80} height={100} aria-hidden="true">
      {/* Pot - slightly wider for the empress */}
      <path
        d="M 22 82 Q 18 95 40 97 Q 62 95 58 82 Z"
        fill="hsl(218,52%,26%)"
        opacity={0.55}
      />
      <ellipse
        cx={40}
        cy={82}
        rx={18}
        ry={3.5}
        fill="hsl(218,52%,26%)"
        opacity={0.4}
      />
      {/* Trunk - thick, short, squat, authoritative */}
      <path
        d="M 34 82 L 33 65 L 34 55 L 46 55 L 47 65 L 46 82 Z"
        fill="hsl(218,52%,26%)"
      />
      {/* Wide, dense canopy - lots of leaves, full silhouette */}
      <ellipse cx={40} cy={46} rx={17} ry={11} fill="hsl(158,45%,35%)" />
      <ellipse cx={30} cy={50} rx={10} ry={7} fill="hsl(158,45%,35%)" />
      <ellipse cx={50} cy={50} rx={10} ry={7} fill="hsl(158,45%,35%)" />
      <ellipse
        cx={40}
        cy={40}
        rx={12}
        ry={8}
        fill="hsl(158,40%,45%)"
        opacity={0.7}
      />
      {/* Crown highlight */}
      <ellipse
        cx={40}
        cy={38}
        rx={7}
        ry={5}
        fill="hsl(158,38%,52%)"
        opacity={0.5}
      />
    </svg>
  );
}

function SproutForPersonality({ id }: { id: TreePersonality }) {
  if (id === "star") return <StarSprout />;
  if (id === "flow") return <FlowSprout />;
  return <EmpressSprout />;
}

interface PersonalitySelectScreenProps {
  onSelect: (personality: TreePersonality) => void;
}

type Phase = "intro" | "select" | "confirm";

export default function PersonalitySelectScreen({
  onSelect,
}: PersonalitySelectScreenProps) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<Phase>("intro");
  const [pending, setPending] = useState<TreePersonality | null>(null);

  const PERSONALITIES: {
    id: TreePersonality;
    name: string;
    description: string;
  }[] = [
    { id: "star", name: t("starName"), description: t("starDesc") },
    { id: "flow", name: t("flowName"), description: t("flowDesc") },
    { id: "empress", name: t("empressName"), description: t("empressDesc") },
  ];

  function handleSproutClick(id: TreePersonality) {
    setPending(id);
    setPhase("confirm");
    // Auto-transition after 4s
    setTimeout(() => {
      onSelect(id);
    }, 4000);
  }

  const pendingPersonality = PERSONALITIES.find((p) => p.id === pending);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            className="text-center max-w-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              className="text-4xl font-semibold text-foreground mb-6 tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {t("onboardingWelcome")}
            </motion.p>
            <motion.p
              className="text-sm text-muted-foreground mb-2 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {t("onboardingDesc1")}
            </motion.p>
            <motion.p
              className="text-sm text-muted-foreground mb-10 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {t("onboardingDesc2")}
            </motion.p>
            <motion.button
              type="button"
              data-ocid="onboarding.next.button"
              onClick={() => setPhase("select")}
              className="text-sm text-primary underline underline-offset-4 hover:opacity-70 transition-opacity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              {t("onboardingNext")}
            </motion.button>
          </motion.div>
        )}

        {phase === "select" && (
          <motion.div
            key="select"
            className="w-full max-w-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45 }}
          >
            <div className="text-center mb-8">
              <motion.h1
                className="text-2xl font-semibold text-foreground mb-2 tracking-tight"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                {t("onboardingSelectTitle")}
              </motion.h1>
              <motion.p
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                {t("onboardingSelectSubtitle")}
              </motion.p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {PERSONALITIES.map((p, i) => (
                <motion.button
                  key={p.id}
                  type="button"
                  data-ocid={`personality_select.${p.id}.button`}
                  onClick={() => handleSproutClick(p.id)}
                  className="bg-card rounded-2xl shadow-card p-4 flex flex-col items-center gap-3 hover:shadow-md transition-shadow duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SproutForPersonality id={p.id} />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">
                      {p.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "confirm" && pendingPersonality && (
          <motion.div
            key="confirm"
            className="text-center max-w-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            data-ocid="onboarding.confirm.panel"
          >
            <motion.div
              className="mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            >
              <SproutForPersonality id={pendingPersonality.id} />
            </motion.div>
            <motion.p
              className="text-xl font-semibold text-foreground mb-2 tracking-tight"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {pendingPersonality.name}
              {t("journeyStart")}
            </motion.p>
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {t("onboardingConfirmBody")}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
