import { motion } from "motion/react";
import { useEffect, useState } from "react";

type Trait =
  | "fruit_banana"
  | "fruit_pineapple"
  | "fruit_apple"
  | "fruit_orange"
  | "round_leaves"
  | "large_leaves"
  | "thick_stem";

const ALL_TRAITS: Trait[] = [
  "fruit_banana",
  "fruit_pineapple",
  "fruit_apple",
  "fruit_orange",
  "round_leaves",
  "large_leaves",
  "thick_stem",
];
const MILESTONES = [10, 20, 30, 40, 50];
const STORAGE_KEY = "plant_personality_v2";

const DEMO_TRAITS: Record<number, Trait> = {
  10: "large_leaves",
  20: "fruit_apple",
  30: "thick_stem",
  40: "round_leaves",
  50: "fruit_banana",
};

function loadTraits(): Record<number, Trait> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveTraits(traits: Record<number, Trait>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(traits));
  } catch {}
}

interface PlantGrowthProps {
  totalMinutes: number;
  isSample?: boolean;
}

// Sparkle component with pulsing animation
function Sparkle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.g
      animate={{ opacity: [0.25, 0.85, 0.25] }}
      transition={{
        duration: 2.2,
        repeat: Number.POSITIVE_INFINITY,
        delay,
        ease: "easeInOut",
      }}
    >
      <line
        x1={x - 4}
        y1={y}
        x2={x + 4}
        y2={y}
        stroke="hsl(218,52%,60%)"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <line
        x1={x}
        y1={y - 4}
        x2={x}
        y2={y + 4}
        stroke="hsl(218,52%,60%)"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <line
        x1={x - 2.5}
        y1={y - 2.5}
        x2={x + 2.5}
        y2={y + 2.5}
        stroke="hsl(218,52%,70%)"
        strokeWidth={0.8}
        strokeLinecap="round"
      />
      <line
        x1={x + 2.5}
        y1={y - 2.5}
        x2={x - 2.5}
        y2={y + 2.5}
        stroke="hsl(218,52%,70%)"
        strokeWidth={0.8}
        strokeLinecap="round"
      />
    </motion.g>
  );
}

// Leaf cluster: round oval leaf
function LeafCluster({
  cx,
  cy,
  scale,
  colorA,
  colorB,
  isRound,
  angle,
}: {
  cx: number;
  cy: number;
  scale: number;
  colorA: string;
  colorB: string;
  isRound: boolean;
  angle?: number;
}) {
  const rx = isRound ? 10 * scale : 9 * scale;
  const ry = isRound ? 9 * scale : 7 * scale;
  const rot = angle ?? 0;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "backOut" }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={colorA}
        transform={`rotate(${rot}, ${cx}, ${cy})`}
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.10))" }}
      />
      <ellipse
        cx={cx - rx * 0.18}
        cy={cy - ry * 0.15}
        rx={rx * 0.45}
        ry={ry * 0.45}
        fill={colorB}
        opacity={0.55}
        transform={`rotate(${rot}, ${cx}, ${cy})`}
      />
    </motion.g>
  );
}

// Apple fruit
function FruitApple({ cx, cy }: { cx: number; cy: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "backOut" }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={6.5}
        fill="hsl(4,68%,56%)"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }}
      />
      <circle
        cx={cx - 1.8}
        cy={cy - 1.5}
        r={1.8}
        fill="hsl(4,60%,72%)"
        opacity={0.45}
      />
      <rect
        x={cx - 0.7}
        y={cy - 8.5}
        width={1.4}
        height={3}
        rx={0.7}
        fill="hsl(30,55%,38%)"
      />
      <ellipse
        cx={cx + 2.5}
        cy={cy - 8}
        rx={2.8}
        ry={1.3}
        fill="hsl(130,50%,40%)"
        transform={`rotate(-20,${cx + 2.5},${cy - 8})`}
      />
    </motion.g>
  );
}

// Orange fruit
function FruitOrange({ cx, cy }: { cx: number; cy: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "backOut" }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={6.5}
        fill="hsl(28,85%,58%)"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }}
      />
      <circle
        cx={cx - 1.8}
        cy={cy - 1.5}
        r={1.8}
        fill="hsl(40,80%,75%)"
        opacity={0.45}
      />
      <circle cx={cx} cy={cy + 3.5} r={1.1} fill="hsl(20,60%,48%)" />
      <rect
        x={cx - 0.7}
        y={cy - 8.5}
        width={1.4}
        height={3}
        rx={0.7}
        fill="hsl(30,55%,38%)"
      />
    </motion.g>
  );
}

// Banana fruit
function FruitBanana({ cx, cy }: { cx: number; cy: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "backOut" }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      <path
        d={`M ${cx - 7} ${cy + 3} Q ${cx} ${cy - 8} ${cx + 7} ${cy + 3} Q ${cx} ${cy - 2} ${cx - 7} ${cy + 3} Z`}
        fill="hsl(50,90%,65%)"
        style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.12))" }}
      />
      <circle cx={cx - 7} cy={cy + 3} r={1.5} fill="hsl(30,50%,45%)" />
      <circle cx={cx + 7} cy={cy + 3} r={1.5} fill="hsl(30,50%,45%)" />
    </motion.g>
  );
}

// Pineapple fruit
function FruitPineapple({ cx, cy }: { cx: number; cy: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "backOut" }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      <ellipse
        cx={cx}
        cy={cy + 2}
        rx={4.5}
        ry={6}
        fill="hsl(48,85%,60%)"
        style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.12))" }}
      />
      <line
        x1={cx - 2}
        y1={cy - 1}
        x2={cx - 2}
        y2={cy + 5}
        stroke="hsl(38,70%,50%)"
        strokeWidth={0.6}
      />
      <line
        x1={cx + 2}
        y1={cy - 1}
        x2={cx + 2}
        y2={cy + 5}
        stroke="hsl(38,70%,50%)"
        strokeWidth={0.6}
      />
      <line
        x1={cx}
        y1={cy - 4}
        x2={cx}
        y2={cy - 11}
        stroke="hsl(120,50%,40%)"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <line
        x1={cx - 2}
        y1={cy - 3}
        x2={cx - 5}
        y2={cy - 9}
        stroke="hsl(120,50%,40%)"
        strokeWidth={1}
        strokeLinecap="round"
      />
      <line
        x1={cx + 2}
        y1={cy - 3}
        x2={cx + 5}
        y2={cy - 9}
        stroke="hsl(120,50%,40%)"
        strokeWidth={1}
        strokeLinecap="round"
      />
    </motion.g>
  );
}

const LEAF_COLOR_A = "hsl(170,40%,54%)";
const LEAF_COLOR_B = "hsl(165,38%,72%)";
const TRUNK_COLOR = "hsl(218,52%,26%)";
const BRANCH_COLOR = "hsl(218,50%,30%)";

export default function PlantGrowth({
  totalMinutes,
  isSample,
}: PlantGrowthProps) {
  const stage = Math.min(Math.floor(totalMinutes / 20), 50);
  const t = stage / 50;

  const [traits, setTraits] = useState<Record<number, Trait>>({});

  useEffect(() => {
    if (isSample) return;
    const stored = loadTraits();
    let updated = { ...stored };
    let changed = false;
    for (const milestone of MILESTONES) {
      if (stage >= milestone && updated[milestone] === undefined) {
        const lastTrait = updated[milestone - 10];
        const pool = lastTrait
          ? ALL_TRAITS.filter((tr) => tr !== lastTrait)
          : ALL_TRAITS;
        updated[milestone] = pool[Math.floor(Math.random() * pool.length)];
        changed = true;
      }
    }
    if (changed) saveTraits(updated);
    setTraits(updated);
  }, [stage, isSample]);

  const activeTraits = isSample ? DEMO_TRAITS : traits;
  const unlockedTraits = MILESTONES.filter((m) => stage >= m).map(
    (m) => activeTraits[m],
  );

  const hasFruitBanana = unlockedTraits.includes("fruit_banana");
  const hasFruitPineapple = unlockedTraits.includes("fruit_pineapple");
  const hasFruitApple = unlockedTraits.includes("fruit_apple");
  const hasFruitOrange = unlockedTraits.includes("fruit_orange");
  const hasFruit =
    hasFruitBanana || hasFruitPineapple || hasFruitApple || hasFruitOrange;

  const hasRoundLeaves = unlockedTraits.includes("round_leaves");
  const hasLargeLeaves = unlockedTraits.includes("large_leaves");
  const hasThickStem = unlockedTraits.includes("thick_stem");

  const leafScale = hasLargeLeaves ? 1.25 : 1.0;

  // Trunk geometry
  const baseY = 228;
  const trunkH = t * 98;
  const basetrunkW = 5 + t * 7;
  const trunkW = hasThickStem ? basetrunkW * 1.35 : basetrunkW;
  const trunkTopY = baseY - trunkH;

  // Branch appearance thresholds (by stage)
  const showBranchL = stage >= 9;
  const showBranchR = stage >= 11;
  const showSubLL = stage >= 19;
  const showSubLR = stage >= 21;
  const showSubRL = stage >= 22;
  const showSubRR = stage >= 23;

  // Branch endpoints
  const branchLStart = { x: 100, y: Math.max(trunkTopY + 20, 150 + t * 5) };
  const branchLEnd = { x: 62, y: 110 };
  const branchRStart = { x: 100, y: Math.max(trunkTopY + 30, 160) };
  const branchREnd = { x: 140, y: 112 };

  const subLLEnd = { x: 38, y: 82 };
  const subLREnd = { x: 84, y: 80 };
  const subRLEnd = { x: 122, y: 80 };
  const subRREnd = { x: 160, y: 84 };

  // Branch stroke widths
  const bw = Math.max(2, trunkW * 0.55);
  const sbw = Math.max(1.5, bw * 0.65);

  // Fruit component selector
  function FruitAt({ cx, cy }: { cx: number; cy: number }) {
    if (hasFruitBanana) return <FruitBanana cx={cx} cy={cy} />;
    if (hasFruitPineapple) return <FruitPineapple cx={cx} cy={cy} />;
    if (hasFruitApple) return <FruitApple cx={cx} cy={cy} />;
    if (hasFruitOrange) return <FruitOrange cx={cx} cy={cy} />;
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        viewBox="0 0 200 260"
        width={180}
        aria-label={`植物の成長 段階${stage}`}
        role="img"
      >
        {/* Pot */}
        <path
          d="M 72 225 Q 64 250 100 254 Q 136 250 128 225 Z"
          fill="hsl(218,50%,32%)"
        />
        <ellipse cx={100} cy={225} rx={28} ry={5} fill="hsl(218,52%,38%)" />
        <ellipse cx={100} cy={225} rx={28} ry={5.5} fill="hsl(218,52%,20%)" />
        {/* Pot highlight */}
        <ellipse
          cx={88}
          cy={242}
          rx={6}
          ry={9}
          fill="hsl(218,50%,38%)"
          opacity={0.3}
        />

        {/* Sparkles near pot */}
        <Sparkle x={72} y={218} delay={0} />
        <Sparkle x={130} y={216} delay={0.55} />
        <Sparkle x={82} y={246} delay={1.1} />
        <Sparkle x={120} y={248} delay={1.65} />

        {/* Seedling bud at very early stage */}
        {stage === 0 && (
          <motion.circle
            cx={100}
            cy={baseY - 4}
            r={3}
            fill={LEAF_COLOR_A}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Trunk */}
        {stage > 0 && (
          <rect
            x={100 - trunkW / 2}
            y={trunkTopY}
            width={trunkW}
            height={trunkH}
            rx={trunkW / 2}
            fill={TRUNK_COLOR}
            style={{ transition: "all 0.6s ease" }}
          />
        )}

        {/* Main Branch Left */}
        {showBranchL && (
          <motion.line
            x1={branchLStart.x}
            y1={branchLStart.y}
            x2={branchLEnd.x}
            y2={branchLEnd.y}
            stroke={BRANCH_COLOR}
            strokeWidth={bw}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        )}

        {/* Main Branch Right */}
        {showBranchR && (
          <motion.line
            x1={branchRStart.x}
            y1={branchRStart.y}
            x2={branchREnd.x}
            y2={branchREnd.y}
            stroke={BRANCH_COLOR}
            strokeWidth={bw}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        )}

        {/* Sub-Branch LL */}
        {showSubLL && (
          <motion.line
            x1={branchLEnd.x}
            y1={branchLEnd.y}
            x2={subLLEnd.x}
            y2={subLLEnd.y}
            stroke={BRANCH_COLOR}
            strokeWidth={sbw}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
        )}

        {/* Sub-Branch LR */}
        {showSubLR && (
          <motion.line
            x1={branchLEnd.x}
            y1={branchLEnd.y}
            x2={subLREnd.x}
            y2={subLREnd.y}
            stroke={BRANCH_COLOR}
            strokeWidth={sbw}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
        )}

        {/* Sub-Branch RL */}
        {showSubRL && (
          <motion.line
            x1={branchREnd.x}
            y1={branchREnd.y}
            x2={subRLEnd.x}
            y2={subRLEnd.y}
            stroke={BRANCH_COLOR}
            strokeWidth={sbw}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
        )}

        {/* Sub-Branch RR */}
        {showSubRR && (
          <motion.line
            x1={branchREnd.x}
            y1={branchREnd.y}
            x2={subRREnd.x}
            y2={subRREnd.y}
            stroke={BRANCH_COLOR}
            strokeWidth={sbw}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
        )}

        {/* Leaf clusters along main branches */}
        {showBranchL && (
          <LeafCluster
            cx={78}
            cy={132}
            scale={leafScale * 0.9}
            colorA={LEAF_COLOR_A}
            colorB={LEAF_COLOR_B}
            isRound={hasRoundLeaves}
            angle={-15}
          />
        )}
        {showBranchR && (
          <LeafCluster
            cx={122}
            cy={134}
            scale={leafScale * 0.9}
            colorA={LEAF_COLOR_A}
            colorB={LEAF_COLOR_B}
            isRound={hasRoundLeaves}
            angle={10}
          />
        )}

        {/* Leaf clusters at sub-branch tips */}
        {showSubLL && (
          <LeafCluster
            cx={subLLEnd.x}
            cy={subLLEnd.y}
            scale={leafScale}
            colorA={LEAF_COLOR_A}
            colorB={LEAF_COLOR_B}
            isRound={hasRoundLeaves}
            angle={-20}
          />
        )}
        {showSubLR && (
          <LeafCluster
            cx={subLREnd.x}
            cy={subLREnd.y}
            scale={leafScale}
            colorA={LEAF_COLOR_A}
            colorB={LEAF_COLOR_B}
            isRound={hasRoundLeaves}
            angle={5}
          />
        )}
        {showSubRL && (
          <LeafCluster
            cx={subRLEnd.x}
            cy={subRLEnd.y}
            scale={leafScale}
            colorA={LEAF_COLOR_A}
            colorB={LEAF_COLOR_B}
            isRound={hasRoundLeaves}
            angle={-5}
          />
        )}
        {showSubRR && (
          <LeafCluster
            cx={subRREnd.x}
            cy={subRREnd.y}
            scale={leafScale}
            colorA={LEAF_COLOR_A}
            colorB={LEAF_COLOR_B}
            isRound={hasRoundLeaves}
            angle={18}
          />
        )}

        {/* Extra leaf clusters for fuller look at stage 29+ */}
        {stage >= 29 && (
          <>
            <LeafCluster
              cx={52}
              cy={96}
              scale={leafScale * 0.85}
              colorA={LEAF_COLOR_A}
              colorB={LEAF_COLOR_B}
              isRound={hasRoundLeaves}
              angle={-30}
            />
            <LeafCluster
              cx={100}
              cy={78}
              scale={leafScale * 0.9}
              colorA={LEAF_COLOR_A}
              colorB={LEAF_COLOR_B}
              isRound={hasRoundLeaves}
            />
            <LeafCluster
              cx={150}
              cy={98}
              scale={leafScale * 0.85}
              colorA={LEAF_COLOR_A}
              colorB={LEAF_COLOR_B}
              isRound={hasRoundLeaves}
              angle={25}
            />
          </>
        )}

        {/* Fruits at branch junctions (stage 25+) */}
        {hasFruit && stage >= 25 && (
          <>
            <FruitAt cx={subLLEnd.x + 8} cy={subLLEnd.y + 6} />
            <FruitAt cx={subLREnd.x - 6} cy={subLREnd.y + 8} />
            {stage >= 30 && <FruitAt cx={subRLEnd.x + 4} cy={subRLEnd.y + 7} />}
            {stage >= 35 && <FruitAt cx={subRREnd.x - 8} cy={subRREnd.y + 6} />}
          </>
        )}

        {/* Top of trunk leaf cluster */}
        {stage >= 5 && (
          <LeafCluster
            cx={100}
            cy={trunkTopY - 5}
            scale={leafScale * 0.85}
            colorA={LEAF_COLOR_A}
            colorB={LEAF_COLOR_B}
            isRound={hasRoundLeaves}
          />
        )}

        {/* Flower at stage 45+ */}
        {stage >= 45 && (
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            style={{ transformOrigin: "100px 68px" }}
          >
            {[0, 60, 120, 180, 240, 300].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const px = 100 + 11 * Math.cos(rad);
              const py = 68 + 11 * Math.sin(rad);
              return (
                <ellipse
                  key={`petal-${angle}`}
                  cx={px}
                  cy={py}
                  rx={7}
                  ry={4.5}
                  fill="hsl(340,75%,88%)"
                  transform={`rotate(${angle},${px},${py})`}
                />
              );
            })}
            <circle cx={100} cy={68} r={5.5} fill="hsl(48,90%,68%)" />
            <circle cx={100} cy={68} r={2.5} fill="hsl(40,85%,55%)" />
          </motion.g>
        )}
      </svg>

      <p className="text-xs text-muted-foreground">段階 {stage} / 50</p>
    </div>
  );
}
