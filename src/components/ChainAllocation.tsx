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

export const ChainAllocation = () => {
  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border">
      <h3 className="text-xl font-bold text-foreground mb-6">Chain Allocation</h3>
      
      <div className="space-y-4">
        {allocations.map((allocation) => (
          <div key={allocation.symbol} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${allocation.color} rounded-full flex items-center justify-center`}>
                <span className="text-xs font-bold text-white">
                  {allocation.symbol.slice(0, 1)}
                </span>
              </div>
              <span className="font-medium text-foreground">{allocation.name}</span>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-foreground">{allocation.value}</p>
              <p className="text-sm text-muted-foreground">{allocation.percentage}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-6 py-3 bg-muted hover:bg-muted/80 rounded-xl text-foreground font-medium transition-smooth">
        View All
      </button>
    </div>
  );
};