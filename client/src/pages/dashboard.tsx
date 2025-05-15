import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";

import Sidebar from "@/components/sidebar";
import OverviewCards from "@/components/overview-cards";
import SentimentChart from "@/components/sentiment-chart";
import TwitterFeed from "@/components/twitter-feed";
import CoinStatus from "@/components/coin-status";
import RecentTrades from "@/components/recent-trades";
import TradingConfig from "@/components/trading-config";

export default function Dashboard() {
  const [selectedCoin, setSelectedCoin] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  
  // WebSocket for real-time updates
  useWebSocket({
    onMessage: (data) => {
      if (data.type === "new_tweet") {
        // Will automatically refresh tweet data via query invalidation in server routes
        queryClient.invalidateQueries({ queryKey: ['/api/tweets'] });
        toast({
          title: "New tweet detected",
          description: `New tweet about ${data.coinSymbol} with sentiment: ${data.sentimentLabel}`,
        });
      } else if (data.type === "new_trade") {
        queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        toast({
          title: `${data.tradeType} Trade Executed`,
          description: `${data.tradeType} ${data.coinSymbol} for $${data.amount} based on sentiment`,
          variant: data.tradeType === "BUY" ? "default" : "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Connection error",
        description: "Could not connect to server for real-time updates",
        variant: "destructive",
      });
    }
  });

  // Queries
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: coinsData, isLoading: coinsLoading } = useQuery({
    queryKey: ['/api/coins'],
  });

  const { data: tradesData, isLoading: tradesLoading } = useQuery({
    queryKey: ['/api/trades'],
  });

  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['/api/config'],
  });

  // Mobile menu toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar (hidden on mobile) */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between h-16 bg-card px-4 border-b border-border">
          <div className="flex items-center">
            <button 
              className="text-muted-foreground focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="material-icons">menu</span>
            </button>
            <h1 className="ml-3 text-xl font-semibold text-foreground">Coin Whisperer</h1>
          </div>
          <div>
            <button className="p-1 text-muted-foreground rounded-full hover:bg-accent focus:outline-none">
              <span className="material-icons">account_circle</span>
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            {/* Page Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
                <p className="mt-1 text-sm text-muted-foreground">Monitor sentiment and trading activity</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-3">
                <div className="relative">
                  <button className="flex items-center px-4 py-2 bg-secondary/20 rounded-lg hover:bg-secondary/30">
                    <span className="material-icons mr-2 text-sm">update</span>
                    <span className="text-sm">Auto-refresh</span>
                  </button>
                </div>
                <button 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  onClick={() => document.getElementById('trading-config')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Configure Trading
                </button>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Overview Cards */}
              <OverviewCards stats={statsData} isLoading={statsLoading} />

              {/* Main Dashboard Panels */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Sentiment Analysis & Twitter Feed */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Sentiment Chart Card */}
                  <SentimentChart />
                  
                  {/* Twitter Feed Card */}
                  <TwitterFeed 
                    selectedCoin={selectedCoin} 
                    onSelectCoin={setSelectedCoin} 
                  />
                </div>

                {/* Right Column: Trades & Coin Status */}
                <div className="space-y-6">
                  {/* Coin Status Card */}
                  <CoinStatus 
                    coins={coinsData} 
                    isLoading={coinsLoading} 
                    onSelectCoin={setSelectedCoin}
                  />
                  
                  {/* Recent Trades Card */}
                  <RecentTrades 
                    trades={tradesData} 
                    isLoading={tradesLoading} 
                  />
                  
                  {/* Trading Configuration Card */}
                  <div id="trading-config">
                    <TradingConfig 
                      config={configData} 
                      isLoading={configLoading} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
