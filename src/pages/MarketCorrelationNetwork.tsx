import React, { useEffect, useState, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StockNode {
  id: string;
  name: string;
  symbol: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  sector: string;
}

interface StockLink {
  source: string;
  target: string;
  correlation: number;
  weight: number;
}

interface CorrelationData {
  [key: string]: {
    [key: string]: number;
  };
}

const MarketCorrelationNetwork = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<StockNode[]>([]);
  const [links, setLinks] = useState<StockLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState("");
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Sample stock data with sectors
  const stockSymbols = [
    { symbol: "AAPL", name: "Apple Inc.", sector: "technology" },
    { symbol: "MSFT", name: "Microsoft Corp.", sector: "technology" },
    { symbol: "GOOGL", name: "Alphabet Inc.", sector: "technology" },
    { symbol: "AMZN", name: "Amazon.com Inc.", sector: "technology" },
    { symbol: "META", name: "Meta Platforms Inc.", sector: "technology" },
    { symbol: "NVDA", name: "NVIDIA Corp.", sector: "technology" },
    { symbol: "TSLA", name: "Tesla Inc.", sector: "automotive" },
    { symbol: "JPM", name: "JPMorgan Chase", sector: "financial" },
    { symbol: "JNJ", name: "Johnson & Johnson", sector: "healthcare" },
    { symbol: "V", name: "Visa Inc.", sector: "financial" }
  ];

  // Generate mock correlation data
  const generateCorrelationMatrix = (symbols: typeof stockSymbols): CorrelationData => {
    const correlationMatrix: CorrelationData = {};
    
    symbols.forEach(stock1 => {
      correlationMatrix[stock1.symbol] = {};
      symbols.forEach(stock2 => {
        if (stock1.symbol === stock2.symbol) {
          correlationMatrix[stock1.symbol][stock2.symbol] = 1;
        } else {
          // Generate correlation based on sector similarity
          let baseCorrelation = Math.random() * 0.4 + 0.1; // 0.1 to 0.5
          
          // Same sector stocks have higher correlation
          if (stock1.sector === stock2.sector) {
            baseCorrelation = Math.random() * 0.3 + 0.6; // 0.6 to 0.9
          }
          
          correlationMatrix[stock1.symbol][stock2.symbol] = baseCorrelation;
        }
      });
    });
    
    return correlationMatrix;
  };

  // Simple MST using Kruskal's algorithm
  const buildMST = (symbols: typeof stockSymbols, correlationMatrix: CorrelationData): StockLink[] => {
    const edges: { source: string; target: string; weight: number; correlation: number }[] = [];
    
    // Create all possible edges
    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        const correlation = correlationMatrix[symbols[i].symbol][symbols[j].symbol];
        const weight = 1 - correlation; // Invert for MST (we want high correlation = low weight)
        edges.push({
          source: symbols[i].symbol,
          target: symbols[j].symbol,
          weight,
          correlation
        });
      }
    }
    
    // Sort edges by weight
    edges.sort((a, b) => a.weight - b.weight);
    
    // Union-Find for cycle detection
    const parent: { [key: string]: string } = {};
    const rank: { [key: string]: number } = {};
    
    symbols.forEach(stock => {
      parent[stock.symbol] = stock.symbol;
      rank[stock.symbol] = 0;
    });
    
    const find = (x: string): string => {
      if (parent[x] !== x) {
        parent[x] = find(parent[x]);
      }
      return parent[x];
    };
    
    const union = (x: string, y: string): boolean => {
      const rootX = find(x);
      const rootY = find(y);
      
      if (rootX === rootY) return false;
      
      if (rank[rootX] < rank[rootY]) {
        parent[rootX] = rootY;
      } else if (rank[rootX] > rank[rootY]) {
        parent[rootY] = rootX;
      } else {
        parent[rootY] = rootX;
        rank[rootX]++;
      }
      
      return true;
    };
    
    // Build MST
    const mstEdges: StockLink[] = [];
    for (const edge of edges) {
      if (union(edge.source, edge.target)) {
        mstEdges.push({
          source: edge.source,
          target: edge.target,
          correlation: edge.correlation,
          weight: edge.weight
        });
        
        if (mstEdges.length === symbols.length - 1) break;
      }
    }
    
    return mstEdges;
  };

  // Generate insights
  const generateInsights = (links: StockLink[]): string => {
    const techCorrelations = links.filter(link => {
      const techStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA"];
      return techStocks.includes(link.source) && techStocks.includes(link.target) && link.correlation > 0.7;
    });
    
    if (techCorrelations.length > 2) {
      return "Strong Tech Cluster Detected: Technology stocks show high correlation (>70%), suggesting they move together as a unified sector during market changes.";
    }
    
    const highCorrelations = links.filter(link => link.correlation > 0.8);
    if (highCorrelations.length > 0) {
      return "High Correlation Pairs Found: Some stocks show very strong correlation (>80%), indicating synchronized market behavior.";
    }
    
    return "Market correlations reveal interconnected stock movements. Hover over nodes to explore individual stock relationships and sector clustering.";
  };

  // Initialize nodes with random positions
  const initializeNodes = (): StockNode[] => {
    const width = 700;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;
    
    return stockSymbols.map((stock, index) => {
      const angle = (index / stockSymbols.length) * 2 * Math.PI;
      const radius = 150 + Math.random() * 50;
      
      return {
        id: stock.symbol,
        name: stock.name,
        symbol: stock.symbol,
        sector: stock.sector,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0
      };
    });
  };

  // Simple force simulation
  const runSimulation = (nodes: StockNode[], links: StockLink[]) => {
    const width = 700;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Apply forces
    const newNodes = nodes.map(node => {
      let fx = 0, fy = 0;
      
      // Center force
      fx += (centerX - node.x) * 0.001;
      fy += (centerY - node.y) * 0.001;
      
      // Repulsion force between nodes
      nodes.forEach(other => {
        if (other.id !== node.id) {
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0) {
            const force = 200 / (distance * distance);
            fx += (dx / distance) * force;
            fy += (dy / distance) * force;
          }
        }
      });
      
      // Attraction force for connected nodes
      links.forEach(link => {
        let target: StockNode | undefined;
        if (link.source === node.id) {
          target = nodes.find(n => n.id === link.target);
        } else if (link.target === node.id) {
          target = nodes.find(n => n.id === link.source);
        }
        
        if (target) {
          const dx = target.x - node.x;
          const dy = target.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const idealDistance = 80 + (1 - link.correlation) * 40;
          
          if (distance > idealDistance) {
            const force = link.correlation * 0.05;
            fx += (dx / distance) * force;
            fy += (dy / distance) * force;
          }
        }
      });
      
      // Update velocity and position
      const damping = 0.9;
      const newVx = (node.vx + fx) * damping;
      const newVy = (node.vy + fy) * damping;
      
      let newX = node.x + newVx;
      let newY = node.y + newVy;
      
      // Boundary constraints
      const margin = 30;
      newX = Math.max(margin, Math.min(width - margin, newX));
      newY = Math.max(margin, Math.min(height - margin, newY));
      
      return {
        ...node,
        x: newX,
        y: newY,
        vx: newVx,
        vy: newVy
      };
    });
    
    return newNodes;
  };

  useEffect(() => {
    const correlationMatrix = generateCorrelationMatrix(stockSymbols);
    const mstLinks = buildMST(stockSymbols, correlationMatrix);
    const initialNodes = initializeNodes();
    
    setNodes(initialNodes);
    setLinks(mstLinks);
    setInsight(generateInsights(mstLinks));
    setLoading(false);
    
    // Run simulation
    let animationId: number;
    let currentNodes = initialNodes;
    
    const animate = () => {
      currentNodes = runSimulation(currentNodes, mstLinks);
      setNodes([...currentNodes]);
      animationId = requestAnimationFrame(animate);
    };
    
    const timeoutId = setTimeout(() => {
      animate();
    }, 1000);
    
    // Stop animation after some time
    const stopTimeout = setTimeout(() => {
      cancelAnimationFrame(animationId);
    }, 10000);
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(stopTimeout);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const getSectorColor = (sector: string): string => {
    const colors = {
      technology: "#8b5cf6",
      financial: "#06b6d4",
      healthcare: "#10b981",
      automotive: "#f59e0b"
    };
    return colors[sector as keyof typeof colors] || "#64748b";
  };

  const getConnectedNodes = (nodeId: string): Set<string> => {
    const connected = new Set([nodeId]);
    links.forEach(link => {
      if (link.source === nodeId) connected.add(link.target);
      if (link.target === nodeId) connected.add(link.source);
    });
    return connected;
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64">
          <Header />
          <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </Button>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🌐</span>
                  <h1 className="text-2xl font-bold text-foreground">Stock Correlation Map</h1>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Network Visualization */}
              <div className="lg:col-span-3">
                <Card className="h-[700px]">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span>Market Correlation Network</span>
                      {loading && (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {loading ? (
                      <div className="flex items-center justify-center h-[600px]">
                        <div className="text-center space-y-4">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="text-muted-foreground">Calculating correlations and building network...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative" ref={containerRef}>
                        <svg
                          width="700"
                          height="500"
                          className="border rounded-lg bg-card/30"
                          style={{ background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.05) 0%, transparent 70%)' }}
                        >
                          {/* Links */}
                          {links.map((link, index) => {
                            const sourceNode = nodes.find(n => n.id === link.source);
                            const targetNode = nodes.find(n => n.id === link.target);
                            
                            if (!sourceNode || !targetNode) return null;
                            
                            const isHighlighted = hoveredNode && 
                              (getConnectedNodes(hoveredNode).has(link.source) || 
                               getConnectedNodes(hoveredNode).has(link.target));
                            
                            return (
                              <line
                                key={index}
                                x1={sourceNode.x}
                                y1={sourceNode.y}
                                x2={targetNode.x}
                                y2={targetNode.y}
                                stroke={isHighlighted ? "#8b5cf6" : "#64748b"}
                                strokeWidth={Math.sqrt(link.correlation * 8)}
                                strokeOpacity={isHighlighted ? 0.8 : hoveredNode ? 0.1 : 0.6}
                                className="transition-all duration-300"
                              />
                            );
                          })}
                          
                          {/* Nodes */}
                          {nodes.map(node => {
                            const isConnected = hoveredNode ? getConnectedNodes(hoveredNode).has(node.id) : true;
                            const isHovered = hoveredNode === node.id;
                            
                            return (
                              <g key={node.id}>
                                <circle
                                  cx={node.x}
                                  cy={node.y}
                                  r={isHovered ? 25 : 20}
                                  fill={getSectorColor(node.sector)}
                                  stroke="#fff"
                                  strokeWidth={2}
                                  opacity={isConnected ? 1 : 0.3}
                                  className="transition-all duration-300 cursor-pointer"
                                  onMouseEnter={() => {
                                    setHoveredNode(node.id);
                                    setSelectedStock(node.name);
                                  }}
                                  onMouseLeave={() => {
                                    setHoveredNode(null);
                                    setSelectedStock(null);
                                  }}
                                />
                                <text
                                  x={node.x}
                                  y={node.y}
                                  textAnchor="middle"
                                  dy="0.35em"
                                  fontSize="12"
                                  fontWeight="bold"
                                  fill="white"
                                  style={{ pointerEvents: 'none' }}
                                  opacity={isConnected ? 1 : 0.3}
                                  className="transition-all duration-300"
                                >
                                  {node.symbol}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                        
                        {selectedStock && (
                          <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border">
                            <p className="font-semibold text-sm">{selectedStock}</p>
                            <p className="text-xs text-muted-foreground">Connected stocks highlighted</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Insights Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Info className="w-5 h-5 text-blue-500" />
                      <span>Market Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {insight}
                    </p>
                  </CardContent>
                </Card>

                {/* Legend Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Legend</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                        <span className="text-sm">Technology</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full bg-cyan-500"></div>
                        <span className="text-sm">Financial</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                        <span className="text-sm">Healthcare</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                        <span className="text-sm">Automotive</span>
                      </div>
                      <div className="border-t pt-3">
                        <p className="text-xs text-muted-foreground">
                          Line thickness represents correlation strength. 
                          Network uses minimum spanning tree for optimal clustering.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Instructions Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>How to Use</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Hover over nodes to highlight connections</p>
                      <p>• Watch the network self-organize</p>
                      <p>• Connected stocks show correlation</p>
                      <p>• Thicker lines = stronger correlation</p>
                      <p>• Colors represent different sectors</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MarketCorrelationNetwork;