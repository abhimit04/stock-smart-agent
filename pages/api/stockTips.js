// pages/api/stockTips.js

export default async function handler(req, res) {
  try {
    const { query } = req.body;

    // -----------------------------
    // 1. SERPAPI → Get links
    // -----------------------------
    const serpRes = await fetch(
      `https://serpapi.com/search.json?q=${encodeURIComponent(
        query +
          " stock site:moneycontrol.com OR site:economictimes.indiatimes.com OR site:livemint.com"
      )}&api_key=${process.env.SERPAPI_KEY}`
    );

    const serpData = await serpRes.json();
    const topLinks =
      serpData.organic_results?.slice(0, 5).map((r) => r.link) || [];

    // -----------------------------
    // 2. Perplexity Pro → Crawl & analyze
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
                "You are an Indian stock market expert. Crawl the given links and analyze.",
            },
            {
              role: "user",
              content: `Analyze news about: ${query}\n\nLinks:\n${topLinks.join(
                "\n"
              )}`,
            },
          ],
          max_tokens: 1500,
          temperature: 0.3,
          return_citations: true,
        }),
      }
    );

    const perplexityData = await perplexityRes.json();
    const rawAdvice =
      perplexityData.choices?.[0]?.message?.content || "No advice";
    const citations = perplexityData.citations || [];

    // -----------------------------
    // 3. Gemini Flash → Structured summary
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
                  text: `Summarize this stock analysis:\n\n${rawAdvice}\n\nOutput as:\n- 📌 Recommendation\n- 📊 Confidence (0–100)\n- 🔑 3 Key Reasons\n- ⚠️ Risks`,
                },
              ],
            },
          ],
        }),
      }
    );
    const geminiData = await geminiRes.json();
    const geminiSummary =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No Gemini summary";

    // -----------------------------
    // 4. Perplexity (small) → Quick summary
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
                "Summarize financial insights clearly as BUY/SELL/HOLD with one-line reasoning.",
            },
            { role: "user", content: rawAdvice },
          ],
          max_tokens: 400,
        }),
      }
    );
    const perplexitySummaryData = await perplexitySummaryRes.json();
    const perplexitySummary =
      perplexitySummaryData.choices?.[0]?.message?.content ||
      "No Perplexity summary";

    // -----------------------------
    // 5. Merge into Markdown block
    // -----------------------------
    const markdownResponse = `
## 📊 Stock Insights for: **${query}**

### ⚡ Quick Summary (Perplexity Small)
${perplexitySummary}

---

### 🤖 Gemini Structured Summary
${geminiSummary}

---

### 🧠 Detailed Market Analysis (Perplexity Pro)
${rawAdvice}

---

### 🔗 Sources
${topLinks.map((l, i) => `${i + 1}. [${l}](${l})`).join("\n")}
`;

    res.status(200).json({ content: markdownResponse });
  } catch (error) {
    console.error("MCP API Error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch stock insights", details: error.message });
  }
}
