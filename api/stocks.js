import yahooFinance from 'yahoo-finance2';

const sp500Symbols = [
  'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NVDA', 'TSLA', 'BRK-B', 'JPM', 'JNJ'
];

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch quote summary for each symbol
    const promises = sp500Symbols.map(symbol => yahooFinance.quoteSummary(symbol, { modules: ['price'] }));
    const results = await Promise.all(promises);
    const stocks = results.map(r => `${r.price.longName} (${r.price.symbol})`);
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stocks', details: err.message });
  }
}