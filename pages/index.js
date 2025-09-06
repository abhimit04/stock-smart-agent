import React, { useState, useRef, useEffect } from 'react';
import { Send, TrendingUp, BarChart3, AlertCircle, Loader, Settings, Database } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const IndianStockAdvisor = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Namaste! 🇮🇳 Welcome to your Indian Stock Market Advisor. I can provide stock recommendations, news, IPO updates, and market analysis.\n\nPowered by: Perplexity Pro • Gemini 1.5\n\nWhat would you like to know about the Indian stock market today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAPI, setSelectedAPI] = useState('perplexity');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  const PERPLEXITY_API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;
  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(scrollToBottom, [messages]);

  const quickQuestions = [
    'Top 5 stocks to buy today',
    'Latest IPO launches',
    'Nifty 50 analysis',
    'Best mid-cap stocks',
    'Market news today',
    'Banking sector outlook'
  ];

  // MCP API call to fetch stock tips/news
  const getMCPStockTips = async (userMessage) => {
    try {
      const response = await fetch('/api/stockTips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage })
      });
      const data = await response.json();
      return data?.advice || 'No stock tips found.';
    } catch (error) {
      console.error('MCP API Error:', error);
      return 'Unable to fetch stock tips. Try again later.';
    }
  };

  const getStockAdvice = async (userMessage) => {
    setIsLoading(true);
    let advice;
    try {
      switch (selectedAPI) {
        case 'perplexity':
        case 'gemini':
        default:
          advice = await getMCPStockTips(userMessage); // MCP combines Perplexity + SerpAPI
          break;
      }
    } catch (error) {
      console.error('Error getting stock advice:', error);
      advice = 'I encountered an issue fetching market data. Please try again.';
    } finally {
      setIsLoading(false);
    }
    return advice;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', content: inputMessage.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    const advice = await getStockAdvice(userMessage.content);

    const assistantMessage = { id: Date.now() + 1, type: 'assistant', content: advice, timestamp: new Date() };
    setMessages(prev => [...prev, assistantMessage]);
  };

  const handleQuickQuestion = (question) => setInputMessage(question);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isApiReady = () => !!PERPLEXITY_API_KEY || !!GEMINI_API_KEY;

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-orange-500 to-green-500 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Indian Stock Market Advisor</h1>
              <p className="text-sm text-gray-600">Real-time insights • NSE & BSE • Powered by MCP</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 bg-gray-50 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">AI Provider Selection</h3>
            <div className="text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Database className="w-3 h-3" />
                <span>API Status: </span>
                <span className={`font-medium ${isApiReady() ? 'text-green-600' : 'text-red-600'}`}>
                  {isApiReady() ? 'Ready' : 'API Key Not Found'}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>• MCP: Combines Perplexity Pro (analysis) + SerpAPI (news search)</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      <div className="p-4 bg-white border-b">
        <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((q, idx) => (
            <button key={idx} onClick={() => handleQuickQuestion(q)} className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">{q}</button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl p-4 rounded-lg ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-white shadow-md border'}`}>
              {msg.type === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">MCP Market Advisor</span>
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              <div className={`text-xs mt-2 ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white shadow-md border p-4 rounded-lg max-w-3xl">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">MCP Market Advisor</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Fetching stock insights...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about stocks, IPOs, market news, or investment advice..."
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              disabled={isLoading || !isApiReady()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || !isApiReady()}
              className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
          <AlertCircle className="w-3 h-3 mr-1" />
          <span>Investment advice is educational only. Consult a financial advisor before acting.</span>
        </div>
      </div>
    </div>
  );
};

export default IndianStockAdvisor;
const getStockAdvice = async (userMessage) => {
  setIsLoading(true);
  try {
    const res = await fetch("/api/stockTips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: userMessage }),
    });

    const data = await res.json();
    return data.content; // already markdown formatted
  } catch (error) {
    console.error("Stock Advice Error:", error);
    return "❌ Unable to fetch stock insights right now.";
  } finally {
    setIsLoading(false);
  }
};
