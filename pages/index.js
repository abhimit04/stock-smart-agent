import React, { useState, useRef, useEffect } from 'react';
import { Send, TrendingUp, DollarSign, BarChart3, AlertCircle, Loader } from 'lucide-react';

const IndianStockAdvisor = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Namaste! 🇮🇳 Welcome to your Indian Stock Market Advisor. I can help you with:\n\n📈 Top stock recommendations\n💰 Stock analysis and financials\n🔥 Latest IPO updates\n📰 Market news and trends\n📊 Investment strategies\n\nWhat would you like to know about the Indian stock market today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    'Top 5 stocks to buy today',
    'Latest IPO launches',
    'Nifty 50 analysis',
    'Best mid-cap stocks',
    'Market news today',
    'Banking sector outlook'
  ];

  const getStockAdvice = async (userMessage) => {
    try {
      setIsLoading(true);

      // Create a comprehensive prompt for stock market analysis
      const prompt = `You are an expert Indian stock market advisor. The user is asking: "${userMessage}"

Please provide comprehensive advice following these guidelines:

1. If asking about top stocks or recommendations:
   - Provide 5-7 specific Indian stocks with reasoning
   - Include NSE/BSE symbols
   - Mention current price ranges and key metrics
   - Explain why each stock is recommended
   - Include risk assessment

2. If asking about IPOs:
   - List recent and upcoming IPOs
   - Provide subscription details, price bands
   - Give investment recommendation with rationale

3. If asking about market analysis:
   - Cover Nifty 50, Sensex trends
   - Mention key sectors performing well/poorly
   - Include global factors affecting Indian markets

4. If asking about specific stocks:
   - Provide fundamental analysis
   - Technical outlook
   - Financial metrics (P/E, ROE, debt levels)
   - Future prospects

5. Always include:
   - Risk disclaimers
   - Diversification advice
   - Market timing considerations

Please provide actionable, well-researched advice based on current market conditions. Be specific with stock names, numbers, and rationale.

Response format: Use clear sections with headings, bullet points for key information, and conclude with risk warnings.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [
            { role: "user", content: prompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const advice = data.content[0].text;

      return advice;

    } catch (error) {
      console.error('Error getting stock advice:', error);
      return 'I apologize, but I encountered an issue while fetching market data. Please try again or ask a different question about the Indian stock market.';
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Get AI response
    const advice = await getStockAdvice(userMessage.content);

    const assistantMessage = {
      id: Date.now() + 1,
      type: 'assistant',
      content: advice,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
              <p className="text-sm text-gray-600">Real-time insights • NSE & BSE</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Market Open</span>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="p-4 bg-white border-b">
        <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl p-4 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white shadow-md border'
              }`}
            >
              {message.type === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Market Advisor</span>
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white shadow-md border p-4 rounded-lg max-w-3xl">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  {selectedAPI === 'perplexity' ? 'Perplexity Pro' :
                   selectedAPI === 'gemini' ? 'Gemini 1.5' : 'Claude AI'} Market Advisor
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  {selectedAPI === 'perplexity' ? 'Searching real-time market data...' :
                   selectedAPI === 'gemini' ? 'Analyzing with Gemini 1.5...' :
                   'Analyzing market data...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex space-x-3">
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about stocks, IPOs, market analysis, or investment advice..."
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="2"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
          <AlertCircle className="w-3 h-3 mr-1" />
          <span>Investment advice is for educational purposes. Please consult a financial advisor before making investment decisions.</span>
        </div>
      </div>
    </div>
  );
};

export default IndianStockAdvisor;