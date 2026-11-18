import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { orchestrator } from "../orchestrator";
import { GraphState } from "../graphState";

type State = typeof GraphState.State;

function Agent2Page() {
  const { threadId } = useParams();
  const [data, setData] = useState<State | null>(null);
  const [error, setError] = useState("");

  // Load the saved graph state once when the page opens
  useEffect(() => {
    if (!threadId) return;

    const load = async () => {
      const snapshot = await orchestrator.getState({
        configurable: { thread_id: threadId },
      });

      if (!snapshot.values || Object.keys(snapshot.values).length === 0) {
        setError("No run found for this thread. (A browser refresh clears paused runs.)");
        return;
      }
      setData(snapshot.values as State);
    };

    load();
  }, [threadId]);

  if (error) return <p style={{ padding: "40px", color: "crimson" }}>{error}</p>;
  if (!data) return <p style={{ padding: "40px" }}>Loading…</p>;

  return (
    <div style={{ padding: "40px", maxWidth: "700px", margin: "0 auto" }}>
      <h1>Agent 2 – Resume RAG Check</h1>

      <table cellPadding={6}>
        <tbody>
          <tr><td><strong>JD title</strong></td><td>{data.jdTitle}</td></tr>
          <tr><td><strong>Resume found</strong></td><td>{data.ragSource}</td></tr>
          <tr><td><strong>BM25 score</strong></td><td>{data.ragScore?.toFixed(2)}</td></tr>
          <tr><td><strong>Coverage</strong></td><td>{data.coveragePercent}% {data.coveragePercent >= 70 ? "✅ Good" : "❌ Weak"}</td></tr>
          <tr><td><strong>Matched</strong></td><td>{data.matchedSkills?.join(", ")}</td></tr>
          <tr><td><strong>Missing</strong></td><td>{data.missingSkills?.join(", ") || "none"}</td></tr>
        </tbody>
      </table>

      <h3>Summary</h3>
      <p>{data.agent2Result}</p>

      <h3>Context preview (first 500 characters)</h3>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: "12px" }}>
        {data.ragContext?.slice(0, 500)}
      </pre>

      <p style={{ fontSize: "12px", color: "#888" }}>Thread: {threadId}</p>
    </div>
  );
}

export default Agent2Page;