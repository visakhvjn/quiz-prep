import { NextResponse } from "next/server";
import {
  createQuizAttempt,
  getOwnerIdFromRequest,
  getQuizAttemptDetail,
  getQuizRecord,
  listQuizAttempts,
} from "@/lib/quiz-db";
import type { CreateAttemptRequest } from "@/types/quiz";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const ownerId = getOwnerIdFromRequest(request);

  if (!ownerId) {
    return NextResponse.json({ error: "Owner id required" }, { status: 401 });
  }

  const attempts = await listQuizAttempts(id, ownerId);
  if (!attempts) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  return NextResponse.json({ attempts });
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  let body: CreateAttemptRequest;
  try {
    body = (await request.json()) as CreateAttemptRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const quiz = await getQuizRecord(id);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const participantName = body.participantName?.trim();
  if (!participantName) {
    return NextResponse.json(
      { error: "Participant name is required" },
      { status: 400 },
    );
  }

  const attempt = await createQuizAttempt({
    quizId: id,
    participantName,
    score: body.score,
    total: body.total,
    answers: body.answers,
  });

  if (!attempt) {
    return NextResponse.json({ error: "Failed to save attempt" }, { status: 500 });
  }

  return NextResponse.json({ attempt });
}
