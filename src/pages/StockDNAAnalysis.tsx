import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Dna, Wifi, WifiOff, RefreshCw, Clock, TrendingUp, TrendingDown, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, RadialBarChart, RadialBar, PolarGrid, PolarRadiusAxis } from "recharts";
import { StockDataService } from "@/services/stockDataService";

interface StockData {
  date: string;
  price: number;
}

interface CycleData {
  period: string;
  strength: number;
}

// Fast Fourier Transform implementation for cycle detection
const fft = (signal: number[]): number[] => {
  const n = signal.length;
  if (n <= 1) return signal;
  
  // Simple FFT implementation for demonstration
  // In a real implementation, you'd use a proper FFT library
  const result: number[] = [];
  
  for (let k = 0; k < n; k++) {
    let real = 0;
    let imag = 0;
    
    for (let t = 0; t < n; t++) {
      const angle = -2 * Math.PI * k * t / n;
      real += signal[t] * Math.cos(angle);
      imag += signal[t] * Math.sin(angle);
    }
    
    result[k] = Math.sqrt(real * real + imag * imag);
  }
  
  return result;
};

// Longest Increasing Subsequence for trend strength
const calculateLIS = (prices: number[]): number => {
  if (prices.length === 0) return 0;
  
  const dp: number[] = new Array(prices.length).fill(1);
  
  for (let i = 1; i < prices.length; i++) {
    for (let j = 0; j < i; j++) {
      if (prices[i] > prices[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }
  
  return Math.max(...dp);
};

const StockDNAAnalysis = () => {
  const navigate = useNavigate();
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUsingRealData, setIsUsingRealData] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInitialized, setIsInitialized] = useState(true);

  // Refresh data function
  const refreshData = async () => {
    if (selectedStock && selectedStock !== "") {
      setLoading(true);
      // Clear cache for this stock to force fresh data
      StockDataService.clearCache();
      await fetchStockData(selectedStock);
      setLoading(false);
    }
  };
  const [stocks] = useState([
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "AMZN", name: "Amazon.com, Inc." },
    { symbol: "TSLA", name: "Tesla, Inc." },
    { symbol: "META", name: "Meta Platforms, Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "JNJ", name: "Johnson & Johnson" }
  ]);

  // Filter stocks based on search query
  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) return stocks;
    return stocks.filter(stock => 
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, stocks]);

  // Handle stock selection
  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol);
    const selectedStockData = stocks.find(s => s.symbol === symbol);
    setSearchQuery(selectedStockData ? `${selectedStockData.symbol} - ${selectedStockData.name}` : symbol);
    setShowSuggestions(false);
    
    // Clear previous data and start loading
    setStockData([]);
    setCurrentPrice(null);
    setError(null);
    setIsCached(false);
    
    // Fetch new data
    setLoading(true);
    fetchStockData(symbol).finally(() => {
      setLoading(false);
    });
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(true);
    // If search is cleared, don't auto-refill
    if (value === "") {
      setIsInitialized(true); // Prevent auto-refill
    }
  };

  // Fetch real stock data with improved caching and consistency
  const fetchStockData = async (symbol: string): Promise<void> => {
    try {
      setError(null);
      
      // Check if data is cached
      const wasCached = StockDataService.isDataCached(symbol, '3M');
      const isReal = StockDataService.isDataReal(symbol, '3M');
      
      setIsCached(wasCached);
      
      if (wasCached) {
        console.log(`Using cached data for ${symbol} (${isReal ? 'real' : 'simulated'})`);
      }
      
      const data = await StockDataService.fetchStockData(symbol, '3M');
      const stockInfo = await StockDataService.getStockInfo(symbol);
      
      setStockData(data);
      setCurrentPrice(stockInfo?.price || null);
      
      // Determine if we're using real data based on the service response
      const usingRealData = stockInfo?.isReal || StockDataService.isDataReal(symbol, '3M');
      setIsUsingRealData(usingRealData);
      
      // Update cache status after fetch
      setIsCached(StockDataService.isDataCached(symbol, '3M'));
      
      if (!usingRealData) {
        setError('API unavailable - using consistent simulated data. Results will remain the same for this stock.');
      }
      
    } catch (err) {
      setError('Failed to fetch stock data. Using consistent simulated data for demonstration.');
      setIsUsingRealData(false);
      setIsCached(false);
      console.error('Error fetching stock data:', err);
    }
  };

  useEffect(() => {
    if (selectedStock && selectedStock !== "") {
      setLoading(true);
      fetchStockData(selectedStock).finally(() => {
        setLoading(false);
      });
    }
  }, []);

  // Initialize search query with default stock only once
  useEffect(() => {
    // Don't auto-initialize with any stock on first load
    // Only set search query when a stock is explicitly selected
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.relative')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculate cycle data using FFT
  const cycleData = useMemo((): CycleData[] => {
    if (stockData.length === 0) return [];
    
    const prices = stockData.map(d => d.price);
    const fftResult = fft(prices);
    
    // Convert FFT results to cycle periods
    const cycles: CycleData[] = [];
    const periodLabels = ["5 days", "10 days", "15 days", "20 days", "30 days", "45 days", "60 days"];
    
    for (let i = 1; i < Math.min(7, fftResult.length / 2); i++) {
      cycles.push({
        period: periodLabels[i - 1] || `${i * 5} days`,
        strength: Math.round((fftResult[i] / Math.max(...fftResult)) * 100)
      });
    }
    
    return cycles.sort((a, b) => b.strength - a.strength);
  }, [stockData]);

  // Calculate trend strength using LIS
  const trendStrength = useMemo((): number => {
    if (stockData.length === 0) return 0;
    
    const prices = stockData.map(d => d.price);
    const lis = calculateLIS(prices);
    return Math.round((lis / prices.length) * 100);
  }, [stockData]);

  // Chart data for radial trend persistence chart
  const trendChartData = useMemo(() => [
    { 
      name: "trend", 
      value: trendStrength,
      maxValue: 100, // Add max value for proper scaling
      fill: trendStrength >= 80 ? "#10b981" :
            trendStrength >= 60 ? "#22c55e" :
            trendStrength >= 40 ? "#f59e0b" :
            trendStrength >= 20 ? "#fb923c" :
            "#ef4444"
    }
  ], [trendStrength]);

  const getTrendLabel = (score: number): string => {
    if (score >= 80) return "Very Strong Upward Trend";
    if (score >= 60) return "Strong Upward Trend";
    if (score >= 40) return "Moderate Upward Trend";
    if (score >= 20) return "Weak Upward Trend";
    return "No Clear Trend";
  };

  const getTrendColor = (score: number): string => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    if (score >= 20) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <Dna className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-foreground">Stock  Analysis</h1>
            </div>
          </div>
          
          {/* Data Source Indicator */}
          <div className="flex items-center gap-3">
            {/* Cache Status */}
            {isCached && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-500" />
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                  Cached
                </Badge>
              </div>
            )}
            
            {/* Data Source */}
            <div className="flex items-center gap-2">
              {isUsingRealData ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Live Data
                  </Badge>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-orange-500" />
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Demo Data
                  </Badge>
                </>
              )}
            </div>
            
            {/* Refresh Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshData}
              disabled={loading || !selectedStock || selectedStock === ""}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stock Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Select Stock for Analysis
              {currentPrice && selectedStock && (
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  ${currentPrice.toFixed(2)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full md:w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search stocks by symbol or name (e.g., AAPL, Microsoft)..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-10 pr-4"
                />
              </div>
              
              {/* Suggestions dropdown */}
              {showSuggestions && filteredStocks.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredStocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="px-4 py-2 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                      onClick={() => handleStockSelect(stock.symbol)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{stock.symbol}</span>
                        <span className="text-sm text-muted-foreground">{stock.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* No results message */}
              {showSuggestions && searchQuery.trim() && filteredStocks.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    No stocks found matching "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                  ⚠️ {error}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  💡 <strong>Good news:</strong> The simulated data uses consistent algorithms, so the same stock will always show the same patterns and scores. This ensures reliable analysis for educational purposes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <Dna className="absolute inset-0 m-auto w-6 h-6 text-purple-600 animate-pulse" />
            </div>
            <p className="text-muted-foreground">Analyzing stock DNA patterns...</p>
          </div>
        ) : !selectedStock || selectedStock === "" ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Dna className="w-16 h-16 text-purple-600/50" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Ready to Analyze Stock DNA</h3>
              <p className="text-muted-foreground max-w-md">
                Search and select a stock above to begin advanced algorithmic analysis using 
                Fast Fourier Transform and Longest Increasing Subsequence algorithms.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>FFT Cycle Detection</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>LIS Trend Analysis</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cycle Detector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Dominant Cycles
                  <Badge variant="secondary">FFT Analysis</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fast Fourier Transform reveals hidden periodic patterns in stock movement
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cycleData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="period" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis label={{ value: 'Strength (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, 'Cycle Strength']}
                        labelFormatter={(label) => `Period: ${label}`}
                        contentStyle={{
                          backgroundColor: 'black',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Bar 
                        dataKey="strength" 
                        fill="url(#cycleGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="cycleGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {cycleData.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium">
                        🎯 Strongest Pattern: {cycleData[0]?.period} ({cycleData[0]?.strength}% strength)
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This suggests a potential {cycleData[0]?.period.toLowerCase()} trading cycle
                      </p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>💡 How FFT Works:</strong> Fast Fourier Transform decomposes price movements into frequency components, 
                        revealing hidden periodic patterns that might indicate algorithmic trading, earnings cycles, or market maker behavior.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trend Strength Gauge */}
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle className="flex items-center gap-2">
                  🎯 Trend Persistence Score
                  <Badge variant="secondary">LIS Analysis</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground text-center">
                  Longest Increasing Subsequence measures sustained upward momentum
                </p>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <div className="mx-auto aspect-square max-h-[300px] flex items-center justify-center">
                  <RadialBarChart
                    data={[...trendChartData, { name: "max", value: 100, fill: "transparent" }]}
                    startAngle={90}
                    endAngle={450}
                    innerRadius={80}
                    outerRadius={140}
                    width={300}
                    height={300}
                  >
                    <PolarGrid
                      gridType="circle"
                      radialLines={false}
                      stroke="none"
                      className="first:fill-muted last:fill-background"
                      polarRadius={[86, 74]}
                    />
                    <RadialBar 
                      dataKey="value" 
                      background 
                      cornerRadius={10}
                      fill={trendChartData[0]?.fill}
                    />
                    <PolarRadiusAxis 
                      tick={false} 
                      tickLine={false} 
                      axisLine={false}
                    >
                      <g>
                        <text
                          x="150"
                          y="140"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className={`text-5xl font-bold ${getTrendColor(trendStrength)}`}
                          fill="currentColor"
                        >
                          {trendStrength}
                        </text>
                        <text
                          x="150"
                          y="165"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-lg fill-muted-foreground"
                          fill="currentColor"
                        >
                          %
                        </text>
                        <text
                          x="150"
                          y="185"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-xs fill-muted-foreground"
                          fill="currentColor"
                        >
                          Trend Score
                        </text>
                      </g>
                    </PolarRadiusAxis>
                  </RadialBarChart>
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className={`font-medium ${getTrendColor(trendStrength)}`}>
                      {getTrendLabel(trendStrength)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on {stockData.length} days of price data analysis
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm">
                    {trendStrength >= 50 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          Strong upward momentum detected
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-red-600 font-medium">
                          Limited upward momentum
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      <strong>💡 How LIS Works:</strong> Longest Increasing Subsequence measures the maximum number of 
                      trading days that form an increasing price sequence, indicating trend persistence and momentum strength.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analysis Summary */}
        {!loading && selectedStock && selectedStock !== "" && stockData.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                🧬 DNA Summary for {selectedStock}
                <div className="flex items-center gap-2 text-sm">
                  {isUsingRealData ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      📈 Real Market Data
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      🎲 Simulated Data
                    </Badge>
                  )}
                  <span className="text-muted-foreground">({stockData.length} data points)</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Cyclical Behavior</h4>
                  <p className="text-sm text-muted-foreground">
                    {cycleData.length > 0 ? (
                      <>
                        The strongest detected cycle is <strong>{cycleData[0]?.period}</strong> with 
                        {" "}<strong>{cycleData[0]?.strength}%</strong> strength. This suggests the stock 
                        may have predictable patterns every {cycleData[0]?.period.toLowerCase()}.
                      </>
                    ) : (
                      "No significant cyclical patterns detected in the current timeframe."
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Trend Persistence</h4>
                  <p className="text-sm text-muted-foreground">
                    With a trend persistence score of <strong>{trendStrength}%</strong>, this stock shows{" "}
                    <strong className={getTrendColor(trendStrength).replace('text-', '').toLowerCase()}>
                      {getTrendLabel(trendStrength).toLowerCase()}
                    </strong>. Higher scores indicate more consistent upward price movement over time.
                  </p>
                  {isUsingRealData && (
                    <p className="text-xs text-green-600 mt-2">
                      ✨ Analysis based on real market data from the last 3 months
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StockDNAAnalysis;