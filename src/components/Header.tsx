import { Search, Bell, TrendingUp, Share2, Dna } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  
  const handleOptimizePortfolio = () => {
    navigate('/portfolio-optimizer');
  };

  const handleCorrelationNetwork = () => {
    navigate('/correlation-network');
  };

  const handleStockDNAAnalysis = () => {
    navigate('/stock-dna-analysis');
  };

  return (
    <header className="px-6 py-4 border-b border-border bg-background/50 backdrop-blur-xl">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-foreground">Welcome</h1>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleOptimizePortfolio}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm sm:text-base w-fit"
          >
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden xs:inline">Smart Portfolio Optimizer</span>
            <span className="xs:hidden">Optimizer</span>
          </button>
          <button
            onClick={handleCorrelationNetwork}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm sm:text-base w-fit"
          >
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden xs:inline">🌐 Stock Correlation Map</span>
            <span className="xs:hidden">Correlation Map</span>
          </button>
          <button
            onClick={handleStockDNAAnalysis}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm sm:text-base w-fit"
          >
            <Dna className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden xs:inline">Stock Analysis</span>
            <span className="xs:hidden">Analysis</span>
          </button>
        </div>
      </div>
    </header>
  );
};