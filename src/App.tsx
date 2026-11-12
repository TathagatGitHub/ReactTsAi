import { useState } from "react";
import OpenAI from "openai"; 
import "./App.css";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const client = new OpenAI({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true, // Only for learning. Never do this in production.
})

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await client.chat.completions.create({
       // model: "llama-3.3-70b-versatile", // Fast and good free model
        model: "qwen/qwen3.8-27b",
        messages: newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
      });

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.choices[0]?.message?.content || "No response",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, something went wrong. Check your API key.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h1>AI Chat (React + TypeScript)</h1>

      <div className="messages">
        {messages.length === 0 && (
          <p className="empty">Send a message to start chatting...</p>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <strong>AI:</strong>
            <p>Thinking...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          autoFocus
        />
        <button type="submit" disabled={isLoading}>{isLoading ? "..." : "Send"}</button>
      </form>
    </div>
  );
}

export default App;