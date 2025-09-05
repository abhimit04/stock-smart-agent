import React, { useEffect, useState } from "react";
import { TrendingUp, Brain } from "lucide-react";

export default function Home() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch stock data (replace this with your Indian stock API)
  useEffect(() => {
    fetch("/api/stocks") // your API route returning stock list
      .then(res => res.json())
      .then(async data => {
        const parsed = Object.keys(data).map(symbol => ({
          symbol,
          name: symbol,
          price: data[symbol].last_price,
          changePercent: data[symbol].ohlc?.close
            ? ((data[symbol].last_price - data[symbol].ohlc.close) / data[symbol].ohlc.close) * 100
            : 0,
          recommendation: null,
        }));
        setStocks(parsed);

        // Fetch AI recommendations for each stock
        setLoading(true);
        const updatedStocks = await Promise.all(
          parsed.map(async stock => {
            try {
              const resp = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  symbol: stock.symbol,
                  price: stock.price,
                  changePercent: stock.changePercent,
                }),
              });
              const result = await resp.json();
              return { ...stock, recommendation: result.recommendation };
            } catch {
              return { ...stock, recommendation: "Analysis failed" };
            }
          })
        );
        setStocks(updatedStocks);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <TrendingUp /> Stock Market AI Agent
      </h1>

      {loading && <p className="mt-2">Analyzing stocks...</p>}

      <ul className="mt-4 space-y-2">
        {stocks.map((s, i) => (
          <li key={i} className="p-2 rounded bg-slate-800">
            <div>
              {s.symbol} — ₹{s.price.toFixed(2)} ({s.changePercent.toFixed(2)}%)
            </div>
            <div className="mt-1 text-sm text-green-400">
              Recommendation: {s.recommendation || "Pending..."}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
