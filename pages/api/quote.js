// pages/api/quote.js
import axios from "axios";

const PERP_URL = "https://api.perplexity.ai/answers"; // adjust if your Perplexity plan uses a different endpoint

function extractJSON(text) {
  // find the first JSON object or array in text
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const raw = text.slice(start, end + 1);
    try { return JSON.parse(raw); } catch (e) {}
  }
  // fallback: try array
  const aStart = text.indexOf("[");
  const aEnd = text.lastIndexOf("]");
  if (aStart !== -1 && aEnd !== -1 && aEnd > aStart) {
    const raw = text.slice(aStart, aEnd + 1);
    try { return JSON.parse(raw); } catch (e) {}
  }
  return null;
}

async function queryPerplexity(prompt) {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) throw new Error("PERPLEXITY_API_KEY not set");
  try {
    const r = await axios.post(PERP_URL, { query: prompt }, {
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      timeout: 20000
    });
    return r.data;
  } catch (err) {
    throw new Error(err?.response?.data || err.message);
  }
}

export default async function handler(req, res) {
  try {
    const symbol = (req.query.symbol || "RELIANCE").toUpperCase();
    // Prompt Perplexity to return JSON only. Ask for latest price, prev_close, day high/low, volume, and last 60 daily closes (if available),
    // plus 3 short news bullets with source URLs.
    const prompt = `
Return a JSON object only (no explanation) about the Indian stock ${symbol} (NSE).
Fields required:
- symbol (string)
- exchange (string, e.g. "NSE")
- latest: { price (number, INR), previous_close (number), high (number), low (number), volume (number), timestamp (ISO8601) }
- recent_closes: [numbers]  // last up to 60 daily close prices, earliest first; if not available return empty array
- news: [{title, source, url}] // up to 3 recent headlines with source and url
If exact historical series is not available, set recent_closes to [].
Return valid JSON only.
`;

    const p = await queryPerplexity(prompt);

    // Perplexity Pro response shape varies. Try to extract plain text answer and parse JSON inside it.
    let text = "";
    if (p?.answer) text = typeof p.answer === "string" ? p.answer : JSON.stringify(p.answer);
    else if (p?.data) text = JSON.stringify(p.data).slice(0, 10000);
    else if (p?.answers) text = JSON.stringify(p.answers);
    else text = JSON.stringify(p);

    const parsed = extractJSON(text);
    if (!parsed) {
      // fallback: provide minimal structure with the textual answer included
      return res.status(200).json({
        symbol,
        exchange: "NSE",
        latest: null,
        recent_closes: [],
        news: [],
        raw: text,
        warning: "Perplexity did not return JSON — inspect 'raw' for details"
      });
    }

    // ensure numbers
    if (parsed.latest) {
      ["price","previous_close","high","low","volume"].forEach(k => {
        if (parsed.latest[k] !== undefined) parsed.latest[k] = Number(parsed.latest[k]) || parsed.latest[k];
      });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("quote error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
