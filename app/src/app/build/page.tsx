"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LifeStat, STAT_PALETTE, UserBuild } from "@/lib/categories";
import { generateId, getUserBuild, saveUserBuild } from "@/lib/storage";

const EMOJI_OPTIONS = ["🏃", "💰", "📚", "❤️", "🧠", "🎯", "✨", "🔥"];

function countActiveStats(stats: LifeStat[]): number {
  return stats.filter((stat) => stat.active).length;
}

export default function BuildPage() {
  const router = useRouter();
  const [build, setBuild] = useState<UserBuild | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) setBuild(getUserBuild());
    });
    return () => {
      active = false;
    };
  }, []);

  const updateStat = (statId: string, updater: (stat: LifeStat) => LifeStat) => {
    setSaved(false);
    setBuild((current) => {
      if (!current) return current;
      return {
        ...current,
        stats: current.stats.map((stat) => (stat.id === statId ? updater(stat) : stat)),
      };
    });
  };

  const addStat = () => {
    if (!build || countActiveStats(build.stats) >= 6) return;
    const palette = STAT_PALETTE[build.stats.length % STAT_PALETTE.length];
    const now = Date.now().toString(36);
    const newStat: LifeStat = {
      id: generateId("stat"),
      name: "New Stat",
      emoji: "🎯",
      color: palette.color,
      colorBg: palette.colorBg,
      colorBorder: palette.colorBorder,
      sortOrder: build.stats.length,
      active: true,
      nonNegotiables: [
        {
          id: `custom-${now}`,
          label: "Define the bare minimum",
          sortOrder: 0,
          active: true,
        },
      ],
    };
    setSaved(false);
    setBuild({ ...build, stats: [...build.stats, newStat] });
  };

  const removeStat = (statId: string) => {
    if (!build || countActiveStats(build.stats) <= 4) return;
    setSaved(false);
    setBuild({
      ...build,
      stats: build.stats.filter((stat) => stat.id !== statId).map((stat, index) => ({ ...stat, sortOrder: index })),
    });
  };

  const addNonNegotiable = (statId: string) => {
    updateStat(statId, (stat) => {
      const activeItems = stat.nonNegotiables.filter((item) => item.active);
      if (activeItems.length >= 5) return stat;
      return {
        ...stat,
        nonNegotiables: [
          ...stat.nonNegotiables,
          {
            id: generateId("nn"),
            label: "New non-negotiable",
            sortOrder: stat.nonNegotiables.length,
            active: true,
          },
        ],
      };
    });
  };

  const removeNonNegotiable = (statId: string, itemId: string) => {
    updateStat(statId, (stat) => {
      const activeItems = stat.nonNegotiables.filter((item) => item.active);
      if (activeItems.length <= 1) return stat;
      return {
        ...stat,
        nonNegotiables: stat.nonNegotiables
          .filter((item) => item.id !== itemId)
          .map((item, index) => ({ ...item, sortOrder: index })),
      };
    });
  };

  const saveBuild = () => {
    if (!build) return;
    saveUserBuild(build);
    setSaved(true);
  };

  if (!build) {
    return <div className="flex-1 bg-[#0a0a0a]" />;
  }

  const activeStats = build.stats.filter((stat) => stat.active);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#0a0a0a] text-white">
      <div className="mobile-scroll flex-1 px-5 safe-top pb-6">
        <div className="mb-5">
          <p className="text-[12px] uppercase tracking-[1px] text-[#555]">Your build</p>
          <h1 className="mt-1 text-[28px] font-extrabold leading-tight">Define your non-negotiables</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-[#777]">
            Set the bare minimum for each life stat. Keep one to five per stat and change them anytime.
          </p>
        </div>

        <div className="space-y-4 pb-6">
          {activeStats.map((stat) => {
            const items = stat.nonNegotiables.filter((item) => item.active);
            const canAddItem = items.length < 5;
            return (
              <section
                key={stat.id}
                className="rounded-2xl border border-[#202030] bg-[#0f0f18] p-4"
                style={{ boxShadow: `0 0 0 1px ${stat.colorBg}` }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <select
                    aria-label={`${stat.name} emoji`}
                    value={stat.emoji}
                    onChange={(event) => updateStat(stat.id, (current) => ({ ...current, emoji: event.target.value }))}
                    className="h-11 w-14 rounded-xl border border-[#242438] bg-[#11111c] text-center text-[20px] text-white"
                  >
                    {EMOJI_OPTIONS.map((emoji) => (
                      <option key={emoji} value={emoji}>{emoji}</option>
                    ))}
                  </select>
                  <input
                    value={stat.name}
                    onChange={(event) => updateStat(stat.id, (current) => ({ ...current, name: event.target.value }))}
                    className="min-h-[44px] flex-1 rounded-xl border border-[#242438] bg-[#11111c] px-3 text-[16px] font-bold text-white outline-none focus:border-[#4ade80]"
                    aria-label="Stat name"
                  />
                  <button
                    type="button"
                    onClick={() => removeStat(stat.id)}
                    disabled={activeStats.length <= 4}
                    className="h-11 w-11 rounded-xl border border-[#242438] bg-[#11111c] text-[18px] text-[#777] disabled:opacity-30"
                    aria-label={`Remove ${stat.name}`}
                  >
                    ×
                  </button>
                </div>

                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-[12px] font-bold uppercase tracking-[0.8px] text-[#666]">Non-negotiables</p>
                  <p className="shrink-0 text-[12px] font-semibold" style={{ color: stat.color }}>
                    {items.length}/5
                  </p>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#161622] text-[12px] font-bold text-[#666]">
                        {index + 1}
                      </span>
                      <input
                        value={item.label}
                        placeholder="Write your bare minimum"
                        onChange={(event) => updateStat(stat.id, (current) => ({
                          ...current,
                          nonNegotiables: current.nonNegotiables.map((currentItem) =>
                            currentItem.id === item.id ? { ...currentItem, label: event.target.value } : currentItem
                          ),
                        }))}
                        className="min-h-[44px] flex-1 rounded-xl border border-[#242438] bg-[#11111c] px-3 text-[14px] text-white outline-none focus:border-[#4ade80]"
                        aria-label={`${stat.name} non-negotiable ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeNonNegotiable(stat.id, item.id)}
                        disabled={items.length <= 1}
                        className="h-11 w-11 rounded-xl border border-[#242438] bg-[#11111c] text-[18px] font-bold text-[#aaa] disabled:text-[#444] disabled:opacity-40"
                        aria-label={`Remove ${item.label}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addNonNegotiable(stat.id)}
                  disabled={!canAddItem}
                  className="mt-3 min-h-[46px] w-full rounded-xl border border-dashed text-[14px] font-extrabold transition-transform active:scale-[0.99] disabled:opacity-40"
                  style={{
                    backgroundColor: canAddItem ? stat.colorBg : "transparent",
                    borderColor: canAddItem ? stat.colorBorder : "#303046",
                    color: canAddItem ? stat.color : "#666677",
                  }}
                >
                  {canAddItem ? "+ Add non-negotiable" : "Maximum reached"}
                </button>
              </section>
            );
          })}

          <button
            type="button"
            onClick={addStat}
            disabled={activeStats.length >= 6}
            className="min-h-[50px] w-full rounded-2xl border border-dashed border-[#303046] text-[14px] font-bold text-[#888] disabled:opacity-30"
          >
            Add life stat ({activeStats.length}/6)
          </button>
        </div>
      </div>

      <div className="shrink-0 border-t border-[#161622] bg-[#0a0a0a]/95 px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
        {saved && <p className="mb-2 text-center text-[12px] font-semibold text-[#4ade80]">Saved</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="min-h-[50px] w-24 rounded-xl border border-[#222] bg-[#111] text-[14px] font-bold text-[#777]"
          >
            Home
          </button>
          <button
            type="button"
            onClick={saveBuild}
            className="min-h-[50px] flex-1 rounded-xl text-[16px] font-extrabold text-white"
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
          >
            Save Build
          </button>
        </div>
      </div>
    </div>
  );
}
