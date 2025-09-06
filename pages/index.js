import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";   // ✅ import
import { TrendingUp, BarChart3, Search, Sparkles, Target, DollarSign } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSubmit = async () => {
    if (!query) return;
    setLoading(true);
    setIsTyping(true);
    setResponse("");

    try {
      const res = await fetch("/api/stockTips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      // ✅ Fallback if backend didn’t send content
      const text = data.content || "⚠️ No response received from AI.";
      let index = 0;
      setResponse("");

      const typeWriter = () => {
        if (index < text.length) {
          setResponse(text.slice(0, index + 1));
          index++;
          setTimeout(typeWriter, 15);
        } else {
          setIsTyping(false);
        }
      };

      setTimeout(typeWriter, 500);
    } catch (err) {
      console.error("Frontend error:", err);
      setResponse("❌ Error: Could not fetch stock tips. Try again.");
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [response]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* ... header + search bar ... */}

      {/* Response section */}
      {response && (
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-white font-semibold">Market Analysis</h3>
            {isTyping && (
              <div className="flex gap-1 ml-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce animation-delay-200"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce animation-delay-400"></div>
              </div>
            )}
          </div>

          {/* ✅ Render markdown properly */}
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6 max-h-96 overflow-y-auto custom-scrollbar text-gray-300 leading-relaxed">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
