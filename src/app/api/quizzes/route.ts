import { NextResponse } from "next/server";
import { getOwnerIdFromRequest, listOwnerQuizzes, listPublicQuizzes } from "@/lib/quiz-db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ownerId = getOwnerIdFromRequest(request);
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  if (scope === "public") {
    const quizzes = await listPublicQuizzes();
    return NextResponse.json({ quizzes });
  }

  if (!ownerId) {
    return NextResponse.json({ quizzes: [] });
  }

  const quizzes = await listOwnerQuizzes(ownerId);
  return NextResponse.json({ quizzes });
}
