export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  colorBg: string;
  colorBorder: string;
  gradient: string;
  scaleMin: string;
  scaleMax: string;
  anchors: Record<number, string>;
}

export const CATEGORIES: Category[] = [
  {
    id: "health",
    name: "Health",
    emoji: "🏃",
    color: "#4ade80",
    colorBg: "rgba(74, 222, 128, 0.15)",
    colorBorder: "rgba(74, 222, 128, 0.3)",
    gradient: "from-green-500 to-green-600",
    scaleMin: "rough day",
    scaleMax: "peak health",
    anchors: {
      1: "No movement, junk food",
      3: "Barely moved",
      5: "Decent meals + some movement",
      7: "Solid workout + clean meals",
      10: "Great workout + clean eating + solid sleep",
    },
  },
  {
    id: "learning",
    name: "Learning",
    emoji: "📚",
    color: "#a78bfa",
    colorBg: "rgba(167, 139, 250, 0.15)",
    colorBorder: "rgba(167, 139, 250, 0.3)",
    gradient: "from-violet-500 to-violet-600",
    scaleMin: "zero learning",
    scaleMax: "deep study",
    anchors: {
      1: "Nothing new",
      3: "Skimmed something",
      5: "Read an article or podcast",
      7: "Meaningful study session",
      10: "Hours of deep study or practice",
    },
  },
  {
    id: "career",
    name: "Career",
    emoji: "💼",
    color: "#fbbf24",
    colorBg: "rgba(251, 191, 36, 0.15)",
    colorBorder: "rgba(251, 191, 36, 0.3)",
    gradient: "from-amber-500 to-amber-600",
    scaleMin: "unproductive",
    scaleMax: "crushed it",
    anchors: {
      1: "Wasted the day",
      3: "Barely productive",
      5: "Normal workday",
      7: "Got a lot done",
      10: "Shipped something meaningful",
    },
  },
  {
    id: "relationships",
    name: "Relationships",
    emoji: "❤️",
    color: "#fb7185",
    colorBg: "rgba(251, 113, 133, 0.15)",
    colorBorder: "rgba(251, 113, 133, 0.3)",
    gradient: "from-rose-500 to-rose-600",
    scaleMin: "isolated",
    scaleMax: "deep connection",
    anchors: {
      1: "No contact with anyone",
      3: "Brief texts",
      5: "Texted or called someone",
      7: "Good quality time",
      10: "Deep quality time with people I love",
    },
  },
  {
    id: "spirit",
    name: "Spirit",
    emoji: "🧘",
    color: "#60a5fa",
    colorBg: "rgba(96, 165, 250, 0.15)",
    colorBorder: "rgba(96, 165, 250, 0.3)",
    gradient: "from-blue-500 to-blue-600",
    scaleMin: "drained",
    scaleMax: "deeply fulfilled",
    anchors: {
      1: "Anxious and drained",
      3: "Restless",
      5: "Calm, okay",
      7: "Grateful and peaceful",
      10: "Deeply fulfilled, creative flow",
    },
  },
];

export function getAnchorLabel(anchors: Record<number, string>, score: number): string {
  const keys = Object.keys(anchors).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  for (const key of keys) {
    if (key <= score) closest = key;
  }
  return anchors[closest];
}

export function getVerdict(percent: number): string {
  if (percent >= 80) return "Amazing day!";
  if (percent >= 65) return "Great day!";
  if (percent >= 50) return "Solid day";
  return "Room to grow";
}

export function getHeatmapColor(percent: number | null): string {
  if (percent === null) return "#111";
  if (percent < 50) return "#1a1a2e";
  if (percent < 65) return "#14532d";
  if (percent < 80) return "#22c55e";
  return "#4ade80";
}
