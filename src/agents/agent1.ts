import { GraphState } from "../graphState";
import { parseFileTool } from "../tools/parseFileTool";

// Agent 1 – File parsing specialist (tool only, no LLM yet)
export const agent1Node = async (state: typeof GraphState.State) => {
  const parsed = await parseFileTool.invoke({
    fileContent: state.fileContent ?? "",
  });

  return {
    parsedResult: parsed,
    agent1Result: `Agent 1 parsed the file → ${parsed}`,
    currentStep: "agent1",
  };
};