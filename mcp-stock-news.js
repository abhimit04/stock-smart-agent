import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(bodyParser.json());

// 🔑 Add your SerpAPI key here
const SERP_API_KEY = process.env.SERP_API_KEY;

// Define MCP tool endpoint
app.post("/stockNewsSearch", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Missing query" });
    }

    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(
      query
    )}&engine=google_news&api_key=${SERP_API_KEY}`;

    const response = await axios.get(url);

    const results = response.data.news_results?.map((item) => ({
      title: item.title,
      link: item.link,
      source: item.source,
      date: item.date,
      snippet: item.snippet
    }));

    res.json({
      tool: "stockNewsSearch",
      query,
      results: results || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stock news" });
  }
});

// Run MCP server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ MCP Stock News Tool running on port ${PORT}`);
});
