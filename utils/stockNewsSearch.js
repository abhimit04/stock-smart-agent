import axios from "axios";

const SERP_API_KEY = process.env.SERP_API_KEY;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Missing query" });

    // 1️⃣ Fetch news from SerpAPI
    let newsResults = [];
    if (SERP_API_KEY) {
      try {
        const serpRes = await axios.get(
          `https://serpapi.com/search.json?q=${encodeURIComponent(
            query
          )}&engine=google_news&api_key=${SERP_API_KEY}`
        );
        newsResults =
          serpRes.data.news_results?.map((item) => ({
            title: item.title,
            link: item.link,
            source: item.source,
            date: item.date,
            snippet: item.snippet,
          })) || [];
      } catch (err) {
        console.error("SerpAPI error:", err.message);
      }
    }

    // 2️⃣ Summarize + analyze news with Perplexity Pro
    let analysis = "Perplexity Pro API key not configured.";
    if (PERPLEXITY_API_KEY && newsResults.length > 0) {
      try {
        const perplexityRes = await axios.post(
          "https://api.perplexity.ai/chat/completions",
          {
            model: "llama-3.1-sonar-huge-128k-online",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert Indian stock market advisor. Summarize news and provide actionable stock insights."
              },
              {
                role: "user",
                content: `Analyze the following stock news and give actionable advice:\n\n${newsResults
                  .map((n) => n.title + " - " + n.snippet)
                  .join("\n\n")}`
              }
            ],
            max_tokens: 1500,
            temperature: 0.3,
            top_p: 0.9,
            return_citations: true,
            search_domain_filter: [
              "moneycontrol.com",
              "economictimes.indiatimes.com",
              "livemint.com",
              "nseindia.com",
              "bseindia.com"
            ]
          },
          {
            headers: {
              Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
              "Content-Type": "application/json"
            }
          }
        );

        analysis =
          perplexityRes.data.choices?.[0]?.message?.content ||
          "No analysis returned from Perplexity Pro.";
      } catch (err) {
        console.error("Perplexity API error:", err.message);
        analysis = "Failed to fetch analysis from Perplexity Pro.";
      }
    }

    res.status(200).json({
      tool: "stockNewsSearch",
      query,
      news: newsResults,
      analysis
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stock news" });
  }
}
