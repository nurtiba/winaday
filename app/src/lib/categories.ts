export interface NonNegotiable {
  id: string;
  label: string;
  sortOrder: number;
  active: boolean;
}

export interface LifeStat {
  id: string;
  name: string;
  emoji: string;
  color: string;
  colorBg: string;
  colorBorder: string;
  sortOrder: number;
  active: boolean;
  nonNegotiables: NonNegotiable[];
}

export interface UserBuild {
  version: 1;
  stats: LifeStat[];
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_LIFE_STATS: LifeStat[] = [
  {
    id: "health",
    name: "Health",
    emoji: "🏃",
    color: "#4ade80",
    colorBg: "rgba(74, 222, 128, 0.14)",
    colorBorder: "rgba(74, 222, 128, 0.35)",
    sortOrder: 0,
    active: true,
    nonNegotiables: [
      { id: "health-move", label: "Move or train today", sortOrder: 0, active: true },
      { id: "health-food", label: "Eat clean basics", sortOrder: 1, active: true },
      { id: "health-sleep", label: "Protect sleep or recovery", sortOrder: 2, active: true },
    ],
  },
  {
    id: "wealth",
    name: "Wealth",
    emoji: "💰",
    color: "#fbbf24",
    colorBg: "rgba(251, 191, 36, 0.14)",
    colorBorder: "rgba(251, 191, 36, 0.35)",
    sortOrder: 1,
    active: true,
    nonNegotiables: [
      { id: "wealth-track", label: "Track money or expenses", sortOrder: 0, active: true },
      { id: "wealth-build", label: "Do income-building work", sortOrder: 1, active: true },
      { id: "wealth-save", label: "Avoid wasteful spending", sortOrder: 2, active: true },
    ],
  },
  {
    id: "learning",
    name: "Learning",
    emoji: "📚",
    color: "#a78bfa",
    colorBg: "rgba(167, 139, 250, 0.14)",
    colorBorder: "rgba(167, 139, 250, 0.35)",
    sortOrder: 2,
    active: true,
    nonNegotiables: [
      { id: "learning-ai", label: "AI learning for 2 hours", sortOrder: 0, active: true },
      { id: "learning-output", label: "Publish or create one output", sortOrder: 1, active: true },
      { id: "learning-quality", label: "Study one high-quality thing", sortOrder: 2, active: true },
    ],
  },
  {
    id: "relations",
    name: "Relations",
    emoji: "❤️",
    color: "#fb7185",
    colorBg: "rgba(251, 113, 133, 0.14)",
    colorBorder: "rgba(251, 113, 133, 0.35)",
    sortOrder: 3,
    active: true,
    nonNegotiables: [
      { id: "relations-reach", label: "Reach out to someone important", sortOrder: 0, active: true },
      { id: "relations-quality", label: "Have one real conversation", sortOrder: 1, active: true },
      { id: "relations-repair", label: "Repair or avoid avoidable friction", sortOrder: 2, active: true },
    ],
  },
  {
    id: "mental",
    name: "Mental",
    emoji: "🧠",
    color: "#60a5fa",
    colorBg: "rgba(96, 165, 250, 0.14)",
    colorBorder: "rgba(96, 165, 250, 0.35)",
    sortOrder: 4,
    active: true,
    nonNegotiables: [
      { id: "mental-reflect", label: "Reflect or meditate for 10 minutes", sortOrder: 0, active: true },
      { id: "mental-plan", label: "Plan tomorrow clearly", sortOrder: 1, active: true },
      { id: "mental-control", label: "Stay off one bad mental loop", sortOrder: 2, active: true },
    ],
  },
];

export const STAT_PALETTE = [
  { color: "#4ade80", colorBg: "rgba(74, 222, 128, 0.14)", colorBorder: "rgba(74, 222, 128, 0.35)" },
  { color: "#fbbf24", colorBg: "rgba(251, 191, 36, 0.14)", colorBorder: "rgba(251, 191, 36, 0.35)" },
  { color: "#a78bfa", colorBg: "rgba(167, 139, 250, 0.14)", colorBorder: "rgba(167, 139, 250, 0.35)" },
  { color: "#fb7185", colorBg: "rgba(251, 113, 133, 0.14)", colorBorder: "rgba(251, 113, 133, 0.35)" },
  { color: "#60a5fa", colorBg: "rgba(96, 165, 250, 0.14)", colorBorder: "rgba(96, 165, 250, 0.35)" },
  { color: "#2dd4bf", colorBg: "rgba(45, 212, 191, 0.14)", colorBorder: "rgba(45, 212, 191, 0.35)" },
];

export function createDefaultBuild(now = new Date().toISOString()): UserBuild {
  return {
    version: 1,
    stats: DEFAULT_LIFE_STATS.map((stat) => ({
      ...stat,
      nonNegotiables: stat.nonNegotiables.map((item) => ({ ...item })),
    })),
    createdAt: now,
    updatedAt: now,
  };
}

export function getActiveStats(build: UserBuild): LifeStat[] {
  return [...build.stats]
    .filter((stat) => stat.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getActiveNonNegotiables(stat: LifeStat): NonNegotiable[] {
  return [...stat.nonNegotiables]
    .filter((item) => item.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getNonNegotiableCap(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 60;
  if (count === 2) return 70;
  return 80;
}

export function calculateStatScore(totalItems: number, completedItems: number, extraEffort: 0 | 10 | 20): number {
  const cap = getNonNegotiableCap(totalItems);
  if (cap === 0) return extraEffort;
  const base = Math.round((Math.min(completedItems, totalItems) / totalItems) * cap);
  return Math.min(100, base + extraEffort);
}

export function getVerdict(percent: number): string {
  if (percent >= 90) return "Peak day";
  if (percent >= 80) return "Won the day";
  if (percent >= 65) return "Strong day";
  if (percent >= 50) return "Kept it alive";
  return "Needs attention";
}

export function getHeatmapColor(percent: number | null): string {
  if (percent === null) return "#111111";
  if (percent < 50) return "#1a1a2e";
  if (percent < 65) return "#14532d";
  if (percent < 80) return "#22c55e";
  return "#4ade80";
}
