"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveStats, UserBuild } from "@/lib/categories";
import {
  DayScore,
  getAllScores,
  getDisplayStatResults,
  getScoreForDate,
  getStreak,
  getToday,
  getUserBuild,
} from "@/lib/storage";

export default function Home() {
  const router = useRouter();
  const [build, setBuild] = useState<UserBuild | null>(null);
  const [hasScores, setHasScores] = useState(false);
  const [todayScore, setTodayScore] = useState<DayScore | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      const nextBuild = getUserBuild();
      const scores = getAllScores();
      const today = getToday();

      setBuild(nextBuild);
      setHasScores(scores.length > 0);
      setStreak(getStreak());
      setTodayScore(getScoreForDate(today));
    });
    return () => {
      active = false;
    };
  }, []);

  const activeStats = useMemo(() => (build ? getActiveStats(build) : []), [build]);
  const displayResults = todayScore && build ? getDisplayStatResults(todayScore, build) : [];

  const handleMainAction = () => {
    if (todayScore) {
      router.push(`/result?date=${getToday()}`);
    } else {
      router.push("/score");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 safe-top safe-bottom text-white">
      <div className="flex min-h-full flex-col">
        <div className="pt-4 text-center">
          <h1 className="text-[30px] font-extrabold tracking-[2px]">
            WIN<span className="text-[#4ade80]">THE</span>DAY
          </h1>
          <p className="mt-2 text-[14px] text-[#777]">
            Win life by winning today.
          </p>
        </div>

        <section className="my-9 text-center">
          {todayScore ? (
            <>
              <p className="text-[13px] uppercase tracking-[1px] text-[#666]">Today&apos;s Life Score</p>
              <p className="mt-2 text-[74px] font-extrabold leading-none" style={{ color: "#4ade80" }}>
                {Math.round(todayScore.totalPercent)}%
              </p>
              {streak > 0 && (
                <p className="mt-3 text-[14px] font-semibold text-[#4ade80]">
                  {streak} day streak
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-[13px] uppercase tracking-[1px] text-[#666]">Today is unscored</p>
              <p className="mx-auto mt-4 max-w-[260px] text-[28px] font-extrabold leading-tight">
                Check your non-negotiables.
              </p>
              <p className="mx-auto mt-3 max-w-[280px] text-[14px] leading-relaxed text-[#777]">
                Five quick stats. No guessing a grade out of thin air.
              </p>
            </>
          )}
        </section>

        <div className="space-y-2.5">
          {todayScore
            ? displayResults.map((result) => (
                <div key={result.statId} className="flex items-center gap-2.5 rounded-xl border border-[#1f1f2f] bg-[#101018] px-3 py-2.5">
                  <span className="w-7 text-center text-[17px]">{result.statEmoji}</span>
                  <span className="w-24 text-[13px] font-semibold text-[#aaa]">{result.statName}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#202030]">
                    <div className="h-full rounded-full" style={{ width: `${result.score}%`, background: result.statColor }} />
                  </div>
                  <span className="w-8 text-right text-[13px] font-bold" style={{ color: result.statColor }}>
                    {result.score}
                  </span>
                </div>
              ))
            : activeStats.map((stat) => (
                <div key={stat.id} className="flex items-center gap-3 rounded-xl border border-[#1f1f2f] bg-[#101018] px-3 py-2.5">
                  <span className="w-7 text-center text-[17px]">{stat.emoji}</span>
                  <span className="flex-1 text-[14px] font-semibold text-[#ddd]">{stat.name}</span>
                  <span className="text-[12px] text-[#555]">
                    {stat.nonNegotiables.filter((item) => item.active).length} items
                  </span>
                </div>
              ))}
        </div>

        <div className="min-h-8 flex-1" />

        <div className="pb-2">
          <button
            type="button"
            onClick={handleMainAction}
            className="min-h-[52px] w-full rounded-xl text-[17px] font-extrabold text-white active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
          >
            {todayScore ? "View Today" : "Score Today"}
          </button>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => router.push("/build")}
              className="min-h-[46px] rounded-xl border border-[#222] bg-[#111] text-[14px] font-semibold text-[#777]"
            >
              Edit Build
            </button>
            <button
              type="button"
              onClick={() => router.push("/calendar")}
              className="min-h-[46px] rounded-xl border border-[#222] bg-[#111] text-[14px] font-semibold text-[#777]"
              disabled={!hasScores}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
