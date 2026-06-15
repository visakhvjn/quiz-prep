import { NextResponse } from "next/server";
import {
  getOwnerIdFromRequest,
  getQuizAttemptDetail,
} from "@/lib/quiz-db";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string; attemptId: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { id, attemptId } = await context.params;
  const ownerId = getOwnerIdFromRequest(request);

  if (!ownerId) {
    return NextResponse.json({ error: "Owner id required" }, { status: 401 });
  }

  const attempt = await getQuizAttemptDetail(id, attemptId, ownerId);
  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }

  return NextResponse.json({ attempt });
}
