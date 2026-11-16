import { StateGraph, START, END, MemorySaver, interrupt } from "@langchain/langgraph";
import { GraphState } from "./graphState";
import { agent1Node } from "./agents/agent1";
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

// Build the graph: START → agent1 → END
const graph = new StateGraph(GraphState)
  .addNode("agent1", agent1Node)
  .addNode("approval1", approval1Node)
  .addEdge(START, "agent1")
  .addEdge("agent1", "approval1")
  .addEdge("approval1", END);

const checkpointer = new MemorySaver();

export const orchestrator = graph.compile({ 
    checkpointer,
    interruptBefore: ["approval1"]  
});