import { tool } from "@langchain/core/tools";
import { z } from "zod";

// 1. Define the Tool
export const getCurrentTime = tool(
  async ({ timezone }) => {
    try {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };

      const formatted = now.toLocaleString("en-US", options);
      return `The current time in ${timezone} is: ${formatted}`;
    } catch (error) {
      return `Sorry, I could not get the time for timezone: ${timezone}`;
    }
  },
  {
    name: "get_current_time",
    description: "Get the current date and time for a given timezone (e.g. Asia/Kolkata for Delhi, India)",
    schema: z.object({
      timezone: z
        .string()
        .describe("IANA timezone name, for example: Asia/Kolkata, America/New_York, Europe/London"),
    }),
  }
);

import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// 2. Create the model (using Groq)
const model = new ChatOpenAI({
  // model: "openai/gpt-oss-120b",          // Free model on Groq
  //model: "qwen/qwen3.8-27b",
  model: "openai/gpt-oss-120b",
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  configuration: {
    baseURL: "https://api.groq.com/openai/v1",
  },
  temperature: 0,
});

// 3. Create the Agent
export const agent = createReactAgent({
  llm: model,
  tools: [getCurrentTime],
});