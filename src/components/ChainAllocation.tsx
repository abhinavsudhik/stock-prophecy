const allocations = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    value: "$ 35,3B",
    percentage: "71,6%",
    color: "bg-crypto-bitcoin",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    value: "$ 22,3B",
    percentage: "71,6%",
    color: "bg-crypto-ethereum",
  },
  {
    name: "Shiba",
    symbol: "SHIB",
    value: "$ 23,3B",
    percentage: "71,6%",
    color: "bg-crypto-shiba",
  },
  {
    name: "Solana",
    symbol: "SOL",
    value: "$ 23,3B",
    percentage: "71,6%",
    color: "bg-crypto-solana",
  },
  {
    name: "Tether",
    symbol: "USDT",
    value: "$ 23,3B",
    percentage: "71,6%",
    color: "bg-crypto-tether",
  },
];

interface ChainAllocationProps {
  selectedStock?: string | null;
  movingAverageData?: {
    trend: 'bullish' | 'bearish' | 'neutral';
    currentPrice: number;
    ma50: number;
  } | null;
  rsiData?: {
    rsi: number;
    status: 'overbought' | 'oversold' | 'neutral';
  } | null;
  highLowData?: {
    status: 'overbought' | 'undervalued' | 'neutral';
    highest5Day: number;
    lowest5Day: number;
    currentPrice: number;
  } | null;
  dailyChange?: number | null;
}

export const ChainAllocation = ({ 
  selectedStock,
  movingAverageData,
  rsiData,
  highLowData,
  dailyChange 
}: ChainAllocationProps = {}) => {
  
  // Generate stock-specific warnings
  const getStockWarnings = () => {
    if (!selectedStock) {
      return [
        {
          type: 'info' as const,
          message: 'Select a stock from the sidebar to view specific warnings and risk analysis.'
        }
      ];
    }

    const warnings: Array<{type: 'high' | 'medium' | 'low' | 'info', message: string}> = [];
    
    // === RSI Analysis Warnings ===
    if (rsiData) {
      if (rsiData.status === 'overbought') {
        warnings.push({
          type: 'high',
          message: `📊 RSI Analysis: ${selectedStock} RSI at ${rsiData.rsi.toFixed(1)} indicates overbought conditions. Price may decline soon.`
        });
      } else if (rsiData.status === 'oversold') {
        warnings.push({
          type: 'medium',
          message: `📊 RSI Analysis: ${selectedStock} RSI at ${rsiData.rsi.toFixed(1)} indicates oversold conditions. Potential buying opportunity.`
        });
      } else {
        warnings.push({
          type: 'low',
          message: `📊 RSI Analysis: ${selectedStock} RSI at ${rsiData.rsi.toFixed(1)} is in neutral range. No strong overbought/oversold signals.`
        });
      }
      
      // Additional RSI warnings based on specific ranges
      if (rsiData.rsi > 80) {
        warnings.push({
          type: 'high',
          message: `📊 RSI Critical: Extremely overbought (${rsiData.rsi.toFixed(1)}). High probability of correction.`
        });
      } else if (rsiData.rsi < 20) {
        warnings.push({
          type: 'medium',
          message: `📊 RSI Opportunity: Extremely oversold (${rsiData.rsi.toFixed(1)}). Strong bounce candidate.`
        });
      }
    }
    
    // === Moving Average Analysis Warnings ===
    if (movingAverageData) {
      if (movingAverageData.trend === 'bullish') {
        warnings.push({
          type: 'low',
          message: `📈 Moving Average: ${selectedStock} showing bullish trend - price above key moving averages. Upward momentum confirmed.`
        });
      } else if (movingAverageData.trend === 'bearish') {
        warnings.push({
          type: 'high',
          message: `📉 Moving Average: ${selectedStock} in bearish trend - trading below key moving averages. Strong downward pressure.`
        });
      } else {
        warnings.push({
          type: 'medium',
          message: `📊 Moving Average: ${selectedStock} in sideways trend - mixed signals from moving averages. Watch for breakout direction.`
        });
      }
      
      // 50-day MA specific warnings
      if (movingAverageData.currentPrice < movingAverageData.ma50) {
        const percentBelow = ((movingAverageData.ma50 - movingAverageData.currentPrice) / movingAverageData.ma50) * 100;
        if (percentBelow > 10) {
          warnings.push({
            type: 'high',
            message: `📉 50-Day MA: ${selectedStock} is ${percentBelow.toFixed(1)}% below 50-day MA ($${movingAverageData.ma50.toFixed(2)}). Significant weakness.`
          });
        } else {
          warnings.push({
            type: 'medium',
            message: `📉 50-Day MA: ${selectedStock} below 50-day MA ($${movingAverageData.ma50.toFixed(2)}). Long-term trend is weak.`
          });
        }
      } else {
        const percentAbove = ((movingAverageData.currentPrice - movingAverageData.ma50) / movingAverageData.ma50) * 100;
        if (percentAbove > 15) {
          warnings.push({
            type: 'medium',
            message: `📈 50-Day MA: ${selectedStock} is ${percentAbove.toFixed(1)}% above 50-day MA. May be extended, watch for pullback.`
          });
        }
      }
    }
    
    // === High/Low Analysis Warnings ===
    if (highLowData) {
      // Support and Resistance warnings
      if (highLowData.status === 'overbought') {
        warnings.push({
          type: 'medium',
          message: `🔴 Support/Resistance: ${selectedStock} near 5-day high ($${highLowData.highest5Day.toFixed(2)}). May face strong resistance.`
        });
      } else if (highLowData.status === 'undervalued') {
        warnings.push({
          type: 'low',
          message: `🟢 Support/Resistance: ${selectedStock} near 5-day low ($${highLowData.lowest5Day.toFixed(2)}). Potential support level.`
        });
      } else {
        warnings.push({
          type: 'low',
          message: `📊 Support/Resistance: ${selectedStock} trading in middle of 5-day range. Watch for breakout signals.`
        });
      }
      
      // Volatility analysis
      const volatility = ((highLowData.highest5Day - highLowData.lowest5Day) / highLowData.lowest5Day) * 100;
      if (volatility > 15) {
        warnings.push({
          type: 'high',
          message: `⚡ Volatility Alert: ${selectedStock} showing very high volatility (${volatility.toFixed(1)}% range in 5 days). Extreme caution advised.`
        });
      } else if (volatility > 10) {
        warnings.push({
          type: 'medium',
          message: `⚡ Volatility Warning: ${selectedStock} showing high volatility (${volatility.toFixed(1)}% range in 5 days). Exercise caution.`
        });
      } else if (volatility < 3) {
        warnings.push({
          type: 'low',
          message: `📊 Low Volatility: ${selectedStock} showing low volatility (${volatility.toFixed(1)}% range). Potential breakout building.`
        });
      }
      
      // Price position analysis
      const rangePosition = ((highLowData.currentPrice - highLowData.lowest5Day) / (highLowData.highest5Day - highLowData.lowest5Day)) * 100;
      if (rangePosition > 90) {
        warnings.push({
          type: 'medium',
          message: `🔴 Range Position: ${selectedStock} at ${rangePosition.toFixed(0)}% of 5-day range. Very close to resistance.`
        });
      } else if (rangePosition < 10) {
        warnings.push({
          type: 'medium',
          message: `🟢 Range Position: ${selectedStock} at ${rangePosition.toFixed(0)}% of 5-day range. Very close to support.`
        });
      }
    }
    
    // === Daily Change Analysis ===
    if (dailyChange !== null && dailyChange !== undefined) {
      if (Math.abs(dailyChange) > 10) {
        warnings.push({
          type: 'high',
          message: `🚨 Daily Movement: ${selectedStock} moved ${dailyChange > 0 ? '+' : ''}${dailyChange.toFixed(2)}% today. Extreme volatility - high risk.`
        });
      } else if (Math.abs(dailyChange) > 5) {
        warnings.push({
          type: 'medium',
          message: `⚠️ Daily Movement: ${selectedStock} moved ${dailyChange > 0 ? '+' : ''}${dailyChange.toFixed(2)}% today. Significant movement - monitor closely.`
        });
      } else if (Math.abs(dailyChange) > 2) {
        warnings.push({
          type: 'low',
          message: `📊 Daily Movement: ${selectedStock} moved ${dailyChange > 0 ? '+' : ''}${dailyChange.toFixed(2)}% today. Normal volatility range.`
        });
      } else {
        warnings.push({
          type: 'low',
          message: `📊 Daily Movement: ${selectedStock} moved ${dailyChange > 0 ? '+' : ''}${dailyChange.toFixed(2)}% today. Low volatility session.`
        });
      }
    }
    
    // === Cross-Analysis Warnings ===
    // Combine multiple indicators for stronger signals
    if (rsiData && movingAverageData && highLowData) {
      // Triple confirmation bearish
      if (rsiData.status === 'overbought' && movingAverageData.trend === 'bearish' && highLowData.status === 'overbought') {
        warnings.push({
          type: 'high',
          message: `🚨 Triple Bearish Signal: RSI overbought + Bearish trend + Near resistance. Strong sell signal detected.`
        });
      }
      
      // Triple confirmation bullish
      if (rsiData.status === 'oversold' && movingAverageData.trend === 'bullish' && highLowData.status === 'undervalued') {
        warnings.push({
          type: 'low',
          message: `🟢 Triple Bullish Signal: RSI oversold + Bullish trend + Near support. Strong buy signal detected.`
        });
      }
      
      // Conflicting signals
      if ((rsiData.status === 'overbought' && movingAverageData.trend === 'bullish') || 
          (rsiData.status === 'oversold' && movingAverageData.trend === 'bearish')) {
        warnings.push({
          type: 'medium',
          message: `⚠️ Conflicting Signals: RSI and trend analysis showing opposite signals. Wait for clearer direction.`
        });
      }
    }
    
    // If somehow no warnings generated, add a default
    if (warnings.length === 0) {
      warnings.push({
        type: 'info',
        message: `📊 Analysis Pending: Insufficient data for ${selectedStock}. Please wait for technical indicators to load.`
      });
    }
    
    return warnings;
  };

  const warnings = getStockWarnings();

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border">
      <h3 className="text-xl font-bold text-foreground mb-6">WARNINGS</h3>
      
      <div className="space-y-3">
        {warnings.map((warning, index) => (
          <div 
            key={index}
            className={`p-3 rounded-lg border border-border/50 backdrop-blur-sm ${
              warning.type === 'high' ? 'bg-destructive/10 border-l-4 border-l-destructive/60' :
              warning.type === 'medium' ? 'bg-warning/10 border-l-4 border-l-warning/60' :
              warning.type === 'low' ? 'bg-success/10 border-l-4 border-l-success/60' :
              'bg-primary/10 border-l-4 border-l-primary/60'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-2">
                {warning.type === 'high' && '🚨'}
                {warning.type === 'medium' && '⚠️'}
                {warning.type === 'low' && '✅'}
                {warning.type === 'info' && 'ℹ️'}
              </div>
              <p className={`text-xs font-medium ${
                warning.type === 'high' ? 'text-destructive' :
                warning.type === 'medium' ? 'text-warning' :
                warning.type === 'low' ? 'text-success' :
                'text-primary'
              }`}>
                {warning.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};