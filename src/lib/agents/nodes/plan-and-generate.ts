import { runPlanAndGenerateAgent } from "@/lib/agents/agents";
import type { QuizGraphStateType } from "@/lib/agents/state";

export async function planAndGenerateNode(
  state: QuizGraphStateType,
): Promise<Partial<QuizGraphStateType>> {
  const trimmed = state.rawTopics.trim();
  if (!trimmed) {
    throw new Error("Please enter at least one topic to practice.");
  }

  const result = await runPlanAndGenerateAgent({
    topics: trimmed,
    questionCount: state.questionCount,
    targetDifficulty: state.targetDifficulty,
    feedback: [],
  });

  return {
    subtopics: result.subtopics,
    draftQuestions: result.questions.slice(0, state.questionCount),
    retryCount: 0,
    feedback: [],
    questions: [],
  };
}
