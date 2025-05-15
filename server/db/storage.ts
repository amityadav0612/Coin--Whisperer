import {
  IUser, ITweet, ICoin, ITrade, IConfig, IStats 
} from './models';
// In-memory storage implementation

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

// In-memory MongoDB-like storage implementation
export class MemMongoStorage implements IStorage {
  private users: Map<string, IUser & { _id: string }> = new Map();
  private tweets: Map<string, ITweet & { _id: string }> = new Map();
  private coins: Map<string, ICoin & { _id: string }> = new Map();
  private trades: Map<string, ITrade & { _id: string }> = new Map();
  private config: (IConfig & { _id: string }) | null = null;
  private stats: (IStats & { _id: string }) | null = null;
  
  // Counter for generating IDs
  private idCounter: number = 1;
  
  constructor() {
    // Initialize seed data
    this.initDefaultData();
  }
  
  // Generate MongoDB-like ID
  private generateId(): string {
    return (this.idCounter++).toString().padStart(24, '0');
  }
  
  // Initialize default data if needed
  private async initDefaultData() {
    try {      
      // If no coins, add default coins
      if (this.coins.size === 0) {
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
        
        for (const coin of defaultCoins) {
          await this.createCoin(coin);
        }
        console.log('Initialized default coins');
      }
      
      // If no config, add default config
      if (!this.config) {
        await this.getConfig();
        console.log('Initialized default config');
      }
      
      // If no stats, add default stats
      if (!this.stats) {
        await this.getStats();
        console.log('Initialized default stats');
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  }
  
  // User methods
  async getUser(id: string): Promise<IUser | null> {
    return this.users.get(id) || null;
  }
  
  async getUserByUsername(username: string): Promise<IUser | null> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }
  
  async createUser(user: Partial<IUser>): Promise<IUser> {
    const _id = this.generateId();
    const newUser = { ...user, _id } as IUser & { _id: string };
    this.users.set(_id, newUser);
    return newUser;
  }
  
  // Tweet methods
  async getTweets(limit = 50, coinSymbol?: string): Promise<ITweet[]> {
    let result = Array.from(this.tweets.values());
    
    if (coinSymbol) {
      result = result.filter(tweet => tweet.coinSymbol === coinSymbol);
    }
    
    return result
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  async getTweet(id: string): Promise<ITweet | null> {
    return this.tweets.get(id) || null;
  }
  
  async getTweetByTwitterId(tweetId: string): Promise<ITweet | null> {
    for (const tweet of this.tweets.values()) {
      if (tweet.tweetId === tweetId) {
        return tweet;
      }
    }
    return null;
  }
  
  async createTweet(tweet: Partial<ITweet>): Promise<ITweet> {
    const _id = this.generateId();
    const newTweet = { 
      ...tweet, 
      _id,
      createdAt: tweet.createdAt || new Date()
    } as ITweet & { _id: string };
    
    this.tweets.set(_id, newTweet);
    return newTweet;
  }
  
  // Coin methods
  async getCoins(): Promise<ICoin[]> {
    return Array.from(this.coins.values());
  }
  
  async getCoin(id: string): Promise<ICoin | null> {
    return this.coins.get(id) || null;
  }
  
  async getCoinBySymbol(symbol: string): Promise<ICoin | null> {
    const upperSymbol = symbol.toUpperCase();
    for (const coin of this.coins.values()) {
      if (coin.symbol.toUpperCase() === upperSymbol) {
        return coin;
      }
    }
    return null;
  }
  
  async createCoin(coin: Partial<ICoin>): Promise<ICoin> {
    const _id = this.generateId();
    const newCoin = { 
      ...coin, 
      _id,
      isTracked: coin.isTracked ?? true 
    } as ICoin & { _id: string };
    
    this.coins.set(_id, newCoin);
    
    // Update tracked coins count
    if (newCoin.isTracked) {
      const trackedCoins = Array.from(this.coins.values()).filter(c => c.isTracked).length;
      await this.updateStats({ trackedCoins });
    }
    
    return newCoin;
  }
  
  async updateCoin(id: string, updates: Partial<ICoin>): Promise<ICoin | null> {
    const coin = this.coins.get(id);
    
    if (!coin) {
      throw new Error(`Coin with ID ${id} not found`);
    }
    
    const updatedCoin = { ...coin, ...updates };
    this.coins.set(id, updatedCoin);
    
    // Update tracked coins count if tracking status changed
    if ('isTracked' in updates && updates.isTracked !== coin.isTracked) {
      const trackedCoins = Array.from(this.coins.values()).filter(c => c.isTracked).length;
      await this.updateStats({ trackedCoins });
    }
    
    return updatedCoin;
  }
  
  // Trade methods
  async getTrades(limit = 50): Promise<ITrade[]> {
    return Array.from(this.trades.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  async getTrade(id: string): Promise<ITrade | null> {
    return this.trades.get(id) || null;
  }
  
  async createTrade(trade: Partial<ITrade>): Promise<ITrade> {
    const _id = this.generateId();
    const newTrade = { 
      ...trade, 
      _id,
      timestamp: trade.timestamp || new Date() 
    } as ITrade & { _id: string };
    
    this.trades.set(_id, newTrade);
    
    // Update active trades count
    const activeTrades = this.trades.size;
    await this.updateStats({ activeTrades });
    
    return newTrade;
  }
  
  // Config methods
  async getConfig(): Promise<IConfig> {
    if (!this.config) {
      // If no config exists, create a default one
      const _id = this.generateId();
      this.config = {
        _id,
        buyThreshold: 0.65,
        sellThreshold: 0.40,
        autoTrading: true,
        notifications: true,
        riskLevel: "Medium"
      };
    }
    
    return this.config;
  }
  
  async updateConfig(updates: Partial<IConfig>): Promise<IConfig | null> {
    const config = await this.getConfig();
    this.config = { ...config, ...updates };
    return this.config;
  }
  
  // Stats methods
  async getStats(): Promise<IStats> {
    if (!this.stats) {
      // If no stats exists, create default
      const _id = this.generateId();
      this.stats = {
        _id,
        overallSentiment: 0.5,
        overallSentimentLabel: "Neutral",
        activeTrades: 0,
        profitLoss: 0,
        profitLossPercentage: 0,
        trackedCoins: Array.from(this.coins.values()).filter(c => c.isTracked).length,
        lastUpdated: new Date()
      };
    } else {
      // Update lastUpdated timestamp
      this.stats.lastUpdated = new Date();
    }
    
    return this.stats;
  }
  
  async updateStats(updates: Partial<IStats>): Promise<IStats | null> {
    const stats = await this.getStats();
    
    // Add lastUpdated to updates
    updates.lastUpdated = new Date();
    
    this.stats = { ...stats, ...updates };
    return this.stats;
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
export const storage = new MemMongoStorage();