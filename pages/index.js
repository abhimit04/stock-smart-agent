import React, { useState } from "react";

export default function Home() {
  const [result, setResult] = useState(null);
  const [symbol, setSymbol] = useState("TCS");
  const [previousClose, setPreviousClose] = useState(3495.50); // Example previous close

  const analyzeStock = async () => {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, previous_close: previousClose }),
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Stock Market AI Agent</h1>

      <div className="mt-4">
        <button
          onClick={analyzeStock}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Analyze
        </button>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-slate-800 rounded">
          <p>Symbol: {result.symbol}</p>
          <p>Previous Close: ₹{result.previous_close}</p>
          <p>Recommendation: {result.recommendation || "N/A"}</p>
          <p>Confidence: {result.confidence || 0}%</p>
        </div>
      )}
    </div>
  );
}
