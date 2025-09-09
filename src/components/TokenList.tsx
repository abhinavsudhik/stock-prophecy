const tokens = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    balance: "0,03321",
    value: "$2,340.32",
    color: "bg-crypto-bitcoin",
  },
  {
    name: "Ethereum",  
    symbol: "ETH",
    balance: "32,234",
    value: "$5,340.32",
    color: "bg-crypto-ethereum",
  },
];

export const TokenList = () => {
  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border">
      <h3 className="text-xl font-bold text-foreground mb-6">Tokens</h3>
      
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="pb-4 font-medium">Name</th>
              <th className="pb-4 font-medium">Balance</th>
              <th className="pb-4 font-medium">Total Value</th>
              <th className="pb-4 font-medium">Trade</th>
            </tr>
          </thead>
          <tbody className="space-y-4">
            {tokens.map((token) => (
              <tr key={token.symbol} className="border-t border-border">
                <td className="py-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${token.color} rounded-full flex items-center justify-center`}>
                      <span className="text-sm font-bold text-white">
                        {token.symbol.slice(0, 1)}
                      </span>
                    </div>
                    <span className="font-medium text-foreground">{token.name}</span>
                  </div>
                </td>
                <td className="py-4 text-foreground font-medium">{token.balance}</td>
                <td className="py-4 text-foreground font-medium">{token.value}</td>
                <td className="py-4">
                  <button className="px-4 py-2 bg-gradient-crypto text-primary-foreground rounded-lg font-medium hover:shadow-crypto transition-smooth">
                    Trade
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};