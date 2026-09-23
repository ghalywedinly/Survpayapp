// Presentation rules for a 0–100 satisfaction score, shared by the dashboard
// hero and the branch list so a given number always reads the same way.
export type ScoreTone = "excellent" | "good" | "fair" | "poor";

export function scoreTone(score: number): ScoreTone {
  if (score >= 80) return "excellent";
  if (score >= 65) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

export const scoreToneClasses: Record<ScoreTone, { text: string; bar: string; chip: string; ring: string }> = {
  excellent: { text: "text-mint-content", bar: "bg-mint-500", chip: "bg-mint-50 text-mint-content", ring: "stroke-mint-500" },
  good: { text: "text-brand-content", bar: "bg-brand-500", chip: "bg-brand-50 text-brand-content", ring: "stroke-brand-500" },
  fair: { text: "text-amber-content", bar: "bg-amber-500", chip: "bg-amber-50 text-amber-content", ring: "stroke-amber-500" },
  poor: { text: "text-danger-content", bar: "bg-red-500", chip: "bg-danger-tint text-danger-content", ring: "stroke-red-500" },
};

export const scoreToneLabelKey: Record<ScoreTone, string> = {
  excellent: "branches.scoreExcellent",
  good: "branches.scoreGood",
  fair: "branches.scoreFair",
  poor: "branches.scorePoor",
};
