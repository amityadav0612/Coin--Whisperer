import { 
  User, InsertUser, 
  Tweet, InsertTweet, 
  Coin, InsertCoin, 
  Trade, InsertTrade, 
  Config, InsertConfig, 
  Stats, InsertStats,
  users, tweets, coins, trades, configs, stats
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User methods (from template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tweet methods
  getTweets(limit?: number, coinTag?: string): Promise<Tweet[]>;
  getTweet(id: number): Promise<Tweet | undefined>;
  getTweetByTwitterId(tweetId: string): Promise<Tweet | undefined>;
  createTweet(tweet: InsertTweet): Promise<Tweet>;
  
  // Coin methods
  getCoins(): Promise<Coin[]>;
  getCoin(id: number): Promise<Coin | undefined>;
  getCoinBySymbol(symbol: string): Promise<Coin | undefined>;
  createCoin(coin: InsertCoin): Promise<Coin>;
  updateCoin(id: number, updates: Partial<Coin>): Promise<Coin>;
  
  // Trade methods
  getTrades(limit?: number): Promise<Trade[]>;
  getTrade(id: number): Promise<Trade | undefined>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  
  // Config methods
  getConfig(): Promise<Config>;
  updateConfig(updates: Partial<Config>): Promise<Config>;
  
  // Stats methods
  getStats(): Promise<Stats>;
  updateStats(updates: Partial<Stats>): Promise<Stats>;
  
  // Analysis methods
  analyzeTweets(): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tweets: Map<number, Tweet>;
  private coins: Map<number, Coin>;
  private trades: Map<number, Trade>;
  private config: Config;
  private stats: Stats;
  
  private userIdCounter: number;
  private tweetIdCounter: number;
  private coinIdCounter: number;
  private tradeIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.tweets = new Map();
    this.coins = new Map();
    this.trades = new Map();
    
    this.userIdCounter = 1;
    this.tweetIdCounter = 1;
    this.coinIdCounter = 1;
    this.tradeIdCounter = 1;
    
    // Initialize with default config
    this.config = {
      id: 1,
      buyThreshold: 0.65,
      sellThreshold: 0.40,
      autoTrading: true,
      notifications: true,
      riskLevel: "Medium"
    };
    
    // Initialize with default stats
    this.stats = {
      id: 1,
      overallSentiment: 0.76,
      overallSentimentLabel: "Positive",
      activeTrades: 12,
      profitLoss: 125.75,
      profitLossPercentage: 2.34,
      trackedCoins: 8,
      lastUpdated: new Date()
    };
    
    // Initial seed data for coins
    this.initDefaultCoins();
  }
  
  // Initialize default coins data
  private initDefaultCoins() {
    const defaultCoins: InsertCoin[] = [
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
    
    defaultCoins.forEach(coin => this.createCoin(coin));
  }
  
  // User methods (from template)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Tweet methods
  async getTweets(limit = 50, coinTag?: string): Promise<Tweet[]> {
    let tweets = Array.from(this.tweets.values());
    
    // Filter by coin tag if provided
    if (coinTag) {
      tweets = tweets.filter(tweet => tweet.coinTag === coinTag);
    }
    
    // Sort by creation date (newest first)
    tweets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Limit results
    return tweets.slice(0, limit);
  }
  
  async getTweet(id: number): Promise<Tweet | undefined> {
    return this.tweets.get(id);
  }
  
  async getTweetByTwitterId(tweetId: string): Promise<Tweet | undefined> {
    return Array.from(this.tweets.values()).find(
      (tweet) => tweet.tweetId === tweetId
    );
  }
  
  async createTweet(insertTweet: InsertTweet): Promise<Tweet> {
    const id = this.tweetIdCounter++;
    const tweet: Tweet = { ...insertTweet, id };
    this.tweets.set(id, tweet);
    return tweet;
  }
  
  // Coin methods
  async getCoins(): Promise<Coin[]> {
    return Array.from(this.coins.values());
  }
  
  async getCoin(id: number): Promise<Coin | undefined> {
    return this.coins.get(id);
  }
  
  async getCoinBySymbol(symbol: string): Promise<Coin | undefined> {
    return Array.from(this.coins.values()).find(
      (coin) => coin.symbol.toUpperCase() === symbol.toUpperCase()
    );
  }
  
  async createCoin(insertCoin: InsertCoin): Promise<Coin> {
    const id = this.coinIdCounter++;
    const coin: Coin = { ...insertCoin, id };
    this.coins.set(id, coin);
    
    // Update tracked coins count
    if (coin.isTracked) {
      const trackedCoins = Array.from(this.coins.values()).filter(c => c.isTracked).length;
      this.updateStats({ trackedCoins });
    }
    
    return coin;
  }
  
  async updateCoin(id: number, updates: Partial<Coin>): Promise<Coin> {
    const coin = this.coins.get(id);
    if (!coin) {
      throw new Error(`Coin with ID ${id} not found`);
    }
    
    const updatedCoin = { ...coin, ...updates };
    this.coins.set(id, updatedCoin);
    
    // Update tracked coins count if tracking status changed
    if ('isTracked' in updates) {
      const trackedCoins = Array.from(this.coins.values()).filter(c => c.isTracked).length;
      this.updateStats({ trackedCoins });
    }
    
    return updatedCoin;
  }
  
  // Trade methods
  async getTrades(limit = 50): Promise<Trade[]> {
    const trades = Array.from(this.trades.values());
    
    // Sort by timestamp (newest first)
    trades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Limit results
    return trades.slice(0, limit);
  }
  
  async getTrade(id: number): Promise<Trade | undefined> {
    return this.trades.get(id);
  }
  
  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = this.tradeIdCounter++;
    const trade: Trade = { ...insertTrade, id };
    this.trades.set(id, trade);
    
    // Update active trades count
    const activeTrades = this.trades.size;
    this.updateStats({ activeTrades });
    
    return trade;
  }
  
  // Config methods
  async getConfig(): Promise<Config> {
    return this.config;
  }
  
  async updateConfig(updates: Partial<Config>): Promise<Config> {
    this.config = { ...this.config, ...updates };
    return this.config;
  }
  
  // Stats methods
  async getStats(): Promise<Stats> {
    // Update lastUpdated timestamp
    this.stats.lastUpdated = new Date();
    return this.stats;
  }
  
  async updateStats(updates: Partial<Stats>): Promise<Stats> {
    this.stats = { ...this.stats, ...updates, lastUpdated: new Date() };
    return this.stats;
  }
  
  // Analyze tweets to generate sentiment scores
  async analyzeTweets(): Promise<void> {
    // In a real implementation, this would use the Twitter API
    // and NLP services to fetch and analyze tweets
    
    // This is a placeholder for the demo
    console.log("Tweet analysis completed");
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Tweet methods
  async getTweets(limit = 50, coinTag?: string): Promise<Tweet[]> {
    let query = db.select().from(tweets);
    
    if (coinTag) {
      query = query.where(eq(tweets.coinSymbol, coinTag));
    }
    
    return await query.orderBy(desc(tweets.createdAt)).limit(limit);
  }

  async getTweet(id: number): Promise<Tweet | undefined> {
    const [tweet] = await db.select().from(tweets).where(eq(tweets.id, id));
    return tweet;
  }

  async getTweetByTwitterId(tweetId: string): Promise<Tweet | undefined> {
    const [tweet] = await db.select().from(tweets).where(eq(tweets.tweetId, tweetId));
    return tweet;
  }

  async createTweet(insertTweet: InsertTweet): Promise<Tweet> {
    const [tweet] = await db.insert(tweets).values(insertTweet).returning();
    return tweet;
  }

  // Coin methods
  async getCoins(): Promise<Coin[]> {
    return await db.select().from(coins);
  }

  async getCoin(id: number): Promise<Coin | undefined> {
    const [coin] = await db.select().from(coins).where(eq(coins.id, id));
    return coin;
  }

  async getCoinBySymbol(symbol: string): Promise<Coin | undefined> {
    const [coin] = await db.select().from(coins).where(
      eq(sql`UPPER(${coins.symbol})`, symbol.toUpperCase())
    );
    return coin;
  }

  async createCoin(insertCoin: InsertCoin): Promise<Coin> {
    const [coin] = await db.insert(coins).values(insertCoin).returning();
    
    // Update tracked coins count if the new coin is tracked
    if (coin.isTracked) {
      const trackedCoins = await this.getTrackedCoinsCount();
      await this.updateStats({ trackedCoins });
    }
    
    return coin;
  }

  async updateCoin(id: number, updates: Partial<Coin>): Promise<Coin> {
    const [updatedCoin] = await db
      .update(coins)
      .set(updates)
      .where(eq(coins.id, id))
      .returning();
    
    if (!updatedCoin) {
      throw new Error(`Coin with ID ${id} not found`);
    }
    
    // Update tracked coins count if tracking status changed
    if ('isTracked' in updates) {
      const trackedCoins = await this.getTrackedCoinsCount();
      await this.updateStats({ trackedCoins });
    }
    
    return updatedCoin;
  }

  // Helper method to count tracked coins
  private async getTrackedCoinsCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(coins)
      .where(eq(coins.isTracked, true));
    
    return result[0]?.count || 0;
  }

  // Trade methods
  async getTrades(limit = 50): Promise<Trade[]> {
    return await db
      .select()
      .from(trades)
      .orderBy(desc(trades.timestamp))
      .limit(limit);
  }

  async getTrade(id: number): Promise<Trade | undefined> {
    const [trade] = await db.select().from(trades).where(eq(trades.id, id));
    return trade;
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const [trade] = await db.insert(trades).values(insertTrade).returning();
    
    // Update active trades count
    const activeTrades = await this.getTradesCount();
    await this.updateStats({ activeTrades });
    
    return trade;
  }

  // Helper method to count trades
  private async getTradesCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(trades);
    
    return result[0]?.count || 0;
  }

  // Config methods
  async getConfig(): Promise<Config> {
    const [config] = await db.select().from(configs);
    
    if (!config) {
      // If no config exists, create a default one
      return this.createDefaultConfig();
    }
    
    return config;
  }
  
  private async createDefaultConfig(): Promise<Config> {
    const defaultConfig: InsertConfig = {
      buyThreshold: 0.65,
      sellThreshold: 0.40,
      autoTrading: true,
      notifications: true,
      riskLevel: "Medium"
    };
    
    const [config] = await db.insert(configs).values(defaultConfig).returning();
    return config;
  }

  async updateConfig(updates: Partial<Config>): Promise<Config> {
    // Get existing config or create default
    const existingConfig = await this.getConfig();
    
    // Update the config
    const [updatedConfig] = await db
      .update(configs)
      .set(updates)
      .where(eq(configs.id, existingConfig.id))
      .returning();
    
    return updatedConfig;
  }

  // Stats methods
  async getStats(): Promise<Stats> {
    const [statsData] = await db.select().from(stats);
    
    if (!statsData) {
      // If no stats exists, create default
      return this.createDefaultStats();
    }
    
    // Update lastUpdated timestamp
    const [updatedStats] = await db
      .update(stats)
      .set({ lastUpdated: new Date() })
      .where(eq(stats.id, statsData.id))
      .returning();
    
    return updatedStats;
  }
  
  private async createDefaultStats(): Promise<Stats> {
    const defaultStats: InsertStats = {
      overallSentiment: 0.5,
      overallSentimentLabel: "Neutral",
      activeTrades: 0,
      profitLoss: 0,
      profitLossPercentage: 0,
      trackedCoins: 0,
      lastUpdated: new Date()
    };
    
    const [statsData] = await db.insert(stats).values(defaultStats).returning();
    return statsData;
  }

  async updateStats(updates: Partial<Stats>): Promise<Stats> {
    // Get existing stats or create default
    const existingStats = await this.getStats();
    
    // Add lastUpdated to updates
    const updatesWithTimestamp = {
      ...updates,
      lastUpdated: new Date()
    };
    
    // Update the stats
    const [updatedStats] = await db
      .update(stats)
      .set(updatesWithTimestamp)
      .where(eq(stats.id, existingStats.id))
      .returning();
    
    return updatedStats;
  }

  // Analyze tweets
  async analyzeTweets(): Promise<void> {
    // This would analyze tweets and update sentiment scores
    // In a real implementation, this would use NLP services
    console.log("Tweet analysis completed");
    
    // Update overall sentiment based on recent tweets
    await this.updateOverallSentiment();
  }
  
  private async updateOverallSentiment(): Promise<void> {
    const recentTweets = await this.getTweets(100);
    
    if (recentTweets.length === 0) return;
    
    // Calculate average sentiment
    const totalSentiment = recentTweets.reduce(
      (acc, tweet) => acc + Number(tweet.sentimentScore), 0
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
export const storage = new DatabaseStorage();
