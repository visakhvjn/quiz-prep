import { runSanitizeTopicsAgent } from "@/lib/agents/agents";
import type { QuizGraphStateType } from "@/lib/agents/state";

export async function sanitizeTopicsNode(
  state: QuizGraphStateType,
): Promise<Partial<QuizGraphStateType>> {
  const trimmed = state.rawTopics.trim();
  if (!trimmed) {
    throw new Error("Please enter at least one topic to practice.");
  }

  const result = await runSanitizeTopicsAgent(trimmed);

  return {
    subtopics: result.subtopics,
    feedback: [],
    retryCount: 0,
    difficultyPassed: false,
    uniquenessPassed: false,
    draftQuestions: [],
    questions: [],
  };
}
