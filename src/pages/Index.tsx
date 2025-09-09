import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { PortfolioChart } from "@/components/PortfolioChart";
import { ChainAllocation } from "@/components/ChainAllocation";
import { TokenList } from "@/components/TokenList";
import { CommunitySection } from "@/components/CommunitySection";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64">
          <Header />
          <div className="p-6 space-y-6">
            <PortfolioOverview />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <PortfolioChart />
                <TokenList />
              </div>
              <div className="space-y-6">
                <ChainAllocation />
                <CommunitySection />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;