// Tree Samples — design reference only. 3 personalities × 4 phases = 12 SVG trees.

/* eslint-disable */

// ─── Star SVGs ────────────────────────────────────────────────────────────────

function StarPhase1() {
  return (
    <svg
      viewBox="0 0 120 160"
      width="120"
      height="160"
      role="img"
      aria-label="スター Phase 1"
    >
      {/* Trunk */}
      <rect x="58" y="90" width="5" height="60" rx="2" fill="#2d3e50" />
      {/* Left leaf (slightly higher) */}
      <ellipse
        cx="49"
        cy="83"
        rx="7"
        ry="4"
        fill="#6a9e6e"
        transform="rotate(-20 49 83)"
      />
      {/* Right leaf */}
      <ellipse
        cx="67"
        cy="87"
        rx="6"
        ry="3.5"
        fill="#5a8a5e"
        transform="rotate(18 67 87)"
      />
      {/* Small bud — slightly right of center */}
      <ellipse cx="65" cy="76" rx="4" ry="5" fill="#7ab87e" />
      <circle cx="65" cy="72" r="2.5" fill="#8dcc8f" />
    </svg>
  );
}

function StarPhase2() {
  return (
    <svg
      viewBox="0 0 120 160"
      width="120"
      height="160"
      role="img"
      aria-label="スター Phase 2"
    >
      {/* Trunk */}
      <rect x="57" y="75" width="5" height="75" rx="2" fill="#2d3e50" />
      {/* Left branch stub */}
      <line
        x1="57"
        y1="100"
        x2="43"
        y2="93"
        stroke="#2d3e50"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="39" cy="91" rx="6" ry="4" fill="#6a9e6e" />
      {/* Canopy — sparse triangle, apex offset right */}
      <polygon points="73,42 48,85 90,85" fill="#5a8a5e" opacity="0.85" />
      <polygon points="71,48 52,82 86,82" fill="#6aae6e" opacity="0.6" />
    </svg>
  );
}

function StarPhase3() {
  return (
    <svg
      viewBox="0 0 120 160"
      width="120"
      height="160"
      role="img"
      aria-label="スター Phase 3"
    >
      {/* Trunk */}
      <rect x="57" y="75" width="5" height="75" rx="2" fill="#2d3e50" />
      {/* Left branch */}
      <line
        x1="57"
        y1="98"
        x2="38"
        y2="88"
        stroke="#2d3e50"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="34" cy="86" rx="8" ry="5" fill="#6a9e6e" />
      <ellipse cx="28" cy="83" rx="6" ry="4" fill="#5a8a5e" />
      {/* Right branch — shorter */}
      <line
        x1="62"
        y1="104"
        x2="76"
        y2="97"
        stroke="#2d3e50"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <ellipse cx="80" cy="95" rx="6" ry="4" fill="#6aae6e" />
      {/* Canopy — taller, apex clearly off-center right */}
      <polygon points="77,30 46,82 92,82" fill="#5a8a5e" opacity="0.85" />
      <polygon points="75,36 50,78 88,78" fill="#6aae6e" opacity="0.65" />
      <polygon points="76,42 53,76 87,76" fill="#7abe7e" opacity="0.45" />
    </svg>
  );
}

function StarPhase4() {
  return (
    <svg
      viewBox="0 0 120 160"
      width="120"
      height="160"
      role="img"
      aria-label="スター Phase 4"
    >
      {/* Trunk */}
      <rect x="57" y="75" width="5" height="75" rx="2" fill="#2d3e50" />
      {/* Left branch with secondary */}
      <line
        x1="57"
        y1="96"
        x2="36"
        y2="84"
        stroke="#2d3e50"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="36"
        y1="84"
        x2="26"
        y2="76"
        stroke="#2d3e50"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse cx="22" cy="73" rx="7" ry="4.5" fill="#5a8a5e" />
      <ellipse cx="30" cy="80" rx="8" ry="5" fill="#6aae6e" />
      {/* Right branch — minimal */}
      <line
        x1="62"
        y1="106"
        x2="74"
        y2="100"
        stroke="#2d3e50"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse cx="77" cy="98" rx="5" ry="3.5" fill="#6aae6e" />
      {/* Canopy — tall and pointed, apex dramatically off-center right */}
      <polygon points="82,18 46,80 96,80" fill="#4d7e52" opacity="0.9" />
      <polygon points="80,24 50,76 93,76" fill="#5a8a5e" opacity="0.7" />
      <polygon points="79,32 53,74 91,74" fill="#6aae6e" opacity="0.5" />
      <polygon points="80,40 55,72 90,72" fill="#7abe7e" opacity="0.35" />
    </svg>
  );
}

// ─── Foolish SVGs ─────────────────────────────────────────────────────────────

function FoolishPhase1() {
  return (
    <svg
      viewBox="0 0 120 160"
      width="120"
      height="160"
      role="img"
      aria-label="フール Phase 1"
    >
      {/* Trunk — slight lean left */}
      <rect
        x="57"
        y="95"
        width="5"
        height="55"
        rx="2"
        fill="#2d3e50"
        transform="rotate(-3 60 150)"
      />
      {/* Left leaf — bigger */}
      <ellipse
        cx="49"
        cy="88"
        rx="9"
        ry="5.5"
        fill="#6a9e6e"
        transform="rotate(-15 49 88)"
      />
      {/* Right leaf — smaller */}
      <ellipse
        cx="68"
        cy="93"
        rx="6"
        ry="3.5"
        fill="#5a8a5e"
        transform="rotate(20 68 93)"
      />
      {/* Droopy tip */}
      <ellipse cx="57" cy="82" rx="5" ry="6" fill="#7ab87e" />
    </svg>
  );
}

function FoolishPhase2() {
  return (
    <svg
      viewBox="0 0 120 160"
      width="120"
      height="160"
      role="img"
      aria-label="フール Phase 2"
    >
      {/* Trunk */}
      <rect
        x="57"
        y="90"
        width="5"
        height="60"
        rx="2"
        fill="#2d3e50"
        transform="rotate(-2 60 150)"
      />
      {/* Normal canopy — left cluster */}
      <ellipse cx="50" cy="78" rx="12" ry="9" fill="#5a8a5e" />
      <ellipse cx="60" cy="72" rx="10" ry="8" fill="#6aae6e" />
      <ellipse cx="55" cy="80" rx="9" ry="7" fill="#7abe7e" opacity="0.7" />
      {/* Odd right branch — clearly too long and horizontal */}
      <line
        x1="62"
        y1="100"
        x2="90"
        y2="97"
        stroke="#2d3e50"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="93" cy="96" rx="7" ry="4.5" fill="#6a9e6e" />
    </svg>
  );
}

function FoolishPhase3() {
  return (
    <svg
      viewBox="0 0 120 160"
      width="120"
      height="160"
      role="img"
      aria-label="フール Phase 3"
    >
      {/* Trunk */}
      <rect
        x="57"
        y="90"
        width="5"
        height="60"
        rx="2"
        fill="#2d3e50"
        transform="rotate(-2 60 150)"
      />
      {/* Normal canopy — fills left side */}
      <ellipse cx="46" cy="74" rx="15" ry="10" fill="#4d7e52" />
      <ellipse cx="57" cy="68" rx="12" ry="9" fill="#5a8a5e" />
      <ellipse cx="50" cy="78" rx="13" ry="8" fill="#6aae6e" opacity="0.8" />
      <ellipse cx="43" cy="80" rx="10" ry="7" fill="#7abe7e" opacity="0.6" />
      {/* Odd right branch — clearly too long */}
      <line
        x1="62"
        y1="98"
        x2="98"
        y2="94"
        stroke="#2d3e50"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Lonely leaves at tip */}
      <ellipse cx="101" cy="92" rx="7" ry="4.5" fill="#6a9e6e" />
      <ellipse cx="95" cy="89" rx="5" ry="3.5" fill="#7abe7e" />
    </svg>
  );
}

function FoolishPhase4() {
  return (
    <svg
      viewBox="0 0 120 160"
      width="120"
      height="160"
      role="img"
      aria-label="フール Phase 4"
    >
      {/* Trunk */}
      <rect
        x="57"
        y="90"
        width="5"
        height="60"
        rx="2"
        fill="#2d3e50"
        transform="rotate(-2 60 150)"
      />
      {/* Normal canopy — healthy left side */}
      <ellipse cx="44" cy="72" rx="16" ry="11" fill="#4d7e52" />
      <ellipse cx="56" cy="65" rx="13" ry="10" fill="#5a8a5e" />
      <ellipse cx="48" cy="76" rx="14" ry="9" fill="#6aae6e" opacity="0.8" />
      <ellipse cx="40" cy="78" rx="10" ry="7" fill="#7abe7e" opacity="0.6" />
      {/* Odd branch — exaggerated, very long, curving down */}
      <path
        d="M 62 97 Q 88 94 100 100 Q 108 104 106 110"
        stroke="#2d3e50"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Drooping leaves at end */}
      <ellipse
        cx="106"
        cy="112"
        rx="7"
        ry="4.5"
        fill="#6a9e6e"
        transform="rotate(15 106 112)"
      />
      <ellipse
        cx="100"
        cy="115"
        rx="6"
        ry="4"
        fill="#5a8a5e"
        transform="rotate(20 100 115)"
      />
    </svg>
  );
}

// ─── Empress SVGs ─────────────────────────────────────────────────────────────

function EmpressPhase1() {
  return (
    <svg
      viewBox="0 0 120 160"
      width="120"
      height="160"
      role="img"
      aria-label="エンプレス Phase 1"
    >
      {/* Trunk — already wide */}
      <rect x="54" y="100" width="12" height="50" rx="3" fill="#2d3e50" />
      {/* Left wide leaf */}
      <ellipse
        cx="47"
        cy="93"
        rx="11"
        ry="6"
        fill="#6a9e6e"
        transform="rotate(-10 47 93)"
      />
      {/* Right wide leaf */}
      <ellipse
        cx="73"
        cy="95"
        rx="10"
        ry="5.5"
        fill="#5a8a5e"
        transform="rotate(12 73 95)"
      />
      {/* Small chubby bud */}
      <ellipse cx="60" cy="86" rx="8" ry="7" fill="#7ab87e" />
    </svg>
  );
}

function EmpressPhase2() {
  return (
    <svg
      viewBox="0 0 120 160"
      width="120"
      height="160"
      role="img"
      aria-label="エンプレス Phase 2"
    >
      {/* Trunk — thick */}
      <rect x="53" y="90" width="13" height="60" rx="3" fill="#2d3e50" />
      {/* Dense round canopy — slightly leans left */}
      <ellipse cx="57" cy="70" rx="24" ry="18" fill="#4d7e52" />
      <ellipse cx="52" cy="65" rx="20" ry="16" fill="#5a8a5e" />
      <ellipse cx="61" cy="68" rx="18" ry="15" fill="#6aae6e" opacity="0.8" />
      <ellipse cx="55" cy="72" rx="16" ry="12" fill="#7abe7e" opacity="0.6" />
    </svg>
  );
}

function EmpressPhase3() {
  return (
    <svg
      viewBox="0 0 120 160"
      width="120"
      height="160"
      role="img"
      aria-label="エンプレス Phase 3"
    >
      {/* Trunk — wide and solid */}
      <rect x="52" y="88" width="16" height="62" rx="4" fill="#2d3e50" />
      {/* Expanded dense canopy — droops right */}
      <ellipse cx="58" cy="65" rx="30" ry="20" fill="#4d7e52" />
      <ellipse cx="52" cy="60" rx="26" ry="18" fill="#5a8a5e" />
      <ellipse cx="63" cy="63" rx="24" ry="17" fill="#6aae6e" opacity="0.8" />
      <ellipse cx="68" cy="72" rx="18" ry="12" fill="#5a8a5e" opacity="0.7" />
      {/* Right droop */}
      <ellipse cx="78" cy="75" rx="14" ry="9" fill="#6aae6e" opacity="0.65" />
      <ellipse cx="50" cy="68" rx="15" ry="10" fill="#7abe7e" opacity="0.55" />
    </svg>
  );
}

function EmpressPhase4() {
  return (
    <svg
      viewBox="0 0 120 160"
      width="120"
      height="160"
      role="img"
      aria-label="エンプレス Phase 4"
    >
      {/* Trunk — thick, looks stressed */}
      <rect x="52" y="88" width="17" height="62" rx="4" fill="#2d3e50" />
      {/* Excessively large canopy — lopsided right */}
      <ellipse cx="60" cy="60" rx="36" ry="24" fill="#4d7e52" />
      <ellipse cx="55" cy="54" rx="30" ry="20" fill="#5a8a5e" />
      <ellipse cx="66" cy="58" rx="28" ry="19" fill="#6aae6e" opacity="0.8" />
      {/* Extra bulk on right */}
      <ellipse cx="80" cy="68" rx="20" ry="13" fill="#5a8a5e" opacity="0.75" />
      <ellipse cx="85" cy="74" rx="15" ry="10" fill="#6aae6e" opacity="0.65" />
      {/* Odd poking clusters */}
      <ellipse cx="38" cy="55" rx="11" ry="8" fill="#7abe7e" opacity="0.7" />
      <ellipse cx="88" cy="58" rx="10" ry="7" fill="#6aae6e" opacity="0.6" />
      <ellipse cx="60" cy="42" rx="12" ry="8" fill="#5a8a5e" opacity="0.5" />
      {/* Internal fill */}
      <ellipse cx="62" cy="63" rx="22" ry="15" fill="#7abe7e" opacity="0.5" />
    </svg>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const personalities = [
  {
    id: "star",
    name: "スター",
    subtitle: "少しずれた頂点",
    phases: [StarPhase1, StarPhase2, StarPhase3, StarPhase4],
  },
  {
    id: "foolish",
    name: "フール",
    subtitle: "奇妙な枝ひとつ",
    phases: [FoolishPhase1, FoolishPhase2, FoolishPhase3, FoolishPhase4],
  },
  {
    id: "empress",
    name: "エンプレス",
    subtitle: "重すぎる頂上",
    phases: [EmpressPhase1, EmpressPhase2, EmpressPhase3, EmpressPhase4],
  },
];

const phaseLabels = [
  { jp: "Phase 1", desc: "最小限・不完全" },
  { jp: "Phase 2", desc: "枝が現れる" },
  { jp: "Phase 3", desc: "個性が支配する" },
  { jp: "Phase 4", desc: "少し過剰に" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TreeSamples() {
  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight mb-1">
            木のキャラクターサンプル
          </h1>
          <p className="text-sm text-slate-400">
            3つの個性 × 4つの成長フェーズ — デザイン参考用
          </p>
        </div>

        {/* Phase row labels */}
        <div className="grid grid-cols-4 gap-3 mb-2 pl-[88px]">
          {phaseLabels.map((p) => (
            <div key={p.jp} className="text-center">
              <div className="text-xs font-medium text-slate-600">{p.jp}</div>
              <div className="text-[10px] text-slate-400">{p.desc}</div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="space-y-6">
          {personalities.map((pers) => (
            <div key={pers.id} className="flex items-start gap-3">
              {/* Personality label */}
              <div className="w-20 shrink-0 flex flex-col justify-center items-end pt-10 pr-1">
                <div className="text-sm font-semibold text-slate-700">
                  {pers.name}
                </div>
                <div className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">
                  {pers.subtitle}
                </div>
              </div>

              {/* 4 phase SVGs */}
              <div className="grid grid-cols-4 gap-3 flex-1">
                {phaseLabels.map((label, i) => {
                  const PhaseComponent = pers.phases[i];
                  return (
                    <div
                      key={label.jp}
                      className="bg-white rounded-xl border border-stone-100 shadow-sm flex flex-col items-center p-2 pb-3"
                      data-ocid={`tree.${pers.id}.item.${i + 1}`}
                    >
                      <PhaseComponent />
                      <div className="mt-1 text-[10px] text-slate-400 text-center leading-tight">
                        {label.jp}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-10 pt-6 border-t border-stone-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            {personalities.map((p) => (
              <div key={p.id} className="space-y-1">
                <div className="text-sm font-medium text-slate-600">
                  {p.name}
                </div>
                <div className="text-xs text-slate-400">{p.subtitle}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] text-slate-300 mt-6">
            各木はひとつの定義的な特徴を持つ — 対称ではなく、少し不完全
          </p>
        </div>
      </div>
    </div>
  );
}
