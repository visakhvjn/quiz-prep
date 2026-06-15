import { runGenerateQuestionsAgent } from "@/lib/agents/agents";
import type { QuizGraphStateType } from "@/lib/agents/state";

export async function generateQuestionsNode(
  state: QuizGraphStateType,
): Promise<Partial<QuizGraphStateType>> {
  const isRetry = state.feedback.length > 0;
  const retryCount = isRetry ? state.retryCount + 1 : state.retryCount;

  const result = await runGenerateQuestionsAgent({
    subtopics: state.subtopics,
    questionCount: state.questionCount,
    targetDifficulty: state.targetDifficulty,
    feedback: state.feedback,
  });

  return {
    draftQuestions: result.questions.slice(0, state.questionCount),
    retryCount,
    difficultyPassed: false,
    uniquenessPassed: false,
    feedback: [],
  };
}
