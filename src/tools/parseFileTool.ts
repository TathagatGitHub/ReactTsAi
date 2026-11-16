import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const parseFileTool = tool(
  async ({ fileContent }) => {
    const lines = fileContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      return "The file is empty.";
    }

    return `Lines: ${lines.length} | First line: ${lines[0]}`;
  },
  {
    name: "parse_file",
    description: "Parse the text of an uploaded file and return the line count and the first line.",
    schema: z.object({
      fileContent: z.string().describe("The full text content of the uploaded file"),
    }),
  }
);