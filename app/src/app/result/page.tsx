"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CATEGORIES, getVerdict } from "@/lib/categories";
import { getScoreForDate, DayScore } from "@/lib/storage";

function AnimatedScore({ target }: { target: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const duration = 1500;
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

  return (
    <span
      style={{
        background: "linear-gradient(135deg, #4ade80, #22c55e)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {current}
    </span>
  );
}

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const [dayScore, setDayScore] = useState<DayScore | null>(null);
  const [showBars, setShowBars] = useState(false);

  useEffect(() => {
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
    setTimeout(() => setShowBars(true), 800);
  }, [date, router]);

  if (!dayScore) return null;

  const verdict = getVerdict(dayScore.totalPercent);
  const dateFormatted = new Date(dayScore.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex-1 flex flex-col items-center px-6 safe-top safe-bottom">
      <p className="text-[13px] text-[#555] tracking-[1px] uppercase mb-1">
        {dateFormatted}
      </p>
      <p className="text-[15px] text-[#888] mb-6">Today&apos;s score</p>

      {/* Big animated score */}
      <div className="text-[80px] font-extrabold leading-none mb-1">
        <AnimatedScore target={Math.round(dayScore.totalPercent)} />
        <span
          className="text-[44px] font-semibold"
          style={{
            background: "linear-gradient(135deg, #4ade80, #22c55e)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          %
        </span>
      </div>

      <p className="text-[20px] font-semibold mb-6" style={{ color: "#4ade80" }}>
        {verdict} 🔥
      </p>

      {/* Category breakdown */}
      <div className="w-full mb-6">
        {CATEGORIES.map((cat) => {
          const score = dayScore.scores[cat.id] || 0;
          return (
            <div key={cat.id} className="flex items-center mb-3 gap-2.5">
              <span className="text-[16px] w-6 text-center">{cat.emoji}</span>
              <span className="text-[13px] text-[#666] w-20">{cat.name}</span>
              <div className="flex-1 h-1.5 bg-[#111] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: showBars ? `${score * 10}%` : "0%",
                    background: cat.color,
                  }}
                />
              </div>
              <span
                className="text-[13px] font-bold w-5 text-right"
                style={{ color: cat.color }}
              >
                {score}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-auto w-full pb-2">
        <button
          type="button"
          onClick={() => router.push(`/share?date=${dayScore.date}`)}
          className="w-full min-h-[48px] py-4 rounded-2xl text-[17px] font-bold text-white mb-3"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          Share to Instagram ✨
        </button>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => router.push("/calendar")}
            className="flex-1 min-h-[44px] py-3 rounded-xl text-[13px] text-[#777] bg-[#111] border border-[#222] text-center"
          >
            📅 Calendar
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex-1 min-h-[44px] py-3 rounded-xl text-[13px] text-[#777] bg-[#111] border border-[#222] text-center"
          >
            💾 Done
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
