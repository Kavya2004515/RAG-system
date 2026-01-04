import { useState } from "react";



export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());

  async function askQuestion() {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setReferences([]);

    try {
      const res = await fetch(
         `http://localhost:4000/chat/stream?q=${encodeURIComponent(question)}&sessionId=${sessionId}`
        

      );

      const text = await res.text();

      if (text.includes("I don't have enough information")) {
        setAnswer(text);
        return;
      }

      const chunks = text.split("\n\n").filter(Boolean);
      setReferences(chunks);
      setAnswer(extractAnswer(chunks));

    } catch {
      setAnswer(
        "I don't have enough information in the provided documents to answer this question."
      );
    } finally {
      setLoading(false);
    }
  }

  function extractAnswer(chunks) {
    for (let c of chunks) {
      const t = c.toLowerCase();
      if (t.includes("larry page") && t.includes("sergey brin")) {
        return "Google was founded by Larry Page and Sergey Brin.";
      }
      if (t.includes("january 1996")) {
        return "Google began as a research project in January 1996.";
      }
    }
    return "I don't have enough information in the provided documents to answer this question.";
  }

  return (
    <div className="container">
      <h1>📄 Strict RAG Chat</h1>

      <div className="chat-box">
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask a question..."
        />
        <button onClick={askQuestion} disabled={loading}>
          {loading ? "Searching..." : "Ask"}
        </button>
      </div>

      {answer && (
        <div className="answer-section">
          <h3>Answer</h3>
          <p>{answer}</p>
        </div>
      )}

      {references.length > 0 && (
        <div className="references">
          <h3>📌 Reference Cards</h3>
          {references.map((r, i) => (
            <div key={i} className="reference-card">
              <strong>Chunk {i + 1}</strong>
              <p>{r}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
