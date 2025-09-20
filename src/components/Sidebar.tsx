import { LayoutGrid, TrendingUp, CreditCard, Layers, Settings, User, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  // Placeholder, will be replaced by stocks
];

export const Sidebar = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [stocks, setStocks] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchStocks() {
      try {
        // Use only valid, active symbols
        setStocks([
          "Apple Inc. (AAPL)",
          "Microsoft Corp. (MSFT)",
          "Amazon.com Inc. (AMZN)",
          "Alphabet Inc. (GOOGL)",
          "Meta Platforms Inc. (META)",
          "NVIDIA Corp. (NVDA)",
          "Tesla Inc. (TSLA)",
          "JPMorgan Chase & Co. (JPM)",
          "Johnson & Johnson (JNJ)"
        ]);
      } catch (err) {
        setStocks(["Error loading stocks"]);
      }
    }
    fetchStocks();
  }, []);
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-card/50 backdrop-blur-xl border-r border-border">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-crypto rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-foreground rounded-full"></div>
          </div>
          <span className="text-xl font-bold text-foreground">Cryptory</span>
        </div>
      </div>
      <div className="px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground text-sm"
          />
        </div>
      </div>
      <nav
        className="px-4 space-y-2 overflow-y-auto"
        style={{
          maxHeight: 'calc(100vh - 180px)',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE 10+
        }}
      >
        <style>{`
          nav::-webkit-scrollbar { display: none; }
        `}</style>
        {stocks
          .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((name, idx) => (
          <button
            key={name}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-smooth",
              activeIndex !== null && idx === activeIndex
                ? "bg-gradient-crypto text-primary-foreground shadow-crypto"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            onClick={() => {
              setActiveIndex(idx);
              window.dispatchEvent(new CustomEvent("stock-select", { detail: name }));
            }}
          >
            <span className="font-medium">{name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
