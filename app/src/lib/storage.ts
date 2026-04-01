export interface DayScore {
  date: string; // YYYY-MM-DD
  scores: Record<string, number>; // categoryId -> score (1-10)
  comments: Record<string, string>; // categoryId -> optional comment
  totalPercent: number;
  createdAt: string; // ISO timestamp
}

const STORAGE_KEY = "wintheday_scores";

export function getAllScores(): DayScore[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getScoreForDate(date: string): DayScore | null {
  const scores = getAllScores();
  return scores.find((s) => s.date === date) || null;
}

export function saveScore(score: DayScore): void {
  const scores = getAllScores();
  const existing = scores.findIndex((s) => s.date === score.date);
  if (existing >= 0) {
    scores[existing] = score;
  } else {
    scores.push(score);
  }
  scores.sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
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

    if (sorted.find((s) => s.date === dateStr)) {
      streak++;
    } else if (i === 0) {
      // Today hasn't been scored yet, that's okay
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

  const diff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getToday(): string {
  return formatDate(new Date());
}
