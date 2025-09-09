import { Wallet, TrendingUp, Percent } from "lucide-react";

const stats = [
  {
    title: "Total assets",
    value: "$ 87,743",
    icon: Wallet,
  },
  {
    title: "Total deposits",
    value: "$ 78,342",
    icon: TrendingUp,
  },
  {
    title: "APY",
    value: "+ 12.3%",
    icon: Percent,
    positive: true,
  },
];

export const PortfolioOverview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div
          key={stat.title}
          className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border hover:shadow-crypto transition-smooth"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
              <p className={`text-2xl font-bold mt-2 ${
                stat.positive ? 'text-success' : 'text-foreground'
              }`}>
                {stat.value}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-crypto rounded-xl flex items-center justify-center">
              <stat.icon className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};