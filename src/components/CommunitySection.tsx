import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Target, Clock } from "lucide-react";

interface Suggestion {
  id: string;
  type: 'buy' | 'sell' | 'hold' | 'watch' | 'risk';
  title: string;
  description: string;
  confidence: number;
  timeframe: 'short' | 'medium' | 'long';
  priority: 'high' | 'medium' | 'low';
}

interface CommunitySectionProps {
  selectedStock?: string | null;
  predictionData?: any[] | null;
  movingAverageData?: any | null;
  rsiData?: any | null;
  highLowData?: any | null;
  dailyChange?: number | null;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({
  selectedStock,
  predictionData,
  movingAverageData,
  rsiData,
  highLowData,
  dailyChange
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = () => {
    if (!selectedStock) {
      setSuggestions([]);
      return;
    }

    console.log('Generating suggestions for:', selectedStock);
    setLoading(true);

    const newSuggestions: Suggestion[] = [];

    // RSI-based suggestions
    if (rsiData?.status === 'oversold') {
      newSuggestions.push({
        id: 'rsi_oversold',
        type: 'buy',
        title: 'Consider Buying - Oversold',
        description: `RSI indicates oversold conditions. Good entry point for reversal.`,
        confidence: 0.7,
        timeframe: 'short',
        priority: 'medium'
      });
    } else if (rsiData?.status === 'overbought') {
      newSuggestions.push({
        id: 'rsi_overbought',
        type: 'sell',
        title: 'Take Profits - Overbought',
        description: `RSI suggests overbought conditions. Consider profit taking.`,
        confidence: 0.6,
        timeframe: 'short',
        priority: 'medium'
      });
    }

    // Moving average trend suggestions
    if (movingAverageData?.trend === 'bullish') {
      newSuggestions.push({
        id: 'ma_bullish',
        type: 'hold',
        title: 'Hold - Bullish Trend',
        description: 'Price above 50-day MA indicates bullish trend. Hold or add on dips.',
        confidence: 0.65,
        timeframe: 'medium',
        priority: 'medium'
      });
    } else if (movingAverageData?.trend === 'bearish') {
      newSuggestions.push({
        id: 'ma_bearish',
        type: 'watch',
        title: 'Monitor - Bearish Trend',
        description: 'Price below 50-day MA. Wait for trend reversal signals.',
        confidence: 0.6,
        timeframe: 'medium',
        priority: 'high'
      });
    }

    // Basic suggestion if no specific signals
    if (newSuggestions.length === 0) {
      newSuggestions.push({
        id: 'basic_analysis',
        type: 'watch',
        title: 'Monitor Market Conditions',
        description: `Keep watching ${selectedStock} for key technical signals and market developments.`,
        confidence: 0.5,
        timeframe: 'medium',
        priority: 'medium'
      });
    }

    // Always include risk management
    newSuggestions.push({
      id: 'risk_management',
      type: 'watch',
      title: 'Risk Management',
      description: 'Use proper position sizing and set stop-loss orders.',
      confidence: 0.9,
      timeframe: 'long',
      priority: 'high'
    });

    setSuggestions(newSuggestions.slice(0, 4));
    setTimeout(() => setLoading(false), 500);
  };

  useEffect(() => {
    generateSuggestions();
  }, [selectedStock, predictionData, movingAverageData, rsiData, highLowData, dailyChange]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'buy': return <TrendingUp className="w-3 h-3 text-green-300" />;
      case 'sell': return <TrendingDown className="w-3 h-3 text-red-300" />;
      case 'hold': return <Target className="w-3 h-3 text-blue-300" />;
      case 'watch': return <Clock className="w-3 h-3 text-yellow-300" />;
      case 'risk': return <AlertTriangle className="w-3 h-3 text-orange-300" />;
      default: return <Lightbulb className="w-3 h-3 text-gray-300" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'buy': return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'sell': return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'hold': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'watch': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'risk': return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  return (
    <div className="bg-gradient-crypto rounded-2xl p-6 text-primary-foreground">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-white" />
        <h3 className="text-xl font-bold">Suggestions</h3>
        {selectedStock && (
          <Badge variant="outline" className="ml-auto bg-white/10 text-white border-white/20">
            {selectedStock}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          <span className="ml-2 text-white/80 text-sm">Analyzing...</span>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-6 text-white/60">
          <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a stock to get AI suggestions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(suggestion.type)}
                  <h4 className="font-medium text-white text-sm">{suggestion.title}</h4>
                </div>
                <div className="flex gap-1">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getTypeColor(suggestion.type)}`}
                  >
                    {suggestion.type.toUpperCase()}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getPriorityColor(suggestion.priority)}`}
                  >
                    {suggestion.priority}
                  </Badge>
                </div>
              </div>
              
              <p className="text-xs text-white/80 mb-2 leading-relaxed">
                {suggestion.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-white/60">
                <div className="flex gap-3">
                  <span>Confidence: {(suggestion.confidence * 100).toFixed(0)}%</span>
                  <span>Term: {suggestion.timeframe}</span>
                </div>
                <div className="w-12 bg-white/20 rounded-full h-1">
                  <div 
                    className="bg-white h-1 rounded-full transition-all duration-300"
                    style={{ width: `${suggestion.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
