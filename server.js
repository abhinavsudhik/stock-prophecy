import express from 'express';
import YahooFinance from 'yahoo-finance2';
import cors from 'cors';

// Instantiate YahooFinance for v3 API
const yahooFinance = new YahooFinance();


const app = express();

// Enhanced CORS configuration for Safari compatibility
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
}));

// Additional headers for Safari compatibility
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

const PORT = 4000;

// S&P 500 symbols list (static for demo, can be replaced with dynamic fetch)
const sp500Symbols = [
  'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NVDA', 'TSLA', 'BRK-B', 'JPM', 'JNJ'
];

app.get('/api/stocks', async (req, res) => {
  try {
    // Fetch quote summary for each symbol
    const promises = sp500Symbols.map(symbol => yahooFinance.quoteSummary(symbol, { modules: ['price'] }));
    const results = await Promise.all(promises);
    const stocks = results.map(r => `${r.price.longName} (${r.price.symbol})`);
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stocks', details: err.message });
  }
});

// New endpoint: get historical price data for a stock symbol
app.get('/api/stock-data', async (req, res) => {
  const symbol = req.query.symbol;
  const period = req.query.period || '6M';
  if (!symbol) return res.status(400).json({ error: 'Missing symbol' });
  try {
    const now = new Date();
    let period1 = new Date(now);
    let interval = '1d';
    switch (period) {
      case '1D':
        period1.setDate(now.getDate() - 2); // fetch last two days
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
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
