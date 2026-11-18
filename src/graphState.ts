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

    // From Agent 1 (job description)
  jdTitle: Annotation<string>,
  jdSkills: Annotation<string[]>,

  // From Agent 2 (RAG search + quality metric)
  ragSource: Annotation<string>,        // title of the best-matching resume
  ragContext: Annotation<string>,       // resume text returned by Azure AI Search
  ragScore: Annotation<number>,         // BM25 score of the top result
  matchedSkills: Annotation<string[]>,
  missingSkills: Annotation<string[]>,
  coveragePercent: Annotation<number>,
  
  // Human-in-the-loop control
  currentStep: Annotation<string>,          // "agent1" | "agent2" | "agent3" | "finished"
  humanDecision: Annotation<string>,        // "approved" | "rejected" | ""
});