import { useState, useRef, useEffect } from "react";
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

      // ✅ FIXED: use data.content instead of data.markdown
      const text = data.content || "No response received";
      let index = 0;
      setResponse("");

      const typeWriter = () => {
        if (index < text.length) {
          setResponse(text.slice(0, index + 1));
          index++;
          setTimeout(typeWriter, 20);
        } else {
          setIsTyping(false);
        }
      };

      setTimeout(typeWriter, 500);
    } catch (err) {
      console.error(err);
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

  const quickQuestions = [
    "What are the top performing sectors today?",
    "Should I invest in IT stocks right now?",
    "Tell me about upcoming IPOs",
    "Market outlook for next quarter",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* ... (rest of your UI remains unchanged) ... */}
    </div>
  );
}
