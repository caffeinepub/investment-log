import { motion } from "motion/react";

export type TreePersonality = "star" | "foolish" | "empress";

interface PlantGrowthProps {
  totalMinutes: number;
  personality: TreePersonality;
  stayHere?: boolean;
}

const C = {
  star: {
    trunk: "hsl(220,10%,72%)",
    trunkDark: "hsl(220,10%,60%)",
    leaf: "hsl(162,35%,68%)",
    leafHL: "hsl(162,35%,82%)",
    fruit: "hsl(48,90%,72%)",
    flower: "hsl(200,60%,80%)",
    flowerCenter: "hsl(48,95%,72%)",
  },
  foolish: {
    trunk: "hsl(18,38%,40%)",
    trunkDark: "hsl(18,38%,30%)",
    leaf: "hsl(78,25%,46%)",
    leafHL: "hsl(78,25%,62%)",
    fruit: "hsl(36,75%,55%)",
    flower: "hsl(30,70%,75%)",
    flowerCenter: "hsl(48,95%,72%)",
  },
  empress: {
    trunk: "hsl(218,52%,26%)",
    trunkDark: "hsl(218,52%,18%)",
    leaf: "hsl(158,45%,35%)",
    leafHL: "hsl(158,40%,52%)",
    fruit: "hsl(340,60%,45%)",
    flower: "hsl(300,40%,75%)",
    flowerCenter: "hsl(300,50%,55%)",
  },
};

type Colors = typeof C.star;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

function Sparkle({
  x,
  y,
  delay,
  size = 4,
}: { x: number; y: number; delay: number; size?: number }) {
  return (
    <motion.g
      animate={{ opacity: [0.2, 0.9, 0.2] }}
      transition={{
        duration: 2.4,
        repeat: Number.POSITIVE_INFINITY,
        delay,
        ease: "easeInOut",
      }}
    >
      <line
        x1={x - size}
        y1={y}
        x2={x + size}
        y2={y}
        stroke="hsl(48,90%,72%)"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <line
        x1={x}
        y1={y - size}
        x2={x}
        y2={y + size}
        stroke="hsl(48,90%,72%)"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <line
        x1={x - size * 0.65}
        y1={y - size * 0.65}
        x2={x + size * 0.65}
        y2={y + size * 0.65}
        stroke="hsl(48,90%,85%)"
        strokeWidth={0.7}
        strokeLinecap="round"
      />
      <line
        x1={x + size * 0.65}
        y1={y - size * 0.65}
        x2={x - size * 0.65}
        y2={y + size * 0.65}
        stroke="hsl(48,90%,85%)"
        strokeWidth={0.7}
        strokeLinecap="round"
      />
    </motion.g>
  );
}

function Leaf({
  cx,
  cy,
  rx,
  ry,
  angle,
  fill,
  fillHL,
  delay = 0,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  angle: number;
  fill: string;
  fillHL: string;
  delay?: number;
}) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "backOut", delay }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={fill}
        transform={`rotate(${angle},${cx},${cy})`}
      />
      <ellipse
        cx={cx - rx * 0.2}
        cy={cy - ry * 0.2}
        rx={rx * 0.4}
        ry={ry * 0.4}
        fill={fillHL}
        opacity={0.55}
        transform={`rotate(${angle},${cx},${cy})`}
      />
    </motion.g>
  );
}

function Flower({
  cx,
  cy,
  colors,
}: { cx: number; cy: number; colors: Colors }) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "backOut" }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => {
        const rad = (ang * Math.PI) / 180;
        const px = cx + 14 * Math.cos(rad);
        const py = cy + 14 * Math.sin(rad);
        return (
          <ellipse
            key={`op-${ang}`}
            cx={px}
            cy={py}
            rx={9}
            ry={5.5}
            fill={colors.flower}
            transform={`rotate(${ang},${px},${py})`}
          />
        );
      })}
      {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((ang) => {
        const rad = (ang * Math.PI) / 180;
        const px = cx + 8 * Math.cos(rad);
        const py = cy + 8 * Math.sin(rad);
        return (
          <ellipse
            key={`ip-${ang}`}
            cx={px}
            cy={py}
            rx={6}
            ry={3.5}
            fill={colors.flower}
            opacity={0.8}
            transform={`rotate(${ang},${px},${py})`}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={6} fill={colors.flowerCenter} />
      <circle cx={cx} cy={cy} r={3} fill="hsl(38,90%,60%)" />
      <Sparkle x={cx - 18} y={cy - 12} delay={0.2} size={3} />
      <Sparkle x={cx + 18} y={cy - 10} delay={0.8} size={2.5} />
      <Sparkle x={cx - 12} y={cy + 16} delay={1.4} size={2.5} />
    </motion.g>
  );
}

function BudFlowerFruit({
  stage,
  cx,
  cy,
  colors,
  stayHere,
}: {
  stage: number;
  cx: number;
  cy: number;
  colors: Colors;
  stayHere?: boolean;
}) {
  if (stage < 5) return null;

  if (stage < 31) {
    const r = stage >= 25 ? 7 : stage >= 15 ? 5 : 3;
    return (
      <motion.circle
        cx={cx}
        cy={cy}
        r={r}
        fill={colors.fruit}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />
    );
  }

  if (stage < 41) {
    return <Flower cx={cx} cy={cy} colors={colors} />;
  }

  const r = 8 + Math.min((stage - 41) * 0.3, 3);
  const opacity = 0.75 + Math.min((stage - 41) * 0.025, 0.25);

  if (stayHere) {
    return (
      <motion.g>
        <motion.circle
          cx={cx}
          cy={cy}
          r={r + 4}
          fill={colors.fruit}
          opacity={0}
          animate={{ opacity: [0, 0.18, 0] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <circle cx={cx} cy={cy} r={r} fill={colors.fruit} opacity={opacity} />
        <Sparkle x={cx - 14} y={cy - 10} delay={0} size={3} />
        <Sparkle x={cx + 14} y={cy - 8} delay={1.0} size={2.5} />
      </motion.g>
    );
  }

  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={r}
      fill={colors.fruit}
      opacity={opacity}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity, scale: 1 }}
      transition={{ duration: 0.6 }}
    />
  );
}

// ── STAR TREE ────────────────────────────────────────────────────────────────
function StarTree({
  stage,
  colors,
  stayHere,
}: { stage: number; colors: Colors; stayHere?: boolean }) {
  const p1 = Math.min(stage / 12, 1);
  const p2 = stage >= 13 ? Math.min((stage - 13) / 12, 1) : 0;
  const p3 = stage >= 26 ? Math.min((stage - 26) / 12, 1) : 0;
  const p4 = stage >= 39 ? Math.min((stage - 39) / 11, 1) : 0;

  const baseY = 245;
  // Slightly right of center
  const trunkBaseX = 105;
  const trunkH = lerp(5, 90, p1 * 0.6 + p2 * 0.25 + p3 * 0.1 + p4 * 0.05);
  // Phase 4: top leans right
  const trunkTopX = trunkBaseX + p4 * 5;
  const trunkTopY = baseY - trunkH;
  const trunkW = 3 + p1 * 2 + p2 * 1;

  const trunkPath = [
    `M ${trunkBaseX - trunkW} ${baseY}`,
    `C ${trunkBaseX - trunkW} ${baseY - trunkH * 0.4} ${trunkTopX - trunkW * 0.6} ${trunkTopY + 10} ${trunkTopX - trunkW * 0.5} ${trunkTopY}`,
    `L ${trunkTopX + trunkW * 0.5} ${trunkTopY}`,
    `C ${trunkTopX + trunkW * 0.6} ${trunkTopY + 10} ${trunkBaseX + trunkW} ${baseY - trunkH * 0.4} ${trunkBaseX + trunkW} ${baseY}`,
    "Z",
  ].join(" ");

  const lrx = 10;
  const lry = 7.5;

  // Upper branch roots
  const branchRootY = trunkTopY + trunkH * 0.15;

  // Phase 2: upward V branches
  const bL2x = lerp(trunkTopX, trunkTopX - 28, p2);
  const bL2y = lerp(branchRootY, branchRootY - 30, p2);
  const bR2x = lerp(trunkTopX, trunkTopX + 24, p2);
  const bR2y = lerp(branchRootY, branchRootY - 24, p2);
  const branchW2 = 2 + p1 * 1.5;

  // Phase 3: sub-branches (more upward)
  const bLL3x = bL2x - 16 * p3;
  const bLL3y = bL2y - 20 * p3;
  const bLR3x = bL2x + 10 * p3;
  const bLR3y = bL2y - 22 * p3;
  const bRL3x = bR2x + 14 * p3;
  const bRL3y = bR2y - 18 * p3;
  const branchW3 = 1.5 + p2 * 0.8;

  // Phase 4: top slightly right
  const budX = trunkTopX + p4 * 4;
  const budY = trunkTopY - 8;

  return (
    <g>
      {/* Seedling dot */}
      {stage === 0 && (
        <motion.circle
          cx={trunkBaseX}
          cy={baseY - 4}
          r={3}
          fill={colors.leaf}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Trunk */}
      {stage >= 1 && (
        <motion.path
          d={trunkPath}
          fill={colors.trunk}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Phase 1: tiny leaves at top */}
      {stage >= 3 && (
        <Leaf
          cx={trunkTopX + 8}
          cy={trunkTopY - 4}
          rx={lrx * 0.7}
          ry={lry * 0.7}
          angle={20}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 5 && (
        <Leaf
          cx={trunkTopX - 6}
          cy={trunkTopY - 8}
          rx={lrx * 0.65}
          ry={lry * 0.65}
          angle={-15}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 7 && (
        <Leaf
          cx={trunkTopX + 4}
          cy={trunkTopY - 14}
          rx={lrx * 0.6}
          ry={lry * 0.6}
          angle={5}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}

      {/* Phase 2: left branch + leaves */}
      {stage >= 13 && (
        <motion.line
          x1={trunkTopX}
          y1={branchRootY}
          x2={bL2x}
          y2={bL2y}
          stroke={colors.trunk}
          strokeWidth={branchW2}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}
      {stage >= 14 && (
        <Leaf
          cx={bL2x - 5}
          cy={bL2y - 5}
          rx={lrx * 0.85}
          ry={lry * 0.85}
          angle={-25}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Phase 2: right branch */}
      {stage >= 15 && (
        <motion.line
          x1={trunkTopX}
          y1={branchRootY}
          x2={bR2x}
          y2={bR2y}
          stroke={colors.trunk}
          strokeWidth={branchW2 * 0.85}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}
      {stage >= 16 && (
        <Leaf
          cx={bR2x + 5}
          cy={bR2y - 4}
          rx={lrx * 0.8}
          ry={lry * 0.8}
          angle={22}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 18 && (
        <Leaf
          cx={bL2x + 6}
          cy={bL2y + 4}
          rx={lrx * 0.75}
          ry={lry * 0.75}
          angle={10}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 20 && (
        <Leaf
          cx={trunkTopX - 3}
          cy={trunkTopY - 10}
          rx={lrx * 0.7}
          ry={lry * 0.7}
          angle={-8}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}

      {/* Phase 3: sub-branches */}
      {stage >= 26 && (
        <motion.line
          x1={bL2x}
          y1={bL2y}
          x2={bLL3x}
          y2={bLL3y}
          stroke={colors.trunk}
          strokeWidth={branchW3}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {stage >= 27 && (
        <motion.line
          x1={bL2x}
          y1={bL2y}
          x2={bLR3x}
          y2={bLR3y}
          stroke={colors.trunk}
          strokeWidth={branchW3}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {stage >= 28 && (
        <motion.line
          x1={bR2x}
          y1={bR2y}
          x2={bRL3x}
          y2={bRL3y}
          stroke={colors.trunk}
          strokeWidth={branchW3 * 0.85}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {stage >= 27 && (
        <Leaf
          cx={bLL3x - 4}
          cy={bLL3y - 4}
          rx={lrx * 0.9}
          ry={lry * 0.9}
          angle={-28}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 28 && (
        <Leaf
          cx={bLR3x}
          cy={bLR3y - 5}
          rx={lrx}
          ry={lry}
          angle={-5}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 29 && (
        <Leaf
          cx={bRL3x + 5}
          cy={bRL3y - 4}
          rx={lrx * 0.85}
          ry={lry * 0.85}
          angle={20}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 30 && (
        <Leaf
          cx={bLL3x + 8}
          cy={bLL3y + 3}
          rx={lrx * 0.8}
          ry={lry * 0.8}
          angle={5}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}

      {/* Phase 4 extras */}
      {stage >= 39 && (
        <Leaf
          cx={budX + 10}
          cy={budY + 8}
          rx={lrx * 0.75}
          ry={lry * 0.75}
          angle={15}
          fill={colors.leaf}
          fillHL={colors.leafHL}
          delay={0.1}
        />
      )}
      {stage >= 40 && (
        <Leaf
          cx={budX - 12}
          cy={budY + 6}
          rx={lrx * 0.75}
          ry={lry * 0.75}
          angle={-18}
          fill={colors.leaf}
          fillHL={colors.leafHL}
          delay={0.15}
        />
      )}

      {/* Bud/Flower/Fruit at apex */}
      {stage >= 5 && (
        <BudFlowerFruit
          stage={stage}
          cx={budX}
          cy={budY}
          colors={colors}
          stayHere={stayHere}
        />
      )}
    </g>
  );
}

// ── FOOLISH TREE ─────────────────────────────────────────────────────────────
function FoolishTree({
  stage,
  colors,
  stayHere,
}: { stage: number; colors: Colors; stayHere?: boolean }) {
  const p1 = Math.min(stage / 12, 1);
  const p2 = stage >= 13 ? Math.min((stage - 13) / 12, 1) : 0;
  const p3 = stage >= 26 ? Math.min((stage - 26) / 12, 1) : 0;
  const p4 = stage >= 39 ? Math.min((stage - 39) / 11, 1) : 0;

  const baseY = 245;
  // Slightly tilted trunk
  const trunkBaseX = 102;
  const trunkH = lerp(5, 85, p1 * 0.55 + p2 * 0.3 + p3 * 0.1 + p4 * 0.05);
  // Trunk top drifts left (the "maiwee" lean)
  const trunkTopX = trunkBaseX - p2 * 4 - p3 * 3;
  const trunkTopY = baseY - trunkH;
  const trunkW = 4 + p1 * 2.5 + p2 * 1.5;

  const trunkPath = [
    `M ${trunkBaseX - trunkW} ${baseY}`,
    `C ${trunkBaseX - trunkW * 0.9} ${baseY - trunkH * 0.5} ${trunkTopX - trunkW * 0.7} ${trunkTopY + 12} ${trunkTopX - trunkW * 0.5} ${trunkTopY}`,
    `L ${trunkTopX + trunkW * 0.5} ${trunkTopY}`,
    `C ${trunkTopX + trunkW * 0.7} ${trunkTopY + 12} ${trunkBaseX + trunkW * 0.9} ${baseY - trunkH * 0.5} ${trunkBaseX + trunkW} ${baseY}`,
    "Z",
  ].join(" ");

  const lrx = 11;
  const lry = 8;

  // Main left "lazy" branch - relaxed arc going left
  const mainBranchRootX = trunkTopX;
  const mainBranchRootY = trunkTopY + trunkH * 0.2;
  // Goes casually to the left — not dramatic, relaxed
  const mainBranchTipX = lerp(mainBranchRootX, mainBranchRootX - 55, p2);
  const mainBranchTipY = lerp(mainBranchRootY, mainBranchRootY - 10, p2);
  // Control point for the relaxed curve
  const mainCtrlX = lerp(mainBranchRootX - 20, mainBranchRootX - 30, p2);
  const mainCtrlY = mainBranchRootY + 8; // sags slightly — very relaxed
  const mainBranchW = 2.5 + p1 * 1;

  // Second lazy branch - phase 3, drifts a different way
  const sb2RootX = trunkTopX + 4;
  const sb2RootY = trunkTopY + trunkH * 0.35;
  const sb2TipX = sb2RootX - 28 * p3;
  const sb2TipY = sb2RootY - 32 * p3;
  const sb2W = 1.8 + p2 * 0.7;

  // Bud is at main branch tip (that's where it sits, casually)
  const budX = mainBranchTipX;
  const budY = mainBranchTipY - 8;

  return (
    <g>
      {stage === 0 && (
        <motion.circle
          cx={trunkBaseX}
          cy={baseY - 4}
          r={3}
          fill={colors.leaf}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {stage >= 1 && (
        <motion.path
          d={trunkPath}
          fill={colors.trunk}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Phase 1 leaves — one slightly off to the side */}
      {stage >= 3 && (
        <Leaf
          cx={trunkTopX + 7}
          cy={trunkTopY - 5}
          rx={lrx * 0.7}
          ry={lry * 0.7}
          angle={18}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 5 && (
        <Leaf
          cx={trunkTopX - 5}
          cy={trunkTopY - 10}
          rx={lrx * 0.65}
          ry={lry * 0.65}
          angle={-12}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 7 && (
        <Leaf
          cx={trunkTopX + 2}
          cy={trunkTopY - 16}
          rx={lrx * 0.6}
          ry={lry * 0.6}
          angle={5}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 10 && (
        <Leaf
          cx={trunkTopX - 14}
          cy={trunkTopY - 4}
          rx={lrx * 0.65}
          ry={lry * 0.6}
          angle={-22}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}

      {/* Phase 2: main lazy left branch */}
      {stage >= 13 && (
        <motion.path
          d={`M ${mainBranchRootX} ${mainBranchRootY} Q ${mainCtrlX} ${mainCtrlY} ${mainBranchTipX} ${mainBranchTipY}`}
          stroke={colors.trunk}
          strokeWidth={mainBranchW}
          fill="none"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        />
      )}
      {/* Leaves along the branch */}
      {stage >= 14 && (
        <Leaf
          cx={mainBranchTipX + 6}
          cy={mainBranchTipY - 3}
          rx={lrx}
          ry={lry}
          angle={-8}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 15 && (
        <Leaf
          cx={mainBranchTipX - 4}
          cy={mainBranchTipY - 10}
          rx={lrx * 0.85}
          ry={lry * 0.85}
          angle={-25}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 17 && (
        <Leaf
          cx={lerp(mainBranchRootX, mainBranchTipX, 0.5) + 2}
          cy={lerp(mainBranchRootY, mainBranchTipY, 0.5) - 8}
          rx={lrx * 0.75}
          ry={lry * 0.75}
          angle={-15}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 19 && (
        <Leaf
          cx={mainBranchTipX + 8}
          cy={mainBranchTipY + 6}
          rx={lrx * 0.8}
          ry={lry * 0.8}
          angle={12}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}

      {/* Phase 3: second lazy branch */}
      {stage >= 26 && (
        <motion.line
          x1={sb2RootX}
          y1={sb2RootY}
          x2={sb2TipX}
          y2={sb2TipY}
          stroke={colors.trunk}
          strokeWidth={sb2W}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}
      {stage >= 27 && (
        <Leaf
          cx={sb2TipX - 5}
          cy={sb2TipY - 5}
          rx={lrx * 0.85}
          ry={lry * 0.85}
          angle={-20}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 28 && (
        <Leaf
          cx={sb2TipX + 7}
          cy={sb2TipY - 3}
          rx={lrx * 0.8}
          ry={lry * 0.8}
          angle={15}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Branch extends more in p3 */}
      {stage >= 30 && (
        <Leaf
          cx={mainBranchTipX - 12}
          cy={mainBranchTipY - 5}
          rx={lrx * 0.75}
          ry={lry * 0.75}
          angle={-30}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}

      {/* Phase 4: the branch extends further, more laid-back */}
      {stage >= 39 && (
        <Leaf
          cx={mainBranchTipX - 5}
          cy={mainBranchTipY + 8}
          rx={lrx * 0.9}
          ry={lry * 0.9}
          angle={8}
          fill={colors.leaf}
          fillHL={colors.leafHL}
          delay={0.1}
        />
      )}
      {stage >= 41 && (
        <Leaf
          cx={sb2TipX - 15}
          cy={sb2TipY - 10}
          rx={lrx * 0.8}
          ry={lry * 0.8}
          angle={-35}
          fill={colors.leaf}
          fillHL={colors.leafHL}
          delay={0.15}
        />
      )}

      {/* Bud at branch tip */}
      {stage >= 5 && (
        <BudFlowerFruit
          stage={stage}
          cx={budX}
          cy={budY}
          colors={colors}
          stayHere={stayHere}
        />
      )}
    </g>
  );
}

// ── EMPRESS TREE ─────────────────────────────────────────────────────────────
function EmpressTree({
  stage,
  colors,
  stayHere,
}: { stage: number; colors: Colors; stayHere?: boolean }) {
  const p1 = Math.min(stage / 12, 1);
  const p2 = stage >= 13 ? Math.min((stage - 13) / 12, 1) : 0;
  const p3 = stage >= 26 ? Math.min((stage - 26) / 12, 1) : 0;
  const p4 = stage >= 39 ? Math.min((stage - 39) / 11, 1) : 0;

  const baseY = 245;
  const trunkBaseX = 100;
  // Empress: thick trunk from the start
  const trunkH = lerp(8, 75, p1 * 0.5 + p2 * 0.3 + p3 * 0.15 + p4 * 0.05);
  const trunkTopX = trunkBaseX;
  const trunkTopY = baseY - trunkH;
  // Empress trunk is noticeably wider
  const trunkW = 7 + p1 * 4 + p2 * 2;

  const trunkPath = [
    `M ${trunkBaseX - trunkW} ${baseY}`,
    `C ${trunkBaseX - trunkW * 0.95} ${baseY - trunkH * 0.4} ${trunkTopX - trunkW * 0.7} ${trunkTopY + 8} ${trunkTopX - trunkW * 0.5} ${trunkTopY}`,
    `L ${trunkTopX + trunkW * 0.5} ${trunkTopY}`,
    `C ${trunkTopX + trunkW * 0.7} ${trunkTopY + 8} ${trunkBaseX + trunkW * 0.95} ${baseY - trunkH * 0.4} ${trunkBaseX + trunkW} ${baseY}`,
    "Z",
  ].join(" ");

  const lrx = 12;
  const lry = 9;
  const lrxLg = lrx * 1.15;
  const lryLg = lry * 1.15;

  const branchRootY = trunkTopY + trunkH * 0.18;

  // Phase 2: wide spreading branches — left heavier
  const bLtipX = lerp(trunkTopX, trunkTopX - 50, p2);
  const bLtipY = lerp(branchRootY, branchRootY - 20, p2);
  const bRtipX = lerp(trunkTopX, trunkTopX + 40, p2);
  const bRtipY = lerp(branchRootY, branchRootY - 15, p2);
  const mainBranchW = 4 + p1 * 1.5 + p2 * 1;

  // Phase 3: sub-branches — denser
  const bLLtipX = bLtipX - 20 * p3;
  const bLLtipY = bLtipY - 25 * p3;
  const bLRtipX = bLtipX + 12 * p3;
  const bLRtipY = bLtipY - 28 * p3;
  const bRRtipX = bRtipX + 16 * p3;
  const bRRtipY = bRtipY - 22 * p3;
  const subBranchW = 2.5 + p2 * 0.8;

  // Bud at center-top (slightly left in p4 — left side heavier)
  const budX = trunkTopX - p4 * 6;
  const budY = trunkTopY - 10;

  return (
    <g>
      {stage === 0 && (
        <motion.circle
          cx={trunkBaseX}
          cy={baseY - 4}
          r={4}
          fill={colors.leaf}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {stage >= 1 && (
        <motion.path
          d={trunkPath}
          fill={colors.trunk}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Phase 1 leaves — spread wide from the start */}
      {stage >= 3 && (
        <Leaf
          cx={trunkTopX + 14}
          cy={trunkTopY - 3}
          rx={lrx * 0.85}
          ry={lry * 0.85}
          angle={25}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 4 && (
        <Leaf
          cx={trunkTopX - 14}
          cy={trunkTopY - 3}
          rx={lrx * 0.9}
          ry={lry * 0.9}
          angle={-25}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 5 && (
        <Leaf
          cx={trunkTopX + 3}
          cy={trunkTopY - 12}
          rx={lrx * 0.8}
          ry={lry * 0.8}
          angle={5}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 7 && (
        <Leaf
          cx={trunkTopX - 20}
          cy={trunkTopY - 1}
          rx={lrx * 0.75}
          ry={lry * 0.75}
          angle={-30}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 9 && (
        <Leaf
          cx={trunkTopX + 20}
          cy={trunkTopY - 1}
          rx={lrx * 0.7}
          ry={lry * 0.7}
          angle={28}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}

      {/* Phase 2: left heavy branch */}
      {stage >= 13 && (
        <motion.line
          x1={trunkTopX - 4}
          y1={branchRootY}
          x2={bLtipX}
          y2={bLtipY}
          stroke={colors.trunk}
          strokeWidth={mainBranchW}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}
      {stage >= 14 && (
        <Leaf
          cx={bLtipX - 8}
          cy={bLtipY - 5}
          rx={lrxLg}
          ry={lryLg}
          angle={-28}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 15 && (
        <motion.line
          x1={trunkTopX + 4}
          y1={branchRootY}
          x2={bRtipX}
          y2={bRtipY}
          stroke={colors.trunk}
          strokeWidth={mainBranchW * 0.82}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}
      {stage >= 16 && (
        <Leaf
          cx={bRtipX + 7}
          cy={bRtipY - 5}
          rx={lrx}
          ry={lry}
          angle={26}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 17 && (
        <Leaf
          cx={bLtipX + 10}
          cy={bLtipY + 5}
          rx={lrx}
          ry={lry}
          angle={8}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 18 && (
        <Leaf
          cx={bRtipX - 5}
          cy={bRtipY + 5}
          rx={lrx * 0.85}
          ry={lry * 0.85}
          angle={-8}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 20 && (
        <Leaf
          cx={trunkTopX - 5}
          cy={trunkTopY - 8}
          rx={lrx * 0.8}
          ry={lry * 0.8}
          angle={-10}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}

      {/* Phase 3: denser sub-branches */}
      {stage >= 26 && (
        <motion.line
          x1={bLtipX}
          y1={bLtipY}
          x2={bLLtipX}
          y2={bLLtipY}
          stroke={colors.trunk}
          strokeWidth={subBranchW}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {stage >= 27 && (
        <motion.line
          x1={bLtipX}
          y1={bLtipY}
          x2={bLRtipX}
          y2={bLRtipY}
          stroke={colors.trunk}
          strokeWidth={subBranchW}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {stage >= 28 && (
        <motion.line
          x1={bRtipX}
          y1={bRtipY}
          x2={bRRtipX}
          y2={bRRtipY}
          stroke={colors.trunk}
          strokeWidth={subBranchW * 0.85}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {stage >= 27 && (
        <Leaf
          cx={bLLtipX - 8}
          cy={bLLtipY - 5}
          rx={lrxLg}
          ry={lryLg}
          angle={-30}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 28 && (
        <Leaf
          cx={bLLtipX + 10}
          cy={bLLtipY + 3}
          rx={lrx}
          ry={lry}
          angle={5}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 28 && (
        <Leaf
          cx={bLRtipX - 5}
          cy={bLRtipY - 5}
          rx={lrxLg}
          ry={lryLg}
          angle={-12}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 29 && (
        <Leaf
          cx={bRRtipX + 8}
          cy={bRRtipY - 4}
          rx={lrx}
          ry={lry}
          angle={22}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 30 && (
        <Leaf
          cx={bLRtipX + 10}
          cy={bLRtipY + 4}
          rx={lrx * 0.85}
          ry={lry * 0.85}
          angle={18}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}

      {/* Phase 4: even denser on the left */}
      {stage >= 39 && (
        <Leaf
          cx={bLLtipX - 16}
          cy={bLLtipY - 12}
          rx={lrxLg}
          ry={lryLg}
          angle={-35}
          fill={colors.leaf}
          fillHL={colors.leafHL}
          delay={0.1}
        />
      )}
      {stage >= 40 && (
        <Leaf
          cx={bLRtipX - 14}
          cy={bLRtipY - 10}
          rx={lrx}
          ry={lry}
          angle={-22}
          fill={colors.leaf}
          fillHL={colors.leafHL}
          delay={0.15}
        />
      )}
      {stage >= 42 && (
        <Leaf
          cx={budX - 18}
          cy={budY + 5}
          rx={lrxLg}
          ry={lryLg}
          angle={-28}
          fill={colors.leaf}
          fillHL={colors.leafHL}
          delay={0.2}
        />
      )}

      {/* Bud at center-top */}
      {stage >= 5 && (
        <BudFlowerFruit
          stage={stage}
          cx={budX}
          cy={budY}
          colors={colors}
          stayHere={stayHere}
        />
      )}
    </g>
  );
}

// ── Pot ───────────────────────────────────────────────────────────────────────
function Pot({ personality }: { personality: TreePersonality }) {
  const potColor = C[personality].trunk;
  const potDark = C[personality].trunkDark;
  return (
    <g>
      <path d="M 72 242 Q 64 268 100 272 Q 136 268 128 242 Z" fill={potDark} />
      <ellipse cx={100} cy={242} rx={28} ry={5.5} fill={potColor} />
      <ellipse
        cx={100}
        cy={242}
        rx={28}
        ry={5.5}
        fill={potDark}
        opacity={0.4}
      />
      <ellipse cx={88} cy={259} rx={5} ry={8} fill={potColor} opacity={0.15} />
      <Sparkle x={72} y={235} delay={0} size={3} />
      <Sparkle x={130} y={233} delay={0.6} size={3} />
      <Sparkle x={82} y={264} delay={1.2} size={2.5} />
      <Sparkle x={120} y={266} delay={1.8} size={2.5} />
    </g>
  );
}

export default function PlantGrowth({
  totalMinutes,
  personality,
  stayHere,
}: PlantGrowthProps) {
  const stage = Math.min(Math.floor(totalMinutes / 20), 50);
  const colors = C[personality];

  const next = 20 - (totalMinutes % 20);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        viewBox="0 0 200 280"
        width={190}
        aria-label={`木の成長 段階${stage}`}
        role="img"
      >
        <Pot personality={personality} />
        {personality === "star" && (
          <StarTree stage={stage} colors={colors} stayHere={stayHere} />
        )}
        {personality === "foolish" && (
          <FoolishTree stage={stage} colors={colors} stayHere={stayHere} />
        )}
        {personality === "empress" && (
          <EmpressTree stage={stage} colors={colors} stayHere={stayHere} />
        )}
      </svg>

      <div className="flex flex-col items-center gap-0.5 py-2">
        <p className="text-xs text-gray-400 font-medium tracking-wide">
          段階 {stage} / 50
        </p>
        {stage < 50 ? (
          <p className="text-xs text-gray-400">次の成長まで {next} 分</p>
        ) : stayHere ? (
          <p className="text-xs text-gray-400">この木とともに… ✦</p>
        ) : (
          <p className="text-xs text-gray-400">最大段階に到達しました 🌸</p>
        )}
      </div>
    </div>
  );
}
