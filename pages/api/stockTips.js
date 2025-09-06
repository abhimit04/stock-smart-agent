// pages/api/stockTips.js

export default async function handler(req, res) {
  try {
    const { symbol } = req.body;

    // -----------------------------
    // 1. SERPAPI → Get links
    // -----------------------------
    const serpRes = await fetch(
      `https://serpapi.com/search.json?q=${encodeURIComponent(
        symbol + " stock news site:moneycontrol.com OR site:economictimes.indiatimes.com OR site:livemint.com"
      )}&api_key=${process.env.SERPAPI_KEY}`
    );

    if (!serpRes.ok) throw new Error("SerpAPI request failed");
    const serpData = await serpRes.json();

    const topLinks =
      serpData.organic_results?.slice(0, 5).map((r) => r.link) || [];

    // -----------------------------
    // 2. Perplexity Pro → Crawl + Analysis
    // -----------------------------
    const perplexityRes = await fetch(
      "https://api.perplexity.ai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-huge-128k-online",
          messages: [
            {
              role: "system",
              content:
                "You are an Indian stock market expert. Crawl the given links, summarize the insights, and return stock tips with citations.",
            },
            {
              role: "user",
              content: `Analyze these news links about ${symbol}:\n\n${topLinks.join(
                "\n"
              )}\n\nProvide insights, BUY/SELL/HOLD signals, and risks.`,
            },
          ],
          max_tokens: 1800,
          temperature: 0.3,
          return_citations: true,
        }),
      }
    );

    if (!perplexityRes.ok) throw new Error("Perplexity API request failed");
    const perplexityData = await perplexityRes.json();
    const rawAdvice =
      perplexityData.choices?.[0]?.message?.content || "No advice found";
    const citations = perplexityData.citations || [];

    // -----------------------------
    // 3a. Gemini Flash → Structured Summary
    // -----------------------------
    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" +
        process.env.GOOGLE_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Summarize this stock advice for ${symbol}. 
                  Output format:
                  - 📊 Recommendation: BUY/SELL/HOLD
                  - 🔑 Confidence Score (0–100)
                  - ✅ 3 Key Reasons
                  - ⚠️ Risks
                  
                  Text:
                  ${rawAdvice}`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!geminiRes.ok) throw new Error("Gemini API failed");
    const geminiData = await geminiRes.json();
    const geminiSummary =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No Gemini summary";

    // -----------------------------
    // 3b. Perplexity Summary (short form)
    // -----------------------------
    const perplexitySummaryRes = await fetch(
      "https://api.perplexity.ai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-online",
          messages: [
            {
              role: "system",
              content:
                "Summarize financial insights into a concise BUY/SELL/HOLD recommendation.",
            },
            {
              role: "user",
              content: rawAdvice,
            },
          ],
          max_tokens: 500,
          temperature: 0.2,
        }),
      }
    );

    const perplexitySummaryData = await perplexitySummaryRes.json();
    const perplexitySummary =
      perplexitySummaryData.choices?.[0]?.message?.content ||
      "No Perplexity summary";

    // -----------------------------
    // Final Response
    // -----------------------------
    res.status(200).json({
      symbol,
      sources: topLinks,
      rawAdvice,
      citations,
      geminiSummary,
      perplexitySummary,
    });
  } catch (error) {
    console.error("StockTips API Error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch stock recommendations", details: error.message });
  }
}
