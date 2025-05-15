// User Interface
export interface IUser {
  _id?: string;
  username: string;
  password: string;
}

// Tweet Interface
export interface ITweet {
  _id?: string;
  tweetId: string;
  content: string;
  authorName: string;
  authorUsername: string;
  authorProfileImage?: string;
  createdAt: Date;
  likes?: number;
  retweets?: number;
  sentimentScore: number;
  sentimentLabel: string;
  coinSymbol: string;
}

// Coin Interface
export interface ICoin {
  _id?: string;
  name: string;
  symbol: string;
  currentPrice: number;
  priceChangePercentage: number;
  image?: string;
  isTracked: boolean;
}

// Trade Interface
export interface ITrade {
  _id?: string;
  type: 'BUY' | 'SELL';
  coinSymbol: string;
  amount: number;
  price: number;
  sentimentScore: number;
  threshold: number;
  timestamp: Date;
}

// Config Interface
export interface IConfig {
  _id?: string;
  buyThreshold: number;
  sellThreshold: number;
  autoTrading: boolean;
  notifications: boolean;
  riskLevel: 'Low' | 'Medium' | 'High';
}

// Stats Interface
export interface IStats {
  _id?: string;
  overallSentiment: number;
  overallSentimentLabel: string;
  activeTrades: number;
  profitLoss: number;
  profitLossPercentage: number;
  trackedCoins: number;
  lastUpdated: Date;
}