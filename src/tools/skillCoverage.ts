export type CoverageResult = {
  matched: string[];
  missing: string[];
  percent: number;
  isGood: boolean;
};

export const THRESHOLD = 70; // % needed to call the context "good"

// Escape characters like . + # so skills such as ".NET" or "C#" work in a regex
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function computeCoverage(skills: string[], context: string): CoverageResult {
  const text = context.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of skills) {
    const pattern = new RegExp(
      `(^|[^a-z0-9])${escapeRegex(skill.toLowerCase())}($|[^a-z0-9])`
    );
    if (pattern.test(text)) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const percent = skills.length === 0 ? 0 : Math.round((matched.length / skills.length) * 100);

  return { matched, missing, percent, isGood: percent >= THRESHOLD };
}