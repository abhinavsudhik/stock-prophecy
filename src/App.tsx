import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SafariErrorBoundary } from "@/components/SafariErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PortfolioOptimizer from "./pages/PortfolioOptimizer";
import MarketCorrelationNetwork from "./pages/MarketCorrelationNetwork";
import StockDNAAnalysis from "./pages/StockDNAAnalysis";

const queryClient = new QueryClient();

const App = () => (
  <SafariErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/portfolio-optimizer" element={<PortfolioOptimizer />} />
            <Route path="/correlation-network" element={<MarketCorrelationNetwork />} />
            <Route path="/stock-dna-analysis" element={<StockDNAAnalysis />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </SafariErrorBoundary>
);

export default App;
