import mongoose, { Schema, Document } from 'mongoose';

// User Interface
export interface IUser extends Document {
  username: string;
  password: string;
}

// Tweet Interface
export interface ITweet extends Document {
  tweetId: string;
  content: string;
  authorName: string;
  authorUsername: string;
  authorProfileImage?: string;
  createdAt: Date;
  likes: number;
  retweets: number;
  sentimentScore: number;
  sentimentLabel: string;
  coinSymbol: string;
}

// Coin Interface
export interface ICoin extends Document {
  name: string;
  symbol: string;
  currentPrice: number;
  priceChangePercentage: number;
  image?: string;
  isTracked: boolean;
}

// Trade Interface
export interface ITrade extends Document {
  type: 'BUY' | 'SELL';
  coinSymbol: string;
  amount: number;
  price: number;
  sentimentScore: number;
  threshold: number;
  timestamp: Date;
}

// Config Interface
export interface IConfig extends Document {
  buyThreshold: number;
  sellThreshold: number;
  autoTrading: boolean;
  notifications: boolean;
  riskLevel: 'Low' | 'Medium' | 'High';
}

// Stats Interface
export interface IStats extends Document {
  overallSentiment: number;
  overallSentimentLabel: string;
  activeTrades: number;
  profitLoss: number;
  profitLossPercentage: number;
  trackedCoins: number;
  lastUpdated: Date;
}

// User Schema
const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Tweet Schema
const TweetSchema = new Schema<ITweet>({
  tweetId: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  authorName: { type: String, required: true },
  authorUsername: { type: String, required: true },
  authorProfileImage: { type: String },
  createdAt: { type: Date, required: true, default: Date.now },
  likes: { type: Number, default: 0 },
  retweets: { type: Number, default: 0 },
  sentimentScore: { type: Number, required: true },
  sentimentLabel: { type: String, required: true },
  coinSymbol: { type: String, required: true }
});

// Coin Schema
const CoinSchema = new Schema<ICoin>({
  name: { type: String, required: true },
  symbol: { type: String, required: true, unique: true },
  currentPrice: { type: Number, default: 0 },
  priceChangePercentage: { type: Number, default: 0 },
  image: { type: String },
  isTracked: { type: Boolean, default: true }
});

// Trade Schema
const TradeSchema = new Schema<ITrade>({
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  coinSymbol: { type: String, required: true },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  sentimentScore: { type: Number, required: true },
  threshold: { type: Number, required: true },
  timestamp: { type: Date, required: true, default: Date.now }
});

// Config Schema
const ConfigSchema = new Schema<IConfig>({
  buyThreshold: { type: Number, required: true, default: 0.65 },
  sellThreshold: { type: Number, required: true, default: 0.40 },
  autoTrading: { type: Boolean, required: true, default: true },
  notifications: { type: Boolean, required: true, default: true },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], required: true, default: 'Medium' }
});

// Stats Schema
const StatsSchema = new Schema<IStats>({
  overallSentiment: { type: Number, required: true, default: 0.5 },
  overallSentimentLabel: { type: String, required: true, default: 'Neutral' },
  activeTrades: { type: Number, required: true, default: 0 },
  profitLoss: { type: Number, required: true, default: 0 },
  profitLossPercentage: { type: Number, required: true, default: 0 },
  trackedCoins: { type: Number, required: true, default: 0 },
  lastUpdated: { type: Date, required: true, default: Date.now }
});

// Define models (if they don't already exist)
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Tweet = mongoose.models.Tweet || mongoose.model<ITweet>('Tweet', TweetSchema);
export const Coin = mongoose.models.Coin || mongoose.model<ICoin>('Coin', CoinSchema);
export const Trade = mongoose.models.Trade || mongoose.model<ITrade>('Trade', TradeSchema);
export const Config = mongoose.models.Config || mongoose.model<IConfig>('Config', ConfigSchema);
export const Stats = mongoose.models.Stats || mongoose.model<IStats>('Stats', StatsSchema);