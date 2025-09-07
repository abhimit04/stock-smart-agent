📈 AI Stock Agent

An AI-powered stock information & insights tool built with Next.js, Node.js, and free stock market APIs.
It supports:

🔍 Stock Search → Get historical prices, company info, and market data.

💡 Stock Tips (AI-powered) → Generate AI-based insights/recommendations from available financial data.

🤖 Stock Agent → Acts as a chatbot to handle queries about Indian stock market companies, prices, or trends.

🚀 Features

Search Any Stock
Get real-time & historical stock data for Indian and global companies.

AI-Powered Tips
Summarises technical + fundamental signals into easy-to-read tips.

Stock Chat Agent
Natural language queries like:

“What is the latest price of Reliance?”

“Show me HDFC Bank’s performance last 3 months”

“Which IT stocks are trending this week in India?”

⚙️ Setup Instructions
1. Clone Repo
   git clone https://github.com/your-repo/ai-stock-agent.git
   cd ai-stock-agent
2. Install Dependencies
   npm install
3. Set Environment Variables
   - Create a .env.local file in the root directory.
   
     PERPLEXITY_API_KEY=your_perplexity_api_key
     SERPAPI_KEY=your_serpapi_key

4. Run Development Server
   npm run dev
5. Open in Browser
   - Navigate to http://localhost:3000
   - Test queries in the input box
   - API endpoint: http://localhost:3000/api/stockAgent?query=your_query
   - Examples:
     - "Latest price of TCS"
     - "Show me Infosys stock performance last 6 months"
     - "Top trending stocks in India this week"
6. Deploy
   - Push to GitHub and deploy on Vercel for easy hosting.
   - Ensure environment variables are set in Vercel dashboard.
   - Vercel will handle building and running the Next.js app.
   - API endpoint will be live at https://your-vercel-app.vercel.app/api/stockAgent
   - Frontend UI at https://your-vercel-app.vercel.app
   
7. Usage
   - Use the input box on the frontend to ask stock-related questions.
   - The AI agent will respond with relevant stock data and insights.
   - Examples:
     - "What is the current price of Reliance?"
     - "Show me HDFC Bank's performance over the last 3 months"
     - "Which IT stocks are trending this week in India?"

--- #  ---## 📄 License
This project is licensed under the MIT License. 
Feel free to use and contribute!
