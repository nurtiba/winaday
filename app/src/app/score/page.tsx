"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveStats, UserBuild } from "@/lib/categories";
import {
  buildDayStatResult,
  DayStatResult,
  getDaysSinceLastScore,
  getScoreForDate,
  getToday,
  getUserBuild,
  saveScore,
} from "@/lib/storage";
import ScoreCard from "@/components/ScoreCard";

interface StatDraft {
  completedIds: string[];
  extraEffort: 0 | 10 | 20;
  note: string;
}

function createDrafts(build: UserBuild): Record<string, StatDraft> {
  const drafts: Record<string, StatDraft> = {};
  getActiveStats(build).forEach((stat) => {
    drafts[stat.id] = {
      completedIds: [],
      extraEffort: 0,
      note: "",
    };
  });
  return drafts;
}

export default function ScorePage() {
  const router = useRouter();
  const [build, setBuild] = useState<UserBuild | null>(null);
  const [drafts, setDrafts] = useState<Record<string, StatDraft>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      const today = getToday();
      const existing = getScoreForDate(today);
      if (existing) {
        router.push(`/result?date=${today}`);
        return;
      }

      const nextBuild = getUserBuild();
      setBuild(nextBuild);
      setDrafts(createDrafts(nextBuild));

      const daysSince = getDaysSinceLastScore();
      if (daysSince > 1) {
        setShowWelcomeBack(true);
      }
    });
    return () => {
      active = false;
    };
  }, [router]);

  const activeStats = useMemo(() => (build ? getActiveStats(build) : []), [build]);
  const stat = activeStats[currentIndex];
  const draft = stat ? drafts[stat.id] : null;

  const updateDraft = (statId: string, updater: (draft: StatDraft) => StatDraft) => {
    setDrafts((current) => ({
      ...current,
      [statId]: updater(current[statId] || { completedIds: [], extraEffort: 0, note: "" }),
    }));
  };

  const handleToggleItem = (itemId: string) => {
    if (!stat) return;
    updateDraft(stat.id, (current) => {
      const alreadyDone = current.completedIds.includes(itemId);
      return {
        ...current,
        completedIds: alreadyDone
          ? current.completedIds.filter((id) => id !== itemId)
          : [...current.completedIds, itemId],
      };
    });
  };

  const handleNext = () => {
    if (!build) return;

    if (currentIndex < activeStats.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    const statResults = activeStats.reduce<Record<string, DayStatResult>>((acc, currentStat) => {
      const currentDraft = drafts[currentStat.id] || { completedIds: [], extraEffort: 0, note: "" };
      acc[currentStat.id] = buildDayStatResult(
        currentStat,
        currentDraft.completedIds,
        currentDraft.extraEffort,
        currentDraft.note
      );
      return acc;
    }, {});

    const scores = Object.fromEntries(
      Object.entries(statResults).map(([statId, result]) => [statId, result.score])
    );
    const comments = Object.fromEntries(
      Object.entries(statResults).map(([statId, result]) => [statId, result.note])
    );
    const totalPercent = Math.round(
      Object.values(statResults).reduce((sum, result) => sum + result.score, 0) / activeStats.length
    );
    const today = getToday();

    saveScore({
      date: today,
      scores,
      comments,
      statResults,
      totalPercent,
      createdAt: new Date().toISOString(),
    });

    router.push(`/result?date=${today}`);
  };

  if (showWelcomeBack) {
    const daysMissed = getDaysSinceLastScore();
    const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
    const today = new Date();
    const dayOfWeek = today.getDay();

    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-7 safe-top safe-bottom">
        <div className="text-6xl mb-6">👋</div>
        <h1 className="text-[26px] font-bold text-center mb-2.5 leading-tight">
          Welcome back
        </h1>
        <p className="text-[15px] text-[#666] text-center leading-relaxed mb-1.5">
          You missed a few days.
          <br />
          No drama. Score today.
        </p>

        <div className="flex gap-1.5 my-8">
          {weekDays.map((day, index) => {
            const jsDay = (index + 1) % 7;
            const daysAgo = (dayOfWeek - jsDay + 7) % 7;
            const isToday = daysAgo === 0;
            const isMissed = daysAgo > 0 && daysAgo <= daysMissed;
            const isScored = daysAgo > daysMissed;

            return (
              <div
                key={day + index}
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
          {daysMissed} day{daysMissed !== 1 ? "s" : ""} missed
        </p>

        <button
          type="button"
          onClick={() => setShowWelcomeBack(false)}
          className="w-full min-h-[48px] py-4 rounded-2xl text-[17px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
        >
          Score Today
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

  if (!build || !stat || !draft) {
    return <div className="flex-1 bg-[#0a0a0a]" />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#0a0a0a] text-white">
      <ScoreCard
        stat={stat}
        completedIds={draft.completedIds}
        extraEffort={draft.extraEffort}
        note={draft.note}
        currentIndex={currentIndex}
        total={activeStats.length}
        onToggleItem={handleToggleItem}
        onExtraEffortChange={(extraEffort) => updateDraft(stat.id, (current) => ({ ...current, extraEffort }))}
        onNoteChange={(note) => updateDraft(stat.id, (current) => ({ ...current, note }))}
        onNext={handleNext}
        onBack={() => setCurrentIndex((index) => Math.max(0, index - 1))}
        isFirst={currentIndex === 0}
        isLast={currentIndex === activeStats.length - 1}
      />
    </div>
  );
}
