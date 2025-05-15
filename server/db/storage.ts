import { 
  User, Tweet, Coin, Trade, Config, Stats,
  IUser, ITweet, ICoin, ITrade, IConfig, IStats 
} from './models';
import { connectToDatabase } from './mongodb';

// Interface for storage operations
export interface IStorage {
  // User methods
  getUser(id: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  createUser(user: Partial<IUser>): Promise<IUser>;
  
  // Tweet methods
  getTweets(limit?: number, coinSymbol?: string): Promise<ITweet[]>;
  getTweet(id: string): Promise<ITweet | null>;
  getTweetByTwitterId(tweetId: string): Promise<ITweet | null>;
  createTweet(tweet: Partial<ITweet>): Promise<ITweet>;
  
  // Coin methods
  getCoins(): Promise<ICoin[]>;
  getCoin(id: string): Promise<ICoin | null>;
  getCoinBySymbol(symbol: string): Promise<ICoin | null>;
  createCoin(coin: Partial<ICoin>): Promise<ICoin>;
  updateCoin(id: string, updates: Partial<ICoin>): Promise<ICoin | null>;
  
  // Trade methods
  getTrades(limit?: number): Promise<ITrade[]>;
  getTrade(id: string): Promise<ITrade | null>;
  createTrade(trade: Partial<ITrade>): Promise<ITrade>;
  
  // Config methods
  getConfig(): Promise<IConfig>;
  updateConfig(updates: Partial<IConfig>): Promise<IConfig | null>;
  
  // Stats methods
  getStats(): Promise<IStats>;
  updateStats(updates: Partial<IStats>): Promise<IStats | null>;
  
  // Analysis methods
  analyzeTweets(): Promise<void>;
}

// MongoDB storage implementation
export class MongoStorage implements IStorage {
  constructor() {
    // Connect to MongoDB when the storage is initialized
    connectToDatabase();
    
    // Initialize seed data
    this.initDefaultData();
  }
  
  // Initialize default data if needed
  private async initDefaultData() {
    try {
      // Check if there are coins in the database
      const coinCount = await Coin.countDocuments();
      
      // If no coins, add default coins
      if (coinCount === 0) {
        const defaultCoins = [
          {
            name: "Dogecoin",
            symbol: "DOGE",
            currentPrice: 0.07382,
            priceChangePercentage: 5.6,
            image: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
            isTracked: true
          },
          {
            name: "Shiba Inu",
            symbol: "SHIB",
            currentPrice: 0.00000819,
            priceChangePercentage: -2.3,
            image: "https://cryptologos.cc/logos/shiba-inu-shib-logo.png",
            isTracked: true
          },
          {
            name: "Pepe",
            symbol: "PEPE",
            currentPrice: 0.00000104,
            priceChangePercentage: 12.4,
            image: "https://cryptologos.cc/logos/pepe-pepe-logo.png",
            isTracked: true
          }
        ];
        
        await Coin.insertMany(defaultCoins);
        console.log('Initialized default coins');
      }
      
      // Check if there's a config in the database
      const configCount = await Config.countDocuments();
      
      // If no config, add default config
      if (configCount === 0) {
        await Config.create({
          buyThreshold: 0.65,
          sellThreshold: 0.40,
          autoTrading: true,
          notifications: true,
          riskLevel: "Medium"
        });
        console.log('Initialized default config');
      }
      
      // Check if there are stats in the database
      const statsCount = await Stats.countDocuments();
      
      // If no stats, add default stats
      if (statsCount === 0) {
        await Stats.create({
          overallSentiment: 0.76,
          overallSentimentLabel: "Positive",
          activeTrades: 0,
          profitLoss: 0,
          profitLossPercentage: 0,
          trackedCoins: await Coin.countDocuments({ isTracked: true }),
          lastUpdated: new Date()
        });
        console.log('Initialized default stats');
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  }
  
  // User methods
  async getUser(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }
  
  async getUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username });
  }
  
  async createUser(user: Partial<IUser>): Promise<IUser> {
    return await User.create(user);
  }
  
  // Tweet methods
  async getTweets(limit = 50, coinSymbol?: string): Promise<ITweet[]> {
    const query = coinSymbol 
      ? { coinSymbol: coinSymbol }
      : {};
      
    return await Tweet.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
  
  async getTweet(id: string): Promise<ITweet | null> {
    return await Tweet.findById(id);
  }
  
  async getTweetByTwitterId(tweetId: string): Promise<ITweet | null> {
    return await Tweet.findOne({ tweetId });
  }
  
  async createTweet(tweet: Partial<ITweet>): Promise<ITweet> {
    return await Tweet.create(tweet);
  }
  
  // Coin methods
  async getCoins(): Promise<ICoin[]> {
    return await Coin.find();
  }
  
  async getCoin(id: string): Promise<ICoin | null> {
    return await Coin.findById(id);
  }
  
  async getCoinBySymbol(symbol: string): Promise<ICoin | null> {
    // Case-insensitive search
    return await Coin.findOne({ 
      symbol: { $regex: new RegExp(`^${symbol}$`, 'i') } 
    });
  }
  
  async createCoin(coin: Partial<ICoin>): Promise<ICoin> {
    const newCoin = await Coin.create(coin);
    
    // Update tracked coins count if the new coin is tracked
    if (newCoin.isTracked) {
      const trackedCoins = await Coin.countDocuments({ isTracked: true });
      await this.updateStats({ trackedCoins });
    }
    
    return newCoin;
  }
  
  async updateCoin(id: string, updates: Partial<ICoin>): Promise<ICoin | null> {
    const coin = await Coin.findByIdAndUpdate(id, updates, { new: true });
    
    if (!coin) {
      throw new Error(`Coin with ID ${id} not found`);
    }
    
    // Update tracked coins count if tracking status changed
    if ('isTracked' in updates) {
      const trackedCoins = await Coin.countDocuments({ isTracked: true });
      await this.updateStats({ trackedCoins });
    }
    
    return coin;
  }
  
  // Trade methods
  async getTrades(limit = 50): Promise<ITrade[]> {
    return await Trade.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }
  
  async getTrade(id: string): Promise<ITrade | null> {
    return await Trade.findById(id);
  }
  
  async createTrade(trade: Partial<ITrade>): Promise<ITrade> {
    const newTrade = await Trade.create(trade);
    
    // Update active trades count
    const activeTrades = await Trade.countDocuments();
    await this.updateStats({ activeTrades });
    
    return newTrade;
  }
  
  // Config methods
  async getConfig(): Promise<IConfig> {
    const config = await Config.findOne();
    
    if (!config) {
      // If no config exists, create a default one
      return await Config.create({
        buyThreshold: 0.65,
        sellThreshold: 0.40,
        autoTrading: true,
        notifications: true,
        riskLevel: "Medium"
      });
    }
    
    return config;
  }
  
  async updateConfig(updates: Partial<IConfig>): Promise<IConfig | null> {
    const config = await this.getConfig();
    return await Config.findByIdAndUpdate(config._id, updates, { new: true });
  }
  
  // Stats methods
  async getStats(): Promise<IStats> {
    const stats = await Stats.findOne();
    
    if (!stats) {
      // If no stats exists, create default
      return await Stats.create({
        overallSentiment: 0.5,
        overallSentimentLabel: "Neutral",
        activeTrades: 0,
        profitLoss: 0,
        profitLossPercentage: 0,
        trackedCoins: await Coin.countDocuments({ isTracked: true }),
        lastUpdated: new Date()
      });
    }
    
    // Update lastUpdated timestamp
    stats.lastUpdated = new Date();
    await stats.save();
    
    return stats;
  }
  
  async updateStats(updates: Partial<IStats>): Promise<IStats | null> {
    const stats = await this.getStats();
    
    // Add lastUpdated to updates
    updates.lastUpdated = new Date();
    
    return await Stats.findByIdAndUpdate(stats._id, updates, { new: true });
  }
  
  // Analyze tweets
  async analyzeTweets(): Promise<void> {
    // This is a placeholder for the demo
    console.log("Tweet analysis completed");
    
    // Update overall sentiment based on recent tweets
    await this.updateOverallSentiment();
  }
  
  private async updateOverallSentiment(): Promise<void> {
    const recentTweets = await this.getTweets(100);
    
    if (recentTweets.length === 0) return;
    
    // Calculate average sentiment
    const totalSentiment = recentTweets.reduce(
      (acc, tweet) => acc + tweet.sentimentScore, 0
    );
    const averageSentiment = totalSentiment / recentTweets.length;
    
    // Determine sentiment label
    let sentimentLabel = "Neutral";
    if (averageSentiment >= 0.6) sentimentLabel = "Positive";
    else if (averageSentiment <= 0.4) sentimentLabel = "Negative";
    
    // Update stats
    await this.updateStats({
      overallSentiment: averageSentiment,
      overallSentimentLabel: sentimentLabel
    });
  }
}

// Create and export a singleton instance
export const storage = new MongoStorage();