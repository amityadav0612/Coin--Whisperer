import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Trade } from "@shared/schema";

interface RecentTradesProps {
  trades?: Trade[];
  isLoading: boolean;
}

export default function RecentTrades({ trades, isLoading }: RecentTradesProps) {
  // Format timestamp
  function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    const today = new Date();
    
    const isToday = date.toDateString() === today.toDateString();
    
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    if (isToday) {
      return `Today, ${timeStr}`;
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${timeStr}`;
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }) + `, ${timeStr}`;
  }
  
  // Get trade border class
  function getTradeBorderClass(type: string) {
    return type === 'BUY' ? 'border-green-500' : 'border-red-500';
  }
  
  // Get trade badge class
  function getTradeBadgeClass(type: string) {
    return type === 'BUY' 
      ? 'bg-green-500/20 text-green-500' 
      : 'bg-red-500/20 text-red-500';
  }
  
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">Recent Trades</h3>
          <a href="#" className="text-sm text-primary hover:text-primary/80">View all</a>
        </div>
        <div className="mt-4 space-y-3">
          {isLoading ? (
            // Loading state
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-3 bg-accent/10 rounded-lg border-l-4 border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-4 w-12 ml-2" />
                    </div>
                    <Skeleton className="h-3 w-40 mt-1" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </div>
              </div>
            ))
          ) : trades && trades.length > 0 ? (
            // Trades list
            trades.slice(0, 5).map((trade) => (
              <div 
                key={trade.id} 
                className={`p-3 bg-accent/10 rounded-lg border-l-4 ${getTradeBorderClass(trade.type)}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 ${getTradeBadgeClass(trade.type)} text-xs rounded-full`}>
                        {trade.type}
                      </span>
                      <h4 className="ml-2 font-medium text-foreground">{trade.coinSymbol}</h4>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Sentiment Score: {Number(trade.sentimentScore).toFixed(2)} ({trade.type === 'BUY' ? 'Buy' : 'Sell'} threshold: {Number(trade.threshold).toFixed(2)})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-foreground">${Number(trade.amount).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{formatTimestamp(trade.timestamp.toString())}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Empty state
            <div className="text-center py-6">
              <span className="material-icons text-4xl text-muted-foreground">receipt_long</span>
              <p className="mt-2 text-muted-foreground">No trades executed yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
