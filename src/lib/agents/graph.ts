import { END, START, StateGraph } from "@langchain/langgraph";
import { QuizGraphState } from "@/lib/agents/state";
import { planAndGenerateNode } from "@/lib/agents/nodes/plan-and-generate";
import { addOptionsNode } from "@/lib/agents/nodes/add-options";

export function createQuizGraph() {
  const graph = new StateGraph(QuizGraphState)
    .addNode("planAndGenerate", planAndGenerateNode)
    .addNode("addOptions", addOptionsNode)
    .addEdge(START, "planAndGenerate")
    .addEdge("planAndGenerate", "addOptions")
    .addEdge("addOptions", END);

  return graph.compile();
}

export const quizGraph = createQuizGraph();

const NODE_TO_AGENT = {
  planAndGenerate: "prepare",
  addOptions: "options",
} as const;

export function getAgentNameForNode(nodeName: string) {
  return NODE_TO_AGENT[nodeName as keyof typeof NODE_TO_AGENT];
}
