"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllScores, getStreak, getToday, getScoreForDate } from "@/lib/storage";

export default function Home() {
  const router = useRouter();
  const [hasScores, setHasScores] = useState(false);
  const [scoredToday, setScoredToday] = useState(false);
  const [streak, setStreak] = useState(0);
  const [todayPercent, setTodayPercent] = useState(0);

  useEffect(() => {
    const scores = getAllScores();
    setHasScores(scores.length > 0);
    setStreak(getStreak());

    const today = getToday();
    const todayScore = getScoreForDate(today);
    if (todayScore) {
      setScoredToday(true);
      setTodayPercent(todayScore.totalPercent);
    }
  }, []);

  const handleMainAction = () => {
    if (scoredToday) {
      router.push(`/result?date=${getToday()}`);
    } else {
      router.push("/score");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8">
      {/* Logo */}
      <h1 className="text-[32px] font-extrabold tracking-[3px] mb-2">
        WIN<span className="text-[#4ade80]">THE</span>DAY
      </h1>
      <p className="text-[14px] text-[#555] mb-10 text-center">
        Score your day. See the pattern. Share your progress.
      </p>

      {/* Today's status */}
      {scoredToday ? (
        <div className="text-center mb-10">
          <p className="text-[14px] text-[#666] mb-2">Today&apos;s score</p>
          <p className="text-[64px] font-extrabold leading-none" style={{ color: "#4ade80" }}>
            {Math.round(todayPercent)}%
          </p>
          {streak > 0 && (
            <p className="text-[14px] text-[#4ade80] mt-2">
              🔥 {streak} day streak
            </p>
          )}
        </div>
      ) : (
        <div className="text-center mb-16">
          <p className="text-[48px] mb-4">✨</p>
          <p className="text-[16px] text-[#666]">
            {hasScores ? "Ready to score today?" : "Rate your day in 30 seconds"}
          </p>
        </div>
      )}

      {/* Main CTA */}
      <button
        type="button"
        onClick={handleMainAction}
        className="w-1/2 min-h-[48px] py-3.5 rounded-lg text-[16px] font-bold text-white mb-4 active:scale-[0.97] transition-transform"
        style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", WebkitTapHighlightColor: "transparent" }}
      >
        {scoredToday ? "View Today" : "Score My Day →"}
      </button>

      {/* Secondary actions */}
      {hasScores && (
        <button
          type="button"
          onClick={() => router.push("/calendar")}
          className="w-1/2 min-h-[44px] py-2.5 rounded-lg text-[14px] text-[#777] bg-[#111] border border-[#222] text-center"
        >
          📅 View Calendar
        </button>
      )}
    </div>
  );
}
