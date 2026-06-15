import { NextResponse } from "next/server";
import { getOwnerIdFromRequest } from "@/lib/quiz-db";
import { getAccountInfo } from "@/lib/owner-db";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const TEXT_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "application/json",
]);

function extensionOf(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.at(-1)?.toLowerCase() : "";
}

async function extractPdfText(buffer: Buffer) {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text?.trim() ?? "";
  } finally {
    await parser.destroy();
  }
}

export async function POST(request: Request) {
  const ownerId = getOwnerIdFromRequest(request);

  if (!ownerId) {
    return NextResponse.json({ error: "Owner id required" }, { status: 401 });
  }

  const account = await getAccountInfo(ownerId);
  if (!account.limits.documentUpload) {
    return NextResponse.json(
      { error: "Document upload is available on the Premium plan" },
      { status: 403 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File must be 5 MB or smaller" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = extensionOf(file.name);
  let text = "";

  try {
    if (file.type === "application/pdf" || extension === "pdf") {
      text = await extractPdfText(buffer);
    } else if (
      TEXT_TYPES.has(file.type) ||
      extension === "txt" ||
      extension === "md"
    ) {
      text = buffer.toString("utf-8").trim();
    } else {
      return NextResponse.json(
        {
          error: "Unsupported file type. Upload PDF, TXT, or Markdown.",
        },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Could not read the uploaded document" },
      { status: 400 },
    );
  }

  if (!text) {
    return NextResponse.json(
      { error: "No readable text found in the document" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    fileName: file.name,
    text: text.slice(0, 12000),
  });
}
