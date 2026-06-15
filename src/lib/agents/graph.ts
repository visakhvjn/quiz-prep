import { END, START, StateGraph } from "@langchain/langgraph";
import { QuizGraphState } from "@/lib/agents/state";
import { sanitizeTopicsNode } from "@/lib/agents/nodes/sanitize-topics";
import { generateQuestionsNode } from "@/lib/agents/nodes/generate-questions";
import { addOptionsNode } from "@/lib/agents/nodes/add-options";
import { checkDifficultyNode } from "@/lib/agents/nodes/check-difficulty";
import { checkUniquenessNode } from "@/lib/agents/nodes/check-uniqueness";
import type { QuizGraphStateType } from "@/lib/agents/state";

const MAX_RETRIES = 2;

function routeAfterDifficulty(state: QuizGraphStateType) {
  if (state.difficultyPassed || state.retryCount >= MAX_RETRIES) {
    return "checkUniqueness";
  }
  return "generateQuestions";
}

function routeAfterUniqueness(state: QuizGraphStateType) {
  if (state.uniquenessPassed || state.retryCount >= MAX_RETRIES) {
    return END;
  }
  return "generateQuestions";
}

export function createQuizGraph() {
  const graph = new StateGraph(QuizGraphState)
    .addNode("sanitizeTopics", sanitizeTopicsNode)
    .addNode("generateQuestions", generateQuestionsNode)
    .addNode("addOptions", addOptionsNode)
    .addNode("checkDifficulty", checkDifficultyNode)
    .addNode("checkUniqueness", checkUniquenessNode)
    .addEdge(START, "sanitizeTopics")
    .addEdge("sanitizeTopics", "generateQuestions")
    .addEdge("generateQuestions", "addOptions")
    .addEdge("addOptions", "checkDifficulty")
    .addConditionalEdges("checkDifficulty", routeAfterDifficulty, [
      "checkUniqueness",
      "generateQuestions",
    ])
    .addConditionalEdges("checkUniqueness", routeAfterUniqueness, [
      END,
      "generateQuestions",
    ]);

  return graph.compile();
}

export const quizGraph = createQuizGraph();

const NODE_TO_AGENT = {
  sanitizeTopics: "sanitize",
  generateQuestions: "generate",
  addOptions: "options",
  checkDifficulty: "difficulty",
  checkUniqueness: "uniqueness",
} as const;

export function getAgentNameForNode(nodeName: string) {
  return NODE_TO_AGENT[nodeName as keyof typeof NODE_TO_AGENT];
}
