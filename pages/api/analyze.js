// pages/api/an
import axios from "axios";

export default async function handler(req, res) {
  const { symbol, price, changePercent } = req.body;

  if (!symbol) {
    return res.status(400).json({ status: "error", message: "Missing stock symbol" });
  }

  try {
    const resp = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar-medium-online",
        messages: [
          {
            role: "system",
            content: "You are an Indian stock market analyst. Give clear buy/hold/sell recommendation with confidence %."
          },
          {
            role: "user",
            content: `Analyze ${symbol} (NSE). Current price: ₹${price}, change: ${changePercent.toFixed(2)}%. Provide a concise recommendation and confidence level.`
          }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const recommendation = resp.data.choices?.[0]?.message?.content || "No recommendation";

    res.status(200).json({ status: "ok", recommendation });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ status: "error", message: "Analysis failed", error: error.message });
  }
}
