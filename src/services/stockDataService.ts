import { safeFetch, isSafari, logBrowserInfo } from '../utils/fetchPolyfill';

interface StockQuote {
  date: Date;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

interface StockData {
  date: string;
  price: number;
}

// Cache for storing fetched data to prevent repeated API calls and inconsistent results
const dataCache = new Map<string, { data: StockData[], timestamp: number, isReal: boolean }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export class StockDataService {
  private static baseUrl = '/api/stock-data';

  static async fetchStockData(symbol: string, period: string = '3M'): Promise<StockData[]> {
    const cacheKey = `${symbol}_${period}`;
    const now = Date.now();
    
    // Log browser info for debugging
    if (isSafari()) {
      logBrowserInfo();
    }
    
    // Check cache first
    const cached = dataCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`Using cached data for ${symbol}`);
      return cached.data;
    }

    try {
      console.log(`Fetching fresh data for ${symbol} from Yahoo Finance API...`);
      
      // Use the enhanced fetch function with retry for Safari compatibility
      let response: Response;
      let retryCount = 0;
      const maxRetries = isSafari() ? 3 : 1;
      
      while (retryCount < maxRetries) {
        try {
          response = await safeFetch(`${this.baseUrl}?symbol=${symbol}&period=${period}`);
          break; // Success, exit retry loop
        } catch (error) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw error; // Max retries reached, throw the error
          }
          
          console.log(`Retry ${retryCount}/${maxRetries} for ${symbol}...`);
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
      const data: StockQuote[] = await response!.json();
      
      // Check if we got valid data
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('No data returned from API');
      }
      
      // Transform the data to match our component's expected format
      const transformedData = data.map(quote => ({
        date: new Date(quote.date).toISOString().split('T')[0],
        price: quote.close
      })).filter(item => item.price != null && !isNaN(item.price)); // Filter out any null/undefined/NaN prices
      
      if (transformedData.length === 0) {
        throw new Error('No valid price data after transformation');
      }
      
      // Cache the real data
      dataCache.set(cacheKey, { 
        data: transformedData, 
        timestamp: now, 
        isReal: true 
      });
      
      console.log(`✅ Successfully fetched ${transformedData.length} real data points for ${symbol}`);
      console.log(`📊 Price range: $${Math.min(...transformedData.map(d => d.price)).toFixed(2)} - $${Math.max(...transformedData.map(d => d.price)).toFixed(2)}`);
      return transformedData;
      
    } catch (error) {
      console.error(`❌ Error fetching real data for ${symbol}:`, error);
      
      // Check if we have cached fallback data
      if (cached) {
        console.log(`🔄 Using cached fallback data for ${symbol}`);
        return cached.data;
      }
      
      // Generate consistent fallback data and cache it
      console.log(`🎲 Generating consistent fallback data for ${symbol}`);
      const fallbackData = this.generateConsistentFallbackData(symbol);
      dataCache.set(cacheKey, { 
        data: fallbackData, 
        timestamp: now, 
        isReal: false 
      });
      
      console.log(`✅ Generated ${fallbackData.length} consistent data points for ${symbol}`);
      return fallbackData;
    }
  }

  // Generate consistent fallback data using stock symbol as seed
  private static generateConsistentFallbackData(symbol: string): StockData[] {
    // Create a consistent seed from the stock symbol
    const seed = this.stringToSeed(symbol);
    const rng = this.createSeededRandom(seed);
    
    const data: StockData[] = [];
    const basePrice = rng() * 200 + 50; // Use seeded random for base price
    const days = 90; // 3 months of data
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      // Add multiple cyclical patterns for more realistic results
      const monthlyCycle = Math.sin(i * 2 * Math.PI / 30) * 8; // 30-day cycle
      const weeklyCycle = Math.sin(i * 2 * Math.PI / 7) * 3; // 7-day cycle
      const biWeeklyCycle = Math.sin(i * 2 * Math.PI / 14) * 5; // 14-day cycle
      
      // Stock-specific characteristics (deterministic based on symbol)
      let trend = 0;
      let volatility = 1;
      
      switch (symbol) {
        case "TSLA":
          trend = i * 0.8; // Strong upward trend
          volatility = 2; // High volatility
          break;
        case "AAPL":
          trend = i * 0.3; // Moderate upward trend
          volatility = 0.8; // Low volatility
          break;
        case "NVDA":
          trend = i * 1.2; // Very strong upward trend
          volatility = 1.5; // Moderate-high volatility
          break;
        case "META":
          trend = i * 0.4; // Moderate upward trend
          volatility = 1.2; // Moderate volatility
          break;
        default:
          trend = i * 0.2; // Default mild upward trend
          volatility = 1; // Default volatility
      }
      
      // Use seeded random for noise to ensure consistency
      const noise = (rng() - 0.5) * 15 * volatility;
      const price = basePrice + monthlyCycle + weeklyCycle + biWeeklyCycle + trend + noise;
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.max(price, 1) // Ensure positive prices
      });
    }
    
    return data;
  }

  // Convert string to numeric seed
  private static stringToSeed(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Create a seeded random number generator
  private static createSeededRandom(seed: number): () => number {
    let state = seed;
    return function() {
      state = (state * 1664525 + 1013904223) % 0x100000000;
      return state / 0x100000000;
    };
  }

  static async getStockInfo(symbol: string): Promise<{name: string, price: number, isReal: boolean} | null> {
    try {
      // Check if we have cached data first
      const cacheKey = `${symbol}_3M`;
      const cached = dataCache.get(cacheKey);
      
      if (cached && cached.data.length > 0) {
        const latestPrice = cached.data[cached.data.length - 1].price;
        
        // Simple mapping of symbols to company names
        const companyNames: Record<string, string> = {
          'AAPL': 'Apple Inc.',
          'MSFT': 'Microsoft Corporation',
          'GOOGL': 'Alphabet Inc.',
          'AMZN': 'Amazon.com, Inc.',
          'TSLA': 'Tesla, Inc.',
          'META': 'Meta Platforms, Inc.',
          'NVDA': 'NVIDIA Corporation',
          'JPM': 'JPMorgan Chase & Co.',
          'JNJ': 'Johnson & Johnson'
        };
        
        return {
          name: companyNames[symbol] || `${symbol} Inc.`,
          price: latestPrice,
          isReal: cached.isReal
        };
      }
      
      // If no cached data, fetch new data
      const data = await this.fetchStockData(symbol, '1D');
      if (data.length > 0) {
        const latestPrice = data[data.length - 1].price;
        const cached = dataCache.get(cacheKey);
        
        return {
          name: this.getCompanyName(symbol),
          price: latestPrice,
          isReal: cached?.isReal || false
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching stock info:', error);
      return null;
    }
  }

  private static getCompanyName(symbol: string): string {
    const companyNames: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'AMZN': 'Amazon.com, Inc.',
      'TSLA': 'Tesla, Inc.',
      'META': 'Meta Platforms, Inc.',
      'NVDA': 'NVIDIA Corporation',
      'JPM': 'JPMorgan Chase & Co.',
      'JNJ': 'Johnson & Johnson'
    };
    return companyNames[symbol] || `${symbol} Inc.`;
  }

  // Method to check if data is from cache
  static isDataCached(symbol: string, period: string = '3M'): boolean {
    const cacheKey = `${symbol}_${period}`;
    const cached = dataCache.get(cacheKey);
    const now = Date.now();
    return cached !== undefined && (now - cached.timestamp) < CACHE_DURATION;
  }

  // Method to check if cached data is real or simulated
  static isDataReal(symbol: string, period: string = '3M'): boolean {
    const cacheKey = `${symbol}_${period}`;
    const cached = dataCache.get(cacheKey);
    return cached?.isReal || false;
  }

  // Method to clear cache (useful for testing)
  static clearCache(): void {
    dataCache.clear();
  }
}