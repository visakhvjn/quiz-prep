import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type {
  Difficulty,
  Quiz,
  QuizAttempt,
  QuizAttemptDetail,
  QuizQuestion,
  QuizVisibility,
} from "@/types/quiz";

type DbQuiz = Prisma.QuizGetPayload<{ include: { attempts: false } }>;
type DbAttempt = Prisma.AttemptGetPayload<Record<string, never>>;

export function toQuiz(record: DbQuiz): Quiz {
  return {
    id: record.id,
    topics: record.topics,
    title: record.title,
    description: record.description,
    subtopics: [...record.subtopics],
    difficulty: record.difficulty as Difficulty,
    visibility: record.visibility as QuizVisibility,
    questions: record.questions.map((question) => ({
      id: question.id,
      subtopic: question.subtopic,
      question: question.question,
      options: [...question.options],
      correctIndex: question.correctIndex,
      explanation: question.explanation ?? undefined,
    })),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toAttempt(record: DbAttempt): QuizAttempt {
  return {
    id: record.id,
    quizId: record.quizId,
    participantName: record.participantName ?? undefined,
    score: record.score,
    total: record.total,
    completedAt: record.completedAt.toISOString(),
  };
}

export function toAttemptDetail(record: DbAttempt): QuizAttemptDetail {
  return {
    ...toAttempt(record),
    answers: record.answers.map((answer) => ({
      questionId: answer.questionId,
      question: answer.question,
      options: [...answer.options],
      selectedIndex: answer.selectedIndex,
      correctIndex: answer.correctIndex,
      isCorrect: answer.isCorrect,
    })),
  };
}

export function getOwnerIdFromRequest(request: Request): string | null {
  return request.headers.get("x-owner-id")?.trim() || null;
}

export async function createQuizRecord(input: {
  id: string;
  ownerId: string;
  topics: string;
  title: string;
  description: string;
  subtopics: string[];
  difficulty: Difficulty;
  questions: QuizQuestion[];
}) {
  const record = await prisma.quiz.create({
    data: {
      id: input.id,
      ownerId: input.ownerId,
      topics: input.topics,
      title: input.title,
      description: input.description,
      subtopics: input.subtopics,
      difficulty: input.difficulty,
      visibility: "private",
      questions: input.questions.map((question) => ({
        id: question.id,
        subtopic: question.subtopic,
        question: question.question,
        options: question.options,
        correctIndex: question.correctIndex,
        explanation: question.explanation ?? null,
      })),
    },
  });

  return toQuiz(record);
}

export async function getQuizRecord(id: string) {
  const record = await prisma.quiz.findUnique({ where: { id } });
  return record ? toQuiz(record) : null;
}

export async function listOwnerQuizzes(ownerId: string) {
  const records = await prisma.quiz.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });
  return records.map(toQuiz);
}

export async function listPublicQuizzes() {
  const records = await prisma.quiz.findMany({
    where: { visibility: "public" },
    orderBy: { createdAt: "desc" },
    take: 24,
  });
  return records.map(toQuiz);
}

export async function updateQuizRecord(
  id: string,
  ownerId: string,
  data: {
    topics?: string;
    title?: string;
    description?: string;
    difficulty?: Difficulty;
    visibility?: QuizVisibility;
    questions?: QuizQuestion[];
  },
) {
  const existing = await prisma.quiz.findFirst({
    where: { id, ownerId },
  });
  if (!existing) return null;

  const record = await prisma.quiz.update({
    where: { id },
    data: {
      ...(data.topics !== undefined ? { topics: data.topics } : {}),
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.difficulty !== undefined ? { difficulty: data.difficulty } : {}),
      ...(data.visibility !== undefined ? { visibility: data.visibility } : {}),
      ...(data.questions !== undefined
        ? {
            questions: data.questions.map((question) => ({
              id: question.id,
              subtopic: question.subtopic,
              question: question.question,
              options: question.options,
              correctIndex: question.correctIndex,
              explanation: question.explanation ?? null,
            })),
          }
        : {}),
    },
  });

  return toQuiz(record);
}

export async function listQuizAttempts(quizId: string, ownerId: string) {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, ownerId },
  });
  if (!quiz) return null;

  const attempts = await prisma.attempt.findMany({
    where: { quizId },
    orderBy: { completedAt: "desc" },
  });

  return attempts.map(toAttempt);
}

export async function getQuizAttemptDetail(
  quizId: string,
  attemptId: string,
  ownerId: string,
) {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, ownerId },
  });
  if (!quiz) return null;

  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, quizId },
  });
  if (!attempt) return null;

  return toAttemptDetail(attempt);
}

export async function createQuizAttempt(input: {
  quizId: string;
  participantName?: string;
  score: number;
  total: number;
  answers: QuizAttemptDetail["answers"];
}) {
  const quiz = await prisma.quiz.findUnique({ where: { id: input.quizId } });
  if (!quiz) return null;

  const attempt = await prisma.attempt.create({
    data: {
      quizId: input.quizId,
      participantName: input.participantName ?? null,
      score: input.score,
      total: input.total,
      answers: input.answers.map((answer) => ({
        questionId: answer.questionId,
        question: answer.question,
        options: answer.options,
        selectedIndex: answer.selectedIndex,
        correctIndex: answer.correctIndex,
        isCorrect: answer.isCorrect,
      })),
    },
  });

  return toAttemptDetail(attempt);
}

export async function isQuizOwner(quizId: string, ownerId: string | null) {
  if (!ownerId) return false;
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, ownerId },
    select: { id: true },
  });
  return Boolean(quiz);
}
