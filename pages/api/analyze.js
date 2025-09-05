import axios from "axios";

export default async function handler(req, res) {
  try {
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({ status: "error", message: "Symbol is required" });
    }

    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar-pro",
        messages: [
          {
            role: "user",
            content: `Analyze the Indian stock ${symbol} (NSE). Return JSON only with:
            {
              "symbol": "${symbol}",
              "latest": { "price": number, "previous_close": number, "high": number, "low": number, "volume": number },
              "recent_closes": [numbers up to last 60 days],
              "recommendation": "Buy / Hold / Sell",
              "confidence": number (0-100)
            }`
          }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    // The AI output usually comes in response.data.choices[0].message.content
    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ status: "error", message: "No response from AI" });
    }

    // Try to parse JSON safely
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { symbol, latest: {}, recent_closes: [], recommendation: "N/A", confidence: 0 };
    }

    res.status(200).json(parsed);

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
}
