import { Annotation } from "@langchain/langgraph";

export const GraphState = Annotation.Root({
  // Original user request
  userPrompt: Annotation<string>,

  // File related (Agent 1)
  fileContent: Annotation<string>,
  parsedResult: Annotation<string>,

  // Results from each agent
  agent1Result: Annotation<string>,
  agent2Result: Annotation<string>,
  agent3Result: Annotation<string>,

  // Human-in-the-loop control
  currentStep: Annotation<string>,          // "agent1" | "agent2" | "agent3" | "finished"
  humanDecision: Annotation<string>,        // "approved" | "rejected" | ""
});