import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, X, TrendingUp, Shield, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { MarkowitzOptimizer } from '../utils/markowitzOptimizer';
import { fetchHistoricalData, calculateExpectedReturns, calculateCovarianceMatrix, validateWeights } from '../utils/dataProcessor';

interface Stock {
  symbol: string;
  weight: number;
  expectedReturn: number;
}

interface PortfolioMetrics {
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
}

interface StockSuggestion {
  symbol: string;
  name: string;
}

const PortfolioOptimizer: React.FC = () => {
  const navigate = useNavigate();
  const [stockInput, setStockInput] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizedPortfolio, setOptimizedPortfolio] = useState<Stock[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics>({
    expectedReturn: 0,
    volatility: 0,
    sharpeRatio: 0,
    sortinoRatio: 0
  });

  // New states for autocomplete functionality
  const [stockSuggestions, setStockSuggestions] = useState<StockSuggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<StockSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [optimizationMethod, setOptimizationMethod] = useState<'maxSharpe' | 'maxSortino' | 'minVariance' | 'targetReturn'>('maxSharpe');
  const [targetReturn, setTargetReturn] = useState<number>(0.12); // 12% target return
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [optimizationError, setOptimizationError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const COLORS = [
    'hsl(280 100% 70%)', // Primary purple
    'hsl(320 100% 75%)', // Accent pink
    'hsl(200 100% 70%)', // Secondary blue
    'hsl(142 76% 36%)',  // Success green
    'hsl(48 96% 53%)',   // Warning yellow
    'hsl(38 92% 50%)'    // Bitcoin orange
  ];

  // Popular stock suggestions for autocomplete
  const popularStocks: StockSuggestion[] = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'JNJ', name: 'Johnson & Johnson' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'PG', name: 'Procter & Gamble Co.' },
    { symbol: 'UNH', name: 'UnitedHealth Group Inc.' },
    { symbol: 'HD', name: 'Home Depot Inc.' },
    { symbol: 'MA', name: 'Mastercard Inc.' },
    { symbol: 'BAC', name: 'Bank of America Corp.' },
    { symbol: 'DIS', name: 'Walt Disney Co.' },
    { symbol: 'ADBE', name: 'Adobe Inc.' },
    { symbol: 'CRM', name: 'Salesforce Inc.' },
    { symbol: 'NFLX', name: 'Netflix Inc.' },
    { symbol: 'KO', name: 'Coca-Cola Co.' },
    { symbol: 'PEP', name: 'PepsiCo Inc.' },
    { symbol: 'INTC', name: 'Intel Corporation' },
    { symbol: 'CSCO', name: 'Cisco Systems Inc.' },
    { symbol: 'VZ', name: 'Verizon Communications Inc.' },
    { symbol: 'PFE', name: 'Pfizer Inc.' },
    { symbol: 'T', name: 'AT&T Inc.' },
    { symbol: 'MRK', name: 'Merck & Co. Inc.' },
    { symbol: 'ABT', name: 'Abbott Laboratories' },
    { symbol: 'COP', name: 'ConocoPhillips' },
    { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.' }
  ];

  // Handle input changes and filter suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStockInput(value);
    
    // Get the current word being typed (after the last comma)
    const words = value.split(',');
    const currentWord = words[words.length - 1].trim().toUpperCase();
    setCurrentInput(currentWord);
    
    // Check for duplicates in existing words (excluding the current word being typed)
    const existingWords = words.slice(0, -1).map(w => w.trim().toUpperCase()).filter(w => w.length > 0);
    
    if (currentWord.length > 0) {
      // Filter suggestions excluding already entered stocks
      const filtered = popularStocks.filter(stock => 
        (stock.symbol.startsWith(currentWord) || 
         stock.name.toLowerCase().includes(currentWord.toLowerCase())) &&
        !existingWords.includes(stock.symbol) // Exclude already entered stocks
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
      setSelectedIndex(-1); // Reset selection
    } else {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: StockSuggestion) => {
    const words = stockInput.split(',');
    words[words.length - 1] = suggestion.symbol;
    
    // Add comma and space for next entry
    const newValue = words.join(',') + ', ';
    setStockInput(newValue);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setCurrentInput('');
    
    // Focus back on input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle input focus
  const handleInputFocus = () => {
    if (currentInput.length > 0 && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Real Markowitz Mean-Variance Optimization
  const optimizePortfolio = async (symbols: string[]) => {
    setIsOptimizing(true);
    setIsDataLoading(true);
    setOptimizationError(null);
    
    try {
      console.log('Starting portfolio optimization for symbols:', symbols);
      
      // Step 1: Fetch historical data
      const historicalData = await fetchHistoricalData(symbols, '1Y');
      console.log('Historical data fetched:', Object.keys(historicalData));
      setIsDataLoading(false);
      
      // Step 2: Calculate expected returns and covariance matrix
      const expectedReturns = calculateExpectedReturns(historicalData);
      const covarianceMatrix = calculateCovarianceMatrix(historicalData);
      
      console.log('Expected returns:', expectedReturns);
      console.log('Covariance matrix dimensions:', covarianceMatrix.length, 'x', covarianceMatrix[0]?.length);
      
      // Step 3: Initialize Markowitz optimizer
      const optimizer = new MarkowitzOptimizer(0.02); // 2% risk-free rate
      
      // Step 4: Optimize based on selected method
      let result;
      switch (optimizationMethod) {
        case 'maxSharpe':
          result = optimizer.optimizeMaxSharpe({
            symbols,
            expectedReturns,
            covarianceMatrix
          });
          break;
        case 'maxSortino':
          // Convert historical data to the format needed for Sortino calculation
          const historicalReturnsArray = symbols.map(symbol => historicalData[symbol] || []);
          result = optimizer.optimizeMaxSortino({
            symbols,
            expectedReturns,
            covarianceMatrix,
            historicalReturns: historicalReturnsArray
          });
          break;
        case 'minVariance':
          result = optimizer.optimizeMinVariance({
            symbols,
            expectedReturns,
            covarianceMatrix
          });
          break;
        case 'targetReturn':
          result = optimizer.optimizeForTargetReturn({
            symbols,
            expectedReturns,
            covarianceMatrix
          }, targetReturn);
          break;
        default:
          throw new Error('Invalid optimization method');
      }
      
      console.log('Optimization result:', result);
      
      // Validate weights
      if (!validateWeights(result.weights)) {
        console.warn('Invalid weights detected, normalizing...');
        const sum = result.weights.reduce((a, b) => a + b, 0);
        if (sum > 0) {
          result.weights = result.weights.map(w => Math.max(0, w) / sum);
        } else {
          result.weights = new Array(symbols.length).fill(1 / symbols.length);
        }
      }
      
      // Step 5: Convert to Stock array format
      const optimizedStocks: Stock[] = symbols.map((symbol, index) => ({
        symbol,
        weight: result.weights[index],
        expectedReturn: expectedReturns[index]
      }));
      
      setOptimizedPortfolio(optimizedStocks);
      setPortfolioMetrics({
        expectedReturn: result.expectedReturn,
        volatility: result.volatility,
        sharpeRatio: result.sharpeRatio,
        sortinoRatio: result.sortinoRatio
      });
      
      console.log('Portfolio optimization completed successfully');
      
    } catch (error) {
      console.error('Portfolio optimization failed:', error);
      setOptimizationError(error instanceof Error ? error.message : 'Optimization failed');
      
      // Fallback to equal weights
      const equalWeight = 1 / symbols.length;
      const fallbackPortfolio: Stock[] = symbols.map(symbol => ({
        symbol,
        weight: equalWeight,
        expectedReturn: 0.1 // 10% fallback return
      }));
      
      setOptimizedPortfolio(fallbackPortfolio);
      setPortfolioMetrics({
        expectedReturn: 0.1,
        volatility: 0.15,
        sharpeRatio: 0.53,
        sortinoRatio: 0.67
      });
    } finally {
      setIsOptimizing(false);
      setIsDataLoading(false);
    }
  };

  const handleOptimize = () => {
    const allSymbols = stockInput.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
    
    // Remove duplicates
    const symbols = [...new Set(allSymbols)];
    
    // Check if duplicates were found
    if (allSymbols.length > symbols.length) {
      const duplicateCount = allSymbols.length - symbols.length;
      const message = `Removed ${duplicateCount} duplicate stock${duplicateCount > 1 ? 's' : ''} from portfolio`;
      setDuplicateWarning(message);
      
      // Update the input field to remove duplicates
      setStockInput(symbols.join(', '));
      
      // Clear warning after 3 seconds
      setTimeout(() => setDuplicateWarning(null), 3000);
    } else {
      setDuplicateWarning(null);
    }
    
    if (symbols.length > 0) {
      optimizePortfolio(symbols);
    }
  };

  // Initialize stock suggestions
  useEffect(() => {
    setStockSuggestions(popularStocks);
  }, []);

  const chartData = optimizedPortfolio.map((stock, index) => ({
    name: stock.symbol,
    value: stock.weight * 100,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm hover:bg-card border border-border text-foreground rounded-lg transition-smooth"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border p-6 max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <span className="text-3xl mr-3">📈</span>
            <h1 className="text-3xl font-bold text-foreground">Smart Portfolio Optimizer</h1>
          </div>

          {/* Optimization Method Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              Optimization Method
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setOptimizationMethod('maxSharpe')}
                className={`p-4 rounded-lg border transition-smooth text-left ${
                  optimizationMethod === 'maxSharpe'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card/60 text-foreground hover:bg-card'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">Maximum Sharpe Ratio</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximize risk-adjusted returns (return per unit of risk)
                </p>
              </button>

              <button
                onClick={() => setOptimizationMethod('maxSortino')}
                className={`p-4 rounded-lg border transition-smooth text-left ${
                  optimizationMethod === 'maxSortino'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card/60 text-foreground hover:bg-card'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-semibold">Maximum Sortino Ratio</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximize downside risk-adjusted returns (focuses on negative volatility)
                </p>
              </button>
              
              <button
                onClick={() => setOptimizationMethod('minVariance')}
                className={`p-4 rounded-lg border transition-smooth text-left ${
                  optimizationMethod === 'minVariance'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card/60 text-foreground hover:bg-card'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-5 w-5" />
                  <span className="font-semibold">Minimum Variance</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimize portfolio risk (lowest possible volatility)
                </p>
              </button>
              
              <button
                onClick={() => setOptimizationMethod('targetReturn')}
                className={`p-4 rounded-lg border transition-smooth text-left ${
                  optimizationMethod === 'targetReturn'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card/60 text-foreground hover:bg-card'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-5 w-5" />
                  <span className="font-semibold">Target Return</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Achieve specific return with minimum risk
                </p>
              </button>
            </div>
            
            {/* Target Return Input */}
            {optimizationMethod === 'targetReturn' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Target Annual Return (%)
                </label>
                <input
                  type="number"
                  value={(targetReturn * 100).toFixed(1)}
                  onChange={(e) => setTargetReturn(parseFloat(e.target.value) / 100)}
                  min="0"
                  max="50"
                  step="0.5"
                  className="w-32 px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
            )}
          </div>

          {/* Input Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Stock Symbols (comma-separated)
            </label>
            
            {/* Display current stocks as pills */}
            {stockInput.trim() && (
              <div className="mb-3 flex flex-wrap gap-2">
                {stockInput.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0).map((symbol, index, arr) => {
                  const isDuplicate = arr.indexOf(symbol) !== index;
                  return (
                    <span
                      key={`${symbol}-${index}`}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        isDuplicate 
                          ? 'bg-destructive/20 text-destructive border border-destructive/30' 
                          : 'bg-primary/10 text-primary border border-primary/20'
                      }`}
                    >
                      {symbol}
                      {isDuplicate && (
                        <span className="ml-1 text-xs">⚠️</span>
                      )}
                      <button
                        onClick={() => {
                          const symbols = stockInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
                          symbols.splice(index, 1);
                          setStockInput(symbols.join(', '));
                        }}
                        className="ml-2 hover:text-destructive transition-colors"
                        aria-label={`Remove ${symbol}`}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            
            <div className="relative">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={stockInput}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      onFocus={handleInputFocus}
                      placeholder="Enter stock symbols (e.g., AAPL, MSFT, NVDA)..."
                      className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div 
                      ref={suggestionsRef}
                      className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                    >
                      {filteredSuggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.symbol}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={`px-4 py-3 cursor-pointer border-b border-border last:border-b-0 transition-colors ${
                            index === selectedIndex 
                              ? 'bg-primary/20 border-primary/30' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-semibold text-foreground text-lg">
                                {suggestion.symbol}
                              </span>
                              <p className="text-sm text-muted-foreground mt-1">
                                {suggestion.name}
                              </p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {index === selectedIndex ? 'Press Enter' : 'Click to add'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Duplicate Warning Message */}
                {duplicateWarning && (
                  <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-center gap-2">
                    <span className="text-warning text-sm">⚠️</span>
                    <span className="text-warning text-sm font-medium">{duplicateWarning}</span>
                  </div>
                )}
                
                <button
                  onClick={handleOptimize}
                  disabled={isOptimizing || isDataLoading}
                  className={`px-8 py-3 rounded-lg font-medium text-lg transition-smooth ${
                    isOptimizing || isDataLoading
                      ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-crypto hover:shadow-glow-crypto'
                  }`}
                >
                  {isDataLoading ? 'Loading Data...' : isOptimizing ? 'Optimizing...' : 'Optimize Portfolio'}
                </button>
              </div>
              
              {/* Helper text */}
              <p className="text-xs text-muted-foreground mt-2">
                💡 Start typing a stock symbol or company name to see suggestions. Use ↑↓ arrow keys to navigate, Enter to select, or click on a suggestion to add it to your portfolio. Duplicate stocks are automatically prevented.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Visual Pie Chart */}
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border">
              <h2 className="text-xl font-semibold mb-6 text-center text-foreground">Portfolio Allocation</h2>
              {optimizedPortfolio.length > 0 ? (
                <div className="relative">
                  {/* Recharts Pie Chart */}
                  <ChartContainer
                    config={{
                      allocation: {
                        label: "Portfolio Allocation",
                      },
                    }}
                    className="mx-auto aspect-square max-h-[400px]"
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent 
                            hideLabel 
                            formatter={(value, name) => [
                              `${Number(value).toFixed(1)}%`,
                              name
                            ]}
                          />
                        }
                      />
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}\n${Number(value).toFixed(1)}%`}
                        outerRadius={130}
                        innerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="#1f2937"
                        strokeWidth={2}
                        animationBegin={0}
                        animationDuration={800}
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                            stroke={activeIndex === index ? "#ffffff" : "#1f2937"}
                            strokeWidth={activeIndex === index ? 3 : 2}
                            style={{
                              filter: activeIndex === index ? "brightness(1.1)" : "brightness(1)",
                              cursor: "pointer"
                            }}
                          />
                        ))}
                      </Pie>
                      <Legend 
                        verticalAlign="bottom" 
                        height={50}
                        iconType="circle"
                        formatter={(value, entry) => (
                          <span style={{ color: entry.color, fontWeight: '600', fontSize: '14px' }}>
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ChartContainer>
                  
                  {/* Additional Stats */}
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Total Allocation: {chartData.reduce((sum, item) => sum + item.value, 0).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center text-muted-foreground space-y-3">
                  {isDataLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p>Fetching historical data...</p>
                    </>
                  ) : isOptimizing ? (
                    <>
                      <div className="animate-pulse text-primary">
                        <TrendingUp className="h-8 w-8" />
                      </div>
                      <p>Running Markowitz optimization...</p>
                    </>
                  ) : optimizationError ? (
                    <>
                      <div className="text-destructive">
                        <X className="h-8 w-8" />
                      </div>
                      <p className="text-destructive text-center">
                        Optimization failed: {optimizationError}
                      </p>
                      <p className="text-xs text-muted-foreground text-center">
                        Showing equal-weight portfolio as fallback
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-muted-foreground">
                        <Target className="h-8 w-8" />
                      </div>
                      <p>Enter stocks and select optimization method</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Metrics and Breakdown */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Portfolio Metrics</h2>
              
              <div className="bg-success/10 border border-success/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-success font-medium text-lg">Expected Annual Return</span>
                  <span className="text-3xl font-bold text-success">
                    {(portfolioMetrics.expectedReturn * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="bg-warning/10 border border-warning/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-warning font-medium text-lg">Annual Volatility (Risk)</span>
                  <span className="text-3xl font-bold text-warning">
                    {(portfolioMetrics.volatility * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-primary font-medium text-lg">Sharpe Ratio</span>
                  <span className="text-3xl font-bold text-primary">
                    {portfolioMetrics.sharpeRatio.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-accent font-medium text-lg">Sortino Ratio</span>
                  <span className="text-3xl font-bold text-accent">
                    {portfolioMetrics.sortinoRatio.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Individual Stock Breakdown */}
              {optimizedPortfolio.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Stock Allocations</h3>
                  <div className="space-y-3">
                    {optimizedPortfolio.map((stock, index) => (
                      <div key={stock.symbol} className="flex justify-between items-center py-3 px-4 bg-card/60 backdrop-blur-sm rounded-2xl border border-border hover:shadow-crypto transition-smooth">
                        <span className="font-semibold text-lg text-foreground">{stock.symbol}</span>
                        <span className="text-xl font-bold" style={{color: COLORS[index % COLORS.length]}}>
                          {(stock.weight * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 p-6 bg-card/60 backdrop-blur-sm rounded-2xl border border-border">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Markowitz Mean-Variance Optimization
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong className="text-foreground">Maximum Sharpe Ratio:</strong>
                  <p className="text-muted-foreground mt-1">
                    Finds the portfolio with the highest risk-adjusted return using gradient ascent optimization.
                  </p>
                </div>
                <div>
                  <strong className="text-foreground">Maximum Sortino Ratio:</strong>
                  <p className="text-muted-foreground mt-1">
                    Optimizes for risk-adjusted returns considering only downside risk (negative volatility).
                  </p>
                </div>
                <div>
                  <strong className="text-foreground">Minimum Variance:</strong>
                  <p className="text-muted-foreground mt-1">
                    Uses analytical solution with matrix inversion to find the lowest-risk portfolio.
                  </p>
                </div>
                <div>
                  <strong className="text-foreground">Target Return:</strong>
                  <p className="text-muted-foreground mt-1">
                    Optimizes for a specific return level while minimizing portfolio risk.
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                <strong className="text-foreground">Note:</strong> This implementation uses real Markowitz Mean-Variance Theory with historical data analysis, 
                covariance matrix calculations, and mathematical optimization algorithms. Results are for educational purposes and should not be considered as investment advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOptimizer;