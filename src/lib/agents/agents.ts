import {
  addOptionsOutputSchema,
  difficultyAssessmentSchema,
  generateQuestionsOutputSchema,
  sanitizeTopicsOutputSchema,
  uniquenessAssessmentSchema,
} from "@/lib/schemas";
import {
  createStructuredAgent,
  invokeStructuredAgent,
} from "@/lib/agents/create-structured-agent";

function getSanitizeTopicsAgent() {
  return createStructuredAgent({
    name: "sanitize_topics",
    systemPrompt:
      "You prepare interview practice material. Clean user topic input, remove duplicates and noise, and expand it into focused subtopics suitable for technical interview questions. Return 5-10 subtopics.",
    responseFormat: sanitizeTopicsOutputSchema,
  });
}

function getGenerateQuestionsAgent() {
  return createStructuredAgent({
    name: "generate_questions",
    systemPrompt:
      "You write technical interview practice questions. Each question should have a clear correct answer. Do not include multiple-choice options.",
    responseFormat: generateQuestionsOutputSchema,
  });
}

function getAddOptionsAgent() {
  return createStructuredAgent({
    name: "add_options",
    systemPrompt:
      "Turn each interview question into a multiple-choice item with exactly 4 plausible options and 1 correct answer. Distractors should be realistic mistakes a candidate might make. For every question, write a descriptive explanation (2-4 sentences) that teaches the concept: state why the correct answer is right, briefly address why the wrong options fail, and add a practical interview tip or real-world example when helpful.",
    responseFormat: addOptionsOutputSchema,
  });
}

function getCheckDifficultyAgent() {
  return createStructuredAgent({
    name: "check_difficulty",
    systemPrompt:
      "Evaluate whether each interview question matches the requested difficulty. Mark as appropriate only if it would realistically appear at that level. Set passed to true only if at least 70% of questions are appropriate.",
    responseFormat: difficultyAssessmentSchema,
  });
}

function getCheckUniquenessAgent() {
  return createStructuredAgent({
    name: "check_uniqueness",
    systemPrompt:
      "Detect semantic duplicate interview questions. Questions testing the same concept with different wording should be grouped. Set passed to true only when all questions are meaningfully distinct.",
    responseFormat: uniquenessAssessmentSchema,
  });
}

export async function runSanitizeTopicsAgent(topics: string) {
  return invokeStructuredAgent<{ subtopics: string[] }>(
    getSanitizeTopicsAgent(),
    `Topics entered by the user:\n${topics}`,
  );
}

export async function runGenerateQuestionsAgent(input: {
  subtopics: string[];
  questionCount: number;
  targetDifficulty: string;
  feedback: string[];
}) {
  const feedbackSection =
    input.feedback.length > 0
      ? `\n\nFix these issues from the previous attempt:\n${input.feedback.map((item) => `- ${item}`).join("\n")}`
      : "";

  return invokeStructuredAgent<{
    questions: Array<{
      subtopic: string;
      question: string;
      correctAnswer: string;
    }>;
  }>(
    getGenerateQuestionsAgent(),
    `Create exactly ${input.questionCount} questions spread across these subtopics. Difficulty target: ${input.targetDifficulty}.\n\nSubtopics:\n${input.subtopics.map((topic) => `- ${topic}`).join("\n")}${feedbackSection}`,
  );
}

export async function runAddOptionsAgent(
  draftQuestions: Array<{
    subtopic: string;
    question: string;
    correctAnswer: string;
  }>,
) {
  return invokeStructuredAgent<{
    questions: Array<{
      subtopic: string;
      question: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
    }>;
  }>(getAddOptionsAgent(), JSON.stringify(draftQuestions, null, 2));
}

export async function runCheckDifficultyAgent(input: {
  targetDifficulty: string;
  questions: Array<{
    index: number;
    subtopic: string;
    question: string;
    correctAnswer: string;
  }>;
}) {
  return invokeStructuredAgent<{
    assessments: Array<{
      questionIndex: number;
      rating: "too_easy" | "appropriate" | "too_hard";
      note?: string;
    }>;
    passed: boolean;
    feedback?: string[];
  }>(
    getCheckDifficultyAgent(),
    `Target difficulty: ${input.targetDifficulty}\n\n${JSON.stringify(input.questions, null, 2)}`,
  );
}

export async function runCheckUniquenessAgent(
  questions: Array<{
    index: number;
    subtopic: string;
    question: string;
  }>,
) {
  return invokeStructuredAgent<{
    duplicateGroups: Array<{
      indices: number[];
      reason: string;
    }>;
    passed: boolean;
    feedback?: string[];
  }>(getCheckUniquenessAgent(), JSON.stringify(questions, null, 2));
}
