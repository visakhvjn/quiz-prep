import { ChatOpenAI } from "@langchain/openai";
import type { PlanTier } from "@/lib/plans";

export function createChatModel(plan: PlanTier = "hobby") {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const model =
    plan === "premium"
      ? (process.env.PREMIUM_OPENAI_MODEL ?? "gpt-4o")
      : (process.env.OPENAI_MODEL ?? "gpt-4o-mini");

  return new ChatOpenAI({
    apiKey,
    model,
    temperature: 0.4,
    timeout: 25_000,
    maxTokens: plan === "premium" ? 8192 : 4096,
  });
}
