import { Annotation } from "@langchain/langgraph";
import type { Difficulty, DraftQuestion, QuizQuestion } from "@/types/quiz";

export const QuizGraphState = Annotation.Root({
  rawTopics: Annotation<string>,
  subtopics: Annotation<string[]>,
  draftQuestions: Annotation<DraftQuestion[]>,
  questions: Annotation<QuizQuestion[]>,
  targetDifficulty: Annotation<Difficulty>,
  questionCount: Annotation<number>,
  feedback: Annotation<string[]>,
  retryCount: Annotation<number>,
  difficultyPassed: Annotation<boolean>,
  uniquenessPassed: Annotation<boolean>,
});

export type QuizGraphStateType = typeof QuizGraphState.State;
