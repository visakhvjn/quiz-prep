import { NextResponse } from "next/server";
import { getOwnerIdFromRequest } from "@/lib/quiz-db";
import { getAccountInfo } from "@/lib/owner-db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ownerId = getOwnerIdFromRequest(request);

  if (!ownerId) {
    return NextResponse.json({ error: "Owner id required" }, { status: 401 });
  }

  const account = await getAccountInfo(ownerId);
  return NextResponse.json(account);
}
