import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Button } from "./ui/button";
import { TrendingUp, Loader2 } from "lucide-react";
import { generateStockPrediction, type PredictionData, type StockDataPoint } from "../services/geminiService";

export const PortfolioChart: React.FC<{ 
  selectedStock: string | null, 
  onDailyChange?: (change: number | null) => void,
  onPredictionChange?: (data: PredictionData[] | null) => void 
}> = ({ selectedStock, onDailyChange, onPredictionChange }) => {
  // Determine line color based on trend
  const [period, setPeriod] = useState<string>("1M");
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [combinedData, setCombinedData] = useState<any[]>([]);
  const getLineColor = () => {
    if (!chartData || chartData.length < 2) return '#ec4899';
    const first = chartData[0]?.close;
    const last = chartData[chartData.length - 1]?.close;
    if (typeof first !== 'number' || typeof last !== 'number') return '#ec4899';
    if (last > first) return '#22c55e';
    if (last < first) return '#ef4444';
    return '#ec4899';
  }

  const generatePredictions = async () => {
    if (!selectedStock || !chartData.length) return;
    
    setLoadingPredictions(true);
    try {
      const stockData: StockDataPoint[] = chartData.map(item => ({
        date: item.date,
        close: item.close,
        high: item.high,
        low: item.low,
        open: item.open,
        volume: item.volume
      }));
      
      const predictionData = await generateStockPrediction(selectedStock, stockData);
      setPredictions(predictionData);
      setShowPredictions(true);
      
      // Pass all prediction data to parent
      if (onPredictionChange) {
        onPredictionChange(predictionData);
      }
    } catch (error) {
      console.error("Failed to generate predictions:", error);
      if (onPredictionChange) {
        onPredictionChange(null);
      }
    } finally {
      setLoadingPredictions(false);
    }
  };

  // Combine historical data with predictions for chart display
  useEffect(() => {
    let combined = [...chartData];
    
    if (showPredictions && predictions.length > 0 && chartData.length > 0) {
      // Get the last historical data point to connect predictions
      const lastHistoricalPoint = chartData[chartData.length - 1];
      
      // Add a connecting point (duplicate last historical point but marked as prediction start)
      const connectingPoint = {
        date: lastHistoricalPoint.date,
        close: lastHistoricalPoint.close,
        isPrediction: true,
        isConnector: true,
        confidence: 1
      };
      
      // Create prediction data points
      const predictionChartData = predictions.map(pred => ({
        date: pred.date,
        close: pred.predictedClose,
        isPrediction: true,
        confidence: pred.confidence
      }));
      
      // Combine: historical + connecting point + predictions
      combined = [...chartData, connectingPoint, ...predictionChartData];
    }
    
    setCombinedData(combined);
  }, [chartData, predictions, showPredictions]);

  useEffect(() => {
    if (!selectedStock) return;
    setLoading(true);
    setShowPredictions(false);
    setPredictions([]);
    
    // Reset prediction data when stock changes
    if (onPredictionChange) {
      onPredictionChange(null);
    }
    
    fetch(`http://localhost:4000/api/stock-data?symbol=${selectedStock}&period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        setChartData(data);
        setLoading(false);
        // Calculate daily change for 1D period
        if (onDailyChange) {
          let change: number | null = null;
          if (period === '1D' && data.length >= 2) {
            const prev = data[0].close;
            const curr = data[data.length - 1].close;
            change = ((curr - prev) / prev) * 100;
          } else if (data.length >= 2) {
            // For other periods, show last day's change
            const prev = data[data.length - 2].close;
            const curr = data[data.length - 1].close;
            change = ((curr - prev) / prev) * 100;
          }
          onDailyChange(change);
        }
      })
      .catch(() => {
        setChartData([]);
        setLoading(false);
        if (onDailyChange) onDailyChange(null);
      });
  }, [selectedStock, period, onDailyChange]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Stock Chart</CardTitle>
            {showPredictions && predictions.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Showing 7-day AI predictions powered by Gemini
              </p>
            )}
          </div>
          {selectedStock && chartData.length > 0 && (
            <Button
              onClick={generatePredictions}
              disabled={loadingPredictions}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              {loadingPredictions ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Predict Next 7 Days
                </>
              )}
            </Button>
          )}
        </div>
        <div style={{ marginTop: 12 }}>
          <span className="font-medium mr-2">Time Period:</span>
          {['1D', '1W', '1M', '3M', '6M', '1Y'].map(p => (
            <button
              key={p}
              className={`px-3 py-1 rounded-full mx-1 ${period === p ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {!selectedStock ? (
          <div className="text-center py-8 text-muted-foreground">Select a stock from the sidebar.</div>
        ) : loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No data found for this stock.</div>
        ) : (
          <div>
            <ChartContainer config={{}}>
              <LineChart
                width={700}
                height={300}
                data={combinedData}
                margin={{
                  top: 24,
                  left: 24,
                  right: 24,
                }}
              >
                <CartesianGrid vertical={false} />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
                          <p className="text-sm">
                            {data.isPrediction && !data.isConnector ? 'Predicted' : 'Actual'} Price: ${typeof payload[0].value === 'number' ? payload[0].value.toFixed(2) : payload[0].value}
                          </p>
                          {data.isPrediction && !data.isConnector && data.confidence && (
                            <p className="text-xs text-muted-foreground">
                              Confidence: {(data.confidence * 100).toFixed(0)}%
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Single continuous line for all data */}
                <Line
                  dataKey="close"
                  type="natural"
                  stroke={getLineColor()}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  connectNulls={true}
                  data={combinedData}
                />
                <XAxis dataKey="date" tickFormatter={date => new Date(date).toLocaleDateString()} />
              </LineChart>
            </ChartContainer>
            {showPredictions && predictions.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-4 w-4 mr-2 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    AI-Generated Predictions
                  </span>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                  The dashed yellow line shows 7-day price predictions generated by Gemini AI based on historical data and market patterns.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-medium">Next Day Prediction:</span> ${predictions[0]?.predictedClose.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-medium">7-Day Range:</span> ${Math.min(...predictions.map(p => p.predictedClose)).toFixed(2)} - ${Math.max(...predictions.map(p => p.predictedClose)).toFixed(2)}
                  </div>
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 italic">
                  ⚠️ Predictions are for educational purposes only and should not be used as financial advice.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
