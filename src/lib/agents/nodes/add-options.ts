import { v4 as uuidv4 } from "uuid";
import { runAddOptionsAgent } from "@/lib/agents/agents";
import type { QuizGraphStateType } from "@/lib/agents/state";
import type { QuizQuestion } from "@/types/quiz";

function shuffleOptions(options: string[], correctIndex: number) {
  const indexed = options.map((option, index) => ({
    option,
    isCorrect: index === correctIndex,
  }));

  for (let i = indexed.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }

  return {
    options: indexed.map((item) => item.option),
    correctIndex: indexed.findIndex((item) => item.isCorrect),
  };
}

export async function addOptionsNode(
  state: QuizGraphStateType,
): Promise<Partial<QuizGraphStateType>> {
  const result = await runAddOptionsAgent(state.draftQuestions);

  const questions: QuizQuestion[] = result.questions.map((item) => {
    const shuffled = shuffleOptions(item.options, item.correctIndex);
    return {
      id: uuidv4(),
      subtopic: item.subtopic,
      question: item.question,
      options: shuffled.options,
      correctIndex: shuffled.correctIndex,
      explanation: item.explanation || undefined,
    };
  });

  return { questions };
}
