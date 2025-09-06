const getStockAdvice = async (userMessage) => {
  setIsLoading(true);
  try {
    const res = await fetch("/api/stockTips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: userMessage }),
    });

    const data = await res.json();
    return data.content; // already markdown formatted
  } catch (error) {
    console.error("Stock Advice Error:", error);
    return "❌ Unable to fetch stock insights right now.";
  } finally {
    setIsLoading(false);
  }
};
