import type { Difficulty } from "@/types/quiz";

export type PlanTier = "hobby" | "premium";

export const PLAN_LIMITS = {
  hobby: {
    maxQuestions: 10,
    minQuestions: 3,
    documentUpload: false,
    modelLabel: "Efficient AI models",
    description: "Great for quick practice sessions",
    allowedDifficulties: ["easy", "medium"] as const,
  },
  premium: {
    maxQuestions: 5,
    minQuestions: 3,
    documentUpload: true,
    modelLabel: "Advanced AI models",
    description: "For power users and educators",
    allowedDifficulties: ["easy", "medium", "hard"] as const,
  },
} as const;

export function normalizePlanTier(plan: string | null | undefined): PlanTier {
  return plan === "premium" ? "premium" : "hobby";
}

export function getQuestionCountRange(plan: PlanTier) {
  const limits = PLAN_LIMITS[plan];
  return Array.from(
    { length: limits.maxQuestions - limits.minQuestions + 1 },
    (_, index) => limits.minQuestions + index,
  );
}

export function clampQuestionCount(plan: PlanTier, count: number) {
  const limits = PLAN_LIMITS[plan];
  return Math.min(Math.max(count, limits.minQuestions), limits.maxQuestions);
}

export function isDifficultyAllowed(plan: PlanTier, difficulty: Difficulty) {
  return (PLAN_LIMITS[plan].allowedDifficulties as readonly Difficulty[]).includes(
    difficulty,
  );
}

export function getPremiumOwnerIds(): Set<string> {
  const raw = process.env.PREMIUM_OWNER_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

export function resolveOwnerPlan(
  ownerId: string,
  storedPlan?: string | null,
): PlanTier {
  if (getPremiumOwnerIds().has(ownerId)) {
    return "premium";
  }
  return normalizePlanTier(storedPlan);
}
