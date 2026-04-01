"use client";

import { Category, getAnchorLabel } from "@/lib/categories";

interface ScoreCardProps {
  category: Category;
  score: number;
  comment: string;
  currentIndex: number;
  total: number;
  onScoreChange: (score: number) => void;
  onCommentChange: (comment: string) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function ScoreCard({
  category,
  score,
  comment,
  currentIndex,
  total,
  onScoreChange,
  onCommentChange,
  onNext,
  onBack,
  isFirst,
  isLast,
}: ScoreCardProps) {
  const anchorLabel = getAnchorLabel(category.anchors, score);

  return (
    <div className="flex flex-col flex-1 px-6 safe-top safe-bottom">
      {/* Progress dots */}
      <div className="flex justify-center gap-2.5 py-4 shrink-0">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                i < currentIndex
                  ? category.color
                  : i === currentIndex
                  ? "#fff"
                  : "#1a1a2e",
              boxShadow: i === currentIndex ? "0 0 8px rgba(255,255,255,0.3)" : "none",
            }}
          />
        ))}
      </div>

      {/* Top spacer */}
      <div className="flex-1 min-h-2" />

      {/* Emoji */}
      <div className="text-center text-5xl mb-3 shrink-0">{category.emoji}</div>

      {/* Question */}
      <h1 className="text-center text-[24px] font-bold mb-6 leading-tight px-2 shrink-0">
        How was your{" "}
        <span style={{ color: category.color }}>{category.name.toLowerCase()}</span>{" "}
        today?
      </h1>

      {/* Score circle */}
      <div className="flex items-center justify-center gap-5 mb-2 shrink-0">
        <button
          type="button"
          onClick={() => onScoreChange(Math.max(1, score - 1))}
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border border-[#222] bg-[#111] text-[#555] active:scale-90 transition-transform"
        >
          −
        </button>
        <div
          className="w-[88px] h-[88px] rounded-full flex items-center justify-center text-[40px] font-extrabold transition-all duration-200"
          style={{
            backgroundColor: category.colorBg,
            color: category.color,
            borderWidth: 2,
            borderColor: category.colorBorder,
          }}
        >
          {score}
        </div>
        <button
          type="button"
          onClick={() => onScoreChange(Math.min(10, score + 1))}
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border border-[#222] bg-[#111] text-[#555] active:scale-90 transition-transform"
        >
          +
        </button>
      </div>

      {/* Anchor label */}
      <p className="text-center text-[13px] text-[#666] mb-4 shrink-0">{anchorLabel}</p>

      {/* 1-10 dot scale */}
      <div className="flex justify-between mb-1 shrink-0">
        {Array.from({ length: 10 }).map((_, i) => {
          const val = i + 1;
          const isSelected = val === score;
          return (
            <button
              type="button"
              key={val}
              onClick={() => onScoreChange(val)}
              className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-medium transition-all duration-150 active:scale-110"
              style={{
                backgroundColor: isSelected ? category.colorBg : "#151520",
                borderWidth: 1,
                borderColor: isSelected ? category.color : "#1a1a2e",
                color: isSelected ? category.color : "#444",
              }}
            >
              {val}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between mb-4 shrink-0">
        <span className="text-[10px] text-[#444]">{category.scaleMin}</span>
        <span className="text-[10px] text-[#444]">{category.scaleMax}</span>
      </div>

      {/* Comment field */}
      <textarea
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="What did you do? (optional)"
        className="bg-[#0f0f1a] border border-[#1a1a2e] rounded-xl px-4 py-3 text-sm text-[#999] placeholder-[#444] resize-none focus:outline-none focus:border-[#2a2a3e] shrink-0"
        rows={2}
      />

      {/* Bottom spacer */}
      <div className="flex-1 min-h-4" />

      {/* Navigation buttons */}
      <div className="flex gap-3 shrink-0 pb-2">
        {!isFirst && (
          <button
            type="button"
            onClick={onBack}
            className="px-5 min-h-[48px] rounded-xl text-[15px] font-semibold bg-[#111] border border-[#222] text-[#777] active:scale-95 transition-transform"
          >
            ←
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          className="flex-1 min-h-[48px] rounded-xl text-[16px] font-bold text-white transition-all active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)`,
          }}
        >
          {isLast ? "See My Score →" : "Next →"}
        </button>
      </div>
    </div>
  );
}
