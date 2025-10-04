import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { PortfolioChart } from "@/components/PortfolioChart";
import { ChainAllocation } from "@/components/ChainAllocation";
import { TokenList } from "@/components/TokenList";
import { CommunitySection } from "@/components/CommunitySection";
import { SafariNotification } from "@/components/SafariNotification";
import { PredictionData } from "@/services/geminiService";
import { logSafariDebugInfo, testAPIConnectivity } from "@/utils/safariDebug";
import { isSafari } from "@/utils/fetchPolyfill";

import React, { useEffect, useState } from "react";

interface MovingAverageData {
  trend: 'bullish' | 'bearish' | 'neutral';
  currentPrice: number;
  ma50: number;
}

interface RSIData {
  rsi: number;
  status: 'overbought' | 'oversold' | 'neutral';
}

interface HighLowData {
  status: 'overbought' | 'undervalued' | 'neutral';
  highest5Day: number;
  lowest5Day: number;
  currentPrice: number;
}

const Index = () => {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [dailyChange, setDailyChange] = useState<number | null>(null);
  const [movingAverageData, setMovingAverageData] = useState<MovingAverageData | null>(null);
  const [rsiData, setRsiData] = useState<RSIData | null>(null);
  const [highLowData, setHighLowData] = useState<HighLowData | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionData[] | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      // Extract symbol from "Apple Inc. (AAPL)" => "AAPL"
      if (e.detail) {
        const match = e.detail.match(/\(([^)]+)\)$/);
        setSelectedStock(match ? match[1] : null);
      }
    };
    window.addEventListener("stock-select", handler);
    
    // Safari debugging - only run on Safari
    if (isSafari()) {
      console.log('🦁 Safari detected - running compatibility checks...');
      logSafariDebugInfo();
      
      // Test API connectivity on Safari
      testAPIConnectivity(window.location.origin).then(result => {
        if (result.success) {
          console.log('✅ API connectivity test passed:', result);
        } else {
          console.error('❌ API connectivity test failed:', result);
        }
      });
    }
    
    return () => window.removeEventListener("stock-select", handler);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-bg">
      <SafariNotification />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64">
          <Header />
          <div className="p-6 space-y-6">
            <PortfolioOverview 
              dailyChange={dailyChange} 
              selectedStock={selectedStock}
              onAnalysisDataChange={(movingAvg, rsi, highLow) => {
                setMovingAverageData(movingAvg);
                setRsiData(rsi);
                setHighLowData(highLow);
              }}
            />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <PortfolioChart 
                  selectedStock={selectedStock} 
                  onDailyChange={setDailyChange}
                  onPredictionChange={setPredictionData}
                />
                <TokenList predictionData={predictionData} />
              </div>
              <div className="space-y-6">
                <ChainAllocation 
                  selectedStock={selectedStock}
                  movingAverageData={movingAverageData}
                  rsiData={rsiData}
                  highLowData={highLowData}
                  dailyChange={dailyChange}
                />
                <CommunitySection
                  selectedStock={selectedStock}
                  predictionData={predictionData}
                  movingAverageData={movingAverageData}
                  rsiData={rsiData}
                  highLowData={highLowData}
                  dailyChange={dailyChange}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;