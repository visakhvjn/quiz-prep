import {
  addOptionsOutputSchema,
  planAndGenerateOutputSchema,
} from "@/lib/schemas";
import {
  createStructuredAgent,
  invokeStructuredAgent,
} from "@/lib/agents/create-structured-agent";

const PLAN_AGENT = "plan_and_generate";
const OPTIONS_AGENT = "add_options";

function getPlanAndGenerateAgent() {
  return createStructuredAgent({
    name: PLAN_AGENT,
    systemPrompt:
      "You prepare interview practice material. Clean user topic input, expand it into focused subtopics, then write technical interview questions with clear correct answers. Do not include multiple-choice options.",
    responseFormat: planAndGenerateOutputSchema,
  });
}

function getAddOptionsAgent() {
  return createStructuredAgent({
    name: OPTIONS_AGENT,
    systemPrompt:
      "Turn each interview question into a multiple-choice item with exactly 4 plausible options and 1 correct answer. Distractors should be realistic mistakes a candidate might make. For every question, write a descriptive explanation (2-4 sentences) that teaches the concept: state why the correct answer is right, briefly address why the wrong options fail, and add a practical interview tip or real-world example when helpful.",
    responseFormat: addOptionsOutputSchema,
  });
}

export async function runPlanAndGenerateAgent(input: {
  topics: string;
  questionCount: number;
  targetDifficulty: string;
  feedback: string[];
}) {
  getPlanAndGenerateAgent();

  const feedbackSection =
    input.feedback.length > 0
      ? `\n\nFix these issues from the previous attempt:\n${input.feedback.map((item) => `- ${item}`).join("\n")}`
      : "";

  return invokeStructuredAgent<{
    subtopics: string[];
    questions: Array<{
      subtopic: string;
      question: string;
      correctAnswer: string;
    }>;
  }>(
    PLAN_AGENT,
    `Topics entered by the user:\n${input.topics}\n\nCreate exactly ${input.questionCount} questions spread across the subtopics. Difficulty target: ${input.targetDifficulty}.${feedbackSection}`,
  );
}

export async function runAddOptionsAgent(
  draftQuestions: Array<{
    subtopic: string;
    question: string;
    correctAnswer: string;
  }>,
) {
  getAddOptionsAgent();

  return invokeStructuredAgent<{
    questions: Array<{
      subtopic: string;
      question: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
    }>;
  }>(OPTIONS_AGENT, JSON.stringify(draftQuestions, null, 2));
}
