import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { GraphState } from "./graphState";
import { agent1Node } from "./agents/agent1";
import { agent2Node } from "./agents/agent2";
// Node 1: placeholder for Agent 1 (no AI yet)
/*
const agent1Node = async (state: typeof GraphState.State) => {
  return {
    agent1Result: `Agent 1 received: ${state.userPrompt}`,
    currentStep: "agent1",
  };
};
*/
// Node 2: Human approval for Agent 1 (pauses the graph)
const approval1Node = async (state: typeof GraphState.State) => {
  /*
    const decision = interrupt({
    question: "Do you approve Agent 1's result?",
    agent1Result: state.agent1Result,
  });

  return { humanDecision: decision as string };
  */
 return {
    currentStep: state.humanDecision === "approved" ? "agent2" : "stopped",
  };
};

// Approval 2: runs AFTER the human reviews Agent 2's RAG result
const approval2Node = async (state: typeof GraphState.State) => {
  return {
    currentStep: state.humanDecision === "approved" ? "agent3" : "stopped",
  };
};

// Build the graph: START → agent1 → END
// Build the graph:
// START → agent1 → ⏸ approval1 → (approved) agent2 → ⏸ approval2 → END
//                               → (rejected) END
const graph = new StateGraph(GraphState)
  .addNode("agent1", agent1Node)
  .addNode("approval1", approval1Node)
  .addNode("agent2", agent2Node)
  .addNode("approval2", approval2Node)
  .addEdge(START, "agent1")
  .addEdge("agent1", "approval1")
  .addConditionalEdges(
    "approval1",
    (state) => (state.currentStep === "agent2" ? "agent2" : END),
    ["agent2", END]
  )
  .addEdge("agent2", "approval2")
  .addEdge("approval2", END);

const checkpointer = new MemorySaver();

export const orchestrator = graph.compile({
  checkpointer,
  interruptBefore: ["approval1", "approval2"],
});