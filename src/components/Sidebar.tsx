import { LayoutGrid, TrendingUp, CreditCard, Layers, Settings, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", icon: LayoutGrid, active: true },
  { name: "Trade", icon: TrendingUp, active: false },
  { name: "Deposits", icon: CreditCard, active: false },
  { name: "Protocols", icon: Layers, active: false },
  { name: "Settings", icon: Settings, active: false },
  { name: "Profile", icon: User, active: false },
];

export const Sidebar = () => {
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
      
      <nav className="px-4 space-y-2">
        {navigation.map((item) => (
          <button
            key={item.name}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-smooth",
              item.active
                ? "bg-gradient-crypto text-primary-foreground shadow-crypto"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>
      
      <div className="absolute bottom-6 left-4 right-4">
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
};