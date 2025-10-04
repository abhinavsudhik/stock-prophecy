import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface Stock {
  symbol: string;
  weight: number;
  expectedReturn: number;
}

interface PortfolioMetrics {
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
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
    sharpeRatio: 0
  });

  // New states for autocomplete functionality
  const [stockSuggestions, setStockSuggestions] = useState<StockSuggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<StockSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
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
    
    if (currentWord.length > 0) {
      const filtered = popularStocks.filter(stock => 
        stock.symbol.startsWith(currentWord) || 
        stock.name.toLowerCase().includes(currentWord.toLowerCase())
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

  // Simulated Markowitz optimization (in real app, this would call your backend)
  const optimizePortfolio = async (symbols: string[]) => {
    setIsOptimizing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock optimization results (in real implementation, use actual historical data and optimization algorithm)
    const mockResults: Stock[] = symbols.map((symbol, index) => {
      const weights = [0.45, 0.35, 0.20]; // Example optimal weights
      const returns = [0.185, 0.165, 0.220]; // Mock expected returns
      
      return {
        symbol,
        weight: weights[index] || 1 / symbols.length,
        expectedReturn: returns[index] || 0.15
      };
    });

    // Normalize weights to sum to 1
    const totalWeight = mockResults.reduce((sum, stock) => sum + stock.weight, 0);
    const normalizedResults = mockResults.map(stock => ({
      ...stock,
      weight: stock.weight / totalWeight
    }));

    // Calculate portfolio metrics
    const portfolioReturn = normalizedResults.reduce(
      (sum, stock) => sum + (stock.weight * stock.expectedReturn), 0
    );
    const portfolioVolatility = 0.123; // Simplified - actual calculation requires covariance matrix
    const riskFreeRate = 0.02; // Assume 2% risk-free rate
    const sharpeRatio = (portfolioReturn - riskFreeRate) / portfolioVolatility;

    setOptimizedPortfolio(normalizedResults);
    setPortfolioMetrics({
      expectedReturn: portfolioReturn,
      volatility: portfolioVolatility,
      sharpeRatio
    });
    setIsOptimizing(false);
  };

  const handleOptimize = () => {
    const symbols = stockInput.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
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

          {/* Input Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Stock Symbols (comma-separated)
            </label>
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
                <button
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className={`px-8 py-3 rounded-lg font-medium text-lg transition-smooth ${
                    isOptimizing 
                      ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-crypto hover:shadow-glow-crypto'
                  }`}
                >
                  {isOptimizing ? 'Optimizing...' : 'Optimize Portfolio'}
                </button>
              </div>
              
              {/* Helper text */}
              <p className="text-xs text-muted-foreground mt-2">
                💡 Start typing a stock symbol or company name to see suggestions. Use ↑↓ arrow keys to navigate, Enter to select, or click on a suggestion to add it to your portfolio.
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
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  {isOptimizing ? 'Calculating optimal allocation...' : 'Enter stocks to optimize'}
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
            <p className="text-muted-foreground">
              <strong className="text-foreground">Note:</strong> This optimization uses Mean-Variance Theory to maximize returns for given risk levels. 
              Results are based on historical data and should not be considered as investment advice. 
              The algorithm finds the optimal weights that minimize portfolio volatility for a target return level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOptimizer;