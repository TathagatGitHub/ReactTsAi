import { useState } from "react"; 
import { orchestrator } from "../orchestrator";
import { searchResume } from "../tools/resumeSearch";
import { computeCoverage } from "../tools/skillCoverage";
import { useNavigate } from "react-router";
function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [threadId, setThreadId] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  const handleStart = async () => {
    if (!prompt.trim()) {
      alert("Please type something first");
      return;
    }
      /*
      alert("You have entered: " +  prompt);
      */
    try {
      const newThreadId = crypto.randomUUID();
      setThreadId(newThreadId);
       const finalState = await orchestrator.invoke(
      {
        userPrompt: prompt,
        fileContent: "Invoice #1001 from Acme Corp\nAmount: $500\nDue: Dec 1",
      },
  { configurable: { thread_id: newThreadId } }
);
        
        console.log("Final state:", finalState);
  /*
        if ("__interrupt__" in finalState) {
          setResult(finalState.agent1Result + "  ⏸ Paused, waiting for your approval");
          return;
        }
        */
        const snapshot = await orchestrator.getState({
          configurable: { thread_id: newThreadId },
        });

        if (snapshot.next.includes("approval1")) {
          setResult(finalState.agent1Result + "  ⏸ Paused, waiting for your approval");
          setIsPaused(true);
          return;
        }
        setResult(finalState.agent1Result);
      } catch (error) {
        console.error(error);
        setResult("ERROR: " + String(error));
      }
  };

  const handleDecision = async (decision: "approved" | "rejected") => {
    const config = { configurable: { thread_id: threadId } };

    // 1. Write the human's decision into the saved state
    await orchestrator.updateState(config, { humanDecision: decision });

    // 2. Resume the graph from where it paused
    const resumedState = await orchestrator.invoke(null, config);
    console.log("Resumed state:", resumedState);

    // 3. Did it pause again (at approval2)?
    const snapshot = await orchestrator.getState(config);
    if (snapshot.next.includes("approval2")) {
      //setResult(resumedState.agent2Result + "  ⏸ Paused, waiting for your approval");
      //setIsPaused(true);
      navigate(`/agent2/${threadId}`);
      return;
    }
    setIsPaused(false);
    setResult(`Decision: ${decision} → next step: ${resumedState.currentStep}`);
};

const handleTestRag = async () => {
  // Temporary hard-coded JD skills (Agent 1 will supply these later)
  const jdSkills = ["Azure", "React", "TypeScript", "LangGraph", ".NET", "C#", "Kubernetes"];
 /* try {
    const hits = await searchResume("Azure React TypeScript LangGraph .NET");
    console.log("Hits:", hits);
    setResult(
      hits.length === 0
        ? "No results found"
        : hits
            .map((h) => `${h.fileName} | score ${h.score.toFixed(2)} | ${h.content.length} chars`)
            .join("  ;  ")
    );
  }*/ 
 try {
    const hits = await searchResume(jdSkills.join(" "));
    if (hits.length === 0) {
      setResult("No results found");
      return;
    }
    const top = hits[0]; // best-ranked resume = our RAG context
    const coverage = computeCoverage(jdSkills, top.content);
    console.log("Coverage:", coverage);

    setResult(
      `${top.fileName} | BM25 ${top.score.toFixed(2)} | ` +
      `Coverage ${coverage.matched.length}/${jdSkills.length} = ${coverage.percent}% ` +
      `${coverage.isGood ? "✅ Good context" : "❌ Weak context"} | ` +
      `Missing: ${coverage.missing.join(", ") || "none"}`
    );
  }
    catch (error) {
    console.error(error);
    setResult("ERROR: " + String(error));
  }
};
  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Home Page</h1>
      <p>Enter your prompt to start the multi-agent flow</p>
      <input type="text" placeholder="Enter something" value={prompt} onChange={(e) => setPrompt(e.target.value)} 
      style={{ width: "100%", padding: "10px", marginBottom: "12px" }}></input>
      {/* <button onClick={() => console.log(prompt)}>Submit</button> */}
      <button onClick={handleStart}
      style={{ padding: "10px 20px" }}>Submit</button>
      <button onClick={handleTestRag} style={{ padding: "10px 20px", marginLeft: "10px" }}>
  Test RAG
</button>

      {/* Temporary: just to see the value */}
      <p>You typed: {prompt}</p>
      {result && <p><strong>Result:</strong> {result}</p>}
      {isPaused && (
        <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
          <button onClick={() => handleDecision("approved")}>✅ Approve</button>
          <button onClick={() => handleDecision("rejected")}>❌ Reject</button>
        </div>
       )}
      {threadId && <p style={{ fontSize: "12px", color: "#888" }}>Thread: {threadId}</p>}
    </div>
  );
}
export default Home;