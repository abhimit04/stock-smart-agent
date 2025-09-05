import React, { useState } from "react";

export default function Home() {
  const [symbol, setSymbol] = useState("TCS");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeStock = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Stock Market AI Agent</h1>

      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        className="border p-2 mr-2"
        placeholder="Enter NSE symbol"
      />
      <button
        onClick={analyzeStock}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Analyze
      </button>

      {loading && <p>Analyzing {symbol}...</p>}

      {result && (
        <div className="mt-4 p-4 bg-slate-800 rounded">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
