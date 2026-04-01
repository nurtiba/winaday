"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllScores, getStreak, DayScore } from "@/lib/storage";
import { getHeatmapColor } from "@/lib/categories";

export default function CalendarPage() {
  const router = useRouter();
  const [scores, setScores] = useState<DayScore[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setScores(getAllScores());
    setStreak(getStreak());
  }, []);

  // Build 365-day grid
  const today = new Date();
  const cells: { date: string; percent: number | null }[] = [];

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const found = scores.find((s) => s.date === dateStr);
    cells.push({
      date: dateStr,
      percent: found ? found.totalPercent : null,
    });
  }

  // Group into weeks (columns of 7)
  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  // Month labels
  const months: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const d = new Date(week[0].date + "T00:00:00");
    const m = d.getMonth();
    if (m !== lastMonth) {
      months.push({
        label: d.toLocaleDateString("en-US", { month: "short" }),
        weekIndex: wi,
      });
      lastMonth = m;
    }
  });

  return (
    <div className="flex-1 flex flex-col text-white px-5 safe-top safe-bottom overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <h1 className="text-[22px] font-bold text-center mb-2">Your Year</h1>

      {/* Streak badge */}
      {streak > 0 && (
        <div className="flex justify-center mb-6">
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[14px] font-semibold"
            style={{
              background: "rgba(74, 222, 128, 0.1)",
              border: "1px solid rgba(74, 222, 128, 0.2)",
              color: "#4ade80",
            }}
          >
            🔥 {streak} day streak
          </div>
        </div>
      )}

      {/* Month labels */}
      <div className="overflow-x-auto pb-4">
        <div style={{ minWidth: weeks.length * 15 + "px" }}>
          <div className="flex mb-1" style={{ height: 14 }}>
            {months.map((m, i) => (
              <span
                key={i}
                className="text-[10px] text-[#555] absolute"
                style={{ left: m.weekIndex * 15 + "px", position: "relative" }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((cell, ci) => (
                  <div
                    key={ci}
                    className="w-[12px] h-[12px] rounded-[2px]"
                    style={{ background: getHeatmapColor(cell.percent) }}
                    title={`${cell.date}: ${cell.percent !== null ? cell.percent + "%" : "No data"}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-4 mb-8">
        <span className="text-[10px] text-[#555]">Less</span>
        <div className="w-3 h-3 rounded-[2px]" style={{ background: "#111" }} />
        <div className="w-3 h-3 rounded-[2px]" style={{ background: "#1a1a2e" }} />
        <div className="w-3 h-3 rounded-[2px]" style={{ background: "#14532d" }} />
        <div className="w-3 h-3 rounded-[2px]" style={{ background: "#22c55e" }} />
        <div className="w-3 h-3 rounded-[2px]" style={{ background: "#4ade80" }} />
        <span className="text-[10px] text-[#555]">More</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex gap-3 pb-2 shrink-0">
        <button
          type="button"
          onClick={() => router.push("/score")}
          className="flex-1 min-h-[48px] py-4 rounded-2xl text-[16px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
        >
          Score Today
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="px-6 min-h-[48px] py-4 rounded-2xl text-[14px] text-[#777] bg-[#111] border border-[#222]"
        >
          Home
        </button>
      </div>
    </div>
  );
}
