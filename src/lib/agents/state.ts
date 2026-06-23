import { Annotation } from "@langchain/langgraph";
import type { Difficulty, DraftQuestion, QuizQuestion } from "@/types/quiz";

export const QuizGraphState = Annotation.Root({
  rawTopics: Annotation<string>,
  userDescription: Annotation<string>,
  title: Annotation<string>,
  description: Annotation<string>,
  sourceMaterial: Annotation<string>,
  plan: Annotation<"hobby" | "premium">,
  subtopics: Annotation<string[]>,
  draftQuestions: Annotation<DraftQuestion[]>,
  questions: Annotation<QuizQuestion[]>,
  targetDifficulty: Annotation<Difficulty>,
  questionCount: Annotation<number>,
  feedback: Annotation<string[]>,
  retryCount: Annotation<number>,
});

export type QuizGraphStateType = typeof QuizGraphState.State;
