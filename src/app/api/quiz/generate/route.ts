import { v4 as uuidv4 } from "uuid";
import { getAgentNameForNode, quizGraph } from "@/lib/agents/graph";
import type { Difficulty, GenerateQuizRequest, Quiz, QuizStreamEvent } from "@/types/quiz";

export const runtime = "nodejs";
export const maxDuration = 60;

function encodeSse(event: QuizStreamEvent) {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: Request) {
  let body: GenerateQuizRequest;

  try {
    body = (await request.json()) as GenerateQuizRequest;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const topics = body.topics?.trim();
  if (!topics) {
    return Response.json({ error: "Topics are required" }, { status: 400 });
  }

  const difficulty: Difficulty = body.difficulty ?? "medium";
  const questionCount = Math.min(Math.max(body.questionCount ?? 5, 3), 8);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (event: QuizStreamEvent) => {
        controller.enqueue(encoder.encode(encodeSse(event)));
      };

      let heartbeat: ReturnType<typeof setInterval> | undefined;

      try {
        const initialState = {
          rawTopics: topics,
          subtopics: [] as string[],
          draftQuestions: [],
          questions: [],
          targetDifficulty: difficulty,
          questionCount,
          feedback: [] as string[],
          retryCount: 0,
        };

        let finalState = initialState;
        const seenAgents = new Set<string>();

        heartbeat = setInterval(() => {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        }, 10_000);

        for await (const update of await quizGraph.stream(initialState, {
          streamMode: "updates",
        })) {
          const [nodeName, nodeUpdate] = Object.entries(update)[0] ?? [];
          if (!nodeName) continue;

          const agent = getAgentNameForNode(nodeName);
          if (agent && !seenAgents.has(agent)) {
            send({ type: "agent_start", agent });
            seenAgents.add(agent);
          }

          finalState = { ...finalState, ...(nodeUpdate as object) };

          if (agent) {
            send({
              type: "agent_done",
              agent,
              data: summarizeAgentData(agent, finalState),
            });
          }
        }

        if (finalState.questions.length === 0) {
          send({ type: "error", message: "Failed to generate quiz questions." });
          return;
        }

        const quiz: Quiz = {
          id: uuidv4(),
          topics,
          difficulty,
          questions: finalState.questions,
          createdAt: new Date().toISOString(),
        };

        send({ type: "complete", quiz });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Quiz generation failed";
        send({ type: "error", message });
      } finally {
        if (heartbeat) clearInterval(heartbeat);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

function summarizeAgentData(
  agent: string,
  state: {
    subtopics: string[];
    draftQuestions: unknown[];
    questions: unknown[];
  },
) {
  switch (agent) {
    case "prepare":
      return {
        subtopics: state.subtopics,
        count: state.draftQuestions.length,
      };
    case "options":
      return { count: state.questions.length };
    default:
      return {};
  }
}
