// pages/api/stockNewsSearch.js
import axios from "axios";

export async function fetchStockNews(query) {
  try {
    const SERP_API_KEY = process.env.SERPAPI_KEY;
    if (!SERP_API_KEY) throw new Error("SERPAPI_KEY not configured");

    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(
      query + " stock site:moneycontrol.com OR site:economictimes.indiatimes.com OR site:angelone.in/news OR site:business-standard.com"
    )}&engine=google&api_key=${SERP_API_KEY}`;

    const response = await axios.get(url);
    const results = response.data.organic_results?.slice(0, 5).map((r) => r.link) || [];
    return results;
  } catch (err) {
    console.error("Stock News Fetch Error:", err);
    return [];
  }
}

// Optional API endpoint (so you can call directly from frontend if needed)
export default async function handler(req, res) {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Missing query" });

  const links = await fetchStockNews(query);
  res.status(200).json({ links });
}
