import {
  calculateStatScore,
  createDefaultBuild,
  getActiveNonNegotiables,
  getActiveStats,
  LifeStat,
  UserBuild,
} from "@/lib/categories";

export interface CompletedNonNegotiable {
  id: string;
  label: string;
  done: boolean;
}

export interface DayStatResult {
  statId: string;
  statName: string;
  statEmoji: string;
  statColor: string;
  completedNonNegotiableIds: string[];
  nonNegotiables: CompletedNonNegotiable[];
  extraEffort: 0 | 10 | 20;
  score: number;
  note: string;
}

export interface DayScore {
  date: string; // YYYY-MM-DD in local time
  scores: Record<string, number>; // statId -> score (0-100)
  comments: Record<string, string>; // statId -> private note
  statResults?: Record<string, DayStatResult>;
  totalPercent: number;
  createdAt: string; // ISO timestamp
}

const SCORES_KEY = "wintheday_scores";
const BUILD_KEY = "wintheday_build";
const SHARE_PRIVACY_KEY = "wintheday_share_privacy";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function generateId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getAllScores(): DayScore[] {
  if (!isBrowser()) return [];
  const parsed = safeParse<DayScore[]>(localStorage.getItem(SCORES_KEY));
  if (!Array.isArray(parsed)) return [];
  return parsed;
}

export function getScoreForDate(date: string): DayScore | null {
  const scores = getAllScores();
  return scores.find((score) => score.date === date) || null;
}

export function saveScore(score: DayScore): void {
  if (!isBrowser()) return;
  const scores = getAllScores();
  const existing = scores.findIndex((item) => item.date === score.date);
  if (existing >= 0) {
    scores[existing] = score;
  } else {
    scores.push(score);
  }
  scores.sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
}

export function getUserBuild(): UserBuild {
  const fallback = createDefaultBuild();
  if (!isBrowser()) return fallback;

  const parsed = safeParse<UserBuild>(localStorage.getItem(BUILD_KEY));
  if (parsed?.version === 1 && Array.isArray(parsed.stats) && parsed.stats.length > 0) {
    return parsed;
  }

  localStorage.setItem(BUILD_KEY, JSON.stringify(fallback));
  return fallback;
}

export function saveUserBuild(build: UserBuild): void {
  if (!isBrowser()) return;
  const cleaned: UserBuild = {
    ...build,
    version: 1,
    updatedAt: new Date().toISOString(),
    stats: build.stats.map((stat, statIndex) => ({
      ...stat,
      sortOrder: statIndex,
      active: stat.active,
      name: stat.name.trim() || "Untitled",
      nonNegotiables: stat.nonNegotiables.map((item, itemIndex) => ({
        ...item,
        label: item.label.trim() || "Untitled non-negotiable",
        sortOrder: itemIndex,
        active: item.active,
      })),
    })),
  };
  localStorage.setItem(BUILD_KEY, JSON.stringify(cleaned));
}

export function getShareBreakdownPreference(): boolean {
  if (!isBrowser()) return false;
  const parsed = safeParse<{ showBreakdown: boolean }>(localStorage.getItem(SHARE_PRIVACY_KEY));
  return parsed?.showBreakdown === true;
}

export function saveShareBreakdownPreference(showBreakdown: boolean): void {
  if (!isBrowser()) return;
  localStorage.setItem(SHARE_PRIVACY_KEY, JSON.stringify({ showBreakdown }));
}

export function getStreak(): number {
  const scores = getAllScores();
  if (scores.length === 0) return 0;

  const sorted = [...scores].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = formatDate(checkDate);

    if (sorted.find((score) => score.date === dateStr)) {
      streak++;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }

  return streak;
}

export function getDaysSinceLastScore(): number {
  const scores = getAllScores();
  if (scores.length === 0) return -1;

  const sorted = [...scores].sort((a, b) => b.date.localeCompare(a.date));
  const lastDate = new Date(sorted[0].date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function buildDayStatResult(
  stat: LifeStat,
  completedIds: string[],
  extraEffort: 0 | 10 | 20,
  note: string
): DayStatResult {
  const activeItems = getActiveNonNegotiables(stat);
  const score = calculateStatScore(activeItems.length, completedIds.length, extraEffort);
  return {
    statId: stat.id,
    statName: stat.name,
    statEmoji: stat.emoji,
    statColor: stat.color,
    completedNonNegotiableIds: completedIds,
    nonNegotiables: activeItems.map((item) => ({
      id: item.id,
      label: item.label,
      done: completedIds.includes(item.id),
    })),
    extraEffort,
    score,
    note,
  };
}

export function getDisplayStatResults(dayScore: DayScore, build = getUserBuild()): DayStatResult[] {
  if (dayScore.statResults) {
    return Object.values(dayScore.statResults).sort((a, b) => {
      const statA = build.stats.find((stat) => stat.id === a.statId)?.sortOrder ?? 999;
      const statB = build.stats.find((stat) => stat.id === b.statId)?.sortOrder ?? 999;
      return statA - statB;
    });
  }

  return getActiveStats(build).map((stat) => ({
    statId: stat.id,
    statName: stat.name,
    statEmoji: stat.emoji,
    statColor: stat.color,
    completedNonNegotiableIds: [],
    nonNegotiables: getActiveNonNegotiables(stat).map((item) => ({
      id: item.id,
      label: item.label,
      done: false,
    })),
    extraEffort: 0,
    score: dayScore.scores[stat.id] || 0,
    note: dayScore.comments[stat.id] || "",
  }));
}
