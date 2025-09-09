import { Search, Bell } from "lucide-react";

export const Header = () => {
  return (
    <header className="h-20 flex items-center justify-between px-6 border-b border-border bg-background/50 backdrop-blur-xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome Back, Sifat</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            className="w-80 pl-10 pr-4 py-2 bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
          />
        </div>
        
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-smooth">
          <Bell className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></div>
        </button>
        
        <div className="flex items-center space-x-3">
          <span className="text-foreground font-medium">Sifat</span>
          <div className="w-10 h-10 bg-gradient-crypto rounded-full"></div>
        </div>
      </div>
    </header>
  );
};