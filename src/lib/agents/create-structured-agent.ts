import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { Runnable } from "@langchain/core/runnables";
import type { InteropZodType } from "@langchain/core/utils/types";
import type { PlanTier } from "@/lib/plans";
import { createChatModel } from "@/lib/llm";

interface AgentEntry {
  systemPrompt: string;
  runnable: Runnable;
}

const agentRegistry = new Map<string, AgentEntry>();

interface CreateStructuredAgentOptions<T extends Record<string, unknown>> {
  name: string;
  systemPrompt: string;
  responseFormat: InteropZodType<T>;
  plan?: PlanTier;
}

function agentKey(name: string, plan: PlanTier) {
  return `${name}:${plan}`;
}

/** Single-call structured agent (fits Vercel Hobby 60s limit). */
export function createStructuredAgent<T extends Record<string, unknown>>({
  name,
  systemPrompt,
  responseFormat,
  plan = "hobby",
}: CreateStructuredAgentOptions<T>) {
  const key = agentKey(name, plan);
  const existing = agentRegistry.get(key);
  if (existing) {
    return existing.runnable;
  }

  const runnable = createChatModel(plan).withStructuredOutput(responseFormat, {
    name,
  });
  agentRegistry.set(key, { systemPrompt, runnable });
  return runnable;
}

export async function invokeStructuredAgent<T extends Record<string, unknown>>(
  agentName: string,
  userContent: string,
  plan: PlanTier = "hobby",
): Promise<T> {
  const key = agentKey(agentName, plan);
  const entry = agentRegistry.get(key);
  if (!entry) {
    throw new Error(`Agent "${agentName}" is not registered for plan "${plan}"`);
  }

  return entry.runnable.invoke([
    new SystemMessage(entry.systemPrompt),
    new HumanMessage(userContent),
  ]) as Promise<T>;
}
