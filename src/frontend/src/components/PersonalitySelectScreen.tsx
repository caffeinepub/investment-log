import { motion } from "motion/react";
import type { TreePersonality } from "./PlantGrowth";

const PERSONALITIES: {
  id: TreePersonality;
  name: string;
  description: string;
  colors: { trunk: string; leaf: string; leafHL: string };
}[] = [
  {
    id: "star",
    name: "スター",
    description: "上へ、ひたすらに",
    colors: {
      trunk: "hsl(220,10%,72%)",
      leaf: "hsl(162,35%,68%)",
      leafHL: "hsl(162,35%,82%)",
    },
  },
  {
    id: "foolish",
    name: "フーリッシュ",
    description: "我が道を、のびのびと",
    colors: {
      trunk: "hsl(18,38%,40%)",
      leaf: "hsl(78,25%,46%)",
      leafHL: "hsl(78,25%,62%)",
    },
  },
  {
    id: "empress",
    name: "エンプレス",
    description: "豊かに、満ちあふれて",
    colors: {
      trunk: "hsl(218,52%,26%)",
      leaf: "hsl(158,45%,35%)",
      leafHL: "hsl(158,40%,52%)",
    },
  },
];

function SproutSVG({
  colors,
}: { colors: { trunk: string; leaf: string; leafHL: string } }) {
  return (
    <svg viewBox="0 0 80 100" width={80} height={100} aria-hidden="true">
      {/* Pot */}
      <path
        d="M 24 80 Q 20 94 40 96 Q 60 94 56 80 Z"
        fill={colors.trunk}
        opacity={0.6}
      />
      <ellipse
        cx={40}
        cy={80}
        rx={16}
        ry={3.5}
        fill={colors.trunk}
        opacity={0.4}
      />
      {/* Trunk */}
      <path
        d="M 37 80 C 37 68 38 58 39 48 L 41 48 C 42 58 43 68 43 80 Z"
        fill={colors.trunk}
      />
      {/* Tiny leaves */}
      <ellipse
        cx={47}
        cy={50}
        rx={8}
        ry={5.5}
        fill={colors.leaf}
        transform="rotate(20,47,50)"
      />
      <ellipse
        cx={33}
        cy={54}
        rx={7}
        ry={5}
        fill={colors.leaf}
        transform="rotate(-15,33,54)"
      />
      <ellipse
        cx={41}
        cy={44}
        rx={5.5}
        ry={4}
        fill={colors.leafHL}
        opacity={0.7}
        transform="rotate(5,41,44)"
      />
      {/* Tiny bud */}
      <circle cx={40} cy={40} r={3} fill={colors.trunk} opacity={0.8} />
    </svg>
  );
}

interface PersonalitySelectScreenProps {
  onSelect: (personality: TreePersonality) => void;
}

export default function PersonalitySelectScreen({
  onSelect,
}: PersonalitySelectScreenProps) {
  return (
    <motion.div
      className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-lg w-full text-center mb-10">
        <motion.h1
          className="text-2xl font-semibold text-foreground mb-3 tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          あなたの木を選んでください
        </motion.h1>
        <motion.p
          className="text-sm text-muted-foreground leading-relaxed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          最初の一本。これがあなたの旅の始まりです。
        </motion.p>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
        {PERSONALITIES.map((p, i) => (
          <motion.button
            key={p.id}
            type="button"
            data-ocid={`personality_select.${p.id}.button`}
            onClick={() => onSelect(p.id)}
            className="bg-card rounded-2xl shadow-card p-4 flex flex-col items-center gap-3 hover:shadow-md transition-shadow duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <SproutSVG colors={p.colors} />
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                {p.description}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
