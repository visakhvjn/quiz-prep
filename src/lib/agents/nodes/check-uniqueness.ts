import { runCheckUniquenessAgent } from "@/lib/agents/agents";
import type { QuizGraphStateType } from "@/lib/agents/state";

export async function checkUniquenessNode(
  state: QuizGraphStateType,
): Promise<Partial<QuizGraphStateType>> {
  const payload = state.questions.map((question, index) => ({
    index,
    subtopic: question.subtopic,
    question: question.question,
  }));

  const result = await runCheckUniquenessAgent(payload);

  const feedback =
    result.passed && result.duplicateGroups.length === 0
      ? []
      : (result.feedback?.length ?? 0) > 0
        ? (result.feedback ?? [])
        : result.duplicateGroups.map(
            (group) =>
              `Duplicate questions at indices ${group.indices.map((index) => index + 1).join(", ")}: ${group.reason}`,
          );

  return {
    uniquenessPassed: result.passed && result.duplicateGroups.length === 0,
    feedback,
  };
}
