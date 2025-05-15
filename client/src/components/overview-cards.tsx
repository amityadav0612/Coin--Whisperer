import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Stats } from "@shared/schema";

interface OverviewCardsProps {
  stats?: Stats;
  isLoading: boolean;
}

export default function OverviewCards({ stats, isLoading }: OverviewCardsProps) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Overall Sentiment Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${stats?.overallSentimentLabel === 'Positive' ? 'bg-green-500/10' : stats?.overallSentimentLabel === 'Negative' ? 'bg-red-500/10' : 'bg-amber-500/10'} p-3 rounded-full`}>
              <span className={`material-icons ${stats?.overallSentimentLabel === 'Positive' ? 'text-green-500' : stats?.overallSentimentLabel === 'Negative' ? 'text-red-500' : 'text-amber-500'}`}>
                {stats?.overallSentimentLabel === 'Positive' ? 'mood' : stats?.overallSentimentLabel === 'Negative' ? 'mood_bad' : 'sentiment_neutral'}
              </span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-muted-foreground truncate">
                  Overall Sentiment
                </dt>
                <dd>
                  {isLoading ? (
                    <Skeleton className="h-6 w-24 mt-1" />
                  ) : (
                    <div className="text-lg font-semibold text-foreground">
                      {stats?.overallSentimentLabel} ({Math.round(Number(stats?.overallSentiment) * 100)}%)
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-accent/10 px-5 py-3">
          <div className="text-sm">
            <a href="#" className="font-medium text-primary hover:text-primary/80">
              View details
            </a>
          </div>
        </CardFooter>
      </Card>

      {/* Active Trades Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-500/10 p-3 rounded-full">
              <span className="material-icons text-purple-500">sync_alt</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-muted-foreground truncate">
                  Active Trades
                </dt>
                <dd>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 mt-1" />
                  ) : (
                    <div className="text-lg font-semibold text-foreground">
                      {stats?.activeTrades || 0}
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-accent/10 px-5 py-3">
          <div className="text-sm">
            <a href="#" className="font-medium text-primary hover:text-primary/80">
              View all
            </a>
          </div>
        </CardFooter>
      </Card>

      {/* Profit/Loss Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${Number(stats?.profitLossPercentage) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'} p-3 rounded-full`}>
              <span className={`material-icons ${Number(stats?.profitLossPercentage) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Number(stats?.profitLossPercentage) >= 0 ? 'trending_up' : 'trending_down'}
              </span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-muted-foreground truncate">
                  24h Profit/Loss
                </dt>
                <dd>
                  {isLoading ? (
                    <Skeleton className="h-6 w-20 mt-1" />
                  ) : (
                    <div className={`text-lg font-semibold ${Number(stats?.profitLossPercentage) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Number(stats?.profitLossPercentage) >= 0 ? '+' : ''}{stats?.profitLossPercentage}%
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-accent/10 px-5 py-3">
          <div className="text-sm">
            <a href="#" className="font-medium text-primary hover:text-primary/80">
              View history
            </a>
          </div>
        </CardFooter>
      </Card>

      {/* Tracked Coins Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-orange-500/10 p-3 rounded-full">
              <span className="material-icons text-orange-500">tag</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-muted-foreground truncate">
                  Tracked Coins
                </dt>
                <dd>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 mt-1" />
                  ) : (
                    <div className="text-lg font-semibold text-foreground">
                      {stats?.trackedCoins || 0}
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-accent/10 px-5 py-3">
          <div className="text-sm">
            <a href="#" className="font-medium text-primary hover:text-primary/80">
              Configure
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
