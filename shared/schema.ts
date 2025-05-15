import { pgTable, text, serial, integer, numeric, timestamp, json, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping from template for potential auth integration)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Tweets from Twitter API with sentiment analysis
export const tweets = pgTable("tweets", {
  id: serial("id").primaryKey(),
  tweetId: text("tweet_id").notNull().unique(),
  content: text("content").notNull(),
  authorName: text("author_name").notNull(),
  authorUsername: text("author_username").notNull(),
  authorProfileImage: text("author_profile_image"),
  createdAt: timestamp("created_at").notNull(),
  likes: integer("likes").default(0),
  retweets: integer("retweets").default(0),
  sentimentScore: numeric("sentiment_score").notNull(),
  sentimentLabel: text("sentiment_label").notNull(),
  coinTag: text("coin_tag").notNull(),
});

export const insertTweetSchema = createInsertSchema(tweets).omit({
  id: true,
});

// Tracked coins
export const coins = pgTable("coins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull().unique(),
  currentPrice: numeric("current_price"),
  priceChangePercentage: numeric("price_change_percentage"),
  image: text("image"),
  isTracked: boolean("is_tracked").default(true),
});

export const insertCoinSchema = createInsertSchema(coins).omit({
  id: true,
});

// Trading logs
export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // BUY or SELL
  coinSymbol: text("coin_symbol").notNull(),
  amount: numeric("amount").notNull(),
  price: numeric("price").notNull(),
  sentimentScore: numeric("sentiment_score").notNull(),
  threshold: numeric("threshold").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
});

// Configuration for trading settings
export const configs = pgTable("configs", {
  id: serial("id").primaryKey(),
  buyThreshold: numeric("buy_threshold").notNull().default("0.65"),
  sellThreshold: numeric("sell_threshold").notNull().default("0.40"),
  autoTrading: boolean("auto_trading").notNull().default(true),
  notifications: boolean("notifications").notNull().default(true),
  riskLevel: text("risk_level").notNull().default("Medium"),
});

export const insertConfigSchema = createInsertSchema(configs).omit({
  id: true,
});

// Stats for the dashboard
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  overallSentiment: numeric("overall_sentiment").notNull(),
  overallSentimentLabel: text("overall_sentiment_label").notNull(),
  activeTrades: integer("active_trades").notNull(),
  profitLoss: numeric("profit_loss").notNull(),
  profitLossPercentage: numeric("profit_loss_percentage").notNull(),
  trackedCoins: integer("tracked_coins").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertStatsSchema = createInsertSchema(stats).omit({
  id: true,
});

// Types for frontend and backend
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Tweet = typeof tweets.$inferSelect;
export type InsertTweet = z.infer<typeof insertTweetSchema>;

export type Coin = typeof coins.$inferSelect;
export type InsertCoin = z.infer<typeof insertCoinSchema>;

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;

export type Config = typeof configs.$inferSelect;
export type InsertConfig = z.infer<typeof insertConfigSchema>;

export type Stats = typeof stats.$inferSelect;
export type InsertStats = z.infer<typeof insertStatsSchema>;

// API Response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
