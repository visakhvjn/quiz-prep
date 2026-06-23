import {
  addOptionsOutputSchema,
  planAndGenerateOutputSchema,
} from "@/lib/schemas";
import type { PlanTier } from "@/lib/plans";
import {
  createStructuredAgent,
  invokeStructuredAgent,
} from "@/lib/agents/create-structured-agent";

const PLAN_AGENT = "plan_and_generate";
const OPTIONS_AGENT = "add_options";

function getPlanAndGenerateAgent(plan: PlanTier) {
  return createStructuredAgent({
    name: PLAN_AGENT,
    plan,
    systemPrompt:
      "You prepare interview practice material. Clean user topic input, expand it into focused subtopics, then write technical interview questions with clear correct answers. Also craft a catchy quiz title and an enticing one-sentence description for the quiz card — never copy-paste the user's raw topic list into the title or description. Do not include multiple-choice options. When source material is provided, ground questions in that content.",
    responseFormat: planAndGenerateOutputSchema,
  });
}

function getAddOptionsAgent(plan: PlanTier) {
  return createStructuredAgent({
    name: OPTIONS_AGENT,
    plan,
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
  sourceMaterial?: string;
  plan: PlanTier;
}) {
  getPlanAndGenerateAgent(input.plan);

  const feedbackSection =
    input.feedback.length > 0
      ? `\n\nFix these issues from the previous attempt:\n${input.feedback.map((item) => `- ${item}`).join("\n")}`
      : "";

  const sourceSection = input.sourceMaterial?.trim()
    ? `\n\nUse this uploaded reference material when writing questions. Prefer facts and concepts from the document:\n${input.sourceMaterial.trim().slice(0, 12000)}`
    : "";

  return invokeStructuredAgent<{
    title: string;
    description: string;
    subtopics: string[];
    questions: Array<{
      subtopic: string;
      question: string;
      correctAnswer: string;
    }>;
  }>(
    PLAN_AGENT,
    `Topics entered by the user:\n${input.topics}\n\nCreate exactly ${input.questionCount} questions spread across the subtopics. Difficulty target: ${input.targetDifficulty}. Write an engaging title and description that attract learners without repeating the raw topic list verbatim.${sourceSection}${feedbackSection}`,
    input.plan,
  );
}

export async function runAddOptionsAgent(
  draftQuestions: Array<{
    subtopic: string;
    question: string;
    correctAnswer: string;
  }>,
  plan: PlanTier,
) {
  getAddOptionsAgent(plan);

  return invokeStructuredAgent<{
    questions: Array<{
      subtopic: string;
      question: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
    }>;
  }>(OPTIONS_AGENT, JSON.stringify(draftQuestions, null, 2), plan);
}
