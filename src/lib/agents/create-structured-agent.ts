import { HumanMessage } from "@langchain/core/messages";
import { createAgent } from "langchain";
import type { InteropZodType } from "@langchain/core/utils/types";
import { createChatModel } from "@/lib/llm";

type StructuredAgent = ReturnType<typeof createAgent>;

const agentCache = new Map<string, StructuredAgent>();

interface CreateStructuredAgentOptions<T extends Record<string, unknown>> {
  name: string;
  systemPrompt: string;
  responseFormat: InteropZodType<T>;
}

export function createStructuredAgent<T extends Record<string, unknown>>({
  name,
  systemPrompt,
  responseFormat,
}: CreateStructuredAgentOptions<T>) {
  const cached = agentCache.get(name);
  if (cached) {
    return cached;
  }

  const agent = createAgent({
    model: createChatModel(),
    tools: [],
    name,
    systemPrompt,
    responseFormat,
  });

  agentCache.set(name, agent);
  return agent;
}

export async function invokeStructuredAgent<T extends Record<string, unknown>>(
  agent: StructuredAgent,
  userContent: string,
): Promise<T> {
  const result = await agent.invoke({
    messages: [new HumanMessage(userContent)],
  });

  if (!result.structuredResponse) {
    throw new Error("Agent did not return structured output");
  }

  return result.structuredResponse as T;
}
