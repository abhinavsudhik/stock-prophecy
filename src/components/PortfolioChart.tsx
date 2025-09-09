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
      
      <div className="h-64 relative mb-4">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Line graph */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {/* Create path for line */}
          <path
            d={`M ${chartData.map((data, index) => {
              const x = (index / (chartData.length - 1)) * 350 + 25;
              const y = 180 - ((data.value / maxValue) * 140);
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}`}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Area under the line */}
          <path
            d={`M ${chartData.map((data, index) => {
              const x = (index / (chartData.length - 1)) * 350 + 25;
              const y = 180 - ((data.value / maxValue) * 140);
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')} L ${25 + 350} 180 L 25 180 Z`}
            fill="url(#areaGradient)"
          />
          
          {/* Data points */}
          {chartData.map((data, index) => {
            const x = (index / (chartData.length - 1)) * 350 + 25;
            const y = 180 - ((data.value / maxValue) * 140);
            return (
              <g key={data.date}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--background))"
                  strokeWidth="2"
                  className="hover:r-6 transition-all cursor-pointer"
                />
                {index === 6 && (
                  <g>
                    <rect
                      x={x - 18}
                      y={y - 25}
                      width="36"
                      height="20"
                      rx="4"
                      fill="hsl(var(--primary))"
                    />
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      className="text-xs font-medium fill-primary-foreground"
                    >
                      $440
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
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