import { motion } from "motion/react";

export type TreePersonality = "star" | "flow" | "empress";

interface PlantGrowthProps {
  totalMinutes: number;
  personality: TreePersonality;
  stayHere?: boolean;
}

const C = {
  star: {
    trunk: "hsl(220,8%,75%)",
    trunkDark: "hsl(220,8%,60%)",
    leaf: "hsl(162,40%,65%)",
    leafHL: "hsl(162,40%,82%)",
    fruit: "hsl(48,90%,75%)",
    flower: "hsl(195,55%,82%)",
    flowerCenter: "hsl(48,95%,72%)",
  },
  flow: {
    trunk: "hsl(18,42%,42%)",
    trunkDark: "hsl(18,42%,30%)",
    leaf: "hsl(78,28%,44%)",
    leafHL: "hsl(78,28%,62%)",
    fruit: "hsl(36,80%,58%)",
    flower: "hsl(30,72%,74%)",
    flowerCenter: "hsl(48,95%,72%)",
  },
  empress: {
    trunk: "hsl(218,55%,28%)",
    trunkDark: "hsl(218,55%,18%)",
    leaf: "hsl(158,48%,33%)",
    leafHL: "hsl(158,45%,54%)",
    fruit: "hsl(340,65%,48%)",
    flower: "hsl(300,42%,72%)",
    flowerCenter: "hsl(300,52%,52%)",
  },
};

type Colors = typeof C.star;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

// Parse "hsl(H,S%,L%)" and return shifted version
function shiftHsl(hslStr: string, dH: number, dS: number, dL: number): string {
  const m = hslStr.match(/hsl\((\d+),(\d+)%,(\d+)%\)/);
  if (!m) return hslStr;
  const h = Math.round(Number(m[1]) + dH);
  const s = Math.min(100, Math.max(0, Number(m[2]) + dS));
  const l = Math.min(100, Math.max(0, Number(m[3]) + dL));
  return `hsl(${h},${s}%,${l}%)`;
}

// Returns evolved leaf and trunk colors based on growth stage
function evolveColors(base: Colors, stage: number): Colors {
  if (stage <= 15) return base;
  if (stage <= 35) {
    const t = (stage - 15) / 20;
    return {
      ...base,
      leaf: shiftHsl(base.leaf, 0, Math.round(8 * t), Math.round(-3 * t)),
      leafHL: shiftHsl(base.leafHL, 0, Math.round(6 * t), Math.round(-2 * t)),
      trunk: shiftHsl(base.trunk, 0, Math.round(3 * t), Math.round(-5 * t)),
      trunkDark: shiftHsl(
        base.trunkDark,
        0,
        Math.round(2 * t),
        Math.round(-4 * t),
      ),
    };
  }
  // stage 36-50
  const t2 = (stage - 35) / 15;
  return {
    ...base,
    leaf: shiftHsl(base.leaf, Math.round(-2 * t2), 15, Math.round(-6 * t2)),
    leafHL: shiftHsl(base.leafHL, Math.round(-1 * t2), 12, Math.round(-4 * t2)),
    trunk: shiftHsl(base.trunk, 0, 5, Math.round(-8 * t2)),
    trunkDark: shiftHsl(base.trunkDark, 0, 4, Math.round(-6 * t2)),
  };
}

// Persistent glowing apex dot for Star personality
function ApexGlow({ x, y, stage }: { x: number; y: number; stage: number }) {
  const r = 2.5 + Math.min(stage * 0.1, 3);
  const haloR = r + 3 + Math.min(stage * 0.08, 4);
  return (
    <g>
      <motion.circle
        cx={x}
        cy={y}
        r={haloR}
        fill="hsl(52,90%,75%)"
        animate={{ opacity: [0, 0.28, 0] }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.circle
        cx={x}
        cy={y}
        r={r}
        fill="hsl(52,90%,78%)"
        animate={{ opacity: [0.35, 0.8, 0.35] }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </g>
  );
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

// STAR TREE — Tarot "The Star": hope, light, intuition, symmetry, reaching upward
function StarTree({
  stage,
  colors: baseColors,
  stayHere,
}: { stage: number; colors: Colors; stayHere?: boolean }) {
  const colors = evolveColors(baseColors, stage);

  const p1 = Math.min(stage / 12, 1);
  const p2 = stage >= 13 ? Math.min((stage - 13) / 12, 1) : 0;
  const p3 = stage >= 26 ? Math.min((stage - 26) / 12, 1) : 0;
  const p4 = stage >= 39 ? Math.min((stage - 39) / 11, 1) : 0;

  const baseY = 245;
  const trunkBaseX = 103;
  const trunkH = lerp(6, 92, p1 * 0.55 + p2 * 0.28 + p3 * 0.12 + p4 * 0.05);
  const trunkTopX = trunkBaseX + p3 * 3 + p4 * 4;
  const trunkTopY = baseY - trunkH;
  const trunkW = 2.5 + p1 * 2 + p2 * 0.8;

  const trunkPath = [
    `M ${trunkBaseX - trunkW} ${baseY}`,
    `C ${trunkBaseX - trunkW * 0.8} ${baseY - trunkH * 0.35} ${trunkTopX - trunkW * 0.6} ${trunkTopY + 8} ${trunkTopX - trunkW * 0.4} ${trunkTopY}`,
    `L ${trunkTopX + trunkW * 0.4} ${trunkTopY}`,
    `C ${trunkTopX + trunkW * 0.6} ${trunkTopY + 8} ${trunkBaseX + trunkW * 0.8} ${baseY - trunkH * 0.35} ${trunkBaseX + trunkW} ${baseY}`,
    "Z",
  ].join(" ");

  const lrx = 10;
  const lry = 7;
  const apexX = trunkTopX;
  const apexY = trunkTopY - 6;

  const branchRootY = trunkTopY + trunkH * 0.12;
  const bLx = lerp(trunkTopX, trunkTopX - 30, p2);
  const bLy = lerp(branchRootY, branchRootY - 35, p2);
  const bRx = lerp(trunkTopX, trunkTopX + 27, p2);
  const bRy = lerp(branchRootY, branchRootY - 30, p2);
  const branchW = 2 + p1 * 1.2;

  const bLLx = bLx - 14 * p3;
  const bLLy = bLy - 22 * p3;
  const bLRx = bLx + 12 * p3;
  const bLRy = bLy - 24 * p3;
  const bRLx = bRx + 12 * p3;
  const bRLy = bRy - 20 * p3;
  const bRRx = bRx - 10 * p3;
  const bRRy = bRy - 24 * p3;
  const subW = 1.4 + p2 * 0.7;

  const budX = trunkTopX + p4 * 4;
  const budY = trunkTopY - 10;

  // Early branch stubs appear at stage 10 (hint of what's coming)
  const stubLen = stage >= 10 && stage < 13 ? 8 : 0;

  return (
    <g>
      {stage === 1 && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0 }}
        >
          {/* thin filament */}
          <line
            x1={103}
            y1={240}
            x2={103}
            y2={210}
            stroke="hsl(175, 55%, 72%)"
            strokeWidth={1.2}
            strokeLinecap="round"
          />
          {/* halo */}
          <motion.circle
            cx={103}
            cy={208}
            r={9}
            fill="hsl(52, 90%, 85%)"
            animate={{ opacity: [0.08, 0.22, 0.08] }}
            transition={{
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          {/* orb */}
          <motion.circle
            cx={103}
            cy={208}
            r={3}
            fill="hsl(52, 90%, 88%)"
            animate={{ opacity: [0.5, 1.0, 0.5] }}
            transition={{
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </motion.g>
      )}

      {stage >= 2 && (
        <motion.path
          d={trunkPath}
          fill={colors.trunk}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {stage >= 2 && <ApexGlow x={apexX} y={apexY} stage={stage} />}

      {/* Stage 10: subtle branch stub preview — no leaves yet */}
      {stubLen > 0 && (
        <>
          <motion.line
            x1={trunkTopX}
            y1={branchRootY}
            x2={trunkTopX - stubLen}
            y2={branchRootY - stubLen * 0.8}
            stroke={colors.trunk}
            strokeWidth={1.5}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          <motion.line
            x1={trunkTopX}
            y1={branchRootY}
            x2={trunkTopX + stubLen}
            y2={branchRootY - stubLen * 0.6}
            stroke={colors.trunk}
            strokeWidth={1.4}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
        </>
      )}

      {/* Leaves — stage 2 through 10, one visible step per stage */}
      {stage >= 2 && (
        <Leaf
          cx={trunkTopX + 8}
          cy={trunkTopY - 3}
          rx={lrx * 0.62}
          ry={lry * 0.62}
          angle={22}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 3 && (
        <Leaf
          cx={trunkTopX - 7}
          cy={trunkTopY - 6}
          rx={lrx * 0.6}
          ry={lry * 0.6}
          angle={-18}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Stage 4: 3rd leaf higher up */}
      {stage >= 4 && (
        <Leaf
          cx={trunkTopX + 5}
          cy={trunkTopY - 14}
          rx={lrx * 0.65}
          ry={lry * 0.65}
          angle={5}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Stage 5: 4th leaf */}
      {stage >= 5 && (
        <Leaf
          cx={trunkTopX - 6}
          cy={trunkTopY - 20}
          rx={lrx * 0.63}
          ry={lry * 0.63}
          angle={-10}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Stage 6: 5th leaf */}
      {stage >= 6 && (
        <Leaf
          cx={trunkTopX + 7}
          cy={trunkTopY - 26}
          rx={lrx * 0.65}
          ry={lry * 0.65}
          angle={8}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Stage 7: 6th leaf, slightly larger */}
      {stage >= 7 && (
        <Leaf
          cx={trunkTopX - 9}
          cy={trunkTopY - 30}
          rx={lrx * 0.68}
          ry={lry * 0.68}
          angle={-14}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Stage 8: leaves grow noticeably; add one at a new angle */}
      {stage >= 8 && (
        <Leaf
          cx={trunkTopX + 10}
          cy={trunkTopY - 10}
          rx={lrx * 0.72}
          ry={lry * 0.72}
          angle={30}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Stage 9: 7th leaf climbs further */}
      {stage >= 9 && (
        <Leaf
          cx={trunkTopX - 4}
          cy={trunkTopY - 34}
          rx={lrx * 0.7}
          ry={lry * 0.7}
          angle={-5}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}

      {/* Stage 6 sparkle near apex — first light sign */}
      {stage >= 6 && stage < 13 && (
        <Sparkle x={trunkTopX + 12} y={apexY - 8} delay={0.5} size={2.5} />
      )}

      {stage >= 13 && (
        <motion.line
          x1={trunkTopX}
          y1={branchRootY}
          x2={bLx}
          y2={bLy}
          stroke={colors.trunk}
          strokeWidth={branchW}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}
      {stage >= 14 && (
        <Leaf
          cx={bLx - 5}
          cy={bLy - 5}
          rx={lrx * 0.85}
          ry={lry * 0.85}
          angle={-26}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 15 && (
        <motion.line
          x1={trunkTopX}
          y1={branchRootY}
          x2={bRx}
          y2={bRy}
          stroke={colors.trunk}
          strokeWidth={branchW * 0.9}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}
      {stage >= 16 && (
        <Leaf
          cx={bRx + 5}
          cy={bRy - 5}
          rx={lrx * 0.82}
          ry={lry * 0.82}
          angle={24}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 17 && (
        <Leaf
          cx={bLx + 6}
          cy={bLy + 5}
          rx={lrx * 0.75}
          ry={lry * 0.75}
          angle={10}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 18 && (
        <Leaf
          cx={bRx - 5}
          cy={bRy + 5}
          rx={lrx * 0.72}
          ry={lry * 0.72}
          angle={-12}
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
          angle={-6}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}

      {stage >= 26 && (
        <motion.line
          x1={bLx}
          y1={bLy}
          x2={bLLx}
          y2={bLLy}
          stroke={colors.trunk}
          strokeWidth={subW}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {stage >= 27 && (
        <motion.line
          x1={bLx}
          y1={bLy}
          x2={bLRx}
          y2={bLRy}
          stroke={colors.trunk}
          strokeWidth={subW}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {stage >= 27 && (
        <motion.line
          x1={bRx}
          y1={bRy}
          x2={bRRx}
          y2={bRRy}
          stroke={colors.trunk}
          strokeWidth={subW}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {stage >= 28 && (
        <motion.line
          x1={bRx}
          y1={bRy}
          x2={bRLx}
          y2={bRLy}
          stroke={colors.trunk}
          strokeWidth={subW * 0.85}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {stage >= 27 && (
        <Leaf
          cx={bLLx - 4}
          cy={bLLy - 4}
          rx={lrx * 0.9}
          ry={lry * 0.9}
          angle={-28}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 28 && (
        <Leaf
          cx={bLRx}
          cy={bLRy - 5}
          rx={lrx}
          ry={lry}
          angle={-5}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 28 && (
        <Leaf
          cx={bRRx - 4}
          cy={bRRy - 4}
          rx={lrx * 0.88}
          ry={lry * 0.88}
          angle={20}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 29 && (
        <Leaf
          cx={bRLx + 5}
          cy={bRLy - 4}
          rx={lrx * 0.82}
          ry={lry * 0.82}
          angle={18}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 30 && (
        <Leaf
          cx={bLLx + 8}
          cy={bLLy + 3}
          rx={lrx * 0.78}
          ry={lry * 0.78}
          angle={5}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}

      {/* Sparkles — build up gradually from stage 26 */}
      {stage >= 26 && (
        <Sparkle x={bLLx - 8} y={bLLy - 10} delay={0.4} size={2.5} />
      )}
      {stage >= 30 && (
        <Sparkle x={bRRx + 8} y={bRRy - 8} delay={1.2} size={2.5} />
      )}
      {/* Stage 30+: more sparkles near apex and branch tips */}
      {stage >= 32 && (
        <Sparkle x={apexX - 16} y={apexY - 14} delay={0.7} size={2.8} />
      )}
      {stage >= 35 && (
        <Sparkle x={trunkTopX - 22} y={trunkTopY - 30} delay={0.9} size={3} />
      )}
      {stage >= 38 && (
        <Sparkle x={bLx - 10} y={bLy - 14} delay={1.5} size={2.5} />
      )}
      {stage >= 40 && (
        <Sparkle x={trunkTopX + 20} y={trunkTopY - 28} delay={1.6} size={3} />
      )}
      {stage >= 42 && (
        <Sparkle x={bRx + 12} y={bRy - 16} delay={0.3} size={2.5} />
      )}
      {stage >= 45 && (
        <Sparkle x={apexX + 18} y={apexY - 20} delay={1.1} size={3} />
      )}

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

// FLOW TREE — Tarot "The Fool": freedom, wandering, carefree, maiwee
function FlowTree({
  stage,
  colors: baseColors,
  stayHere,
}: { stage: number; colors: Colors; stayHere?: boolean }) {
  const colors = evolveColors(baseColors, stage);

  const p1 = Math.min(stage / 12, 1);
  const p2 = stage >= 13 ? Math.min((stage - 13) / 12, 1) : 0;
  const p3 = stage >= 26 ? Math.min((stage - 26) / 12, 1) : 0;

  const baseY = 245;
  const trunkBaseX = 108;
  const trunkH = lerp(
    6,
    82,
    p1 * 0.5 +
      p2 * 0.3 +
      p3 * 0.15 +
      (stage >= 39 ? Math.min((stage - 39) / 11, 1) * 0.05 : 0),
  );
  // Lean LEFT noticeably from stage 1 — emphasize from the very start
  const leanAmount = 22 + p2 * 9 + p3 * 4;
  const trunkTopX = trunkBaseX - leanAmount;
  const trunkTopY = baseY - trunkH;
  const trunkW = 3.5 + p1 * 2.5 + p2 * 1.5;

  const trunkPath = [
    `M ${trunkBaseX - trunkW * 0.6} ${baseY}`,
    `C ${trunkBaseX - trunkW * 0.8} ${baseY - trunkH * 0.45} ${trunkTopX - trunkW * 0.6} ${trunkTopY + 14} ${trunkTopX - trunkW * 0.45} ${trunkTopY}`,
    `L ${trunkTopX + trunkW * 0.55} ${trunkTopY}`,
    `C ${trunkTopX + trunkW * 0.7} ${trunkTopY + 14} ${trunkBaseX + trunkW * 0.9} ${baseY - trunkH * 0.45} ${trunkBaseX + trunkW * 0.6} ${baseY}`,
    "Z",
  ].join(" ");

  const lrx = 11;
  const lry = 8;

  const branchRootX = trunkTopX;
  const branchRootY = trunkTopY + trunkH * 0.15;
  const branchCtrlX = branchRootX - 22;
  const branchCtrlY = branchRootY + 12;
  const branchTipX = lerp(branchRootX, branchRootX - 50, p2);
  const branchTipY = lerp(branchRootY, branchRootY - 5, p2);
  const mainBW = 2.5 + p1 * 0.8;

  const rbRootX = trunkTopX + 2;
  const rbRootY = trunkTopY + trunkH * 0.3;
  const rbTipX = rbRootX + 35 * p2;
  const rbTipY = rbRootY + 8 * p2;
  const rbCtrlX = rbRootX + 18;
  const rbCtrlY = rbRootY - 5;

  const sb3RootX = branchRootX - 8;
  const sb3RootY = branchRootY + trunkH * 0.25;
  const sb3TipX = sb3RootX - 20 * p3;
  const sb3TipY = sb3RootY - 35 * p3;

  const budX = branchTipX;
  const budY = branchTipY - 9;

  // Secondary exploratory tendril (right, organic) appears at stage 8
  const tendrP = stage >= 8 ? Math.min((stage - 8) / 5, 1) : 0;
  const tendrRootX = trunkTopX + trunkW * 0.3;
  const tendrRootY = trunkTopY + trunkH * 0.4;
  const tendrTipX = tendrRootX + 18 * tendrP;
  const tendrTipY = tendrRootY - 22 * tendrP;
  const tendrCtrlX = tendrRootX + 8;
  const tendrCtrlY = tendrRootY - 10;

  return (
    <g>
      {stage === 1 && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
        >
          {/* curved hooked shoot leaning left — strong lean from birth */}
          <path
            d="M 108 240 Q 98 220 88 208"
            stroke="hsl(78, 45%, 52%)"
            strokeWidth={2.8}
            fill="none"
            strokeLinecap="round"
          />
          {/* rounded bud at tip */}
          <circle cx={87} cy={205} r={5} fill="hsl(78, 45%, 55%)" />
          <circle
            cx={87}
            cy={205}
            r={2.5}
            fill="hsl(78, 55%, 72%)"
            opacity={0.7}
          />
        </motion.g>
      )}

      {stage >= 2 && (
        <motion.path
          d={trunkPath}
          fill={colors.trunk}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Leaves stages 2-10 with asymmetric, tilted placement */}
      {stage >= 2 && (
        <Leaf
          cx={trunkTopX - 12}
          cy={trunkTopY - 3}
          rx={lrx * 0.72}
          ry={lry * 0.72}
          angle={-28}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 3 && (
        <Leaf
          cx={trunkTopX + 9}
          cy={trunkTopY - 5}
          rx={lrx * 0.58}
          ry={lry * 0.58}
          angle={22}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Stage 4: third leaf, notably tilted */}
      {stage >= 4 && (
        <Leaf
          cx={trunkTopX - 18}
          cy={trunkTopY - 10}
          rx={lrx * 0.68}
          ry={lry * 0.68}
          angle={-35}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Stage 5-7: irregular placement — Flow's wandering nature */}
      {stage >= 5 && (
        <Leaf
          cx={trunkTopX + 3}
          cy={trunkTopY - 17}
          rx={lrx * 0.62}
          ry={lry * 0.62}
          angle={12}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 6 && (
        <Leaf
          cx={trunkTopX - 22}
          cy={trunkTopY - 6}
          rx={lrx * 0.7}
          ry={lry * 0.65}
          angle={-40}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 7 && (
        <Leaf
          cx={trunkTopX - 8}
          cy={trunkTopY - 22}
          rx={lrx * 0.65}
          ry={lry * 0.62}
          angle={-8}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Stage 8: tendril appears, leaf at base of it */}
      {stage >= 8 && tendrP > 0 && (
        <motion.path
          d={`M ${tendrRootX} ${tendrRootY} Q ${tendrCtrlX} ${tendrCtrlY} ${tendrTipX} ${tendrTipY}`}
          stroke={colors.trunk}
          strokeWidth={1.4}
          fill="none"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        />
      )}
      {stage >= 8 && (
        <Leaf
          cx={trunkTopX + 6}
          cy={trunkTopY - 28}
          rx={lrx * 0.6}
          ry={lry * 0.6}
          angle={16}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 9 && (
        <Leaf
          cx={tendrTipX + 5}
          cy={tendrTipY - 4}
          rx={lrx * 0.55}
          ry={lry * 0.55}
          angle={20}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 10 && (
        <Leaf
          cx={trunkTopX - 26}
          cy={trunkTopY - 2}
          rx={lrx * 0.65}
          ry={lry * 0.6}
          angle={-38}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}

      {stage >= 13 && (
        <motion.path
          d={`M ${branchRootX} ${branchRootY} Q ${branchCtrlX} ${branchCtrlY} ${branchTipX} ${branchTipY}`}
          stroke={colors.trunk}
          strokeWidth={mainBW}
          fill="none"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        />
      )}
      {stage >= 14 && (
        <motion.path
          d={`M ${rbRootX} ${rbRootY} Q ${rbCtrlX} ${rbCtrlY} ${rbTipX} ${rbTipY}`}
          stroke={colors.trunk}
          strokeWidth={mainBW * 0.75}
          fill="none"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}
      {stage >= 14 && (
        <Leaf
          cx={branchTipX + 7}
          cy={branchTipY - 2}
          rx={lrx}
          ry={lry}
          angle={-8}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 15 && (
        <Leaf
          cx={branchTipX - 4}
          cy={branchTipY - 9}
          rx={lrx * 0.88}
          ry={lry * 0.88}
          angle={-25}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 15 && (
        <Leaf
          cx={rbTipX + 5}
          cy={rbTipY - 3}
          rx={lrx * 0.78}
          ry={lry * 0.78}
          angle={15}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 17 && (
        <Leaf
          cx={lerp(branchRootX, branchTipX, 0.5) + 2}
          cy={lerp(branchRootY, branchTipY, 0.5) - 6}
          rx={lrx * 0.75}
          ry={lry * 0.75}
          angle={-16}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 19 && (
        <Leaf
          cx={branchTipX + 10}
          cy={branchTipY + 7}
          rx={lrx * 0.82}
          ry={lry * 0.82}
          angle={12}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}

      {stage >= 26 && (
        <motion.line
          x1={sb3RootX}
          y1={sb3RootY}
          x2={sb3TipX}
          y2={sb3TipY}
          stroke={colors.trunk}
          strokeWidth={1.8 + p2 * 0.6}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}
      {stage >= 27 && (
        <Leaf
          cx={sb3TipX - 5}
          cy={sb3TipY - 5}
          rx={lrx * 0.88}
          ry={lry * 0.88}
          angle={-22}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 28 && (
        <Leaf
          cx={sb3TipX + 7}
          cy={sb3TipY - 3}
          rx={lrx * 0.8}
          ry={lry * 0.8}
          angle={14}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 29 && (
        <Leaf
          cx={branchTipX - 12}
          cy={branchTipY - 5}
          rx={lrx * 0.78}
          ry={lry * 0.78}
          angle={-30}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 30 && (
        <Leaf
          cx={rbTipX - 5}
          cy={rbTipY + 8}
          rx={lrx * 0.75}
          ry={lry * 0.75}
          angle={20}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}

      {stage >= 39 && (
        <Leaf
          cx={branchTipX - 5}
          cy={branchTipY + 9}
          rx={lrx * 0.9}
          ry={lry * 0.9}
          angle={8}
          fill={colors.leaf}
          fillHL={colors.leafHL}
          delay={0.1}
        />
      )}
      {stage >= 40 && (
        <Leaf
          cx={sb3TipX - 15}
          cy={sb3TipY - 10}
          rx={lrx * 0.82}
          ry={lry * 0.82}
          angle={-36}
          fill={colors.leaf}
          fillHL={colors.leafHL}
          delay={0.15}
        />
      )}

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

// EMPRESS TREE — Tarot "The Empress": abundance, motherly, lush, wide sheltering canopy
function EmpressTree({
  stage,
  colors: baseColors,
  stayHere,
}: { stage: number; colors: Colors; stayHere?: boolean }) {
  const colors = evolveColors(baseColors, stage);

  const p1 = Math.min(stage / 12, 1);
  const p2 = stage >= 13 ? Math.min((stage - 13) / 12, 1) : 0;
  const p3 = stage >= 26 ? Math.min((stage - 26) / 12, 1) : 0;
  const p4 = stage >= 39 ? Math.min((stage - 39) / 11, 1) : 0;

  const baseY = 245;
  const trunkBaseX = 100;
  const trunkH = lerp(10, 68, p1 * 0.45 + p2 * 0.3 + p3 * 0.18 + p4 * 0.07);
  const trunkTopX = trunkBaseX;
  const trunkTopY = baseY - trunkH;
  // THICK trunk from stage 2 — visually imposing even when short
  const trunkW = 10 + p1 * 5.5 + p2 * 2.5;

  const trunkPath = [
    `M ${trunkBaseX - trunkW} ${baseY}`,
    `C ${trunkBaseX - trunkW * 0.92} ${baseY - trunkH * 0.38} ${trunkTopX - trunkW * 0.65} ${trunkTopY + 10} ${trunkTopX - trunkW * 0.45} ${trunkTopY}`,
    `L ${trunkTopX + trunkW * 0.45} ${trunkTopY}`,
    `C ${trunkTopX + trunkW * 0.65} ${trunkTopY + 10} ${trunkBaseX + trunkW * 0.92} ${baseY - trunkH * 0.38} ${trunkBaseX + trunkW} ${baseY}`,
    "Z",
  ].join(" ");

  const lrx = 13;
  const lry = 10;
  const lrxLg = lrx * 1.2;
  const lryLg = lry * 1.2;

  const branchRootY = trunkTopY + trunkH * 0.16;

  const bLtipX = lerp(trunkTopX, trunkTopX - 62, p2);
  const bLtipY = lerp(branchRootY, branchRootY - 18, p2);
  const bRtipX = lerp(trunkTopX, trunkTopX + 52, p2);
  const bRtipY = lerp(branchRootY, branchRootY - 14, p2);
  const mainBW = 5 + p1 * 2 + p2 * 1.2;

  const bLLtipX = bLtipX - 22 * p3;
  const bLLtipY = bLtipY - 22 * p3;
  const bLRtipX = bLtipX + 14 * p3;
  const bLRtipY = bLtipY - 26 * p3;
  const bRRtipX = bRtipX + 18 * p3;
  const bRRtipY = bRtipY - 18 * p3;
  const bRLtipX = bRtipX - 12 * p3;
  const bRLtipY = bRtipY - 28 * p3;
  const subBW = 3 + p2 * 1;

  const budX = trunkTopX;
  const budY = trunkTopY - 12;

  return (
    <g>
      {stage === 1 && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
        >
          {/* wide dome — seed/embryo cap pushing through */}
          <ellipse cx={100} cy={232} rx={14} ry={9} fill="hsl(158, 48%, 33%)" />
          {/* highlight giving roundness/fullness */}
          <ellipse
            cx={97}
            cy={228}
            rx={7}
            ry={4}
            fill="hsl(158, 45%, 54%)"
            opacity={0.55}
          />
        </motion.g>
      )}

      {stage >= 2 && (
        <motion.path
          d={trunkPath}
          fill={colors.trunk}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Stage 2: wide spreading leaves — arms opening */}
      {stage >= 2 && (
        <Leaf
          cx={trunkTopX + 18}
          cy={trunkTopY - 1}
          rx={lrx * 0.95}
          ry={lry * 0.95}
          angle={32}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 2 && (
        <Leaf
          cx={trunkTopX - 18}
          cy={trunkTopY - 1}
          rx={lrx}
          ry={lry}
          angle={-32}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Stage 3: top leaf, wide */}
      {stage >= 3 && (
        <Leaf
          cx={trunkTopX + 4}
          cy={trunkTopY - 13}
          rx={lrx * 0.9}
          ry={lry * 0.9}
          angle={5}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Stage 4: outer leaves spread further */}
      {stage >= 4 && (
        <Leaf
          cx={trunkTopX - 26}
          cy={trunkTopY + 1}
          rx={lrx * 0.88}
          ry={lry * 0.88}
          angle={-38}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 4 && (
        <Leaf
          cx={trunkTopX + 26}
          cy={trunkTopY + 1}
          rx={lrx * 0.85}
          ry={lry * 0.85}
          angle={36}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Stage 5: dome takes shape, center leaf higher */}
      {stage >= 5 && (
        <Leaf
          cx={trunkTopX - 10}
          cy={trunkTopY - 20}
          rx={lrx * 0.85}
          ry={lry * 0.85}
          angle={-12}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Stage 6: right side mirror */}
      {stage >= 6 && (
        <Leaf
          cx={trunkTopX + 10}
          cy={trunkTopY - 20}
          rx={lrx * 0.82}
          ry={lry * 0.82}
          angle={14}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Stage 7: outer leaves grow larger */}
      {stage >= 7 && (
        <Leaf
          cx={trunkTopX - 30}
          cy={trunkTopY - 6}
          rx={lrxLg * 0.82}
          ry={lryLg * 0.82}
          angle={-42}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Stage 8: right outer large leaf */}
      {stage >= 8 && (
        <Leaf
          cx={trunkTopX + 30}
          cy={trunkTopY - 4}
          rx={lrxLg * 0.8}
          ry={lryLg * 0.8}
          angle={40}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Stage 9-10: proto-canopy dome, dome feeling */}
      {stage >= 9 && (
        <Leaf
          cx={trunkTopX - 14}
          cy={trunkTopY - 26}
          rx={lrx * 0.88}
          ry={lry * 0.88}
          angle={-8}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 10 && (
        <Leaf
          cx={trunkTopX + 14}
          cy={trunkTopY - 24}
          rx={lrx * 0.85}
          ry={lry * 0.85}
          angle={10}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}

      {stage >= 13 && (
        <motion.line
          x1={trunkTopX - 5}
          y1={branchRootY}
          x2={bLtipX}
          y2={bLtipY}
          stroke={colors.trunk}
          strokeWidth={mainBW}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}
      {stage >= 13 && (
        <Leaf
          cx={bLtipX - 10}
          cy={bLtipY - 5}
          rx={lrxLg}
          ry={lryLg}
          angle={-30}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 14 && (
        <motion.line
          x1={trunkTopX + 5}
          y1={branchRootY}
          x2={bRtipX}
          y2={bRtipY}
          stroke={colors.trunk}
          strokeWidth={mainBW * 0.85}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}
      {stage >= 15 && (
        <Leaf
          cx={bRtipX + 8}
          cy={bRtipY - 4}
          rx={lrx}
          ry={lry}
          angle={28}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 16 && (
        <Leaf
          cx={bLtipX + 12}
          cy={bLtipY + 6}
          rx={lrx}
          ry={lry}
          angle={8}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 17 && (
        <Leaf
          cx={bRtipX - 6}
          cy={bRtipY + 6}
          rx={lrx * 0.9}
          ry={lry * 0.9}
          angle={-10}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 19 && (
        <Leaf
          cx={trunkTopX - 6}
          cy={trunkTopY - 8}
          rx={lrx * 0.85}
          ry={lry * 0.85}
          angle={-8}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 20 && (
        <Leaf
          cx={lerp(trunkTopX, bLtipX, 0.5) - 4}
          cy={lerp(branchRootY, bLtipY, 0.5) - 6}
          rx={lrx * 0.88}
          ry={lry * 0.88}
          angle={-18}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Stages 21-25: abundant canopy expansion */}
      {stage >= 21 && (
        <Leaf
          cx={lerp(trunkTopX, bRtipX, 0.5) + 5}
          cy={lerp(branchRootY, bRtipY, 0.5) - 8}
          rx={lrxLg * 0.9}
          ry={lryLg * 0.9}
          angle={16}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 22 && (
        <Leaf
          cx={bLtipX + 22}
          cy={bLtipY - 14}
          rx={lrxLg * 0.92}
          ry={lryLg * 0.92}
          angle={-6}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 23 && (
        <Leaf
          cx={bRtipX - 18}
          cy={bRtipY - 16}
          rx={lrxLg * 0.88}
          ry={lryLg * 0.88}
          angle={4}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 24 && (
        <Leaf
          cx={trunkTopX + 6}
          cy={trunkTopY - 14}
          rx={lrx * 0.92}
          ry={lry * 0.92}
          angle={6}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 25 && (
        <Leaf
          cx={bLtipX - 5}
          cy={bLtipY - 18}
          rx={lrxLg}
          ry={lryLg}
          angle={-24}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}

      {stage >= 26 && (
        <motion.line
          x1={bLtipX}
          y1={bLtipY}
          x2={bLLtipX}
          y2={bLLtipY}
          stroke={colors.trunk}
          strokeWidth={subBW}
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
          strokeWidth={subBW}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {stage >= 27 && (
        <motion.line
          x1={bRtipX}
          y1={bRtipY}
          x2={bRRtipX}
          y2={bRRtipY}
          stroke={colors.trunk}
          strokeWidth={subBW * 0.85}
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
          x2={bRLtipX}
          y2={bRLtipY}
          stroke={colors.trunk}
          strokeWidth={subBW * 0.9}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {stage >= 26 && (
        <Leaf
          cx={bLLtipX - 10}
          cy={bLLtipY - 5}
          rx={lrxLg}
          ry={lryLg}
          angle={-32}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 27 && (
        <Leaf
          cx={bLRtipX - 5}
          cy={bLRtipY - 6}
          rx={lrxLg}
          ry={lryLg}
          angle={-10}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 27 && (
        <Leaf
          cx={bLLtipX + 12}
          cy={bLLtipY + 5}
          rx={lrx}
          ry={lry}
          angle={6}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 28 && (
        <Leaf
          cx={bRRtipX + 9}
          cy={bRRtipY - 4}
          rx={lrx}
          ry={lry}
          angle={24}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 28 && (
        <Leaf
          cx={bRLtipX - 6}
          cy={bRLtipY - 6}
          rx={lrxLg}
          ry={lryLg}
          angle={-15}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 29 && (
        <Leaf
          cx={bLRtipX + 12}
          cy={bLRtipY + 5}
          rx={lrx * 0.9}
          ry={lry * 0.9}
          angle={20}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 30 && (
        <Leaf
          cx={bRRtipX - 8}
          cy={bRRtipY + 6}
          rx={lrx * 0.88}
          ry={lry * 0.88}
          angle={-18}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {/* Stages 31-35: further canopy fullness */}
      {stage >= 31 && (
        <Leaf
          cx={bLLtipX - 20}
          cy={bLLtipY + 2}
          rx={lrxLg * 0.95}
          ry={lryLg * 0.95}
          angle={-40}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 33 && (
        <Leaf
          cx={bRRtipX + 20}
          cy={bRRtipY + 2}
          rx={lrxLg * 0.92}
          ry={lryLg * 0.92}
          angle={38}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}
      {stage >= 35 && (
        <Leaf
          cx={trunkTopX - 8}
          cy={trunkTopY - 20}
          rx={lrxLg}
          ry={lryLg}
          angle={-6}
          fill={colors.leaf}
          fillHL={colors.leafHL}
        />
      )}

      {stage >= 39 && (
        <Leaf
          cx={bLLtipX - 18}
          cy={bLLtipY - 12}
          rx={lrxLg}
          ry={lryLg}
          angle={-38}
          fill={colors.leaf}
          fillHL={colors.leafHL}
          delay={0.1}
        />
      )}
      {stage >= 39 && (
        <Leaf
          cx={bRRtipX + 18}
          cy={bRRtipY - 10}
          rx={lrx}
          ry={lry}
          angle={30}
          fill={colors.leaf}
          fillHL={colors.leafHL}
          delay={0.12}
        />
      )}
      {stage >= 40 && (
        <Leaf
          cx={bLRtipX - 14}
          cy={bLRtipY - 12}
          rx={lrx}
          ry={lry}
          angle={-24}
          fill={colors.leaf}
          fillHL={colors.leafHL}
          delay={0.15}
        />
      )}
      {stage >= 42 && (
        <Leaf
          cx={budX - 20}
          cy={budY + 6}
          rx={lrxLg}
          ry={lryLg}
          angle={-30}
          fill={colors.leaf}
          fillHL={colors.leafHL}
          delay={0.2}
        />
      )}
      {stage >= 42 && (
        <Leaf
          cx={budX + 18}
          cy={budY + 8}
          rx={lrxLg}
          ry={lryLg}
          angle={26}
          fill={colors.leaf}
          fillHL={colors.leafHL}
          delay={0.22}
        />
      )}

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

// Terracotta pot — warm, grounded, same for all personalities
function Pot() {
  const potBody = "hsl(18,45%,42%)";
  const potRim = "hsl(18,45%,52%)";
  const potHighlight = "hsl(28,50%,62%)";
  const soilColor = "hsl(25,30%,28%)";
  return (
    <g>
      {/* Pot body */}
      <path d="M 72 242 Q 64 268 100 272 Q 136 268 128 242 Z" fill={potBody} />
      {/* Rim */}
      <ellipse cx={100} cy={242} rx={28} ry={5.5} fill={potRim} />
      {/* Highlight glint */}
      <ellipse
        cx={85}
        cy={259}
        rx={5}
        ry={8}
        fill={potHighlight}
        opacity={0.18}
      />
      {/* Soil line inside rim */}
      <ellipse
        cx={100}
        cy={243}
        rx={22}
        ry={3}
        fill={soilColor}
        opacity={0.55}
      />
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
        <Pot />
        {personality === "star" && (
          <StarTree stage={stage} colors={colors} stayHere={stayHere} />
        )}
        {personality === "flow" && (
          <FlowTree stage={stage} colors={colors} stayHere={stayHere} />
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
