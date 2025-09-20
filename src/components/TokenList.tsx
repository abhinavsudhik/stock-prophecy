import { PredictionData } from "@/services/geminiService";

interface TokenListProps {
  predictionData?: PredictionData[] | null;
}

export const TokenList = ({ predictionData }: TokenListProps) => {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-500';
      case 'bearish': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return '📈';
      case 'bearish': return '📉';
      default: return '📊';
    }
  };

  const calculateTrend = (currentPrice: number, previousPrice?: number): 'bullish' | 'bearish' | 'neutral' => {
    if (!previousPrice) return 'neutral';
    const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;
    if (changePercent > 1) return 'bullish';
    if (changePercent < -1) return 'bearish';
    return 'neutral';
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border">
      <h3 className="text-xl font-bold text-foreground mb-6">Predicted Trends</h3>
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="pb-4 font-medium">Date</th>
              <th className="pb-4 font-medium">Trends</th>
            </tr>
          </thead>
          <tbody>
            {predictionData && predictionData.map((prediction, index) => {
              const previousPrice = index > 0 ? predictionData[index - 1].predictedClose : undefined;
              const trend = calculateTrend(prediction.predictedClose, previousPrice);
              
              return (
                <tr key={prediction.date} className="border-b border-border/50">
                  <td className="py-3 text-sm text-foreground">
                    {new Date(prediction.date).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <div className={`text-sm font-medium ${getTrendColor(trend)} flex items-center gap-1`}>
                      <span>{getTrendIcon(trend)}</span>
                      <span className="capitalize">{trend}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ${prediction.predictedClose.toFixed(2)}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};