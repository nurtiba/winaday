"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getVerdict } from "@/lib/categories";
import { DayScore, DayStatResult, getDisplayStatResults, getScoreForDate, getUserBuild } from "@/lib/storage";

function AnimatedScore({ target }: { target: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const duration = 900;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target]);

  return <span>{current}</span>;
}

function completedCount(result: DayStatResult): string {
  const done = result.nonNegotiables.filter((item) => item.done).length;
  return `${done}/${result.nonNegotiables.length}`;
}

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const [dayScore, setDayScore] = useState<DayScore | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      if (!date) {
        router.push("/score");
        return;
      }
      const score = getScoreForDate(date);
      if (!score) {
        router.push("/score");
        return;
      }
      setDayScore(score);
    });
    return () => {
      active = false;
    };
  }, [date, router]);

  const results = useMemo(() => {
    if (!dayScore) return [];
    return getDisplayStatResults(dayScore, getUserBuild());
  }, [dayScore]);

  if (!dayScore) return null;

  const verdict = getVerdict(dayScore.totalPercent);
  const dateFormatted = new Date(dayScore.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const sorted = [...results].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const needsAttention = sorted[sorted.length - 1];

  return (
    <div className="mobile-scroll min-h-0 flex-1 px-5 safe-top safe-bottom text-white">
      <div className="text-center">
        <p className="text-[12px] uppercase tracking-[1px] text-[#666]">{dateFormatted}</p>
        <p className="mt-1 text-[15px] text-[#777]">Life Score</p>

        <div className="mt-4 text-[86px] font-extrabold leading-none" style={{ color: "#4ade80" }}>
          <AnimatedScore target={Math.round(dayScore.totalPercent)} />
          <span className="text-[42px]">%</span>
        </div>

        <p className="mt-2 text-[20px] font-bold" style={{ color: "#4ade80" }}>
          {verdict}
        </p>
      </div>

      {best && needsAttention && (
        <div className="mt-7 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#1f1f2f] bg-[#101018] p-3">
            <p className="text-[11px] uppercase tracking-[0.8px] text-[#555]">Best stat</p>
            <p className="mt-2 text-[15px] font-bold text-white">
              {best.statEmoji} {best.statName}
            </p>
            <p className="mt-1 text-[13px] font-bold" style={{ color: best.statColor }}>{best.score}</p>
          </div>
          <div className="rounded-2xl border border-[#1f1f2f] bg-[#101018] p-3">
            <p className="text-[11px] uppercase tracking-[0.8px] text-[#555]">Needs attention</p>
            <p className="mt-2 text-[15px] font-bold text-white">
              {needsAttention.statEmoji} {needsAttention.statName}
            </p>
            <p className="mt-1 text-[13px] font-bold" style={{ color: needsAttention.statColor }}>{needsAttention.score}</p>
          </div>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {results.map((result) => (
          <div key={result.statId} className="rounded-2xl border border-[#1f1f2f] bg-[#101018] p-3.5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[18px]">{result.statEmoji}</span>
                <div>
                  <p className="text-[14px] font-bold text-white">{result.statName}</p>
                  <p className="text-[11px] text-[#555]">
                    {completedCount(result)} done · +{result.extraEffort} extra
                  </p>
                </div>
              </div>
              <p className="text-[20px] font-extrabold" style={{ color: result.statColor }}>{result.score}</p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#222233]">
              <div className="h-full rounded-full" style={{ width: `${result.score}%`, background: result.statColor }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pb-2">
        <button
          type="button"
          onClick={() => router.push(`/share?date=${dayScore.date}`)}
          className="min-h-[52px] w-full rounded-xl text-[17px] font-extrabold text-white"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          Create Share Card
        </button>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => router.push("/calendar")}
            className="min-h-[46px] rounded-xl border border-[#222] bg-[#111] text-[14px] font-semibold text-[#777]"
          >
            Calendar
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="min-h-[46px] rounded-xl border border-[#222] bg-[#111] text-[14px] font-semibold text-[#777]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-[#0a0a0a]" />}>
      <ResultContent />
    </Suspense>
  );
}
