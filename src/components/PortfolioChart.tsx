import { TrendingUp, BarChart3 } from "lucide-react";

const chartData = [
  { date: "17 Mar", value: 380 },
  { date: "18 Mar", value: 520 },
  { date: "19 Mar", value: 480 },
  { date: "20 Mar", value: 460 },
  { date: "21 Mar", value: 420 },
  { date: "22 Mar", value: 490 },
  { date: "23 Mar", value: 380 },
  { date: "24 Mar", value: 340 },
  { date: "25 Mar", value: 280 },
  { date: "26 Mar", value: 240 },
];

const timeframes = ["1H", "1D", "3D", "1M", "1Y"];

export const PortfolioChart = () => {
  const maxValue = Math.max(...chartData.map(d => d.value));
  
  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-foreground">Portfolios performance</h3>
          <div className="flex items-center space-x-2 bg-muted rounded-lg p-1">
            <div className="w-6 h-6 bg-crypto-ethereum rounded-full"></div>
            <span className="text-sm font-medium text-foreground">ETH</span>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-smooth ${
                timeframe === "3D"
                  ? "bg-gradient-crypto text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {timeframe}
            </button>
          ))}
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-smooth">
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="h-64 flex items-end justify-between space-x-2 mb-4">
        {chartData.map((data, index) => (
          <div key={data.date} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-gradient-chart rounded-t-lg relative transition-smooth hover:opacity-80"
              style={{
                height: `${(data.value / maxValue) * 200}px`,
              }}
            >
              {index === 6 && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                  $440
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        {chartData.map((data, index) => (
          <span key={data.date} className={index % 2 === 0 ? '' : 'opacity-60'}>
            {data.date}
          </span>
        ))}
      </div>
    </div>
  );
};