import axios from "axios";

export default async function handler(req, res) {
  const { symbol, previous_close } = req.body;

  if (!symbol || !previous_close) {
    return res.status(400).json({ error: "Missing symbol or previous_close" });
  }

  try {
    // Send static data to Perplexity only for AI analysis
    const aiResponse = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar-pro",
        messages: [
          {
            role: "user",
            content: `Analyze the stock ${symbol} based on the previous closing price ${previous_close}. Recommend whether to Buy, Sell, or Hold and give a confidence score from 0 to 100. Return JSON only like: { "recommendation": "...", "confidence": 0-100 }`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    // Extract the AI’s response
    const aiData = aiResponse.data?.choices?.[0]?.message?.content || {};
    res.status(200).json({ symbol, previous_close, ...aiData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI analysis failed" });
  }
}
