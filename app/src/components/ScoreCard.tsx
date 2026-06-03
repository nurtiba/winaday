"use client";

import { calculateStatScore, getActiveNonNegotiables, LifeStat } from "@/lib/categories";

interface ScoreCardProps {
  stat: LifeStat;
  completedIds: string[];
  extraEffort: 0 | 10 | 20;
  note: string;
  currentIndex: number;
  total: number;
  onToggleItem: (itemId: string) => void;
  onExtraEffortChange: (extraEffort: 0 | 10 | 20) => void;
  onNoteChange: (note: string) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function ScoreCard({
  stat,
  completedIds,
  extraEffort,
  note,
  currentIndex,
  total,
  onToggleItem,
  onExtraEffortChange,
  onNoteChange,
  onNext,
  onBack,
  isFirst,
  isLast,
}: ScoreCardProps) {
  const items = getActiveNonNegotiables(stat);
  const statScore = calculateStatScore(items.length, completedIds.length, extraEffort);
  const completedText = `${completedIds.length}/${items.length} non-negotiables`;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 safe-top safe-bottom">
      <div className="flex items-center justify-between py-2 shrink-0">
        <span className="text-[12px] text-[#666]">{currentIndex + 1}/{total}</span>
        <div className="flex justify-center gap-2">
          {Array.from({ length: total }).map((_, index) => (
            <div
              key={index}
              className="h-2.5 w-2.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: index <= currentIndex ? stat.color : "#1a1a2e",
                opacity: index === currentIndex ? 1 : 0.65,
              }}
            />
          ))}
        </div>
        <span className="text-[12px] text-[#666]">Today</span>
      </div>

      <div className="shrink-0 text-center pt-5 pb-4">
        <div className="text-[42px] leading-none mb-2">{stat.emoji}</div>
        <p className="text-[12px] font-bold uppercase tracking-[1px] text-[#666]">{stat.name}</p>
        <h1 className="mt-2 text-[25px] font-extrabold leading-tight">
          What did you complete?
        </h1>
      </div>

      <div className="mb-4 rounded-2xl border px-4 py-3" style={{ borderColor: stat.colorBorder, background: stat.colorBg }}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[12px] text-[#999]">{completedText}</p>
            <p className="text-[13px] text-[#777]">Bare minimum caps at 80</p>
          </div>
          <p className="text-[44px] font-extrabold leading-none" style={{ color: stat.color }}>
            {statScore}
          </p>
        </div>
      </div>

      <div className="space-y-2.5 shrink-0">
        {items.map((item) => {
          const checked = completedIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggleItem(item.id)}
              className="flex min-h-[54px] w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-transform active:scale-[0.99]"
              style={{
                backgroundColor: checked ? stat.colorBg : "#101018",
                borderColor: checked ? stat.colorBorder : "#222233",
              }}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[15px] font-bold"
                style={{
                  borderColor: checked ? stat.color : "#333344",
                  backgroundColor: checked ? stat.color : "transparent",
                  color: checked ? "#050505" : "#555566",
                }}
              >
                {checked ? "✓" : ""}
              </span>
              <span className="text-[14px] font-semibold leading-snug text-[#e8e8e8]">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 shrink-0">
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.8px] text-[#666]">
          Extra effort
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[0, 10, 20].map((value) => {
            const selected = extraEffort === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onExtraEffortChange(value as 0 | 10 | 20)}
                className="min-h-[44px] rounded-xl border text-[13px] font-bold"
                style={{
                  backgroundColor: selected ? stat.color : "#101018",
                  borderColor: selected ? stat.color : "#222233",
                  color: selected ? "#050505" : "#777788",
                }}
              >
                {value === 0 ? "None" : `+${value}`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 shrink-0">
        <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.8px] text-[#666]" htmlFor={`note-${stat.id}`}>
          Private note
        </label>
        <textarea
          id={`note-${stat.id}`}
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="What moved this stat today?"
          className="min-h-[72px] w-full resize-none rounded-xl border border-[#222233] bg-[#0f0f1a] px-4 py-3 text-[14px] text-[#ddd] placeholder-[#555566] focus:border-[#3a3a4e] focus:outline-none"
          rows={2}
        />
        <p className="mt-1.5 text-[11px] text-[#444]">Private. Never shown on share cards.</p>
      </div>

      <div className="min-h-4 flex-1" />

      <div className="flex gap-3 shrink-0 pb-2">
        {!isFirst && (
          <button
            type="button"
            onClick={onBack}
            className="min-h-[50px] w-16 rounded-xl border border-[#222] bg-[#111] text-[18px] font-bold text-[#777] active:scale-95"
            aria-label="Back"
          >
            ←
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          className="min-h-[50px] flex-1 rounded-xl text-[16px] font-extrabold text-white transition-transform active:scale-[0.98]"
          style={{ background: `linear-gradient(135deg, ${stat.color}, ${stat.color}cc)` }}
        >
          {isLast ? "See Life Score" : "Next Stat"}
        </button>
      </div>
    </div>
  );
}
