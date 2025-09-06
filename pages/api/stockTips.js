// pages/api/stockTips.js
import { fetchStockNews } from "./stockNewsSearch";

export default async function handler(req, res) {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Missing query" });

    // 1️⃣ Get top links from Stock News
    const topLinks = await fetchStockNews(query);

    // 2️⃣ Perplexity Pro: Analyze links
    let rawAdvice = "No advice";
    try {
      const perplexityRes = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-huge-128k-online",
          messages: [
            { role: "system", content: "You are an Indian stock market expert." },
            { role: "user", content: `Analyze news about: ${query}\nLinks:\n${topLinks.join("\n")}` },
          ],
          max_tokens: 1500,
          temperature: 0.3,
          return_citations: true,
        }),
      });
      const perplexityData = await perplexityRes.json();
      rawAdvice = perplexityData.choices?.[0]?.message?.content || rawAdvice;
    } catch (err) {
      console.error("Perplexity Pro Error:", err);
    }

    // 3️⃣ Gemini Flash: Structured summary
    let geminiSummary = "No Gemini summary";
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Summarize this stock analysis:\n\n${rawAdvice}\nOutput as:\n- 📌 Recommendation\n- 📊 Confidence (0–100)\n- 🔑 3 Key Reasons\n- ⚠️ Risks` }] }],
          }),
        }
      );
      const geminiData = await geminiRes.json();
      geminiSummary = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || geminiSummary;
    } catch (err) {
      console.error("Gemini Flash Error:", err);
    }

    // 4️⃣ Quick summary using Perplexity small
    let perplexitySummary = "No quick summary";
    try {
      const smallRes = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-online",
          messages: [
            { role: "system", content: "Summarize financial insights clearly as BUY/SELL/HOLD with one-line reasoning." },
            { role: "user", content: rawAdvice },
          ],
          max_tokens: 400,
        }),
      });
      const smallData = await smallRes.json();
      perplexitySummary = smallData.choices?.[0]?.message?.content || perplexitySummary;
    } catch (err) {
      console.error("Perplexity Small Error:", err);
    }

    // 5️⃣ Return combined markdown + JSON
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

    res.status(200).json({ markdown: markdownResponse, topLinks, rawAdvice, geminiSummary, quickSummary: perplexitySummary });
  } catch (error) {
    console.error("Stock Tips API Error:", error);
    res.status(500).json({ error: "Failed to fetch stock insights", details: error.message });
  }
}
