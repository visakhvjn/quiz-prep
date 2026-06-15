import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { Runnable } from "@langchain/core/runnables";
import type { InteropZodType } from "@langchain/core/utils/types";
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
}

/** Single-call structured agent (fits Vercel Hobby 60s limit). */
export function createStructuredAgent<T extends Record<string, unknown>>({
  name,
  systemPrompt,
  responseFormat,
}: CreateStructuredAgentOptions<T>) {
  const existing = agentRegistry.get(name);
  if (existing) {
    return existing.runnable;
  }

  const runnable = createChatModel().withStructuredOutput(responseFormat, { name });
  agentRegistry.set(name, { systemPrompt, runnable });
  return runnable;
}

export async function invokeStructuredAgent<T extends Record<string, unknown>>(
  agentName: string,
  userContent: string,
): Promise<T> {
  const entry = agentRegistry.get(agentName);
  if (!entry) {
    throw new Error(`Agent "${agentName}" is not registered`);
  }

  return entry.runnable.invoke([
    new SystemMessage(entry.systemPrompt),
    new HumanMessage(userContent),
  ]) as Promise<T>;
}
