"use client";

import { CATEGORIES, getVerdict, getHeatmapColor } from "@/lib/categories";
import { DayScore, getAllScores } from "@/lib/storage";

interface ShareCardProps {
  dayScore: DayScore;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ShareCard({ dayScore, cardRef }: ShareCardProps) {
  const verdict = getVerdict(dayScore.totalPercent);
  const allScores = getAllScores();
  const sorted = [...allScores].sort((a, b) => a.date.localeCompare(b.date));

  // Last 7 days for mini heatmap
  const last7: (number | null)[] = [];
  const today = new Date(dayScore.date + "T00:00:00");
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const found = sorted.find((s) => s.date === dateStr);
    last7.push(found ? found.totalPercent : null);
  }

  const dateFormatted = new Date(dayScore.date + "T00:00:00").toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" }
  );

  return (
    <div
      ref={cardRef}
      className="w-[300px] h-[533px] rounded-3xl p-7 flex flex-col items-center relative overflow-hidden"
      style={{
        background: "linear-gradient(170deg, #0c1222 0%, #0f0a2e 40%, #1a0a2e 70%, #0c1222 100%)",
      }}
    >
      {/* Glow effects */}
      <div
        className="absolute top-[-30%] left-[10%] w-[80%] h-[60%]"
        style={{
          background: "radial-gradient(ellipse, rgba(74, 222, 128, 0.07) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[40%]"
        style={{
          background: "radial-gradient(ellipse, rgba(139, 92, 246, 0.05) 0%, transparent 70%)",
        }}
      />

      {/* Date */}
      <p className="text-[10px] text-[#4a5568] tracking-[3px] uppercase mb-7 relative z-10">
        {dateFormatted}
      </p>

      {/* Score */}
      <div className="relative z-10 text-[80px] font-extrabold leading-none mb-0.5">
        <span
          style={{
            background: "linear-gradient(135deg, #4ade80, #22c55e, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {Math.round(dayScore.totalPercent)}
        </span>
        <span
          className="text-[32px]"
          style={{
            background: "linear-gradient(135deg, #4ade80, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          %
        </span>
      </div>

      {/* Verdict */}
      <p className="text-[14px] font-medium tracking-[1px] mb-6 relative z-10" style={{ color: "#4ade80" }}>
        {verdict.toUpperCase()}
      </p>

      {/* Category bars */}
      <div className="w-full relative z-10 mb-5">
        {CATEGORIES.map((cat) => {
          const score = dayScore.scores[cat.id] || 0;
          return (
            <div key={cat.id} className="flex items-center mb-2 gap-1.5">
              <span className="text-[12px] w-[18px]">{cat.emoji}</span>
              <span className="text-[10px] text-[#4a5568] w-[65px]">{cat.name}</span>
              <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${score * 10}%`, background: cat.color }}
                />
              </div>
              <span className="text-[10px] font-semibold w-[16px] text-right text-[#64748b]">
                {score}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mini heatmap */}
      <div className="flex gap-1 mb-6 relative z-10">
        {last7.map((pct, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-[5px]"
            style={{ background: getHeatmapColor(pct) }}
          />
        ))}
      </div>

      {/* Brand */}
      <div className="relative z-10 mt-auto text-center">
        <p className="text-[14px] font-extrabold tracking-[2px]">
          WIN<span className="text-[#4ade80]">THE</span>DAY
        </p>
        <p className="text-[9px] text-[#334155] mt-0.5">wintheday.app</p>
      </div>
    </div>
  );
}
