"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { getToday, getScoreForDate, saveScore, getDaysSinceLastScore } from "@/lib/storage";
import ScoreCard from "@/components/ScoreCard";

export default function ScorePage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const defaults: Record<string, number> = {};
    CATEGORIES.forEach((c) => (defaults[c.id] = 5));
    return defaults;
  });
  const [comments, setComments] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    CATEGORIES.forEach((c) => (defaults[c.id] = ""));
    return defaults;
  });
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  useEffect(() => {
    const today = getToday();
    const existing = getScoreForDate(today);
    if (existing) {
      router.push(`/result?date=${today}`);
      return;
    }

    const daysSince = getDaysSinceLastScore();
    if (daysSince > 1) {
      setShowWelcomeBack(true);
    }
  }, [router]);

  const category = CATEGORIES[currentIndex];

  const handleNext = () => {
    if (currentIndex < CATEGORIES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const total = CATEGORIES.reduce((sum, cat) => sum + (scores[cat.id] || 0), 0);
      const totalPercent = Math.round((total / 50) * 100);
      const today = getToday();

      saveScore({
        date: today,
        scores,
        comments,
        totalPercent,
        createdAt: new Date().toISOString(),
      });

      router.push(`/result?date=${today}`);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (showWelcomeBack) {
    const daysMissed = getDaysSinceLastScore();
    const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
    const today = new Date();
    const dayOfWeek = today.getDay();

    return (
      <div className="flex-1 flex flex-col items-center px-7 safe-top safe-bottom justify-center">
        <div className="text-6xl mb-6">👋</div>
        <h1 className="text-[26px] font-bold text-center mb-2.5 leading-tight">
          Hey, welcome back!
        </h1>
        <p className="text-[15px] text-[#666] text-center leading-relaxed mb-1.5">
          You took a break. That&apos;s okay.
          <br />
          Everyone does. What matters is
          <br />
          you&apos;re here now.
        </p>

        <div className="flex gap-1.5 my-8">
          {weekDays.map((day, i) => {
            const jsDay = (i + 1) % 7;
            const daysAgo = ((dayOfWeek - jsDay + 7) % 7);
            const isToday = daysAgo === 0;
            const isMissed = daysAgo > 0 && daysAgo <= daysMissed;
            const isScored = daysAgo > daysMissed;

            return (
              <div
                key={i}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-semibold"
                style={{
                  backgroundColor: isToday
                    ? "rgba(99, 102, 241, 0.15)"
                    : isScored
                    ? "rgba(74, 222, 128, 0.15)"
                    : "rgba(255,255,255,0.03)",
                  color: isToday ? "#818cf8" : isScored ? "#4ade80" : "#333",
                  border: isToday
                    ? "1px solid rgba(99, 102, 241, 0.3)"
                    : isMissed
                    ? "1px dashed #222"
                    : isScored
                    ? "1px solid rgba(74, 222, 128, 0.2)"
                    : "1px solid transparent",
                }}
              >
                {day}
              </div>
            );
          })}
        </div>

        <p className="text-[13px] text-[#444] mb-12">
          {daysMissed} day{daysMissed !== 1 ? "s" : ""} missed · no big deal
        </p>

        <button
          type="button"
          onClick={() => setShowWelcomeBack(false)}
          className="w-full min-h-[48px] py-4 rounded-2xl text-[17px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
        >
          Score Today →
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-[12px] text-[#333] mt-3.5 min-h-[44px]"
        >
          skip for now
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a] text-white">
      <ScoreCard
        category={category}
        score={scores[category.id]}
        comment={comments[category.id]}
        currentIndex={currentIndex}
        total={CATEGORIES.length}
        onScoreChange={(val) => setScores({ ...scores, [category.id]: val })}
        onCommentChange={(val) => setComments({ ...comments, [category.id]: val })}
        onNext={handleNext}
        onBack={handleBack}
        isFirst={currentIndex === 0}
        isLast={currentIndex === CATEGORIES.length - 1}
      />
    </div>
  );
}
