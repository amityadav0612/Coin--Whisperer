import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/api";
import type { Tweet } from "@shared/schema";

interface TwitterFeedProps {
  selectedCoin?: string;
  onSelectCoin: (coin?: string) => void;
}

export default function TwitterFeed({ selectedCoin, onSelectCoin }: TwitterFeedProps) {
  // Query tweets, potentially filtered by coin
  const { data: tweets, isLoading } = useQuery({
    queryKey: ['/api/tweets', selectedCoin],
    queryFn: () => API.getTweets(selectedCoin),
  });
  
  // Query for available coins for the filter dropdown
  const { data: coins } = useQuery({
    queryKey: ['/api/coins'],
    queryFn: () => API.getCoins(),
  });

  // Format relative time
  function getRelativeTime(timestamp: string) {
    const now = new Date();
    const tweetDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - tweetDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }

  // Get sentiment class for tweet
  function getSentimentClass(label: string) {
    switch(label) {
      case 'Positive': return 'border-green-500';
      case 'Negative': return 'border-red-500';
      default: return 'border-amber-500';
    }
  }
  
  // Get sentiment badge class
  function getSentimentBadgeClass(label: string) {
    switch(label) {
      case 'Positive': return 'bg-green-500/20 text-green-500';
      case 'Negative': return 'bg-red-500/20 text-red-500';
      default: return 'bg-amber-500/20 text-amber-500';
    }
  }
  
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">Twitter Feed</h3>
          <div>
            <Select 
              value={selectedCoin || ''} 
              onValueChange={(value) => onSelectCoin(value || undefined)}
            >
              <SelectTrigger className="w-[180px] bg-secondary/20 border-border">
                <SelectValue placeholder="All tracked coins" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All tracked coins</SelectItem>
                {coins?.map((coin) => (
                  <SelectItem key={coin.symbol} value={coin.symbol}>
                    {coin.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-4 space-y-4 max-h-96 overflow-y-auto pr-2">
          {isLoading ? (
            // Loading state
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4 bg-accent/10 rounded-lg border-l-4 border-border">
                <div className="flex">
                  <Skeleton className="h-10 w-10 rounded-full mr-3" />
                  <div className="w-full">
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32 ml-2" />
                    </div>
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex space-x-4">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : tweets && tweets.length > 0 ? (
            // Tweet items with sentiment indicators
            tweets.map((tweet) => (
              <div 
                key={tweet.id} 
                className={`p-4 bg-accent/10 rounded-lg border-l-4 ${getSentimentClass(tweet.sentimentLabel)}`}
              >
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <img 
                      className="h-10 w-10 rounded-full" 
                      src={tweet.authorProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(tweet.authorName)}&background=random`} 
                      alt={`${tweet.authorName}'s profile`} 
                    />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium text-foreground">{tweet.authorName}</h4>
                      <span className="ml-2 text-muted-foreground text-sm">@{tweet.authorUsername}</span>
                      <span className="ml-2 text-muted-foreground text-xs">
                        {getRelativeTime(tweet.createdAt.toString())}
                      </span>
                    </div>
                    <p className="mt-1 text-foreground/80">
                      {tweet.content}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex space-x-4 text-muted-foreground">
                        <span className="flex items-center text-sm">
                          <span className="material-icons text-sm mr-1">favorite_border</span> {tweet.likes}
                        </span>
                        <span className="flex items-center text-sm">
                          <span className="material-icons text-sm mr-1">repeat</span> {tweet.retweets}
                        </span>
                      </div>
                      <div className={`px-2 py-1 rounded-full ${getSentimentBadgeClass(tweet.sentimentLabel)}`}>
                        <span className="text-xs font-medium">
                          {tweet.sentimentLabel} ({Number(tweet.sentimentScore).toFixed(2)})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Empty state
            <div className="text-center py-6">
              <span className="material-icons text-4xl text-muted-foreground">search_off</span>
              <p className="mt-2 text-muted-foreground">No tweets found{selectedCoin ? ` for ${selectedCoin}` : ''}.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
