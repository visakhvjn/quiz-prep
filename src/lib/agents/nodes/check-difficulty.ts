import { runCheckDifficultyAgent } from "@/lib/agents/agents";
import type { QuizGraphStateType } from "@/lib/agents/state";

export async function checkDifficultyNode(
  state: QuizGraphStateType,
): Promise<Partial<QuizGraphStateType>> {
  const payload = state.questions.map((question, index) => ({
    index,
    subtopic: question.subtopic,
    question: question.question,
    correctAnswer: question.options[question.correctIndex],
  }));

  const result = await runCheckDifficultyAgent({
    targetDifficulty: state.targetDifficulty,
    questions: payload,
  });

  const inappropriateCount = result.assessments.filter(
    (item) => item.rating !== "appropriate",
  ).length;
  const majorityFail = inappropriateCount > payload.length / 2;
  const passed = result.passed && !majorityFail;

  const feedback = passed
    ? []
    : (result.feedback?.length ?? 0) > 0
      ? (result.feedback ?? [])
      : result.assessments
          .filter((item) => item.rating !== "appropriate")
          .map(
            (item) =>
              `Question ${item.questionIndex + 1} is ${item.rating.replace("_", " ")}${item.note ? `: ${item.note}` : ""}`,
          );

  return {
    difficultyPassed: passed,
    feedback,
  };
}
