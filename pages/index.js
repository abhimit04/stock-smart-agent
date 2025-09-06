import React, { useState, useRef, useEffect } from 'react';
import { Send, TrendingUp, BarChart3, AlertCircle, Loader, Settings, Database } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
//import '@/styles/globals.css'

const IndianStockAdvisor = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Namaste! 🇮🇳 Welcome to your Indian Stock Market Advisor. I can help you with:\n\n📈 Top stock recommendations\n💰 Stock analysis and financials\n🔥 Latest IPO updates\n📰 Market news and trends\n📊 Investment strategies\n\nPowered by: Perplexity Pro • Gemini 1.5\n\nWhat would you like to know about the Indian stock market today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAPI, setSelectedAPI] = useState('perplexity'); // Default to Perplexity
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  // Retrieve API keys from environment variables
  const PERPLEXITY_API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;
  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Set default API based on availability
    if (PERPLEXITY_API_KEY) {
      setSelectedAPI('perplexity');
    } else if (GEMINI_API_KEY) {
      setSelectedAPI('gemini');
    }
  }, [PERPLEXITY_API_KEY, GEMINI_API_KEY]);

  const quickQuestions = [
    'Top 5 stocks to buy today',
    'Latest IPO launches',
    'Nifty 50 analysis',
    'Best mid-cap stocks',
    'Market news today',
    'Banking sector outlook'
  ];

  // Perplexity Pro API call
  const getPerplexityAdvice = async (userMessage) => {
    try {
      if (!PERPLEXITY_API_KEY) {
        return 'Perplexity Pro API key is not configured. Please use Gemini for analysis.';
      }

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-huge-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are an expert Indian stock market advisor with access to real-time data. Provide comprehensive, well-researched advice on Indian stocks, IPOs, market trends, and investment strategies. Always include current market data, specific stock recommendations with NSE/BSE symbols, and risk assessments.'
            },
            {
              role: 'user',
              content: `Regarding Indian stock market: ${userMessage}\n\nPlease provide detailed analysis with current market data, specific stock names, price targets, and actionable investment advice.`
            }
          ],
          max_tokens: 2000,
          temperature: 0.2,
          top_p: 0.9,
          return_citations: true,
          search_domain_filter: ['moneycontrol.com', 'economictimes.indiatimes.com', 'livemint.com', 'nseindia.com', 'bseindia.com'],
          return_images: false,
          return_related_questions: false,
          search_recency_filter: 'month'
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      let advice = data.choices[0].message.content;

      if (data.citations && data.citations.length > 0) {
        advice += '\n\n**Sources:**\n';
        data.citations.forEach((citation, index) => {
          advice += `${index + 1}. ${citation}\n`;
        });
      }

      return advice;
    } catch (error) {
      console.error('Perplexity API Error:', error);
      return 'Unable to fetch data from Perplexity Pro. Please check the API key configuration or try again later.';
    }
  };

  // Gemini 1.5 Pro API call
  const getGeminiAdvice = async (userMessage) => {
    try {
      if (!GEMINI_API_KEY) {
        return 'Gemini 1.5 Pro API key is not configured. Please use Perplexity for analysis.';
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert Indian stock market advisor. The user is asking: "${userMessage}"

Please provide comprehensive advice following these guidelines:

1. If asking about top stocks or recommendations:
   - Provide 5-7 specific Indian stocks with reasoning
   - Include NSE/BSE symbols and current price ranges
   - Explain fundamental and technical analysis
   - Include risk assessment and sector analysis

2. If asking about IPOs:
   - List recent and upcoming IPOs with subscription details
   - Provide price bands and investment recommendations
   - Analyze company fundamentals and market positioning

3. If asking about market analysis:
   - Cover Nifty 50, Sensex trends with technical levels
   - Mention key sectors and their performance
   - Include global factors affecting Indian markets
   - Provide FII/DII flow analysis

4. If asking about specific stocks:
   - Fundamental analysis (P/E, ROE, ROA, Debt/Equity)
   - Technical analysis with support/resistance levels
   - Financial metrics and growth prospects
   - Peer comparison and sector outlook

5. Always include:
   - Risk disclaimers and diversification advice
   - Market timing considerations
   - Investment horizon recommendations

Please provide actionable, data-driven advice with specific stock names, target prices, and clear rationale.`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      return 'Unable to fetch data from Gemini 1.5 Pro. Please check the API key configuration or try again later.';
    }
  };

  // Main function to get stock advice based on selected API
  const getStockAdvice = async (userMessage) => {
    setIsLoading(true);

    let advice;
    try {
      switch (selectedAPI) {
        case 'perplexity':
          advice = await getPerplexityAdvice(userMessage);
          break;
        case 'gemini':
          advice = await getGeminiAdvice(userMessage);
          break;
        default:
          advice = 'Please select an available AI provider to get advice.';
          break;
      }
    } catch (error) {
      console.error('Error getting stock advice:', error);
      advice = 'I apologize, but I encountered an issue while fetching market data. Please try again or switch to a different AI provider.';
    } finally {
      setIsLoading(false);
    }

    return advice;
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

  const getApiStatus = () => {
    if (selectedAPI === 'perplexity' && PERPLEXITY_API_KEY) return 'Ready';
    if (selectedAPI === 'gemini' && GEMINI_API_KEY) return 'Ready';
    return 'API Key Not Found';
  };

  const isApiReady = () => {
    if (selectedAPI === 'perplexity' && PERPLEXITY_API_KEY) return true;
    if (selectedAPI === 'gemini' && GEMINI_API_KEY) return true;
    return false;
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
              <p className="text-sm text-gray-600">Real-time insights • NSE & BSE • Powered by {selectedAPI.charAt(0).toUpperCase() + selectedAPI.slice(1)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//              <span className="text-sm font-medium">Market Open</span>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 bg-gray-50 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">AI Provider Selection</h3>
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="api"
                  value="perplexity"
                  checked={selectedAPI === 'perplexity'}
                  onChange={(e) => setSelectedAPI(e.target.value)}
                  className="text-blue-600"
                  disabled={!PERPLEXITY_API_KEY}
                />
                <span className={`text-sm ${!PERPLEXITY_API_KEY ? 'text-gray-400' : ''}`}>Perplexity Pro</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="api"
                  value="gemini"
                  checked={selectedAPI === 'gemini'}
                  onChange={(e) => setSelectedAPI(e.target.value)}
                  className="text-blue-600"
                  disabled={!GEMINI_API_KEY}
                />
                <span className={`text-sm ${!GEMINI_API_KEY ? 'text-gray-400' : ''}`}>Gemini 1.5 Pro</span>
              </label>
            </div>

            <div className="text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Database className="w-3 h-3" />
                <span>API Status: </span>
                <span className={`font-medium ${isApiReady() ? 'text-green-600' : 'text-red-600'}`}>
                  {getApiStatus()}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>• Perplexity Pro: Real-time market data with citations (Requires API Key in Vercel Environment Variables)</p>
                <p>• Gemini 1.5: Advanced AI analysis with large context (Requires API Key in Vercel Environment Variables)</p>
              </div>
            </div>
          </div>
        )}
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
                  <span className="text-sm font-medium text-green-600">
                    {selectedAPI === 'perplexity' ? 'Perplexity Pro' : 'Gemini 1.5'} Market Advisor
                  </span>
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                <ReactMarkdown>{message.content}</ReactMarkdown>
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
                  {selectedAPI === 'perplexity' ? 'Perplexity Pro' : 'Gemini 1.5'} Market Advisor
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  {selectedAPI === 'perplexity' ? 'Searching real-time market data...' : 'Analyzing with Gemini 1.5...'}
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