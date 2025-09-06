import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSubmit = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stockTips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResponse(data.markdown);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [response]);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Indian Stock Market Advisor</h1>
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about stocks, IPOs, market trends..."
          className="w-full p-2 border rounded"
        />
        <button onClick={handleSubmit} disabled={loading} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
          {loading ? "Analyzing..." : "Get Advice"}
        </button>
      </div>
      <div className="bg-gray-50 p-4 rounded">
        <ReactMarkdown>{response}</ReactMarkdown>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
