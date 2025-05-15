import mongoose, { Document } from 'mongoose';
import { User, Tweet, Coin, Trade, Config, Stats } from '@shared/schema';

// MongoDB Schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const TweetSchema = new mongoose.Schema({
  tweetId: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  coinTag: { type: String, required: true },
  sentiment: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const CoinSchema = new mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true, unique: true },
  currentPrice: { type: Number, required: true },
  priceChangePercentage: { type: Number, required: true },
  image: { type: String, required: true },
  isTracked: { type: Boolean, default: false }
});

const TradeSchema = new mongoose.Schema({
  coinId: { type: String, required: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ConfigSchema = new mongoose.Schema({
  buyThreshold: { type: Number, default: 0.65 },
  sellThreshold: { type: Number, default: 0.40 },
  autoTrading: { type: Boolean, default: true },
  notifications: { type: Boolean, default: true },
  riskLevel: { type: String, default: 'Medium' }
});

const StatsSchema = new mongoose.Schema({
  overallSentiment: { type: Number, default: 0 },
  overallSentimentLabel: { type: String, default: 'Neutral' },
  activeTrades: { type: Number, default: 0 },
  profitLoss: { type: Number, default: 0 },
  profitLossPercentage: { type: Number, default: 0 },
  trackedCoins: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

// Create models
const UserModel = mongoose.model<User & Document>('User', UserSchema);
const TweetModel = mongoose.model<Tweet & Document>('Tweet', TweetSchema);
const CoinModel = mongoose.model<Coin & Document>('Coin', CoinSchema);
const TradeModel = mongoose.model<Trade & Document>('Trade', TradeSchema);
const ConfigModel = mongoose.model<Config & Document>('Config', ConfigSchema);
const StatsModel = mongoose.model<Stats & Document>('Stats', StatsSchema);

export interface IStorage {
  // User operations
  createUser(user: User): Promise<User>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;

  // Tweet operations
  createTweet(tweet: Tweet): Promise<Tweet>;
  getTweetsByCoin(coinTag: string): Promise<Tweet[]>;
  getLatestTweets(limit: number): Promise<Tweet[]>;

  // Coin operations
  createCoin(coin: Coin): Promise<Coin>;
  getCoinBySymbol(symbol: string): Promise<Coin | null>;
  updateCoin(symbol: string, data: Partial<Coin>): Promise<Coin | null>;
  getTrackedCoins(): Promise<Coin[]>;

  // Trade operations
  createTrade(trade: Trade): Promise<Trade>;
  getTradesByCoin(coinId: string): Promise<Trade[]>;
  getLatestTrades(limit: number): Promise<Trade[]>;

  // Config operations
  getConfig(): Promise<Config>;
  updateConfig(data: Partial<Config>): Promise<Config>;

  // Stats operations
  getStats(): Promise<Stats>;
  updateStats(data: Partial<Stats>): Promise<Stats>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // No need to connect here as it's handled in db.ts
  }

  // User operations
  async createUser(user: User): Promise<User> {
    const newUser = await UserModel.create(user);
    return newUser.toObject();
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const user = await UserModel.findOne({ username });
    return user ? user.toObject() : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? user.toObject() : null;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user ? user.toObject() : null;
  }

  // Tweet operations
  async createTweet(tweet: Tweet): Promise<Tweet> {
    const newTweet = await TweetModel.create(tweet);
    return newTweet.toObject();
  }

  async getTweetsByCoin(coinTag: string): Promise<Tweet[]> {
    const tweets = await TweetModel.find({ coinTag }).sort({ createdAt: -1 });
    return tweets.map(tweet => tweet.toObject());
  }

  async getLatestTweets(limit: number): Promise<Tweet[]> {
    const tweets = await TweetModel.find().sort({ createdAt: -1 }).limit(limit);
    return tweets.map(tweet => tweet.toObject());
  }

  // Coin operations
  async createCoin(coin: Coin): Promise<Coin> {
    const newCoin = await CoinModel.create(coin);
    return newCoin.toObject();
  }

  async getCoinBySymbol(symbol: string): Promise<Coin | null> {
    const coin = await CoinModel.findOne({ symbol });
    return coin ? coin.toObject() : null;
  }

  async updateCoin(symbol: string, data: Partial<Coin>): Promise<Coin | null> {
    const coin = await CoinModel.findOneAndUpdate(
      { symbol },
      { $set: data },
      { new: true }
    );
    return coin ? coin.toObject() : null;
  }

  async getTrackedCoins(): Promise<Coin[]> {
    const coins = await CoinModel.find({ isTracked: true });
    return coins.map(coin => coin.toObject());
  }

  // Trade operations
  async createTrade(trade: Trade): Promise<Trade> {
    const newTrade = await TradeModel.create(trade);
    return newTrade.toObject();
  }

  async getTradesByCoin(coinId: string): Promise<Trade[]> {
    const trades = await TradeModel.find({ coinId }).sort({ timestamp: -1 });
    return trades.map(trade => trade.toObject());
  }

  async getLatestTrades(limit: number): Promise<Trade[]> {
    const trades = await TradeModel.find().sort({ timestamp: -1 }).limit(limit);
    return trades.map(trade => trade.toObject());
  }

  // Config operations
  async getConfig(): Promise<Config> {
    let config = await ConfigModel.findOne();
    if (!config) {
      config = await ConfigModel.create({});
    }
    return config.toObject();
  }

  async updateConfig(data: Partial<Config>): Promise<Config> {
    const config = await ConfigModel.findOneAndUpdate(
      {},
      { $set: data },
      { new: true, upsert: true }
    );
    if (!config) {
      throw new Error('Failed to update config');
    }
    return config.toObject();
  }

  // Stats operations
  async getStats(): Promise<Stats> {
    let stats = await StatsModel.findOne();
    if (!stats) {
      stats = await StatsModel.create({});
    }
    return stats.toObject();
  }

  async updateStats(data: Partial<Stats>): Promise<Stats> {
    const stats = await StatsModel.findOneAndUpdate(
      {},
      { $set: data },
      { new: true, upsert: true }
    );
    if (!stats) {
      throw new Error('Failed to update stats');
    }
    return stats.toObject();
  }
}
