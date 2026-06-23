export type Difficulty = "easy" | "medium" | "hard";

export type QuizVisibility = "private" | "public";

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
  title: string;
  description: string;
  subtopics: string[];
  difficulty: Difficulty;
  visibility: QuizVisibility;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt?: string;
}

export interface AttemptAnswer {
  questionId: string;
  question: string;
  options: string[];
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  participantName?: string;
  score: number;
  total: number;
  completedAt: string;
}

export interface QuizAttemptDetail extends QuizAttempt {
  answers: AttemptAnswer[];
}

export interface QuizWithAccess {
  quiz: Quiz;
  isOwner: boolean;
}

export interface CreateAttemptRequest {
  participantName?: string;
  score: number;
  total: number;
  answers: AttemptAnswer[];
}

export interface UpdateQuizRequest {
  topics?: string;
  title?: string;
  description?: string;
  difficulty?: Difficulty;
  visibility?: QuizVisibility;
  questions?: QuizQuestion[];
}

export type AgentName = "prepare" | "options";

export interface GenerateQuizRequest {
  topics: string;
  description?: string;
  difficulty?: Difficulty;
  questionCount?: number;
  sourceMaterial?: string;
}

export interface AccountResponse {
  plan: "hobby" | "premium";
  limits: {
    maxQuestions: number;
    minQuestions: number;
    documentUpload: boolean;
    modelLabel: string;
    description: string;
    allowedDifficulties: readonly Difficulty[];
  };
}

export type QuizStreamEvent =
  | { type: "agent_start"; agent: AgentName }
  | { type: "agent_done"; agent: AgentName; data?: Record<string, unknown> }
  | { type: "complete"; quiz: Quiz }
  | { type: "error"; message: string };
