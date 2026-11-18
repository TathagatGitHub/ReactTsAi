import { GraphState } from "../graphState";
import { searchResume } from "../tools/resumeSearch";
import { computeCoverage, THRESHOLD } from "../tools/skillCoverage";
import { checkMissingSkills } from "../tools/llmSkillCheck";

// Temporary defaults until Agent 1 extracts these from the JD PDF
const DEFAULT_TITLE = "Director Software Engineering";
const DEFAULT_SKILLS = ["Azure", "React", "TypeScript", "LangGraph", ".NET", "C#", "Kubernetes"];

// Agent 2 – RAG specialist: retrieve resume context + measure quality
export const agent2Node = async (state: typeof GraphState.State) => {
  const title = state.jdTitle || DEFAULT_TITLE;
  const skills = state.jdSkills?.length ? state.jdSkills : DEFAULT_SKILLS;

  // 1. Build the search query
  const query = `${title} ${skills.join(" ")}`;

  // 2. Retrieve (the "R" in RAG)
 const hits = await searchResume(query);

  if (hits.length === 0) {
    return {
      jdTitle: title,
      jdSkills: skills,
      agent2Result: "No matching resume found in the index.",
      coveragePercent: 0,
      currentStep: "agent2",
    };
  }

  const top = hits[0];

  // 3. Measure context quality (code check only for now)
  //const coverage = computeCoverage(skills, top.content);

  const coverage = computeCoverage(skills, top.content);
  
  const matched = [...coverage.matched];
  let missing = [...coverage.missing];
  const evidenceNotes: string[] = [];


  // 3. LLM check — only for skills code could not find
  if (missing.length > 0) {
    try {
      const judged = await checkMissingSkills(missing, top.content);
      console.log("LLM judge output:", judged);

      const resumeText = top.content.toLowerCase();

      for (const r of judged) {
        // 4. Verify the evidence really exists in the resume (anti-hallucination)
        const evidenceIsReal =
          r.covered && r.evidence.trim() !== "" && resumeText.includes(r.evidence.toLowerCase());

        if (evidenceIsReal) {
          matched.push(r.skill);
          missing = missing.filter((s) => s !== r.skill);
          evidenceNotes.push(`${r.skill} ≈ "${r.evidence}" (LLM)`);
        } else if (r.covered) {
          evidenceNotes.push(`${r.skill}: LLM claimed covered but evidence not found — rejected`);
        }
      }
    } catch (error) {
      // If the LLM fails (e.g. 429 rate limit), keep the code-only result
      console.error("LLM judge failed, using code result only:", error);
      evidenceNotes.push("LLM check skipped (error)");
    }
  }

  // 5. Final metric
  const percent = Math.round((matched.length / skills.length) * 100);
  const isGood = percent >= THRESHOLD;

return {
    jdTitle: title,
    jdSkills: skills,
    ragSource: top.fileName,
    ragContext: top.content,
    ragScore: top.score,
    matchedSkills: matched,
    missingSkills: missing,
    coveragePercent: percent,
    agent2Result:
      `${top.fileName} | BM25 ${top.score.toFixed(2)} | ` +
      `Coverage ${percent}% ${isGood ? "✅ Good" : "❌ Weak"} | ` +
      `Missing: ${missing.join(", ") || "none"}` +
      (evidenceNotes.length ? ` | ${evidenceNotes.join(" ; ")}` : ""),
    currentStep: "agent2",
  };
};