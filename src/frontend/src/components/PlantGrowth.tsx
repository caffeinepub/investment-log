import { motion } from "motion/react";

interface PlantGrowthProps {
  totalMinutes: number;
}

const PETAL_ANGLES = [0, 72, 144, 216, 288];

export default function PlantGrowth({ totalMinutes }: PlantGrowthProps) {
  const stage = Math.min(Math.floor(totalMinutes / 20), 50);

  // Green color interpolation
  const hue = 110 + (stage / 50) * 20;
  const sat = 40 + (stage / 50) * 35;
  const light = 55 - (stage / 50) * 25;
  const greenColor = `hsl(${hue}, ${sat}%, ${light}%)`;
  const leafColor = `hsl(${hue}, ${sat}%, ${Math.min(light + 10, 80)}%)`;

  // Trunk dimensions
  const trunkHeight = 80 + (stage / 50) * 80;
  const trunkWidth = 10 + Math.max(0, (stage - 25) / 25) * 6;
  const trunkBottom = 240;
  const trunkTop = trunkBottom - trunkHeight;
  const trunkX = 100 - trunkWidth / 2;

  // Leaves
  const leafCount = Math.min(Math.floor(stage / 5), 10);
  const leaves = Array.from({ length: leafCount }, (_, i) => {
    const y = trunkBottom - ((i + 1) * trunkHeight) / (leafCount + 1);
    const isLeft = i % 2 === 1;
    const rx = 14 - (i / Math.max(leafCount - 1, 1)) * 5;
    const ry = rx * 0.5;
    const cx = isLeft ? 100 - 22 : 100 + 22;
    const rotation = isLeft ? -30 : 30;
    return { i, y, cx, rx, ry, rotation };
  });

  // Buds (stage >= 30)
  const showBuds = stage >= 30;
  const budY = trunkTop + 12;

  // Flower (stage >= 45)
  const showFlower = stage >= 45;
  const flowerY = trunkTop - 4;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox="0 0 200 260"
        width="160"
        height="208"
        aria-label={`植物の成長 段階${stage}`}
        role="img"
      >
        <title>植物の成長 段階 {stage} / 50</title>

        {/* Trunk */}
        <rect
          x={trunkX}
          y={trunkTop}
          width={trunkWidth}
          height={trunkHeight}
          rx={trunkWidth / 2}
          fill={greenColor}
          style={{ transition: "all 0.6s ease" }}
        />

        {/* Leaves */}
        {leaves.map(({ i, y, cx, rx, ry, rotation }) => (
          <motion.ellipse
            key={`leaf-${i}`}
            cx={cx}
            cy={y}
            rx={rx}
            ry={ry}
            fill={leafColor}
            transform={`rotate(${rotation}, ${cx}, ${y})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeIn" }}
            style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))" }}
          />
        ))}

        {/* Buds */}
        {showBuds && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <circle
              cx={100 - 8}
              cy={budY}
              r={4}
              fill={`hsl(${hue + 10}, ${sat - 5}%, ${light + 18}%)`}
            />
            <circle
              cx={100 + 8}
              cy={budY + 6}
              r={4}
              fill={`hsl(${hue + 10}, ${sat - 5}%, ${light + 18}%)`}
            />
          </motion.g>
        )}

        {/* Flower */}
        {showFlower && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* 5 petals */}
            {PETAL_ANGLES.map((angle) => {
              const pr = 8;
              const px = 100 + pr * Math.cos((angle * Math.PI) / 180);
              const py = flowerY + pr * Math.sin((angle * Math.PI) / 180);
              return (
                <ellipse
                  key={`petal-${angle}`}
                  cx={px}
                  cy={py}
                  rx={5}
                  ry={3}
                  fill="hsl(350, 80%, 85%)"
                  transform={`rotate(${angle}, ${px}, ${py})`}
                />
              );
            })}
            {/* Center */}
            <circle cx={100} cy={flowerY} r={4} fill="hsl(50, 90%, 60%)" />
          </motion.g>
        )}
      </svg>

      {/* Stage label */}
      <p className="text-xs text-muted-foreground">段階 {stage} / 50</p>
    </div>
  );
}
