"use client";

import { getHeatmapColor, getVerdict } from "@/lib/categories";
import { DayScore, formatDate, getAllScores, getDisplayStatResults, getUserBuild } from "@/lib/storage";

interface ShareCardProps {
  dayScore: DayScore;
  showBreakdown: boolean;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ShareCard({ dayScore, showBreakdown, cardRef }: ShareCardProps) {
  const verdict = getVerdict(dayScore.totalPercent);
  const allScores = getAllScores();
  const sorted = [...allScores].sort((a, b) => a.date.localeCompare(b.date));
  const results = getDisplayStatResults(dayScore, getUserBuild());

  const last7: (number | null)[] = [];
  const today = new Date(dayScore.date + "T00:00:00");
  for (let index = 6; index >= 0; index--) {
    const date = new Date(today);
    date.setDate(date.getDate() - index);
    const dateStr = formatDate(date);
    const found = sorted.find((score) => score.date === dateStr);
    last7.push(found ? found.totalPercent : null);
  }

  const dateFormatted = new Date(dayScore.date + "T00:00:00").toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" }
  );

  return (
    <div
      ref={cardRef}
      className="w-[300px] h-[533px] rounded-[28px] p-7 flex flex-col items-center relative overflow-hidden"
      style={{
        background: "linear-gradient(170deg, #07110d 0%, #0c1222 45%, #14111f 100%)",
      }}
    >
      <p className="text-[10px] text-[#94a3b8] tracking-[2px] uppercase mb-7 relative z-10">
        {dateFormatted}
      </p>

      <div className="relative z-10 text-[82px] font-extrabold leading-none mb-1" style={{ color: "#4ade80" }}>
        {Math.round(dayScore.totalPercent)}
        <span className="text-[34px]">%</span>
      </div>

      <p className="text-[13px] font-bold tracking-[1px] mb-2 relative z-10" style={{ color: "#e2e8f0" }}>
        LIFE SCORE
      </p>
      <p className="text-[14px] font-semibold mb-6 relative z-10" style={{ color: "#4ade80" }}>
        {verdict.toUpperCase()}
      </p>

      {showBreakdown ? (
        <div className="w-full relative z-10 mb-4">
          {results.map((result) => (
            <div key={result.statId} className="flex items-center mb-2 gap-1.5">
              <span className="text-[12px] w-[18px]">{result.statEmoji}</span>
              <span className="text-[10px] text-[#94a3b8] w-[63px]">{result.statName}</span>
              <div className="flex-1 h-[4px] rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${result.score}%`, background: result.statColor }}
                />
              </div>
              <span className="text-[10px] font-semibold w-[20px] text-right" style={{ color: result.statColor }}>
                {result.score}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative z-10 my-4 rounded-2xl border border-[#1e293b] px-5 py-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[1px]" style={{ color: "#94a3b8" }}>
            Private build
          </p>
          <p className="mt-1 text-[12px] leading-snug" style={{ color: "#cbd5e1" }}>
            I checked my non-negotiables today.
          </p>
        </div>
      )}

      <div className="flex gap-1.5 mb-6 relative z-10">
        {last7.map((pct, index) => (
          <div
            key={index}
            className="w-6 h-6 rounded-[5px]"
            style={{ background: getHeatmapColor(pct), border: "1px solid rgba(255,255,255,0.05)" }}
          />
        ))}
      </div>

      <div className="relative z-10 mt-auto text-center">
        <p className="text-[14px] font-extrabold tracking-[2px]" style={{ color: "#f8fafc" }}>
          WIN<span style={{ color: "#4ade80" }}>THE</span>DAY
        </p>
        <p className="text-[9px] mt-0.5" style={{ color: "#64748b" }}>wintheday.app</p>
      </div>
    </div>
  );
}
