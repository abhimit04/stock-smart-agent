import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { TrendingUp, BarChart3, Search, Sparkles, Target, DollarSign, Loader } from "lucide-react";
import remarkGfm from "remark-gfm";

// Custom component to handle the typing effect for markdown
const TypewriterEffect = ({ markdownContent }) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!markdownContent) return;

    setIsTyping(true);
    let index = 0;
    const intervalId = setInterval(() => {
      if (index < markdownContent.length) {
        setDisplayedContent((prev) => prev + markdownContent.charAt(index));
        index++;
      } else {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, 15); // Adjust typing speed here

    return () => clearInterval(intervalId);
  }, [markdownContent]);

  return (
    <>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {displayedContent}
      </ReactMarkdown>
      {isTyping && (
        <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1"></span>
      )}
    </>
  );
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSubmit = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/stockTips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.markdown);

    } catch (err) {
      console.error(err);
      setResponse("Sorry, there was an error processing your request. Please try again.");
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
    "Market outlook for next quarter"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>



      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-2xl mb-4 shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">
            Stock Market Advisor
          </h1>
          <p className="text-gray-400 text-lg">AI-powered insights for Indian equity markets</p>
        </div>

        {/* Main content card */}
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8">
          {/* Search section */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about stocks, IPOs, market trends, or investment advice..."
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-300"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !query.trim()}
              className={`w-full mt-4 px-6 py-4 rounded-2xl font-semibold text-white transition-all duration-300 transform ${
                loading || !query.trim()
                  ? "bg-gray-600/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 hover:scale-[1.02] shadow-lg hover:shadow-emerald-500/25"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing Market Data...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Get AI Insights
                </div>
              )}
            </button>
          </div>

          {/* Quick questions */}
          {!response && (
            <div className="mb-6">
              <h3 className="text-gray-300 text-sm font-medium mb-3">Quick Questions:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(question)}
                    className="text-left p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 text-gray-300 hover:text-white text-sm transition-all duration-200 hover:scale-[1.01]"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Response section */}
          {response && (
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-white font-semibold">Market Analysis</h3>
                {loading && (
                  <div className="flex gap-1 ml-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce animation-delay-200"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce animation-delay-400"></div>
                  </div>
                )}
              </div>

              <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6 max-h-96 overflow-y-auto custom-scrollbar">
                <div className="text-gray-300 leading-relaxed">
                  <TypewriterEffect markdownContent={response} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Features showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[
            { icon: Target, title: "Precise Analysis", desc: "AI-driven market insights" },
            { icon: DollarSign, title: "Smart Investing", desc: "Optimized portfolio advice" },
            { icon: BarChart3, title: "Real-time Data", desc: "Live market tracking" }
          ].map(({ icon: Icon, title, desc }, index) => (
            <div
              key={index}
              className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4 text-center hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-xl mb-3">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-1">{title}</h3>
              <p className="text-gray-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #3b82f6);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #059669, #2563eb);
        }
      `}</style>
    </div>
  );
}