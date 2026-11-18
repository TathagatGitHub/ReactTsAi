import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

// Small, fast Groq model; low output limit to stay under free-tier limits
const model = new ChatOpenAI({
  model: "openai/gpt-oss-20b",
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  configuration: { baseURL: "https://api.groq.com/openai/v1" },
  temperature: 0,
  maxTokens: 500,
});

// The exact shape we want back from the LLM
const JudgeSchema = z.object({
  results: z.array(
    z.object({
      skill: z.string(),
      covered: z.boolean(),
      evidence: z
        .string()
        .describe("Short exact phrase copied from the resume that proves the skill, or empty if not covered"),
    })
  ),
});

const judge = model.withStructuredOutput(JudgeSchema);

// Keep the prompt small (~2,000 tokens) for the Groq free tier
const MAX_CONTEXT_CHARS = 8000;

export async function checkMissingSkills(missing: string[], context: string) {
  const prompt = `You check whether a resume covers job skills, including synonyms and related tools
(for example "AKS" covers "Kubernetes"). Only mark a skill covered if the resume text clearly supports it.
Do not guess. Evidence must be copied exactly from the resume text.

Skills to check: ${missing.join(", ")}

Resume text:
"""
${context.slice(0, MAX_CONTEXT_CHARS)}
"""`;

  const output = await judge.invoke(prompt);
  return output.results;
}