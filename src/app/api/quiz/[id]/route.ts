import { NextResponse } from "next/server";
import {
  getOwnerIdFromRequest,
  getQuizRecord,
  isQuizOwner,
  updateQuizRecord,
} from "@/lib/quiz-db";
import type { UpdateQuizRequest } from "@/types/quiz";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const ownerId = getOwnerIdFromRequest(request);
  const quiz = await getQuizRecord(id);

  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const isOwner = await isQuizOwner(id, ownerId);
  return NextResponse.json({ quiz, isOwner });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const ownerId = getOwnerIdFromRequest(request);

  if (!ownerId) {
    return NextResponse.json({ error: "Owner id required" }, { status: 401 });
  }

  let body: UpdateQuizRequest;
  try {
    body = (await request.json()) as UpdateQuizRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const quiz = await updateQuizRecord(id, ownerId, body);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  return NextResponse.json({ quiz });
}
