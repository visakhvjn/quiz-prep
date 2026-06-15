export type Difficulty = "easy" | "medium" | "hard";

export interface DraftQuestion {
  subtopic: string;
  question: string;
  correctAnswer: string;
}

export interface QuizQuestion {
  id: string;
  subtopic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  topics: string;
  difficulty: Difficulty;
  questions: QuizQuestion[];
  createdAt: string;
}

export type AgentName =
  | "sanitize"
  | "generate"
  | "options"
  | "difficulty"
  | "uniqueness";

export interface GenerateQuizRequest {
  topics: string;
  difficulty?: Difficulty;
  questionCount?: number;
}

export type QuizStreamEvent =
  | { type: "agent_start"; agent: AgentName }
  | { type: "agent_done"; agent: AgentName; data?: Record<string, unknown> }
  | { type: "complete"; quiz: Quiz }
  | { type: "error"; message: string };
