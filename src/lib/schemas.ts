import { z } from "zod";

export const difficultySchema = z.enum(["easy", "medium", "hard"]);

export const draftQuestionSchema = z.object({
  subtopic: z.string(),
  question: z.string().min(10),
  correctAnswer: z.string().min(1),
});

export const planAndGenerateOutputSchema = z.object({
  title: z
    .string()
    .min(8)
    .max(80)
    .describe(
      "A catchy, engaging quiz title inspired by the topics. Do NOT paste the user's raw topic list — write like a practice pack name (e.g. 'Master React Hooks' not 'react hooks, useEffect, useState')",
    ),
  description: z
    .string()
    .min(30)
    .max(220)
    .describe(
      "An enticing one-sentence hook for the quiz card that makes someone want to start — highlight the skill they'll build, not a dry topic list",
    ),
  subtopics: z
    .array(z.string().min(2))
    .min(3)
    .max(10)
    .describe("Interview-relevant subtopics derived from user input"),
  questions: z.array(draftQuestionSchema).min(1),
});

export const questionWithOptionsSchema = z.object({
  subtopic: z.string(),
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z
    .string()
    .min(80)
    .describe(
      "A descriptive 2-4 sentence explanation: why the correct answer is right, why plausible wrong options are incorrect, and a short interview tip or real-world context",
    ),
});

export const addOptionsOutputSchema = z.object({
  questions: z.array(questionWithOptionsSchema).min(1),
});

export const qualityAssessmentSchema = z.object({
  difficultyAssessments: z.array(
    z.object({
      questionIndex: z.number().int().min(0),
      rating: z.enum(["too_easy", "appropriate", "too_hard"]),
      note: z.string().describe("Optional note, or empty string if none"),
    }),
  ),
  duplicateGroups: z.array(
    z.object({
      indices: z.array(z.number().int().min(0)),
      reason: z.string(),
    }),
  ),
  passed: z.boolean(),
  feedback: z.array(z.string()),
});

// Kept for backwards compatibility if referenced elsewhere
export const sanitizeTopicsOutputSchema = z.object({
  subtopics: planAndGenerateOutputSchema.shape.subtopics,
});

export const generateQuestionsOutputSchema = z.object({
  questions: z.array(draftQuestionSchema).min(1),
});

export const difficultyAssessmentSchema = qualityAssessmentSchema;
export const uniquenessAssessmentSchema = qualityAssessmentSchema;
