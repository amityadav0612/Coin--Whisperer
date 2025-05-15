import type { ITweet } from "../db/models";

// Mock Twitter data for demonstration purposes
type MockTweet = Omit<Partial<ITweet>, "sentimentScore" | "sentimentLabel">;

const mockTweets: MockTweet[] = [
  {
    tweetId: "1234567890",
    content: "$DOGE is showing huge potential right now! The community is stronger than ever and with new developments coming, we could see 3x gains soon! 🚀🌙 #Dogecoin #tothemoon",
    authorName: "CryptoWhale",
    authorUsername: "whale_crypto",
    authorProfileImage: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likes: 234,
    retweets: 56,
    coinSymbol: "DOGE"
  },
  {
    tweetId: "2345678901",
    content: "$SHIB looks like it's about to collapse again. All hype, no substance. Classic pump and dump scheme. I'd stay away if I were you. #Shibatoken #cryptowarning",
    authorName: "CryptoSceptic",
    authorUsername: "sceptic_crypto",
    authorProfileImage: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    likes: 43,
    retweets: 12,
    coinSymbol: "SHIB"
  },
  {
    tweetId: "3456789012",
    content: "$PEPE trading volume is up 24% in the last 24 hours. The price remains stable despite market fluctuations. Interesting to watch how this develops. #PEPE #memecoin",
    authorName: "CryptoAnalyst",
    authorUsername: "analyst_crypto",
    authorProfileImage: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    likes: 87,
    retweets: 21,
    coinSymbol: "PEPE"
  },
  {
    tweetId: "4567890123",
    content: "Just bought more $DOGE at the dip! This is the future of digital payments, mark my words! So many new developments coming. #Dogecoin #CryptoGems 💎🙌",
    authorName: "DogeEnthusiast",
    authorUsername: "doge_hodler",
    authorProfileImage: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    likes: 129,
    retweets: 45,
    coinSymbol: "DOGE"
  },
  {
    tweetId: "5678901234",
    content: "$SHIB just announced a new partnership that could drive real utility. This might be a game changer for the token if implemented properly. #SHIB #ShibaArmy",
    authorName: "TokenNews",
    authorUsername: "token_news",
    authorProfileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    likes: 312,
    retweets: 98,
    coinSymbol: "SHIB"
  },
  {
    tweetId: "6789012345",
    content: "I'm selling all my $PEPE before it crashes further. The market seems to be losing interest in meme tokens. Time to focus on real projects with utility. #crypto",
    authorName: "RealCryptoTrader",
    authorUsername: "real_crypto",
    authorProfileImage: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
    createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    likes: 56,
    retweets: 14,
    coinSymbol: "PEPE"
  }
];

/**
 * Fetch tweets from Twitter API
 * In a real implementation, this would make calls to the Twitter API
 * For demo purposes, we'll return mock data
 */
export async function fetchTweets(): Promise<MockTweet[]> {
  // For the demo, return mock tweets
  // In a real implementation, this would use the Twitter API client
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Randomize which tweets to return to simulate real-time updates
  const numTweets = Math.floor(Math.random() * 3) + 1; // Return 1-3 tweets
  const shuffled = [...mockTweets].sort(() => 0.5 - Math.random());
  
  // Create new tweet IDs to avoid duplicates
  return shuffled.slice(0, numTweets).map(tweet => ({
    ...tweet,
    tweetId: tweet.tweetId + Date.now().toString().slice(-4), // Ensure unique IDs
    createdAt: new Date() // Set to current time
  }));
}
