import YahooFinance from 'yahoo-finance2';

// Instantiate YahooFinance for v3 API
const yahooFinance = new YahooFinance();


export default async function handler(req, res) {
  // Enhanced CORS headers for Safari compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const symbol = req.query.symbol;
  const period = req.query.period || '6M';

  if (!symbol) {
    return res.status(400).json({ error: 'Missing symbol' });
  }

  try {
    const now = new Date();
    let period1 = new Date(now);
    let interval = '1d';

    switch (period) {
      case '1D':
        period1.setDate(now.getDate() - 2);
        interval = '1d';
        break;
      case '1W':
        period1.setDate(now.getDate() - 7);
        interval = '1d';
        break;
      case '1M':
        period1.setMonth(now.getMonth() - 1);
        interval = '1d';
        break;
      case '3M':
        period1.setMonth(now.getMonth() - 3);
        interval = '1d';
        break;
      case '6M':
        period1.setMonth(now.getMonth() - 6);
        interval = '1d';
        break;
      case '1Y':
        period1.setFullYear(now.getFullYear() - 1);
        interval = '1d';
        break;
      default:
        period1.setMonth(now.getMonth() - 6);
        interval = '1d';
    }

    const results = await yahooFinance.chart(symbol, {
      period1,
      period2: now,
      interval,
    });

    // Extract the quote data from the chart results
    const quotes = results.quotes || [];
    const chartData = quotes.map(d => ({
      date: d.date,
      close: d.close,
      open: d.open,
      high: d.high,
      low: d.low,
      volume: d.volume
    }));
    res.json(chartData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stock data', details: err.message });
  }
}